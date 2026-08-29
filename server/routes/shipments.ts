import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { Shipment, TrackingEvent, AuditLog, Payment, DeliveryProof } from '../../src/types';
import { calculateShippingPrice } from '../../src/utils/pricingEngine';
import { logActivity, mapStatusToDisplay } from '../utils/logActivity';

export const shipmentsRouter = Router();

// POST /api/shipments/test-sheet-logging - Manual diagnostic test trigger for Google Sheets
shipmentsRouter.post('/test-sheet-logging', async (req: Request, res: Response) => {
  try {
    const testPayload = {
      activityId: crypto.randomUUID(),
      customerId: req.body.customerId || 'usr_cust_rahul',
      customerName: req.body.customerName || 'Rahul Patil',
      email: req.body.email || 'rahul.patil@example.com',
      trackingId: req.body.trackingId || `SHP${Math.floor(10000 + Math.random() * 90000)}`,
      activity: req.body.activity || 'Shipment Created',
      previousStatus: req.body.previousStatus || '',
      newStatus: req.body.newStatus || 'Pending',
      location: req.body.location || 'Mumbai'
    };

    const sheetResult = await logActivity(testPayload);
    res.json({
      success: true,
      message: 'Google Sheets activity logging executed',
      payload: testPayload,
      sheetResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shipments - List all shipments with optional filters
shipmentsRouter.get('/', (req: Request, res: Response) => {
  try {
    let list = db.getShipments();
    const { sender_id, status, driver_id, search } = req.query;

    if (sender_id && typeof sender_id === 'string') {
      list = list.filter(s => s.sender_id === sender_id);
    }
    if (status && typeof status === 'string') {
      list = list.filter(s => s.status === status);
    }
    if (driver_id && typeof driver_id === 'string') {
      list = list.filter(s => s.driver_id === driver_id);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(s =>
        s.tracking_number.toLowerCase().includes(q) ||
        s.sender_name.toLowerCase().includes(q) ||
        s.receiver_name.toLowerCase().includes(q) ||
        s.sender_address.city.toLowerCase().includes(q) ||
        s.receiver_address.city.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch shipments' });
  }
});

// GET /api/shipments/:idOrTracking - Get single shipment with events and proof
shipmentsRouter.get('/:idOrTracking', (req: Request, res: Response) => {
  try {
    const { idOrTracking } = req.params;
    const shipment = db.getShipmentByTrackingNumber(idOrTracking) || db.getShipmentById(idOrTracking);

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const events = db.getTrackingEvents(shipment.id);
    const proof = db.getDeliveryProofByShipmentId(shipment.id);
    const payment = db.getPaymentByShipmentId(shipment.id);
    const driver = shipment.driver_id ? db.getDriverById(shipment.driver_id) : undefined;

    res.json({
      success: true,
      data: {
        ...shipment,
        events,
        proof,
        payment,
        driver
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch shipment' });
  }
});

// POST /api/shipments - Create a new shipment
shipmentsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { shipmentData, couponCode, creatorUserId, creatorUserName } = req.body;

    if (!shipmentData || !shipmentData.sender_address || !shipmentData.receiver_address) {
      return res.status(400).json({
        success: false,
        error: 'Incomplete shipment payload. Sender and receiver addresses are required.'
      });
    }

    const now = new Date().toISOString();
    const trackingNumber = `DLV${Math.floor(10000000 + Math.random() * 90000000)}`;
    const shipmentId = `shp_${Date.now()}`;

    // Validate and apply coupon if supplied
    let appliedCoupon = undefined;
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && coupon.is_active) {
        appliedCoupon = coupon;
        db.updateCoupon(coupon.id, { usage_count: coupon.usage_count + 1 });
      }
    }

    const pricingConfig = db.getPricingConfig();
    const priceBreakdown = calculateShippingPrice({
      pickupCity: shipmentData.sender_address.city || 'New Delhi',
      destinationCity: shipmentData.receiver_address.city || 'Mumbai',
      weightKg: shipmentData.weight_kg || 1,
      dimensions: shipmentData.dimensions || { length: 20, width: 15, height: 10 },
      deliveryType: shipmentData.delivery_type || 'STANDARD',
      coupon: appliedCoupon,
      config: pricingConfig
    });

    const paymentId = `pay_${Date.now()}`;
    const newPayment: Payment = {
      id: paymentId,
      shipment_id: shipmentId,
      amount: priceBreakdown.total,
      currency: 'INR',
      payment_status: 'SUCCESS',
      transaction_id: `pay_rzp_live_${Math.random().toString(36).substring(2, 10)}`,
      payment_method: 'UPI',
      created_at: now
    };
    db.addPayment(newPayment);

    const warehouses = db.getWarehouses();
    const primaryWarehouse = warehouses[0] || { id: 'wh_del_1' };

    const newShipment: Shipment = {
      id: shipmentId,
      tracking_number: trackingNumber,
      sender_id: creatorUserId || shipmentData.sender_id || 'usr_cust_1',
      sender_name: shipmentData.sender_name || 'Valued Customer',
      sender_phone: shipmentData.sender_phone || '+91 9876543210',
      sender_address: shipmentData.sender_address,
      receiver_name: shipmentData.receiver_name,
      receiver_phone: shipmentData.receiver_phone,
      receiver_address: shipmentData.receiver_address,
      warehouse_id: primaryWarehouse.id,
      warehouse_bin: 'INBOUND-BAY-1',
      status: 'ORDER_CREATED',
      delivery_type: shipmentData.delivery_type || 'STANDARD',
      package_type: shipmentData.package_type || 'Standard Parcel',
      weight_kg: shipmentData.weight_kg || 1,
      dimensions: shipmentData.dimensions || { length: 20, width: 15, height: 10 },
      price_breakdown: priceBreakdown,
      pickup_date: shipmentData.pickup_date || now.split('T')[0],
      pickup_time_slot: shipmentData.pickup_time_slot || '10:00 AM - 01:00 PM',
      estimated_delivery_date: shipmentData.estimated_delivery_date ||
        new Date(Date.now() + (shipmentData.delivery_type === 'SAME_DAY' ? 0 : shipmentData.delivery_type === 'EXPRESS' ? 2 : 4) * 86400000).toISOString().split('T')[0],
      special_instructions: shipmentData.special_instructions,
      payment_id: paymentId,
      created_at: now,
      updated_at: now,
      current_lat: shipmentData.sender_address.lat || 28.6139,
      current_lng: shipmentData.sender_address.lng || 77.2090
    };

    db.addShipment(newShipment);

    // Add initial tracking event
    const initialEvent: TrackingEvent = {
      id: `trk_${Date.now()}`,
      shipment_id: shipmentId,
      status: 'ORDER_CREATED',
      location: `${shipmentData.sender_address.city || 'Delhi'} Booking Hub`,
      description: 'Shipment registered online and pickup manifest generated.',
      timestamp: now,
      lat: shipmentData.sender_address.lat,
      lng: shipmentData.sender_address.lng
    };
    db.addTrackingEvent(initialEvent);

    // Audit Log
    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      admin_id: creatorUserId || 'usr_cust_1',
      admin_name: creatorUserName || 'Customer',
      action: 'SHIPMENT_CREATED',
      target_type: 'SHIPMENT',
      target_id: shipmentId,
      details: `New ${newShipment.delivery_type} consignment ${trackingNumber} booked (₹${priceBreakdown.total})`,
      timestamp: now
    };
    db.addAuditLog(audit);

    // 1. Google Sheets Activity Logging: Shipment Created (Pending)
    const customerUser = db.getUserById(newShipment.sender_id);
    void logActivity({
      activityId: crypto.randomUUID(),
      customerId: newShipment.sender_id,
      customerName: newShipment.sender_name,
      email: customerUser?.email || (newShipment as any).sender_email || 'rahul.patil@example.com',
      trackingId: newShipment.tracking_number,
      activity: 'Shipment Created',
      previousStatus: '',
      newStatus: 'Pending',
      location: newShipment.sender_address.city || 'Mumbai'
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: newShipment
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create shipment' });
  }
});

// PATCH /api/shipments/:id/status - Update shipment status and register milestone
shipmentsRouter.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, location, description, proof, updatedByUserId } = req.body;

    const shipment = db.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const prevStatus = shipment.status;
    const now = new Date().toISOString();
    const updated = db.updateShipment(id, { status });

    const newEvent: TrackingEvent = {
      id: `trk_${Date.now()}`,
      shipment_id: id,
      status: status,
      location: location || `${shipment.receiver_address.city} Operations Hub`,
      description: description || `Status updated to ${status.replace(/_/g, ' ')}.`,
      timestamp: now
    };
    db.addTrackingEvent(newEvent);

    if (status === 'DELIVERED' && proof) {
      const newProof: DeliveryProof = {
        id: `prf_${Date.now()}`,
        shipment_id: id,
        signature_url: proof.signature_url,
        photo_url: proof.photo_url,
        recipient_name: proof.recipient_name || 'Recipient',
        recipient_relation: proof.recipient_relation || 'SELF',
        timestamp: now,
        notes: proof.notes,
        verified_by_driver_id: updatedByUserId || shipment.driver_id || 'usr_driver_1'
      };
      db.addDeliveryProof(newProof);
    }

    // 2. Google Sheets Activity Logging: Pipeline Status Milestone
    const customerUser = db.getUserById(shipment.sender_id);
    let activityLabel = description || `Status Updated: ${status.replace(/_/g, ' ')}`;
    if (status === 'PICKED_UP') {
      activityLabel = 'Package Picked Up';
    } else if (status === 'IN_TRANSIT') {
      activityLabel = 'In Transit';
    } else if (status === 'OUT_FOR_DELIVERY') {
      activityLabel = 'Out for Delivery';
    } else if (status === 'DELIVERED') {
      activityLabel = 'Package Delivered';
    } else if (status === 'PICKUP_SCHEDULED') {
      activityLabel = 'Pickup Scheduled';
    } else if (status === 'CANCELLED') {
      activityLabel = 'Delivery Failed / Cancelled';
    }

    void logActivity({
      activityId: crypto.randomUUID(),
      customerId: shipment.sender_id,
      customerName: shipment.sender_name,
      email: customerUser?.email || (shipment as any).sender_email || 'rahul.patil@example.com',
      trackingId: shipment.tracking_number,
      activity: activityLabel,
      previousStatus: mapStatusToDisplay(prevStatus),
      newStatus: mapStatusToDisplay(status),
      location: location || shipment.receiver_address.city || 'Regional Hub'
    });

    res.json({
      success: true,
      message: `Shipment status updated to ${status}`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update status' });
  }
});

// PATCH /api/shipments/:id/assign-driver - Assign driver to consignment
shipmentsRouter.patch('/:id/assign-driver', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const shipment = db.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const driver = db.getDriverById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    const prevStatus = shipment.status;
    const now = new Date().toISOString();
    const nextStatus = shipment.status === 'ORDER_CREATED' ? 'PICKUP_SCHEDULED' : shipment.status;

    const updated = db.updateShipment(id, {
      driver_id: driverId,
      status: nextStatus
    });

    const event: TrackingEvent = {
      id: `trk_${Date.now()}`,
      shipment_id: id,
      status: nextStatus,
      location: `${driver.current_city} Dispatch`,
      description: `Assigned to delivery partner ${driver.name}. Pickup and linehaul coordination in progress.`,
      timestamp: now,
      lat: driver.current_lat,
      lng: driver.current_lng
    };
    db.addTrackingEvent(event);

    // 3. Google Sheets Activity Logging: Driver Assigned / Pickup Scheduled
    const customerUser = db.getUserById(shipment.sender_id);
    void logActivity({
      activityId: crypto.randomUUID(),
      customerId: shipment.sender_id,
      customerName: shipment.sender_name,
      email: customerUser?.email || (shipment as any).sender_email || 'rahul.patil@example.com',
      trackingId: shipment.tracking_number,
      activity: `Driver Assigned: ${driver.name}`,
      previousStatus: mapStatusToDisplay(prevStatus),
      newStatus: mapStatusToDisplay(nextStatus),
      location: `${driver.current_city} Dispatch Hub`
    });

    res.json({
      success: true,
      message: `Driver ${driver.name} assigned to shipment ${shipment.tracking_number}`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to assign driver' });
  }
});

// PATCH /api/shipments/:id/assign-warehouse - Assign warehouse bin location
shipmentsRouter.patch('/:id/assign-warehouse', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { warehouseId, bin } = req.body;

    const shipment = db.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const prevStatus = shipment.status;
    const nextStatus = shipment.status === 'PICKED_UP' ? 'IN_TRANSIT' : shipment.status;
    const updated = db.updateShipment(id, {
      warehouse_id: warehouseId,
      warehouse_bin: bin,
      status: nextStatus
    });

    const warehouse = db.getWarehouseById(warehouseId);

    // 4. Google Sheets Activity Logging: Arrived at Warehouse
    const customerUser = db.getUserById(shipment.sender_id);
    void logActivity({
      activityId: crypto.randomUUID(),
      customerId: shipment.sender_id,
      customerName: shipment.sender_name,
      email: customerUser?.email || (shipment as any).sender_email || 'rahul.patil@example.com',
      trackingId: shipment.tracking_number,
      activity: `Arrived at Warehouse (${warehouse?.name || bin || 'Sorting Facility'})`,
      previousStatus: mapStatusToDisplay(prevStatus),
      newStatus: mapStatusToDisplay(nextStatus),
      location: warehouse?.city || `${warehouse?.name || 'Warehouse'} Hub`
    });

    res.json({
      success: true,
      message: 'Warehouse bin assigned successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to assign warehouse bin' });
  }
});

// POST /api/shipments/:id/rate - Submit delivery feedback
shipmentsRouter.post('/:id/rate', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const shipment = db.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const updated = db.updateShipment(id, {
      rating: Number(rating),
      feedback: feedback || ''
    });

    res.json({
      success: true,
      message: 'Rating and feedback recorded successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to record rating' });
  }
});

