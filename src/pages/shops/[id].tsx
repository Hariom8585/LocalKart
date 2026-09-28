import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/layout/Navbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { ProductCard } from '../../components/customer/ProductCard';
import { ProductModal } from '../../components/customer/ProductModal';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';
import { Shop, Product, Review } from '../../types';
import {
  Star,
  Clock,
  MapPin,
  Zap,
  Search,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ShoppingBag,
  MessageSquareQuote
} from 'lucide-react';

export default function ShopDetailPage({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const router = useRouter();
  const { id } = router.query;
  const { items, shopId: cartShopId, setIsCartDrawerOpen } = useCart();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Shop internal search & category filter
  const [shopSearch, setShopSearch] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  useEffect(() => {
    if (!id) return;
    async function fetchShopData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/shops/${id}`);
        if (!res.ok) throw new Error('Shop not found');
        const data = await res.json();
        setShop(data.shop);
        setProducts(data.products || []);
        setReviews(data.reviews || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchShopData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onOpenSearch={onOpenSearch} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading store inventory...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onOpenSearch={onOpenSearch} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Store not found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>The requested local shop does not exist or has closed.</p>
            <button onClick={() => router.push('/shops')} className="btn btn-primary btn-sm">
              Back to Nearby Shops
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Categories in this shop
  const distinctCategoryNames = Array.from(new Set(products.map((p) => p.category_name || 'General')));

  // Filter products
  let displayedProducts = products;
  if (activeCategoryTab !== 'all') {
    displayedProducts = displayedProducts.filter((p) => (p.category_name || 'General') === activeCategoryTab);
  }
  if (shopSearch.trim()) {
    const q = shopSearch.toLowerCase();
    displayedProducts = displayedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
    );
  }

  const isCurrentCartShop = cartShopId === shop.id;

  return (
    <>
      <Head>
        <title>{`${shop.name} - Order Same-Day Delivery | LocalKart`}</title>
      </Head>

      <Navbar onOpenSearch={onOpenSearch} />

      <main className="main-content">
        <div className="container" style={{ paddingTop: 20 }}>
          {/* Shop Header Banner Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 28,
          }}>
            <div style={{ height: 200, position: 'relative' }}>
              <img
                src={shop.banner_url || shop.logo_url}
                alt={shop.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 70%)'
              }} />

              <div style={{
                position: 'absolute',
                bottom: 16,
                left: 20,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <Zap size={18} style={{ fill: '#34d399', color: '#34d399' }} />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
                  GUARANTEED SAME-DAY DELIVERY TO YOUR AREA
                </span>
              </div>
            </div>

            {/* Shop Details Info */}
            <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    border: '3px solid #ffffff',
                    boxShadow: 'var(--shadow-md)',
                    marginTop: -36,
                    background: '#ffffff',
                    position: 'relative',
                    zIndex: 2,
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h1 style={{ fontSize: 22, lineHeight: 1.2 }}>{shop.name}</h1>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
                      <CheckCircle2 size={16} />
                      Verified Local Merchant
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    {shop.category} • {shop.address_line}, {shop.area_name}, {shop.city_name}
                  </p>
                </div>
              </div>

              {/* Stats / Badges */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#065f46', color: '#ffffff', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 800 }}>
                    <Star size={14} style={{ fill: '#ffffff' }} />
                    <span>{shop.rating.toFixed(1)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {shop.rating_count} reviews
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={15} style={{ color: 'var(--primary)' }} />
                    <span>{shop.estimated_delivery_min}–{shop.estimated_delivery_max} min</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Express Delivery
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatINR(shop.min_order_amount)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Min. Order
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: shop.base_delivery_fee === 0 ? 'var(--success)' : 'var(--text-main)' }}>
                    {shop.base_delivery_fee === 0 ? 'FREE' : formatINR(shop.base_delivery_fee)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Delivery Fee
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Within Shop & Category Tabs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              <button
                type="button"
                onClick={() => setActiveCategoryTab('all')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 13,
                  fontWeight: 600,
                  border: activeCategoryTab === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: activeCategoryTab === 'all' ? 'var(--primary-light)' : '#ffffff',
                  color: activeCategoryTab === 'all' ? 'var(--primary)' : 'var(--text-main)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                All Products ({products.length})
              </button>

              {distinctCategoryNames.map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setActiveCategoryTab(catName)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                    fontWeight: 600,
                    border: activeCategoryTab === catName ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    background: activeCategoryTab === catName ? 'var(--primary-light)' : '#ffffff',
                    color: activeCategoryTab === catName ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {catName}
                </button>
              ))}
            </div>

            {/* In-Store Search */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={`Search in ${shop.name}...`}
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div style={{ marginBottom: 48 }}>
            {displayedProducts.length === 0 ? (
              <div style={{
                background: '#ffffff',
                padding: '40px 20px',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                border: '1px solid var(--border)'
              }}>
                <ShoppingBag size={40} style={{ color: 'var(--text-light)', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: 18, marginBottom: 4 }}>No products found</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Try changing your search query or select another category above.
                </p>
              </div>
            ) : (
              <div className="products-grid">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    shopName={shop.name}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <section style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 28px',
            border: '1px solid var(--border)',
            marginBottom: 40,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20 }}>Verified Customer Reviews</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Real feedback from customers who ordered same-day delivery from this store
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 800 }}>
                <Star size={18} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                <span>{shop.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                No reviews yet. Be the first customer to order and leave a review!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{rev.user_name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            style={{
                              fill: i < rev.shop_rating ? '#f59e0b' : '#e2e8f0',
                              color: i < rev.shop_rating ? '#f59e0b' : '#cbd5e1'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
                      &ldquo;{rev.review_comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <ProductModal
        product={selectedProduct}
        shopName={shop.name}
        onClose={() => setSelectedProduct(null)}
      />

      <Footer />
      <MobileNav onOpenSearch={onOpenSearch} />
    </>
  );
}
