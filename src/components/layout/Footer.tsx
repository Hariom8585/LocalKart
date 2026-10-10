import React from 'react';
import Link from 'next/link';
import { Sparkles, Store, Bike, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand" style={{ maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Sparkles size={18} />
              </div>
              <h4 style={{ margin: 0, fontSize: 22 }}>
                Local<span style={{ color: 'var(--secondary)' }}>Kart</span>
              </h4>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#94a3b8', marginBottom: 16 }}>
              Empowering neighborhood retail across India. Order directly from trusted local shops in your city with guaranteed same-day doorstep delivery.
            </p>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              🇮🇳 Proudly built for Indian neighborhood retail
            </div>
          </div>

          {/* Active Cities */}
          <div>
            <h5 className="footer-title">Serving Cities</h5>
            <ul className="footer-links">
              <li><Link href="/shops?city=Ludhiana">Ludhiana, Punjab</Link></li>
              <li><Link href="/shops?city=Chandigarh">Chandigarh (UT)</Link></li>
              <li><Link href="/shops?city=Delhi">Delhi NCR</Link></li>
              <li><span style={{ color: '#64748b' }}>Amritsar (Coming Soon)</span></li>
              <li><span style={{ color: '#64748b' }}>Jalandhar (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Partner & Portals */}
          <div>
            <h5 className="footer-title">Platform Portals</h5>
            <ul className="footer-links">
              <li>
                <Link href="/seller" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Store size={14} style={{ color: 'var(--secondary)' }} />
                  <span>Shop Owner Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/delivery" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Bike size={14} style={{ color: '#38bdf8' }} />
                  <span>Delivery Partner App</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} style={{ color: '#34d399' }} />
                  <span>Admin Control Center</span>
                </Link>
              </li>
              <li><Link href="/orders">Track Existing Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="footer-title">Top Categories</h5>
            <ul className="footer-links">
              <li><Link href="/shops?category=grocery">Daily Grocery & Staples</Link></li>
              <li><Link href="/shops?category=fruits-vegetables">Fresh Fruits & Veggies</Link></li>
              <li><Link href="/shops?category=pharmacy">Pharmacy & Wellness</Link></li>
              <li><Link href="/shops?category=bakery">Artisan Bakeries</Link></li>
              <li><Link href="/shops?category=sweets">Mithai & Snacks</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} LocalKart India Technologies. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', flexWrap: 'wrap' }}>
            <span>Razorpay Secured</span>
            <span>•</span>
            <span>UPI / RuPay / Cards</span>
            <span>•</span>
            <span>100% Genuine Local Stores</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
