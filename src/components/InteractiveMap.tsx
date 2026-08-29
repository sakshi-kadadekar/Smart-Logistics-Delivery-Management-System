import L from 'leaflet';
import React, { useEffect, useRef } from 'react';

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  type: 'ORIGIN' | 'DESTINATION' | 'WAREHOUSE' | 'DRIVER' | 'WAYPOINT';
  details?: string;
}

interface InteractiveMapProps {
  points?: MapPoint[];
  driverPosition?: { lat: number; lng: number; name?: string };
  originPosition?: { lat: number; lng: number; name?: string };
  destinationPosition?: { lat: number; lng: number; name?: string };
  showRoute?: boolean;
  className?: string;
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  points = [],
  driverPosition,
  originPosition,
  destinationPosition,
  showRoute = true,
  className = 'h-72 w-full',
  zoom
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to central India or origin
      const defaultCenter: [number, number] = originPosition
        ? [originPosition.lat, originPosition.lng]
        : [22.5937, 78.9629];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: zoom || (originPosition && destinationPosition ? 5 : 6),
        attributionControl: false,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive across standard re-renders unless unmounted
    };
  }, []);

  // Update markers and route polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersRef.current) return;

    markersRef.current.clearLayers();
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const allCoords: [number, number][] = [];

    // Helper icon creators
    const createCustomIcon = (bgColor: string, text: string, isDriver = false) => {
      return L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            ${isDriver ? '<div class="absolute -inset-2 bg-blue-500 rounded-full opacity-60 radar-pulse"></div>' : ''}
            <div class="w-8 h-8 rounded-full ${bgColor} text-white font-bold text-xs flex items-center justify-center shadow-md border-2 border-white z-10 transition-transform hover:scale-110">
              ${text}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });
    };

    // 1. Origin
    if (originPosition) {
      const coord: [number, number] = [originPosition.lat, originPosition.lng];
      allCoords.push(coord);
      const marker = L.marker(coord, {
        icon: createCustomIcon('bg-emerald-600', '📦')
      }).bindPopup(`<strong>Origin:</strong> ${originPosition.name || 'Pickup Point'}`);
      markersRef.current.addLayer(marker);
    }

    // 2. Driver
    if (driverPosition) {
      const coord: [number, number] = [driverPosition.lat, driverPosition.lng];
      allCoords.push(coord);
      const marker = L.marker(coord, {
        icon: createCustomIcon('bg-blue-600', '🚚', true)
      }).bindPopup(`<strong>Live Delivery Partner:</strong> ${driverPosition.name || 'SwiftShip Driver'}<br/><span class="text-xs text-blue-600 font-medium">Active live GPS telemetry</span>`);
      markersRef.current.addLayer(marker);
    }

    // 3. Destination
    if (destinationPosition) {
      const coord: [number, number] = [destinationPosition.lat, destinationPosition.lng];
      allCoords.push(coord);
      const marker = L.marker(coord, {
        icon: createCustomIcon('bg-rose-600', '🏁')
      }).bindPopup(`<strong>Destination:</strong> ${destinationPosition.name || 'Drop-off Address'}`);
      markersRef.current.addLayer(marker);
    }

    // 4. Arbitrary points (Warehouses, Stops)
    points.forEach((p, idx) => {
      const coord: [number, number] = [p.lat, p.lng];
      allCoords.push(coord);
      let bg = 'bg-slate-700';
      let icon = '📍';
      if (p.type === 'WAREHOUSE') { bg = 'bg-amber-600'; icon = '🏢'; }
      if (p.type === 'WAYPOINT') { bg = 'bg-blue-600'; icon = `${idx + 1}`; }
      if (p.type === 'DRIVER') { bg = 'bg-blue-600'; icon = '🚚'; }

      const marker = L.marker(coord, {
        icon: createCustomIcon(bg, icon, p.type === 'DRIVER')
      }).bindPopup(`<strong>${p.label}</strong>${p.details ? `<br/><span class="text-xs text-slate-600">${p.details}</span>` : ''}`);
      markersRef.current?.addLayer(marker);
    });

    // Draw route polyline if showRoute is enabled
    if (showRoute && allCoords.length >= 2) {
      const polyline = L.polyline(allCoords, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      polylineRef.current = polyline;
    }

    // Fit map bounds to encompass all active coordinates
    if (allCoords.length > 0) {
      if (allCoords.length === 1) {
        map.setView(allCoords[0], zoom || 12);
      } else {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [points, driverPosition, originPosition, destinationPosition, showRoute, zoom]);

  const googleMapsKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

  const getGoogleMapsDirectionsUrl = () => {
    if (originPosition && destinationPosition) {
      return `https://www.google.com/maps/dir/?api=1&origin=${originPosition.lat},${originPosition.lng}&destination=${destinationPosition.lat},${destinationPosition.lng}`;
    }
    if (driverPosition) {
      return `https://www.google.com/maps/search/?api=1&query=${driverPosition.lat},${driverPosition.lng}`;
    }
    return 'https://maps.google.com';
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-slate-50 ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="absolute top-2 right-2 z-[400] flex items-center gap-1.5">
        <a
          href={getGoogleMapsDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-200 shadow-xs flex items-center gap-1 transition-all"
          title="Open Live Route in Google Maps"
        >
          <span>Open in Google Maps</span>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </a>
      </div>
      <div className="absolute bottom-2 right-2 z-[400] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-700 border border-slate-200 flex items-center gap-1.5 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Google Maps GIS Network Active
      </div>
    </div>
  );
};
