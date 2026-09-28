import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { shopId, productId } = req.query;
    const reviews = db.getReviews(
      typeof shopId === 'string' ? shopId : undefined,
      typeof productId === 'string' ? productId : undefined
    );
    return res.status(200).json({ reviews });
  }

  if (req.method === 'POST') {
    const {
      order_id,
      user_id,
      user_name,
      shop_id,
      product_id,
      shop_rating,
      delivery_rating,
      review_comment,
    } = req.body;

    if (!shop_id || !shop_rating) {
      return res.status(400).json({ error: 'Shop id and shop rating are required' });
    }

    const newRev = db.addReview({
      order_id: order_id || `order-${Date.now()}`,
      user_id: user_id || 'user-cust-1',
      user_name: user_name || 'Rahul Sharma',
      shop_id,
      product_id: product_id || undefined,
      shop_rating: Number(shop_rating),
      delivery_rating: delivery_rating ? Number(delivery_rating) : 5,
      review_comment: review_comment || 'Great experience with same-day local delivery!',
    });

    return res.status(201).json({ review: newRev });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
