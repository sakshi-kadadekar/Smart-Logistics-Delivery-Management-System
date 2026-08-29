import crypto from 'crypto';

export type ActivityPayload = {
  activityId: string;
  customerId: string;
  customerName: string;
  email: string;
  trackingId: string;      // shipment tracking number
  activity: string;        // e.g. "Shipment Created", "Package Picked Up"
  previousStatus: string;  // "" if this is the first event
  newStatus: string;       // e.g. "Pending", "In Transit", "Delivered"
  location?: string;       // e.g. "Mumbai", "Andheri Hub"
};

/**
 * Format internal status enum into human-friendly pipeline status
 */
export function mapStatusToDisplay(status?: string): string {
  if (!status) return '';
  switch (status.toUpperCase()) {
    case 'ORDER_CREATED':
    case 'PENDING':
      return 'Pending';
    case 'PICKUP_SCHEDULED':
      return 'Pickup Scheduled';
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      return 'In Transit';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
    case 'FAILED':
      return 'Cancelled';
    default:
      return status.replace(/_/g, ' ');
  }
}

/**
 * Derives descriptive activity title from status transition
 */
export function mapActivityName(status: string, customActivity?: string): string {
  if (customActivity && customActivity.trim()) return customActivity;
  switch (status.toUpperCase()) {
    case 'ORDER_CREATED':
      return 'Shipment Created';
    case 'PICKUP_SCHEDULED':
      return 'Pickup Scheduled';
    case 'PICKED_UP':
      return 'Package Picked Up';
    case 'IN_TRANSIT':
      return 'In Transit (Hub Transfer)';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Package Delivered';
    case 'CANCELLED':
      return 'Shipment Cancelled';
    default:
      return `Status: ${status.replace(/_/g, ' ')}`;
  }
}

/**
 * Sends an activity event to Google Sheets via Google Apps Script Web App.
 * This is a secondary, append-only human-readable log and will never block or break the main flow.
 */
export async function logActivity(data: ActivityPayload) {
  try {
    const sheetUrl = process.env.GOOGLE_SHEET_URL;
    if (!sheetUrl) {
      console.warn('[logActivity] Warning: GOOGLE_SHEET_URL is not set in environment.');
      return null;
    }

    const payload = {
      activityId: data.activityId || crypto.randomUUID(),
      customerId: data.customerId || 'usr_cust_1',
      customerName: data.customerName || 'Customer',
      email: data.email || 'customer@swiftship.in',
      trackingId: data.trackingId,
      activity: data.activity || 'Shipment Updated',
      previousStatus: data.previousStatus ?? '',
      newStatus: data.newStatus || 'Pending',
      location: data.location || 'Operations Center',
      timestamp: new Date().toISOString()
    };

    console.log(`[GoogleSheetLog] Sending event for ${payload.trackingId}: "${payload.activity}" (${payload.previousStatus || 'INIT'} -> ${payload.newStatus})`);

    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    return result;
  } catch (error) {
    // Never let a logging failure break the actual shipment flow —
    // log the error server-side and continue.
    console.error('[GoogleSheetLog] logActivity failed:', error);
    return null;
  }
}
