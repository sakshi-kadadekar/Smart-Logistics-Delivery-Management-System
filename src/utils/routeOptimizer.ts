import { Shipment } from '../types';
import { calculateDistanceKm } from './pricingEngine';

export interface RouteStop {
  stop_number: number;
  shipment_id: string;
  tracking_number: string;
  type: 'PICKUP' | 'DELIVERY';
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  package_weight: number;
  status: string;
  estimated_arrival_minutes: number;
  distance_from_prev_km: number;
}

export interface OptimizedRoutePlan {
  total_stops: number;
  total_distance_km: number;
  estimated_total_time_minutes: number;
  stops: RouteStop[];
  summary_by_city: Record<string, number>;
}

/**
 * Optimizes a list of assigned shipments into a multi-stop sequence.
 * Uses a heuristic greedy nearest-neighbor TSP algorithm.
 */
export function optimizeDeliveryRoute(
  driverLat: number,
  driverLng: number,
  shipments: Shipment[]
): OptimizedRoutePlan {
  if (shipments.length === 0) {
    return {
      total_stops: 0,
      total_distance_km: 0,
      estimated_total_time_minutes: 0,
      stops: [],
      summary_by_city: {}
    };
  }

  // Flatten shipments into destination stops
  const unvisited: Array<{
    shipment: Shipment;
    lat: number;
    lng: number;
    type: 'DELIVERY' | 'PICKUP';
    addressText: string;
    city: string;
    pincode: string;
    name: string;
    phone: string;
  }> = shipments.map((s) => {
    // If status is ORDER_CREATED or PICKUP_SCHEDULED, it's a pickup
    const isPickup = s.status === 'ORDER_CREATED' || s.status === 'PICKUP_SCHEDULED';
    const addr = isPickup ? s.sender_address : s.receiver_address;
    const fallbackLat = addr.lat || s.current_lat || driverLat + (Math.random() - 0.5) * 0.08;
    const fallbackLng = addr.lng || s.current_lng || driverLng + (Math.random() - 0.5) * 0.08;
    
    return {
      shipment: s,
      lat: fallbackLat,
      lng: fallbackLng,
      type: isPickup ? 'PICKUP' : 'DELIVERY',
      addressText: addr.address_line,
      city: addr.city,
      pincode: addr.pincode,
      name: isPickup ? s.sender_name : s.receiver_name,
      phone: isPickup ? s.sender_phone : s.receiver_phone
    };
  });

  const orderedStops: RouteStop[] = [];
  let currentLat = driverLat;
  let currentLng = driverLng;
  let totalDistanceKm = 0;
  let cumulativeMinutes = 0;
  const summaryByCity: Record<string, number> = {};

  let stopIndex = 1;
  while (unvisited.length > 0) {
    // Find closest stop to current position
    let bestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistanceKm(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        bestIndex = i;
      }
    }

    const nextStop = unvisited.splice(bestIndex, 1)[0];
    const legDistance = Math.max(1, minDistance);
    totalDistanceKm += legDistance;

    // Driving time @ avg 25 km/h in city + 8 mins drop-off/pickup handling buffer
    const legTimeMinutes = Math.round((legDistance / 25) * 60) + 8;
    cumulativeMinutes += legTimeMinutes;

    summaryByCity[nextStop.city] = (summaryByCity[nextStop.city] || 0) + 1;

    orderedStops.push({
      stop_number: stopIndex++,
      shipment_id: nextStop.shipment.id,
      tracking_number: nextStop.shipment.tracking_number,
      type: nextStop.type,
      customer_name: nextStop.name,
      phone: nextStop.phone,
      address: nextStop.addressText,
      city: nextStop.city,
      pincode: nextStop.pincode,
      lat: nextStop.lat,
      lng: nextStop.lng,
      package_weight: nextStop.shipment.weight_kg,
      status: nextStop.shipment.status,
      estimated_arrival_minutes: cumulativeMinutes,
      distance_from_prev_km: legDistance
    });

    currentLat = nextStop.lat;
    currentLng = nextStop.lng;
  }

  return {
    total_stops: orderedStops.length,
    total_distance_km: totalDistanceKm,
    estimated_total_time_minutes: cumulativeMinutes,
    stops: orderedStops,
    summary_by_city: summaryByCity
  };
}
