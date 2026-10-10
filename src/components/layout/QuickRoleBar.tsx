import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, Store, Bike, User as UserIcon, ChevronDown, Check, type LucideIcon } from 'lucide-react';

const ROLES: {
  role: UserRole;
  route: string;
  label: string;
  shortLabel: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  {
    role: 'customer',
    route: '/customer',
    label: 'Customer',
    shortLabel: 'Customer',
    desc: 'Shopping & Account',
    icon: UserIcon,
  },
  {
    role: 'seller',
    route: '/seller',
    label: 'Shop Owner (Seller)',
    shortLabel: 'Shop Owner',
    desc: 'Orders & Inventory',
    icon: Store,
  },
  {
    role: 'delivery_partner',
    route: '/delivery',
    label: 'Delivery Partner',
    shortLabel: 'Rider',
    desc: 'Fleet & Deliveries',
    icon: Bike,
  },
  {
    role: 'admin',
    route: '/admin',
    label: 'Admin Panel',
    shortLabel: 'Admin',
    desc: 'Platform Overview',
    icon: ShieldCheck,
  },
];

export const QuickRoleBar: React.FC = () => {
  const { currentRole, switchRole, user } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleRoleSelect = (role: UserRole, targetRoute: string) => {
    switchRole(role);
    setIsMobileMenuOpen(false);
    if (!router.pathname.startsWith(targetRoute) && targetRoute !== '/') {
      router.push(targetRoute);
    } else if (
      targetRoute === '/' &&
      (router.pathname.startsWith('/seller') ||
        router.pathname.startsWith('/delivery') ||
        router.pathname.startsWith('/admin'))
    ) {
      router.push('/');
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const activeRoleObj = ROLES.find((r) => r.role === currentRole) || ROLES[0];
  const ActiveIcon = activeRoleObj.icon;

  return (
    <div className="role-banner">
      <div className="container role-banner-container">
        {/* Left: Demo Status & User */}
        <div className="role-banner-user">
          <span className="role-demo-badge">
            ● <span className="demo-text-full">DEMO ENVIRONMENT</span><span className="demo-text-short">DEMO</span>
          </span>
          <span className="role-user-text">
            Logged in as: <strong className="role-user-name" title={user.name}>{user.name}</strong>
          </span>
        </div>

        {/* Desktop: Full Role Pills */}
        <div className="role-banner-links desktop-only-flex">
          <span style={{ fontSize: '11px', color: '#64748b', marginRight: '4px' }}>Switch Persona:</span>
          {ROLES.map(({ role, route, label, icon: Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role, route)}
              className={`role-pill ${currentRole === role ? 'active' : ''}`}
              title={`${label} Dashboard`}
            >
              <Icon size={12} style={{ display: 'inline', marginRight: 4 }} />
              {label}
            </button>
          ))}
        </div>

        {/* Mobile: Compact Collapsible Persona Switcher */}
        <div className="mobile-only-flex role-mobile-selector-wrapper" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="role-mobile-trigger-btn"
            aria-expanded={isMobileMenuOpen}
            aria-label="Switch user persona"
          >
            <ActiveIcon size={12} />
            <span className="role-mobile-trigger-label">{activeRoleObj.shortLabel}</span>
            <ChevronDown size={12} style={{ transform: isMobileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {isMobileMenuOpen && (
            <div className="role-mobile-dropdown-menu">
              <div className="role-mobile-dropdown-header">
                Switch Persona
              </div>
              {ROLES.map(({ role, route, label, desc, icon: Icon }) => {
                const isCurrent = currentRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role, route)}
                    className={`role-mobile-dropdown-item ${isCurrent ? 'active' : ''}`}
                  >
                    <div className="role-item-icon-wrap">
                      <Icon size={14} />
                    </div>
                    <div className="role-item-info">
                      <div className="role-item-label">{label}</div>
                      <div className="role-item-desc">{desc}</div>
                    </div>
                    {isCurrent && <Check size={14} className="role-item-check" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
