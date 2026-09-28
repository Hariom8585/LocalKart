import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const addressId = Array.isArray(id) ? id[0] : id;

  if (!addressId) {
    return res.status(400).json({ error: 'Address id is required' });
  }

  if (req.method === 'GET') {
    const address = db.getAddress(addressId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    return res.status(200).json({ address });
  }

  if (req.method === 'PUT') {
    const { action, userId } = req.body;
    if (action === 'set_default' && userId) {
      const updated = db.setDefaultAddress(addressId, userId);
      return res.status(200).json({ address: updated });
    }

    const updated = db.updateAddress(addressId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Address not found' });
    }
    return res.status(200).json({ address: updated });
  }

  if (req.method === 'DELETE') {
    db.deleteAddress(addressId);
    return res.status(200).json({ success: true, message: 'Address deleted successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
