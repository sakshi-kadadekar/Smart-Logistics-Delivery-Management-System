export type UserRole = 'customer' | 'driver' | 'warehouse' | 'admin';

export type DeliveryPartner =
  | 'delhivery'
  | 'xpressbees'
  | 'shadowfax'
  | 'dhl'
  | 'blue dart'
  | 'ekart'
  | 'fedex'
  | 'ecom express'
  | 'amazon logistics';

export type DatasetPackageType =
  | 'fragile items'
  | 'pharmacy'
  | 'documents'
  | 'automobile parts'
  | 'electronics'
  | 'clothing'
  | 'furniture'
  | 'cosmetics'
  | 'groceries';

export type DatasetVehicleType =
  | 'ev bike'
  | 'van'
  | 'scooter'
  | 'bike'
  | 'truck'
  | 'ev van';

export type DatasetDeliveryMode =
  | 'two day'
  | 'same day'
  | 'express'
  | 'standard';

export type Region = 'west' | 'central' | 'south' | 'north' | 'east';

export type WeatherCondition =
  | 'foggy'
  | 'stormy'
  | 'rainy'
  | 'cold'
  | 'hot'
  | 'clear';

export type DatasetDeliveryStatus = 'delivered' | 'delayed' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export type ShipmentStatus =
  | 'ORDER_CREATED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export type DeliveryType = 'STANDARD' | 'EXPRESS' | 'SAME_DAY' | 'TWO_DAY';

export interface PackageDimensions {
  length: number; // cm
  width: number;  // cm
  height: number; // cm
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  timestamp: string;
  lat?: number;
  lng?: number;
}

export interface PriceBreakdown {
  base_charge: number;
  weight_charge: number;
  distance_charge: number;
  delivery_type_charge: number;
  discount_amount: number;
  subtotal: number;
  gst: number;
  total: number;
  distance_km: number;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  sender_id: string;
  receiver_id?: string;
  sender_name: string;
  sender_phone: string;
  sender_address: Address;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: Address;
  driver_id?: string;
  warehouse_id?: string;
  warehouse_bin?: string;
  status: ShipmentStatus;
  delivery_type: DeliveryType;
  package_type: string;
  weight_kg: number;
  dimensions: PackageDimensions;
  price_breakdown: PriceBreakdown;
  pickup_date: string;
  pickup_time_slot: string;
  estimated_delivery_date: string;
  special_instructions?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  current_lat?: number;
  current_lng?: number;
  rating?: number;
  feedback?: string;
  // Multi-Partner Logistics Dataset (India) fields
  delivery_partner?: DeliveryPartner;
  delivery_mode?: DatasetDeliveryMode | string;
  vehicle_type?: DatasetVehicleType | string;
  region?: Region;
  weather_condition?: WeatherCondition;
  delayed?: boolean | 'yes' | 'no';
  delivery_time_hours?: number;
  expected_time_hours?: number;
  delivery_status?: DatasetDeliveryStatus;
  delivery_rating?: number;
  delivery_cost?: number;
  distance_km?: number;
  package_weight_kg?: number;
}

export interface Driver {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  vehicle_id?: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  rating: number;
  total_deliveries: number;
  current_lat: number;
  current_lng: number;
  current_city: string;
  shift_earnings: number;
}

export interface Vehicle {
  id: string;
  driver_id?: string;
  vehicle_number: string;
  vehicle_type: 'BIKE' | 'VAN' | 'TRUCK' | 'ELECTRIC_SCOOTER';
  capacity_kg: number;
  model: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE';
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH_ON_DELIVERY';

export interface Payment {
  id: string;
  shipment_id: string;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  transaction_id: string;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface DeliveryProof {
  id: string;
  shipment_id: string;
  signature_url?: string;
  photo_url?: string;
  recipient_name: string;
  recipient_relation: 'SELF' | 'FAMILY' | 'SECURITY' | 'NEIGHBOR';
  timestamp: string;
  notes?: string;
  verified_by_driver_id: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  capacity_units: number;
  current_stored_units: number;
  lat: number;
  lng: number;
  manager_name: string;
}

export interface Complaint {
  id: string;
  shipment_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  tracking_number: string;
  category: 'DELAY' | 'DAMAGED' | 'WRONG_ADDRESS' | 'RUDE_BEHAVIOR' | 'OTHER';
  message: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolution_note?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FLAT';
  value: number; // e.g. 15 for 15% or 100 for ₹100
  min_order_amount: number;
  max_discount?: number;
  expiry_date: string;
  usage_count: number;
  is_active: boolean;
}

export interface PricingConfig {
  base_charge: number;           // ₹
  per_kg_charge: number;         // ₹/kg
  per_km_charge: number;         // ₹/km
  express_multiplier: number;    // e.g. 1.4x
  same_day_multiplier: number;   // e.g. 2.0x
  gst_rate: number;              // 0.18 (18%)
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: 'SHIPMENT' | 'USER' | 'PRICING' | 'COUPON' | 'DRIVER' | 'WAREHOUSE';
  target_id: string;
  details: string;
  timestamp: string;
}

export interface DelayAnalysisResult {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  delay_probability_percent: number;
  estimated_delay_window_hours: number;
  contributing_factors: string[];
  suggested_action: string;
  confidence_score: number;
}
