import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Shop } from '../../types';
import { Store, Save, Clock, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SellerSettingsPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(8);
  const [minOrderAmount, setMinOrderAmount] = useState(149);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(25);
  const [openingTime, setOpeningTime] = useState('08:00 AM');
  const [closingTime, setClosingTime] = useState('10:00 PM');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    async function loadShop() {
      try {
        const res = await fetch('/api/shops');
        const data = await res.json();
        const myShop = (data.shops || []).find((s: Shop) => s.seller_id === user.id) || data.shops[0];
        if (myShop) {
          setShop(myShop);
          setName(myShop.name);
          setDescription(myShop.description);
          setAddressLine(myShop.address_line);
          setDeliveryRadiusKm(myShop.delivery_radius_km);
          setMinOrderAmount(myShop.min_order_amount);
          setBaseDeliveryFee(myShop.base_delivery_fee);
          setOpeningTime(myShop.opening_time);
          setClosingTime(myShop.closing_time);
          setIsOpen(myShop.is_open);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [user.id]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          address_line: addressLine,
          delivery_radius_km: Number(deliveryRadiusKm),
          min_order_amount: Number(minOrderAmount),
          base_delivery_fee: Number(baseDeliveryFee),
          opening_time: openingTime,
          closing_time: closingTime,
          is_open: isOpen,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShop(data.shop);
        setSavedMessage('Store settings updated successfully!');
        setTimeout(() => setSavedMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Head>
        <title>{`Store Settings | ${shop?.name || 'Seller Center'}`}</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ background: '#ffffff', borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
                Local<span style={{ color: 'var(--secondary)' }}>Kart</span>
              </Link>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{shop?.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href="/seller" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Orders
              </Link>
              <Link href="/seller/catalog" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Catalog & Stock
              </Link>
              <Link href="/seller/settings" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                Store Settings
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24 }}>Store Configuration & Service Area</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Configure operating hours, delivery radius, minimum order value, and store availability
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

            <form onSubmit={handleSaveSettings} style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: 28,
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Store Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Store Tagline & Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Physical Shop Address *</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700 }}>Service Delivery Radius (km) *</label>
                  <input
                    type="number"
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
                    min={1}
                    max={25}
                    step={0.5}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Customers within this radius can order</span>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700 }}>Min. Order Amount (₹) *</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    min={0}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700 }}>Opening Time</label>
                  <input
                    type="text"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700 }}>Closing Time</label>
                  <input
                    type="text"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 6, fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Toggle Open/Closed */}
              <div style={{
                background: 'var(--bg-muted)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Store Availability Status</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {isOpen ? 'Store is open and listed to nearby customers' : 'Store is marked closed; customers cannot place new orders'}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    style={{ width: 20, height: 20, accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 14, color: isOpen ? 'var(--success)' : 'var(--danger)' }}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: 10, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Save size={18} />
                <span>Save Store Configuration</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
