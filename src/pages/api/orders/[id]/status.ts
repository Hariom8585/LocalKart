import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/db';
import { OrderStatus } from '../../../../types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const orderId = Array.isArray(id) ? id[0] : id;

  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    status,
    seller_preparation_minutes,
    rejection_reason,
    cancellation_reason,
    delivery_partner_id,
    customer_initiated,
    user_id,
  }: {
    status: OrderStatus;
    seller_preparation_minutes?: number;
    rejection_reason?: string;
    cancellation_reason?: string;
    delivery_partner_id?: string;
    customer_initiated?: boolean;
    user_id?: string;
  } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ error: 'Order id and new status are required' });
  }

  // Server-side strict rule check if customer initiates cancellation
  if (status === 'cancelled' && customer_initiated) {
    const cancelRes = db.cancelCustomerOrder(orderId, cancellation_reason || 'Cancelled by customer', user_id);
    if (!cancelRes.success) {
      return res.status(400).json({ error: cancelRes.error });
    }
    return res.status(200).json({
      success: true,
      message: cancelRes.message,
      order: cancelRes.order,
    });
  }

  let partnerDetails = {};
  if (delivery_partner_id) {
    const partner = db.getDeliveryPartners().find(p => p.id === delivery_partner_id);
    if (partner) {
      partnerDetails = {
        delivery_partner_id: partner.id,
        delivery_partner_name: partner.name,
        delivery_partner_phone: partner.phone,
      };
    }
  }

  const updatedOrder = db.updateOrderStatus(orderId, status, {
    seller_preparation_minutes,
    rejection_reason,
    cancellation_reason,
    ...partnerDetails,
  });

  if (!updatedOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    order: updatedOrder,
  });
}
