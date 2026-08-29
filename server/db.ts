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
  Payment
} from '../src/types';
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
  SEED_PAYMENTS,
  DATASET_LOGISTICS_INSIGHTS
} from '../src/data/mockDatabase';
import { DEFAULT_PRICING_CONFIG } from '../src/utils/pricingEngine';

/**
 * In-Memory Database Store for SwiftShip Backend
 * Thread-safe with deep cloning for state isolation and instant query performance.
 */
class Database {
  private users: User[] = JSON.parse(JSON.stringify(SEED_USERS));
  private shipments: Shipment[] = JSON.parse(JSON.stringify(SEED_SHIPMENTS));
  private trackingEvents: TrackingEvent[] = JSON.parse(JSON.stringify(SEED_TRACKING_EVENTS));
  private drivers: Driver[] = JSON.parse(JSON.stringify(SEED_DRIVERS));
  private vehicles: Vehicle[] = JSON.parse(JSON.stringify(SEED_VEHICLES));
  private warehouses: Warehouse[] = JSON.parse(JSON.stringify(SEED_WAREHOUSES));
  private complaints: Complaint[] = JSON.parse(JSON.stringify(SEED_COMPLAINTS));
  private coupons: Coupon[] = JSON.parse(JSON.stringify(SEED_COUPONS));
  private pricingConfig: PricingConfig = JSON.parse(JSON.stringify(DEFAULT_PRICING_CONFIG));
  private auditLogs: AuditLog[] = JSON.parse(JSON.stringify(SEED_AUDIT_LOGS));
  private deliveryProofs: DeliveryProof[] = JSON.parse(JSON.stringify(SEED_DELIVERY_PROOFS));
  private payments: Payment[] = JSON.parse(JSON.stringify(SEED_PAYMENTS));

  // Reset database to initial seed state
  public resetToSeed(): void {
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.shipments = JSON.parse(JSON.stringify(SEED_SHIPMENTS));
    this.trackingEvents = JSON.parse(JSON.stringify(SEED_TRACKING_EVENTS));
    this.drivers = JSON.parse(JSON.stringify(SEED_DRIVERS));
    this.vehicles = JSON.parse(JSON.stringify(SEED_VEHICLES));
    this.warehouses = JSON.parse(JSON.stringify(SEED_WAREHOUSES));
    this.complaints = JSON.parse(JSON.stringify(SEED_COMPLAINTS));
    this.coupons = JSON.parse(JSON.stringify(SEED_COUPONS));
    this.pricingConfig = JSON.parse(JSON.stringify(DEFAULT_PRICING_CONFIG));
    this.auditLogs = JSON.parse(JSON.stringify(SEED_AUDIT_LOGS));
    this.deliveryProofs = JSON.parse(JSON.stringify(SEED_DELIVERY_PROOFS));
    this.payments = JSON.parse(JSON.stringify(SEED_PAYMENTS));
  }

