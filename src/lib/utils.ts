import { OrderStatus } from '../types';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate distance in kilometers using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(1));
}

// Estimate delivery window based on current time
export function getEstimatedDeliveryWindow(minMinutes: number = 30, maxMinutes: number = 60): string {
  const now = new Date();
  const start = new Date(now.getTime() + minMinutes * 60000);
  const end = new Date(now.getTime() + maxMinutes * 60000);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

  return `Today, ${formatTime(start)} – ${formatTime(end)}`;
}

export const ORDER_STATUS_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending_payment', label: 'Pending Payment', description: 'Awaiting payment confirmation' },
  { status: 'payment_successful', label: 'Payment Confirmed', description: 'Payment verified successfully' },
  { status: 'order_confirmed', label: 'Order Confirmed', description: 'Sent to local shop' },
  { status: 'seller_accepted', label: 'Shop Accepted', description: 'Shop confirmed your order' },
  { status: 'preparing', label: 'Preparing Order', description: 'Packing fresh items with care' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', description: 'Packed & awaiting delivery partner' },
  { status: 'delivery_partner_assigned', label: 'Partner Assigned', description: 'Delivery partner assigned' },
  { status: 'picked_up', label: 'Picked Up', description: 'Partner picked up order from shop' },
  { status: 'out_for_delivery', label: 'Out for Delivery', description: 'Partner is on the way to your door' },
  { status: 'delivered', label: 'Delivered', description: 'Delivered to your doorstep' },
];

export function getOrderStatusStepIndex(status: OrderStatus): number {
  const idx = ORDER_STATUS_STEPS.findIndex(s => s.status === status);
  return idx !== -1 ? idx : 0;
}

export function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case 'delivered':
      return 'badge-success';
    case 'out_for_delivery':
    case 'picked_up':
    case 'ready_for_pickup':
      return 'badge-primary';
    case 'seller_accepted':
    case 'preparing':
    case 'order_confirmed':
      return 'badge-warning';
    case 'cancelled':
    case 'rejected':
      return 'badge-danger';
    default:
      return 'badge-default';
  }
}
