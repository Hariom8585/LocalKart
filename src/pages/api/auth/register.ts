import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { hashPassword, sanitizeUser } from '../../../lib/server-auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name (minimum 2 characters).' });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanDigits = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
    if (!phone || cleanDigits.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const formattedPhone = cleanDigits.length === 10 ? `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}` : phone.trim();

    // Check if account already exists
    const existingByEmail = db.findUserByEmailOrPhone(trimmedEmail);
    if (existingByEmail) {
      return res.status(409).json({
        error: 'An account with this email address already exists. Please log in instead.',
      });
    }

    const existingByPhone = db.findUserByEmailOrPhone(cleanDigits);
    if (existingByPhone) {
      return res.status(409).json({
        error: 'An account with this mobile number already exists. Please log in instead.',
      });
    }

    // Hash password and create customer record
    const passwordHash = hashPassword(password);

    const newUser = db.createUser({
      name: name.trim(),
      email: trimmedEmail,
      phone: formattedPhone,
      password_hash: passwordHash,
      role: 'customer',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      is_verified: true,
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred during account creation. Please try again.' });
  }
}
