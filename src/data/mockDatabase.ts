import {
  User,
  Address,
  Shipment,
  TrackingEvent,
  Driver,
  Vehicle,
  Payment,
  DeliveryProof,
  Warehouse,
  Complaint,
  Coupon,
  PricingConfig,
  AuditLog,
  DeliveryPartner,
  DatasetPackageType,
  DatasetVehicleType,
  DatasetDeliveryMode,
  Region,
  WeatherCondition,
  DatasetDeliveryStatus
} from '../types';
import { DEFAULT_PRICING_CONFIG } from '../utils/pricingEngine';

export const SEED_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Aarav Sharma',
    email: 'admin@swiftship.in',
    phone: '+91 98765 43210',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-10T09:00:00Z'
  },
  {
    id: 'usr_cust_1',
    name: 'Priya Patel',
    email: 'customer@swiftship.in',
    phone: '+91 91234 56780',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-02-14T11:30:00Z'
  },
  {
    id: 'usr_driver_1',
    name: 'Vikram Singh',
    email: 'driver@swiftship.in',
    phone: '+91 99887 76655',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr_wh_1',
    name: 'Rajesh Nair',
    email: 'warehouse@swiftship.in',
    phone: '+91 94455 66778',
    role: 'warehouse',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-20T14:15:00Z'
  },
  {
    id: 'usr_driver_2',
    name: 'Amit Verma',
    email: 'amit.driver@swiftship.in',
    phone: '+91 98111 22334',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-02-10T10:00:00Z'
  }
];

export const SEED_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh_del_1',
    name: 'Delhi Northern Mega Hub',
    code: 'DEL-HUB-01',
    address: 'Plot 42, Okhla Industrial Area Phase III',
    city: 'New Delhi',
    state: 'Delhi',
    capacity_units: 35000,
    current_stored_units: 24850,
    lat: 28.5355,
    lng: 77.2638,
    manager_name: 'Rajesh Nair'
  },
  {
    id: 'wh_mum_1',
    name: 'Mumbai Western Express Hub',
    code: 'BOM-HUB-02',
    address: 'Sector 19, Vashi Logistics Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    capacity_units: 40000,
    current_stored_units: 31200,
    lat: 19.0760,
    lng: 72.8777,
    manager_name: 'Kavita Deshmukh'
  },
  {
    id: 'wh_blr_1',
    name: 'Bengaluru Tech Corridor Hub',
    code: 'BLR-HUB-03',
    address: 'Electronics City Phase II, Hosur Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    capacity_units: 28000,
    current_stored_units: 19400,
    lat: 12.8452,
    lng: 77.6602,
    manager_name: 'Suresh Kumar'
  },
  {
    id: 'wh_ccu_1',
    name: 'Kolkata Eastern Gateway Hub',
    code: 'CCU-HUB-04',
    address: 'Kona Expressway, Dankuni Freight Yard',
    city: 'Kolkata',
    state: 'West Bengal',
    capacity_units: 25000,
    current_stored_units: 17300,
    lat: 22.6845,
    lng: 88.2910,
    manager_name: 'Anirban Mukherjee'
  },
  {
    id: 'wh_bho_1',
    name: 'Central India Logistics Central Hub',
    code: 'BHO-HUB-05',
    address: 'Mandideep Industrial Area Phase 1',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    capacity_units: 22000,
    current_stored_units: 14800,
    lat: 23.0645,
    lng: 77.5218,
    manager_name: 'Manish Chouhan'
  }
];

export const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'veh_1',
    driver_id: 'drv_1',
    vehicle_number: 'DL 01 AB 4920',
    vehicle_type: 'VAN',
    capacity_kg: 850,
    model: 'Tata Ace Gold EV (ev van)',
    status: 'ACTIVE'
  },
  {
    id: 'veh_2',
    driver_id: 'drv_2',
    vehicle_number: 'DL 08 CK 9182',
    vehicle_type: 'BIKE',
    capacity_kg: 40,
    model: 'Ather 450X Delivery Pro (ev bike)',
    status: 'ACTIVE'
  },
  {
    id: 'veh_3',
    vehicle_number: 'MH 02 CZ 8812',
    vehicle_type: 'TRUCK',
    capacity_kg: 3500,
    model: 'Mahindra Bolero Maxi Truck (truck)',
    status: 'ACTIVE'
  },
  {
    id: 'veh_4',
    vehicle_number: 'KA 03 MQ 7741',
    vehicle_type: 'VAN',
    capacity_kg: 1200,
    model: 'Ashok Leyland Dost+ (van)',
    status: 'IDLE'
  },
  {
    id: 'veh_5',
    vehicle_number: 'WB 04 EQ 3319',
    vehicle_type: 'ELECTRIC_SCOOTER',
    capacity_kg: 35,
    model: 'TVS iQube Logistics (scooter)',
    status: 'ACTIVE'
  },
  {
    id: 'veh_6',
    vehicle_number: 'MP 04 ZB 5542',
    vehicle_type: 'BIKE',
    capacity_kg: 45,
    model: 'Bajaj Pulsar Courier Special (bike)',
    status: 'ACTIVE'
  }
];

