import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateShippingPrice, CITY_COORDINATES } from '../utils/pricingEngine';
import { DeliveryType, UserRole } from '../types';
import {
  Truck,
  Package,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Calculator,
  Search,
  MapPin,
  Sparkles,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Users,
  Warehouse,
  MessageSquare,
  ExternalLink,
  HelpCircle,
  Send,
  Star
} from 'lucide-react';

const GOOGLE_FORM_FEEDBACK_URL = 'https://forms.gle/baCGAAzXAaKb98Yb6';

interface LandingPageProps {
  onNavigateToDashboard: (role?: UserRole) => void;
  onNavigateToTracking: (trackingNum: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToDashboard,
  onNavigateToTracking
}) => {
  const { setCurrentUser, users, setActiveTrackingId, pricingConfig } = useApp();

  const [trackInput, setTrackInput] = useState('');
  
  // Instant rate calculator states
  const [calcFrom, setCalcFrom] = useState('New Delhi');
  const [calcTo, setCalcTo] = useState('Mumbai');
  const [calcWeight, setCalcWeight] = useState(2);
  const [calcTier, setCalcTier] = useState<DeliveryType>('EXPRESS');
  
  const estimatedPrice = calculateShippingPrice({
    pickupCity: calcFrom,
    destinationCity: calcTo,
    weightKg: calcWeight,
    dimensions: { length: 25, width: 20, height: 10 },
    deliveryType: calcTier,
    config: pricingConfig
  });

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      setActiveTrackingId(trackInput.trim().toUpperCase());
      onNavigateToTracking(trackInput.trim().toUpperCase());
    }
  };

  const handleRoleQuickLaunch = (role: UserRole) => {
    const matched = users.find(u => u.role === role) || users[0];
    setCurrentUser(matched);
    onNavigateToDashboard(role);
  };

  const cityList = Object.keys(CITY_COORDINATES);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Next-Gen Smart Freight & Courier Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Ship smarter. <br />
            <span className="text-blue-600">
              Deliver faster.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            SwiftShip unifies automated dynamic dispatch, high-precision GPS route optimization, 
            warehouse scanning, and instant Razorpay settlements across 18,000+ PIN codes.
          </p>

          {/* Quick Tracking Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <form
              onSubmit={handleTrackSubmit}
              className="flex items-center gap-2 p-2 bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl shadow-sm transition-all"
            >
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Enter 11-digit Tracking ID (e.g. DLV98273519)"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                Track Live
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-2">
              <span>Try sample:</span>
              <button
                type="button"
                onClick={() => {
                  setTrackInput('DLV98273519');
                  setActiveTrackingId('DLV98273519');
                  onNavigateToTracking('DLV98273519');
                }}
                className="text-blue-600 hover:underline font-mono cursor-pointer"
              >
                DLV98273519 (Out for Delivery)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackInput('DLV10938472');
                  setActiveTrackingId('DLV10938472');
                  onNavigateToTracking('DLV10938472');
                }}
                className="text-emerald-700 hover:underline font-mono hidden sm:inline cursor-pointer"
              >
                DLV10938472 (Delivered)
              </button>
            </div>
          </div>
        </div>

        {/* 2. Stats Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">99.4%</span>
            <p className="text-xs text-slate-500 font-medium">On-Time SLA Delivery</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">2.5M+</span>
            <p className="text-xs text-slate-500 font-medium">Parcels Handled Monthly</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">18,500+</span>
            <p className="text-xs text-slate-500 font-medium">Indian PIN Codes Served</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">4.9 / 5</span>
            <p className="text-xs text-slate-500 font-medium">Driver & Customer Rating</p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Instant Shipping Rate Estimator Widget */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left side: Inputs */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Dynamic Shipping Price Engine</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Calculate Shipping Rates in Real-Time
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Transparent breakdown based on road distance, chargeable volumetric weight, and speed tier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Origin City
                  </label>
                  <select
                    value={calcFrom}
                    onChange={(e) => setCalcFrom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none"
                  >
                    {cityList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" /> Destination City
                  </label>
                  <select
                    value={calcTo}
                    onChange={(e) => setCalcTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none"
                  >
                    {cityList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Weight (kg)</label>
                    <span className="text-xs font-mono text-blue-600 font-bold">{calcWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={50}
                    step={0.5}
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Delivery Tier</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {(['STANDARD', 'EXPRESS', 'SAME_DAY'] as DeliveryType[]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setCalcTier(tier)}
                        className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          calcTier === tier
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tier.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Dynamic breakdown card */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Rate Breakdown</span>
                <span className="text-xs text-blue-700 font-mono font-medium">~{estimatedPrice.distance_km} km transit</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Booking Charge</span>
                  <span className="font-semibold text-slate-900">₹{estimatedPrice.base_charge}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Weight Charge ({calcWeight} kg @ ₹{pricingConfig.per_kg_charge}/kg)</span>
                  <span className="font-semibold text-slate-900">₹{estimatedPrice.weight_charge}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distance Charge ({estimatedPrice.distance_km} km)</span>
                  <span className="font-semibold text-slate-900">₹{estimatedPrice.distance_charge}</span>
                </div>
                {estimatedPrice.delivery_type_charge > 0 && (
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span>{calcTier} Speed Premium</span>
                    <span className="font-semibold">+₹{estimatedPrice.delivery_type_charge}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200">
                  <span>Subtotal</span>
                  <span>₹{estimatedPrice.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%)</span>
                  <span>₹{estimatedPrice.gst}</span>
                </div>
                <div className="flex justify-between text-slate-900 text-base font-bold pt-2 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span className="text-blue-600 font-extrabold">₹{estimatedPrice.total}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRoleQuickLaunch('customer')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Package className="w-4 h-4" />
                Book This Shipment Now
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Dedicated 4-Role Dashboard Access */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Built for Every Logistics Stakeholder
          </h2>
          <p className="text-sm text-slate-500">
            Switch between dedicated role views with simulated workflows, live telemetry, and access control.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. Customer */}
          <div
            onClick={() => handleRoleQuickLaunch('customer')}
            className="group p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">1. Customer Portal</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create new shipments, dynamic rate calculator, schedule pickups, online Razorpay payment, live GPS map tracking, and file complaints.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
              <span>Open Customer Desk</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Driver */}
          <div
            onClick={() => handleRoleQuickLaunch('driver')}
            className="group p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">2. Delivery Partner</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mobile-first driver workspace, multi-stop route sequencing, real-time status transitions, and digital Proof of Delivery with signature pad.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
              <span>Open Driver App</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Warehouse Manager */}
          <div
            onClick={() => handleRoleQuickLaunch('warehouse')}
            className="group p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-100">
                <Warehouse className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">3. Warehouse Hub</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Camera & Barcode QR scanning station, bin staging allocation, driver batch dispatching, and printable manifest generation.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:text-amber-800">
              <span>Open Warehouse Desk</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Admin */}
          <div
            onClick={() => handleRoleQuickLaunch('admin')}
            className="group p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-rose-300 rounded-xl transition-all cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform border border-rose-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">4. Admin Master</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Central control tower, Recharts analytics, user & fleet CRUD, dynamic pricing rule configurator, coupon manager, and audit logs.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-rose-700 group-hover:text-rose-800">
              <span>Open Control Tower</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. Dedicated Feedback & Query Section */}
      <section id="feedback-and-query" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-700">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 7 cols: Information & Benefits */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Feedback & Query Portal</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Share Your Experience &amp; Inquiries
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Have questions about our freight network, carrier onboarding, API integration, or consignment delivery SLAs? We actively review all submissions via our direct Google Feedback form.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-2.5">
                  <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Customer Satisfaction</h4>
                    <p className="text-[11px] text-slate-400">Rate your pickup, courier handling, and delivery punctuality.</p>
                  </div>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">General &amp; Bulk Queries</h4>
                    <p className="text-[11px] text-slate-400">Corporate accounts, route expansion, and warehouse logistics inquiries.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Direct CTA Card */}
            <div className="lg:col-span-5 bg-white rounded-xl p-6 text-slate-900 shadow-lg border border-slate-100 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Official Form</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Active
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  SwiftShip Feedback &amp; Query Form
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submit queries, report anomalies, or suggest platform enhancements directly to our operational command team.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={GOOGLE_FORM_FEEDBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-blue-500/25 cursor-pointer"
                >
                  <span>Open Google Feedback Form</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <p className="text-[10px] text-center text-slate-400">
                  Direct Link: <span className="font-mono text-slate-600">forms.gle/baCGAAzXAaKb98Yb6</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800">SwiftShip Logistics Engine</span>
            <span>—</span>
            <span>Ship smarter. Deliver faster.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={GOOGLE_FORM_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Feedback &amp; Query Form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <p>© 2026 SwiftShip Technologies Inc.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
