import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    const addresses = db.getAddresses(typeof userId === 'string' ? userId : undefined);
    return res.status(200).json({ addresses });
  }

  if (req.method === 'POST') {
    const {
      user_id,
      title,
      receiver_name,
      receiver_phone,
      flat_house_no,
      area_locality,
      city_id,
      city_name,
      pincode,
      landmark,
      is_default,
    } = req.body;

    if (!receiver_name || !receiver_phone || !flat_house_no || !area_locality || !city_name) {
      return res.status(400).json({ error: 'Missing required address fields' });
    }

    const newAddress = db.createAddress({
      user_id: user_id || 'user-cust-1',
      title: title || 'Home',
      receiver_name,
      receiver_phone,
      flat_house_no,
      area_locality,
      city_id: city_id || 'city-ldh',
      city_name,
      pincode: pincode || '141001',
      landmark: landmark || '',
      is_default: !!is_default,
    });

    return res.status(201).json({ address: newAddress });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
