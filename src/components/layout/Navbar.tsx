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
      <div className="container nav-main-wrapper">
        {/* DESKTOP NAVBAR (>= 768px) */}
        <div className="nav-container desktop-nav">
          <div className="nav-left">
            {/* Brand Logo */}
            <Link href="/" className="brand-logo" aria-label="LocalKart Home">
              <div className="brand-logo-icon">
                <Sparkles size={20} />
              </div>
              <span>Local<span>Kart</span></span>
            </Link>

            {/* Location Selector Button */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="location-picker-btn"
              title="Click to change delivery city & locality"
              aria-label={`Deliver to ${selectedArea.name}, ${selectedCity.name}`}
            >
              <span className="loc-badge">
                <MapPin size={16} />
              </span>
              <div className="location-btn-content">
                <div className="location-btn-label">
                  Deliver to
                </div>
                <div className="location-btn-value">
                  <span className="location-name-text">{selectedArea.name}, {selectedCity.name}</span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              </div>
            </button>
          </div>

          {/* Global Search Bar */}
          <div className="nav-search-bar">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-input-wrapper">
                <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder='Search "milk", "bread", "pharmacy", "Sharma Store"...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (onOpenSearch) onOpenSearch();
                  }}
                  aria-label="Search products and stores"
                />
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <Link
              href="/customer"
              className="btn btn-outline btn-sm nav-action-btn"
              title="Customer Dashboard & Profile"
            >
              <UserIcon size={16} />
              <span>Account</span>
            </Link>

            <Link
              href="/orders"
              className="btn btn-outline btn-sm nav-action-btn"
              title="Track Orders"
            >
              <Package size={16} />
              <span>Orders</span>
            </Link>

            {/* Cart Button with Total Amount */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="cart-button"
              title="View Shopping Cart"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingBag size={18} />
              <span style={{ fontWeight: 700 }}>
                {itemCount > 0 ? formatINR(totalAmount) : 'Cart'}
              </span>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>
          </div>
        </div>

        {/* MOBILE NAVBAR (< 768px) */}
        <div className="mobile-nav-block">
          {/* Top Row: Logo + Location Picker + Cart Button */}
          <div className="mobile-nav-top-row">
            <Link href="/" className="brand-logo mobile-logo" aria-label="LocalKart Home">
              <div className="brand-logo-icon mobile-logo-icon">
                <Sparkles size={17} />
              </div>
              <span className="mobile-logo-text">Local<span>Kart</span></span>
            </Link>

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="location-picker-btn mobile-location-btn"
              title="Change Delivery Location"
              aria-label={`Deliver to ${selectedArea.name}`}
            >
              <MapPin size={14} className="mobile-loc-icon" />
              <div className="mobile-loc-text-wrap">
                <span className="mobile-loc-title">{selectedArea.name}</span>
                <ChevronDown size={12} className="mobile-loc-arrow" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="mobile-nav-cart-btn"
              aria-label={`Shopping cart with ${itemCount} items`}
              title="View Cart"
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="mobile-cart-badge">{itemCount}</span>
              )}
            </button>
          </div>

          {/* Bottom Row: Full-Width Search Input */}
          <div className="mobile-nav-search-row">
            <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <div
                className="mobile-search-wrapper"
                onClick={() => {
                  if (onOpenSearch) onOpenSearch();
                }}
              >
                <Search size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder='Search "milk", "bread", "pharmacy"...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (onOpenSearch) onOpenSearch();
                  }}
                  readOnly={!!onOpenSearch}
                  className="mobile-search-input"
                  aria-label="Search items or neighborhood shops"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};
