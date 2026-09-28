import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { Footer } from '../components/layout/Footer';
import { ShopCard } from '../components/customer/ShopCard';
import { ProductCard } from '../components/customer/ProductCard';
import { ProductModal } from '../components/customer/ProductModal';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { Shop, Product, Category } from '../types';
import {
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Percent,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface HomePageProps {
  onOpenSearch?: () => void;
}

export default function HomePage({ onOpenSearch }: HomePageProps) {
  const router = useRouter();
  const { selectedCity, selectedArea, setIsLocationModalOpen } = useLocation();
  const { addToCart } = useCart();

  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [shopsRes, catsRes, prodsRes] = await Promise.all([
          fetch(`/api/shops?cityId=${selectedCity.id}&areaId=${selectedArea.id}`),
          fetch('/api/categories'),
          fetch('/api/products?featuredOnly=true'),
        ]);

        const shopsData = await shopsRes.json();
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();

        setShops(shopsData.shops || []);
        setCategories(catsData.categories || []);
        setPopularProducts(prodsData.products || []);
      } catch (e) {
        console.error('Failed to fetch homepage data', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCity.id, selectedArea.id]);

  return (
    <>
      <Head>
        <title>{`LocalKart | Your Local Shops. Delivered Today in ${selectedCity.name}`}</title>
      </Head>

      <Navbar onOpenSearch={onOpenSearch} />

      <main className="main-content">
        <div className="container">
          {/* HERO SECTION */}
          <section className="hero-section">
            <div className="hero-container">
              <div className="hero-pill">
                <Zap size={14} style={{ fill: '#6ee7b7', flexShrink: 0 }} />
                <span>GUARANTEED SAME-DAY DOORSTEP DELIVERY</span>
              </div>

              <h1 className="hero-title">
                Your Local Shops. <span>Delivered Today.</span>
              </h1>

              <p className="hero-subtitle">
                Shop from trusted neighborhood stores near you in <strong>{selectedArea.name}, {selectedCity.name}</strong> and get genuine products delivered to your doorstep in 30–60 minutes.
              </p>

              {/* Location + Search in Hero */}
              <div className="hero-search-box">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="hero-location-btn"
                >
                  <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>{selectedArea.name}</span>
                </button>

                <input
                  type="text"
                  placeholder='Search groceries, bakery, medicines, essentials...'
                  className="hero-search-input"
                  onClick={() => onOpenSearch && onOpenSearch()}
                  readOnly
                />

                <button
                  type="button"
                  onClick={() => onOpenSearch && onOpenSearch()}
                  className="btn btn-primary hero-search-btn"
                >
                  <Search size={16} />
                  <span>Search</span>
                </button>
              </div>

              {/* Value Props */}
              <div className="hero-features">
                <div className="hero-feature-item">
                  <Clock size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span>30–60 Mins Express Delivery</span>
                </div>
                <div className="hero-feature-item">
                  <ShieldCheck size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span>100% Genuine Neighborhood Retailers</span>
                </div>
                <div className="hero-feature-item">
                  <Percent size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span>Local Store Pricing & Offers</span>
                </div>
              </div>
            </div>
          </section>

          {/* OFFERS BANNER STRIP */}
          <section style={{ marginBottom: 32 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, background: '#f59e0b', color: '#ffffff', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                    NEW USER PROMO
                  </span>
                  <h4 style={{ fontSize: 16, marginTop: 6, color: '#78350f' }}>
                    Flat ₹50 OFF on 1st Order
                  </h4>
                  <p style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>
                    Use code <strong style={{ color: '#b45309' }}>WELCOME50</strong> on orders above ₹199
                  </p>
                </div>
                <Percent size={32} style={{ color: '#d97706', opacity: 0.6 }} />
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, background: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                    FREE DELIVERY
                  </span>
                  <h4 style={{ fontSize: 16, marginTop: 6, color: '#064e3b' }}>
                    Zero Delivery Fee over ₹499
                  </h4>
                  <p style={{ fontSize: 12, color: '#065f46', marginTop: 2 }}>
                    Auto applied on all local grocery and bakery orders
                  </p>
                </div>
                <Zap size={32} style={{ color: '#059669', opacity: 0.6 }} />
              </div>
            </div>
          </section>

          {/* CATEGORIES SECTION */}
          <section style={{ marginBottom: 40 }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">Explore Categories</h2>
                <p className="section-subtitle">Browse products from your local marketplace</p>
              </div>
              <Link href="/shops" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>See All Shops</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="category-scroll">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shops?category=${category.slug}`}
                  className="category-card"
                >
                  <div className="category-avatar">
                    <img src={category.image_url} alt={category.name} loading="lazy" />
                  </div>
                  <span className="category-name">{category.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* NEARBY SHOPS IN SELECTED AREA */}
          <section style={{ marginBottom: 44 }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  Featured Local Stores in {selectedArea.name}
                </h2>
                <p className="section-subtitle">
                  Showing {shops.length} verified shops delivering to your location today
                </p>
              </div>
              <Link href="/shops" className="btn btn-outline btn-sm">
                View All Nearby ({shops.length})
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Loading local shops...
              </div>
            ) : shops.length === 0 ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <MapPin size={36} style={{ color: 'var(--text-light)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>No shops serving {selectedArea.name} currently</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 18px' }}>
                  Please try selecting a neighboring area in {selectedCity.name} or switch cities to discover available stores.
                </p>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="btn btn-primary btn-sm"
                >
                  Change Location
                </button>
              </div>
            ) : (
              <div className="shops-grid">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            )}
          </section>

          {/* POPULAR LOCAL PRODUCTS */}
          <section style={{ marginBottom: 44 }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">Popular Daily Essentials</h2>
                <p className="section-subtitle">Top selling products from certified neighborhood shops</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                <TrendingUp size={16} />
                <span>Trending Today</span>
              </div>
            </div>

            <div className="products-grid">
              {popularProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={(p) => setSelectedProductForModal(p)}
                />
              ))}
            </div>
          </section>

          {/* WHY BUY LOCAL SECTION */}
          <section style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 28px',
            marginBottom: 44,
            border: '1px solid var(--border)'
          }}>
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                THE LOCALKART ADVANTAGE
              </span>
              <h2 style={{ fontSize: 26, marginTop: 8, marginBottom: 8 }}>
                Why Shop from Your Neighborhood Stores?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Unlike distant e-commerce fulfillment hubs that ship over days, LocalKart connects you with the shops you already know and love in your own city.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <div style={{ background: '#ffffff', padding: 22, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Clock size={20} />
                </div>
                <h4 style={{ fontSize: 16, marginBottom: 6 }}>Delivered Today</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Get orders delivered directly to your doorstep in 30–60 minutes, not 3–5 days.
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: 22, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <ShoppingBag size={20} />
                </div>
                <h4 style={{ fontSize: 16, marginBottom: 6 }}>Support Local Retail</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Every purchase supports local merchants and local delivery riders in your community.
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: 22, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <ShieldCheck size={20} />
                </div>
                <h4 style={{ fontSize: 16, marginBottom: 6 }}>Guaranteed Freshness</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Fresh artisan bakery, farm vegetables, and pure dairy packed right before dispatch.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Product Details Modal */}
      <ProductModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />

      <Footer />
      <MobileNav onOpenSearch={onOpenSearch} />
    </>
  );
}
