import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const cities = db.getCities();
    return res.status(200).json({ cities });
  }

  if (req.method === 'POST') {
    const { name, state, country, latitude, longitude } = req.body;
    if (!name || !state) {
      return res.status(400).json({ error: 'City name and state are required' });
    }
    const newCity = db.createCity({
      name,
      state,
      country: country || 'India',
      is_active: true,
      latitude: latitude || 28.6139,
      longitude: longitude || 77.2090,
    });
    return res.status(201).json({ city: newCity });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
