import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const coupons = db.getCoupons();
    return res.status(200).json({ coupons });
  }

  if (req.method === 'POST') {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      valid_until,
      city_id,
      shop_id,
      usage_limit,
      usage_limit_per_user,
    } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ error: 'Code and discount value are required' });
    }

    const newCoupon = db.createCoupon({
      code: code.toUpperCase().trim(),
      description: description || '',
      discount_type: discount_type || 'flat',
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount) || 0,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : undefined,
      valid_until: valid_until || '2026-12-31T23:59:59Z',
      city_id: city_id || undefined,
      shop_id: shop_id || undefined,
      usage_limit: usage_limit ? Number(usage_limit) : undefined,
      usage_limit_per_user: usage_limit_per_user ? Number(usage_limit_per_user) : undefined,
      is_active: true,
    });

    return res.status(201).json({ coupon: newCoupon });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