export const SEED_DRIVERS: Driver[] = [
  {
    id: 'drv_1',
    user_id: 'usr_driver_1',
    name: 'Vikram Singh',
    email: 'driver@swiftship.in',
    phone: '+91 99887 76655',
    license_number: 'DL-1420190038291',
    vehicle_id: 'veh_1',
    status: 'ONLINE',
    rating: 4.88,
    total_deliveries: 428,
    current_lat: 28.5721,
    current_lng: 77.2289,
    current_city: 'New Delhi',
    shift_earnings: 1650
  },
  {
    id: 'drv_2',
    user_id: 'usr_driver_2',
    name: 'Amit Verma',
    email: 'amit.driver@swiftship.in',
    phone: '+91 98111 22334',
    license_number: 'DL-0920210049281',
    vehicle_id: 'veh_2',
    status: 'ONLINE',
    rating: 4.92,
    total_deliveries: 312,
    current_lat: 28.6210,
    current_lng: 77.1950,
    current_city: 'New Delhi',
    shift_earnings: 1280
  }
];

export const SEED_COUPONS: Coupon[] = [
  {
    id: 'coup_1',
    code: 'SWIFT15',
    discount_type: 'PERCENTAGE',
    value: 15,
    min_order_amount: 300,
    max_discount: 250,
    expiry_date: '2026-12-31',
    usage_count: 342,
    is_active: true
  },
  {
    id: 'coup_2',
    code: 'FIRSTSHIP',
    discount_type: 'FLAT',
    value: 100,
    min_order_amount: 250,
    expiry_date: '2026-12-31',
    usage_count: 890,
    is_active: true
  },
  {
    id: 'coup_3',
    code: 'EXPRESS25',
    discount_type: 'PERCENTAGE',
    value: 25,
    min_order_amount: 500,
    max_discount: 400,
    expiry_date: '2026-10-15',
    usage_count: 124,
    is_active: true
  }
];

/**
 * Seed Shipments Grounded in the "Delivery Logistics Dataset (India, Multi-Partner)"
 * Containing multi-partner fleets, package types, vehicle types, delivery modes, regions,
 * weather conditions, SLA hours, actual delivery times, distance, weight, and costs.
 */
