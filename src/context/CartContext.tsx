import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartConflict {
  isOpen: boolean;
  currentShopName: string;
  newProduct: Product | null;
  newShopName: string;
}

interface CartContextType {
  items: CartItem[];
  shopId: string | null;
  shopName: string;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxAmount: number;
  discountAmount: number;
  couponCode: string;
  totalAmount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  conflict: CartConflict;
  addToCart: (product: Product, quantity?: number, shopName?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  resolveConflict: (action: 'keep' | 'replace') => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [conflict, setConflict] = useState<CartConflict>({
    isOpen: false,
    currentShopName: '',
    newProduct: null,
    newShopName: '',
  });

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('localkart_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(parsed.items || []);
        setShopId(parsed.shopId || null);
        setShopName(parsed.shopName || '');
        setCouponCode(parsed.couponCode || '');
        setDiscountAmount(parsed.discountAmount || 0);
      }
    } catch (e) {
      console.warn('Could not load cart from storage', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'localkart_cart',
        JSON.stringify({
          items,
          shopId,
          shopName,
          couponCode,
          discountAmount,
        })
      );
    } catch (e) {
      console.warn('Could not save cart to storage', e);
    }
  }, [items, shopId, shopName, couponCode, discountAmount]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.discounted_price * item.quantity,
    0
  );

  // Delivery fee logic: Flat ₹25, or free if order >= ₹499
  const deliveryFee = subtotal >= 499 || items.length === 0 ? 0 : 25;
  const platformFee = items.length > 0 ? 5 : 0;
  const taxAmount = Math.round(subtotal * 0.05); // 5% GST

  const totalAmount = Math.max(0, subtotal + deliveryFee + platformFee + taxAmount - discountAmount);

  const addToCart = (product: Product, quantity: number = 1, currentShopName?: string) => {
    // Check single-shop rule!
    if (shopId && shopId !== product.shop_id && items.length > 0) {
      setConflict({
        isOpen: true,
        currentShopName: shopName || 'another shop',
        newProduct: product,
        newShopName: currentShopName || product.shop_name || 'new shop',
      });
      return;
    }

    // Set shop
    if (!shopId) {
      setShopId(product.shop_id);
      if (currentShopName || product.shop_name) {
        setShopName(currentShopName || product.shop_name || '');
      }
    }

    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.product_id === product.id);
      if (existing) {
        return prevItems.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prevItems,
        {
          id: `item-${Date.now()}-${product.id}`,
          product_id: product.id,
          product,
          shop_id: product.shop_id,
          quantity,
          unit_price: product.discounted_price,
        },
      ];
    });

    setIsCartDrawerOpen(true);
  };

  const resolveConflict = (action: 'keep' | 'replace') => {
    if (action === 'replace' && conflict.newProduct) {
      const product = conflict.newProduct;
      const newItems: CartItem[] = [
        {
          id: `item-${Date.now()}-${product.id}`,
          product_id: product.id,
          product,
          shop_id: product.shop_id,
          quantity: 1,
          unit_price: product.discounted_price,
        },
      ];
      setItems(newItems);
      setShopId(product.shop_id);
      setShopName(conflict.newShopName);
      setCouponCode('');
      setDiscountAmount(0);
      setIsCartDrawerOpen(true);
    }
    setConflict({
      isOpen: false,
      currentShopName: '',
      newProduct: null,
      newShopName: '',
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.product_id !== productId);
      if (updated.length === 0) {
        setShopId(null);
        setShopName('');
        setCouponCode('');
        setDiscountAmount(0);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setShopId(null);
    setShopName('');
    setCouponCode('');
    setDiscountAmount(0);
  };

  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          subtotal,
          shopId,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponCode(data.coupon.code);
        setDiscountAmount(data.discount);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code' };
      }
    } catch (e) {
      return { success: false, message: 'Could not validate coupon' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        shopId,
        shopName,
        itemCount,
        subtotal,
        deliveryFee,
        platformFee,
        taxAmount,
        discountAmount,
        couponCode,
        totalAmount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        conflict,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        resolveConflict,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
