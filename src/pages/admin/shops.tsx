import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shop } from '../../types';
import { formatINR } from '../../lib/utils';
import { Store, ShieldCheck, Check, X, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionRates, setCommissionRates] = useState<Record<string, number>>({});

  const loadShops = async () => {
    try {
      const res = await fetch('/api/shops');
      const data = await res.json();
      setShops(data.shops || []);

      const rates: Record<string, number> = {};
      (data.shops || []).forEach((s: Shop) => {
        rates[s.id] = s.commission_rate || 8.0;
      });
      setCommissionRates(rates);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleToggleVerification = async (shop: Shop) => {
    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !shop.is_verified }),
      });
      if (res.ok) await loadShops();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSuspension = async (shop: Shop) => {
    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_suspended: !shop.is_suspended }),
      });
      if (res.ok) await loadShops();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCommission = async (shopId: string) => {
    const rate = commissionRates[shopId];
    try {
      const res = await fetch(`/api/shops/${shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission_rate: Number(rate) }),
      });
      if (res.ok) {
        alert('Commission rate updated!');
        await loadShops();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Head>
        <title>Shop Moderation & KYC | LocalKart Admin</title>
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
              <Link href="/admin/shops" style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Shops Moderation</Link>
              <Link href="/admin/categories" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Categories</Link>
              <Link href="/admin/coupons" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Coupons</Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container">
            <div style={{ marginBottom: 20 }}>
              <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                <span>Back to Admin Overview</span>
              </Link>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24 }}>Store Moderation & Merchant Commission</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Approve verified neighborhood merchants, set platform commission %, and monitor operational status
              </p>
            </div>

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
                      <th style={{ padding: '12px 16px' }}>Shop & City</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Rating</th>
                      <th style={{ padding: '12px 16px' }}>Commission %</th>
                      <th style={{ padding: '12px 16px' }}>KYC Status</th>
                      <th style={{ padding: '12px 16px' }}>Store Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={s.logo_url}
                              alt={s.name}
                              style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.area_name}, {s.city_name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{s.category}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                          ⭐ {s.rating.toFixed(1)} ({s.rating_count})
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="number"
                              value={commissionRates[s.id] ?? s.commission_rate}
                              onChange={(e) => setCommissionRates({ ...commissionRates, [s.id]: Number(e.target.value) })}
                              step={0.5}
                              min={0}
                              max={30}
                              style={{ width: 64, padding: '4px 6px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 12, fontWeight: 700 }}
                            />
                            <span style={{ fontSize: 12 }}>%</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCommission(s.id)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '2px 6px', fontSize: 11 }}
                            >
                              Save
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {s.is_verified ? (
                            <span className="badge badge-success">Verified</span>
                          ) : (
                            <span className="badge badge-warning">Pending Review</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {s.is_suspended ? (
                            <span className="badge badge-danger">Suspended</span>
                          ) : s.is_open ? (
                            <span className="badge badge-success">Open</span>
                          ) : (
                            <span className="badge badge-default">Closed</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => handleToggleVerification(s)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 10px', fontSize: 11 }}
                            >
                              {s.is_verified ? 'Revoke KYC' : 'Approve KYC'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleSuspension(s)}
                              className="btn btn-outline btn-sm"
                              style={{
                                padding: '4px 10px',
                                fontSize: 11,
                                color: s.is_suspended ? 'var(--success)' : 'var(--danger)',
                                borderColor: s.is_suspended ? 'var(--success)' : 'var(--danger)'
                              }}
                            >
                              {s.is_suspended ? 'Unsuspend' : 'Suspend'}
                            </button>
                            <Link
                              href={`/shops/${s.slug || s.id}`}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px' }}
                              title="Inspect Storefront"
                            >
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