export const SEED_SHIPMENTS: Shipment[] = [
  {
    id: 'shp_1',
    tracking_number: 'DLV98273519',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      landmark: 'Near Cyber City Metro',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Rohan Mehra',
    receiver_phone: '+91 98231 44556',
    receiver_address: {
      id: 'addr_2',
      user_id: 'usr_cust_1',
      name: 'Rohan Mehra',
      phone: '+91 98231 44556',
      address_line: 'Flat 304, Green Palms Apt, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      landmark: 'Opposite Hill Road Park',
      lat: 19.0596,
      lng: 72.8295
    },
    driver_id: 'drv_1',
    warehouse_id: 'wh_del_1',
    warehouse_bin: 'A-12-BAY-4',
    status: 'OUT_FOR_DELIVERY',
    delivery_type: 'EXPRESS',
    package_type: 'electronics',
    weight_kg: 12.69,
    dimensions: { length: 35, width: 25, height: 18 },
    price_breakdown: {
      base_charge: 150,
      weight_charge: 508,
      distance_charge: 674,
      delivery_type_charge: 154,
      discount_amount: 0,
      subtotal: 1486,
      gst: 267,
      total: 1486.57,
      distance_km: 269.7
    },
    pickup_date: '2026-08-27',
    pickup_time_slot: '10:00 AM - 01:00 PM',
    estimated_delivery_date: '2026-08-29',
    special_instructions: 'Fragile electronics item. Handle with care.',
    payment_id: 'pay_98273519',
    created_at: '2026-08-27T08:30:00Z',
    updated_at: '2026-08-28T14:20:00Z',
    current_lat: 19.0620,
    current_lng: 72.8350,
    rating: 4,
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'dhl',
    delivery_mode: 'same day',
    vehicle_type: 'ev van',
    region: 'east',
    weather_condition: 'cold',
    distance_km: 269.7,
    package_weight_kg: 12.69,
    delivery_time_hours: 6,
    expected_time_hours: 8,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 4,
    delivery_cost: 1486.57
  },
  {
    id: 'shp_2',
    tracking_number: 'DLV48201934',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Ananya Roy',
    receiver_phone: '+91 97334 11223',
    receiver_address: {
      id: 'addr_3',
      user_id: 'usr_cust_1',
      name: 'Ananya Roy',
      phone: '+91 97334 11223',
      address_line: '42 Lake View Road, Salt Lake Sector 5',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700091',
      lat: 22.5868,
      lng: 88.4178
    },
    warehouse_id: 'wh_del_1',
    warehouse_bin: 'B-04-STAGING',
    status: 'IN_TRANSIT',
    delivery_type: 'STANDARD',
    package_type: 'clothing',
    weight_kg: 37.02,
    dimensions: { length: 45, width: 35, height: 20 },
    price_breakdown: {
      base_charge: 150,
      weight_charge: 480,
      distance_charge: 642,
      delivery_type_charge: 122,
      discount_amount: 0,
      subtotal: 1394,
      gst: 251,
      total: 1394.56,
      distance_km: 256.7
    },
    pickup_date: '2026-08-26',
    pickup_time_slot: '02:00 PM - 05:00 PM',
    estimated_delivery_date: '2026-08-30',
    special_instructions: 'Call recipient before arrival.',
    payment_id: 'pay_48201934',
    created_at: '2026-08-26T11:15:00Z',
    updated_at: '2026-08-28T09:45:00Z',
    current_lat: 25.4358,
    current_lng: 81.8463,
    rating: 4,
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'dhl',
    delivery_mode: 'two day',
    vehicle_type: 'van',
    region: 'north',
    weather_condition: 'foggy',
    distance_km: 256.7,
    package_weight_kg: 37.02,
    delivery_time_hours: 9,
    expected_time_hours: 16,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 4,
    delivery_cost: 1394.56
  },
  {
    id: 'shp_3',
    tracking_number: 'DLV10938472',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Karan Sen',
    receiver_phone: '+91 98450 88990',
    receiver_address: {
      id: 'addr_4',
      user_id: 'usr_cust_1',
      name: 'Karan Sen',
      phone: '+91 98450 88990',
      address_line: '18th Main, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      lat: 12.9352,
      lng: 77.6245
    },
    driver_id: 'drv_1',
    status: 'DELIVERED',
    delivery_type: 'SAME_DAY',
    package_type: 'cosmetics',
    weight_kg: 47.39,
    dimensions: { length: 30, width: 20, height: 15 },
    price_breakdown: {
      base_charge: 100,
      weight_charge: 240,
      distance_charge: 224,
      delivery_type_charge: 76,
      discount_amount: 0,
      subtotal: 640,
      gst: 115,
      total: 640.17,
      distance_km: 89.6
    },
    pickup_date: '2026-08-27',
    pickup_time_slot: '08:00 AM - 11:00 AM',
    estimated_delivery_date: '2026-08-27',
    payment_id: 'pay_10938472',
    created_at: '2026-08-27T07:10:00Z',
    updated_at: '2026-08-27T17:40:00Z',
    rating: 5,
    feedback: 'Phenomenal speed! Delivery arrived ahead of SLA.',
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'xpressbees',
    delivery_mode: 'express',
    vehicle_type: 'ev van',
    region: 'central',
    weather_condition: 'cold',
    distance_km: 89.6,
    package_weight_kg: 47.39,
    delivery_time_hours: 2,
    expected_time_hours: 3,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 5,
    delivery_cost: 640.17
  },
  {
    id: 'shp_4',
    tracking_number: 'DLV88392014',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Deepak Chopra',
    receiver_phone: '+91 99100 22446',
    receiver_address: {
      id: 'addr_5',
      user_id: 'usr_cust_1',
      name: 'Deepak Chopra',
      phone: '+91 99100 22446',
      address_line: 'B-14 Hauz Khas Enclave',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      lat: 28.5494,
      lng: 77.2001
    },
    driver_id: 'drv_1',
    status: 'PICKUP_SCHEDULED',
    delivery_type: 'SAME_DAY',
    package_type: 'automobile parts',
    weight_kg: 46.96,
    dimensions: { length: 45, width: 40, height: 30 },
    price_breakdown: {
      base_charge: 150,
      weight_charge: 590,
      distance_charge: 742,
      delivery_type_charge: 150,
      discount_amount: 0,
      subtotal: 1632,
      gst: 294,
      total: 1632.72,
      distance_km: 297.0
    },
    pickup_date: '2026-08-29',
    pickup_time_slot: '09:00 AM - 12:00 PM',
    estimated_delivery_date: '2026-08-29',
    created_at: '2026-08-28T21:00:00Z',
    updated_at: '2026-08-28T21:00:00Z',
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'delhivery',
    delivery_mode: 'same day',
    vehicle_type: 'bike',
    region: 'west',
    weather_condition: 'clear',
    distance_km: 297.0,
    package_weight_kg: 46.96,
    delivery_time_hours: 8,
    expected_time_hours: 8,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 3,
    delivery_cost: 1632.72
  },
  {
    id: 'shp_5',
    tracking_number: 'DLV30291847',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Shweta Rao',
    receiver_phone: '+91 94480 33221',
    receiver_address: {
      id: 'addr_6',
      user_id: 'usr_cust_1',
      name: 'Shweta Rao',
      phone: '+91 94480 33221',
      address_line: 'Plot 71, Banjara Hills Road No. 12',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      lat: 17.4156,
      lng: 78.4357
    },
    warehouse_id: 'wh_del_1',
    warehouse_bin: 'INBOUND-UNASSIGNED',
    status: 'PICKED_UP',
    delivery_type: 'EXPRESS',
    package_type: 'groceries',
    weight_kg: 26.89,
    dimensions: { length: 35, width: 30, height: 20 },
    price_breakdown: {
      base_charge: 150,
      weight_charge: 450,
      distance_charge: 684,
      delivery_type_charge: 164,
      discount_amount: 0,
      subtotal: 1448,
      gst: 260,
      total: 1448.17,
      distance_km: 273.5
    },
    pickup_date: '2026-08-28',
    pickup_time_slot: '01:00 PM - 04:00 PM',
    estimated_delivery_date: '2026-08-31',
    created_at: '2026-08-28T06:00:00Z',
    updated_at: '2026-08-28T15:30:00Z',
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'shadowfax',
    delivery_mode: 'two day',
    vehicle_type: 'truck',
    region: 'east',
    weather_condition: 'rainy',
    distance_km: 273.5,
    package_weight_kg: 26.89,
    delivery_time_hours: 10,
    expected_time_hours: 16,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 4,
    delivery_cost: 1448.17
  },
  {
    id: 'shp_6',
    tracking_number: 'DLV55928103',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Rahul Deshpande',
    receiver_phone: '+91 98220 55667',
    receiver_address: {
      id: 'addr_7',
      user_id: 'usr_cust_1',
      name: 'Rahul Deshpande',
      phone: '+91 98220 55667',
      address_line: '502 Shivajinagar FC Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411005',
      lat: 18.5314,
      lng: 73.8446
    },
    status: 'IN_TRANSIT',
    delivery_type: 'EXPRESS',
    package_type: 'pharmacy',
    weight_kg: 18.4,
    dimensions: { length: 28, width: 22, height: 16 },
    price_breakdown: {
      base_charge: 120,
      weight_charge: 320,
      distance_charge: 480,
      delivery_type_charge: 185,
      discount_amount: 0,
      subtotal: 1105,
      gst: 198,
      total: 1105.00,
      distance_km: 210.4
    },
    pickup_date: '2026-08-27',
    pickup_time_slot: '11:00 AM - 02:00 PM',
    estimated_delivery_date: '2026-08-29',
    created_at: '2026-08-27T10:00:00Z',
    updated_at: '2026-08-28T12:00:00Z',
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'blue dart',
    delivery_mode: 'express',
    vehicle_type: 'ev bike',
    region: 'west',
    weather_condition: 'stormy',
    distance_km: 210.4,
    package_weight_kg: 18.4,
    delivery_time_hours: 7,
    expected_time_hours: 8,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 4,
    delivery_cost: 1105.00
  },
  {
    id: 'shp_7',
    tracking_number: 'DLV77182934',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Vikramaditya Bose',
    receiver_phone: '+91 98300 99881',
    receiver_address: {
      id: 'addr_8',
      user_id: 'usr_cust_1',
      name: 'Vikramaditya Bose',
      phone: '+91 98300 99881',
      address_line: 'Sector 2, Salt Lake Bidhannagar',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700091',
      lat: 22.5868,
      lng: 88.4178
    },
    status: 'DELIVERED',
    delivery_type: 'STANDARD',
    package_type: 'furniture',
    weight_kg: 32.5,
    dimensions: { length: 60, width: 50, height: 40 },
    price_breakdown: {
      base_charge: 180,
      weight_charge: 420,
      distance_charge: 580,
      delivery_type_charge: 0,
      discount_amount: 0,
      subtotal: 1180,
      gst: 212,
      total: 1180.00,
      distance_km: 245.0
    },
    pickup_date: '2026-08-25',
    pickup_time_slot: '09:00 AM - 12:00 PM',
    estimated_delivery_date: '2026-08-28',
    created_at: '2026-08-25T09:00:00Z',
    updated_at: '2026-08-28T16:00:00Z',
    rating: 5,
    feedback: 'Huge furniture crate delivered intact by FedEx logistics team.',
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'fedex',
    delivery_mode: 'two day',
    vehicle_type: 'truck',
    region: 'east',
    weather_condition: 'clear',
    distance_km: 245.0,
    package_weight_kg: 32.5,
    delivery_time_hours: 11,
    expected_time_hours: 16,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 5,
    delivery_cost: 1180.00
  },
  {
    id: 'shp_8',
    tracking_number: 'DLV66382019',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Aditi Sundaram',
    receiver_phone: '+91 94440 12345',
    receiver_address: {
      id: 'addr_9',
      user_id: 'usr_cust_1',
      name: 'Aditi Sundaram',
      phone: '+91 94440 12345',
      address_line: 'Besant Nagar 4th Avenue',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600090',
      lat: 13.0002,
      lng: 80.2668
    },
    status: 'IN_TRANSIT',
    delivery_type: 'STANDARD',
    package_type: 'documents',
    weight_kg: 1.2,
    dimensions: { length: 30, width: 22, height: 2 },
    price_breakdown: {
      base_charge: 100,
      weight_charge: 80,
      distance_charge: 190,
      delivery_type_charge: 0,
      discount_amount: 0,
      subtotal: 370,
      gst: 66,
      total: 370.00,
      distance_km: 78.5
    },
    pickup_date: '2026-08-28',
    pickup_time_slot: '10:00 AM - 01:00 PM',
    estimated_delivery_date: '2026-08-30',
    created_at: '2026-08-28T09:30:00Z',
    updated_at: '2026-08-28T14:15:00Z',
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'ekart',
    delivery_mode: 'standard',
    vehicle_type: 'scooter',
    region: 'south',
    weather_condition: 'hot',
    distance_km: 78.5,
    package_weight_kg: 1.2,
    delivery_time_hours: 4,
    expected_time_hours: 24,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 4,
    delivery_cost: 370.00
  },
  {
    id: 'shp_9',
    tracking_number: 'DLV99482104',
    sender_id: 'usr_cust_1',
    sender_name: 'Priya Patel',
    sender_phone: '+91 91234 56780',
    sender_address: {
      id: 'addr_1',
      user_id: 'usr_cust_1',
      name: 'Priya Patel',
      phone: '+91 91234 56780',
      address_line: 'Tower 4, Flat 1202, Cyber Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4900,
      lng: 77.0850
    },
    receiver_name: 'Gaurav Rathore',
    receiver_phone: '+91 98290 44332',
    receiver_address: {
      id: 'addr_10',
      user_id: 'usr_cust_1',
      name: 'Gaurav Rathore',
      phone: '+91 98290 44332',
      address_line: 'C-Scheme Ashok Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      lat: 26.9088,
      lng: 75.8015
    },
    status: 'DELIVERED',
    delivery_type: 'SAME_DAY',
    package_type: 'fragile items',
    weight_kg: 8.9,
    dimensions: { length: 25, width: 25, height: 25 },
    price_breakdown: {
      base_charge: 150,
      weight_charge: 210,
      distance_charge: 390,
      delivery_type_charge: 140,
      discount_amount: 0,
      subtotal: 890,
      gst: 160,
      total: 890.00,
      distance_km: 165.2
    },
    pickup_date: '2026-08-27',
    pickup_time_slot: '08:00 AM - 11:00 AM',
    estimated_delivery_date: '2026-08-27',
    created_at: '2026-08-27T07:30:00Z',
    updated_at: '2026-08-27T18:15:00Z',
    rating: 3,
    // Multi-Partner Logistics Dataset attributes
    delivery_partner: 'amazon logistics',
    delivery_mode: 'same day',
    vehicle_type: 'van',
    region: 'north',
    weather_condition: 'foggy',
    distance_km: 165.2,
    package_weight_kg: 8.9,
    delivery_time_hours: 5,
    expected_time_hours: 8,
    delayed: 'no',
    delivery_status: 'delivered',
    delivery_rating: 3,
    delivery_cost: 890.00
  }
];

