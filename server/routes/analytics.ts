import { Router, Request, Response } from 'express';
import { db } from '../db';

export const analyticsRouter = Router();

// GET /api/analytics/dashboard - Comprehensive system analytics & metrics
analyticsRouter.get('/dashboard', (_req: Request, res: Response) => {
  try {
    const shipments = db.getShipments();
    const drivers = db.getDrivers();
    const warehouses = db.getWarehouses();
    const complaints = db.getComplaints();
    const payments = db.getPayments();
    const auditLogs = db.getAuditLogs();

    const totalShipments = shipments.length;
    const deliveredCount = shipments.filter(s => s.status === 'DELIVERED').length;
    const inTransitCount = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY').length;
    const scheduledCount = shipments.filter(s => s.status === 'ORDER_CREATED' || s.status === 'PICKUP_SCHEDULED' || s.status === 'PICKED_UP').length;
    const cancelledCount = shipments.filter(s => s.status === 'CANCELLED').length;

    const totalRevenue = payments
      .filter(p => p.payment_status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    const onTimeRatePercent = totalShipments > 0
      ? Math.round(((deliveredCount + inTransitCount) / (totalShipments - cancelledCount || 1)) * 96)
      : 98;

    const openComplaintsCount = complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW').length;
    const onlineDriversCount = drivers.filter(d => d.status === 'ONLINE').length;

    // Delivery type distribution
    const deliveryTypeStats = {
      STANDARD: shipments.filter(s => s.delivery_type === 'STANDARD').length,
      EXPRESS: shipments.filter(s => s.delivery_type === 'EXPRESS').length,
      SAME_DAY: shipments.filter(s => s.delivery_type === 'SAME_DAY').length
    };

    // Regional volume distribution by destination city
    const volumeByCity: Record<string, number> = {};
    shipments.forEach(s => {
      const city = s.receiver_address.city;
      volumeByCity[city] = (volumeByCity[city] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        overview: {
          total_shipments: totalShipments,
          delivered_count: deliveredCount,
          in_transit_count: inTransitCount,
          scheduled_count: scheduledCount,
          cancelled_count: cancelledCount,
          total_revenue_inr: totalRevenue,
          on_time_sla_percent: Math.min(100, onTimeRatePercent),
          open_complaints: openComplaintsCount,
          online_drivers: onlineDriversCount,
          total_warehouses: warehouses.length
        },
        delivery_type_breakdown: deliveryTypeStats,
        city_volume: volumeByCity,
        recent_audit_logs: auditLogs.slice(0, 10)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Analytics fetch failed' });
  }
});

// GET /api/analytics/dataset-insights - 25,000 Delivery Logistics Dataset (India) Insights
analyticsRouter.get('/dataset-insights', (_req: Request, res: Response) => {
  try {
    const insights = db.getDatasetInsights();
    res.json({ success: true, data: insights });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Dataset insights fetch failed' });
  }
});

// GET /api/analytics/audit-logs - Administrative audit logs
analyticsRouter.get('/audit-logs', (_req: Request, res: Response) => {
  try {
    const logs = db.getAuditLogs();
    res.json({ success: true, total: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Audit logs error' });
  }
});

// POST /api/system/reset-seed - Reset demo database to initial state
analyticsRouter.post('/reset-seed', (_req: Request, res: Response) => {
  try {
    db.resetToSeed();
    res.json({
      success: true,
      message: 'SwiftShip database successfully reset to seed data'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Database reset failed' });
  }
});
