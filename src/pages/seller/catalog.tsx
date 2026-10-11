import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Product, Shop, Category } from '../../types';
import { formatINR } from '../../lib/utils';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Search,
  ArrowLeft
} from 'lucide-react';

export default function SellerCatalogPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('cat-grocery');
  const [unit, setUnit] = useState('1 piece');
  const [originalPrice, setOriginalPrice] = useState<number>(100);
  const [discountedPrice, setDiscountedPrice] = useState<number>(89);
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const loadCatalog = async () => {
    try {
      const shopsRes = await fetch('/api/shops');
      const shopsData = await shopsRes.json();
      const myShop = (shopsData.shops || []).find((s: Shop) => s.seller_id === user?.id) || shopsData.shops[0];
      setShop(myShop);

      if (myShop) {
        const [prodsRes, catsRes] = await Promise.all([
          fetch(`/api/products?shopId=${myShop.id}`),
          fetch('/api/categories'),
        ]);
        const prodsData = await prodsRes.json();
        const catsData = await catsRes.json();
        setProducts(prodsData.products || []);
        setCategories(catsData.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategoryId(categories[0]?.id || 'cat-grocery');
    setUnit('1 kg pack');
    setOriginalPrice(120);
    setDiscountedPrice(99);
    setStockQuantity(40);
    setImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand || '');
    setCategoryId(p.category_id);
    setUnit(p.unit);
    setOriginalPrice(p.original_price);
    setDiscountedPrice(p.discounted_price);
    setStockQuantity(p.stock_quantity);
    setImageUrl(p.image_url);
    setDescription(p.description);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    const payload = {
      shop_id: shop.id,
      name,
      brand,
      category_id: categoryId,
      unit,
      original_price: Number(originalPrice),
      discounted_price: Number(discountedPrice),
      stock_quantity: Number(stockQuantity),
      image_url: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      description,
      is_available: Number(stockQuantity) > 0,
    };

    try {
      if (editingProduct) {
        // PUT
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // POST
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      await loadCatalog();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you sure you want to delete this product from your store catalog?')) return;
    try {
      await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      await loadCatalog();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <Head>
        <title>{`Store Catalog & Inventory | ${shop?.name || 'Seller Center'}`}</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation */}
        <nav style={{ background: '#ffffff', borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
                Local<span style={{ color: 'var(--secondary)' }}>Kart</span>
              </Link>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{shop?.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href="/seller" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Orders
              </Link>
              <Link href="/seller/catalog" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                Catalog & Stock
              </Link>
              <Link href="/seller/settings" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Store Settings
              </Link>
              <Link href={`/shops/${shop?.slug || shop?.id}`} className="btn btn-outline btn-sm">
                Live Storefront →
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container">
            {/* Header with Search & Add Product CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 24,
            }}>
              <div>
                <h1 style={{ fontSize: 24 }}>Product Catalog & Inventory</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Manage items, prices, discounts, and real-time stock availability for your store
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search your catalog..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: 13
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700, fontSize: 12 }}>
                      <th style={{ padding: '12px 16px' }}>Product</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Price / MRP</th>
                      <th style={{ padding: '12px 16px' }}>Discount</th>
                      <th style={{ padding: '12px 16px' }}>Stock Level</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                          No products match your search.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((prod) => {
                        const isLowStock = prod.stock_quantity <= prod.low_stock_threshold;
                        const isOutOfStock = prod.stock_quantity <= 0;

                        return (
                          <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img
                                  src={prod.image_url}
                                  alt={prod.name}
                                  style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: 'var(--bg-muted)' }}
                                />
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{prod.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prod.brand} • {prod.unit}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                              {prod.category_name || prod.category_id}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                                {formatINR(prod.discounted_price)}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-light)', textDecoration: 'line-through' }}>
                                {formatINR(prod.original_price)}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {prod.discount_percentage > 0 ? (
                                <span style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', fontWeight: 800, fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>
                                  {prod.discount_percentage}% OFF
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-light)' }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{prod.stock_quantity}</span>
                                {isLowStock && !isOutOfStock && (
                                  <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--warning-bg)', color: '#92400e', padding: '2px 6px', borderRadius: 4 }}>
                                    LOW
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {isOutOfStock ? (
                                <span className="badge badge-danger">Out of Stock</span>
                              ) : (
                                <span className="badge badge-success">In Stock</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(prod)}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px' }}
                                  title="Edit Product"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                                  title="Delete Product"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Add/Edit Product Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
              <h3 style={{ fontSize: 18, marginBottom: 16 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product to Store'}
              </h3>

              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Amul Salted Butter 500g"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Brand</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Amul, Fortune, Britannia"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Unit / Pack Size *</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      required
                      placeholder="e.g. 500 g, 1 Litre, 1 Pack"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>MRP / Original Price (₹) *</label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      required
                      min={1}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Discounted / Selling Price (₹) *</label>
                    <input
                      type="number"
                      value={discountedPrice}
                      onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                      required
                      min={1}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Stock Quantity *</label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      required
                      min={0}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Brief description..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingProduct ? 'Update Product' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
