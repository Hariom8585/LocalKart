import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { cityId, areaId, categoryId, search, openOnly } = req.query;

    const shops = db.getShops({
      cityId: typeof cityId === 'string' ? cityId : undefined,
      areaId: typeof areaId === 'string' ? areaId : undefined,
      categoryId: typeof categoryId === 'string' ? categoryId : undefined,
      search: typeof search === 'string' ? search : undefined,
      openOnly: openOnly === 'true',
    });

    return res.status(200).json({ shops });
  }

  if (req.method === 'POST') {
    const {
      name,
      seller_id,
      city_id,
      category,
      category_id,
      description,
      logo_url,
      banner_url,
      address_line,
      area_id,
      area_name,
      city_name,
      pincode,
      latitude,
      longitude,
      delivery_radius_km,
      serviceable_area_ids,
      min_order_amount,
      base_delivery_fee,
      opening_time,
      closing_time,
    } = req.body;

    if (!name || !city_id || !address_line) {
      return res.status(400).json({ error: 'Shop name, city, and address are required' });
    }

    const newShop = db.createShop({
      seller_id: seller_id || 'user-seller-1',
      city_id,
      name,
      category: category || 'General Store',
      category_id: category_id || 'cat-grocery',
      description: description || '',
      logo_url: logo_url || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300',
      banner_url: banner_url || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200',
      address_line,
      area_id: area_id || 'area-ldh-1',
      area_name: area_name || 'Main Market',
      city_name: city_name || 'Ludhiana',
      pincode: pincode || '141001',
      latitude: Number(latitude) || 30.90,
      longitude: Number(longitude) || 75.85,
      delivery_radius_km: Number(delivery_radius_km) || 8.0,
      serviceable_area_ids: serviceable_area_ids || [area_id],
      min_order_amount: Number(min_order_amount) || 99,
      base_delivery_fee: Number(base_delivery_fee) || 25,
      estimated_delivery_min: 30,
      estimated_delivery_max: 50,
      is_open: true,
      commission_rate: 8.0,
      opening_time: opening_time || '08:00 AM',
      closing_time: closing_time || '10:00 PM',
    });

    return res.status(201).json({ shop: newShop });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
