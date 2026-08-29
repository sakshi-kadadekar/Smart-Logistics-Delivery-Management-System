import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateShippingPrice, CITY_COORDINATES } from '../utils/pricingEngine';
import { DeliveryType, Shipment, Address, PackageDimensions } from '../types';
import { PaymentModal } from './PaymentModal';
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  ArrowRight,
  Search,
  MessageSquare,
  Star,
  XCircle,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface CustomerDashboardProps {
  onOpenTracking: (trackingNumber: string) => void;
  onOpenComplaintModal: (shipmentId: string) => void;
  onOpenRateModal: (shipmentId: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenTracking,
  onOpenComplaintModal,
  onOpenRateModal
}) => {
  const {
    currentUser,
    shipments,
    createShipment,
    cancelShipment,
    pricingConfig,
    coupons
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my_shipments' | 'create_shipment' | 'complaints'>('my_shipments');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Shipment Form States (4-Step Wizard)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Sender
  const [senderName, setSenderName] = useState(currentUser.name);
  const [senderPhone, setSenderPhone] = useState(currentUser.phone);
  const [senderAddress, setSenderAddress] = useState('Tower 4, Flat 1202, Cyber Heights');
  const [senderCity, setSenderCity] = useState('Gurugram');
  const [senderState, setSenderState] = useState('Haryana');
  const [senderPincode, setSenderPincode] = useState('122002');

  // Step 2: Receiver
  const [receiverName, setReceiverName] = useState('Rohan Mehra');
  const [receiverPhone, setReceiverPhone] = useState('+91 98231 44556');
  const [receiverAddress, setReceiverAddress] = useState('Flat 304, Green Palms Apt, Bandra West');
  const [receiverCity, setReceiverCity] = useState('Mumbai');
  const [receiverState, setReceiverState] = useState('Maharashtra');
  const [receiverPincode, setReceiverPincode] = useState('400050');

  // Step 3: Package & Tier
  const [packageType, setPackageType] = useState('Electronics / Gadgets');
  const [weightKg, setWeightKg] = useState(2.0);
  const [lengthCm, setLengthCm] = useState(30);
  const [widthCm, setWidthCm] = useState(22);
  const [heightCm, setHeightCm] = useState(10);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('EXPRESS');
  const [specialInstructions, setSpecialInstructions] = useState('Handle with care. Fragile items.');

  // Step 4: Schedule & Coupon
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupTimeSlot, setPickupTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');

  // Payment Modal Trigger
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCreatedTrackingNumber, setNewCreatedTrackingNumber] = useState('');

  const cityList = Object.keys(CITY_COORDINATES);

  // Filter shipments
  const myShipments = shipments.filter(s => s.sender_id === currentUser.id || s.sender_phone === currentUser.phone);
  const filteredShipments = myShipments.filter(s => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch =
      s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.receiver_address.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate live price breakdown
  const activeCoupon = coupons.find(c => c.code.toUpperCase() === appliedCouponCode.toUpperCase() && c.is_active);
  const priceBreakdown = calculateShippingPrice({
    pickupCity: senderCity,
    destinationCity: receiverCity,
    weightKg,
    dimensions: { length: lengthCm, width: widthCm, height: heightCm },
    deliveryType,
    coupon: activeCoupon,
    config: pricingConfig
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.is_active);
    if (found) {
      setAppliedCouponCode(found.code);
    } else {
      alert('Invalid or expired coupon code. Try SWIFT15 or FIRSTSHIP');
    }
  };

  const handleInitiateBooking = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    setIsSubmitting(true);

    try {
      const senderCoords = CITY_COORDINATES[senderCity] || { lat: 28.6139, lng: 77.2090 };
      const receiverCoords = CITY_COORDINATES[receiverCity] || { lat: 19.0760, lng: 72.8777 };

      const newShipment = await createShipment(
        {
          sender_name: senderName,
          sender_phone: senderPhone,
          sender_address: {
            id: `addr_${Date.now()}_s`,
            user_id: currentUser.id,
            name: senderName,
            phone: senderPhone,
            address_line: senderAddress,
            city: senderCity,
            state: senderState,
            pincode: senderPincode,
            lat: senderCoords.lat,
            lng: senderCoords.lng
          },
          receiver_name: receiverName,
          receiver_phone: receiverPhone,
          receiver_address: {
            id: `addr_${Date.now()}_r`,
            user_id: currentUser.id,
            name: receiverName,
            phone: receiverPhone,
            address_line: receiverAddress,
            city: receiverCity,
            state: receiverState,
            pincode: receiverPincode,
            lat: receiverCoords.lat,
            lng: receiverCoords.lng
          },
          package_type: packageType,
          weight_kg: weightKg,
          dimensions: { length: lengthCm, width: widthCm, height: heightCm },
          delivery_type: deliveryType,
          pickup_date: pickupDate,
          pickup_time_slot: pickupTimeSlot,
          special_instructions: specialInstructions
        },
        appliedCouponCode
      );

      setNewCreatedTrackingNumber(newShipment.tracking_number);
      setActiveTab('my_shipments');
      setStep(1);
    } catch (err) {
      console.error('Shipment creation failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner with Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Customer Portal</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Welcome back, {currentUser.name}</h1>
          <p className="text-xs text-slate-500">Manage your consignments, schedule automated pickups, and track packages.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my_shipments')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'my_shipments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Shipments ({myShipments.length})
          </button>
          <button
            onClick={() => setActiveTab('create_shipment')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'create_shipment'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            Create New Shipment
          </button>
        </div>
      </div>

      {/* Success banner if a new shipment was just created */}
      {newCreatedTrackingNumber && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Shipment Confirmed!</p>
              <p className="text-xs text-slate-600">
                Tracking ID <span className="font-mono text-emerald-700 font-bold">{newCreatedTrackingNumber}</span> has been dispatched for pickup scheduling.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenTracking(newCreatedTrackingNumber)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
          >
            Track Live <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab 1: My Shipments */}
      {activeTab === 'my_shipments' && (
        <div className="space-y-6">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {/* Status pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {['ALL', 'OUT_FOR_DELIVERY', 'IN_TRANSIT', 'PICKUP_SCHEDULED', 'DELIVERED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search shipments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Shipments List */}
          {filteredShipments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
              <Package className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No Shipments Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't booked any shipments under this filter yet. Ready to send a parcel?
              </p>
              <button
                onClick={() => setActiveTab('create_shipment')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Create First Shipment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredShipments.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm hover:shadow transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900">{s.tracking_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            s.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : s.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : s.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {s.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold border border-slate-200">
                            {s.delivery_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{s.package_type} • {s.weight_kg} kg</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-500 font-medium">Total Paid</span>
                      <p className="text-base font-extrabold text-slate-900">₹{s.price_breakdown?.total || 0}</p>
                    </div>
                  </div>

                  {/* Route points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">From: <strong className="text-slate-800">{s.sender_name}</strong></p>
                        <p className="text-slate-700 font-medium">{s.sender_address.city}, {s.sender_address.state}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">To: <strong className="text-slate-800">{s.receiver_name}</strong></p>
                        <p className="text-slate-700 font-medium">{s.receiver_address.city}, {s.receiver_address.state}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      Booked: {new Date(s.created_at).toLocaleDateString()} • ETA: {s.estimated_delivery_date}
                    </span>

                    <div className="flex items-center gap-2">
                      {s.status === 'DELIVERED' && !s.rating && (
                        <button
                          onClick={() => onOpenRateModal(s.id)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" /> Rate
                        </button>
                      )}
                      {s.rating && (
                        <span className="text-amber-600 flex items-center gap-1 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {s.rating}/5
                        </span>
                      )}
                      {s.status !== 'CANCELLED' && s.status !== 'DELIVERED' && (
                        <button
                          onClick={() => cancelShipment(s.id, 'Customer cancellation')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => onOpenComplaintModal(s.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Ticket
                      </button>
                      <button
                        onClick={() => onOpenTracking(s.tracking_number)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                      >
                        Track Live <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Create Shipment 4-Step Wizard */}
      {activeTab === 'create_shipment' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-8">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between max-w-xl mx-auto border-b border-slate-100 pb-6">
            {[
              { num: 1, label: 'Sender' },
              { num: 2, label: 'Receiver' },
              { num: 3, label: 'Package & Tier' },
              { num: 4, label: 'Schedule & Pay' }
            ].map((st) => (
              <div key={st.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === st.num
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : step > st.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step > st.num ? '✓' : st.num}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${step === st.num ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Sender Details */}
          {step === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 1: Sender / Pickup Information</h3>
                <p className="text-xs text-slate-500">Where should our delivery driver pick up the package?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Full Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Phone Number</label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / Landmark</label>
                  <input
                    type="text"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Origin City</label>
                  <select
                    value={senderCity}
                    onChange={(e) => setSenderCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    {cityList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={senderPincode}
                    onChange={(e) => setSenderPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  Continue to Receiver Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Receiver Details */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 2: Receiver / Destination Information</h3>
                <p className="text-xs text-slate-500">Who is receiving the shipment?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receiver Full Name</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receiver Phone Number</label>
                  <input
                    type="text"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Address / Landmark</label>
                  <input
                    type="text"
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination City</label>
                  <select
                    value={receiverCity}
                    onChange={(e) => setReceiverCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    {cityList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={receiverPincode}
                    onChange={(e) => setReceiverPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  Continue to Package Specs <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Package & Tier */}
          {step === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 3: Package Specifications & Speed Tier</h3>
                <p className="text-xs text-slate-500">Enter parcel dimensions and choose standard, express, or same-day.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Package Category</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Electronics / Gadgets">Electronics / Gadgets</option>
                    <option value="Documents / Certificates">Documents / Certificates</option>
                    <option value="Apparel & Fashion">Apparel & Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Industrial Spares">Industrial Spares</option>
                    <option value="Medicines / Pharma">Medicines / Pharma</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.5)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Length (cm)</label>
                    <input
                      type="number"
                      value={lengthCm}
                      onChange={(e) => setLengthCm(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Width (cm)</label>
                    <input
                      type="number"
                      value={widthCm}
                      onChange={(e) => setWidthCm(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Delivery Tier Options */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Select Delivery Tier</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { type: 'STANDARD', title: 'Standard Ground', time: '3 - 5 Days', desc: 'Cost-efficient multi-hop linehaul' },
                      { type: 'EXPRESS', title: 'Express Linehaul', time: '1 - 2 Days', desc: 'Air cargo priority sorting' },
                      { type: 'SAME_DAY', title: 'Same-Day Superfast', time: 'Within 8 Hours', desc: 'Dedicated direct point courier' }
                    ].map((tier) => (
                      <div
                        key={tier.type}
                        onClick={() => setDeliveryType(tier.type as DeliveryType)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                          deliveryType === tier.type
                            ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase text-blue-600">{tier.type}</span>
                        <h4 className="font-bold text-slate-900 text-xs">{tier.title}</h4>
                        <p className="text-[11px] text-emerald-600 font-semibold">{tier.time}</p>
                        <p className="text-[10px] text-slate-500">{tier.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Special Handling Instructions</label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Fragile glass, call before delivery"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  Review Cost & Schedule <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Schedule, Pricing Breakdown & Razorpay Checkout */}
          {step === 4 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 4: Pickup Schedule & Price Checkout</h3>
                <p className="text-xs text-slate-500">Choose your preferred pickup slot and finalize payment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Pickup Window
                  </label>
                  <select
                    value={pickupTimeSlot}
                    onChange={(e) => setPickupTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="09:00 AM - 12:00 PM">Morning (09:00 AM - 12:00 PM)</option>
                    <option value="12:00 PM - 03:00 PM">Afternoon (12:00 PM - 03:00 PM)</option>
                    <option value="03:00 PM - 06:00 PM">Evening (03:00 PM - 06:00 PM)</option>
                    <option value="06:00 PM - 09:00 PM">Late Express (06:00 PM - 09:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" /> Apply Discount Coupon
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (SWIFT15, FIRSTSHIP)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-1.5 text-xs text-slate-900 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </form>
                {appliedCouponCode && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    ✓ Coupon <span className="font-mono">{appliedCouponCode}</span> applied! Saved ₹{priceBreakdown.discount_amount}
                  </p>
                )}
              </div>

              {/* Dynamic Price Breakdown Box */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">Dynamic Cost Summary</span>
                  <span className="text-xs text-blue-700 font-mono font-medium">Distance: ~{priceBreakdown.distance_km} km</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Freight Charge</span>
                    <span className="font-semibold text-slate-900">₹{priceBreakdown.base_charge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight Rate ({weightKg} kg)</span>
                    <span className="font-semibold text-slate-900">₹{priceBreakdown.weight_charge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Road Distance Charge</span>
                    <span className="font-semibold text-slate-900">₹{priceBreakdown.distance_charge}</span>
                  </div>
                  {priceBreakdown.delivery_type_charge > 0 && (
                    <div className="flex justify-between text-blue-700">
                      <span>{deliveryType} Speed Charge</span>
                      <span className="font-semibold">+₹{priceBreakdown.delivery_type_charge}</span>
                    </div>
                  )}
                  {priceBreakdown.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promotional Discount</span>
                      <span>-₹{priceBreakdown.discount_amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200">
                    <span>Subtotal</span>
                    <span>₹{priceBreakdown.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (18%)</span>
                    <span>₹{priceBreakdown.gst}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 text-base font-bold pt-2 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span className="text-blue-600 font-extrabold text-lg">₹{priceBreakdown.total}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleInitiateBooking}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  Proceed to Razorpay Checkout (₹{priceBreakdown.total})
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Payment Overlay Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        priceBreakdown={priceBreakdown}
      />

    </div>
  );
};
