import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { cityId } = req.query;
    const partners = db.getDeliveryPartners(typeof cityId === 'string' ? cityId : undefined);
    return res.status(200).json({ partners });
  }

  if (req.method === 'PUT') {
    const { id, is_online, current_city_id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Partner id is required' });
    }
    const updated = db.updateDeliveryPartner(id, {
      ...(is_online !== undefined && { is_online }),
      ...(current_city_id && { current_city_id }),
    });
    return res.status(200).json({ partner: updated });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
