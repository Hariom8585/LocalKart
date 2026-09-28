import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, subtotal, cityId, shopId, userId } = req.body;

  if (!code || typeof subtotal !== 'number') {
    return res.status(400).json({ error: 'Coupon code and subtotal are required' });
  }

  const result = db.validateCoupon(code, subtotal, cityId, shopId, userId);
  return res.status(result.valid ? 200 : 400).json(result);
}
