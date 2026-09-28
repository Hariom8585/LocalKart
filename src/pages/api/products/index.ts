import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { shopId, categoryId, search, featuredOnly, availableOnly } = req.query;

    const products = db.getProducts({
      shopId: typeof shopId === 'string' ? shopId : undefined,
      categoryId: typeof categoryId === 'string' ? categoryId : undefined,
      search: typeof search === 'string' ? search : undefined,
      featuredOnly: featuredOnly === 'true',
      availableOnly: availableOnly === 'true',
    });

    return res.status(200).json({ products });
  }

  if (req.method === 'POST') {
    const {
      shop_id,
      category_id,
      name,
      slug,
      description,
      brand,
      unit,
      original_price,
      discounted_price,
      stock_quantity,
      low_stock_threshold,
      is_available,
      is_featured,
      image_url,
    } = req.body;

    if (!shop_id || !name || !original_price || !discounted_price) {
      return res.status(400).json({ error: 'Shop id, product name, and prices are required' });
    }

    const prodSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct = db.createProduct({
      shop_id,
      category_id: category_id || 'cat-grocery',
      name,
      slug: prodSlug,
      description: description || '',
      brand: brand || '',
      unit: unit || '1 piece',
      original_price: Number(original_price),
      discounted_price: Number(discounted_price),
      stock_quantity: Number(stock_quantity) || 50,
      low_stock_threshold: Number(low_stock_threshold) || 10,
      is_available: is_available !== undefined ? is_available : true,
      is_featured: is_featured || false,
      image_url: image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      rating: 4.8,
      rating_count: 0,
    });

    return res.status(201).json({ product: newProduct });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
