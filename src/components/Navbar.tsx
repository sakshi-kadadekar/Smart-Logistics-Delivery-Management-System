import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Truck,
  Package,
  Shield,
  Warehouse as WarehouseIcon,
  User as UserIcon,
  Search,
  ChevronDown,
  Home,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

const GOOGLE_FORM_FEEDBACK_URL = 'https://forms.gle/baCGAAzXAaKb98Yb6';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'tracking';
  setCurrentView: (view: 'landing' | 'dashboard' | 'tracking') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    setActiveTrackingId
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [quickTrackInput, setQuickTrackInput] = useState('');

  const handleRoleChange = (role: UserRole) => {
    const userForRole = users.find(u => u.role === role) || users[0];
    setCurrentUser(userForRole);
    setIsRoleDropdownOpen(false);
    if (currentView === 'landing') {
      setCurrentView('dashboard');
    }
  };

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackInput.trim()) {
      setActiveTrackingId(quickTrackInput.trim().toUpperCase());
      setCurrentView('tracking');
      setQuickTrackInput('');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100', icon: Shield };
      case 'driver':
        return { label: 'Driver Partner', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', icon: Truck };
      case 'warehouse':
        return { label: 'Hub Manager', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', icon: WarehouseIcon };
      default:
        return { label: 'Customer', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', icon: UserIcon };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);
  const CurrentIcon = currentBadge.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:bg-blue-700 transition-colors">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  SwiftShip
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                  System Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Logistics Command Center</p>
            </div>
          </button>

          {/* Nav pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTrackingId('DLV98273519');
                setCurrentView('tracking');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'tracking'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Live Tracking
            </button>
            <a
              href={GOOGLE_FORM_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 transition-all flex items-center gap-1 cursor-pointer"
              title="Submit Feedback or Operational Query"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Feedback</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </nav>
        </div>

        {/* Quick Search & AI Assistant & Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Quick Track Input */}
          <form onSubmit={handleQuickTrack} className="hidden lg:flex items-center relative">
            <input
              type="text"
              placeholder="Track ID (e.g. DLV982...)"
              value={quickTrackInput}
              onChange={(e) => setQuickTrackInput(e.target.value)}
              className="w-40 focus:w-56 transition-all bg-slate-100 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          </form>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${currentBadge.color}`}
            >
              <CurrentIcon className="w-3.5 h-3.5" />
              <div className="text-left hidden sm:block">
                <span className="block">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 uppercase tracking-wider font-bold">{currentBadge.label}</span>
              </div>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Switch Role Workspace</p>
                  <p className="text-xs text-slate-800 font-semibold truncate">{currentUser.name} ({currentUser.email})</p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleRoleChange('customer')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      currentUser.role === 'customer' ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">1. Customer</p>
                        <p className="text-[10px] text-slate-500">Book, pay & track shipments</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('driver')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      currentUser.role === 'driver' ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">2. Delivery Partner</p>
                        <p className="text-[10px] text-slate-500">Mobile-first route & POD</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('warehouse')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      currentUser.role === 'warehouse' ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                        <WarehouseIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">3. Warehouse Manager</p>
                        <p className="text-[10px] text-slate-500">QR Scan, Inbound & Manifests</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      currentUser.role === 'admin' ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">4. Admin Master</p>
                        <p className="text-[10px] text-slate-500">Control tower, pricing & analytics</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
