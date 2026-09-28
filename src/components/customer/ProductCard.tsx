import React from 'react';
import Link from 'next/link';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';
import { Plus, Minus, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  shopName?: string;
  onOpenDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  shopName,
  onOpenDetails,
}) => {
  const { items, addToCart, updateQuantity } = useCart();

  const cartItem = items.find((i) => i.product_id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = !product.is_available || product.stock_quantity <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, shopName || product.shop_name);
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, qtyInCart - 1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, shopName || product.shop_name);
  };

  return (
    <div
      className="product-card"
      onClick={() => onOpenDetails && onOpenDetails(product)}
      style={{ cursor: onOpenDetails ? 'pointer' : 'default' }}
    >
      {/* Product Image */}
      <div className="product-img-wrapper">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        
        {product.discount_percentage > 0 && (
          <span className="product-discount-tag">
            {product.discount_percentage}% OFF
          </span>
        )}

        {onOpenDetails && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-sm)',
            }}
            title="View Details"
          >
            <Eye size={14} />
          </button>
        )}
      </div>

      {/* Shop & Brand */}
      <div className="product-shop-name">
        {product.brand || shopName || product.shop_name || 'Local Store'}
      </div>

      {/* Product Title */}
      <h4 className="product-title" title={product.name}>
        {product.name}
      </h4>

      {/* Unit / Pack */}
      <div className="product-unit">
        {product.unit}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <span style={{ color: 'var(--warning)', marginLeft: 6, fontWeight: 600 }}>
            • Only {product.stock_quantity} left
          </span>
        )}
      </div>

      {/* Price & Add to Cart Controls */}
      <div className="product-pricing-row">
        <div>
          <span className="product-price">
            {formatINR(product.discounted_price)}
          </span>
          {product.original_price > product.discounted_price && (
            <span className="product-mrp">
              {formatINR(product.original_price)}
            </span>
          )}
        </div>

        {isOutOfStock ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)' }}>
            Out of Stock
          </span>
        ) : qtyInCart > 0 ? (
          <div className="qty-counter" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={handleMinus}>
              <Minus size={13} />
            </button>
            <span>{qtyInCart}</span>
            <button type="button" onClick={handlePlus}>
              <Plus size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-outline btn-sm"
            style={{
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              fontWeight: 700,
              padding: '6px 14px',
            }}
          >
            ADD
          </button>
        )}
      </div>
    </div>
  );
};