export const SEED_TRACKING_EVENTS: TrackingEvent[] = [
  // For DLV98273519
  {
    id: 'trk_1',
    shipment_id: 'shp_1',
    status: 'ORDER_CREATED',
    location: 'Gurugram Booking Desk',
    description: 'Shipment created online via DHL Logistics partner network.',
    timestamp: '2026-08-27T08:30:00Z',
    lat: 28.4900,
    lng: 77.0850
  },
  {
    id: 'trk_2',
    shipment_id: 'shp_1',
    status: 'PICKUP_SCHEDULED',
    location: 'Gurugram Sector 29',
    description: 'Driver Vikram Singh dispatched for parcel pickup in EV Van.',
    timestamp: '2026-08-27T09:15:00Z',
    lat: 28.4700,
    lng: 77.0700
  },
  {
    id: 'trk_3',
    shipment_id: 'shp_1',
    status: 'PICKED_UP',
    location: 'Cyber Heights, Gurugram',
    description: 'Package received from sender Priya Patel and barcoded.',
    timestamp: '2026-08-27T11:45:00Z',
    lat: 28.4900,
    lng: 77.0850
  },
  {
    id: 'trk_4',
    shipment_id: 'shp_1',
    status: 'IN_TRANSIT',
    location: 'Delhi Northern Mega Hub (DEL-HUB-01)',
    description: 'Bagged & dispatched on Express Linehaul container to Mumbai (Weather: Cold).',
    timestamp: '2026-08-27T22:00:00Z',
    lat: 28.5355,
    lng: 77.2638
  },
  {
    id: 'trk_5',
    shipment_id: 'shp_1',
    status: 'IN_TRANSIT',
    location: 'Mumbai Western Express Hub (BOM-HUB-02)',
    description: 'Inbound sorting completed. Package assigned to Local Delivery Bay 4.',
    timestamp: '2026-08-28T11:30:00Z',
    lat: 19.0760,
    lng: 72.8777
  },
  {
    id: 'trk_6',
    shipment_id: 'shp_1',
    status: 'OUT_FOR_DELIVERY',
    location: 'Bandra West Last-Mile Hub',
    description: 'Package is out for delivery with driver Vikram Singh in Tata Ace EV (DL 01 AB 4920). OTP sent to recipient.',
    timestamp: '2026-08-28T14:20:00Z',
    lat: 19.0620,
    lng: 72.8350
  },

  // For DLV10938472 (Delivered)
  {
    id: 'trk_7',
    shipment_id: 'shp_3',
    status: 'ORDER_CREATED',
    location: 'Gurugram',
    description: 'Xpressbees Express freight booking confirmed.',
    timestamp: '2026-08-27T07:10:00Z'
  },
  {
    id: 'trk_8',
    shipment_id: 'shp_3',
    status: 'PICKED_UP',
    location: 'Cyber Heights, Gurugram',
    description: 'Priority courier picked up cosmetics package.',
    timestamp: '2026-08-27T08:30:00Z'
  },
  {
    id: 'trk_9',
    shipment_id: 'shp_3',
    status: 'IN_TRANSIT',
    location: 'Air Cargo Express Terminal (DEL-BLR flight 6E-204)',
    description: 'Air cargo transit completed to Kempegowda Airport.',
    timestamp: '2026-08-27T13:45:00Z'
  },
  {
    id: 'trk_10',
    shipment_id: 'shp_3',
    status: 'OUT_FOR_DELIVERY',
    location: 'Koramangala Hub',
    description: 'Rider out on EV Van delivery.',
    timestamp: '2026-08-27T16:10:00Z'
  },
  {
    id: 'trk_11',
    shipment_id: 'shp_3',
    status: 'DELIVERED',
    location: '18th Main Koramangala, Bengaluru',
    description: 'Delivered to Karan Sen. Digital signature captured on device.',
    timestamp: '2026-08-27T17:40:00Z'
  }
];

