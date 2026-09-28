import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const cityId = Array.isArray(id) ? id[0] : id;

  if (req.method === 'GET') {
    const city = db.getCity(cityId as string);
    if (!city) return res.status(404).json({ error: 'City not found' });
    return res.status(200).json({ areas: city.areas || [] });
  }

  if (req.method === 'POST') {
    const { name, pincode, latitude, longitude, delivery_zone_code } = req.body;
    if (!name || !pincode) {
      return res.status(400).json({ error: 'Area name and pincode are required' });
    }
    const newArea = db.createArea({
      city_id: cityId as string,
      name,
      pincode,
      latitude: latitude || 28.61,
      longitude: longitude || 77.20,
      delivery_zone_code: delivery_zone_code || 'ZONE-1',
      is_active: true,
    });
    return res.status(201).json({ area: newArea });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
