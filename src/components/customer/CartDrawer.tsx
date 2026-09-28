import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ShoppingBag,
  Store,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    items,
    shopName,
    itemCount,
    subtotal,
    deliveryFee,
    platformFee,
    taxAmount,
    discountAmount,
    couponCode,
    totalAmount,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || inputCoupon).trim();
    if (!code) return;
    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCouponCode(code);
    setIsApplying(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setInputCoupon('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      <div className="cart-drawer-overlay" onClick={() => setIsCartDrawerOpen(false)} />
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 style={{ fontSize: 18, lineHeight: 1.2 }}>My Cart</h3>
              {shopName && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Store size={12} />
                  <span>{shopName}</span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(false)}
            style={{ padding: 6, color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            textAlign: 'center'
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-light)',
              marginBottom: 16
            }}>
              <ShoppingBag size={32} />
            </div>
            <h4 style={{ fontSize: 18, marginBottom: 8 }}>Your cart is empty</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Browse trusted local shops and add delicious treats, groceries, or essentials!
            </p>
            <button
              type="button"
              onClick={() => {
                setIsCartDrawerOpen(false);
                router.push('/shops');
              }}
              className="btn btn-primary btn-sm"
            >
              Explore Nearby Shops
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="cart-drawer-items">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-light)',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      background: 'var(--bg-muted)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3 }}>
                      {item.product.name}
                    </h5>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {item.product.unit}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                      {formatINR(item.product.discounted_price * item.quantity)}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="qty-counter">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Promo Coupon Section */}
              <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  <Tag size={15} style={{ color: 'var(--primary)' }} />
                  <span>Apply Coupon</span>
                </div>

                {couponCode ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--success-bg)',
                    color: '#065f46',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    <span>Applied: <strong>{couponCode}</strong> (-{formatINR(discountAmount)})</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      style={{ color: '#991b1b', fontSize: 12, fontWeight: 700 }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 13,
                          textTransform: 'uppercase'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplying || !inputCoupon.trim()}
                        className="btn btn-primary btn-sm"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick suggestion chips */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('WELCOME50')}
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          background: '#ffffff',
                          border: '1px dashed var(--primary)',
                          color: 'var(--primary)',
                          borderRadius: 4,
                          fontWeight: 600
                        }}
                      >
                        WELCOME50 (Flat ₹50 OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('FREEDELIVERY')}
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          background: '#ffffff',
                          border: '1px dashed var(--secondary)',
                          color: 'var(--secondary)',
                          borderRadius: 4,
                          fontWeight: 600
                        }}
                      >
                        FREEDELIVERY
                      </button>
                    </div>
                  </>
                )}

                {couponError && (
                  <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>
                    {couponError}
                  </div>
                )}
                {couponSuccess && (
                  <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 6 }}>
                    {couponSuccess}
                  </div>
                )}
              </div>

              {/* Free delivery indicator */}
              {subtotal < 499 ? (
                <div style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  fontSize: 12,
                  color: '#92400e'
                }}>
                  Add <strong>{formatINR(499 - subtotal)}</strong> more for <strong>FREE Same-Day Delivery!</strong>
                </div>
              ) : (
                <div style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--success-bg)',
                  fontSize: 12,
                  color: '#065f46',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Check size={16} />
                  <span>Yay! You unlocked FREE Same-Day Delivery!</span>
                </div>
              )}
            </div>

            {/* Bill Summary & Checkout CTA */}
            <div className="cart-drawer-footer">
              <div className="bill-row">
                <span>Item Subtotal ({itemCount} items)</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                  ) : (
                    formatINR(deliveryFee)
                  )}
                </span>
              </div>
              <div className="bill-row">
                <span>Platform Fee</span>
                <span>{formatINR(platformFee)}</span>
              </div>
              <div className="bill-row">
                <span>Govt Taxes (GST 5%)</span>
                <span>{formatINR(taxAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="bill-row" style={{ color: 'var(--success)', fontWeight: 600 }}>
                  <span>Coupon Discount ({couponCode})</span>
                  <span>- {formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="bill-row total">
                <span>To Pay</span>
                <span style={{ color: 'var(--primary)' }}>{formatINR(totalAmount)}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px 20px', fontSize: 16 }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 10,
                fontSize: 11,
                color: 'var(--text-muted)'
              }}>
                <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
                <span>Same-day door delivery verified by LocalKart</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
