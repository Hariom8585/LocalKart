import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Store, Package, ShoppingBag, User as UserIcon, LogIn } from 'lucide-react';

interface MobileNavProps {
  onOpenSearch?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = () => {
  const router = useRouter();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { isLoggedIn, user } = useAuth();

  const isActive = (path: string) => router.pathname === path;
  const isAccountActive =
    router.pathname.startsWith('/customer') ||
    router.pathname === '/login' ||
    router.pathname === '/signup';

  return (
    <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
      <Link href="/" className={`bottom-tab ${isActive('/') ? 'active' : ''}`} aria-label="Go to Home">
        <Home size={20} className="bottom-tab-icon" />
        <span className="bottom-tab-label">Home</span>
      </Link>

      <Link href="/shops" className={`bottom-tab ${isActive('/shops') ? 'active' : ''}`} aria-label="Browse Shops">
        <Store size={20} className="bottom-tab-icon" />
        <span className="bottom-tab-label">Shops</span>
      </Link>

      <Link href="/orders" className={`bottom-tab ${isActive('/orders') ? 'active' : ''}`} aria-label="View Orders">
        <Package size={20} className="bottom-tab-icon" />
        <span className="bottom-tab-label">Orders</span>
      </Link>

      {isLoggedIn && user ? (
        <Link href="/customer" className={`bottom-tab ${isAccountActive ? 'active' : ''}`} aria-label="Account Profile">
          <UserIcon size={20} className="bottom-tab-icon" />
          <span className="bottom-tab-label">Account</span>
        </Link>
      ) : (
        <Link href="/customer/login" className={`bottom-tab ${isAccountActive ? 'active' : ''}`} aria-label="Customer Log In or Sign Up">
          <LogIn size={20} className="bottom-tab-icon" />
          <span className="bottom-tab-label">Log In</span>
        </Link>
      )}

      <button
        type="button"
        onClick={() => setIsCartDrawerOpen(true)}
        className="bottom-tab"
        aria-label={`View Shopping Cart, ${itemCount} items`}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={20} className="bottom-tab-icon" />
          {itemCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -8,
                background: 'var(--primary)',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 800,
                minWidth: 16,
                height: 16,
                padding: '0 3px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              {itemCount}
            </span>
          )}
        </div>
        <span className="bottom-tab-label">Cart</span>
      </button>
    </nav>
  );
};
