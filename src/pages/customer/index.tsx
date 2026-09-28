import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/layout/Navbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { Order, Address, Coupon } from '../../types';
import { formatINR, getStatusBadgeClass } from '../../lib/utils';
import {
  User as UserIcon,
  Package,
  MapPin,
  Clock,
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Star,
  Copy,
  ArrowRight,
  TrendingUp,
  Tag,
  Zap,
  ShoppingBag,
  ExternalLink,
  Phone,
  Mail,
  RotateCcw,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { NotificationSimulatorModal } from '../../components/notifications/NotificationSimulatorModal';

export default function CustomerDashboardPage({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cities,
    selectedCity,
    savedAddresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    loadAddresses,
  } = useLocation();
  const { addToCart, setIsCartDrawerOpen } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'coupons' | 'support'>('orders');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Address Modal State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Home');
  const [newReceiverName, setNewReceiverName] = useState(user.name);
  const [newReceiverPhone, setNewReceiverPhone] = useState(user.phone);
  const [newFlatNo, setNewFlatNo] = useState('');
  const [newAreaLocality, setNewAreaLocality] = useState('');
  const [newCityId, setNewCityId] = useState(selectedCity.id);
  const [newPincode, setNewPincode] = useState('141002');
  const [newLandmark, setNewLandmark] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  useEffect(() => {
    async function loadCustomerData() {
      setLoading(true);
      try {
        const [ordersRes, couponsRes] = await Promise.all([
          fetch(`/api/orders?userId=${user.id}`),
          fetch('/api/coupons'),
        ]);

        const oData = await ordersRes.json();
        const cData = await couponsRes.json();

        setOrders(oData.orders || []);
        setCoupons(cData.coupons || []);
      } catch (e) {
        console.error('Failed to load customer data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerData();
    loadAddresses();
  }, [user.id, loadAddresses]);

  // Derived Metrics
  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled', 'rejected'].includes(o.status)
  );

  const completedOrders = orders.filter((o) => o.status === 'delivered');

  const totalSaved = orders.reduce((sum, o) => sum + (o.discount_amount || 0), 0);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlatNo.trim() || !newAreaLocality.trim()) return;

    setAddressSubmitting(true);
    const targetCity = cities.find((c) => c.id === newCityId) || selectedCity;

    try {
      await addAddress({
        user_id: user.id,
        title: newTitle,
        receiver_name: newReceiverName.trim() || user.name,
        receiver_phone: newReceiverPhone.trim() || user.phone,
        flat_house_no: newFlatNo.trim(),
        area_locality: newAreaLocality.trim(),
        city_id: targetCity.id,
        city_name: targetCity.name,
        pincode: newPincode.trim(),
        landmark: newLandmark.trim(),
        is_default: newIsDefault,
      });

      setIsAddAddressOpen(false);
      setNewFlatNo('');
      setNewAreaLocality('');
      setNewLandmark('');
    } catch (e) {
      console.error(e);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleReorder = (order: Order) => {
    // Add all products from this order to cart
    order.items.forEach((item) => {
      // Reconstruct minimal product
      addToCart(
        {
          id: item.product_id,
          shop_id: order.shop_id,
          shop_name: order.shop_name,
          category_id: 'cat-grocery',
          name: item.product_name,
          slug: item.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: '',
          unit: '1 item',
          original_price: item.unit_price,
          discounted_price: item.unit_price,
          discount_percentage: 0,
          stock_quantity: 50,
          low_stock_threshold: 5,
          is_available: true,
          is_featured: false,
          image_url: item.product_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
          rating: 4.8,
          rating_count: 12,
          created_at: new Date().toISOString(),
        },
        item.quantity,
        order.shop_name
      );
    });

    setIsCartDrawerOpen(true);
  };

  return (
    <>
      <Head>
        <title>Customer Dashboard & Account | LocalKart</title>
        <meta
          name="description"
          content="Manage your LocalKart account, view live order deliveries, track saved addresses, and redeem hyperlocal coupons."
        />
      </Head>

      <Navbar onOpenSearch={onOpenSearch} />

      <main className="main-content" style={{ padding: '28px 0 60px' }}>
        <div className="container" style={{ maxWidth: 1040 }}>
          {/* PROFILE HERO HEADER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px 28px',
              color: '#ffffff',
              boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.25)',
              marginBottom: 28,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 180,
                height: 180,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    color: '#065f46',
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    border: '3px solid #a7f3d0',
                  }}
                >
                  {user.name.charAt(0)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                      {user.name}
                    </h1>
                    <span
                      style={{
                        background: 'rgba(52, 211, 153, 0.2)',
                        color: '#6ee7b7',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <ShieldCheck size={12} />
                      VERIFIED CUSTOMER
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      fontSize: 13,
                      color: '#a7f3d0',
                      marginTop: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Phone size={13} />
                      {user.phone}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={13} />
                      {user.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={13} />
                      {selectedCity.name}, India
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Notification Simulator Trigger Button */}
                <button
                  type="button"
                  onClick={() => setShowNotifModal(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                  title="Open live WhatsApp & SMS notification simulator"
                >
                  <MessageCircle size={18} style={{ color: '#34d399' }} />
                  <span>Notification Simulator</span>
                </button>

                {/* VIP Membership Badge */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#fbbf24',
                      color: '#78350f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                    }}
                  >
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#fef08a', fontWeight: 700, textTransform: 'uppercase' }}>
                      LocalKart Express VIP
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                      Free Same-Day Delivery on ₹499+
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 STATS CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Total Orders Placed
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>
                  {orders.length}
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={22} />
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Active In-Transit Deliveries
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#059669', marginTop: 2 }}>
                  {activeOrders.length}
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={22} />
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Total Coupon Savings
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
                  {formatINR(totalSaved)}
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Tag size={22} />
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Saved Addresses
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>
                  {savedAddresses.length}
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#e0e7ff',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={22} />
              </div>
            </div>
          </div>

          {/* ACTIVE ORDER SPOTLIGHT RADAR */}
          {activeOrders.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 24px',
                color: '#ffffff',
                marginBottom: 32,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#34d399',
                      boxShadow: '0 0 10px #34d399',
                      display: 'inline-block',
                    }}
                  />
                  <h3 style={{ fontSize: 17, color: '#ffffff', fontWeight: 800 }}>
                    Active Order Delivery Radar
                  </h3>
                </div>
                <span
                  style={{
                    background: 'rgba(52, 211, 153, 0.2)',
                    color: '#34d399',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}
                >
                  LIVE TRACKING
                </span>
              </div>

              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    padding: 16,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Store size={16} style={{ color: '#34d399' }} />
                      <strong style={{ fontSize: 16, color: '#ffffff' }}>{order.shop_name}</strong>
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>• Order #{order.order_number}</span>
                    </div>

                    <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
                      Status: <strong style={{ color: '#6ee7b7' }}>{order.status.replace(/_/g, ' ').toUpperCase()}</strong>
                      {order.delivery_partner_name && (
                        <span> • Assigned to Rider: {order.delivery_partner_name}</span>
                      )}
                    </div>

                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      Delivering to: {order.delivery_address_line}, {order.delivery_area_name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {order.delivery_otp && (
                      <div
                        style={{
                          background: 'rgba(52, 211, 153, 0.15)',
                          border: '1px solid rgba(52, 211, 153, 0.3)',
                          padding: '6px 12px',
                          borderRadius: 8,
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>OTP</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#34d399', letterSpacing: '0.1em' }}>
                          {order.delivery_otp}
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/orders/${order.id}`}
                      className="btn btn-primary"
                      style={{
                        padding: '10px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 700,
                      }}
                    >
                      <span>Track Order</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DASHBOARD TABS NAVIGATION */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderBottom: '2px solid var(--border)',
              marginBottom: 24,
              overflowX: 'auto',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
                marginBottom: -2,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Package size={16} />
              <span>Orders & Reorder ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                color: activeTab === 'addresses' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'addresses' ? '3px solid var(--primary)' : '3px solid transparent',
                marginBottom: -2,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MapPin size={16} />
              <span>Saved Addresses ({savedAddresses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('coupons')}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                color: activeTab === 'coupons' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'coupons' ? '3px solid var(--primary)' : '3px solid transparent',
                marginBottom: -2,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Tag size={16} />
              <span>Promo Coupons ({coupons.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('support')}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                color: activeTab === 'support' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'support' ? '3px solid var(--primary)' : '3px solid transparent',
                marginBottom: -2,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={16} />
              <span>Help & Same-Day Support</span>
            </button>
          </div>

          {/* TAB CONTENT: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  Loading your orders...
                </div>
              ) : orders.length === 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    padding: '60px 20px',
                    textAlign: 'center',
                  }}
                >
                  <Package size={48} style={{ color: 'var(--text-light)', margin: '0 auto 14px' }} />
                  <h3 style={{ fontSize: 18, marginBottom: 6 }}>No orders placed yet</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Discover nearby grocery, bakery, and medicine stores in {selectedCity.name} for 30–60 min delivery.
                  </p>
                  <Link href="/shops" className="btn btn-primary btn-sm">
                    Discover Local Shops
                  </Link>
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
                        padding: 22,
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                          paddingBottom: 14,
                          borderBottom: '1px solid var(--border-light)',
                          marginBottom: 14,
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Store size={18} style={{ color: 'var(--primary)' }} />
                            <strong style={{ fontSize: 16 }}>{order.shop_name}</strong>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            Order #{order.order_number} • Placed on{' '}
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Items List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: 13,
                            }}
                          >
                            <span style={{ color: 'var(--text-main)' }}>
                              {item.quantity}x {item.product_name}
                            </span>
                            <span style={{ fontWeight: 600 }}>{formatINR(item.total_price)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer with Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 14,
                          borderTop: '1px dashed var(--border)',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Amount: </span>
                          <strong style={{ fontSize: 16, color: 'var(--text-main)' }}>
                            {formatINR(order.total_amount)}
                          </strong>
                          {order.discount_amount > 0 && (
                            <span style={{ fontSize: 12, color: 'var(--success)', marginLeft: 8, fontWeight: 600 }}>
                              (Saved {formatINR(order.discount_amount)})
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="btn btn-outline btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            title="Add items from this order to your cart"
                          >
                            <RotateCcw size={14} />
                            <span>1-Click Reorder</span>
                          </button>

                          <Link
                            href={`/orders/${order.id}`}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <span>Tracking & Receipt</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ fontSize: 18 }}>Manage Delivery Addresses</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    Saved addresses for rapid 1-click checkout in Ludhiana, Chandigarh, and Delhi
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={16} />
                  <span>Add New Address</span>
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    padding: 40,
                    textAlign: 'center',
                  }}
                >
                  <MapPin size={40} style={{ color: 'var(--text-light)', margin: '0 auto 12px' }} />
                  <h4>No saved addresses yet</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    Add your home or office address for instant checkout.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 16,
                  }}
                >
                  {savedAddresses.map((addr) => {
                    const isDefault = addr.is_default || selectedAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 'var(--radius-lg)',
                          border: isDefault ? '2px solid var(--primary)' : '1px solid var(--border)',
                          padding: 20,
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                }}
                              >
                                {addr.title}
                              </span>
                              {isDefault && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: 'var(--success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                  }}
                                >
                                  <CheckCircle2 size={12} />
                                  DEFAULT
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteAddress(addr.id)}
                              style={{
                                color: 'var(--text-light)',
                                padding: 4,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                              }}
                              title="Delete Address"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>
                            {addr.receiver_name} ({addr.receiver_phone})
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                            {addr.flat_house_no}, {addr.area_locality}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-main)', marginTop: 2, fontWeight: 600 }}>
                            {addr.city_name} - {addr.pincode}
                          </div>
                          {addr.landmark && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                              Landmark: {addr.landmark}
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
                          {!isDefault ? (
                            <button
                              type="button"
                              onClick={() => setDefaultAddress(addr.id)}
                              className="btn btn-outline btn-sm"
                              style={{ width: '100%', fontSize: 12 }}
                            >
                              Set as Default Delivery Address
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                              ✓ Active Default Address
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: PROMO COUPONS */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18 }}>Available Hyperlocal Coupons</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Apply these coupons at checkout to save on your same-day local orders
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px dashed var(--primary)',
                      padding: 20,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div
                          style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 900,
                            letterSpacing: '0.08em',
                            fontSize: 14,
                            border: '1px solid rgba(5, 150, 105, 0.2)',
                          }}
                        >
                          {coupon.code}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(coupon.code)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            color: copiedCode === coupon.code ? 'var(--success)' : 'var(--primary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>COPIED!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h4 style={{ fontSize: 15, marginBottom: 4 }}>{coupon.description}</h4>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Minimum Order: {formatINR(coupon.min_order_amount)}
                        {coupon.max_discount_amount && (
                          <span> • Max Discount: {formatINR(coupon.max_discount_amount)}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-light)', fontSize: 11, color: 'var(--text-muted)' }}>
                      Valid for same-day delivery in all serviceable areas
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: SUPPORT */}
          {activeTab === 'support' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: 28,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>LocalKart Customer Help & Guarantees</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                We connect you directly to neighborhood stores with dedicated same-day fleet delivery.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div style={{ padding: 18, borderRadius: 'var(--radius-md)', background: 'var(--bg-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Zap size={20} style={{ color: 'var(--primary)' }} />
                    <h4 style={{ fontSize: 15 }}>Same-Day Delivery Guarantee</h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Every order placed is accepted directly by the local shop merchant and dispatched via verified local delivery partners in 30–60 minutes.
                  </p>
                </div>

                <div style={{ padding: 18, borderRadius: 'var(--radius-md)', background: 'var(--bg-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                    <h4 style={{ fontSize: 15 }}>100% Genuine Local Products</h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Items are hand-picked fresh from registered stores in your locality (Model Town, Sector 17, Connaught Place, etc.).
                  </p>
                </div>

                <div style={{ padding: 18, borderRadius: 'var(--radius-md)', background: 'var(--bg-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <RotateCcw size={20} style={{ color: 'var(--primary)' }} />
                    <h4 style={{ fontSize: 15 }}>Instant Cancellation & Refunds</h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Need to cancel? You can cancel from the live tracking screen before the delivery partner picks up the package for an automatic refund.
                  </p>
                </div>

                <div style={{ padding: 18, borderRadius: 'var(--radius-md)', background: 'var(--bg-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Phone size={20} style={{ color: 'var(--primary)' }} />
                    <h4 style={{ fontSize: 15 }}>City Operations Helpdesk</h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Operational support hours: 7:00 AM – 11:00 PM daily. Phone: +91 1800 200 4567 • Email: support@localkart.in
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ADD ADDRESS MODAL */}
      {isAddAddressOpen && (
        <div className="modal-overlay" onClick={() => setIsAddAddressOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18 }}>Add Delivery Address</h3>
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(false)}
                style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Target City</label>
                <select
                  value={newCityId}
                  onChange={(e) => setNewCityId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: 4,
                    fontSize: 14,
                  }}
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.state})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Receiver Name</label>
                  <input
                    type="text"
                    value={newReceiverName}
                    onChange={(e) => setNewReceiverName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: 4,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Receiver Phone</label>
                  <input
                    type="text"
                    value={newReceiverPhone}
                    onChange={(e) => setNewReceiverPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: 4,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Flat / House / Building</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, Palm Heights"
                  value={newFlatNo}
                  onChange={(e) => setNewFlatNo(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: 4,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Locality / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Model Town / Sector 17"
                    value={newAreaLocality}
                    onChange={(e) => setNewAreaLocality(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: 4,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Pincode</label>
                  <input
                    type="text"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: 4,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Park"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: 4,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Tag</label>
                  <select
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: 4,
                      fontSize: 14,
                    }}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                />
                <span>Set as default delivery address</span>
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {addressSubmitting ? 'Saving Address...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Simulator Modal */}
      <NotificationSimulatorModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        userId={user.id}
        customerPhone={user.phone}
        customerName={user.name}
        orderId={orders[0]?.id}
        orderNumber={orders[0]?.order_number}
      />

      <Footer />
      <MobileNav onOpenSearch={onOpenSearch} />
    </>
  );
}
