import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/layout/Navbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { formatINR, getStatusBadgeClass } from '../../lib/utils';
import { Package, Clock, Store, ChevronRight, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OrdersHistoryPage({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      setOrders([]);
      return;
    }

    async function loadOrders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?userId=${user?.id || ''}`);
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [isLoggedIn, user]);

  return (
    <>
      <Head>
        <title>My Orders | LocalKart Same-Day Delivery</title>
      </Head>

      <Navbar onOpenSearch={onOpenSearch} />

      <main className="main-content">
        <div className="container" style={{ paddingTop: 28, maxWidth: 840 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24 }}>My Orders & Deliveries</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Track real-time status and view receipts for orders placed in your city
            </p>
          </div>

          {!isLoggedIn || !user ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <Package size={48} style={{ color: 'var(--text-light)', margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>Sign in to view your orders</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Please log in or create an account to view and track your orders.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link href="/customer/login?redirect=/orders" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                  Log In
                </Link>
                <Link href="/customer/signup?redirect=/orders" className="btn btn-outline btn-sm" style={{ fontWeight: 700 }}>
                  Sign Up
                </Link>
              </div>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <Package size={48} style={{ color: 'var(--text-light)', margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>No orders found yet</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Order fresh groceries, bread, sweets, or essentials from nearby stores with same-day delivery.
              </p>
              <button onClick={() => router.push('/shops')} className="btn btn-primary btn-sm">
                Explore Local Shops
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    padding: 20,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                    paddingBottom: 14,
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: 14
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Store size={16} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{order.shop_name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Order #{order.order_number} • Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-main)' }}>
                          {item.quantity}x {item.product_name}
                        </span>
                        <span style={{ fontWeight: 600 }}>{formatINR(item.total_price)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer with Total & Track CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px dashed var(--border)',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Amount: </span>
                      <strong style={{ fontSize: 16, color: 'var(--text-main)' }}>{formatINR(order.total_amount)}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Link
                        href={`/orders/${order.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <span>Live Tracking</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
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
