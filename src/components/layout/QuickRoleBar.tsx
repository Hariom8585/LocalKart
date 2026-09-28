import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, Store, Bike, User as UserIcon } from 'lucide-react';

export const QuickRoleBar: React.FC = () => {
  const { currentRole, switchRole, user } = useAuth();
  const router = useRouter();

  const handleRoleSelect = (role: UserRole, targetRoute: string) => {
    switchRole(role);
    if (!router.pathname.startsWith(targetRoute) && targetRoute !== '/') {
      router.push(targetRoute);
    } else if (targetRoute === '/' && (router.pathname.startsWith('/seller') || router.pathname.startsWith('/delivery') || router.pathname.startsWith('/admin'))) {
      router.push('/');
    }
  };

  return (
    <div className="role-banner">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#34d399', fontWeight: 700, fontSize: '11px', letterSpacing: '0.05em' }}>
            ● DEMO ENVIRONMENT
          </span>
          <span style={{ display: 'none', color: '#64748b' }}>|</span>
          <span style={{ color: '#94a3b8' }}>
            Logged in as: <strong style={{ color: '#f8fafc' }}>{user.name}</strong>
          </span>
        </div>

        <div className="role-banner-links">
          <span style={{ fontSize: '11px', color: '#64748b', marginRight: '4px' }}>Switch Persona:</span>
          
          <button
            onClick={() => handleRoleSelect('customer', '/customer')}
            className={`role-pill ${currentRole === 'customer' ? 'active' : ''}`}
            title="Customer Shopping & Account Dashboard"
          >
            <UserIcon size={12} style={{ display: 'inline', marginRight: 4 }} />
            Customer
          </button>

          <button
            onClick={() => handleRoleSelect('seller', '/seller')}
            className={`role-pill ${currentRole === 'seller' ? 'active' : ''}`}
            title="Sharma General Store Dashboard"
          >
            <Store size={12} style={{ display: 'inline', marginRight: 4 }} />
            Shop Owner (Seller)
          </button>

          <button
            onClick={() => handleRoleSelect('delivery_partner', '/delivery')}
            className={`role-pill ${currentRole === 'delivery_partner' ? 'active' : ''}`}
            title="Express Delivery Partner Dashboard"
          >
            <Bike size={12} style={{ display: 'inline', marginRight: 4 }} />
            Delivery Partner
          </button>

          <button
            onClick={() => handleRoleSelect('admin', '/admin')}
            className={`role-pill ${currentRole === 'admin' ? 'active' : ''}`}
            title="Platform Super Admin Control Center"
          >
            <ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};
