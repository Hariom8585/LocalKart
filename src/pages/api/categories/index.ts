import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const categories = db.getCategories();
    return res.status(200).json({ categories });
  }

  if (req.method === 'POST') {
    const { name, slug, icon_name, image_url, display_order } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = db.createCategory({
      name,
      slug: catSlug,
      icon_name: icon_name || 'ShoppingBag',
      image_url: image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      display_order: Number(display_order) || 10,
      is_active: true,
    });
    return res.status(201).json({ category: newCat });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Category id is required' });
    }
    db.deleteCategory(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
