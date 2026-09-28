import React, { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationChannel, NotificationType } from '../../types';
import {
  X,
  MessageCircle,
  Smartphone,
  CheckCheck,
  Clock,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Send,
  Bell,
  Check
} from 'lucide-react';

interface NotificationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  customerPhone?: string;
  customerName?: string;
  shopName?: string;
}

const EVENT_PRESETS: { type: NotificationType; label: string; icon: string; preview: string }[] = [
  { type: 'order_confirmed', label: 'Order Confirmed', icon: '🛍️', preview: 'Order confirmed and payment verified' },
  { type: 'seller_accepted', label: 'Shop Accepted', icon: '🏪', preview: 'Shop accepted and processing order' },
  { type: 'preparing', label: 'Order Preparing', icon: '👨‍🍳', preview: 'Shop packing items with care' },
  { type: 'rider_assigned', label: 'Rider Assigned', icon: '🛵', preview: 'Express delivery partner allocated' },
  { type: 'rider_arriving', label: 'Rider Arriving', icon: '⚡', preview: 'Rider out for delivery to doorstep' },
  { type: 'otp_available', label: 'OTP Available', icon: '🔑', preview: 'Delivery OTP generated for verification' },
  { type: 'order_delivered', label: 'Order Delivered', icon: '🎉', preview: 'Package delivered at customer door' },
  { type: 'order_cancelled', label: 'Order Cancelled', icon: '❌', preview: 'Order cancelled & refund initiated' },
];

