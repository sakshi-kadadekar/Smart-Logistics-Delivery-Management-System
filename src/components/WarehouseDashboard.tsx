import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Warehouse, Shipment } from '../types';
import {
  Warehouse as WarehouseIcon,
  QrCode,
  ScanLine,
  Truck,
  CheckCircle2,
  Package,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  Search,
  Users,
  Box,
  Layers
} from 'lucide-react';

export const WarehouseDashboard: React.FC = () => {
  const {
    warehouses,
    shipments,
    drivers,
    scanWarehousePackage,
    assignDriverToShipment
  } = useApp();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || 'wh_1');
  const [scanTrackingInput, setScanTrackingInput] = useState('');
  const [scanLocation, setScanLocation] = useState('Inbound Staging Bay A-4');
  const [scanFeedback, setScanFeedback] = useState<{ success: boolean; message: string; tracking?: string } | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);

  // Batch assignment states
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [targetDriverId, setTargetDriverId] = useState<string>(drivers[0]?.id || '');
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);

  const activeWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];
  const warehouseShipments = shipments.filter(s => s.warehouse_id === activeWarehouse?.id || !s.warehouse_id);

  const unassignedShipments = warehouseShipments.filter(s => !s.driver_id && s.status !== 'DELIVERED' && s.status !== 'CANCELLED');

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanTrackingInput.trim()) return;

    const trackingNum = scanTrackingInput.trim().toUpperCase();
    const result = await scanWarehousePackage(trackingNum, selectedWarehouseId, scanLocation);

    if (result) {
      setScanFeedback({
        success: true,
        message: `Package ${trackingNum} successfully scanned and staged at ${scanLocation}.`,
        tracking: trackingNum
      });
      setScanTrackingInput('');
    } else {
      setScanFeedback({
        success: false,
        message: `Tracking ID "${trackingNum}" not found in system manifest.`,
        tracking: trackingNum
      });
    }

    setTimeout(() => {
      setScanFeedback(null);
    }, 4000);
  };

  const handleSimulateCameraScan = () => {
    setIsSimulatingCamera(true);
    setTimeout(() => {
      setIsSimulatingCamera(false);
      const sample = warehouseShipments[0]?.tracking_number || 'DLV98273519';
      setScanTrackingInput(sample);
    }, 1200);
  };

  const handleToggleSelectShipment = (id: string) => {
    if (selectedShipmentIds.includes(id)) {
      setSelectedShipmentIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedShipmentIds(prev => [...prev, id]);
    }
  };

  const handleBatchAssign = async () => {
    if (selectedShipmentIds.length === 0 || !targetDriverId) return;

    for (const sid of selectedShipmentIds) {
      await assignDriverToShipment(sid, targetDriverId);
    }

    setSelectedShipmentIds([]);
    alert(`Successfully assigned ${selectedShipmentIds.length} packages to ${drivers.find(d => d.id === targetDriverId)?.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Hub Selector & Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <WarehouseIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Hub Management Desk</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{activeWarehouse?.name}</h1>
            <p className="text-xs text-slate-500">{activeWarehouse?.address} • Code: <strong className="text-slate-700 font-mono">{activeWarehouse?.code}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none font-semibold cursor-pointer"
          >
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.city})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsManifestModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Generate Dispatch Manifest
          </button>
        </div>
      </div>

      {/* 2. Warehouse Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Staged Packages</span>
          <p className="text-2xl font-extrabold text-slate-900">{warehouseShipments.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Awaiting Dispatch</span>
          <p className="text-2xl font-extrabold text-amber-600">{unassignedShipments.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Active Drivers Available</span>
          <p className="text-2xl font-extrabold text-emerald-600">{drivers.filter(d => d.status === 'AVAILABLE').length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Hub Capacity Utilization</span>
          <p className="text-2xl font-extrabold text-blue-600">{activeWarehouse ? Math.round((activeWarehouse.current_packages / activeWarehouse.capacity) * 100) : 65}%</p>
        </div>
      </div>

      {/* 3. Barcode / QR Scanning Station + Batch Dispatch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 5 Cols: Barcode Scanner Terminal */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Barcode / QR Scanning Terminal</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              Online Scanner Ready
            </span>
          </div>

          {/* Scanner Simulation Viewfinder */}
          <div className="relative h-44 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 overflow-hidden">
            {isSimulatingCamera ? (
              <div className="text-center space-y-2">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-blue-700 font-mono">Decoding 2D Barcode Data Matrix...</p>
              </div>
            ) : (
              <>
                {/* Laser scan line effect */}
                <div className="w-48 h-0.5 bg-blue-600 shadow-[0_0_8px_#2563eb] animate-pulse mb-3"></div>
                <QrCode className="w-12 h-12 text-slate-400" />
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  Point handheld laser or click to trigger camera scanner
                </p>
              </>
            )}
            
            <button
              type="button"
              onClick={handleSimulateCameraScan}
              className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-[10px] text-slate-700 font-semibold border border-slate-200 shadow-xs cursor-pointer"
            >
              Simulate Scan Beep
            </button>
          </div>

          {/* Scan Input Form */}
          <form onSubmit={handleScanSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Number / Barcode</label>
              <input
                type="text"
                placeholder="Scan or enter e.g. DLV98273519"
                value={scanTrackingInput}
                onChange={(e) => setScanTrackingInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hub Staging Bin / Chute</label>
              <select
                value={scanLocation}
                onChange={(e) => setScanLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="Inbound Staging Bay A-4">Inbound Staging Bay A-4</option>
                <option value="Linehaul Sort Rack B-12">Linehaul Sort Rack B-12</option>
                <option value="Last-Mile Chute 03">Last-Mile Chute 03</option>
                <option value="Outbound Loading Dock 2">Outbound Loading Dock 2</option>
                <option value="High-Value Secure Locker">High-Value Secure Locker</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Confirm Scan & Update Package Location
            </button>
          </form>

          {/* Feedback alert */}
          {scanFeedback && (
            <div className={`p-3 rounded-lg border text-xs font-semibold animate-in fade-in flex items-center gap-2 ${
              scanFeedback.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {scanFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Package className="w-4 h-4 text-rose-600" />}
              <span>{scanFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Right 7 Cols: Batch Driver Dispatch & Packages Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hub Dispatch & Driver Assignment</h3>
              <p className="text-xs text-slate-500">Select unassigned packages and dispatch in batches to active drivers.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={targetDriverId}
                onChange={(e) => setTargetDriverId(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-900 cursor-pointer"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status})
                  </option>
                ))}
              </select>

              <button
                onClick={handleBatchAssign}
                disabled={selectedShipmentIds.length === 0}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                Assign ({selectedShipmentIds.length})
              </button>
            </div>
          </div>

          {/* Packages Checklist */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {warehouseShipments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No packages currently assigned to this hub.</p>
            ) : (
              warehouseShipments.map((s) => {
                const isSelected = selectedShipmentIds.includes(s.id);
                const assignedDrv = drivers.find(d => d.id === s.driver_id);

                return (
                  <div
                    key={s.id}
                    onClick={() => handleToggleSelectShipment(s.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded accent-blue-600 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{s.tracking_number}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                            {s.delivery_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {s.receiver_name} • {s.receiver_address.city} • {s.weight_kg} kg
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {assignedDrv ? (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Truck className="w-3 h-3" /> {assignedDrv.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                          Unassigned
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-400">{s.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 4. Manifest Generator Modal */}
      {isManifestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Hub Dispatch Manifest #MNF-2026-0883</h3>
              </div>
              <button
                onClick={() => setIsManifestModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Printable Manifest Preview */}
            <div className="p-5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">SwiftShip Logistics Hub Manifest</h4>
                  <p className="text-[11px] text-slate-600">Origin Hub: {activeWarehouse?.name} ({activeWarehouse?.code})</p>
                  <p className="text-[11px] text-slate-600">Generated: {new Date().toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded p-1">
                    <QrCode className="w-12 h-12" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">MNF-2026-0883</span>
                </div>
              </div>

              <div>
                <p className="font-bold mb-1">Itemized Consignment List ({warehouseShipments.length} packages):</p>
                <table className="w-full text-[11px] border border-slate-200 bg-white">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="p-1.5 text-left">Tracking ID</th>
                      <th className="p-1.5 text-left">Recipient</th>
                      <th className="p-1.5 text-left">City / PIN</th>
                      <th className="p-1.5 text-left">Weight</th>
                      <th className="p-1.5 text-left">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseShipments.slice(0, 8).map(s => (
                      <tr key={s.id} className="border-b border-slate-100">
                        <td className="p-1.5 font-mono font-bold">{s.tracking_number}</td>
                        <td className="p-1.5">{s.receiver_name}</td>
                        <td className="p-1.5">{s.receiver_address.city} - {s.receiver_address.pincode}</td>
                        <td className="p-1.5">{s.weight_kg} kg</td>
                        <td className="p-1.5 font-semibold">{s.delivery_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-[10px] text-slate-600">
                <div>
                  <p>Dispatcher Signature: __________________</p>
                  <p className="mt-1">Staff ID: EMP-WH-4921</p>
                </div>
                <div className="text-right">
                  <p>Vehicle Driver Signature: __________________</p>
                  <p className="mt-1">Vehicle Plate: HR-26-DL-8821</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  alert('Manifest PDF exported and sent to network thermal printer.');
                  setIsManifestModalOpen(false);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print & Download PDF Manifest
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
