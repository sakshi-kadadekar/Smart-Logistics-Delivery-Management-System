import { DeliveryType, PackageDimensions, PriceBreakdown, PricingConfig, Coupon } from '../types';

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  base_charge: 150,           // ₹150 base rate
  per_kg_charge: 40,          // ₹40 per kg
  per_km_charge: 2.5,         // ₹2.5 per km
  express_multiplier: 1.4,    // 40% premium for Express
  same_day_multiplier: 2.0,   // 100% premium for Same-Day
  gst_rate: 0.18,             // 18% GST (India logistics standard)
};

// City coordinates across India for realistic distance calculation
export const CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  'New Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'Jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'Lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  'Chandigarh': { lat: 30.7333, lng: 76.7794, state: 'Punjab' },
  'Kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  'Indore': { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  'Gurugram': { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  'Noida': { lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh' }
};

// Haversine formula to compute great-circle distance between coordinates
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDist = R * c;
  // Road factor typically adds ~1.25x to 1.35x over straight line distance
  return Math.round(Math.max(15, straightDist * 1.3));
}

export function estimateCityDistance(fromCity: string, toCity: string): number {
  const from = CITY_COORDINATES[fromCity] || { lat: 28.6139, lng: 77.2090, state: 'Delhi' };
  const to = CITY_COORDINATES[toCity] || { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' };
  
  if (fromCity.toLowerCase().trim() === toCity.toLowerCase().trim()) {
    return 25; // Intra-city standard distance
  }

  return calculateDistanceKm(from.lat, from.lng, to.lat, to.lng);
}

export interface PricingInput {
  pickupCity: string;
  destinationCity: string;
  weightKg: number;
  dimensions: PackageDimensions;
  deliveryType: DeliveryType;
  coupon?: Coupon | null;
  config?: PricingConfig;
  customDistanceKm?: number;
}

/**
 * Pure dynamic shipping price calculation function
 * Takes pickup, destination, weight, dimensions, deliveryType, coupon and returns detailed breakdown.
 */
export function calculateShippingPrice(input: PricingInput): PriceBreakdown {
  const config = input.config || DEFAULT_PRICING_CONFIG;
  const distanceKm = input.customDistanceKm || estimateCityDistance(input.pickupCity, input.destinationCity);
  
  // Volumetric weight formula: (L * W * H) / 5000 in cm
  const volumetricWeight = (input.dimensions.length * input.dimensions.width * input.dimensions.height) / 5000;
  const chargeableWeight = Math.max(input.weightKg, volumetricWeight, 0.5);

  const base_charge = config.base_charge;
  const weight_charge = Math.round(chargeableWeight * config.per_kg_charge);
  const distance_charge = Math.round(distanceKm * config.per_km_charge);

  let delivery_type_charge = 0;
  if (input.deliveryType === 'EXPRESS') {
    delivery_type_charge = Math.round((base_charge + weight_charge + distance_charge) * (config.express_multiplier - 1));
  } else if (input.deliveryType === 'SAME_DAY') {
    delivery_type_charge = Math.round((base_charge + weight_charge + distance_charge) * (config.same_day_multiplier - 1));
  }

  const rawSubtotal = base_charge + weight_charge + distance_charge + delivery_type_charge;

  // Coupon discount calculation
  let discount_amount = 0;
  if (input.coupon && input.coupon.is_active) {
    if (rawSubtotal >= (input.coupon.min_order_amount || 0)) {
      if (input.coupon.discount_type === 'PERCENTAGE') {
        discount_amount = Math.round((rawSubtotal * input.coupon.value) / 100);
        if (input.coupon.max_discount && discount_amount > input.coupon.max_discount) {
          discount_amount = input.coupon.max_discount;
        }
      } else if (input.coupon.discount_type === 'FLAT') {
        discount_amount = Math.min(rawSubtotal, input.coupon.value);
      }
    }
  }

  const subtotal = Math.max(0, rawSubtotal - discount_amount);
  const gst = Math.round(subtotal * config.gst_rate);
  const total = subtotal + gst;

  return {
    base_charge,
    weight_charge,
    distance_charge,
    delivery_type_charge,
    discount_amount,
    subtotal,
    gst,
    total,
    distance_km: distanceKm
  };
}
