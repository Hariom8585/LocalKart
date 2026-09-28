import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const orderId = Array.isArray(id) ? id[0] : id;

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  const { cancellation_reason, user_id } = req.body || {};

  const result = db.cancelCustomerOrder(
    orderId,
    cancellation_reason || 'Cancelled by customer',
    user_id
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error,
    });
  }

  return res.status(200).json({
    success: true,
    message: result.message,
    order: result.order,
  });
}
