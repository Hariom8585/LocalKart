import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Order, DeliveryPartner } from '../../types';
import { formatINR } from '../../lib/utils';
import { Bike, ArrowLeft, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';

export default function DeliveryHistoryPage() {
  const { user } = useAuth();
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        const completed = (data.orders || []).filter((o: Order) => o.status === 'delivered');
        setDeliveredOrders(completed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEarnings = deliveredOrders.length * 45;

  return (
    <>
      <Head>
        <title>Delivery Payout History | LocalKart Fleet</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ background: '#0f172a', color: '#ffffff', padding: '14px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>
              Local<span>Kart</span> <span style={{ fontSize: 13, color: '#94a3b8' }}>RIDER FLEET</span>
            </Link>
            <Link href="/delivery" style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
              Active Tasks →
            </Link>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container" style={{ maxWidth: 800 }}>
            <div style={{ marginBottom: 20 }}>
              <Link href="/delivery" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                <span>Back to Rider Tasks</span>
              </Link>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20 }}>Completed Deliveries & Payouts</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Payouts are calculated at ₹45 per successfully delivered doorstep order + tips
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Payout</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)' }}>
                    {formatINR(totalEarnings)}
                  </div>
                </div>
              </div>

              {deliveredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No completed deliveries recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {deliveredOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-light)',
                        flexWrap: 'wrap',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            Delivered Order #{order.order_number}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {order.shop_name} → {order.delivery_area_name} • OTP Verified
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--success)' }}>
                          + {formatINR(45)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Credited to Wallet</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
