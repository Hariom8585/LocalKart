

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Category } from '../../types';
import { Plus, Trash2, ArrowLeft, Layers } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(10);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          image_url: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
          display_order: Number(displayOrder),
        }),
      });

      if (res.ok) {
        setName('');
        setImageUrl('');
        setIsAdding(false);
        await loadCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      await loadCategories();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Head>
        <title>Dynamic Categories | LocalKart Admin</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ background: '#0f172a', color: '#ffffff', padding: '14px 0', borderBottom: '1px solid #1e293b' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>
                Local<span>Kart</span>
              </Link>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>SUPER ADMIN</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/admin" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Overview</Link>
              <Link href="/admin/cities" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Cities & Areas</Link>
              <Link href="/admin/shops" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Shops</Link>
              <Link href="/admin/categories" style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Categories</Link>
              <Link href="/admin/coupons" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Coupons</Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container" style={{ maxWidth: 840 }}>
            <div style={{ marginBottom: 20 }}>
              <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                <span>Back to Admin Overview</span>
              </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24 }}>Dynamic Marketplace Categories</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Add, configure, and reorder product categories shown across consumer apps
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            </div>

            {isAdding && (
              <form onSubmit={handleCreateCategory} style={{
                background: '#ffffff',
                border: '2px solid var(--primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}>
                <h3 style={{ fontSize: 18 }}>New Marketplace Category</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic Dairy & Eggs"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Display Priority</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setIsAdding(false)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Create Category
                  </button>
                </div>
              </form>
            )}

            {/* Categories Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Order: #{cat.display_order}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{ color: 'var(--danger)', padding: 6 }}
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
