import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { optimizeDeliveryRoute } from '../utils/routeOptimizer';
import { Shipment, ShipmentStatus } from '../types';
import { InteractiveMap } from './InteractiveMap';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  Sparkles,
  UserCheck,
  AlertCircle,
  FileCheck,
  Star,
  Clock,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Camera
} from 'lucide-react';

interface DriverDashboardProps {
  onOpenTracking: (trackingNumber: string) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ onOpenTracking }) => {
  const {
    currentUser,
    drivers,
    setDriverStatus,
    shipments,
    updateShipmentStatus,
    addProofOfDelivery
  } = useApp();

  // Find active driver profile
  const driver = drivers.find(d => d.user_id === currentUser.id) || drivers[0];

  const [activeTaskTab, setActiveTaskTab] = useState<'assigned' | 'route_plan' | 'history'>('assigned');
  const [selectedShipmentForPOD, setSelectedShipmentForPOD] = useState<Shipment | null>(null);

  // POD form states
  const [recipientName, setRecipientName] = useState('');
  const [recipientRelation, setRecipientRelation] = useState('Self / Consignee');
  const [podNotes, setPodNotes] = useState('Delivered directly to customer at door.');
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Assigned shipments
  const assignedShipments = shipments.filter(
    s => (s.driver_id === driver.id || s.driver_id === 'driver_1') && s.status !== 'DELIVERED' && s.status !== 'CANCELLED'
  );

  const completedShipments = shipments.filter(
    s => (s.driver_id === driver.id || s.driver_id === 'driver_1') && s.status === 'DELIVERED'
  );

  // Multi-stop route optimization
  const optimizedRoute = optimizeDeliveryRoute(
    driver.current_lat,
    driver.current_lng,
    assignedShipments
  );

  // Canvas drawing handlers for signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawingSignature(true);
    setHasDrawnSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6366f1';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingSignature(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleStatusTransition = async (shipment: Shipment, nextStatus: ShipmentStatus) => {
    let desc = `Driver updated status to ${nextStatus.replace(/_/g, ' ')}`;
    if (nextStatus === 'PICKED_UP') desc = `Driver ${driver.name} picked up the parcel from ${shipment.sender_name}`;
    if (nextStatus === 'OUT_FOR_DELIVERY') desc = `Driver ${driver.name} loaded package on vehicle and is out for final delivery`;
    
    await updateShipmentStatus(shipment.id, nextStatus, `${shipment.receiver_address.city} Zone Hub`, desc);
  };

  const handleCompletePOD = async () => {
    if (!selectedShipmentForPOD) return;

    const canvas = canvasRef.current;
    const sigData = canvas ? canvas.toDataURL('image/png') : undefined;

    await addProofOfDelivery({
      shipment_id: selectedShipmentForPOD.id,
      driver_id: driver.id,
      recipient_name: recipientName || selectedShipmentForPOD.receiver_name,
      recipient_relation: recipientRelation,
      signature_url: sigData,
      notes: podNotes,
      photo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80'
    });

    setSelectedShipmentForPOD(null);
    clearSignature();
    setRecipientName('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. Mobile Driver Shift Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-lg">{driver.name}</h2>
                <span className="text-xs text-amber-600 flex items-center gap-0.5 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {driver.rating}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {driver.vehicle_model} • {driver.vehicle_plate}
              </p>
            </div>
          </div>

          {/* Shift Status Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['AVAILABLE', 'ON_DUTY', 'OFFLINE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setDriverStatus(driver.id, st)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  driver.status === st
                    ? st === 'AVAILABLE' || st === 'ON_DUTY'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Driver Stats Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Today's Payout</span>
            <p className="text-base font-extrabold text-emerald-700">₹{(completedShipments.length * 120) + 480}</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Completed</span>
            <p className="text-base font-extrabold text-blue-600">{completedShipments.length} Deliveries</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Pending Tasks</span>
            <p className="text-base font-extrabold text-amber-700">{assignedShipments.length} Active</p>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveTaskTab('assigned')}
          className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTaskTab === 'assigned'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          Active Tasks ({assignedShipments.length})
        </button>
        <button
          onClick={() => setActiveTaskTab('route_plan')}
          className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTaskTab === 'route_plan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-4 h-4" />
          Smart Route Plan
        </button>
        <button
          onClick={() => setActiveTaskTab('history')}
          className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTaskTab === 'history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed ({completedShipments.length})
        </button>
      </div>

      {/* 3. Tab 1: Assigned Active Tasks List */}
      {activeTaskTab === 'assigned' && (
        <div className="space-y-4">
          {assignedShipments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">All Tasks Completed!</h3>
              <p className="text-xs text-slate-500">Great job. Keep your status as AVAILABLE to receive incoming warehouse dispatches.</p>
            </div>
          ) : (
            assignedShipments.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden"
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{s.tracking_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.status === 'OUT_FOR_DELIVERY'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Payout: ₹120
                  </span>
                </div>

                {/* Customer Details & Calling */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{s.receiver_name}</p>
                    <p className="text-[11px] text-slate-500">{s.receiver_address.address_line}, {s.receiver_address.city}</p>
                  </div>
                  <a
                    href={`tel:${s.receiver_phone}`}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>

                {/* Status Transitions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {s.status === 'PICKUP_SCHEDULED' && (
                    <button
                      onClick={() => handleStatusTransition(s, 'PICKED_UP')}
                      className="sm:col-span-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Picked Up from Sender
                    </button>
                  )}

                  {s.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleStatusTransition(s, 'IN_TRANSIT')}
                      className="sm:col-span-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      Move to In-Transit Hub
                    </button>
                  )}

                  {s.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleStatusTransition(s, 'OUT_FOR_DELIVERY')}
                      className="sm:col-span-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      Start Delivery (Out For Delivery)
                    </button>
                  )}

                  {s.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => {
                        setSelectedShipmentForPOD(s);
                        setRecipientName(s.receiver_name);
                      }}
                      className="sm:col-span-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      Collect Signature & Mark Delivered (POD)
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Tab 2: Smart Route Plan (TSP Heuristic) */}
      {activeTaskTab === 'route_plan' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200 mb-1">
                  <Sparkles className="w-3 h-3 text-blue-600" /> TSP Heuristic Optimization
                </div>
                <h3 className="font-bold text-slate-900 text-base">Optimized Multi-Stop Delivery Sequence</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Total Route Distance</span>
                <p className="text-sm font-bold text-slate-900 font-mono">~{optimizedRoute.total_distance_km} km ({optimizedRoute.estimated_total_time_minutes} min)</p>
              </div>
            </div>

            {/* Route Map Preview */}
            <InteractiveMap
              className="h-64 w-full"
              points={optimizedRoute.stops.map((stop, idx) => ({
                lat: stop.lat,
                lng: stop.lng,
                label: `Stop ${idx + 1}: ${stop.customer_name}`,
                type: 'WAYPOINT',
                details: `${stop.city} (${stop.tracking_number})`
              }))}
              driverPosition={{
                lat: driver.current_lat,
                lng: driver.current_lng,
                name: driver.name
              }}
              showRoute={true}
            />

            {/* Sequence Stops */}
            <div className="space-y-2 pt-2">
              {optimizedRoute.stops.map((stop, idx) => {
                const linkedShipment = assignedShipments.find(s => s.id === stop.shipment_id);
                return (
                  <div
                    key={stop.shipment_id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{stop.customer_name} <span className="font-mono text-slate-500 text-[11px]">({stop.tracking_number})</span></p>
                        <p className="text-slate-500 text-[11px]">{stop.address}, {stop.city} ({stop.pincode})</p>
                        <p className="text-[10px] text-blue-600 font-semibold">ETA: ~{stop.estimated_arrival_minutes} mins (+{stop.distance_from_prev_km} km)</p>
                      </div>
                    </div>

                    {linkedShipment && (
                      <button
                        onClick={() => {
                          setSelectedShipmentForPOD(linkedShipment);
                          setRecipientName(stop.customer_name);
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold cursor-pointer"
                      >
                        Deliver
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* 5. Tab 3: Completed Shipments History */}
      {activeTaskTab === 'history' && (
        <div className="space-y-3">
          {completedShipments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs shadow-sm">
              No completed deliveries recorded today yet.
            </div>
          ) : (
            completedShipments.map(s => (
              <div
                key={s.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-900">{s.tracking_number}</span>
                    <p className="text-slate-500">Delivered to: {s.receiver_name} ({s.receiver_address.city})</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-700 font-bold">+₹120 Payout</span>
                  <p className="text-[10px] text-slate-400">{s.estimated_delivery_date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. Proof of Delivery (POD) Interactive Modal */}
      {selectedShipmentForPOD && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Proof of Delivery Studio</h3>
              </div>
              <button
                onClick={() => setSelectedShipmentForPOD(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">Consignment: {selectedShipmentForPOD.tracking_number}</p>
              <p className="text-slate-500">Recipient Address: {selectedShipmentForPOD.receiver_address.address_line}, {selectedShipmentForPOD.receiver_address.city}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Relationship to Consignee</label>
                <select
                  value={recipientRelation}
                  onChange={(e) => setRecipientRelation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="Self / Consignee">Self / Consignee</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Security Guard / Front Desk">Security Guard / Front Desk</option>
                  <option value="Office Colleague">Office Colleague</option>
                  <option value="Neighbor">Neighbor</option>
                </select>
              </div>

              {/* Signature Canvas Pad */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">Customer Digital Signature</label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Pad
                  </button>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair touch-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Ask customer to sign with finger or mouse.</p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Delivery Notes</label>
                <input
                  type="text"
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompletePOD}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Delivery & Submit POD
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
