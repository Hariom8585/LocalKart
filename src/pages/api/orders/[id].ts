import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const orderId = Array.isArray(id) ? id[0] : id;

  if (!orderId) {
    return res.status(400).json({ error: 'Order id is required' });
  }

  if (req.method === 'GET') {
    const order = db.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.status(200).json({ order });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
