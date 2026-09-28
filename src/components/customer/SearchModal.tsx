import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Shop, Product } from '../../types';
import { useLocation } from '../../context/LocationContext';
import { formatINR } from '../../lib/utils';
import { Search, X, Store, Package, ArrowRight, History } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const router = useRouter();
  const { selectedCity, selectedArea } = useLocation();
  const [query, setQuery] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const recentSearches = ['Amul Milk', 'Fortune Atta', 'Crocin', 'Chocolate Truffle Cake', 'Verka Paneer'];

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setShops([]);
      setProducts([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setShops([]);
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [shopsRes, prodsRes] = await Promise.all([
          fetch(`/api/shops?cityId=${selectedCity.id}&areaId=${selectedArea.id}&search=${encodeURIComponent(query)}`),
          fetch(`/api/products?search=${encodeURIComponent(query)}`),
        ]);

        const shopsData = await shopsRes.json();
        const prodsData = await prodsRes.json();

        setShops(shopsData.shops || []);
        setProducts(prodsData.products || []);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedCity.id, selectedArea.id]);

  if (!isOpen) return null;

  const handleShopClick = (shop: Shop) => {
    onClose();
    router.push(`/shops/${shop.slug || shop.id}`);
  };

  const handleProductClick = (product: Product) => {
    onClose();
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      router.push(`/shops/${product.shop_id}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }}
      >
        {/* Search Bar Input */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <Search size={20} style={{ color: 'var(--primary)' }} />
          <input
            type="text"
            placeholder={`Search in ${selectedArea.name}, ${selectedCity.name}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              fontSize: 16,
              color: 'var(--text-main)',
              background: 'transparent'
            }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          )}
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: 20 }}>
          {!query.trim() ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={14} />
                <span>Trending Local Searches</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-muted)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 13,
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 14 }}>
              Searching nearby stores in {selectedArea.name}...
            </div>
          ) : shops.length === 0 && products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>
                No shops or products found for &ldquo;{query}&rdquo;
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Try searching for common essentials like &quot;milk&quot;, &quot;bread&quot;, or &quot;pharmacy&quot;.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Shops Matches */}
              {shops.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Store size={14} style={{ color: 'var(--primary)' }} />
                    <span>Nearby Shops ({shops.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {shops.map((shop) => (
                      <div
                        key={shop.id}
                        onClick={() => handleShopClick(shop)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: 'var(--bg-muted)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={shop.logo_url}
                            alt={shop.name}
                            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                              {shop.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {shop.category} • {shop.estimated_delivery_min}-{shop.estimated_delivery_max} mins
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Matches */}
              {products.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Package size={14} style={{ color: 'var(--primary)' }} />
                    <span>Products ({products.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={product.image_url}
                            alt={product.name}
                            style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {product.shop_name} • {product.unit}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                          {formatINR(product.discounted_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
