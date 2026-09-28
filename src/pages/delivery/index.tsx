import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Order, DeliveryPartner, OrderStatus } from '../../types';
import { formatINR } from '../../lib/utils';
import {
  Bike,
  Navigation,
  MapPin,
  Store,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Package,
  AlertCircle,
  QrCode
} from 'lucide-react';

export default function DeliveryPartnerPage() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState('');

  const loadPartnerData = async () => {
    try {
      const [partnersRes, ordersRes] = await Promise.all([
        fetch('/api/delivery/partners'),
        fetch('/api/orders'),
      ]);

      const partnersData = await partnersRes.json();
      const ordersData = await ordersRes.json();

      const myPartner = (partnersData.partners || []).find((p: DeliveryPartner) => p.user_id === user.id) || partnersData.partners[0];
      setPartner(myPartner);

      // Orders assigned to this partner or available for pickup
      const relevant = (ordersData.orders || []).filter((o: Order) =>
        (o.delivery_partner_id === myPartner?.id || !o.delivery_partner_id) &&
        !['delivered', 'cancelled', 'rejected', 'pending_payment'].includes(o.status)
      );

      setAssignedOrders(relevant);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
    const interval = setInterval(loadPartnerData, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const toggleOnline = async () => {
    if (!partner) return;
    try {
      const newStatus = !partner.is_online;
      const res = await fetch('/api/delivery/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: partner.id, is_online: newStatus }),
      });
      if (res.ok) {
        setPartner({ ...partner, is_online: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDeliveryStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          delivery_partner_id: partner?.id,
        }),
      });
      if (res.ok) {
        await loadPartnerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyOtpAndDeliver = async (order: Order) => {
    setOtpError('');
    const inputOtp = otpInputs[order.id];
    if (order.delivery_otp && inputOtp !== order.delivery_otp) {
      setOtpError(`Invalid OTP entered. (Hint for demo: OTP is ${order.delivery_otp})`);
      return;
    }

    await handleUpdateDeliveryStatus(order.id, 'delivered');
  };

  return (
    <>
      <Head>
        <title>Delivery Partner App | LocalKart Fleet</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Delivery Header */}
        <nav style={{ background: '#0f172a', color: '#ffffff', padding: '14px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>
                Local<span>Kart</span> <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>RIDER FLEET</span>
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Online / Offline Switch */}
              <button
                type="button"
                onClick={toggleOnline}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: partner?.is_online ? '#065f46' : '#334155',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: 'none',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: partner?.is_online ? '#34d399' : '#94a3b8' }} />
                <span>{partner?.is_online ? 'ONLINE & ACTIVE' : 'OFFLINE'}</span>
              </button>

              <Link href="/delivery/history" style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
                Payout History
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container" style={{ maxWidth: 840 }}>
            {/* Rider Profile Card & Today's Earnings */}
            <div style={{
              background: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 28px',
              marginBottom: 24,
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6ee7b7'
                }}>
                  <Bike size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, color: '#ffffff', lineHeight: 1.2 }}>{partner?.name}</h2>
                  <div style={{ fontSize: 12, color: '#a7f3d0', marginTop: 2 }}>
                    {partner?.vehicle_type} • Rating: ⭐ {partner?.rating.toFixed(1)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
                    Today&apos;s Earnings
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#34d399' }}>
                    {formatINR(partner?.today_earnings || 0)}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: 20, textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
                    Completed Deliveries
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>
                    {partner?.total_deliveries_count || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Orders Workflow */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18 }}>Assigned Delivery Tasks</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Pick up packages from local merchants and deliver to customer doorsteps
                  </p>
                </div>
                <span className="badge badge-primary">
                  {assignedOrders.length} Active Tasks
                </span>
              </div>

              {otpError && (
                <div style={{
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={16} />
                  <span>{otpError}</span>
                </div>
              )}

              {assignedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                  <Bike size={44} style={{ color: 'var(--text-light)', margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: 16, marginBottom: 4 }}>No pending delivery assignments</h4>
                  <p style={{ fontSize: 13 }}>New orders placed in your city will automatically appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {assignedOrders.map((order) => {
                    const isAccepted = ['delivery_partner_assigned', 'picked_up', 'out_for_delivery'].includes(order.status);
                    const isPickedUp = order.status === 'picked_up' || order.status === 'out_for_delivery';

                    return (
                      <div
                        key={order.id}
                        style={{
                          border: '1.5px solid var(--primary)',
                          borderRadius: 'var(--radius-md)',
                          padding: 20,
                          background: '#f8fafc'
                        }}
                      >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 800, background: 'var(--primary)', color: '#ffffff', padding: '2px 8px', borderRadius: 4 }}>
                              EXPRESS TASK • EARN ₹45
                            </span>
                            <h4 style={{ fontSize: 16, marginTop: 4 }}>Order #{order.order_number}</h4>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 15, fontWeight: 800 }}>{formatINR(order.total_amount)}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Prepaid via Razorpay</div>
                          </div>
                        </div>

                        {/* Pickup & Drop Points */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 18 }}>
                          {/* Pickup */}
                          <div style={{ background: '#ffffff', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 4 }}>
                              <Store size={14} />
                              <span>Step 1: Pickup from Shop</span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{order.shop_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.shop_address}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-main)', marginTop: 4, fontWeight: 600 }}>
                              Shop Phone: {order.shop_phone}
                            </div>
                          </div>

                          {/* Drop */}
                          <div style={{ background: '#ffffff', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                              <MapPin size={14} />
                              <span>Step 2: Deliver to Customer</span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                              {order.delivery_receiver_name}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {order.delivery_address_line}, {order.delivery_area_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                              <button
                                type="button"
                                onClick={() => alert(`Calling customer via masked proxy: ${order.delivery_receiver_phone}`)}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: 'var(--primary)',
                                  background: 'var(--primary-light)',
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Phone size={12} />
                                <span>Masked Call Customer</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Items in bag */}
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                          Package contains: {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                        </div>

                        {/* Workflow Action Buttons */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 14,
                          borderTop: '1px solid var(--border)',
                          flexWrap: 'wrap',
                          gap: 12
                        }}>
                          {order.status === 'order_confirmed' || order.status === 'preparing' || order.status === 'ready_for_pickup' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateDeliveryStatus(order.id, 'picked_up')}
                              className="btn btn-primary"
                              style={{ width: '100%', padding: 12 }}
                            >
                              <Package size={16} />
                              <span>Mark Picked Up from {order.shop_name}</span>
                            </button>
                          ) : order.status === 'picked_up' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateDeliveryStatus(order.id, 'out_for_delivery')}
                              className="btn btn-primary"
                              style={{ width: '100%', padding: 12 }}
                            >
                              <Navigation size={16} />
                              <span>Start Navigation to Customer (Out for Delivery)</span>
                            </button>
                          ) : order.status === 'out_for_delivery' ? (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input
                                  type="text"
                                  placeholder="Enter Customer 4-digit Delivery OTP"
                                  value={otpInputs[order.id] || ''}
                                  onChange={(e) => setOtpInputs({ ...otpInputs, [order.id]: e.target.value })}
                                  maxLength={6}
                                  style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVerifyOtpAndDeliver(order)}
                                  className="btn btn-primary"
                                  style={{ padding: '10px 20px', background: 'var(--success)' }}
                                >
                                  <CheckCircle2 size={16} />
                                  <span>Verify OTP & Mark Delivered</span>
                                </button>
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                (Demo OTP: <strong>{order.delivery_otp}</strong>)
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
