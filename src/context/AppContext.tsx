import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Shipment,
  TrackingEvent,
  Driver,
  Vehicle,
  Warehouse,
  Complaint,
  Coupon,
  PricingConfig,
  AuditLog,
  DeliveryProof,
  ShipmentStatus,
  Payment
} from '../types';
import {
  SEED_USERS,
  SEED_SHIPMENTS,
  SEED_TRACKING_EVENTS,
  SEED_DRIVERS,
  SEED_VEHICLES,
  SEED_WAREHOUSES,
  SEED_COMPLAINTS,
  SEED_COUPONS,
  SEED_AUDIT_LOGS,
  SEED_DELIVERY_PROOFS,
  SEED_PAYMENTS
} from '../data/mockDatabase';
import { DEFAULT_PRICING_CONFIG, calculateShippingPrice } from '../utils/pricingEngine';
import { api } from '../services/api';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  shipments: Shipment[];
  trackingEvents: TrackingEvent[];
  drivers: Driver[];
  vehicles: Vehicle[];
  warehouses: Warehouse[];
  complaints: Complaint[];
  coupons: Coupon[];
  pricingConfig: PricingConfig;
  auditLogs: AuditLog[];
  deliveryProofs: DeliveryProof[];
  payments: Payment[];
  
  // Actions
  createShipment: (shipmentData: Partial<Shipment>, couponCode?: string) => Promise<Shipment>;
  updateShipmentStatus: (
    shipmentId: string,
    newStatus: ShipmentStatus,
    locationName: string,
    notes?: string,
    proof?: Partial<DeliveryProof>
  ) => void;
  assignDriverToShipment: (shipmentId: string, driverId: string) => void;
  assignWarehouseBin: (shipmentId: string, warehouseId: string, bin: string) => void;
  cancelShipment: (shipmentId: string, reason?: string) => void;
  rateShipment: (shipmentId: string, rating: number, feedback?: string) => void;
  raiseComplaint: (shipmentId: string, category: Complaint['category'], message: string) => void;
  resolveComplaint: (complaintId: string, resolutionNote: string) => void;
  updatePricingConfig: (config: Partial<PricingConfig>) => void;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'usage_count'>) => void;
  toggleCouponStatus: (couponId: string) => void;
  updateDriverStatus: (driverId: string, status: Driver['status']) => void;
  updateDriverLocation: (driverId: string, lat: number, lng: number) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  getShipmentByTrackingNumber: (trackingNumber: string) => Shipment | undefined;
  getShipmentEvents: (shipmentId: string) => TrackingEvent[];
  getShipmentProof: (shipmentId: string) => DeliveryProof | undefined;
  activeTrackingId: string | null;
  setActiveTrackingId: (id: string | null) => void;
  refreshBackendData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'swiftship_app_data_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[1]); // Default to Priya (Customer)
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [shipments, setShipments] = useState<Shipment[]>(SEED_SHIPMENTS);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>(SEED_TRACKING_EVENTS);
  const [drivers, setDrivers] = useState<Driver[]>(SEED_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(SEED_VEHICLES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(SEED_WAREHOUSES);
  const [complaints, setComplaints] = useState<Complaint[]>(SEED_COMPLAINTS);
  const [coupons, setCoupons] = useState<Coupon[]>(SEED_COUPONS);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>(SEED_DELIVERY_PROOFS);
  const [payments, setPayments] = useState<Payment[]>(SEED_PAYMENTS);

  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  // Synchronize data from backend API
  const refreshBackendData = async () => {
    try {
      const [shipmentsRes, driversRes, warehousesRes, complaintsRes, couponsRes, pricingRes] = await Promise.allSettled([
        api.getShipments(),
        api.getDrivers(),
        api.getWarehouses(),
        api.getComplaints(),
        api.getCoupons(),
        api.getPricingConfig()
      ]);

      if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value?.data) {
        setShipments(shipmentsRes.value.data);
      }
      if (driversRes.status === 'fulfilled' && driversRes.value?.data) {
        setDrivers(driversRes.value.data);
      }
      if (warehousesRes.status === 'fulfilled' && warehousesRes.value?.data) {
        setWarehouses(warehousesRes.value.data);
      }
      if (complaintsRes.status === 'fulfilled' && complaintsRes.value?.data) {
        setComplaints(complaintsRes.value.data);
      }
      if (couponsRes.status === 'fulfilled' && couponsRes.value?.data) {
        setCoupons(couponsRes.value.data);
      }
      if (pricingRes.status === 'fulfilled' && pricingRes.value?.data) {
        setPricingConfig(pricingRes.value.data);
      }
    } catch (err) {
      console.warn('Backend sync failed, maintaining local cache:', err);
    }
  };

  // Load from localStorage on mount and sync with backend
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.shipments) setShipments(parsed.shipments);
        if (parsed.trackingEvents) setTrackingEvents(parsed.trackingEvents);
        if (parsed.complaints) setComplaints(parsed.complaints);
        if (parsed.coupons) setCoupons(parsed.coupons);
        if (parsed.pricingConfig) setPricingConfig(parsed.pricingConfig);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.deliveryProofs) setDeliveryProofs(parsed.deliveryProofs);
        if (parsed.drivers) setDrivers(parsed.drivers);
        if (parsed.vehicles) setVehicles(parsed.vehicles);
        if (parsed.payments) setPayments(parsed.payments);
      }
    } catch (e) {
      console.warn('Could not load saved state from localStorage', e);
    }

    refreshBackendData();
  }, []);

  // Save to localStorage when critical state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          shipments,
          trackingEvents,
          complaints,
          coupons,
          pricingConfig,
          auditLogs,
          deliveryProofs,
          drivers,
          vehicles,
          payments
        })
      );
    } catch (e) {
      console.warn('Could not persist state to localStorage', e);
    }
  }, [shipments, trackingEvents, complaints, coupons, pricingConfig, auditLogs, deliveryProofs, drivers, vehicles, payments]);

  // Synchronize currentUser whenever users array updates
  useEffect(() => {
    const updated = users.find(u => u.id === currentUser.id);
    if (updated) {
      setCurrentUser(updated);
    }
  }, [users]);

  // Real-time simulated driver GPS movement for active shipments
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prevDrivers =>
        prevDrivers.map(driver => {
          if (driver.status === 'ONLINE') {
            const deltaLat = (Math.random() - 0.5) * 0.0006;
            const deltaLng = (Math.random() - 0.5) * 0.0006;
            const newLat = Number((driver.current_lat + deltaLat).toFixed(6));
            const newLng = Number((driver.current_lng + deltaLng).toFixed(6));
            
            // Periodically ping backend
            if (Math.random() > 0.8) {
              api.updateDriverLocation(driver.id, newLat, newLng).catch(() => {});
            }

            return {
              ...driver,
              current_lat: newLat,
              current_lng: newLng
            };
          }
          return driver;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const createShipment = async (
    shipmentData: Partial<Shipment>,
    couponCode?: string
  ): Promise<Shipment> => {
    // Generate unique tracking number e.g. DLV + 8 digits
    const trackingNumber = `DLV${Math.floor(10000000 + Math.random() * 90000000)}`;
    const shipmentId = `shp_${Date.now()}`;
    const now = new Date().toISOString();

    // Check coupon
    let appliedCoupon: Coupon | undefined = undefined;
    if (couponCode) {
      appliedCoupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.is_active);
      if (appliedCoupon) {
        setCoupons(prev =>
          prev.map(c => (c.id === appliedCoupon!.id ? { ...c, usage_count: c.usage_count + 1 } : c))
        );
      }
    }

    const priceBreakdown = calculateShippingPrice({
      pickupCity: shipmentData.sender_address?.city || 'New Delhi',
      destinationCity: shipmentData.receiver_address?.city || 'Mumbai',
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

    const newShipment: Shipment = {
      id: shipmentId,
      tracking_number: trackingNumber,
      sender_id: currentUser.id,
      sender_name: shipmentData.sender_name || currentUser.name,
      sender_phone: shipmentData.sender_phone || currentUser.phone,
      sender_address: shipmentData.sender_address!,
      receiver_name: shipmentData.receiver_name!,
      receiver_phone: shipmentData.receiver_phone!,
      receiver_address: shipmentData.receiver_address!,
      warehouse_id: warehouses[0].id,
      warehouse_bin: 'INBOUND-BAY-1',
      status: 'ORDER_CREATED',
      delivery_type: shipmentData.delivery_type || 'STANDARD',
      package_type: shipmentData.package_type || 'Standard Parcel',
      weight_kg: shipmentData.weight_kg || 1,
      dimensions: shipmentData.dimensions || { length: 20, width: 15, height: 10 },
      price_breakdown: priceBreakdown,
      pickup_date: shipmentData.pickup_date || new Date().toISOString().split('T')[0],
      pickup_time_slot: shipmentData.pickup_time_slot || '10:00 AM - 01:00 PM',
      estimated_delivery_date: shipmentData.estimated_delivery_date || 
        new Date(Date.now() + (shipmentData.delivery_type === 'SAME_DAY' ? 0 : shipmentData.delivery_type === 'EXPRESS' ? 2 : 4) * 86400000).toISOString().split('T')[0],
      special_instructions: shipmentData.special_instructions,
      payment_id: paymentId,
      created_at: now,
      updated_at: now,
      current_lat: shipmentData.sender_address?.lat || 28.6139,
      current_lng: shipmentData.sender_address?.lng || 77.2090
    };

    const initialEvent: TrackingEvent = {
      id: `trk_${Date.now()}`,
      shipment_id: shipmentId,
      status: 'ORDER_CREATED',
      location: `${shipmentData.sender_address?.city || 'Delhi'} Booking Center`,
      description: 'Shipment created online and pickup manifest initiated.',
      timestamp: now,
      lat: shipmentData.sender_address?.lat,
      lng: shipmentData.sender_address?.lng
    };

    setPayments(prev => [newPayment, ...prev]);
    setShipments(prev => [newShipment, ...prev]);
    setTrackingEvents(prev => [initialEvent, ...prev]);

    // Add audit log
    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      admin_id: currentUser.id,
      admin_name: currentUser.name,
      action: 'SHIPMENT_CREATED',
      target_type: 'SHIPMENT',
      target_id: shipmentId,
      details: `New ${newShipment.delivery_type} shipment ${trackingNumber} booked (₹${priceBreakdown.total})`,
      timestamp: now
    };
    setAuditLogs(prev => [audit, ...prev]);

    // Asynchronously notify backend API
    api.createShipment({
      shipmentData: newShipment,
      couponCode,
      creatorUserId: currentUser.id,
      creatorUserName: currentUser.name
    }).catch(e => console.warn('Backend shipment registration queued:', e));

    return newShipment;
  };

  const updateShipmentStatus = (
    shipmentId: string,
    newStatus: ShipmentStatus,
    locationName: string,
    notes?: string,
    proof?: Partial<DeliveryProof>
  ) => {
    const now = new Date().toISOString();
    
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            status: newStatus,
            updated_at: now
          };
        }
        return s;
      })
    );

    const newEvent: TrackingEvent = {
      id: `trk_${Date.now()}`,
      shipment_id: shipmentId,
      status: newStatus,
      location: locationName,
      description: notes || `Shipment marked as ${newStatus.replace(/_/g, ' ')}.`,
      timestamp: now
    };

    setTrackingEvents(prev => [newEvent, ...prev]);

    if (newStatus === 'DELIVERED' && proof) {
      const newProof: DeliveryProof = {
        id: `prf_${Date.now()}`,
        shipment_id: shipmentId,
        signature_url: proof.signature_url,
        photo_url: proof.photo_url,
        recipient_name: proof.recipient_name || 'Authorized Recipient',
        recipient_relation: proof.recipient_relation || 'SELF',
        timestamp: now,
        notes: proof.notes,
        verified_by_driver_id: currentUser.id
      };
      setDeliveryProofs(prev => [newProof, ...prev]);
    }

    // Sync to backend API
    api.updateShipmentStatus(shipmentId, {
      status: newStatus,
      location: locationName,
      description: notes,
      proof,
      updatedByUserId: currentUser.id
    }).catch(e => console.warn('Backend status update queued:', e));
  };

  const assignDriverToShipment = (shipmentId: string, driverId: string) => {
    const now = new Date().toISOString();
    const driver = drivers.find(d => d.id === driverId);
    
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            driver_id: driverId,
            status: s.status === 'ORDER_CREATED' ? 'PICKUP_SCHEDULED' : s.status,
            updated_at: now
          };
        }
        return s;
      })
    );

    if (driver) {
      const newEvent: TrackingEvent = {
        id: `trk_${Date.now()}`,
        shipment_id: shipmentId,
        status: 'PICKUP_SCHEDULED',
        location: `${driver.current_city} Fleet Dispatch`,
        description: `Assigned to delivery partner ${driver.name}. Pickup in progress.`,
        timestamp: now,
        lat: driver.current_lat,
        lng: driver.current_lng
      };
      setTrackingEvents(prev => [newEvent, ...prev]);
    }

    api.assignDriver(shipmentId, driverId).catch(e => console.warn('Backend assign driver queued:', e));
  };

  const assignWarehouseBin = (shipmentId: string, warehouseId: string, bin: string) => {
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            warehouse_id: warehouseId,
            warehouse_bin: bin,
            status: s.status === 'PICKED_UP' ? 'IN_TRANSIT' : s.status,
            updated_at: new Date().toISOString()
          };
        }
        return s;
      })
    );

    api.assignWarehouse(shipmentId, warehouseId, bin).catch(e => console.warn('Backend assign warehouse queued:', e));
  };

  const cancelShipment = (shipmentId: string, reason?: string) => {
    const now = new Date().toISOString();
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          return { ...s, status: 'CANCELLED', updated_at: now };
        }
        return s;
      })
    );

    const event: TrackingEvent = {
      id: `trk_${Date.now()}`,
      shipment_id: shipmentId,
      status: 'CANCELLED',
      location: 'SwiftShip Customer Service',
      description: `Shipment cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      timestamp: now
    };
    setTrackingEvents(prev => [event, ...prev]);

    api.cancelShipment(shipmentId, reason).catch(e => console.warn('Backend cancel shipment queued:', e));
  };

  const rateShipment = (shipmentId: string, rating: number, feedback?: string) => {
    setShipments(prev =>
      prev.map(s => {
        if (s.id === shipmentId) {
          return { ...s, rating, feedback, updated_at: new Date().toISOString() };
        }
        return s;
      })
    );

    api.rateShipment(shipmentId, rating, feedback).catch(e => console.warn('Backend rate shipment queued:', e));
  };

  const raiseComplaint = (shipmentId: string, category: Complaint['category'], message: string) => {
    const shipment = shipments.find(s => s.id === shipmentId);
    const newComplaint: Complaint = {
      id: `cmp_${Date.now()}`,
      shipment_id: shipmentId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      tracking_number: shipment?.tracking_number || 'N/A',
      category,
      message,
      status: 'OPEN',
      created_at: new Date().toISOString()
    };
    setComplaints(prev => [newComplaint, ...prev]);

    api.createComplaint({
      shipment_id: shipmentId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      category,
      message
    }).catch(e => console.warn('Backend raise complaint queued:', e));
  };

  const resolveComplaint = (complaintId: string, resolutionNote: string) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaintId
          ? {
              ...c,
              status: 'RESOLVED',
              resolution_note: resolutionNote
            }
          : c
      )
    );

    api.resolveComplaint(complaintId, resolutionNote).catch(e => console.warn('Backend resolve complaint queued:', e));
  };

  const updatePricingConfig = (newConfig: Partial<PricingConfig>) => {
    setPricingConfig(prev => {
      const updated = { ...prev, ...newConfig };
      const audit: AuditLog = {
        id: `aud_${Date.now()}`,
        admin_id: currentUser.id,
        admin_name: currentUser.name,
        action: 'PRICING_UPDATED',
        target_type: 'PRICING',
        target_id: 'pricing_global',
        details: `Updated pricing parameters (Base: ₹${updated.base_charge}, PerKg: ₹${updated.per_kg_charge})`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(logs => [audit, ...logs]);
      return updated;
    });

    api.updatePricingConfig(newConfig).catch(e => console.warn('Backend update pricing config queued:', e));
  };

  const createCoupon = (couponData: Omit<Coupon, 'id' | 'usage_count'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup_${Date.now()}`,
      usage_count: 0
    };
    setCoupons(prev => [newCoupon, ...prev]);

    api.createCoupon(couponData).catch(e => console.warn('Backend create coupon queued:', e));
  };

  const toggleCouponStatus = (couponId: string) => {
    setCoupons(prev =>
      prev.map(c => (c.id === couponId ? { ...c, is_active: !c.is_active } : c))
    );

    api.toggleCoupon(couponId).catch(e => console.warn('Backend toggle coupon queued:', e));
  };

  const updateDriverStatus = (driverId: string, status: Driver['status']) => {
    setDrivers(prev =>
      prev.map(d => (d.id === driverId ? { ...d, status } : d))
    );

    api.updateDriverStatus(driverId, status).catch(e => console.warn('Backend update driver status queued:', e));
  };

  const updateDriverLocation = (driverId: string, lat: number, lng: number) => {
    setDrivers(prev =>
      prev.map(d => (d.id === driverId ? { ...d, current_lat: lat, current_lng: lng } : d))
    );

    api.updateDriverLocation(driverId, lat, lng).catch(e => console.warn('Backend update driver location queued:', e));
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh_${Date.now()}`
    };
    setVehicles(prev => [newVehicle, ...prev]);

    api.addVehicle(vehicleData).catch(e => console.warn('Backend add vehicle queued:', e));
  };

  const getShipmentByTrackingNumber = (trackingNumber: string): Shipment | undefined => {
    const cleaned = trackingNumber.trim().toUpperCase();
    return shipments.find(s => s.tracking_number.toUpperCase() === cleaned || s.id === cleaned);
  };

  const getShipmentEvents = (shipmentId: string): TrackingEvent[] => {
    return trackingEvents
      .filter(e => e.shipment_id === shipmentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getShipmentProof = (shipmentId: string): DeliveryProof | undefined => {
    return deliveryProofs.find(p => p.shipment_id === shipmentId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        shipments,
        trackingEvents,
        drivers,
        vehicles,
        warehouses,
        complaints,
        coupons,
        pricingConfig,
        auditLogs,
        deliveryProofs,
        payments,
        createShipment,
        updateShipmentStatus,
        assignDriverToShipment,
        assignWarehouseBin,
        cancelShipment,
        rateShipment,
        raiseComplaint,
        resolveComplaint,
        updatePricingConfig,
        createCoupon,
        toggleCouponStatus,
        updateDriverStatus,
        updateDriverLocation,
        addVehicle,
        getShipmentByTrackingNumber,
        getShipmentEvents,
        getShipmentProof,
        activeTrackingId,
        setActiveTrackingId,
        refreshBackendData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
