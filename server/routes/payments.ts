import { Router, Request, Response } from 'express';
import { db } from '../db';
import { Payment } from '../../src/types';

export const paymentsRouter = Router();

// GET /api/payments - List all payments
paymentsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const payments = db.getPayments();
    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch payments' });
  }
});

// GET /api/payments/:shipmentId - Get payment record for shipment
paymentsRouter.get('/:shipmentId', (req: Request, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const payment = db.getPaymentByShipmentId(shipmentId);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Payment fetch error' });
  }
});

// POST /api/payments/process - Simulate payment transaction (UPI, Card, NetBanking)
paymentsRouter.post('/process', (req: Request, res: Response) => {
  try {
    const { shipment_id, amount, payment_method, currency } = req.body;

    if (!shipment_id || amount === undefined) {
      return res.status(400).json({ success: false, error: 'shipment_id and amount are required' });
    }

    const transactionId = `pay_rzp_live_${Math.random().toString(36).substring(2, 12)}`;
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      shipment_id,
      amount: Number(amount),
      currency: currency || 'INR',
      payment_status: 'SUCCESS',
      transaction_id: transactionId,
      payment_method: payment_method || 'UPI',
      created_at: new Date().toISOString()
    };

    db.addPayment(newPayment);
    db.updateShipment(shipment_id, { payment_id: newPayment.id });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: newPayment
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Payment processing failed' });
  }
});