export const SEED_DELIVERY_PROOFS: DeliveryProof[] = [
  {
    id: 'prf_1',
    shipment_id: 'shp_3',
    signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><path d="M 20 60 Q 60 20 100 50 T 180 40 T 260 70" stroke="%236366f1" stroke-width="3" fill="none"/></svg>',
    photo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
    recipient_name: 'Karan Sen',
    recipient_relation: 'SELF',
    timestamp: '2026-08-27T17:40:00Z',
    notes: 'Handed over directly to recipient at office reception.',
    verified_by_driver_id: 'drv_1'
  }
];

export const SEED_PAYMENTS: Payment[] = [
  {
    id: 'pay_98273519',
    shipment_id: 'shp_1',
    amount: 1486.57,
    currency: 'INR',
    payment_status: 'SUCCESS',
    transaction_id: 'pay_rzp_live_98273519',
    payment_method: 'UPI',
    created_at: '2026-08-27T08:32:00Z'
  },
  {
    id: 'pay_48201934',
    shipment_id: 'shp_2',
    amount: 1394.56,
    currency: 'INR',
    payment_status: 'SUCCESS',
    transaction_id: 'pay_rzp_live_48201934',
    payment_method: 'CARD',
    created_at: '2026-08-26T11:18:00Z'
  },
  {
    id: 'pay_10938472',
    shipment_id: 'shp_3',
    amount: 640.17,
    currency: 'INR',
    payment_status: 'SUCCESS',
    transaction_id: 'pay_rzp_live_10938472',
    payment_method: 'UPI',
    created_at: '2026-08-27T07:12:00Z'
  }
];

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp_1',
    shipment_id: 'shp_2',
    user_id: 'usr_cust_1',
    user_name: 'Priya Patel',
    user_email: 'customer@swiftship.in',
    tracking_number: 'DLV48201934',
    category: 'DELAY',
    message: 'Foggy weather corridor in North India causing delay on DHL linehaul. Please expedite.',
    status: 'IN_REVIEW',
    resolution_note: 'Hub Manager at DEL-HUB-01 contacted. Express linehaul flight arranged.',
    created_at: '2026-08-28T10:00:00Z'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    admin_id: 'usr_admin_1',
    admin_name: 'Aarav Sharma',
    action: 'DISPATCH_OVERRIDE',
    target_type: 'SHIPMENT',
    target_id: 'shp_1',
    details: 'Assigned DHL express partner with EV Van dispatch.',
    timestamp: '2026-08-27T21:50:00Z'
  },
  {
    id: 'aud_2',
    admin_id: 'usr_admin_1',
    admin_name: 'Aarav Sharma',
    action: 'PRICING_UPDATED',
    target_type: 'PRICING',
    target_id: 'config_main',
    details: 'Base shipping rate calibrated with 25,000 Delivery Logistics dataset benchmark.',
    timestamp: '2026-08-25T14:30:00Z'
  }
];

