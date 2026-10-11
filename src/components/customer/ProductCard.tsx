import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';
import { Plus, Minus, Eye } from 'lucide-react';

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
      role="article"
      aria-label={product.name}
    >
      {/* Dedicated 1:1 Image Container */}
      <div className="product-img-wrapper">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
        />

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
            className="product-quick-view-btn"
            title="View Details"
            aria-label={`View details for ${product.name}`}
          >
            <Eye size={13} />
          </button>
        )}
      </div>

      {/* Structured Card Content */}
      <div className="product-info-wrap">
        {/* Brand / Shop */}
        <div className="product-shop-name" title={product.brand || shopName || product.shop_name || 'Local Store'}>
          {product.brand || shopName || product.shop_name || 'Local Store'}
        </div>

        {/* Product Title (2-line clamped) */}
        <h4 className="product-title" title={product.name}>
          {product.name}
        </h4>

        {/* Unit / Pack & Stock Warning */}
        <div className="product-unit">
          <span>{product.unit}</span>
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="product-stock-warning">
              • Only {product.stock_quantity} left
            </span>
          )}
        </div>

        {/* Bottom Pricing & Tap Action */}
        <div className="product-pricing-row">
          <div className="product-price-block">
            <span className="product-price">
              {formatINR(product.discounted_price)}
            </span>
            {product.original_price > product.discounted_price && (
              <span className="product-mrp">
                {formatINR(product.original_price)}
              </span>
            )}
          </div>

          <div className="product-action-block">
            {isOutOfStock ? (
              <span className="product-out-of-stock">
                Out of Stock
              </span>
            ) : qtyInCart > 0 ? (
              <div className="qty-counter" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={handleMinus} aria-label="Decrease quantity">
                  <Minus size={13} />
                </button>
                <span>{qtyInCart}</span>
                <button type="button" onClick={handlePlus} aria-label="Increase quantity">
                  <Plus size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="product-add-btn"
                aria-label={`Add ${product.name} to cart`}
              >
                ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
