import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { OrderStatus } from '../../../types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId, shopId, partnerId, status } = req.query;

    const orders = db.getOrders({
      userId: typeof userId === 'string' ? userId : undefined,
      shopId: typeof shopId === 'string' ? shopId : undefined,
      partnerId: typeof partnerId === 'string' ? partnerId : undefined,
      status: typeof status === 'string' ? (status as OrderStatus) : undefined,
    });

    return res.status(200).json({ orders });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
