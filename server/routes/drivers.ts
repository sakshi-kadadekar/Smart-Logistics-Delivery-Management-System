import { Router, Request, Response } from 'express';
import { db } from '../db';
import { Vehicle } from '../../src/types';

export const driversRouter = Router();

// GET /api/drivers - List all fleet delivery partners
driversRouter.get('/', (_req: Request, res: Response) => {
  try {
    const drivers = db.getDrivers();
    const vehicles = db.getVehicles();

    const enriched = drivers.map(d => {
      const vehicle = vehicles.find(v => v.id === d.vehicle_id || v.driver_id === d.id);
      return {
        ...d,
        vehicle
      };
    });

    res.json({
      success: true,
      data: enriched
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch drivers' });
  }
});

// PATCH /api/drivers/:id/status - Toggle driver status (ONLINE, OFFLINE, BUSY)
driversRouter.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const driver = db.getDriverById(id);
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    const updated = db.updateDriver(id, { status });
    res.json({
      success: true,
      message: `Driver status changed to ${status}`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update driver status' });
  }
});

// PATCH /api/drivers/:id/location - Update live GPS coordinates
driversRouter.patch('/:id/location', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, error: 'lat and lng are required' });
    }

    const driver = db.getDriverById(id);
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    const updated = db.updateDriver(id, {
      current_lat: Number(lat),
      current_lng: Number(lng)
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update driver GPS location' });
  }
});

// GET /api/drivers/vehicles - List all vehicles
driversRouter.get('/vehicles/list', (_req: Request, res: Response) => {
  try {
    const vehicles = db.getVehicles();
    res.json({ success: true, data: vehicles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch vehicles' });
  }
});

// POST /api/drivers/vehicles - Add new vehicle to fleet
driversRouter.post('/vehicles', (req: Request, res: Response) => {
  try {
    const { vehicle_number, vehicle_type, capacity_kg, model, driver_id, status } = req.body;

    if (!vehicle_number || !vehicle_type || !capacity_kg || !model) {
      return res.status(400).json({ success: false, error: 'Missing required vehicle fields' });
    }

    const newVehicle: Vehicle = {
      id: `veh_${Date.now()}`,
      vehicle_number,
      vehicle_type,
      capacity_kg: Number(capacity_kg),
      model,
      driver_id,
      status: status || 'ACTIVE'
    };

    db.addVehicle(newVehicle);

    res.status(201).json({
      success: true,
      message: 'Vehicle added to fleet',
      data: newVehicle
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to add vehicle' });
  }
});
