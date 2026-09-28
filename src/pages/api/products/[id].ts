import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const productId = Array.isArray(id) ? id[0] : id;

  if (!productId) {
    return res.status(400).json({ error: 'Product id is required' });
  }

  if (req.method === 'GET') {
    const product = db.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json({ product });
  }

  if (req.method === 'PUT') {
    const updated = db.updateProduct(productId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json({ product: updated });
  }

  if (req.method === 'DELETE') {
    db.deleteProduct(productId);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
