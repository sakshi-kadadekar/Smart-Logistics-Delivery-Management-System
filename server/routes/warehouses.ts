import { Router, Request, Response } from 'express';
import { db } from '../db';

export const warehousesRouter = Router();

// GET /api/warehouses - List all regional hubs
warehousesRouter.get('/', (_req: Request, res: Response) => {
  try {
    const warehouses = db.getWarehouses();
    const shipments = db.getShipments();

    const enriched = warehouses.map(w => {
      const activeShipments = shipments.filter(s => s.warehouse_id === w.id && s.status !== 'DELIVERED' && s.status !== 'CANCELLED');
      return {
        ...w,
        active_packages_count: activeShipments.length,
        occupancy_rate_percent: Math.round((w.current_stored_units / w.capacity_units) * 100)
      };
    });

    res.json({
      success: true,
      data: enriched
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch warehouses' });
  }
});

// GET /api/warehouses/:id/inventory - Get shipments stored in a specific warehouse
warehousesRouter.get('/:id/inventory', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const warehouse = db.getWarehouseById(id);

    if (!warehouse) {
      return res.status(404).json({ success: false, error: 'Warehouse hub not found' });
    }

    const shipments = db.getShipments().filter(s => s.warehouse_id === id);

    res.json({
      success: true,
      warehouse,
      total_inventory: shipments.length,
      data: shipments
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch warehouse inventory' });
  }
});

// PATCH /api/warehouses/:id/capacity - Update stored units or capacity
warehousesRouter.patch('/:id/capacity', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { current_stored_units, capacity_units } = req.body;

    const warehouse = db.getWarehouseById(id);
    if (!warehouse) {
      return res.status(404).json({ success: false, error: 'Warehouse hub not found' });
    }

    const updates: any = {};
    if (current_stored_units !== undefined) updates.current_stored_units = Number(current_stored_units);
    if (capacity_units !== undefined) updates.capacity_units = Number(capacity_units);

    const updated = db.updateWarehouse(id, updates);

    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update warehouse capacity' });
  }
});
