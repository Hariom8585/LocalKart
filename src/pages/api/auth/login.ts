import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { DEMO_USERS } from '../../../lib/auth';
import { verifyPassword, sanitizeUser } from '../../../lib/server-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { identifier, password } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ error: 'Please enter your email address or mobile number.' });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    // 1. Check in database
    let user = db.findUserByEmailOrPhone(trimmedId);

    // 2. If not found in DB users, check DEMO_USERS
    if (!user) {
      const demoCust = DEMO_USERS.customer;
      const cleanDigits = trimmedId.replace(/\D/g, '');
      const demoCustDigits = demoCust.phone.replace(/\D/g, '');

      if (
        demoCust.email.toLowerCase() === trimmedId.toLowerCase() ||
        (cleanDigits.length >= 10 && demoCustDigits.endsWith(cleanDigits.slice(-10)))
      ) {
        user = demoCust;
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'No account found with this email or mobile number. Please sign up to create an account.',
      });
    }

    // 3. Verify password
    if (user.password_hash) {
      const isMatch = verifyPassword(trimmedPass, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }
    } else {
      // For demo accounts without password hash, allow login if at least 4 characters provided
      if (trimmedPass.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters.' });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ error: 'An unexpected server error occurred during login. Please try again.' });
  }
}
