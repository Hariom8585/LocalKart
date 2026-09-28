import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const config = db.getPlatformConfig();
    return res.status(200).json({ config });
  }

  if (req.method === 'PUT') {
    const updated = db.updatePlatformConfig(req.body);
    return res.status(200).json({ config: updated });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
