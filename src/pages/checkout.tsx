import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, getEstimatedDeliveryWindow } from '../lib/utils';
import { Address, PaymentMethod } from '../types';
import {
  CheckCircle2,
  MapPin,
  Clock,
  CreditCard,
  Zap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Store,
  Plus,
  AlertCircle,
  QrCode,
  Wallet,
  Building2,
  Sparkles
} from 'lucide-react';

// Safe loader for official Razorpay Checkout SDK
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    shopId,
    shopName,
    subtotal,
    deliveryFee,
    platformFee,
    taxAmount,
    discountAmount,
    couponCode,
    totalAmount,
    clearCart,
  } = useCart();
  const {
    selectedCity,
    selectedArea,
    savedAddresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
  } = useLocation();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [deliverySlot, setDeliverySlot] = useState<string>('Same-Day Express (30–60 mins)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('rahul@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8900 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('421');

  // New Address modal/form toggle
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('Home');
  const [newReceiverName, setNewReceiverName] = useState(user.name);
  const [newReceiverPhone, setNewReceiverPhone] = useState(user.phone);
  const [newFlatNo, setNewFlatNo] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  // Payment Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Pre-load Razorpay checkout script when approaching payment step
  useEffect(() => {
    if (currentStep === 4) {
      loadRazorpayScript();
    }
  }, [currentStep]);

  // If cart is empty and not completed
  if (items.length === 0 && !paymentSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onOpenSearch={onOpenSearch} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              Add items from a local shop before checking out.
            </p>
            <button onClick={() => router.push('/shops')} className="btn btn-primary">
              Find Nearby Shops
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlatNo.trim()) return;

    const added = await addAddress({
      user_id: user.id,
      title: newAddrTitle,
      receiver_name: newReceiverName || user.name,
      receiver_phone: newReceiverPhone || user.phone,
      flat_house_no: newFlatNo,
      area_locality: selectedArea.name,
      city_id: selectedCity.id,
      city_name: selectedCity.name,
      pincode: selectedArea.pincode,
      landmark: newLandmark,
      is_default: true,
    });
    setSelectedAddress(added);
    setIsAddingNewAddr(false);
  };

  const handlePlaceOrderAndPay = async () => {
    if (!selectedAddress) {
      alert('Please select or enter a delivery address');
      setCurrentStep(1);
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      // 1. Create order on backend (which creates Razorpay order / Mock Razorpay order)
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          customer_name: selectedAddress.receiver_name,
          customer_phone: selectedAddress.receiver_phone,
          customer_email: user.email,
          shop_id: shopId,
          items,
          address: selectedAddress,
          delivery_slot: deliverySlot,
          coupon_code: couponCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize order');
      }

      const { order, razorpayOrder, isMock, keyId } = data;

      // 2. Mock Mode: simulate realistic Razorpay payment gateway delay
      if (isMock) {
        await new Promise((r) => setTimeout(r, 1200));

        const verifyRes = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.id,
            razorpay_order_id: razorpayOrder.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'valid_mock_signature',
            payment_method: paymentMethod,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.error || 'Payment verification failed');
        }

        // Success!
        setPaymentSuccess(true);
        clearCart();
        router.push(`/orders/${order.id}`);
        return;
      }

      // 3. Live Razorpay Mode: Load Razorpay Checkout SDK and open popup
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay payment gateway SDK. Please check your network and try again.');
      }

      const razorpayKey = keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay Key ID is not configured.');
      }

      const rzpOptions = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'LocalKart',
        description: `Order #${order.order_number} from ${shopName}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: selectedAddress.receiver_name,
          contact: selectedAddress.receiver_phone,
          email: user.email,
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentError('Payment was cancelled. You can retry whenever you are ready.');
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setIsProcessing(true);
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_method: paymentMethod,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            setPaymentSuccess(true);
            clearCart();
            router.push(`/orders/${order.id}`);
          } catch (err: any) {
            console.error('Payment verification error:', err);
            setPaymentError(err.message || 'Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', (failureResponse: any) => {
        setIsProcessing(false);
        setPaymentError(
          failureResponse.error?.description || 'Payment failed. Please choose another payment method or try again.'
        );
      });
      rzp.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Payment failed. Please retry.');
      setIsProcessing(false);
    }
  };

  const steps = [
    { num: 1, title: 'Delivery Address' },
    { num: 2, title: 'Delivery Slot' },
    { num: 3, title: 'Order Summary' },
    { num: 4, title: 'Payment' },
  ];

  return (
    <>
      <Head>
        <title>Checkout | LocalKart Same-Day Delivery</title>
      </Head>

      <Navbar onOpenSearch={onOpenSearch} />

      <main className="main-content">
        <div className="container" style={{ paddingTop: 28, maxWidth: 980 }}>
          {/* Steps Progress Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
            position: 'relative',
          }}>
            {steps.map((s) => {
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: s.num < currentStep ? 'pointer' : 'default',
                    zIndex: 2,
                    background: 'var(--bg-main)',
                    padding: '0 8px'
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--border)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                  }}>
                    {isDone ? <CheckCircle2 size={18} /> : s.num}
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)',
                    display: 'inline'
                  }}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Checkout Grid (2 columns: Form Step + Sticky Bill Breakdown) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'start' }}>
            {/* Left Column: Active Step Content */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 28,
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* STEP 1: DELIVERY ADDRESS */}
              {currentStep === 1 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h2 style={{ fontSize: 20 }}>Select Delivery Address</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Items will be delivered to your doorstep in {selectedArea.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddr(!isAddingNewAddr)}
                      className="btn btn-outline btn-sm"
                    >
                      <Plus size={14} />
                      <span>{isAddingNewAddr ? 'Cancel' : 'Add New Address'}</span>
                    </button>
                  </div>

                  {isAddingNewAddr ? (
                    <form onSubmit={handleSaveNewAddress} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg-muted)', padding: 18, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                      <h4 style={{ fontSize: 15 }}>Enter New Address Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600 }}>Receiver Name</label>
                          <input
                            type="text"
                            value={newReceiverName}
                            onChange={(e) => setNewReceiverName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600 }}>Phone Number</label>
                          <input
                            type="text"
                            value={newReceiverPhone}
                            onChange={(e) => setNewReceiverPhone(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600 }}>Flat / House / Building / Street</label>
                        <input
                          type="text"
                          placeholder="e.g. Flat 302, Palm Heights, Main Road"
                          value={newFlatNo}
                          onChange={(e) => setNewFlatNo(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600 }}>Landmark (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Near Gurdwara / School"
                            value={newLandmark}
                            onChange={(e) => setNewLandmark(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600 }}>Address Tag</label>
                          <select
                            value={newAddrTitle}
                            onChange={(e) => setNewAddrTitle(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                        Save and Use this Address
                      </button>
                    </form>
                  ) : null}

                  {/* Saved Addresses list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddress?.id === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--primary-light)' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: isSelected ? '6px solid var(--primary)' : '2px solid var(--border)',
                            background: '#ffffff',
                            marginTop: 2,
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.title}</span>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>• {addr.receiver_name} ({addr.receiver_phone})</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4 }}>
                              {addr.flat_house_no}, {addr.area_locality}, {addr.city_name} - {addr.pincode}
                            </div>
                            {addr.landmark && (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                Landmark: {addr.landmark}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedAddress}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: 14 }}
                  >
                    <span>Proceed to Delivery Slot</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: DELIVERY SLOT */}
              {currentStep === 2 && (
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 6 }}>Select Delivery Window</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Orders are packed fresh by {shopName} and dispatched immediately.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                    <div
                      onClick={() => setDeliverySlot('Same-Day Express (30–60 mins)')}
                      style={{
                        padding: 18,
                        borderRadius: 'var(--radius-md)',
                        border: deliverySlot.includes('Express') ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: deliverySlot.includes('Express') ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={22} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>
                            Same-Day Express Delivery (Recommended)
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                            Estimated Arrival: <strong>{getEstimatedDeliveryWindow(30, 60)}</strong>
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--success)' }}>
                        FASTEST
                      </span>
                    </div>

                    <div
                      onClick={() => setDeliverySlot('Evening Slot (5:00 PM – 7:00 PM)')}
                      style={{
                        padding: 18,
                        borderRadius: 'var(--radius-md)',
                        border: deliverySlot.includes('Evening') ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: deliverySlot.includes('Evening') ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg-muted)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={22} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>
                            Evening Scheduled Slot
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                            Today, 5:00 PM – 7:00 PM
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                    >
                      <span>Review Order Summary</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ORDER SUMMARY */}
              {currentStep === 3 && (
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 6 }}>Review Your Order</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Please review your items from <strong>{shopName}</strong> before proceeding to payment.
                  </p>

                  {/* Delivery address snapshot */}
                  <div style={{ background: 'var(--bg-muted)', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Delivering To:
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {selectedAddress?.receiver_name} • {selectedAddress?.receiver_phone}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {selectedAddress?.flat_house_no}, {selectedAddress?.area_locality}, {selectedAddress?.city_name}
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: 240, overflowY: 'auto' }}>
                    {items.map((item) => (
                      <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty: {item.quantity} • {item.product.unit}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          {formatINR(item.product.discounted_price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: ONLINE PAYMENT (RAZORPAY ARCHITECTURE) */}
              {currentStep === 4 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 20 }}>Select Online Payment</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        100% Encrypted & Secured by Razorpay India
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '4px 8px',
                      borderRadius: 4
                    }}>
                      <ShieldCheck size={14} />
                      <span>TEST / MOCK READY</span>
                    </div>
                  </div>

                  {paymentError && (
                    <div style={{
                      padding: 12,
                      background: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <AlertCircle size={18} />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {/* UPI */}
                    <div
                      onClick={() => setPaymentMethod('upi')}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: paymentMethod === 'upi' ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <QrCode size={20} style={{ color: 'var(--primary)' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>UPI (GPay, PhonePe, Paytm, BHIM)</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Instant approval via UPI ID or QR</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#065f46', color: '#ffffff', padding: '2px 6px', borderRadius: 4 }}>
                          RECOMMENDED
                        </span>
                      </div>

                      {paymentMethod === 'upi' && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Enter VPA / UPI ID</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. yourname@okhdfcbank"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              marginTop: 4,
                              fontSize: 13
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Credit / Debit Card */}
                    <div
                      onClick={() => setPaymentMethod('card')}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        border: paymentMethod === 'card' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: paymentMethod === 'card' ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>Credit / Debit Card</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visa, MasterCard, RuPay, Maestro</div>
                        </div>
                      </div>

                      {paymentMethod === 'card' && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600 }}>Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600 }}>Expiry (MM/YY)</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600 }}>CVV</label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                maxLength={4}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Net Banking */}
                    <div
                      onClick={() => setPaymentMethod('netbanking')}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        border: paymentMethod === 'netbanking' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: paymentMethod === 'netbanking' ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <Building2 size={20} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Net Banking</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>HDFC, ICICI, SBI, Axis, Punjab National Bank</div>
                      </div>
                    </div>

                    {/* Wallets */}
                    <div
                      onClick={() => setPaymentMethod('wallet')}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        border: paymentMethod === 'wallet' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: paymentMethod === 'wallet' ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <Wallet size={20} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Wallets & Postpaid</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paytm Wallet, Amazon Pay, Mobikwik</div>
                      </div>
                    </div>
                  </div>

                  {/* Place Order CTA Button */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={isProcessing}
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePlaceOrderAndPay}
                      disabled={isProcessing}
                      className="btn btn-primary"
                      style={{ flex: 2, padding: 14, fontSize: 16 }}
                    >
                      <ShieldCheck size={20} />
                      <span>
                        {isProcessing ? 'Verifying Payment...' : `Pay ${formatINR(totalAmount)}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Bill Breakdown */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: 90
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Store size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: 16, lineHeight: 1.2 }}>{shopName || 'Local Shop'}</h3>
              </div>

              <div className="bill-row">
                <span>Items Total ({items.length})</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="bill-row">
                <span>Same-day Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                  ) : (
                    formatINR(deliveryFee)
                  )}
                </span>
              </div>
              <div className="bill-row">
                <span>Platform Fee</span>
                <span>{formatINR(platformFee)}</span>
              </div>
              <div className="bill-row">
                <span>GST (5%)</span>
                <span>{formatINR(taxAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="bill-row" style={{ color: 'var(--success)', fontWeight: 700 }}>
                  <span>Coupon Discount ({couponCode})</span>
                  <span>- {formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="bill-row total">
                <span>Grand Total</span>
                <span style={{ color: 'var(--primary)' }}>{formatINR(totalAmount)}</span>
              </div>

              <div style={{
                background: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                fontSize: 12,
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} style={{ color: 'var(--primary)' }} />
                  <span>Delivery slot: <strong>{deliverySlot}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
                  <span>Razorpay test & production certified checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
