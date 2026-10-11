import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RazorpayService } from '../../../lib/razorpay';
import { CartItem, Address } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      user_id,
      customer_name,
      customer_phone,
      customer_email,
      shop_id,
      items,
      address,
      delivery_slot,
      coupon_code,
    }: {
      user_id: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      shop_id: string;
      items: CartItem[];
      address: Address;
      delivery_slot: string;
      coupon_code?: string;
    } = req.body;

    if (!shop_id || !items || items.length === 0 || !address) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const shop = db.getShop(shop_id);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // SERVER-SIDE VALIDATION: Never trust client prices or totals!
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = db.getProduct(item.product_id);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${item.product_id}` });
      }
      if (prod.shop_id !== shop_id) {
        return res.status(400).json({ error: 'All items must belong to the same local shop' });
      }
      if (!prod.is_available || prod.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Product "${prod.name}" is out of stock or insufficient quantity (Available: ${prod.stock_quantity})`,
        });
      }

      const itemTotal = prod.discounted_price * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        id: `item-${Date.now()}-${prod.id}`,
        order_id: '',
        product_id: prod.id,
        product_name: prod.name,
        product_image: prod.image_url,
        unit_price: prod.discounted_price,
        quantity: item.quantity,
        total_price: itemTotal,
      });
    }

    // Server-side Fees Calculation
    const deliveryFee = calculatedSubtotal >= 499 ? 0 : (shop.base_delivery_fee || 25);
    const platformFee = 5;
    const taxAmount = Math.round(calculatedSubtotal * 0.05);

    // Validate coupon server-side (never trust client discount)
    let discountAmount = 0;
    if (coupon_code) {
      const couponCheck = db.validateCoupon(coupon_code, calculatedSubtotal, shop.city_id, shop.id, user_id);
      if (!couponCheck.valid || !couponCheck.discount) {
        return res.status(400).json({ error: couponCheck.message || 'Invalid coupon code' });
      }
      discountAmount = couponCheck.discount;
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal + deliveryFee + platformFee + taxAmount - discountAmount);

    // Create Razorpay Order
    const razorpayOrder = await RazorpayService.createOrder({
      amount: calculatedTotal * 100, // in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        shop_id,
        shop_name: shop.name,
        customer_name,
      },
    });

    // Save preliminary order into DB
    const newOrder = db.createOrder({
      user_id: user_id || 'user-cust-1',
      customer_name: customer_name || 'Hariom Yadav',
      customer_phone: customer_phone || '+91 98765 43210',
      customer_email: customer_email || 'customer@example.com',
      shop_id: shop.id,
      shop_name: shop.name,
      shop_address: `${shop.address_line}, ${shop.area_name}, ${shop.city_name}`,
      shop_phone: '+91 98141 22334',
      status: 'pending_payment',
      subtotal: calculatedSubtotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: calculatedTotal,
      coupon_code: coupon_code || undefined,
      delivery_slot: delivery_slot || 'Same-Day Express (30–60 mins)',
      estimated_delivery_time: 'Today, within 45 mins',
      delivery_receiver_name: address.receiver_name,
      delivery_receiver_phone: address.receiver_phone,
      delivery_address_line: address.flat_house_no,
      delivery_area_name: address.area_locality,
      delivery_city_name: address.city_name,
      delivery_pincode: address.pincode,
      delivery_landmark: address.landmark,
      seller_preparation_minutes: 25,
      delivery_otp: `${Math.floor(1000 + Math.random() * 9000)}`,
      items: validatedItems,
      payment: {
        id: `pay-${Date.now()}`,
        order_id: '',
        payment_method: 'upi',
        amount: calculatedTotal,
        currency: 'INR',
        status: 'pending',
        razorpay_order_id: razorpayOrder.id,
        is_mock: razorpayOrder.is_mock,
        created_at: new Date().toISOString(),
      },
    });

    return res.status(201).json({
      order: newOrder,
      razorpayOrder,
      isMock: razorpayOrder.is_mock,
      keyId: razorpayOrder.is_mock
        ? undefined
        : (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID),
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message || 'Order creation failed' });
  }
}
