import {
    Building,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    MapPin,
    MessageSquare,
    Package,
    Search,
    ShieldCheck,
    Sparkles,
    Truck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DelayAnalysisResult, ShipmentStatus } from '../types';
import { predictShipmentDelay } from '../utils/delayPredictor';
import { InteractiveMap } from './InteractiveMap';

const GOOGLE_FORM_FEEDBACK_URL = 'https://forms.gle/baCGAAzXAaKb98Yb6';

interface TrackingViewProps {
  initialTrackingId?: string;
  onOpenComplaintModal?: (shipmentId: string) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  initialTrackingId,
  onOpenComplaintModal
}) => {
  const {
    activeTrackingId,
    setActiveTrackingId,
    getShipmentByTrackingNumber,
    getShipmentEvents,
    getShipmentProof,
    drivers
  } = useApp();

  const [searchInput, setSearchInput] = useState(activeTrackingId || initialTrackingId || 'DLV98273519');
  const [delayAnalysis, setDelayAnalysis] = useState<DelayAnalysisResult | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  const currentTrackingNumber = activeTrackingId || initialTrackingId || 'DLV98273519';
  const shipment = getShipmentByTrackingNumber(currentTrackingNumber);
  const events = shipment ? getShipmentEvents(shipment.id) : [];
  const proof = shipment ? getShipmentProof(shipment.id) : undefined;
  const assignedDriver = shipment?.driver_id ? drivers.find(d => d.id === shipment.driver_id) : undefined;

  useEffect(() => {
    if (shipment) {
      // Run AI delay prediction
      setIsAnalyzingAi(true);
      fetch('/api/gemini/delay-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipment })
      })
        .then(async res => {
          const payload = await res.json();
          const normalized = payload?.data ?? payload;

          if (normalized && Array.isArray(normalized.contributing_factors)) {
            setDelayAnalysis(normalized as DelayAnalysisResult);
          } else {
            setDelayAnalysis(predictShipmentDelay(shipment));
          }
        })
        .catch(() => {
          // Fallback heuristic
          setDelayAnalysis(predictShipmentDelay(shipment));
        })
        .finally(() => setIsAnalyzingAi(false));
    }
  }, [shipment?.id, shipment?.status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveTrackingId(searchInput.trim().toUpperCase());
    }
  };

  const getStatusStepIndex = (status: ShipmentStatus): number => {
    switch (status) {
      case 'ORDER_CREATED': return 0;
      case 'PICKUP_SCHEDULED': return 1;
      case 'PICKED_UP': return 2;
      case 'IN_TRANSIT': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      case 'CANCELLED': return -1;
      default: return 2;
    }
  };

  const STEPS: { key: ShipmentStatus; label: string; icon: any }[] = [
    { key: 'ORDER_CREATED', label: 'Order Created', icon: FileText },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', icon: Clock },
    { key: 'PICKED_UP', label: 'Picked Up', icon: Package },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: Building },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
  ];

  const currentStepIdx = shipment ? getStatusStepIndex(shipment.status) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" />
              Live Consignment Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time multi-hop telemetry, driver GPS, and AI transit risk diagnostics.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. DLV98273519)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {!shipment ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Shipment Found for "{currentTrackingNumber}"</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please double check your 11-digit tracking number or try searching with our demo shipments:
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['DLV98273519', 'DLV48201934', 'DLV10938472', 'DLV88392014'].map(id => (
              <button
                key={id}
                onClick={() => {
                  setSearchInput(id);
                  setActiveTrackingId(id);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-blue-700 font-mono text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Main Status & Step Progress */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-8">
            
            {/* Top Bar Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracking ID:</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    {shipment.tracking_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    shipment.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : shipment.status === 'OUT_FOR_DELIVERY'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                      : shipment.status === 'CANCELLED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}>
                    {shipment.status.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200 uppercase">
                    {shipment.delivery_partner || shipment.delivery_type}
                  </span>
                  {shipment.region && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                      {shipment.region} Hub
                    </span>
                  )}
                  {shipment.weather_condition && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200 capitalize">
                      Weather: {shipment.weather_condition}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {shipment.package_type} • {shipment.weight_kg} kg • Vehicle: <span className="font-medium text-slate-700 capitalize">{shipment.vehicle_type || 'Express Van'}</span> • Estimated Delivery: <strong className="text-slate-800">{shipment.estimated_delivery_date}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {onOpenComplaintModal && (
                  <button
                    onClick={() => onOpenComplaintModal(shipment.id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Support Ticket
                  </button>
                )}
                <a
                  href={GOOGLE_FORM_FEEDBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Submit Delivery Query or Feedback via Google Form"
                >
                  <span>Feedback / Query</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </a>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative">
                {STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center relative z-10 space-y-2">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-blue-600 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white' : ''}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="inline-block mt-0.5 text-[10px] text-blue-600 font-semibold uppercase">
                            Current Stage
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Map + AI Delay Predictor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 7 Cols: Interactive Map */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Live Transit GIS Tracking Map</h3>
                  </div>
                  {assignedDriver && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Partner: {assignedDriver.name}</span>
                    </div>
                  )}
                </div>

                {/* Map Component */}
                <InteractiveMap
                  className="h-80 w-full"
                  originPosition={{
                    lat: shipment.sender_address.lat || 28.4900,
                    lng: shipment.sender_address.lng || 77.0850,
                    name: `${shipment.sender_address.city} (${shipment.sender_address.pincode})`
                  }}
                  destinationPosition={{
                    lat: shipment.receiver_address.lat || 19.0596,
                    lng: shipment.receiver_address.lng || 72.8295,
                    name: `${shipment.receiver_address.city} (${shipment.receiver_address.pincode})`
                  }}
                  driverPosition={
                    shipment.status === 'OUT_FOR_DELIVERY' || shipment.status === 'PICKUP_SCHEDULED'
                      ? {
                          lat: assignedDriver?.current_lat || shipment.current_lat || 19.0620,
                          lng: assignedDriver?.current_lng || shipment.current_lng || 72.8350,
                          name: assignedDriver?.name || 'SwiftShip Driver Partner'
                        }
                      : undefined
                  }
                  showRoute={true}
                />

                {/* Origin -> Destination Route Details */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pickup Origin
                    </span>
                    <p className="font-bold text-slate-900">{shipment.sender_address.city}, {shipment.sender_address.state}</p>
                    <p className="text-[11px] text-slate-500 truncate">{shipment.sender_address.address_line}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> Delivery Destination
                    </span>
                    <p className="font-bold text-slate-900">{shipment.receiver_address.city}, {shipment.receiver_address.state}</p>
                    <p className="text-[11px] text-slate-500 truncate">{shipment.receiver_address.address_line}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Proof Card (if delivered) */}
              {proof && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-sm">Verified Proof of Delivery (POD)</h4>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-mono font-medium">{new Date(proof.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 text-slate-700">
                      <p><strong>Received By:</strong> {proof.recipient_name} ({proof.recipient_relation})</p>
                      {proof.notes && <p><strong>Driver Note:</strong> {proof.notes}</p>}
                      <p className="text-slate-500">Captured on delivery partner terminal.</p>
                    </div>

                    {proof.signature_url && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col items-center shadow-xs">
                        <span className="text-[10px] text-slate-500 mb-1">Digital Signature</span>
                        <div dangerouslySetInnerHTML={{ __html: proof.signature_url.replace('data:image/svg+xml;utf8,', '') }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 Cols: AI Delay Assessment & Event Log */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* AI Delay Predictor Box */}
              {delayAnalysis && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">AI Transit Risk Analysis</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                      delayAnalysis.risk_level === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : delayAnalysis.risk_level === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {delayAnalysis.risk_level} RISK ({delayAnalysis.delay_probability_percent}% Prob.)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {delayAnalysis.suggested_action}
                  </p>

                  <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Analysis Factors:</span>
                    {delayAnalysis.contributing_factors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Timeline Log */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Tracking Activity History
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">{events.length} Updates</span>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {events.map((ev, idx) => (
                    <div key={ev.id} className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-l-transparent">
                      <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full ${
                        idx === 0 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'
                      }`} />
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ev.status.replace(/_/g, ' ')}</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ev.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-blue-600 text-[11px] font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {ev.location}
                        </p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};
