import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { City, Area } from '../../types';
import { Building, MapPin, Plus, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // New City form
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('Punjab');
  const [newCityLat, setNewCityLat] = useState('31.6340');
  const [newCityLng, setNewCityLng] = useState('74.8723');

  // New Area form
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaPincode, setNewAreaPincode] = useState('143001');
  const [newAreaZone, setNewAreaZone] = useState('ZONE-1');

  const loadCities = async () => {
    try {
      const res = await fetch('/api/cities');
      const data = await res.json();
      setCities(data.cities || []);
      if (data.cities && data.cities.length > 0 && !selectedCityId) {
        setSelectedCityId(data.cities[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;

    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCityName.trim(),
          state: newCityState.trim(),
          latitude: parseFloat(newCityLat) || 28.61,
          longitude: parseFloat(newCityLng) || 77.20,
        }),
      });

      if (res.ok) {
        setNewCityName('');
        setIsAddingCity(false);
        await loadCities();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim() || !selectedCityId) return;

    try {
      const res = await fetch(`/api/cities/${selectedCityId}/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAreaName.trim(),
          pincode: newAreaPincode.trim(),
          delivery_zone_code: newAreaZone.trim(),
        }),
      });

      if (res.ok) {
        setNewAreaName('');
        setIsAddingArea(false);
        await loadCities();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeCity = cities.find((c) => c.id === selectedCityId) || cities[0];

  return (
    <>
      <Head>
        <title>Multi-City & Locality Manager | LocalKart Admin</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ background: '#0f172a', color: '#ffffff', padding: '14px 0', borderBottom: '1px solid #1e293b' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>
                Local<span>Kart</span>
              </Link>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>SUPER ADMIN</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/admin" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Overview
              </Link>
              <Link href="/admin/cities" style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>
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
            </div>
          </div>
        </nav>

        <main className="main-content" style={{ padding: '24px 0' }}>
          <div className="container" style={{ maxWidth: 940 }}>
            <div style={{ marginBottom: 20 }}>
              <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                <span>Back to Admin Overview</span>
              </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24 }}>Multi-City & Delivery Zone Expansion</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Expand the platform city-by-city across India and configure hyperlocal delivery zones
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingCity(!isAddingCity)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} />
                <span>Add New Indian City</span>
              </button>
            </div>

            {/* Add City Form */}
            {isAddingCity && (
              <form onSubmit={handleCreateCity} style={{
                background: '#ffffff',
                border: '2px solid var(--primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                marginBottom: 28,
                boxShadow: 'var(--shadow-md)'
              }}>
                <h3 style={{ fontSize: 18, marginBottom: 14 }}>Add New Operational City</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>City Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Amritsar, Jalandhar, Jaipur"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>State *</label>
                    <input
                      type="text"
                      placeholder="e.g. Punjab, Haryana, Rajasthan"
                      value={newCityState}
                      onChange={(e) => setNewCityState(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Center Latitude</label>
                    <input
                      type="text"
                      value={newCityLat}
                      onChange={(e) => setNewCityLat(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Center Longitude</label>
                    <input
                      type="text"
                      value={newCityLng}
                      onChange={(e) => setNewCityLng(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button type="button" onClick={() => setIsAddingCity(false)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Launch City on Platform
                  </button>
                </div>
              </form>
            )}

            {/* City Selector Tabs */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 24 }}>
              {cities.map((city) => {
                const isSelected = selectedCityId === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setSelectedCityId(city.id)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-light)' : '#ffffff',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 0
                    }}
                  >
                    <Building size={16} />
                    <span>{city.name}</span>
                    <span style={{ fontSize: 11, background: isSelected ? 'var(--primary)' : 'var(--bg-muted)', color: isSelected ? '#ffffff' : 'var(--text-muted)', padding: '2px 6px', borderRadius: 10 }}>
                      {city.areas?.length || 0} Areas
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected City Areas Section */}
            {activeCity && (
              <div style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: 24,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 18 }}>Localities & Service Areas in {activeCity.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Local shops define their service radius around these registered localities
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingArea(!isAddingArea)}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus size={14} />
                    <span>{isAddingArea ? 'Cancel' : `Add Locality to ${activeCity.name}`}</span>
                  </button>
                </div>

                {/* Add Area Form */}
                {isAddingArea && (
                  <form onSubmit={handleCreateArea} style={{
                    background: 'var(--bg-muted)',
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700 }}>Locality / Area Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Model Gram, Phase 2"
                          value={newAreaName}
                          onChange={(e) => setNewAreaName(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700 }}>Pincode *</label>
                        <input
                          type="text"
                          placeholder="e.g. 141002"
                          value={newAreaPincode}
                          onChange={(e) => setNewAreaPincode(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700 }}>Zone Code</label>
                        <input
                          type="text"
                          value={newAreaZone}
                          onChange={(e) => setNewAreaZone(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4, fontSize: 13 }}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'fit-content' }}>
                      Save Locality
                    </button>
                  </form>
                )}

                {/* Localities Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                  {(activeCity.areas || []).map((area) => (
                    <div
                      key={area.id}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{area.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          PIN: {area.pincode} • Zone: {area.delivery_zone_code || 'DEFAULT'}
                        </div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: 9 }}>
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
