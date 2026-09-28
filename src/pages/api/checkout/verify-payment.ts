import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RazorpayService } from '../../../lib/razorpay';
import { PaymentMethod } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_method,
    }: {
      order_id: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      payment_method?: PaymentMethod;
    } = req.body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing payment verification credentials' });
    }

    const order = db.getOrder(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify signature
    const isValid = RazorpayService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature || 'mock_sig_success'
    );

    if (!isValid) {
      db.updateOrderStatus(order.id, 'cancelled', {
        cancellation_reason: 'Payment signature verification failed',
      });
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    // Update payment details
    if (order.payment) {
      order.payment.status = 'captured';
      order.payment.razorpay_payment_id = razorpay_payment_id;
      if (payment_method) order.payment.payment_method = payment_method;
    }

    // Auto-assign first available delivery partner in city
    const partners = db.getDeliveryPartners();
    const assignedPartner = partners.find(p => p.is_online) || partners[0];

    // Transition Order Status to 'order_confirmed'
    const updatedOrder = db.updateOrderStatus(order.id, 'order_confirmed', {
      delivery_partner_id: assignedPartner?.id,
      delivery_partner_name: assignedPartner?.name,
      delivery_partner_phone: assignedPartner?.phone,
    });

    // Record coupon redemption once payment is confirmed. This ledger is what
    // enforces global usage limits and one-time-per-customer rules, and it is
    // intentionally NOT reversed on cancellation (prevents cancel/reuse abuse).
    if (order.coupon_code && order.discount_amount > 0) {
      const coupon = db.getCoupons().find(
        c => c.code.toUpperCase() === order.coupon_code!.toUpperCase()
      );
      if (coupon) {
        const redemption = db.redeemCoupon({
          coupon_id: coupon.id,
          coupon_code: coupon.code,
          user_id: order.user_id,
          order_id: order.id,
          discount_amount: order.discount_amount,
        });
        if (!redemption.redeemed) {
          console.warn('Coupon redemption skipped:', redemption.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: error.message || 'Payment verification failed' });
  }
}
