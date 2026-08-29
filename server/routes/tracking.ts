import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { TrackingEvent } from '../../src/types';
import { logActivity, mapStatusToDisplay } from '../utils/logActivity';

export const trackingRouter = Router();

// GET /api/tracking/:trackingNumber - Fetch full tracking details & telemetry
trackingRouter.get('/:trackingNumber', (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = db.getShipmentByTrackingNumber(trackingNumber);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: `No shipment found for tracking number: ${trackingNumber}`
      });
    }

    const events = db.getTrackingEvents(shipment.id);
    const proof = db.getDeliveryProofByShipmentId(shipment.id);
    const driver = shipment.driver_id ? db.getDriverById(shipment.driver_id) : undefined;
    const warehouse = shipment.warehouse_id ? db.getWarehouseById(shipment.warehouse_id) : undefined;

    res.json({
      success: true,
      data: {
        shipment,
        events,
        proof,
        driver,
        warehouse,
        current_coordinates: {
          lat: shipment.current_lat || driver?.current_lat || shipment.sender_address.lat,
          lng: shipment.current_lng || driver?.current_lng || shipment.sender_address.lng
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Tracking search failed' });
  }
});

// POST /api/tracking/:shipmentId/events - Add tracking milestone event
trackingRouter.post('/:shipmentId/events', (req: Request, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const { status, location, description, lat, lng } = req.body;

    const shipment = db.getShipmentById(shipmentId);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const newEvent: TrackingEvent = {
      id: `trk_${Date.now()}`,
      shipment_id: shipmentId,
      status: status || shipment.status,
      location: location || 'Transit Node',
      description: description || 'Milestone event logged.',
      timestamp: new Date().toISOString(),
      lat,
      lng
    };

    db.addTrackingEvent(newEvent);
    if (lat && lng) {
      db.updateShipment(shipmentId, { current_lat: lat, current_lng: lng });
    }

    const customerUser = db.getUserById(shipment.sender_id);
    void logActivity({
      activityId: crypto.randomUUID(),
      customerId: shipment.sender_id,
      customerName: shipment.sender_name,
      email: customerUser?.email || (shipment as any).sender_email || 'rahul.patil@example.com',
      trackingId: shipment.tracking_number,
      activity: description || `Checkpoint: ${newEvent.location}`,
      previousStatus: mapStatusToDisplay(shipment.status),
      newStatus: mapStatusToDisplay(status || shipment.status),
      location: location || 'Transit Hub'
    });

    res.status(201).json({
      success: true,
      data: newEvent
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to add tracking event' });
  }
});
