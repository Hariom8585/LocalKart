import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { Footer } from '../../components/layout/Footer';
import { Order, Shop, Product } from '../../types';
import { formatINR, getStatusBadgeClass } from '../../lib/utils';
import {
  Store,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ListOrdered,
  Settings,
  AlertTriangle
} from 'lucide-react';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, currentRole } = useAuth();

  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Item currently unavailable at shop');

  // Acceptance prep time selector
  const [prepTimes, setPrepTimes] = useState<Record<string, number>>({});

  const loadSellerData = async () => {
    try {
      // Find shop matching seller
      const shopsRes = await fetch('/api/shops');
      const shopsData = await shopsRes.json();
      const myShop = (shopsData.shops || []).find((s: Shop) => s.seller_id === user?.id) || shopsData.shops[0];
      setShop(myShop);

      if (myShop) {
        const [ordersRes, prodsRes] = await Promise.all([
          fetch(`/api/orders?shopId=${myShop.id}`),
          fetch(`/api/products?shopId=${myShop.id}`),
        ]);
        const ordersData = await ordersRes.json();
        const prodsData = await prodsRes.json();
        setOrders(ordersData.orders || []);
        setProducts(prodsData.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
    const interval = setInterval(loadSellerData, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Order action handlers
  const handleAcceptOrder = async (orderId: string) => {
    const minutes = prepTimes[orderId] || 25;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'preparing',
          seller_preparation_minutes: minutes,
        }),
      });
      if (res.ok) {
        await loadSellerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkReadyForPickup = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ready_for_pickup',
        }),
      });
      if (res.ok) {
        await loadSellerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectOrderId) return;
    try {
      const res = await fetch(`/api/orders/${rejectOrderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: rejectReason,
        }),
      });
      if (res.ok) {
        setRejectOrderId(null);
        await loadSellerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics
  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
    .reduce((acc, o) => acc + o.total_amount, 0);

  const pendingOrders = orders.filter((o) =>
    ['order_confirmed', 'seller_accepted', 'preparing'].includes(o.status)
  );

  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const lowStockCount = products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length;

  return (
    <>
      <Head>
        <title>Seller Dashboard | LocalKart Merchant Center</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Seller Navigation Bar */}
        <nav style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border)',
          padding: '14px 0',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
                Local<span style={{ color: 'var(--secondary)' }}>Kart</span>
              </Link>
              <span style={{ color: 'var(--border)' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                <Store size={16} style={{ color: 'var(--secondary)' }} />
                <span>{shop?.name || 'Seller Dashboard'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href="/seller" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                Orders
              </Link>
              <Link href="/seller/catalog" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Catalog & Stock
              </Link>
              <Link href="/seller/settings" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Store Settings
              </Link>
              <Link href="/" className="btn btn-outline btn-sm">
                View Storefront →
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container">
            {/* Store Profile & Status Banner */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 20,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={shop?.logo_url}
                  alt={shop?.name}
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }}
                />
                <div>
                  <h2 style={{ fontSize: 18, lineHeight: 1.2 }}>{shop?.name}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {shop?.area_name}, {shop?.city_name} • Service Radius: {shop?.delivery_radius_km} km
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: shop?.is_open ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: shop?.is_open ? '#065f46' : '#991b1b',
                  fontSize: 13,
                  fontWeight: 700
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: shop?.is_open ? 'var(--success)' : 'var(--danger)' }} />
                  <span>{shop?.is_open ? 'Accepting Orders' : 'Store Offline'}</span>
                </div>
              </div>
            </div>

            {/* Dashboard Statistics */}
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-icon emerald">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="stat-value">{formatINR(todayRevenue)}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="stat-value">{pendingOrders.length}</div>
                  <div className="stat-label">Pending / In Prep</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="stat-value">{completedOrders.length}</div>
                  <div className="stat-label">Delivered Orders</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="stat-value">{lowStockCount}</div>
                  <div className="stat-label">Low Stock Alerts</div>
                </div>
              </div>
            </div>

            {/* Orders Management Table & Cards */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18 }}>Active & Incoming Orders</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Accept incoming customer orders, set prep time, and mark packed items ready for rider pickup
                  </p>
                </div>
                <span className="badge badge-primary">
                  {orders.length} Total Orders
                </span>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No customer orders received yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {orders.map((order) => {
                    const isNewOrder = order.status === 'order_confirmed';
                    const isPreparing = order.status === 'preparing' || order.status === 'seller_accepted';
                    const isReady = order.status === 'ready_for_pickup';
                    const isDelivered = order.status === 'delivered';

                    return (
                      <div
                        key={order.id}
                        style={{
                          border: isNewOrder ? '2px solid var(--secondary)' : '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: 18,
                          background: isNewOrder ? '#fffbeb' : '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <h4 style={{ fontSize: 16 }}>Order #{order.order_number}</h4>
                              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              Customer: <strong>{order.customer_name}</strong> ({order.customer_phone}) • {order.delivery_area_name}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)' }}>
                              {formatINR(order.total_amount)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {order.items.length} items • {order.delivery_slot}
                            </div>
                          </div>
                        </div>

                        {/* Items in order */}
                        <div style={{
                          background: '#ffffff',
                          borderRadius: 'var(--radius-sm)',
                          padding: 12,
                          border: '1px solid var(--border-light)',
                          marginBottom: 14
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {order.items.map((item) => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span>
                                  <strong>{item.quantity}x</strong> {item.product_name}
                                </span>
                                <span style={{ fontWeight: 600 }}>{formatINR(item.total_price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Actions based on Status */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Rider: {order.delivery_partner_name ? <strong>{order.delivery_partner_name}</strong> : 'Pending Rider Assignment'}
                          </div>

                          {/* ACTION BUTTONS */}
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            {isNewOrder && (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Prep Time:</span>
                                  <select
                                    value={prepTimes[order.id] || 25}
                                    onChange={(e) => setPrepTimes({ ...prepTimes, [order.id]: Number(e.target.value) })}
                                    style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}
                                  >
                                    <option value={15}>15 mins</option>
                                    <option value={25}>25 mins</option>
                                    <option value={35}>35 mins</option>
                                    <option value={45}>45 mins</option>
                                  </select>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleAcceptOrder(order.id)}
                                  className="btn btn-primary btn-sm"
                                  style={{ background: 'var(--success)' }}
                                >
                                  <CheckCircle2 size={15} />
                                  <span>Accept Order</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRejectOrderId(order.id)}
                                  className="btn btn-outline btn-sm"
                                  style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                >
                                  <XCircle size={15} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {isPreparing && (
                              <button
                                type="button"
                                onClick={() => handleMarkReadyForPickup(order.id)}
                                className="btn btn-primary btn-sm"
                              >
                                <Package size={15} />
                                <span>Mark Packed & Ready for Pickup</span>
                              </button>
                            )}

                            {isReady && (
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={14} />
                                <span>Awaiting Delivery Partner Pickup (OTP: {order.delivery_otp})</span>
                              </div>
                            )}

                            {isDelivered && (
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={14} />
                                <span>Delivered to Doorstep</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Reject Order Modal */}
        {rejectOrderId && (
          <div className="modal-overlay" onClick={() => setRejectOrderId(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--danger)' }}>Reject Order</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Rejecting this order will trigger an automatic full refund to the customer. Please state the reason:
              </p>

              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, marginBottom: 20 }}
              >
                <option value="Item currently out of stock at shop">Item currently out of stock at shop</option>
                <option value="Shop closing soon / high volume">Shop closing soon / high volume</option>
                <option value="Delivery address is outside service range">Delivery address is outside service range</option>
              </select>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setRejectOrderId(null)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectOrder}
                  className="btn btn-secondary"
                  style={{ flex: 1, background: 'var(--danger)' }}
                >
                  Confirm Rejection & Refund
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
