import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { NotificationChannel } from '../../../types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId, orderId, channel } = req.query;

    const notifs = db.getNotifications({
      userId: typeof userId === 'string' ? userId : undefined,
      orderId: typeof orderId === 'string' ? orderId : undefined,
      channel: typeof channel === 'string' ? (channel as NotificationChannel) : undefined,
    });

    return res.status(200).json({
      success: true,
      notifications: notifs,
      count: notifs.length,
    });
  }

  if (req.method === 'POST') {
    const { action, id, orderId, type, channel, message, title } = req.body || {};

    // Mark as read action
    if (action === 'mark_read' && id) {
      db.markNotificationRead(id);
      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    }

    // Manual test trigger or simulation
    if (action === 'trigger' && orderId) {
      const order = db.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const notif = db.createNotification({
        user_id: order.user_id,
        order_id: order.id,
        order_number: order.order_number,
        type: type || 'order_confirmed',
        channel: channel || 'whatsapp',
        recipient_phone: order.delivery_receiver_phone || order.customer_phone,
        title: title || 'Simulated Notification',
        message: message || `Update for order #${order.order_number}`,
        status: 'delivered',
      });

      return res.status(201).json({ success: true, notification: notif });
    }

    return res.status(400).json({ error: 'Invalid notification action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
