import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/layout/Navbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { Order, OrderStatus } from '../../types';
import { formatINR, ORDER_STATUS_STEPS, getOrderStatusStepIndex } from '../../lib/utils';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Store,
  Bike,
  ShieldCheck,
  Phone,
  Star,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  PlayCircle,
  XCircle,
  Undo2,
  Printer,
  FileText,
  Bell,
  MessageCircle
} from 'lucide-react';
import { NotificationSimulatorModal } from '../../components/notifications/NotificationSimulatorModal';

export default function OrderTrackingPage({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [shopRating, setShopRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Great same-day local delivery!');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Cancel Order Modal State & 5-minute strict rule
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind - please refund');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Notification Simulator Modal State
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Invoice / Receipt Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // 1-second live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000); // Polling every 4 seconds for real-time updates
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // Simulator helper: Advance order status to next logical step
  const handleAdvanceSimulator = async () => {
    if (!order) return;
    setIsAdvancing(true);

    const stepIndex = getOrderStatusStepIndex(order.status);
    const nextStep = ORDER_STATUS_STEPS[Math.min(stepIndex + 1, ORDER_STATUS_STEPS.length - 1)];

    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStep.status,
          delivery_partner_id: 'partner-1',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          user_id: order.user_id,
          user_name: order.customer_name,
          shop_id: order.shop_id,
          shop_rating: shopRating,
          delivery_rating: deliveryRating,
          review_comment: reviewComment,
        }),
      });
      setReviewSubmitted(true);
      setShowReviewModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancellation_reason: cancelReason,
          user_id: order.user_id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCancelError(data.error || 'Failed to cancel order.');
        return;
      }
      setShowCancelModal(false);
      await fetchOrder();
    } catch (e: any) {
      console.error(e);
      setCancelError(e.message || 'Network error while attempting cancellation.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onOpenSearch={onOpenSearch} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Locating order status...
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onOpenSearch={onOpenSearch} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 6 }}>Order Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>The specified order could not be located.</p>
            <Link href="/orders" className="btn btn-primary btn-sm">
              View My Orders
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = getOrderStatusStepIndex(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

  // 5-minute strict cancellation rule calculation
  const orderCreatedAt = new Date(order.created_at).getTime();
  const elapsedSeconds = Math.max(0, Math.floor((currentTime - orderCreatedAt) / 1000));
  const CANCELLATION_WINDOW_SECONDS = 300; // 5 minutes
  const secondsRemaining = Math.max(0, CANCELLATION_WINDOW_SECONDS - elapsedSeconds);
  const isWindowExpired = secondsRemaining <= 0;

  // Shop-accepted orders cannot be cancelled through customer action
  const shopAcceptedStatuses: OrderStatus[] = [
    'seller_accepted',
    'preparing',
    'ready_for_pickup',
    'delivery_partner_assigned',
    'picked_up',
    'out_for_delivery',
    'delivered'
  ];
  const isShopAccepted = shopAcceptedStatuses.includes(order.status);

  // Customer can cancel an eligible pending order only within 5 minutes of order creation
  const canCancelOrder = Boolean(
    !isDelivered &&
    !isCancelled &&
    !isShopAccepted &&
    !isWindowExpired &&
    ['pending_payment', 'payment_successful', 'order_confirmed'].includes(order.status)
  );

  // Clear customer-facing reason when cancellation is unavailable
  let cancellationUnavailableReason = '';
  if (isShopAccepted) {
    cancellationUnavailableReason = `Order is already accepted and being processed by ${order.shop_name} (${order.status.replace(/_/g, ' ')}). Direct customer cancellation is locked once preparation begins.`;
  } else if (isWindowExpired && !isCancelled && !isDelivered) {
    cancellationUnavailableReason = 'The 5-minute customer cancellation window has expired. The store has locked your items for fulfilment.';
  }

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <>
      <Head>
        <title>{`Tracking Order #${order.order_number} | LocalKart`}</title>
      </Head>

      <Navbar onOpenSearch={onOpenSearch} />

      <main className="main-content">
        <div className="container" style={{ paddingTop: 24, maxWidth: 880 }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              <ArrowLeft size={16} />
              <span>Back to Orders</span>
            </Link>

            {/* Actions: Notification Simulator & Simulation Controller */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowNotifModal(true)}
                className="btn btn-outline btn-sm"
                style={{
                  borderColor: '#10b981',
                  color: '#047857',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                title="View simulated WhatsApp and SMS alerts for this order"
              >
                <MessageCircle size={15} style={{ color: '#059669' }} />
                <span>Simulate Alerts (WhatsApp/SMS)</span>
              </button>

              {!isDelivered && !isCancelled && (
                <>
                  <button
                    type="button"
                    onClick={handleAdvanceSimulator}
                    disabled={isAdvancing}
                    className="btn btn-outline btn-sm"
                    style={{
                      borderColor: 'var(--primary)',
                      color: 'var(--primary)',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    title="Advance order status automatically for demonstration"
                  >
                    <PlayCircle size={15} />
                    <span>Simulate Next Step →</span>
                  </button>

                  {canCancelOrder ? (
                    <button
                      type="button"
                      onClick={() => { setCancelError(''); setShowCancelModal(true); }}
                      className="btn btn-outline btn-sm"
                      style={{
                        borderColor: 'var(--danger)',
                        color: 'var(--danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      title="Cancel order within the 5-minute window"
                    >
                      <XCircle size={15} />
                      <span>Cancel Order ({formatCountdown(secondsRemaining)})</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0',
                      }}
                      title={cancellationUnavailableReason}
                    >
                      <Clock size={13} style={{ color: '#94a3b8' }} />
                      <span>Cancellation Locked</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cancellation Window / Status Notice Banners */}
          {canCancelOrder && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 13,
              color: '#1e40af'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                <span>
                  <strong>5-Minute Cancellation Window:</strong> You have{' '}
                  <strong style={{ color: '#dc2626' }}>{formatCountdown(secondsRemaining)}</strong> remaining to cancel this order for a 100% instant refund before store preparation begins.
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setCancelError(''); setShowCancelModal(true); }}
                className="btn btn-sm"
                style={{ background: '#dc2626', color: '#ffffff', fontSize: 11, padding: '4px 12px', whiteSpace: 'nowrap' }}
              >
                Cancel Order
              </button>
            </div>
          )}

          {!canCancelOrder && !isDelivered && !isCancelled && cancellationUnavailableReason && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: '#92400e'
            }}>
              <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
              <div>
                <strong>Cancellation Unavailable: </strong>{cancellationUnavailableReason}
              </div>
            </div>
          )}

          {/* Status Banner */}
          <div style={{
            background: isDelivered
              ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
              : isCancelled
                ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(16px, 4vw, 24px) clamp(16px, 4vw, 28px)',
            marginBottom: 28,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: isCancelled ? '#fca5a5' : '#34d399', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {isDelivered ? 'ORDER DELIVERED SUCCESSFULLY' : isCancelled ? 'ORDER CANCELLED' : 'LIVE ORDER TRACKING'}
              </span>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#ffffff', marginTop: 4, lineHeight: 1.2 }}>
                Order #{order.order_number}
              </h1>
              <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
                Estimated Delivery: <strong>{order.estimated_delivery_time || 'Today within 35 mins'}</strong>
              </p>
            </div>

            {order.delivery_otp && !isDelivered && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Delivery OTP
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.15em', color: '#6ee7b7' }}>
                  {order.delivery_otp}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Share with rider at door</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
            {/* Left Column: Timeline */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 'clamp(16px, 3.5vw, 24px)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: 18, marginBottom: 4 }}>Order Lifecycle</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                Real-time progression from {order.shop_name} to your doorstep
              </p>

              {/* Visual Timeline */}
              <div className="tracking-timeline">
                {ORDER_STATUS_STEPS.slice(2).map((step, idx) => {
                  const actualStepIndex = idx + 2;
                  const isCompleted = currentStepIndex > actualStepIndex || isDelivered;
                  const isCurrent = currentStepIndex === actualStepIndex && !isDelivered;

                  return (
                    <div
                      key={step.status}
                      className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="timeline-dot">
                        {isCompleted && <CheckCircle2 size={14} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {step.label}
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Complete Review Prompt */}
              {isDelivered && (
                <div style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--success-bg)',
                  border: '1px solid #a7f3d0',
                  textAlign: 'center'
                }}>
                  <Sparkles size={24} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
                  <h4 style={{ fontSize: 15, color: '#064e3b' }}>Order Delivered Successfully!</h4>
                  <p style={{ fontSize: 12, color: '#065f46', marginTop: 2, marginBottom: 12 }}>
                    How was your experience with {order.shop_name}?
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="btn btn-primary btn-sm"
                  >
                    Rate Shop & Delivery
                  </button>
                </div>
              )}

              {/* Cancelled Order Notice */}
              {isCancelled && (
                <div style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-bg)',
                  border: '1px solid #fecaca',
                  textAlign: 'center'
                }}>
                  <XCircle size={24} style={{ color: 'var(--danger)', margin: '0 auto 8px' }} />
                  <h4 style={{ fontSize: 15, color: '#991b1b' }}>
                    {order.status === 'rejected' ? 'Order Rejected By Shop' : 'Order Cancelled'}
                  </h4>
                  <p style={{ fontSize: 12, color: '#991b1b', marginTop: 2, lineHeight: 1.5 }}>
                    {order.rejection_reason || order.cancellation_reason || 'No reason provided.'}
                  </p>
                  <p style={{ fontSize: 12, color: '#991b1b', marginTop: 8, fontWeight: 600 }}>
                    Refund of {formatINR(order.total_amount + order.delivery_fee)} will be initiated to your original payment method.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Order & Delivery Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Delivery Partner Assigned Card */}
              {order.delivery_partner_name && (
                <div style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  padding: 20,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bike size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        Assigned Delivery Partner
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 700 }}>{order.delivery_partner_name}</h4>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Verified Rider • Honda Activa</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Connecting securely to rider via masked proxy: ${order.delivery_partner_phone}`)}
                      style={{
                        padding: '8px 12px',
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--text-main)'
                      }}
                    >
                      <Phone size={13} />
                      <span>Contact</span>
                    </button>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
                    <span>Contact-safe phone masking enabled</span>
                  </div>
                </div>
              )}

              {/* Shop & Address Details */}
              <div style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: 20,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    <Store size={14} style={{ color: 'var(--primary)' }} />
                    <span>Order From</span>
                  </div>
                  <h4 style={{ fontSize: 15 }}>{order.shop_name}</h4>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.shop_address}</div>
                </div>

                <div style={{ paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    <MapPin size={14} style={{ color: 'var(--primary)' }} />
                    <span>Delivering To</span>
                  </div>
                  <h4 style={{ fontSize: 15 }}>{order.delivery_receiver_name} ({order.delivery_receiver_phone})</h4>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {order.delivery_address_line}, {order.delivery_area_name}, {order.delivery_city_name} - {order.delivery_pincode}
                  </div>
                </div>
              </div>

              {/* Items & Payment Breakdown */}
              <div style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: 20,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{ fontSize: 15, marginBottom: 12 }}>Items in Order ({order.items.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>{item.quantity}x {item.product_name}</span>
                      <span style={{ fontWeight: 600 }}>{formatINR(item.total_price)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                  <div className="bill-row">
                    <span>Subtotal</span>
                    <span>{formatINR(order.subtotal)}</span>
                  </div>
                  <div className="bill-row">
                    <span>Delivery Fee</span>
                    <span>{order.delivery_fee === 0 ? 'FREE' : formatINR(order.delivery_fee)}</span>
                  </div>
                  <div className="bill-row">
                    <span>Platform Fee</span>
                    <span>{formatINR(order.platform_fee)}</span>
                  </div>
                  <div className="bill-row">
                    <span>GST (5%)</span>
                    <span>{formatINR(order.tax_amount)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="bill-row" style={{ color: 'var(--success)' }}>
                      <span>Coupon Discount</span>
                      <span>- {formatINR(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="bill-row total">
                    <span>Total Paid</span>
                    <span style={{ color: 'var(--primary)' }}>{formatINR(order.total_amount)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Printer size={15} />
                    <span>Download Tax Invoice / Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>Rate Your Experience</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Your feedback helps {order.shop_name} improve its quality and speed.
            </p>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Shop & Product Quality (1–5 Stars)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setShopRating(star)}
                      style={{ padding: 4 }}
                    >
                      <Star
                        size={28}
                        style={{
                          fill: star <= shopRating ? '#f59e0b' : '#e2e8f0',
                          color: star <= shopRating ? '#f59e0b' : '#cbd5e1'
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Delivery Partner Experience (1–5 Stars)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDeliveryRating(star)}
                      style={{ padding: 4 }}
                    >
                      <Star
                        size={28}
                        style={{
                          fill: star <= deliveryRating ? '#059669' : '#e2e8f0',
                          color: star <= deliveryRating ? '#059669' : '#cbd5e1'
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Your Review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && order && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, margin: 0, color: 'var(--danger)' }}>Cancel Order #{order.order_number}?</h3>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: 6,
                background: secondsRemaining > 0 ? '#eff6ff' : '#fef2f2',
                color: secondsRemaining > 0 ? '#1d4ed8' : '#dc2626',
                border: secondsRemaining > 0 ? '1px solid #bfdbfe' : '1px solid #fecaca'
              }}>
                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                {secondsRemaining > 0 ? `${formatCountdown(secondsRemaining)} left` : 'Window Expired'}
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Orders can only be cancelled within 5 minutes of placement before {order.shop_name} begins preparing.
              Cancelling now will immediately abort fulfilment and return <strong>{formatINR(order.total_amount)}</strong> to your source payment method.
            </p>

            {cancelError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                lineHeight: 1.5,
                marginBottom: 16
              }}>
                <strong>Unable to Cancel: </strong>{cancelError}
              </div>
            )}

            {secondsRemaining <= 0 && !cancelError && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                lineHeight: 1.5,
                marginBottom: 16
              }}>
                <strong>Window Closed: </strong>The 5-minute cancellation window has expired. The store has locked your items for fulfilment.
              </div>
            )}

            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Reason for Cancellation
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={secondsRemaining <= 0 || isCancelling}
              style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, marginBottom: 20 }}
            >
              <option value="Changed my mind - please refund">Changed my mind - please refund</option>
              <option value="Ordered from wrong shop by mistake">Ordered from wrong shop by mistake</option>
              <option value="Estimated delivery time is too long">Estimated delivery time is too long</option>
              <option value="Duplicate order - placed twice">Duplicate order - placed twice</option>
              <option value="Need to change delivery address or items">Need to change delivery address or items</option>
              <option value="Other reason">Other reason</option>
            </select>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling || secondsRemaining <= 0}
                className="btn btn-secondary"
                style={{ flex: 1, background: secondsRemaining <= 0 ? '#94a3b8' : 'var(--danger)' }}
              >
                <Undo2 size={16} />
                <span>{isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice & Printable Receipt Modal */}
      {showInvoiceModal && order && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div
            className="modal-card printable-invoice-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)' }}>
                  Local<span style={{ color: 'var(--secondary)' }}>Kart</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Hyperlocal Same-Day Marketplace
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>TAX INVOICE</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Invoice #{order.order_number}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Date: {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Seller & Customer Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20, fontSize: 12 }}>
              <div style={{ background: 'var(--bg-muted)', padding: 14, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, textTransform: 'uppercase' }}>
                  Sold By (Merchant)
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{order.shop_name}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{order.shop_address}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Phone: {order.shop_phone}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>GSTIN: 03AABCS1429B1Z5</div>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: 14, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, textTransform: 'uppercase' }}>
                  Billed & Delivered To
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{order.delivery_receiver_name}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Phone: {order.delivery_receiver_phone}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  {order.delivery_address_line}, {order.delivery_area_name}, {order.delivery_city_name} - {order.delivery_pincode}
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Payment: {order.payment?.payment_method?.toUpperCase() || 'ONLINE UPI'}</div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Item Description</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{item.product_name}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatINR(item.unit_price)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{formatINR(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <div style={{ width: 280, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>{formatINR(order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Doorstep Delivery (SAC 996813):</span>
                  <span>{order.delivery_fee === 0 ? 'FREE' : formatINR(order.delivery_fee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Platform Convenience Fee:</span>
                  <span>{formatINR(order.platform_fee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Applicable GST (5%):</span>
                  <span>{formatINR(order.tax_amount)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                    <span>Coupon Discount ({order.coupon_code || 'APPLIED'}):</span>
                    <span>- {formatINR(order.discount_amount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: 8, marginTop: 4, fontWeight: 800, fontSize: 15 }}>
                  <span>Grand Total Paid:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatINR(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Verified Stamp & Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                This is a computer-generated tax invoice verified by LocalKart Technologies.<br />
                Delivery fulfilled same-day in {order.delivery_city_name}.
              </div>

              <div style={{
                border: '2px solid #059669',
                color: '#059669',
                padding: '4px 10px',
                borderRadius: 4,
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: '0.08em',
                transform: 'rotate(-3deg)'
              }}>
                PAID & VERIFIED
              </div>
            </div>

            {/* Modal Buttons (Hidden when printed) */}
            <div className="no-print" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Printer size={16} />
                <span>Print Official Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Simulator Modal */}
      {order && (
        <NotificationSimulatorModal
          isOpen={showNotifModal}
          onClose={() => setShowNotifModal(false)}
          orderId={order.id}
          orderNumber={order.order_number}
          userId={order.user_id}
          customerPhone={order.delivery_receiver_phone || order.customer_phone}
          customerName={order.delivery_receiver_name || order.customer_name}
          shopName={order.shop_name}
        />
      )}

      <Footer />
      <MobileNav onOpenSearch={onOpenSearch} />
    </>
  );
}
