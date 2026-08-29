import { Router, Request, Response } from 'express';
import { db } from '../db';
import { calculateShippingPrice } from '../../src/utils/pricingEngine';
import { Coupon, PricingConfig, AuditLog } from '../../src/types';

export const pricingRouter = Router();

// GET /api/pricing - Get pricing configuration
pricingRouter.get('/', (_req: Request, res: Response) => {
  try {
    const config = db.getPricingConfig();
    res.json({ success: true, data: config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch pricing config' });
  }
});

// PUT /api/pricing - Update pricing configuration parameters
pricingRouter.put('/', (req: Request, res: Response) => {
  try {
    const newConfig: Partial<PricingConfig> = req.body;
    const updated = db.updatePricingConfig(newConfig);

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      admin_id: 'usr_admin_1',
      admin_name: 'Admin',
      action: 'PRICING_UPDATED',
      target_type: 'PRICING',
      target_id: 'pricing_global',
      details: `Updated parameters: Base ₹${updated.base_charge}, PerKg ₹${updated.per_kg_charge}, PerKm ₹${updated.per_km_charge}`,
      timestamp: new Date().toISOString()
    };
    db.addAuditLog(audit);

    res.json({
      success: true,
      message: 'Pricing configuration updated successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update pricing config' });
  }
});

// POST /api/pricing/calculate - Calculate dynamic shipping price
pricingRouter.post('/calculate', (req: Request, res: Response) => {
  try {
    const { pickupCity, destinationCity, weightKg, dimensions, deliveryType, couponCode } = req.body;

    let coupon = undefined;
    if (couponCode) {
      coupon = db.getCouponByCode(couponCode);
    }

    const config = db.getPricingConfig();
    const result = calculateShippingPrice({
      pickupCity: pickupCity || 'New Delhi',
      destinationCity: destinationCity || 'Mumbai',
      weightKg: Number(weightKg) || 1,
      dimensions: dimensions || { length: 20, width: 15, height: 10 },
      deliveryType: deliveryType || 'STANDARD',
      coupon: coupon && coupon.is_active ? coupon : undefined,
      config
    });

    res.json({
      success: true,
      data: result,
      coupon_applied: Boolean(coupon && coupon.is_active && result.discount_amount > 0)
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Calculation error' });
  }
});

// GET /api/pricing/coupons - List all discount coupons
pricingRouter.get('/coupons', (_req: Request, res: Response) => {
  try {
    const coupons = db.getCoupons();
    res.json({ success: true, data: coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch coupons' });
  }
});

// POST /api/pricing/coupons - Create promotional coupon
pricingRouter.post('/coupons', (req: Request, res: Response) => {
  try {
    const { code, discount_type, value, min_order_amount, max_discount, expiry_date } = req.body;

    if (!code || !discount_type || value === undefined) {
      return res.status(400).json({ success: false, error: 'code, discount_type, and value are required' });
    }

    const newCoupon: Coupon = {
      id: `coup_${Date.now()}`,
      code: code.toUpperCase().trim(),
      discount_type,
      value: Number(value),
      min_order_amount: Number(min_order_amount) || 0,
      max_discount: max_discount ? Number(max_discount) : undefined,
      expiry_date: expiry_date || '2026-12-31',
      usage_count: 0,
      is_active: true
    };

    db.addCoupon(newCoupon);

    res.status(201).json({
      success: true,
      message: `Coupon ${newCoupon.code} created`,
      data: newCoupon
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create coupon' });
  }
});

// PATCH /api/pricing/coupons/:id/toggle - Toggle coupon active status
pricingRouter.patch('/coupons/:id/toggle', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const coupon = db.getCoupons().find(c => c.id === id);

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    const updated = db.updateCoupon(id, { is_active: !coupon.is_active });

    res.json({
      success: true,
      message: `Coupon is now ${updated?.is_active ? 'ACTIVE' : 'INACTIVE'}`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to toggle coupon' });
  }
});

// POST /api/pricing/coupons/validate - Validate coupon code
pricingRouter.post('/coupons/validate', (req: Request, res: Response) => {
  try {
    const { code, cartAmount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
    }

    const coupon = db.getCouponByCode(code);
    if (!coupon || !coupon.is_active) {
      return res.json({
        valid: false,
        message: 'Invalid or expired coupon code.'
      });
    }

    const amount = Number(cartAmount) || 0;
    if (amount < coupon.min_order_amount) {
      return res.json({
        valid: false,
        message: `Order amount must be at least ₹${coupon.min_order_amount} to use this coupon.`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discount = Math.round((amount * coupon.value) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = Math.min(amount, coupon.value);
    }

    res.json({
      valid: true,
      coupon,
      discount_amount: discount,
      message: `Coupon applied: Save ₹${discount}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Validation failed' });
  }
});
