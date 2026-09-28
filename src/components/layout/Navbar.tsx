import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../lib/utils';
import {
  MapPin,
  Search,
  ShoppingBag,
  User as UserIcon,
  ChevronDown,
  Clock,
  Sparkles,
  Package
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const router = useRouter();
  const { selectedCity, selectedArea, setIsLocationModalOpen } = useLocation();
  const { itemCount, totalAmount, setIsCartDrawerOpen } = useCart();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/shops?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push('/shops');
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="nav-left">
          {/* Brand Logo */}
          <Link href="/" className="brand-logo">
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)'
            }}>
              <Sparkles size={22} />
            </div>
            <span>Local<span>Kart</span></span>
          </Link>

          {/* Location Selector Button */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="location-picker-btn"
            title="Click to change delivery city & locality"
          >
            <span className="loc-badge">
              <MapPin size={16} />
            </span>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Deliver to
              </div>
              <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 4 }}>
                {selectedArea.name}, {selectedCity.name}
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="nav-search-bar">
          <form onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder='Search "milk", "bread", "pharmacy", "Sharma Store"...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => {
                  if (onOpenSearch) onOpenSearch();
                }}
              />
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <Link
            href="/customer"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="Customer Dashboard & Profile"
          >
            <UserIcon size={16} />
            <span style={{ display: 'inline' }}>Account</span>
          </Link>

          <Link
            href="/orders"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Package size={16} />
            <span style={{ display: 'inline' }}>Orders</span>
          </Link>

          {/* Cart Button with Total Amount */}
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="cart-button"
            title="View Shopping Cart"
          >
            <ShoppingBag size={18} />
            <span style={{ fontWeight: 700 }}>
              {itemCount > 0 ? formatINR(totalAmount) : 'Cart'}
            </span>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