export const NotificationSimulatorModal: React.FC<NotificationSimulatorModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  userId = 'user-cust-1',
  customerPhone = '+91 98765 43210',
  shopName = 'LocalKart Store',
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'whatsapp' | 'sms'>('all');
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<NotificationType>('order_confirmed');
  const [customChannel, setCustomChannel] = useState<NotificationChannel>('whatsapp');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderId) params.append('orderId', orderId);
      else if (userId) params.append('userId', userId);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId, userId]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  if (!isOpen) return null;

  const handleSimulateEvent = async (typeToSimulate: NotificationType, channelToSimulate: NotificationChannel) => {
    if (!orderId) {
      alert('Order ID is required to simulate order lifecycle notifications.');
      return;
    }
    setSimulating(true);
    try {
      const orderRef = orderNumber || orderId;
      let title = 'Notification Update';
      let message = `Update for order #${orderRef}`;

      switch (typeToSimulate) {
        case 'order_confirmed':
          title = channelToSimulate === 'whatsapp' ? '🛍️ Order Confirmed!' : 'LocalKart Order Confirmed';
          message = channelToSimulate === 'whatsapp'
            ? `Hi! Your order #${orderRef} from *${shopName}* is confirmed! Same-day express delivery in progress.`
            : `LK-ALERT: Order #${orderRef} from ${shopName} is confirmed. Same-day express delivery underway. Track live at LocalKart.`;
          break;
        case 'seller_accepted':
          title = channelToSimulate === 'whatsapp' ? '🏪 Order Accepted' : 'Shop Accepted Order';
          message = channelToSimulate === 'whatsapp'
            ? `*${shopName}* has accepted your order #${orderRef} and has started gathering items.`
            : `LK-ALERT: ${shopName} accepted order #${orderRef}. Preparation started.`;
          break;
        case 'preparing':
          title = channelToSimulate === 'whatsapp' ? '👨‍🍳 Items Being Packed' : 'Packing Underway';
          message = channelToSimulate === 'whatsapp'
            ? `Your order #${orderRef} is currently being carefully packed at *${shopName}*. Estimated prep: ~15 mins.`
            : `LK-ALERT: Order #${orderRef} is being packed by ${shopName}. Rider will be assigned shortly.`;
          break;
        case 'rider_assigned':
          title = channelToSimulate === 'whatsapp' ? '🛵 Rider Assigned' : 'Delivery Partner Assigned';
          message = channelToSimulate === 'whatsapp'
            ? `Delivery Partner *Rajesh Kumar* (+91 98123 45678) has been assigned to your order #${orderRef}.`
            : `LK-ALERT: Delivery partner Rajesh Kumar assigned to order #${orderRef}. Arriving at shop soon.`;
          break;
        case 'rider_arriving':
          title = channelToSimulate === 'whatsapp' ? '⚡ Rider Arriving Soon' : 'Rider Approaching';
          message = channelToSimulate === 'whatsapp'
            ? `Rider is nearby with your order #${orderRef} from *${shopName}*! Please be ready at your door.`
            : `LK-ALERT: Rider is nearing your address with order #${orderRef}. Estimated arrival: 5 mins.`;
          break;
        case 'otp_available':
          title = channelToSimulate === 'whatsapp' ? '🔑 Delivery Verification OTP' : 'LocalKart Doorstep OTP';
          message = channelToSimulate === 'whatsapp'
            ? `Your secure Delivery OTP for order #${orderRef} is *4892*. Please share this with the rider only after receiving your items.`
            : `LocalKart OTP: 4892 is your verification code for order #${orderRef}. Share with rider only at your door.`;
          break;
        case 'order_delivered':
          title = channelToSimulate === 'whatsapp' ? '🎉 Order Delivered!' : 'Order Delivered';
          message = channelToSimulate === 'whatsapp'
            ? `Order #${orderRef} has been delivered successfully! Thank you for supporting local stores with LocalKart. Rate your experience anytime.`
            : `LK-ALERT: Order #${orderRef} delivered. Thank you for shopping with ${shopName} on LocalKart.`;
          break;
        case 'order_cancelled':
          title = channelToSimulate === 'whatsapp' ? '❌ Order Cancelled' : 'Order Cancelled';
          message = channelToSimulate === 'whatsapp'
            ? `Order #${orderRef} has been cancelled. Full refund has been initiated to your original payment method. Ref: REF-${orderRef}.`
            : `LK-ALERT: Order #${orderRef} cancelled. 100% refund initiated to source payment method.`;
          break;
      }

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger',
          orderId,
          type: typeToSimulate,
          channel: channelToSimulate,
          title,
          message,
        }),
      });

      if (res.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to simulate notification:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id }),
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'read' } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'whatsapp') return n.channel === 'whatsapp';
    if (activeTab === 'sms') return n.channel === 'sms';
    return true;
  });

  const whatsappCount = notifications.filter(n => n.channel === 'whatsapp').length;
  const smsCount = notifications.filter(n => n.channel === 'sms').length;

  // Simple formatting helper for markdown bold *word* in WhatsApp text
  const formatWhatsAppText = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(1, -1)}</strong>;
      }
      return part;
    });
  };

  const formatTimestamp = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 720,
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '16px 22px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Bell size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Live Notification Simulator
                </h3>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid rgba(52, 211, 153, 0.4)'
                }}>
                  Zero-Cost Simulator
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                Simulating customer WhatsApp & SMS delivery alerts in real-time
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={fetchNotifications}
              title="Refresh Notifications"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#cbd5e1',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
              }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Simulator Interactive Control Toolbar */}
        <div style={{
          background: '#f8fafc',
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
              <Sparkles size={15} style={{ color: 'var(--primary)' }} />
              <span>Trigger Test Event:</span>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value as NotificationType)}
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontWeight: 600,
                }}
              >
                {EVENT_PRESETS.map(preset => (
                  <option key={preset.type} value={preset.type}>
                    {preset.icon} {preset.label}
                  </option>
                ))}
              </select>

              <select
                value={customChannel}
                onChange={(e) => setCustomChannel(e.target.value as NotificationChannel)}
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontWeight: 600,
                }}
              >
                <option value="whatsapp">📱 WhatsApp</option>
                <option value="sms">💬 SMS Alert</option>
              </select>

              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulateEvent(selectedEventType, customChannel)}
                className="btn btn-primary btn-sm"
                style={{
                  fontSize: 12,
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Send size={13} />
                <span>{simulating ? 'Sending...' : 'Dispatch Alert'}</span>
              </button>
            </div>
          </div>

          {/* Quick-action event chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {EVENT_PRESETS.map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => handleSimulateEvent(p.type, 'whatsapp')}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  cursor: 'pointer',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title={`Quick trigger: ${p.preview}`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Channel Filter Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: '#ffffff',
          padding: '0 20px',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'all' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>All Alerts</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              background: activeTab === 'all' ? 'var(--primary-light)' : '#f1f5f9',
              color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)'
            }}>
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'whatsapp' ? '2px solid #25D366' : '2px solid transparent',
              color: activeTab === 'whatsapp' ? '#128C7E' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MessageCircle size={15} style={{ color: '#25D366' }} />
            <span>WhatsApp</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              background: activeTab === 'whatsapp' ? '#dcf8c6' : '#f1f5f9',
              color: activeTab === 'whatsapp' ? '#075e54' : 'var(--text-muted)'
            }}>
              {whatsappCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'sms' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'sms' ? '#2563eb' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Smartphone size={15} style={{ color: '#2563eb' }} />
            <span>SMS Alerts</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              background: activeTab === 'sms' ? '#dbeafe' : '#f1f5f9',
              color: activeTab === 'sms' ? '#1e40af' : 'var(--text-muted)'
            }}>
              {smsCount}
            </span>
          </button>
        </div>

        {/* Message Feed Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 20px',
          background: activeTab === 'whatsapp'
            ? '#efeae2'
            : activeTab === 'sms'
              ? '#f3f4f6'
              : '#f8fafc',
          backgroundImage: activeTab === 'whatsapp'
            ? 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)'
            : 'none',
          backgroundSize: '16px 16px',
          minHeight: 280,
          maxHeight: '52vh'
        }}>
          {filteredNotifs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)'
            }}>
              <Bell size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: 16, color: 'var(--text-main)', marginBottom: 4 }}>No Notifications Found</h4>
              <p style={{ fontSize: 13, maxWidth: 360, margin: '0 auto 16px' }}>
                Dispatch a test alert above or advance order steps to generate realistic notifications.
              </p>
              <button
                type="button"
                onClick={() => handleSimulateEvent('order_confirmed', 'whatsapp')}
                className="btn btn-outline btn-sm"
              >
                Send Test Order Confirmation
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredNotifs.map((n) => {
                const isWA = n.channel === 'whatsapp';

                if (isWA) {
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        maxWidth: '92%',
                      }}
                    >
                      {/* WhatsApp Business Header Snippet */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 3,
                        fontSize: 11,
                        color: '#475569',
                        paddingLeft: 4
                      }}>
                        <span style={{ fontWeight: 700, color: '#075e54' }}>LocalKart Official</span>
                        <ShieldCheck size={13} style={{ color: '#059669' }} />
                        <span>•</span>
                        <span>To {customerPhone}</span>
                      </div>

                      {/* WhatsApp Message Bubble */}
                      <div style={{
                        background: '#ffffff',
                        borderLeft: '4px solid #25D366',
                        padding: '10px 14px',
                        borderRadius: '0px 14px 14px 14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        position: 'relative',
                        color: '#111827',
                        fontSize: 13,
                        lineHeight: 1.5,
                        width: '100%',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                          gap: 12
                        }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>
                            {n.title}
                          </span>
                          <span style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: '#dcf8c6',
                            color: '#065f46',
                            fontWeight: 700
                          }}>
                            WhatsApp Business
                          </span>
                        </div>

                        <div style={{ color: '#1f2937', marginBottom: 8, whiteSpace: 'pre-wrap' }}>
                          {formatWhatsAppText(n.message)}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px dashed #e2e8f0',
                          paddingTop: 6,
                          fontSize: 11,
                          color: '#64748b'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} />
                            {formatTimestamp(n.created_at)}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {n.status === 'read' ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#3b82f6', fontWeight: 600 }}>
                                <CheckCheck size={14} /> Read
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(n.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#059669',
                                  fontSize: 11,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  fontWeight: 600,
                                  padding: 0
                                }}
                              >
                                <Check size={12} /> Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // SMS Bubble Format
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      maxWidth: '92%',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 3,
                      fontSize: 11,
                      color: '#475569',
                      paddingLeft: 4
                    }}>
                      <span style={{ fontWeight: 800, color: '#1e3a8a' }}>SMS Gateway: LK-ALERT</span>
                      <span>•</span>
                      <span>Delivered via Cellular Network</span>
                    </div>

                    <div style={{
                      background: '#ffffff',
                      borderLeft: '4px solid #3b82f6',
                      padding: '10px 14px',
                      borderRadius: '0px 14px 14px 14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      color: '#0f172a',
                      fontSize: 13,
                      lineHeight: 1.5,
                      width: '100%',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4
                      }}>
                        <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 13 }}>
                          {n.title}
                        </span>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontWeight: 700
                        }}>
                          SMS ALERT
                        </span>
                      </div>

                      <div style={{ color: '#334155', marginBottom: 8, whiteSpace: 'pre-wrap', fontFamily: 'monospace, sans-serif' }}>
                        {n.message}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: 6,
                        fontSize: 11,
                        color: '#64748b'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} />
                          {formatTimestamp(n.created_at)}
                        </span>

                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#16a34a', fontWeight: 600 }}>
                          <CheckCheck size={13} />
                          <span>Delivered to {n.recipient_phone}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div style={{
          padding: '10px 20px',
          background: '#ffffff',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            <span>Zero paid APIs required. Realistic simulator tracks all 8 order states seamlessly.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ fontSize: 12, padding: '4px 12px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
