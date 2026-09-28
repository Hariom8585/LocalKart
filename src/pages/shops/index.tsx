import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/layout/Navbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { ShopCard } from '../../components/customer/ShopCard';
import { useLocation } from '../../context/LocationContext';
import { Shop, Category } from '../../types';
import {
  Filter,
  SlidersHorizontal,
  Star,
  Clock,
  MapPin,
  Check,
  Search,
  Zap
} from 'lucide-react';

interface ShopsPageProps {
  onOpenSearch?: () => void;
}

export default function ShopsPage({ onOpenSearch }: ShopsPageProps) {
  const router = useRouter();
  const { category: queryCategory, search: querySearch } = router.query;
  const { selectedCity, selectedArea } = useLocation();

  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCatSlug, setSelectedCatSlug] = useState<string>(
    typeof queryCategory === 'string' ? queryCategory : 'all'
  );
  const [onlyOpenNow, setOnlyOpenNow] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0); // 0, 4.0, 4.5
  const [maxDeliveryTime, setMaxDeliveryTime] = useState<number>(100); // 30, 45, 60
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'deliveryTime' | 'distance'>('relevance');

  useEffect(() => {
    if (typeof queryCategory === 'string') {
      setSelectedCatSlug(queryCategory);
    }
  }, [queryCategory]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [shopsRes, catsRes] = await Promise.all([
          fetch(`/api/shops?cityId=${selectedCity.id}&areaId=${selectedArea.id}${querySearch ? `&search=${encodeURIComponent(querySearch as string)}` : ''}`),
          fetch('/api/categories'),
        ]);
        const shopsData = await shopsRes.json();
        const catsData = await catsRes.json();
        setShops(shopsData.shops || []);
        setCategories(catsData.categories || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCity.id, selectedArea.id, querySearch]);

  // Apply Client Filters & Sorting
  let filteredShops = [...shops];

  if (selectedCatSlug !== 'all') {
    filteredShops = filteredShops.filter(
      (s) =>
        s.category_id === selectedCatSlug ||
        s.category.toLowerCase().includes(selectedCatSlug.toLowerCase())
    );
  }

  if (onlyOpenNow) {
    filteredShops = filteredShops.filter((s) => s.is_open);
  }

  if (minRating > 0) {
    filteredShops = filteredShops.filter((s) => s.rating >= minRating);
  }

  if (maxDeliveryTime < 100) {
    filteredShops = filteredShops.filter((s) => s.estimated_delivery_max <= maxDeliveryTime);
  }

  if (freeDeliveryOnly) {
    filteredShops = filteredShops.filter((s) => s.base_delivery_fee === 0);
  }

  // Sorting
  if (sortBy === 'rating') {
    filteredShops.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'deliveryTime') {
    filteredShops.sort((a, b) => a.estimated_delivery_min - b.estimated_delivery_min);
  } else if (sortBy === 'distance') {
    filteredShops.sort((a, b) => (a.distance_km || 2) - (b.distance_km || 2));
  }

  return (
    <>
      <Head>
        <title>{`Local Shops & Stores in ${selectedArea.name}, ${selectedCity.name} | LocalKart`}</title>
      </Head>

      <Navbar onOpenSearch={onOpenSearch} />

      <main className="main-content">
        <div className="container" style={{ paddingTop: 24 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Home</span>
              <span>/</span>
              <span>{selectedCity.name}</span>
              <span>/</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedArea.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 26, lineHeight: 1.2 }}>
                  Shops Delivering to {selectedArea.name}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                  {filteredShops.length} neighborhood stores open for same-day delivery
                </p>
              </div>

              {/* Sorting dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-main)',
                  }}
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating: High to Low</option>
                  <option value="deliveryTime">Fastest Delivery</option>
                  <option value="distance">Distance: Nearest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 14,
            marginBottom: 24,
            borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)', flexShrink: 0 }}>
              <Filter size={15} />
              <span>Filters:</span>
            </span>

            {/* Category Filter */}
            <select
              value={selectedCatSlug}
              onChange={(e) => setSelectedCatSlug(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: selectedCatSlug !== 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: selectedCatSlug !== 'all' ? 'var(--primary-light)' : '#ffffff',
                color: selectedCatSlug !== 'all' ? 'var(--primary)' : 'var(--text-main)',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Open Now Toggle */}
            <button
              type="button"
              onClick={() => setOnlyOpenNow(!onlyOpenNow)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: onlyOpenNow ? '1.5px solid var(--success)' : '1px solid var(--border)',
                background: onlyOpenNow ? 'var(--success-bg)' : '#ffffff',
                color: onlyOpenNow ? '#065f46' : 'var(--text-main)',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Open Now</span>
              {onlyOpenNow && <Check size={14} />}
            </button>

            {/* Rating 4.5+ */}
            <button
              type="button"
              onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: minRating === 4.5 ? '1.5px solid #065f46' : '1px solid var(--border)',
                background: minRating === 4.5 ? 'var(--success-bg)' : '#ffffff',
                color: minRating === 4.5 ? '#065f46' : 'var(--text-main)',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <span>4.5+ Rated</span>
              {minRating === 4.5 && <Check size={14} />}
            </button>

            {/* Under 45 Mins */}
            <button
              type="button"
              onClick={() => setMaxDeliveryTime(maxDeliveryTime === 45 ? 100 : 45)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: maxDeliveryTime === 45 ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: maxDeliveryTime === 45 ? 'var(--primary-light)' : '#ffffff',
                color: maxDeliveryTime === 45 ? 'var(--primary)' : 'var(--text-main)',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Clock size={14} />
              <span>Under 45 Mins</span>
              {maxDeliveryTime === 45 && <Check size={14} />}
            </button>

            {/* Free Delivery */}
            <button
              type="button"
              onClick={() => setFreeDeliveryOnly(!freeDeliveryOnly)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: freeDeliveryOnly ? '1.5px solid var(--secondary)' : '1px solid var(--border)',
                background: freeDeliveryOnly ? 'var(--secondary-light)' : '#ffffff',
                color: freeDeliveryOnly ? 'var(--secondary)' : 'var(--text-main)',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Zap size={14} />
              <span>Free Delivery</span>
              {freeDeliveryOnly && <Check size={14} />}
            </button>
          </div>

          {/* Shops Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Finding local stores near you...
            </div>
          ) : filteredShops.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px 20px',
              textAlign: 'center',
              margin: '20px 0'
            }}>
              <MapPin size={48} style={{ color: 'var(--text-light)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>No matching shops found</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 20px' }}>
                Try resetting your filters or selecting another locality in {selectedCity.name}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCatSlug('all');
                  setOnlyOpenNow(false);
                  setMinRating(0);
                  setMaxDeliveryTime(100);
                  setFreeDeliveryOnly(false);
                }}
                className="btn btn-outline btn-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="shops-grid">
              {filteredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav onOpenSearch={onOpenSearch} />
    </>
  );
}