  // Users
  public getUsers(): User[] { return [...this.users]; }
  public getUserById(id: string): User | undefined { return this.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase()); }
  public getUserByEmail(email: string): User | undefined { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }

  // Shipments
  public getShipments(): Shipment[] { return [...this.shipments]; }
  public getShipmentById(id: string): Shipment | undefined { return this.shipments.find(s => s.id === id || s.tracking_number.toUpperCase() === id.trim().toUpperCase()); }
  public getShipmentByTrackingNumber(trackingNum: string): Shipment | undefined {
    const cleaned = trackingNum.trim().toUpperCase();
    return this.shipments.find(s => s.tracking_number.toUpperCase() === cleaned || s.id === cleaned);
  }
  public addShipment(shipment: Shipment): Shipment {
    this.shipments.unshift(shipment);
    return shipment;
  }
  public updateShipment(id: string, updates: Partial<Shipment>): Shipment | undefined {
    const idx = this.shipments.findIndex(s => s.id === id || s.tracking_number.toUpperCase() === id.trim().toUpperCase());
    if (idx === -1) return undefined;
    this.shipments[idx] = {
      ...this.shipments[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return this.shipments[idx];
  }

  // Tracking Events
  public getTrackingEvents(shipmentId?: string): TrackingEvent[] {
    if (shipmentId) {
      return this.trackingEvents
        .filter(e => e.shipment_id === shipmentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [...this.trackingEvents];
  }
  public addTrackingEvent(event: TrackingEvent): TrackingEvent {
    this.trackingEvents.unshift(event);
    return event;
  }

  // Drivers
  public getDrivers(): Driver[] { return [...this.drivers]; }
  public getDriverById(id: string): Driver | undefined { return this.drivers.find(d => d.id === id || d.user_id === id); }
  public updateDriver(id: string, updates: Partial<Driver>): Driver | undefined {
    const idx = this.drivers.findIndex(d => d.id === id || d.user_id === id);
    if (idx === -1) return undefined;
    this.drivers[idx] = { ...this.drivers[idx], ...updates };
    return this.drivers[idx];
  }

  // Vehicles
  public getVehicles(): Vehicle[] { return [...this.vehicles]; }
  public addVehicle(vehicle: Vehicle): Vehicle {
    this.vehicles.unshift(vehicle);
    return vehicle;
  }

  // Warehouses
  public getWarehouses(): Warehouse[] { return [...this.warehouses]; }
  public getWarehouseById(id: string): Warehouse | undefined { return this.warehouses.find(w => w.id === id || w.code === id); }
  public updateWarehouse(id: string, updates: Partial<Warehouse>): Warehouse | undefined {
    const idx = this.warehouses.findIndex(w => w.id === id);
    if (idx === -1) return undefined;
    this.warehouses[idx] = { ...this.warehouses[idx], ...updates };
    return this.warehouses[idx];
  }

  // Complaints
  public getComplaints(): Complaint[] { return [...this.complaints]; }
  public addComplaint(complaint: Complaint): Complaint {
    this.complaints.unshift(complaint);
    return complaint;
  }
  public updateComplaint(id: string, updates: Partial<Complaint>): Complaint | undefined {
    const idx = this.complaints.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.complaints[idx] = { ...this.complaints[idx], ...updates };
    return this.complaints[idx];
  }

  // Coupons
  public getCoupons(): Coupon[] { return [...this.coupons]; }
  public getCouponByCode(code: string): Coupon | undefined {
    return this.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  }
  public addCoupon(coupon: Coupon): Coupon {
    this.coupons.unshift(coupon);
    return coupon;
  }
  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | undefined {
    const idx = this.coupons.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.coupons[idx] = { ...this.coupons[idx], ...updates };
    return this.coupons[idx];
  }

  // Pricing Config
  public getPricingConfig(): PricingConfig { return { ...this.pricingConfig }; }
  public updatePricingConfig(config: Partial<PricingConfig>): PricingConfig {
    this.pricingConfig = { ...this.pricingConfig, ...config };
    return { ...this.pricingConfig };
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] { return [...this.auditLogs]; }
  public addAuditLog(log: AuditLog): AuditLog {
    this.auditLogs.unshift(log);
    return log;
  }

  // Delivery Proofs
  public getDeliveryProofs(): DeliveryProof[] { return [...this.deliveryProofs]; }
  public getDeliveryProofByShipmentId(shipmentId: string): DeliveryProof | undefined {
    return this.deliveryProofs.find(p => p.shipment_id === shipmentId);
  }
  public addDeliveryProof(proof: DeliveryProof): DeliveryProof {
    this.deliveryProofs.unshift(proof);
    return proof;
  }

  // Payments
  public getPayments(): Payment[] { return [...this.payments]; }
  public getPaymentByShipmentId(shipmentId: string): Payment | undefined {
    return this.payments.find(p => p.shipment_id === shipmentId);
  }
  public addPayment(payment: Payment): Payment {
    this.payments.unshift(payment);
    return payment;
  }

  // Multi-Partner Delivery Logistics Dataset Insights
  public getDatasetInsights() {
    return DATASET_LOGISTICS_INSIGHTS;
  }
}

export const db = new Database();
