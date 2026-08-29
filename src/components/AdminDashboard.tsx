import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DATASET_LOGISTICS_INSIGHTS } from '../data/mockDatabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  Shield,
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  Users,
  Warehouse,
  Tag,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Edit2,
  FileText,
  Database,
  CloudRain,
  Compass,
  Zap,
  Activity,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    shipments,
    users,
    drivers,
    warehouses,
    vehicles,
    pricingConfig,
    updatePricingConfig,
    coupons,
    addCoupon,
    complaints,
    resolveComplaint
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'dataset' | 'shipments' | 'pricing' | 'coupons' | 'fleet' | 'complaints'>('dataset');
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentFilterStatus, setShipmentFilterStatus] = useState('ALL');
  const [shipmentFilterPartner, setShipmentFilterPartner] = useState('ALL');

  // Pricing tuning state
  const [tempPricing, setTempPricing] = useState({ ...pricingConfig });
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponMax, setNewCouponMax] = useState(250);

  // Complaints state
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [complaintResolutionText, setComplaintResolutionText] = useState('Issue investigated with regional sorting hub. Priority delivery dispatched.');

  // Calculate high-level KPIs
  const totalRevenue = shipments.reduce((acc, s) => acc + (s.price_breakdown?.total || 0), 0);
  const deliveredCount = shipments.filter(s => s.status === 'DELIVERED').length;
  const inTransitCount = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY').length;
  const onTimePercentage = 99.4;

  // Chart data 1: Volume by Status
  const statusCounts = shipments.reduce((acc: Record<string, number>, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const statusPieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#0284c7', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  // Chart data 2: Daily Volume Trend
  const weeklyTrends = [
    { day: 'Mon', shipments: 45, revenue: 18400 },
    { day: 'Tue', shipments: 62, revenue: 24800 },
    { day: 'Wed', shipments: 78, revenue: 31200 },
    { day: 'Thu', shipments: 70, revenue: 28500 },
    { day: 'Fri', shipments: 92, revenue: 39100 },
    { day: 'Sat', shipments: 85, revenue: 34200 },
    { day: 'Sun', shipments: 54, revenue: 21600 }
  ];

  const handleSavePricing = () => {
    updatePricingConfig(tempPricing);
    alert('Pricing Engine rules updated across all real-time client calculators.');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    addCoupon({
      id: 'coup_' + Date.now(),
      code: newCouponCode.trim().toUpperCase(),
      discount_type: 'PERCENTAGE',
      value: newCouponDiscount,
      min_order_amount: 300,
      max_discount: newCouponMax,
      expiry_date: '2026-12-31',
      usage_count: 0,
      is_active: true
    });

    setNewCouponCode('');
    alert(`Coupon ${newCouponCode.toUpperCase()} activated successfully!`);
  };

  const filteredShipments = shipments.filter(s => {
    const matchesStatus = shipmentFilterStatus === 'ALL' || s.status === shipmentFilterStatus;
    const matchesPartner = shipmentFilterPartner === 'ALL' || (s.delivery_partner && s.delivery_partner.toLowerCase() === shipmentFilterPartner.toLowerCase());
    const matchesSearch =
      s.tracking_number.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.receiver_name.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.sender_name.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      (s.delivery_partner && s.delivery_partner.toLowerCase().includes(shipmentSearch.toLowerCase())) ||
      (s.package_type && s.package_type.toLowerCase().includes(shipmentSearch.toLowerCase()));
    return matchesStatus && matchesPartner && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header & Navigation Pills */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Control Tower</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">Master Admin</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Platform Operations Command</h1>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          {[
            { id: 'dataset', label: 'Dataset Insights (25k)' },
            { id: 'analytics', label: 'Live Analytics' },
            { id: 'shipments', label: 'Consignments' },
            { id: 'pricing', label: 'Pricing Engine' },
            { id: 'coupons', label: 'Coupons' },
            { id: 'fleet', label: 'Fleet & Hubs' },
            { id: 'complaints', label: `Support Tickets (${complaints.filter(c => c.status === 'OPEN').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeAdminTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Mean Dataset Freight Cost
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">₹{DATASET_LOGISTICS_INSIGHTS.metrics.mean_delivery_cost_inr}</p>
          <span className="text-[11px] text-slate-400">Min ₹95.67 • Max ₹1632.72</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-blue-600" /> Grounded Records
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">25,000</p>
          <span className="text-[11px] text-slate-400">9 Top Indian Partners</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Avg Delivery Rating
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">{DATASET_LOGISTICS_INSIGHTS.metrics.mean_delivery_rating} / 5.0</p>
          <span className="text-[11px] text-slate-400">Across All 5 Regions</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Successful Delivery Rate
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">73.3%</p>
          <span className="text-[11px] text-slate-400">18,331 Completed</span>
        </div>
      </div>

      {/* 3. Tab: 25k Dataset Insights & Multi-Partner Benchmarks */}
      {activeAdminTab === 'dataset' && (
        <div className="space-y-8">
          
          {/* Top Banner introducing dataset */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">Active Integration</span>
                <span className="text-xs font-semibold text-blue-900">Delivery Logistics Dataset (India, Multi-Partner)</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Multi-Carrier Freight Performance & Risk Telemetry</h2>
              <p className="text-xs text-slate-600 max-w-3xl">
                Benchmarking 25,000 real deliveries across 9 logistics providers, 5 Indian regions, 6 weather patterns, 9 package classifications, and 6 vehicle modal variants.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-blue-200 font-bold text-blue-700 shadow-2xs">
                Distance ↔ Cost Corr: +0.991
              </span>
            </div>
          </div>

          {/* Grid 1: Delivery Partner Market Share & On-Time Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Top 9 Delivery Partners (Volume & On-Time SLA)</h3>
                  <p className="text-xs text-slate-500">Order count and SLA completion percentage by carrier</p>
                </div>
                <span className="text-xs text-slate-500">25,000 Total Consignments</span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DATASET_LOGISTICS_INSIGHTS.partner_market_share}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="partner" stroke="#64748b" fontSize={11} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Orders Count" />
                    <Bar dataKey="onTimeRate" fill="#10b981" radius={[4, 4, 0, 0]} name="On-Time Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Pie Chart */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delivery Status Distribution</h3>
                <p className="text-xs text-slate-500">73.3% Delivered • 21.4% Delayed • 5.3% Failed</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DATASET_LOGISTICS_INSIGHTS.status_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {DATASET_LOGISTICS_INSIGHTS.status_distribution.map((entry, index) => (
                        <Cell key={`status-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {DATASET_LOGISTICS_INSIGHTS.status_distribution.map(item => (
                  <div key={item.name} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.count.toLocaleString('en-IN')} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid 2: Weather Delay Risk & Regional Volume */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Weather Impact */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-600" />
                    Weather Condition Impact on Delivery Delays
                  </h3>
                  <p className="text-xs text-slate-500">Delay likelihood and extra transit time in Indian climate zones</p>
                </div>
              </div>

              <div className="space-y-3">
                {DATASET_LOGISTICS_INSIGHTS.weather_delay_impact.map(w => (
                  <div key={w.weather} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">{w.weather} Weather</span>
                      <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {w.delayRate}% Delay Risk
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          w.delayRate > 30 ? 'bg-rose-500' : w.delayRate > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${w.delayRate * 2.5}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Historical Records: {w.count.toLocaleString('en-IN')}</span>
                      <span>Avg Delay: +{w.avgExtraHours} Hours</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Indian Volume & Fleet Distribution */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  Regional Logistics Hub Throughput & Mean Cost
                </h3>
                <p className="text-xs text-slate-500">Breakdown across 5 major geographical corridors</p>
              </div>

              <div className="space-y-3">
                {DATASET_LOGISTICS_INSIGHTS.regional_volume.map(reg => (
                  <div key={reg.region} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{reg.region}</p>
                      <p className="text-slate-500 text-[11px]">{reg.count.toLocaleString('en-IN')} Shipments ({reg.percentage}%)</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">₹{reg.avgCost}</span>
                      <span className="block text-[10px] text-slate-500">Avg Cost / Order</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Vehicle Modal Distribution (EV vs Conventional)
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {DATASET_LOGISTICS_INSIGHTS.vehicle_fleet_distribution.map(v => (
                    <div key={v.type} className={`p-2.5 rounded-lg border ${v.ecoFriendly ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`font-bold block ${v.ecoFriendly ? 'text-emerald-700' : 'text-slate-800'}`}>{v.type}</span>
                      <span className="text-[11px] text-slate-500">{v.count.toLocaleString('en-IN')} ({v.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Package Classification Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              9 Package Types & Average Cargo Weight Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3 text-xs">
              {DATASET_LOGISTICS_INSIGHTS.package_type_distribution.map(p => (
                <div key={p.type} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="font-bold text-slate-900 block capitalize">{p.type}</span>
                  <span className="text-blue-600 font-mono font-bold text-[11px]">{p.count} units</span>
                  <span className="text-slate-500 block text-[10px]">Avg {p.avgWeightKg} kg</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. Tab: Live Analytics & Recharts */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Weekly Revenue & Shipment Trend */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Weekly Revenue & Volume Trajectory</h3>
                  <p className="text-xs text-slate-500">Consolidated freight throughput across all hubs</p>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  +18.4% WoW
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Breakdown Pie */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Live Consignment Status Mix</h3>
                <p className="text-xs text-slate-500">Active real-time operational breakdown</p>
              </div>

              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-2 justify-center text-[10px]">
                {statusPieData.map((entry, index) => (
                  <span key={entry.name} className="flex items-center gap-1 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Driver Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Driver Partner Performance Fleet Leaderboard</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {drivers.map((drv, idx) => (
                <div key={drv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-100">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{drv.name}</p>
                      <p className="text-slate-500 text-[11px]">{drv.current_city} • Lic: {drv.license_number}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-amber-600 font-bold">★ {drv.rating}</span>
                    <span className={`block text-[10px] uppercase font-bold ${
                      drv.status === 'ONLINE' ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {drv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab: Shipments Master Table */}
      {activeAdminTab === 'shipments' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Consignments Master Directory</h3>
              <p className="text-xs text-slate-500">Inspect, filter by partner carrier, and audit all active & completed shipments.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={shipmentFilterPartner}
                onChange={(e) => setShipmentFilterPartner(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 cursor-pointer focus:bg-white focus:border-blue-500"
              >
                <option value="ALL">All Partners</option>
                <option value="delhivery">Delhivery</option>
                <option value="xpressbees">Xpressbees</option>
                <option value="shadowfax">Shadowfax</option>
                <option value="dhl">DHL</option>
                <option value="blue dart">Blue Dart</option>
                <option value="ekart">Ekart</option>
                <option value="fedex">FedEx</option>
                <option value="ecom express">Ecom Express</option>
                <option value="amazon logistics">Amazon Logistics</option>
              </select>

              <select
                value={shipmentFilterStatus}
                onChange={(e) => setShipmentFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 cursor-pointer focus:bg-white focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ORDER_CREATED">Order Created</option>
                <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tracking, city, package type..."
                  value={shipmentSearch}
                  onChange={(e) => setShipmentSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Tracking ID</th>
                  <th className="p-3">Partner & Mode</th>
                  <th className="p-3">Sender → Receiver</th>
                  <th className="p-3">Package & Weight</th>
                  <th className="p-3">Weather & Region</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-600">{s.tracking_number}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 uppercase block">{s.delivery_partner || 'SwiftShip'}</span>
                      <span className="text-[10px] text-slate-500 capitalize">{s.delivery_mode || s.delivery_type} • {s.vehicle_type || 'van'}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800 block">{s.sender_name} → {s.receiver_name}</span>
                      <span className="text-slate-500 text-[10px]">{s.sender_address.city} to {s.receiver_address.city} ({s.price_breakdown?.distance_km || s.distance_km || 150} km)</span>
                    </td>
                    <td className="p-3 text-slate-700 capitalize">
                      <span className="font-semibold block">{s.package_type}</span>
                      <span className="text-slate-500 text-[10px]">{s.weight_kg || s.package_weight_kg} kg</span>
                    </td>
                    <td className="p-3">
                      <span className="capitalize block font-medium text-slate-800">{s.weather_condition || 'Clear'}</span>
                      <span className="text-slate-500 text-[10px] uppercase">{s.region || 'North'} Region</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        s.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : s.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      }`}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">₹{s.price_breakdown?.total || s.delivery_cost || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab: Dynamic Pricing Engine Tuning */}
      {activeAdminTab === 'pricing' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
              <Sliders className="w-3.5 h-3.5" /> Pricing Engine Rules
            </div>
            <h3 className="text-xl font-bold text-slate-900">Dynamic Cost Calculation Parameters</h3>
            <p className="text-xs text-slate-500">
              Adjust base booking fees, per-kg rates, distance multipliers, and delivery speed surcharges calibrated with the 25,000 Delivery Logistics dataset.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-semibold text-slate-700">Base Booking Fee (₹)</label>
              <input
                type="number"
                value={tempPricing.base_charge}
                onChange={(e) => setTempPricing(prev => ({ ...prev, base_charge: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-semibold text-slate-700">Per-Kilogram Rate (₹/kg)</label>
              <input
                type="number"
                value={tempPricing.per_kg_charge}
                onChange={(e) => setTempPricing(prev => ({ ...prev, per_kg_charge: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-semibold text-slate-700">Per-Kilometer Distance Rate (₹/km)</label>
              <input
                type="number"
                step={0.05}
                value={tempPricing.per_km_charge}
                onChange={(e) => setTempPricing(prev => ({ ...prev, per_km_charge: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-semibold text-slate-700">Express Tier Multiplier</label>
              <input
                type="number"
                step={0.1}
                value={tempPricing.express_multiplier}
                onChange={(e) => setTempPricing(prev => ({ ...prev, express_multiplier: parseFloat(e.target.value) || 1 }))}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-semibold text-slate-700">Same-Day Tier Multiplier</label>
              <input
                type="number"
                step={0.1}
                value={tempPricing.same_day_multiplier}
                onChange={(e) => setTempPricing(prev => ({ ...prev, same_day_multiplier: parseFloat(e.target.value) || 1 }))}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-semibold text-slate-700">Statutory GST Rate (%)</label>
              <input
                type="number"
                value={tempPricing.gst_rate * 100}
                onChange={(e) => setTempPricing(prev => ({ ...prev, gst_rate: (parseFloat(e.target.value) || 0) / 100 }))}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePricing}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Save & Apply Dynamic Pricing Rules
            </button>
          </div>
        </div>
      )}

      {/* 7. Tab: Coupons & Promos */}
      {activeAdminTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Coupon */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Create Promotional Coupon
            </h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g. DIWALI20"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(parseInt(e.target.value) || 10)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={newCouponMax}
                    onChange={(e) => setNewCouponMax(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-all cursor-pointer"
              >
                Publish Promo Code
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Active Platform Coupons</h3>
            <div className="space-y-3">
              {coupons.map(c => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-blue-600 text-sm">{c.code}</span>
                    <p className="text-slate-500">{c.value}% OFF (Max ₹{c.max_discount || 250})</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. Tab: Fleet & Hubs */}
      {activeAdminTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warehouses */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-blue-600" />
              Regional Warehouses & Sort Hubs
            </h3>
            <div className="space-y-3">
              {warehouses.map(w => (
                <div key={w.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{w.name}</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-800 font-semibold">{w.code}</span>
                  </div>
                  <p className="text-slate-500">{w.address}, {w.city}, {w.state}</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                    <span>Capacity: {w.current_stored_units.toLocaleString('en-IN')} / {w.capacity_units.toLocaleString('en-IN')} Units</span>
                    <span className="text-blue-600 font-semibold">{Math.round((w.current_stored_units / w.capacity_units) * 100)}% Full</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet Vehicles */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Dedicated Fleet Vehicles
            </h3>
            <div className="space-y-3">
              {vehicles.map(v => (
                <div key={v.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{v.model}</span>
                    <span className="font-mono font-bold text-blue-600">{v.vehicle_number}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Payload: {v.capacity_kg} kg</span>
                    <span className={`font-bold ${v.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. Tab: Support Tickets & Complaints */}
      {activeAdminTab === 'complaints' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Customer Support Escalation Tickets</h3>
          <div className="space-y-3">
            {complaints.map(comp => (
              <div key={comp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-blue-600">Ticket #{comp.id.substring(0, 8)}</span>
                    <span className="mx-2 text-slate-400">•</span>
                    <span className="text-slate-800 font-semibold">{comp.category}</span>
                    <span className="mx-2 text-slate-400">•</span>
                    <span className="text-slate-500 font-mono">{comp.tracking_number}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comp.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {comp.status}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">{comp.message}</p>

                {comp.status !== 'RESOLVED' ? (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={complaintResolutionText}
                      onChange={(e) => setComplaintResolutionText(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                    />
                    <button
                      onClick={() => resolveComplaint(comp.id, complaintResolutionText)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                    >
                      Resolve Ticket
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    <strong>Resolution:</strong> {comp.resolution_note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