/**
 * 25,000 Delivery Logistics Dataset (India, Multi-Partner) Aggregated Insights & Distributions
 */
export const DATASET_LOGISTICS_INSIGHTS = {
  dataset_name: 'Delivery Logistics Dataset (India, Multi-Partner)',
  total_records: 25000,
  metrics: {
    mean_distance_km: 150.39,
    min_distance_km: 3.6,
    max_distance_km: 297.1,
    mean_package_weight_kg: 25.15,
    min_package_weight_kg: 0.67,
    max_package_weight_kg: 49.52,
    mean_delivery_cost_inr: 864.94,
    min_delivery_cost_inr: 95.67,
    max_delivery_cost_inr: 1632.72,
    mean_delivery_rating: 3.67
  },
  status_distribution: [
    { name: 'Delivered', count: 18331, percentage: 73.32, color: '#10b981' },
    { name: 'Delayed', count: 5341, percentage: 21.36, color: '#f59e0b' },
    { name: 'Failed', count: 1328, percentage: 5.31, color: '#ef4444' }
  ],
  partner_market_share: [
    { partner: 'Xpressbees', count: 2826, percentage: 11.3, rating: 3.68, onTimeRate: 74.2 },
    { partner: 'FedEx', count: 2818, percentage: 11.27, rating: 3.71, onTimeRate: 75.1 },
    { partner: 'DHL', count: 2802, percentage: 11.21, rating: 3.69, onTimeRate: 73.8 },
    { partner: 'Ekart', count: 2801, percentage: 11.20, rating: 3.64, onTimeRate: 72.9 },
    { partner: 'Blue Dart', count: 2798, percentage: 11.19, rating: 3.73, onTimeRate: 76.0 },
    { partner: 'Delhivery', count: 2786, percentage: 11.14, rating: 3.66, onTimeRate: 73.5 },
    { partner: 'Shadowfax', count: 2736, percentage: 10.94, rating: 3.61, onTimeRate: 71.8 },
    { partner: 'Ecom Express', count: 2722, percentage: 10.89, rating: 3.63, onTimeRate: 72.4 },
    { partner: 'Amazon Logistics', count: 2711, percentage: 10.84, rating: 3.70, onTimeRate: 74.6 }
  ],
  regional_volume: [
    { region: 'West (Mumbai/Pune/Ahmedabad)', count: 5095, percentage: 20.38, avgCost: 871 },
    { region: 'Central (Bhopal/Indore/Jabalpur)', count: 5060, percentage: 20.24, avgCost: 862 },
    { region: 'South (Bengaluru/Chennai/Hyd)', count: 4977, percentage: 19.91, avgCost: 859 },
    { region: 'North (Delhi/Noida/Jaipur)', count: 4949, percentage: 19.80, avgCost: 868 },
    { region: 'East (Kolkata/Patna/Bhubaneswar)', count: 4919, percentage: 19.68, avgCost: 866 }
  ],
  weather_delay_impact: [
    { weather: 'Foggy', count: 4219, delayRate: 31.4, avgExtraHours: 3.8 },
    { weather: 'Stormy', count: 4198, delayRate: 34.2, avgExtraHours: 4.5 },
    { weather: 'Rainy', count: 4171, delayRate: 29.8, avgExtraHours: 3.2 },
    { weather: 'Cold', count: 4158, delayRate: 24.1, avgExtraHours: 2.1 },
    { weather: 'Hot', count: 4130, delayRate: 21.6, avgExtraHours: 1.8 },
    { weather: 'Clear', count: 4124, delayRate: 16.2, avgExtraHours: 0.9 }
  ],
  vehicle_fleet_distribution: [
    { type: 'EV Bike', count: 4218, percentage: 16.87, ecoFriendly: true },
    { type: 'Van', count: 4187, percentage: 16.75, ecoFriendly: false },
    { type: 'Scooter', count: 4174, percentage: 16.70, ecoFriendly: false },
    { type: 'Bike', count: 4160, percentage: 16.64, ecoFriendly: false },
    { type: 'Truck', count: 4145, percentage: 16.58, ecoFriendly: false },
    { type: 'EV Van', count: 4116, percentage: 16.46, ecoFriendly: true }
  ],
  package_type_distribution: [
    { type: 'Fragile Items', count: 2848, avgWeightKg: 24.8 },
    { type: 'Pharmacy', count: 2810, avgWeightKg: 18.2 },
    { type: 'Documents', count: 2805, avgWeightKg: 2.4 },
    { type: 'Automobile Parts', count: 2795, avgWeightKg: 38.6 },
    { type: 'Electronics', count: 2792, avgWeightKg: 14.1 },
    { type: 'Clothing', count: 2767, avgWeightKg: 8.5 },
    { type: 'Furniture', count: 2746, avgWeightKg: 42.1 },
    { type: 'Cosmetics', count: 2744, avgWeightKg: 5.2 },
    { type: 'Groceries', count: 2693, avgWeightKg: 22.9 }
  ],
  correlations: {
    distance_vs_cost: 0.991,
    weight_vs_cost: 0.099,
    rating_vs_cost: -0.161,
    rating_vs_distance: -0.133
  }
};
