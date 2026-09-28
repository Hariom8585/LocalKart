import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { MapPin, Navigation, Check, X, Building, AlertCircle } from 'lucide-react';

export const LocationModal: React.FC = () => {
  const {
    cities,
    selectedCity,
    selectedArea,
    availableAreas,
    setSelectedCity,
    setSelectedArea,
    isLocationModalOpen,
    setIsLocationModalOpen,
    detectLocation,
  } = useLocation();

  const [detecting, setDetecting] = useState(false);
  const [detectMessage, setDetectMessage] = useState<string | null>(null);

  if (!isLocationModalOpen) return null;

  const handleDetect = async () => {
    setDetecting(true);
    setDetectMessage(null);
    const msg = await detectLocation();
    setDetecting(false);
    setDetectMessage(msg);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 20 }}>Select Your Delivery Location</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              We will only show trusted local shops that deliver to your area today.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            style={{ color: 'var(--text-muted)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* GPS Location Button */}
        <button
          type="button"
          onClick={handleDetect}
          disabled={detecting}
          className="btn btn-outline"
          style={{
            width: '100%',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderColor: 'var(--primary)',
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: 12
          }}
        >
          <Navigation size={18} className={detecting ? 'animate-spin' : ''} />
          <span>{detecting ? 'Locating nearest shops...' : 'Use Current GPS Location'}</span>
        </button>

        {detectMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--success-bg)',
            color: '#065f46',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Check size={16} />
            {detectMessage}
          </div>
        )}

        {/* City Selection Tabs */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
            1. Select City
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {cities.map((city) => {
              const isSelected = selectedCity.id === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--primary-light)' : '#ffffff',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 14,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Building size={18} style={{ margin: '0 auto 6px', display: 'block' }} />
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Locality / Area Selection */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
            2. Select Locality / Area in {selectedCity.name}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
            {availableAreas.map((area) => {
              const isSelected = selectedArea.id === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => {
                    setSelectedArea(area);
                    setIsLocationModalOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-muted)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div>{area.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PIN: {area.pincode}</div>
                  </div>
                  {isSelected && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info notice */}
        <div style={{
          marginTop: 20,
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-muted)',
          display: 'flex',
          gap: 10,
          fontSize: 12,
          color: 'var(--text-muted)',
          lineHeight: 1.4
        }}>
          <AlertCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>
            Only shops within your delivery zone ({selectedArea.name}) will be displayed to guarantee same-day doorstep fulfillment.
          </span>
        </div>
      </div>
    </div>
  );
};
