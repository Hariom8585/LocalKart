import { User, UserRole } from '../types';

export const DEMO_USERS: Record<UserRole, User> = {
  customer: {
    id: 'user-cust-1',
    name: 'Hariom Yadav',
    email: 'hariom.yadav@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    is_verified: true,
    created_at: '2026-01-10T10:00:00Z',
  },
  seller: {
    id: 'user-seller-1',
    name: 'Vikram Sharma (Sharma Store)',
    email: 'vikram.sharma@sharmagrocery.in',
    phone: '+91 98141 22334',
    role: 'seller',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    is_verified: true,
    created_at: '2026-01-05T09:00:00Z',
  },
  delivery_partner: {
    id: 'user-rider-1',
    name: 'Rajesh Kumar (Express Delivery)',
    email: 'rajesh.rider@localkart.in',
    phone: '+91 94170 88990',
    role: 'delivery_partner',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    is_verified: true,
    created_at: '2026-01-12T14:00:00Z',
  },
  admin: {
    id: 'user-admin-1',
    name: 'Platform Administrator',
    email: 'admin@localkart.in',
    phone: '+91 99999 00000',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_verified: true,
    created_at: '2026-01-01T00:00:00Z',
  }
};


