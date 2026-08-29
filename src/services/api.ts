import {
  Shipment,
  TrackingEvent,
  Driver,
  Vehicle,
  Warehouse,
  Complaint,
  Coupon,
  PricingConfig,
  AuditLog,
  DeliveryProof,
  Payment,
  DelayAnalysisResult
} from '../types';

/**
 * SwiftShip Client API Service
 * Connects frontend state seamlessly with backend Express REST API endpoints.
 */
class ApiService {
  private baseUrl = '';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[API] ${endpoint} request error:`, err);
      throw err;
    }
  }

  // Health
  public async getHealth() {
    return this.request<{ status: string; gemini_ai_ready: boolean }>('/api/health');
  }

  // Shipments
  public async getShipments(params?: { sender_id?: string; status?: string; driver_id?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.sender_id) query.append('sender_id', params.sender_id);
    if (params?.status) query.append('status', params.status);
    if (params?.driver_id) query.append('driver_id', params.driver_id);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: Shipment[] }>(`/api/shipments${queryString}`);
  }

  public async getShipment(idOrTracking: string) {
    return this.request<{
      success: boolean;
      data: Shipment & { events: TrackingEvent[]; proof?: DeliveryProof; payment?: Payment; driver?: Driver };
    }>(`/api/shipments/${encodeURIComponent(idOrTracking)}`);
  }

  public async createShipment(payload: {
    shipmentData: Partial<Shipment>;
    couponCode?: string;
    creatorUserId?: string;
    creatorUserName?: string;
  }) {
    return this.request<{ success: boolean; data: Shipment }>('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateShipmentStatus(
    id: string,
    payload: {
      status: string;
      location?: string;
      description?: string;
      proof?: Partial<DeliveryProof>;
      updatedByUserId?: string;
    }
  ) {
    return this.request<{ success: boolean; data: Shipment }>(`/api/shipments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  public async assignDriver(shipmentId: string, driverId: string) {
    return this.request<{ success: boolean; data: Shipment }>(`/api/shipments/${shipmentId}/assign-driver`, {
      method: 'PATCH',
      body: JSON.stringify({ driverId })
    });
  }

  public async assignWarehouse(shipmentId: string, warehouseId: string, bin: string) {
    return this.request<{ success: boolean; data: Shipment }>(`/api/shipments/${shipmentId}/assign-warehouse`, {
      method: 'PATCH',
      body: JSON.stringify({ warehouseId, bin })
    });
  }

  public async rateShipment(shipmentId: string, rating: number, feedback?: string) {
    return this.request<{ success: boolean; data: Shipment }>(`/api/shipments/${shipmentId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback })
    });
  }

  public async cancelShipment(shipmentId: string, reason?: string) {
    return this.request<{ success: boolean; data: Shipment }>(`/api/shipments/${shipmentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  public async testSheetLogging(payload?: {
    customerId?: string;
    customerName?: string;
    email?: string;
    trackingId?: string;
    activity?: string;
    previousStatus?: string;
    newStatus?: string;
    location?: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      payload: any;
      sheetResult: any;
    }>('/api/shipments/test-sheet-logging', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  }

  // Tracking
  public async getTracking(trackingNumber: string) {
    return this.request<{
      success: boolean;
      data: {
        shipment: Shipment;
        events: TrackingEvent[];
        proof?: DeliveryProof;
        driver?: Driver;
        warehouse?: Warehouse;
        current_coordinates: { lat: number; lng: number };
      };
    }>(`/api/tracking/${encodeURIComponent(trackingNumber)}`);
  }

  // Drivers
  public async getDrivers() {
    return this.request<{ success: boolean; data: Driver[] }>('/api/drivers');
  }

  public async updateDriverStatus(driverId: string, status: Driver['status']) {
    return this.request<{ success: boolean; data: Driver }>(`/api/drivers/${driverId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  public async updateDriverLocation(driverId: string, lat: number, lng: number) {
    return this.request<{ success: boolean; data: Driver }>(`/api/drivers/${driverId}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng })
    });
  }

  // Vehicles
  public async getVehicles() {
    return this.request<{ success: boolean; data: Vehicle[] }>('/api/drivers/vehicles/list');
  }

  public async addVehicle(vehicle: Omit<Vehicle, 'id'>) {
    return this.request<{ success: boolean; data: Vehicle }>('/api/drivers/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle)
    });
  }

  // Warehouses
  public async getWarehouses() {
    return this.request<{ success: boolean; data: Warehouse[] }>('/api/warehouses');
  }

  // Complaints
  public async getComplaints() {
    return this.request<{ success: boolean; data: Complaint[] }>('/api/complaints');
  }

  public async createComplaint(payload: {
    shipment_id?: string;
    user_id?: string;
    user_name?: string;
    user_email?: string;
    category: string;
    message: string;
  }) {
    return this.request<{ success: boolean; data: Complaint }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async resolveComplaint(id: string, resolution_note: string) {
    return this.request<{ success: boolean; data: Complaint }>(`/api/complaints/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution_note })
    });
  }

  // Pricing & Coupons
  public async getPricingConfig() {
    return this.request<{ success: boolean; data: PricingConfig }>('/api/pricing');
  }

  public async updatePricingConfig(config: Partial<PricingConfig>) {
    return this.request<{ success: boolean; data: PricingConfig }>('/api/pricing', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  public async calculatePrice(payload: {
    pickupCity: string;
    destinationCity: string;
    weightKg: number;
    dimensions: { length: number; width: number; height: number };
    deliveryType: string;
    couponCode?: string;
  }) {
    return this.request<{ success: boolean; data: any; coupon_applied: boolean }>('/api/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getCoupons() {
    return this.request<{ success: boolean; data: Coupon[] }>('/api/pricing/coupons');
  }

  public async createCoupon(coupon: Omit<Coupon, 'id' | 'usage_count'>) {
    return this.request<{ success: boolean; data: Coupon }>('/api/pricing/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    });
  }

  public async toggleCoupon(couponId: string) {
    return this.request<{ success: boolean; data: Coupon }>(`/api/pricing/coupons/${couponId}/toggle`, {
      method: 'PATCH'
    });
  }

  // Analytics
  public async getAnalyticsDashboard() {
    return this.request<{ success: boolean; data: any }>('/api/analytics/dashboard');
  }

  public async getAuditLogs() {
    return this.request<{ success: boolean; data: AuditLog[] }>('/api/analytics/audit-logs');
  }

  public async resetDemoDatabase() {
    return this.request<{ success: boolean; message: string }>('/api/analytics/reset-seed', {
      method: 'POST'
    });
  }

  // AI Grounded Features
  public async aiChat(payload: {
    message: string;
    shipmentContext?: any;
    userRole?: string;
    trackingNumber?: string;
  }) {
    return this.request<{ success: boolean; reply: string; source: string }>('/api/ai/support-chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async aiDelayAnalysis(payload: { shipment?: Shipment; trackingNumber?: string }) {
    return this.request<{ success: boolean; data: DelayAnalysisResult; source: string }>('/api/ai/delay-analysis', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async aiOptimizeRoute(payload: { driverLat?: number; driverLng?: number; driverId?: string }) {
    return this.request<{ success: boolean; data: any }>('/api/ai/optimize-route', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const api = new ApiService();
