import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Coupon, City } from '../../types';
import { formatINR } from '../../lib/utils';
import { Tag, Plus, CheckCircle2, ArrowLeft, Percent, Calendar } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // New Coupon form
  const [isAdding, setIsAdding] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrder, setMinOrder] = useState(299);
  const [maxDiscount, setMaxDiscount] = useState(100);
  const [cityId, setCityId] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [perUserLimit, setPerUserLimit] = useState<number | ''>('');

  const loadCoupons = async () => {
    try {
      const [cRes, citiesRes] = await Promise.all([
        fetch('/api/coupons'),
        fetch('/api/cities'),
      ]);
      const cData = await cRes.json();
      const citiesData = await citiesRes.json();
      setCoupons(cData.coupons || []);
      setCities(citiesData.cities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          description,
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_order_amount: Number(minOrder),
          max_discount_amount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
          city_id: cityId || undefined,
          usage_limit: usageLimit === '' ? undefined : Number(usageLimit),
          usage_limit_per_user: perUserLimit === '' ? undefined : Number(perUserLimit),
        }),
      });

      if (res.ok) {
        setCode('');
        setDescription('');
        setIsAdding(false);
        await loadCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Head>
        <title>Coupons & Promo Codes | LocalKart Admin</title>
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
              <Link href="/admin/categories" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Categories</Link>
              <Link href="/admin/coupons" style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Coupons</Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container" style={{ maxWidth: 880 }}>
            <div style={{ marginBottom: 20 }}>
              <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                <span>Back to Admin Overview</span>
              </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24 }}>Promotional Coupons & Discounts</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Create percentage or flat discount vouchers with minimum order and city restrictions
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} />
                <span>Create New Coupon</span>
              </button>
            </div>

            {isAdding && (
              <form onSubmit={handleCreateCoupon} style={{
                background: '#ffffff',
                border: '2px solid var(--primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: 18 }}>Create Promo Voucher</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Coupon Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. FESTIVE30"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13, textTransform: 'uppercase' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e: any) => setDiscountType(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="flat">Flat Discount (₹)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>
                      Discount Value ({discountType === 'percentage' ? '%' : '₹'}) *
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      required
                      min={1}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Min. Order Required (₹)</label>
                    <input
                      type="number"
                      value={minOrder}
                      onChange={(e) => setMinOrder(Number(e.target.value))}
                      min={0}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>

                  {discountType === 'percentage' && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700 }}>Max Discount Cap (₹)</label>
                      <input
                        type="number"
                        value={maxDiscount}
                        onChange={(e) => setMaxDiscount(Number(e.target.value))}
                        min={1}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>City Restriction</label>
                    <select
                      value={cityId}
                      onChange={(e) => setCityId(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    >
                      <option value="">All Supported Cities</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Total Usage Limit</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                      min={1}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Limit Per Customer</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={perUserLimit}
                      onChange={(e) => setPerUserLimit(e.target.value === '' ? '' : Number(e.target.value))}
                      min={1}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF on all grocery orders above ₹299"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setIsAdding(false)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Publish Coupon
                  </button>
                </div>
              </form>
            )}

            {/* Coupons List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {coupons.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 18,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: 'var(--primary)',
                      background: 'var(--primary-light)',
                      padding: '4px 10px',
                      borderRadius: 4,
                      letterSpacing: '0.05em'
                    }}>
                      {c.code}
                    </span>
                    <span className="badge badge-success">ACTIVE</span>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-main)', margin: '8px 0', lineHeight: 1.4 }}>
                    {c.description || `${c.discount_type === 'flat' ? `₹${c.discount_value} FLAT` : `${c.discount_value}%`} OFF`}
                  </p>

                  <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                    <div>Min. Order: {formatINR(c.min_order_amount)}</div>
                    {c.max_discount_amount && <div>Max Cap: {formatINR(c.max_discount_amount)}</div>}
                    <div>
                      Redeemed: {c.usage_count ?? 0}
                      {c.usage_limit != null ? ` / ${c.usage_limit}` : ' / Unlimited'}
                    </div>
                    <div>
                      Per Customer: {c.usage_limit_per_user != null ? c.usage_limit_per_user : 'Unlimited'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
