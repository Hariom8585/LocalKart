import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PlatformConfig, DeliveryFeeSlab } from '../../types';
import { formatINR } from '../../lib/utils';
import { DollarSign, Save, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminDeliveryFeePage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState('');

  const [freeThreshold, setFreeThreshold] = useState<number>(499);
  const [platformFee, setPlatformFee] = useState<number>(5);
  const [defaultCommission, setDefaultCommission] = useState<number>(8);
  const [slabs, setSlabs] = useState<DeliveryFeeSlab[]>([]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/admin/config');
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          setFreeThreshold(data.config.free_delivery_min_order);
          setPlatformFee(data.config.platform_fee);
          setDefaultCommission(data.config.default_commission_rate);
          setSlabs(data.config.delivery_slabs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSlabFeeChange = (index: number, newFee: number) => {
    const updated = [...slabs];
    updated[index].fee = newFee;
    setSlabs(updated);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          free_delivery_min_order: Number(freeThreshold),
          platform_fee: Number(platformFee),
          default_commission_rate: Number(defaultCommission),
          delivery_slabs: slabs,
        }),
      });

      if (res.ok) {
        setSavedMessage('Delivery fee rules & platform rates updated successfully!');
        setTimeout(() => setSavedMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Head>
        <title>Delivery Fee & Platform Pricing | LocalKart Admin</title>
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
              <Link href="/admin/delivery-fee" style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Delivery Pricing</Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 20 }}>
              <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                <span>Back to Admin Overview</span>
              </Link>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24 }}>Configurable Delivery Fee & Monetization</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Configure distance slabs, free shipping thresholds, and commission rules
              </p>
            </div>

            {savedMessage && (
              <div style={{
                padding: '12px 16px',
                background: 'var(--success-bg)',
                color: '#065f46',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <CheckCircle2 size={18} />
                <span>{savedMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 28,
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              {/* Distance Slabs */}
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>Distance Delivery Fee Slabs</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Automatic fee charged to customer based on straight-line distance from store
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {slabs.map((slab, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-muted)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        {i === 0 ? `0 – ${slab.max_km} km` : `${slabs[i - 1].max_km} – ${slab.max_km} km`}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>₹</span>
                        <input
                          type="number"
                          value={slab.fee}
                          onChange={(e) => handleSlabFeeChange(i, Number(e.target.value))}
                          style={{ width: 70, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 13, fontWeight: 700 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free Delivery Threshold */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Free Doorstep Delivery Order Threshold (₹)</label>
                <input
                  type="number"
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Orders at or above this value get FREE delivery</span>
              </div>

              {/* Platform Fee */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Platform Convenience Fee per Order (₹)</label>
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                />
              </div>

              {/* Default Commission Rate */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Default Seller Commission Rate (%)</label>
                <input
                  type="number"
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(Number(e.target.value))}
                  step={0.5}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: 8, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Save size={18} />
                <span>Save Platform Pricing Rules</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