// POST /api/shipments/:id/cancel - Cancel a consignment
shipmentsRouter.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const shipment = db.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const prevStatus = shipment.status;
    const now = new Date().toISOString();
    const updated = db.updateShipment(id, { status: 'CANCELLED' });

    const event: TrackingEvent = {
      id: `trk_${Date.now()}`,
      shipment_id: id,
      status: 'CANCELLED',
      location: 'SwiftShip Customer Service',
      description: `Shipment cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      timestamp: now
    };
    db.addTrackingEvent(event);

    // 5. Google Sheets Activity Logging: Shipment Cancelled / Delivery Failed
    const customerUser = db.getUserById(shipment.sender_id);
    void logActivity({
      activityId: crypto.randomUUID(),
      customerId: shipment.sender_id,
      customerName: shipment.sender_name,
      email: customerUser?.email || (shipment as any).sender_email || 'rahul.patil@example.com',
      trackingId: shipment.tracking_number,
      activity: reason ? `Delivery Cancelled: ${reason}` : 'Delivery Cancelled',
      previousStatus: mapStatusToDisplay(prevStatus),
      newStatus: 'Cancelled',
      location: shipment.receiver_address.city || 'Operations Hub'
    });

    res.json({
      success: true,
      message: 'Shipment cancelled',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to cancel shipment' });
  }
});
