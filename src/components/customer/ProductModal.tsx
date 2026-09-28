import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatINR, getEstimatedDeliveryWindow } from '../../lib/utils';
import { X, Star, Zap, ShieldCheck, Plus, Minus, ShoppingBag } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  shopName?: string;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  shopName,
  onClose,
}) => {
  const { items, addToCart, updateQuantity, setIsCartDrawerOpen } = useCart();

  if (!product) return null;

  const cartItem = items.find((i) => i.product_id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = !product.is_available || product.stock_quantity <= 0;

  const handleAddToCart = () => {
    addToCart(product, 1, shopName || product.shop_name);
  };

  const handleBuyNow = () => {
    addToCart(product, 1, shopName || product.shop_name);
    onClose();
    setIsCartDrawerOpen(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640, padding: 0, overflow: 'hidden' }}
      >
        {/* Header with Close */}
        <div style={{ position: 'relative' }}>
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              width: '100%',
              height: 280,
              objectFit: 'cover',
              background: 'var(--bg-muted)',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <X size={18} />
          </button>

          {product.discount_percentage > 0 && (
            <span
              style={{
                position: 'absolute',
                bottom: 14,
                left: 14,
                background: 'var(--secondary)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {product.discount_percentage}% OFF
            </span>
          )}
        </div>

        {/* Content Body */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {product.brand || shopName || product.shop_name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#065f46' }}>
              <Star size={14} style={{ fill: '#065f46' }} />
              <span>{product.rating.toFixed(1)} ({product.rating_count} ratings)</span>
            </div>
          </div>

          <h2 style={{ fontSize: 20, marginBottom: 8, lineHeight: 1.3 }}>
            {product.name}
          </h2>

          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Unit: <strong>{product.unit}</strong>
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)' }}>
              {formatINR(product.discounted_price)}
            </span>
            {product.original_price > product.discounted_price && (
              <span style={{ fontSize: 16, color: 'var(--text-light)', textDecoration: 'line-through' }}>
                {formatINR(product.original_price)}
              </span>
            )}
            <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>
              Save {formatINR(product.original_price - product.discounted_price)}
            </span>
          </div>

          {/* Delivery & Assurance */}
          <div style={{
            background: 'var(--bg-muted)',
            padding: 12,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            fontSize: 13
          }}>
            <Zap size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                Same-Day Doorstep Delivery
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Estimated arrival: {getEstimatedDeliveryWindow(30, 60)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              Product Details
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {product.description || 'Authentic fresh quality product supplied directly from certified local retailers.'}
            </p>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {isOutOfStock ? (
              <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', width: '100%', textAlign: 'center', fontWeight: 700 }}>
                Currently Out of Stock at this Shop
              </div>
            ) : (
              <>
                {qtyInCart > 0 ? (
                  <div className="qty-counter" style={{ padding: '4px 8px' }}>
                    <button type="button" onClick={() => updateQuantity(product.id, qtyInCart - 1)}>
                      <Minus size={16} />
                    </button>
                    <span style={{ fontSize: 15, padding: '0 12px' }}>{qtyInCart} in cart</span>
                    <button type="button" onClick={() => addToCart(product, 1, shopName)}>
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: 14, borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 700 }}
                  >
                    Add to Cart
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: 14 }}
                >
                  <ShoppingBag size={18} />
                  <span>Buy Now</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
