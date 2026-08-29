import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CustomerDashboard } from './components/CustomerDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { WarehouseDashboard } from './components/WarehouseDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TrackingView } from './components/TrackingView';
import { ComplaintModal } from './components/ComplaintModal';
import { RateDeliveryModal } from './components/RateDeliveryModal';

export function App() {
  const { currentUser, activeTrackingId, setActiveTrackingId } = useApp();

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'tracking'>('landing');
  const [complaintModalShipmentId, setComplaintModalShipmentId] = useState<string | undefined>(undefined);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [rateModalShipmentId, setRateModalShipmentId] = useState<string | undefined>(undefined);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const handleOpenTracking = (trackingNum: string) => {
    setActiveTrackingId(trackingNum);
    setCurrentView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenComplaintModal = (shipmentId: string) => {
    setComplaintModalShipmentId(shipmentId);
    setIsComplaintModalOpen(true);
  };

  const handleOpenRateModal = (shipmentId: string) => {
    setRateModalShipmentId(shipmentId);
    setIsRateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Universal Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigateToDashboard={() => setCurrentView('dashboard')}
            onNavigateToTracking={handleOpenTracking}
          />
        )}

        {currentView === 'tracking' && (
          <TrackingView
            initialTrackingId={activeTrackingId}
            onOpenComplaintModal={handleOpenComplaintModal}
          />
        )}

        {currentView === 'dashboard' && (
          <>
            {currentUser.role === 'customer' && (
              <CustomerDashboard
                onOpenTracking={handleOpenTracking}
                onOpenComplaintModal={handleOpenComplaintModal}
                onOpenRateModal={handleOpenRateModal}
              />
            )}

            {currentUser.role === 'driver' && (
              <DriverDashboard
                onOpenTracking={handleOpenTracking}
              />
            )}

            {currentUser.role === 'warehouse' && (
              <WarehouseDashboard />
            )}

            {currentUser.role === 'admin' && (
              <AdminDashboard />
            )}
          </>
        )}
      </main>

      {/* Support Complaint Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        shipmentId={complaintModalShipmentId}
      />

      {/* Rate Delivery Modal */}
      <RateDeliveryModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        shipmentId={rateModalShipmentId}
      />
    </div>
  );
}

export default App;
