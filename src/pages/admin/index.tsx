import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Order, Shop, DeliveryPartner, City } from '../../types';
import { formatINR, getStatusBadgeClass } from '../../lib/utils';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  Bike,
  Building,
  Package,
  Layers,
  Tag,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const [ordersRes, shopsRes, partnersRes, citiesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/shops'),
        fetch('/api/delivery/partners'),
        fetch('/api/cities'),
      ]);

      const oData = await ordersRes.json();
      const sData = await shopsRes.json();
      const pData = await partnersRes.json();
      const cData = await citiesRes.json();

      setOrders(oData.orders || []);
      setShops(sData.shops || []);
      setPartners(pData.partners || []);
      setCities(cData.cities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Compute Platform Metrics
  const totalGMV = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
    .reduce((acc, o) => acc + o.total_amount, 0);

  const platformCommissionEarned = Math.round(totalGMV * 0.08); // 8% average commission
  const activeDeliveries = orders.filter((o) => ['picked_up', 'out_for_delivery'].includes(o.status));

  return (
    <>
      <Head>
        <title>Super Admin Control Center | LocalKart</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Admin Navigation Header */}
        <nav style={{ background: '#0f172a', color: '#ffffff', padding: '14px 0', borderBottom: '1px solid #1e293b' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>
                Local<span>Kart</span>
              </Link>
              <span style={{ color: '#475569' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                <ShieldCheck size={16} style={{ color: '#34d399' }} />
                <span>SUPER ADMIN CONTROL CENTER</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/admin" style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>
                Overview
              </Link>
              <Link href="/admin/cities" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Cities & Areas
              </Link>
              <Link href="/admin/shops" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Shops Moderation
              </Link>
              <Link href="/admin/categories" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Categories
              </Link>
              <Link href="/admin/coupons" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Coupons
              </Link>
              <Link href="/admin/delivery-fee" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Delivery Pricing
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container">
            {/* Header */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 24 }}>Platform Executive Overview</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Hyperlocal operational metrics across {cities.length} Indian cities
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/admin/cities" className="btn btn-outline btn-sm">
                  <Building size={14} />
                  <span>Expand to New City</span>
                </Link>
                <Link href="/" className="btn btn-primary btn-sm">
                  View Customer App →
                </Link>
              </div>
            </div>

            {/* Platform Metrics Grid */}
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-icon emerald">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="stat-value">{formatINR(totalGMV)}</div>
                  <div className="stat-label">Total Platform GMV</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <Package size={24} />
                </div>
                <div>
                  <div className="stat-value">{orders.length}</div>
                  <div className="stat-label">Total Lifetime Orders</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">
                  <Store size={24} />
                </div>
                <div>
                  <div className="stat-value">{shops.length}</div>
                  <div className="stat-label">Active Neighborhood Stores</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber">
                  <Bike size={24} />
                </div>
                <div>
                  <div className="stat-value">{partners.length}</div>
                  <div className="stat-label">Active Delivery Fleet</div>
                </div>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}>
              <Link
                href="/admin/cities"
                style={{
                  background: '#ffffff',
                  padding: 18,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Multi-City Expansion</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cities.length} Cities Active</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
              </Link>

              <Link
                href="/admin/shops"
                style={{
                  background: '#ffffff',
                  padding: 18,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Store Verification & KYC</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Approve / Suspend Shops</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
              </Link>

              <Link
                href="/admin/categories"
                style={{
                  background: '#ffffff',
                  padding: 18,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Dynamic Categories</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Add / Edit Categories</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
              </Link>

              <Link
                href="/admin/delivery-fee"
                style={{
                  background: '#ffffff',
                  padding: 18,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Delivery Fee Slabs</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure Distance Rules</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
              </Link>
            </div>

            {/* Master Order Monitor Across All Cities */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 18 }}>Platform Master Orders Monitor</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Real-time transaction stream across Ludhiana, Chandigarh, and Delhi
                  </p>
                </div>
                <span className="badge badge-primary">
                  {orders.length} Live Orders
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700, fontSize: 12 }}>
                      <th style={{ padding: '12px 14px' }}>Order #</th>
                      <th style={{ padding: '12px 14px' }}>Customer</th>
                      <th style={{ padding: '12px 14px' }}>Shop & City</th>
                      <th style={{ padding: '12px 14px' }}>Amount</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px' }}>Rider</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Track</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                          #{o.order_number}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.delivery_area_name}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600 }}>{o.shop_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.delivery_city_name}</div>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                          {formatINR(o.total_amount)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`badge ${getStatusBadgeClass(o.status)}`}>
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                          {o.delivery_partner_name || 'Unassigned'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <Link
                            href={`/orders/${o.id}`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                          >
                            <span>Inspect</span>
                            <ExternalLink size={12} />
                          </Link>
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
