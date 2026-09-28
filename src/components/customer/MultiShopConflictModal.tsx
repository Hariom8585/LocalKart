import React from 'react';
import { useCart } from '../../context/CartContext';
import { AlertTriangle, Store, RefreshCw, X } from 'lucide-react';

export const MultiShopConflictModal: React.FC = () => {
  const { conflict, resolveConflict } = useCart();

  if (!conflict.isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => resolveConflict('keep')}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--warning-bg)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertTriangle size={28} />
          </div>

          <h3 style={{ fontSize: 20, marginBottom: 8, lineHeight: 1.2 }}>
            Start a new order?
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Your cart already contains items from <strong>{conflict.currentShopName}</strong>. Because each shop prepares and delivers independently for same-day delivery, orders can only be placed from one shop at a time.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => resolveConflict('replace')}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px' }}
          >
            <RefreshCw size={16} />
            <span>Discard cart & add from {conflict.newShopName}</span>
          </button>

          <button
            type="button"
            onClick={() => resolveConflict('keep')}
            className="btn btn-outline"
            style={{ width: '100%', padding: '12px' }}
          >
            <Store size={16} />
            <span>Keep existing cart from {conflict.currentShopName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
