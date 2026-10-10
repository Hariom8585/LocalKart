import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/layout/Navbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { useCart } from '../../context/CartContext';
import { formatINR, getEstimatedDeliveryWindow } from '../../lib/utils';
import { Product, Shop } from '../../types';
import { Star, Clock, Zap, ShieldCheck, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function ProductDetailPage({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const router = useRouter();
  const { id } = router.query;
  const { items, addToCart, updateQuantity, setIsCartDrawerOpen } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchProductData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data.product);

        // Fetch shop details
        if (data.product.shop_id) {
          const sRes = await fetch(`/api/shops/${data.product.shop_id}`);
          if (sRes.ok) {
            const sData = await sRes.json();
            setShop(sData.shop);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onOpenSearch={onOpenSearch} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Loading product information...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onOpenSearch={onOpenSearch} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Product not found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>This item may no longer be available in nearby shops.</p>
            <button onClick={() => router.push('/shops')} className="btn btn-primary btn-sm">
              Explore Available Shops
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const cartItem = items.find((i) => i.product_id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = !product.is_available || product.stock_quantity <= 0;

  const handleAddToCart = () => {
    addToCart(product, 1, shop ? shop.name : product.shop_name);
  };

  const handleBuyNow = () => {
    addToCart(product, 1, shop ? shop.name : product.shop_name);
    setIsCartDrawerOpen(true);
  };

  return (
    <>
      <Head>
        <title>{`${product.name} | LocalKart Same-Day Delivery`}</title>
      </Head>

      <Navbar onOpenSearch={onOpenSearch} />

      <main className="main-content">
        <div className="container" style={{ paddingTop: 24 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            padding: 'clamp(16px, 4vw, 32px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(20px, 4vw, 40px)',
            marginBottom: 40,
          }}>
            {/* Product Image */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 'clamp(220px, 45vw, 380px)', background: 'var(--bg-muted)' }}>
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {product.discount_percentage > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  background: 'var(--secondary)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 4
                }}>
                  {product.discount_percentage}% OFF
                </span>
              )}
            </div>

            {/* Details */}
            <div>
              {shop && (
                <Link
                  href={`/shops/${shop.slug || shop.id}`}
                  style={{
                    display: 'inline-block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    background: 'var(--primary-light)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Sold by: {shop.name} →
                </Link>
              )}

              <h1 style={{ fontSize: 28, lineHeight: 1.25, marginBottom: 12 }}>
                {product.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#065f46', color: '#ffffff', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700 }}>
                  <Star size={13} style={{ fill: '#ffffff' }} />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  ({product.rating_count} customer ratings)
                </span>
                <span style={{ color: 'var(--text-light)' }}>•</span>
                <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>
                  Pack Size: {product.unit}
                </span>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatINR(product.discounted_price)}
                </span>
                {product.original_price > product.discounted_price && (
                  <span style={{ fontSize: 18, color: 'var(--text-light)', textDecoration: 'line-through' }}>
                    {formatINR(product.original_price)}
                  </span>
                )}
                <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 700 }}>
                  Save {formatINR(product.original_price - product.discounted_price)}
                </span>
              </div>

              {/* Delivery Window */}
              <div style={{
                background: 'var(--bg-muted)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24,
              }}>
                <Zap size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>
                    Same-Day Local Delivery Guaranteed
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
                    Delivery Window: {getEstimatedDeliveryWindow(30, 60)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>About this Item</h4>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {product.description || 'Authentic fresh item supplied by our certified local partner store with stringent quality standards.'}
                </p>
              </div>

              {/* Add to Cart Actions */}
              <div style={{ display: 'flex', gap: 14 }}>
                {isOutOfStock ? (
                  <div style={{ padding: 14, background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', width: '100%', textAlign: 'center', fontWeight: 700 }}>
                    Currently Out of Stock
                  </div>
                ) : (
                  <>
                    {qtyInCart > 0 ? (
                      <div className="qty-counter" style={{ padding: '6px 12px' }}>
                        <button type="button" onClick={() => updateQuantity(product.id, qtyInCart - 1)}>
                          <Minus size={18} />
                        </button>
                        <span style={{ fontSize: 16, padding: '0 14px' }}>{qtyInCart} in Cart</span>
                        <button type="button" onClick={() => addToCart(product, 1, shop?.name)}>
                          <Plus size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="btn btn-outline btn-lg"
                        style={{ flex: 1, borderColor: 'var(--primary)', color: 'var(--primary)' }}
                      >
                        Add to Cart
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="btn btn-primary btn-lg"
                      style={{ flex: 1 }}
                    >
                      <ShoppingBag size={20} />
                      <span>Buy Now</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav onOpenSearch={onOpenSearch} />
    </>
  );
}
