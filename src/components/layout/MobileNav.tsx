import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { Home, Store, Search, Package, ShoppingBag } from 'lucide-react';

interface MobileNavProps {
  onOpenSearch?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenSearch }) => {
  const router = useRouter();
  const { itemCount, setIsCartDrawerOpen } = useCart();

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="mobile-bottom-bar">
      <Link href="/" className={`bottom-tab ${isActive('/') ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link href="/shops" className={`bottom-tab ${isActive('/shops') ? 'active' : ''}`}>
        <Store size={20} />
        <span>Shops</span>
      </Link>

      <button
        type="button"
        onClick={() => {
          if (onOpenSearch) onOpenSearch();
          else router.push('/shops');
        }}
        className="bottom-tab"
      >
        <Search size={20} />
        <span>Search</span>
      </button>

      <Link href="/orders" className={`bottom-tab ${isActive('/orders') ? 'active' : ''}`}>
        <Package size={20} />
        <span>Orders</span>
      </Link>

      <button
        type="button"
        onClick={() => setIsCartDrawerOpen(true)}
        className="bottom-tab"
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={20} />
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
                width: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {itemCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </button>
    </nav>
  );
};
