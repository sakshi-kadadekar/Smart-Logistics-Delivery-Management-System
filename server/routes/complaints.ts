import { Router, Request, Response } from 'express';
import { db } from '../db';
import { Complaint, AuditLog } from '../../src/types';

export const complaintsRouter = Router();

// GET /api/complaints - List all support complaints
complaintsRouter.get('/', (req: Request, res: Response) => {
  try {
    let list = db.getComplaints();
    const { user_id, status } = req.query;

    if (user_id && typeof user_id === 'string') {
      list = list.filter(c => c.user_id === user_id);
    }
    if (status && typeof status === 'string') {
      list = list.filter(c => c.status === status);
    }

    res.json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch complaints' });
  }
});

// POST /api/complaints - Raise a new support ticket
complaintsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { shipment_id, user_id, user_name, user_email, category, message } = req.body;

    if (!category || !message) {
      return res.status(400).json({ success: false, error: 'Category and message are required' });
    }

    const shipment = shipment_id ? db.getShipmentById(shipment_id) : undefined;
    const user = user_id ? db.getUserById(user_id) : undefined;

    const newComplaint: Complaint = {
      id: `cmp_${Date.now()}`,
      shipment_id: shipment_id || '',
      user_id: user_id || user?.id || 'usr_cust_1',
      user_name: user_name || user?.name || 'Customer',
      user_email: user_email || user?.email || 'customer@swiftship.in',
      tracking_number: shipment?.tracking_number || 'N/A',
      category: category,
      message: message,
      status: 'OPEN',
      created_at: new Date().toISOString()
    };

    db.addComplaint(newComplaint);

    res.status(201).json({
      success: true,
      message: 'Support complaint ticket filed successfully',
      data: newComplaint
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create complaint' });
  }
});

// PATCH /api/complaints/:id/resolve - Resolve complaint with note
complaintsRouter.patch('/:id/resolve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution_note, admin_id, admin_name } = req.body;

    const complaint = db.getComplaints().find(c => c.id === id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const updated = db.updateComplaint(id, {
      status: 'RESOLVED',
      resolution_note: resolution_note || 'Resolved by customer care supervisor.'
    });

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      admin_id: admin_id || 'usr_admin_1',
      admin_name: admin_name || 'Admin',
      action: 'COMPLAINT_RESOLVED',
      target_type: 'SHIPMENT',
      target_id: complaint.shipment_id || id,
      details: `Complaint ${id} resolved. Note: ${resolution_note || 'N/A'}`,
      timestamp: new Date().toISOString()
    };
    db.addAuditLog(audit);

    res.json({
      success: true,
      message: 'Complaint resolved',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to resolve complaint' });
  }
});
