import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const shopIdOrSlug = Array.isArray(id) ? id[0] : id;

  if (!shopIdOrSlug) {
    return res.status(400).json({ error: 'Shop id is required' });
  }

  if (req.method === 'GET') {
    const shop = db.getShop(shopIdOrSlug);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const products = db.getProducts({ shopId: shop.id });
    const reviews = db.getReviews(shop.id);
    return res.status(200).json({ shop, products, reviews });
  }

  if (req.method === 'PUT') {
    const shop = db.getShop(shopIdOrSlug);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const updated = db.updateShop(shop.id, req.body);
    return res.status(200).json({ shop: updated });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
