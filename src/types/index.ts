export type UserRole = 'customer' | 'seller' | 'delivery_partner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  is_active: boolean;
  latitude: number;
  longitude: number;
  areas?: Area[];
}

export interface Area {
  id: string;
  city_id: string;
  name: string;
  pincode: string;
  latitude: number;
  longitude: number;
  delivery_zone_code?: string;
  is_active: boolean;
}

export interface Address {
  id: string;
  user_id: string;
  title: string; // 'Home', 'Work', 'Other'
  receiver_name: string;
  receiver_phone: string;
  flat_house_no: string;
  area_locality: string;
  city_id: string;
  city_name: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface Shop {
  id: string;
  seller_id: string;
  city_id: string;
  name: string;
  slug: string;
  category: string; // e.g. 'Grocery & Essentials', 'Bakery', 'Pharmacy'
  category_id?: string;
  description: string;
  logo_url: string;
  banner_url: string;
  address_line: string;
  area_id: string;
  area_name: string;
  city_name: string;
  pincode: string;
  latitude: number;
  longitude: number;
  delivery_radius_km: number;
  serviceable_area_ids: string[];
  min_order_amount: number;
  base_delivery_fee: number;
  estimated_delivery_min: number;
  estimated_delivery_max: number;
  rating: number;
  rating_count: number;
  is_open: boolean;
  is_verified: boolean;
  is_suspended: boolean;
  commission_rate: number;
  opening_time: string; // "08:00 AM"
  closing_time: string; // "10:00 PM"
  distance_km?: number; // Calculated dynamically for customer
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  shop_id: string;
  shop_name?: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  unit: string; // '1 kg', '500 g', '1 litre', '1 pack'
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_available: boolean;
  is_featured: boolean;
  image_url: string;
  rating: number;
  rating_count: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  shop_id: string;
  quantity: number;
  unit_price: number;
}

export interface Cart {
  shop_id: string | null;
  shop_name?: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  tax_amount: number;
  discount_amount: number;
  coupon_code?: string;
  total_amount: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_successful'
  | 'order_confirmed'
  | 'seller_accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'delivery_partner_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected'
  | 'refund_initiated'
  | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shop_id: string;
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string;
  delivery_slot: string;
  estimated_delivery_time: string;
  actual_delivery_time?: string;
  
  // Delivery address snapshot
  delivery_receiver_name: string;
  delivery_receiver_phone: string;
  delivery_address_line: string;
  delivery_area_name: string;
  delivery_city_name: string;
  delivery_pincode: string;
  delivery_landmark?: string;

  // Seller prep
  seller_preparation_minutes: number;
  rejection_reason?: string;
  cancellation_reason?: string;

  // Delivery partner details
  delivery_partner_id?: string;
  delivery_partner_name?: string;
  delivery_partner_phone?: string;
  delivery_otp?: string;

  items: OrderItem[];
  payment?: Payment;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  is_mock: boolean;
  created_at: string;
}

export interface DeliveryPartner {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  is_online: boolean;
  is_verified: boolean;
  rating: number;
  total_deliveries_count: number;
  today_earnings: number;
  current_city_id: string;
}

export interface DeliveryTask {
  id: string;
  order_id: string;
  order: Order;
  partner_id?: string;
  status: 'assigned' | 'accepted' | 'at_shop' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  otp: string;
  delivery_fee_earned: number;
  tip_amount: number;
  pickup_time?: string;
  delivered_time?: string;
  masked_customer_phone: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  valid_until: string;
  city_id?: string;
  shop_id?: string;
  is_active: boolean;
  // Global maximum number of redemptions across all customers (undefined = unlimited)
  usage_limit?: number;
  // Maximum number of redemptions per customer (1 = one-time-use coupon, undefined = unlimited)
  usage_limit_per_user?: number;
  // Number of successful redemptions recorded so far (read-only, computed)
  usage_count?: number;
}

export interface CouponRedemption {
  id: string;
  coupon_id: string;
  coupon_code: string;
  user_id: string;
  order_id: string;
  discount_amount: number;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  shop_id: string;
  product_id?: string;
  shop_rating: number;
  delivery_rating?: number;
  review_comment: string;
  created_at: string;
}

export interface DeliveryFeeSlab {
  max_km: number;
  fee: number;
}

export interface PlatformConfig {
  delivery_slabs: DeliveryFeeSlab[];
  free_delivery_min_order: number;
  platform_fee: number;
  default_commission_rate: number;
}

export type NotificationChannel = 'whatsapp' | 'sms';

export type NotificationType =
  | 'order_confirmed'
  | 'seller_accepted'
  | 'preparing'
  | 'rider_assigned'
  | 'rider_arriving'
  | 'otp_available'
  | 'order_delivered'
  | 'order_cancelled';

export interface Notification {
  id: string;
  user_id: string;
  order_id: string;
  order_number: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient_phone: string;
  title: string;
  message: string;
  status: 'delivered' | 'read';
  created_at: string;
}

