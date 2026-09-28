import React from 'react';
import Link from 'next/link';
import { Shop } from '../../types';
import { formatINR } from '../../lib/utils';
import { Star, Clock, MapPin, Zap, CheckCircle2 } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
  distanceKm?: number;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, distanceKm }) => {
  const displayDist = distanceKm !== undefined ? distanceKm : (shop.distance_km || 1.8);

  return (
    <Link href={`/shops/${shop.slug || shop.id}`} className="shop-card">
      {/* Banner / Image */}
      <div className="shop-banner-wrapper">
        <img src={shop.banner_url || shop.logo_url} alt={shop.name} loading="lazy" />
        
        {/* Same-day Badge */}
        <div className="shop-sameday-badge">
          <Zap size={13} style={{ fill: '#34d399', color: '#34d399' }} />
          <span>Same-Day Delivery</span>
        </div>

        {/* Distance Badge */}
        <div className="shop-distance-badge">
          <span>{displayDist} km away</span>
        </div>
      </div>

      {/* Info Body */}
      <div className="shop-info-body">
        <div className="shop-name-row">
          <h3 className="shop-title">{shop.name}</h3>
          <div className="shop-rating-pill">
            <Star size={12} style={{ fill: '#ffffff', color: '#ffffff' }} />
            <span>{shop.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="shop-category-text">
          {shop.category} • {shop.area_name}
        </div>

        {/* Operating & Delivery Metadata */}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} style={{ color: 'var(--primary)' }} />
            <span>{shop.estimated_delivery_min}–{shop.estimated_delivery_max} mins</span>
          </div>
          <div>•</div>
          <div>Min: {formatINR(shop.min_order_amount)}</div>
          <div>•</div>
          <div>Fee: {shop.base_delivery_fee === 0 ? 'FREE' : formatINR(shop.base_delivery_fee)}</div>
        </div>

        {/* Meta Footer */}
        <div className="shop-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: shop.is_open ? 'var(--success)' : 'var(--danger)',
              }}
            />
            <span style={{ fontWeight: 600, color: shop.is_open ? 'var(--success)' : 'var(--danger)' }}>
              {shop.is_open ? 'Open Now' : 'Closed'}
            </span>
            <span style={{ color: 'var(--text-light)', fontSize: 11 }}>
              ({shop.opening_time} - {shop.closing_time})
            </span>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
            View Menu →
          </div>
        </div>
      </div>
    </Link>
  );
};
