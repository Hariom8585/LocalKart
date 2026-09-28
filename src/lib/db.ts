import fs from 'fs';
import path from 'path';
import {
  City, Area, Category, Shop, Product, User, Order,
  DeliveryPartner, Coupon, CouponRedemption, Review, PlatformConfig, OrderStatus, Address,
  Notification, NotificationChannel, NotificationType
} from '../types';
import {
  INITIAL_CITIES, INITIAL_AREAS, INITIAL_CATEGORIES,
  INITIAL_SHOPS, INITIAL_PRODUCTS, INITIAL_USERS,
  INITIAL_COUPONS, INITIAL_DELIVERY_PARTNERS,
  INITIAL_PLATFORM_CONFIG, INITIAL_ORDERS
} from './seed-data';

interface DatabaseSchema {
  cities: City[];
  areas: Area[];
  categories: Category[];
  shops: Shop[];
  products: Product[];
  users: User[];
  orders: Order[];
  deliveryPartners: DeliveryPartner[];
  coupons: Coupon[];
  couponRedemptions: CouponRedemption[];
  reviews: Review[];
  platformConfig: PlatformConfig;
  addresses: Address[];
  notifications: Notification[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'localkart_db.json');

// In-memory cache
let cachedDb: DatabaseSchema | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Graceful fallback for read-only serverless environments (e.g. Vercel)
  }
}

function loadDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(data);
      // Migrate older DB files that predate coupon redemption tracking.
      if (!Array.isArray(cachedDb!.couponRedemptions)) {
        cachedDb!.couponRedemptions = [];
      }
      if (!Array.isArray(cachedDb!.addresses)) {
        cachedDb!.addresses = [
          {
            id: 'addr-1',
            user_id: 'user-cust-1',
            title: 'Home',
            receiver_name: 'Rahul Sharma',
            receiver_phone: '+91 98765 43210',
            flat_house_no: 'Flat 402, Green Avenue',
            area_locality: 'Model Town',
            city_id: 'city-ldh',
            city_name: 'Ludhiana',
            pincode: '141002',
            landmark: 'Near Krishna Mandir',
            is_default: true,
          },
          {
            id: 'addr-2',
            user_id: 'user-cust-1',
            title: 'Office',
            receiver_name: 'Rahul Sharma',
            receiver_phone: '+91 98765 43210',
            flat_house_no: 'Suite 301, Fortune Chambers',
            area_locality: 'Ferozepur Road',
            city_id: 'city-ldh',
            city_name: 'Ludhiana',
            pincode: '141012',
            landmark: 'Opposite Westend Mall',
            is_default: false,
          },
          {
            id: 'addr-3',
            user_id: 'user-cust-1',
            title: 'Work (Chandigarh)',
            receiver_name: 'Rahul Sharma',
            receiver_phone: '+91 98765 43210',
            flat_house_no: 'SCO 45-46, Top Floor',
            area_locality: 'Sector 17',
            city_id: 'city-chd',
            city_name: 'Chandigarh',
            pincode: '160017',
            landmark: 'Near Plaza Fountain',
            is_default: false,
          }
        ];
      }
      if (!Array.isArray(cachedDb!.notifications)) {
        cachedDb!.notifications = [
          {
            id: 'notif-seed-1',
            user_id: 'user-cust-1',
            order_id: 'order-sample-101',
            order_number: 'LK-2026-89102',
            type: 'order_confirmed',
            channel: 'whatsapp',
            recipient_phone: '+91 98765 43210',
            title: '🛍️ Order Confirmed!',
            message: 'Hi Rahul Sharma, your order #LK-2026-89102 from *Sharma General Store* is confirmed! Total: ₹624. Same-day express delivery in progress.',
            status: 'read',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'notif-seed-2',
            user_id: 'user-cust-1',
            order_id: 'order-sample-101',
            order_number: 'LK-2026-89102',
            type: 'otp_available',
            channel: 'sms',
            recipient_phone: '+91 98765 43210',
            title: 'LocalKart Doorstep OTP',
            message: 'LocalKart OTP: 4892 is your delivery verification code for order #LK-2026-89102. Share only with rider upon doorstep arrival.',
            status: 'read',
            created_at: new Date(Date.now() - 2400000).toISOString(),
          },
          {
            id: 'notif-seed-3',
            user_id: 'user-cust-1',
            order_id: 'order-sample-101',
            order_number: 'LK-2026-89102',
            type: 'order_delivered',
            channel: 'whatsapp',
            recipient_phone: '+91 98765 43210',
            title: '🎉 Order Delivered Successfully!',
            message: 'Order #LK-2026-89102 delivered successfully! Enjoy your fresh items from *Sharma General Store*. Thank you for shopping local with LocalKart.',
            status: 'read',
            created_at: new Date(Date.now() - 1200000).toISOString(),
          }
        ];
      }
      return cachedDb!;
    } catch (e) {
      console.error('Failed to read DB file, resetting to initial seed', e);
    }
  }

  // Initial seed
  const initialDb: DatabaseSchema = {
    cities: INITIAL_CITIES,
    areas: INITIAL_AREAS,
    categories: INITIAL_CATEGORIES,
    shops: INITIAL_SHOPS,
    products: INITIAL_PRODUCTS,
    users: INITIAL_USERS,
    orders: INITIAL_ORDERS,
    deliveryPartners: INITIAL_DELIVERY_PARTNERS,
    coupons: INITIAL_COUPONS,
    couponRedemptions: [],
    reviews: [
      {
        id: 'rev-1',
        order_id: 'order-sample-101',
        user_id: 'user-cust-1',
        user_name: 'Rahul Sharma',
        shop_id: 'shop-ldh-1',
        shop_rating: 5,
        delivery_rating: 5,
        review_comment: 'Received fresh items in under 35 minutes! Truly impressed by the same-day local delivery speed.',
        created_at: '2026-09-15T08:50:00Z',
      }
    ],
    platformConfig: INITIAL_PLATFORM_CONFIG,
    addresses: [
      {
        id: 'addr-1',
        user_id: 'user-cust-1',
        title: 'Home',
        receiver_name: 'Rahul Sharma',
        receiver_phone: '+91 98765 43210',
        flat_house_no: 'Flat 402, Green Avenue',
        area_locality: 'Model Town',
        city_id: 'city-ldh',
        city_name: 'Ludhiana',
        pincode: '141002',
        landmark: 'Near Krishna Mandir',
        is_default: true,
      },
      {
        id: 'addr-2',
        user_id: 'user-cust-1',
        title: 'Office',
        receiver_name: 'Rahul Sharma',
        receiver_phone: '+91 98765 43210',
        flat_house_no: 'Suite 301, Fortune Chambers',
        area_locality: 'Ferozepur Road',
        city_id: 'city-ldh',
        city_name: 'Ludhiana',
        pincode: '141012',
        landmark: 'Opposite Westend Mall',
        is_default: false,
      },
      {
        id: 'addr-3',
        user_id: 'user-cust-1',
        title: 'Work (Chandigarh)',
        receiver_name: 'Rahul Sharma',
        receiver_phone: '+91 98765 43210',
        flat_house_no: 'SCO 45-46, Top Floor',
        area_locality: 'Sector 17',
        city_id: 'city-chd',
        city_name: 'Chandigarh',
        pincode: '160017',
        landmark: 'Near Plaza Fountain',
        is_default: false,
      }
    ],
    notifications: [
      {
        id: 'notif-seed-1',
        user_id: 'user-cust-1',
        order_id: 'order-sample-101',
        order_number: 'LK-2026-89102',
        type: 'order_confirmed',
        channel: 'whatsapp',
        recipient_phone: '+91 98765 43210',
        title: '🛍️ Order Confirmed!',
        message: 'Hi Rahul Sharma, your order #LK-2026-89102 from *Sharma General Store* is confirmed! Total: ₹624. Same-day express delivery in progress.',
        status: 'read',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-seed-2',
        user_id: 'user-cust-1',
        order_id: 'order-sample-101',
        order_number: 'LK-2026-89102',
        type: 'otp_available',
        channel: 'sms',
        recipient_phone: '+91 98765 43210',
        title: 'LocalKart Doorstep OTP',
        message: 'LocalKart OTP: 4892 is your delivery verification code for order #LK-2026-89102. Share only with rider upon doorstep arrival.',
        status: 'read',
        created_at: new Date(Date.now() - 2400000).toISOString(),
      },
      {
        id: 'notif-seed-3',
        user_id: 'user-cust-1',
        order_id: 'order-sample-101',
        order_number: 'LK-2026-89102',
        type: 'order_delivered',
        channel: 'whatsapp',
        recipient_phone: '+91 98765 43210',
        title: '🎉 Order Delivered Successfully!',
        message: 'Order #LK-2026-89102 delivered successfully! Enjoy your fresh items from *Sharma General Store*. Thank you for shopping local with LocalKart.',
        status: 'read',
        created_at: new Date(Date.now() - 1200000).toISOString(),
      }
    ],
  };

  saveDatabase(initialDb);
  cachedDb = initialDb;
  return cachedDb;
}

function saveDatabase(db: DatabaseSchema) {
  cachedDb = db;
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // In serverless environments with read-only root filesystems (e.g. Vercel),
    // cachedDb stays active in memory for the request execution
  }
}

export const db = {
  // Cities & Areas
  getCities: () => {
    const data = loadDatabase();
    return data.cities.map(city => ({
      ...city,
      areas: data.areas.filter(a => a.city_id === city.id)
    }));
  },

  getCity: (id: string) => {
    const data = loadDatabase();
    const city = data.cities.find(c => c.id === id);
    if (!city) return null;
    return {
      ...city,
      areas: data.areas.filter(a => a.city_id === city.id)
    };
  },

  createCity: (cityData: Omit<City, 'id'>) => {
    const data = loadDatabase();
    const newCity: City = {
      ...cityData,
      id: `city-${Date.now()}`
    };
    data.cities.push(newCity);
    saveDatabase(data);
    return newCity;
  },

  createArea: (areaData: Omit<Area, 'id'>) => {
    const data = loadDatabase();
    const newArea: Area = {
      ...areaData,
      id: `area-${Date.now()}`
    };
    data.areas.push(newArea);
    saveDatabase(data);
    return newArea;
  },

  // Categories
  getCategories: () => {
    return loadDatabase().categories.sort((a, b) => a.display_order - b.display_order);
  },

  createCategory: (cat: Omit<Category, 'id'>) => {
    const data = loadDatabase();
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    data.categories.push(newCat);
    saveDatabase(data);
    return newCat;
  },

  deleteCategory: (id: string) => {
    const data = loadDatabase();
    data.categories = data.categories.filter(c => c.id !== id);
    saveDatabase(data);
  },

  // Shops
  getShops: (filters?: {
    cityId?: string;
    areaId?: string;
    categoryId?: string;
    search?: string;
    openOnly?: boolean;
  }) => {
    const data = loadDatabase();
    let shops = [...data.shops].filter(s => !s.is_suspended);

    if (filters?.cityId) {
      shops = shops.filter(s => s.city_id === filters.cityId);
    }

    if (filters?.areaId) {
      const targetAreaId = filters.areaId;
      shops = shops.filter(s =>
        s.area_id === targetAreaId ||
        (s.serviceable_area_ids && s.serviceable_area_ids.includes(targetAreaId))
      );
    }

    if (filters?.categoryId) {
      const targetCatId = filters.categoryId;
      shops = shops.filter(s => s.category_id === targetCatId || s.category.toLowerCase().includes(targetCatId.toLowerCase()));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      shops = shops.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    if (filters?.openOnly) {
      shops = shops.filter(s => s.is_open);
    }

    return shops;
  },

  getShop: (idOrSlug: string) => {
    const data = loadDatabase();
    return data.shops.find(s => s.id === idOrSlug || s.slug === idOrSlug) || null;
  },

  createShop: (shopData: Omit<Shop, 'id' | 'slug' | 'rating' | 'rating_count' | 'is_verified' | 'is_suspended'>) => {
    const data = loadDatabase();
    const slug = shopData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newShop: Shop = {
      ...shopData,
      id: `shop-${Date.now()}`,
      slug,
      rating: 4.8,
      rating_count: 0,
      is_verified: false,
      is_suspended: false,
    };
    data.shops.push(newShop);
    saveDatabase(data);
    return newShop;
  },

  updateShop: (id: string, updates: Partial<Shop>) => {
    const data = loadDatabase();
    const index = data.shops.findIndex(s => s.id === id);
    if (index === -1) return null;
    data.shops[index] = { ...data.shops[index], ...updates };
    saveDatabase(data);
    return data.shops[index];
  },

  // Products
  getProducts: (filters?: {
    shopId?: string;
    categoryId?: string;
    search?: string;
    featuredOnly?: boolean;
    availableOnly?: boolean;
  }) => {
    const data = loadDatabase();
    let products = [...data.products];

    if (filters?.shopId) {
      products = products.filter(p => p.shop_id === filters.shopId);
    }

    if (filters?.categoryId) {
      products = products.filter(p => p.category_id === filters.categoryId);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (filters?.featuredOnly) {
      products = products.filter(p => p.is_featured);
    }

    if (filters?.availableOnly) {
      products = products.filter(p => p.is_available && p.stock_quantity > 0);
    }

    // Attach shop names
    return products.map(p => {
      const shop = data.shops.find(s => s.id === p.shop_id);
      const category = data.categories.find(c => c.id === p.category_id);
      return {
        ...p,
        shop_name: shop ? shop.name : undefined,
        category_name: category ? category.name : undefined,
      };
    });
  },

  getProduct: (id: string) => {
    const data = loadDatabase();
    const p = data.products.find(prod => prod.id === id);
    if (!p) return null;
    const shop = data.shops.find(s => s.id === p.shop_id);
    const category = data.categories.find(c => c.id === p.category_id);
    return {
      ...p,
      shop_name: shop ? shop.name : undefined,
      category_name: category ? category.name : undefined,
    };
  },

  createProduct: (productData: Omit<Product, 'id' | 'discount_percentage' | 'created_at'>) => {
    const data = loadDatabase();
    const discount = productData.original_price > 0 && productData.discounted_price < productData.original_price
      ? Math.round(((productData.original_price - productData.discounted_price) / productData.original_price) * 100)
      : 0;

    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      discount_percentage: discount,
      created_at: new Date().toISOString(),
    };
    data.products.push(newProd);
    saveDatabase(data);
    return newProd;
  },

  updateProduct: (id: string, updates: Partial<Product>) => {
    const data = loadDatabase();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated = { ...data.products[index], ...updates };
    if (updated.original_price > 0 && updated.discounted_price < updated.original_price) {
      updated.discount_percentage = Math.round(((updated.original_price - updated.discounted_price) / updated.original_price) * 100);
    }
    data.products[index] = updated;
    saveDatabase(data);
    return updated;
  },

  deleteProduct: (id: string) => {
    const data = loadDatabase();
    data.products = data.products.filter(p => p.id !== id);
    saveDatabase(data);
  },

  // Orders
  getOrders: (filters?: {
    userId?: string;
    shopId?: string;
    partnerId?: string;
    status?: OrderStatus;
  }) => {
    const data = loadDatabase();
    let orders = [...data.orders];

    if (filters?.userId) {
      orders = orders.filter(o => o.user_id === filters.userId);
    }
    if (filters?.shopId) {
      orders = orders.filter(o => o.shop_id === filters.shopId);
    }
    if (filters?.partnerId) {
      orders = orders.filter(o => o.delivery_partner_id === filters.partnerId);
    }
    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }

    return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getOrder: (id: string) => {
    const data = loadDatabase();
    return data.orders.find(o => o.id === id || o.order_number === id) || null;
  },

  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => {
    const data = loadDatabase();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `LK-${new Date().getFullYear()}-${randomSuffix}`;
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Deduct stock
    for (const item of newOrder.items) {
      const prod = data.products.find(p => p.id === item.product_id);
      if (prod) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
      }
    }

    data.orders.push(newOrder);
    saveDatabase(data);
    return newOrder;
  },

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    details?: {
      rejection_reason?: string;
      cancellation_reason?: string;
      seller_preparation_minutes?: number;
      delivery_partner_id?: string;
      delivery_partner_name?: string;
      delivery_partner_phone?: string;
    }
  ) => {
    const data = loadDatabase();
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return null;

    const prevStatus = order.status;
    order.status = status;
    order.updated_at = new Date().toISOString();

    if (details?.rejection_reason) order.rejection_reason = details.rejection_reason;
    if (details?.cancellation_reason) order.cancellation_reason = details.cancellation_reason;
    if (details?.seller_preparation_minutes) order.seller_preparation_minutes = details.seller_preparation_minutes;
    if (details?.delivery_partner_id) order.delivery_partner_id = details.delivery_partner_id;
    if (details?.delivery_partner_name) order.delivery_partner_name = details.delivery_partner_name;
    if (details?.delivery_partner_phone) order.delivery_partner_phone = details.delivery_partner_phone;

    if (status === 'delivered') {
      order.actual_delivery_time = new Date().toISOString();
      // Increase delivery partner stats
      if (order.delivery_partner_id) {
        const dp = data.deliveryPartners.find(p => p.id === order.delivery_partner_id);
        if (dp) {
          dp.total_deliveries_count += 1;
          dp.today_earnings += 45;
        }
      }
    }

    // Restore inventory when an order is cancelled or rejected (and stock wasn't already restored)
    if ((status === 'cancelled' || status === 'rejected') && !['cancelled', 'rejected', 'delivered'].includes(prevStatus)) {
      for (const item of order.items) {
        const prod = data.products.find(p => p.id === item.product_id);
        if (prod) {
          prod.stock_quantity += item.quantity;
        }
      }
    }

    // Auto-generate realistic simulated WhatsApp & SMS notifications
    const newNotifs = generateNotificationsForStatus(order, status, details);
    if (!Array.isArray(data.notifications)) data.notifications = [];
    data.notifications.unshift(...newNotifs);

    saveDatabase(data);
    return order;
  },

  // Customer Order Cancellation Rule:
  // - Customer can cancel only within 5 minutes of order placement
  // - Shop-accepted, preparing, and in-transit orders CANNOT be cancelled by customer
  cancelCustomerOrder: (orderId: string, cancellationReason: string, userId?: string) => {
    const data = loadDatabase();
    const order = data.orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    if (userId && order.user_id !== userId) {
      return { success: false, error: 'Unauthorized: You can only cancel your own orders.' };
    }

    if (order.status === 'cancelled') {
      return { success: false, error: 'Order is already cancelled.' };
    }

    if (order.status === 'rejected') {
      return { success: false, error: 'Order has already been rejected by the shop.' };
    }

    if (order.status === 'delivered') {
      return { success: false, error: 'Delivered orders cannot be cancelled.' };
    }

    // Rule 1: Orders already accepted or in-transit cannot be cancelled by customer
    const nonCancellableStatuses: OrderStatus[] = [
      'seller_accepted',
      'preparing',
      'ready_for_pickup',
      'delivery_partner_assigned',
      'picked_up',
      'out_for_delivery',
      'delivered'
    ];

    if (nonCancellableStatuses.includes(order.status)) {
      return {
        success: false,
        error: `Cancellation unavailable: Your order has already been accepted and processed by ${order.shop_name} (${order.status.replace(/_/g, ' ')}). Please contact customer support for emergency assistance.`
      };
    }

    // Rule 2: 5-minute cancellation window (300 seconds)
    const orderTimestamp = new Date(order.created_at).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - orderTimestamp) / 1000));
    const CANCELLATION_WINDOW_SECONDS = 300; // 5 minutes

    if (elapsedSeconds > CANCELLATION_WINDOW_SECONDS) {
      const minutesElapsed = Math.floor(elapsedSeconds / 60);
      return {
        success: false,
        error: `Cancellation window expired: Orders can only be cancelled within 5 minutes of placement (${minutesElapsed} minutes elapsed). The store is already fulfilling your order.`
      };
    }

    const updated = db.updateOrderStatus(orderId, 'cancelled', {
      cancellation_reason: cancellationReason || 'Cancelled by customer within 5-minute window',
    });

    return {
      success: true,
      message: 'Order cancelled successfully. Full refund initiated.',
      order: updated,
    };
  },

  // Delivery Partners
  getDeliveryPartners: (cityId?: string) => {
    const data = loadDatabase();
    let partners = [...data.deliveryPartners];
    if (cityId) {
      partners = partners.filter(p => p.current_city_id === cityId);
    }
    return partners;
  },

  updateDeliveryPartner: (id: string, updates: Partial<DeliveryPartner>) => {
    const data = loadDatabase();
    const index = data.deliveryPartners.findIndex(p => p.id === id);
    if (index === -1) return null;
    data.deliveryPartners[index] = { ...data.deliveryPartners[index], ...updates };
    saveDatabase(data);
    return data.deliveryPartners[index];
  },

  // Coupons
  getCoupons: () => {
    const data = loadDatabase();
    return data.coupons.map(c => ({
      ...c,
      usage_count: data.couponRedemptions.filter(r => r.coupon_id === c.id).length,
    }));
  },

  getCouponRedemptions: (couponId?: string, userId?: string) => {
    const data = loadDatabase();
    return data.couponRedemptions.filter(
      r => (!couponId || r.coupon_id === couponId) && (!userId || r.user_id === userId)
    );
  },

  getCouponUsageCount: (couponId: string) => {
    return loadDatabase().couponRedemptions.filter(r => r.coupon_id === couponId).length;
  },

  hasUserRedeemedCoupon: (couponId: string, userId: string) => {
    return loadDatabase().couponRedemptions.some(
      r => r.coupon_id === couponId && r.user_id === userId
    );
  },

  // Records a coupon redemption. Idempotent per order so retries/duplicate
  // payment verifications never double-count. Enforces the coupon's global
  // usage_limit and per-user usage_limit_per_user as a final safety net.
  redeemCoupon: (redemptionData: Omit<CouponRedemption, 'id' | 'created_at'>) => {
    const data = loadDatabase();

    const existing = data.couponRedemptions.find(r => r.order_id === redemptionData.order_id);
    if (existing) {
      return { redeemed: true, redemption: existing };
    }

    const coupon = data.coupons.find(c => c.id === redemptionData.coupon_id);
    if (!coupon) {
      return { redeemed: false, message: 'Coupon no longer exists.' };
    }

    const totalUses = data.couponRedemptions.filter(r => r.coupon_id === coupon.id).length;
    if (coupon.usage_limit != null && totalUses >= coupon.usage_limit) {
      return { redeemed: false, message: 'This coupon has reached its usage limit.' };
    }

    if (coupon.usage_limit_per_user != null) {
      const userUses = data.couponRedemptions.filter(
        r => r.coupon_id === coupon.id && r.user_id === redemptionData.user_id
      ).length;
      if (userUses >= coupon.usage_limit_per_user) {
        return { redeemed: false, message: 'You have already used this coupon.' };
      }
    }

    const redemption: CouponRedemption = {
      ...redemptionData,
      id: `redeem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
    };
    data.couponRedemptions.push(redemption);
    saveDatabase(data);
    return { redeemed: true, redemption };
  },

  validateCoupon: (code: string, subtotal: number, cityId?: string, shopId?: string, userId?: string) => {
    const data = loadDatabase();
    const coupon = data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.is_active);
    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code.' };
    }

    if (coupon.valid_until && new Date(coupon.valid_until).getTime() < Date.now()) {
      return { valid: false, message: 'This coupon has expired.' };
    }

    if (subtotal < coupon.min_order_amount) {
      return { valid: false, message: `Minimum order of ₹${coupon.min_order_amount} required to use this coupon.` };
    }

    if (coupon.city_id && cityId && coupon.city_id !== cityId) {
      return { valid: false, message: 'This coupon is not valid in your selected city.' };
    }

    if (coupon.shop_id && shopId && coupon.shop_id !== shopId) {
      return { valid: false, message: 'This coupon is not valid for this shop.' };
    }

    // Global usage limit — how many times the coupon may be redeemed overall.
    if (coupon.usage_limit != null) {
      const totalUses = data.couponRedemptions.filter(r => r.coupon_id === coupon.id).length;
      if (totalUses >= coupon.usage_limit) {
        return { valid: false, message: 'This coupon has reached its usage limit.' };
      }
    }

    // Per-user usage limit — 1 means one-time-use per customer.
    if (userId && coupon.usage_limit_per_user != null) {
      const userUses = data.couponRedemptions.filter(
        r => r.coupon_id === coupon.id && r.user_id === userId
      ).length;
      if (userUses >= coupon.usage_limit_per_user) {
        return { valid: false, message: 'You have already used this coupon.' };
      }
    }

    let discount = 0;
    if (coupon.discount_type === 'flat') {
      discount = coupon.discount_value;
    } else {
      discount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    }
    // Never let the discount exceed the order subtotal.
    if (discount > subtotal) {
      discount = subtotal;
    }

    return {
      valid: true,
      coupon,
      discount,
      message: `Coupon applied! Saved ₹${discount}`
    };
  },

  createCoupon: (couponData: Omit<Coupon, 'id'>) => {
    const data = loadDatabase();
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`
    };
    data.coupons.push(newCoupon);
    saveDatabase(data);
    return newCoupon;
  },

  // Reviews
  getReviews: (shopId?: string, productId?: string) => {
    const data = loadDatabase();
    let revs = [...data.reviews];
    if (shopId) revs = revs.filter(r => r.shop_id === shopId);
    if (productId) revs = revs.filter(r => r.product_id === productId);
    return revs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addReview: (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    const data = loadDatabase();
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    data.reviews.push(newRev);

    // Recalculate shop rating
    const shopRevs = data.reviews.filter(r => r.shop_id === reviewData.shop_id);
    if (shopRevs.length > 0) {
      const avg = shopRevs.reduce((acc, curr) => acc + curr.shop_rating, 0) / shopRevs.length;
      const shop = data.shops.find(s => s.id === reviewData.shop_id);
      if (shop) {
        shop.rating = Number(avg.toFixed(1));
        shop.rating_count = shopRevs.length;
      }
    }

    saveDatabase(data);
    return newRev;
  },

  // Users
  getUsers: () => {
    return loadDatabase().users;
  },

  getUser: (id: string) => {
    return loadDatabase().users.find(u => u.id === id) || null;
  },

  // Platform Config
  getPlatformConfig: () => {
    return loadDatabase().platformConfig;
  },

  updatePlatformConfig: (updates: Partial<PlatformConfig>) => {
    const data = loadDatabase();
    data.platformConfig = { ...data.platformConfig, ...updates };
    saveDatabase(data);
    return data.platformConfig;
  },

  // Addresses
  getAddresses: (userId?: string) => {
    const data = loadDatabase();
    if (userId) {
      return data.addresses.filter(a => a.user_id === userId);
    }
    return data.addresses;
  },

  getAddress: (id: string) => {
    return loadDatabase().addresses.find(a => a.id === id) || null;
  },

  createAddress: (addrData: Omit<Address, 'id'>) => {
    const data = loadDatabase();
    if (addrData.is_default) {
      data.addresses.forEach(a => {
        if (a.user_id === addrData.user_id) a.is_default = false;
      });
    }
    const newAddr: Address = {
      ...addrData,
      id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    data.addresses.unshift(newAddr);
    saveDatabase(data);
    return newAddr;
  },

  updateAddress: (id: string, updates: Partial<Address>) => {
    const data = loadDatabase();
    const idx = data.addresses.findIndex(a => a.id === id);
    if (idx === -1) return null;
    if (updates.is_default) {
      const userId = data.addresses[idx].user_id;
      data.addresses.forEach(a => {
        if (a.user_id === userId) a.is_default = false;
      });
    }
    data.addresses[idx] = { ...data.addresses[idx], ...updates };
    saveDatabase(data);
    return data.addresses[idx];
  },

  deleteAddress: (id: string) => {
    const data = loadDatabase();
    data.addresses = data.addresses.filter(a => a.id !== id);
    saveDatabase(data);
  },

  setDefaultAddress: (id: string, userId: string) => {
    const data = loadDatabase();
    data.addresses.forEach(a => {
      if (a.user_id === userId) {
        a.is_default = a.id === id;
      }
    });
    saveDatabase(data);
    return data.addresses.find(a => a.id === id) || null;
  },

  // Notifications Simulator
  getNotifications: (filters?: { userId?: string; orderId?: string; channel?: NotificationChannel }) => {
    const data = loadDatabase();
    let notifs = Array.isArray(data.notifications) ? [...data.notifications] : [];
    if (filters?.userId) {
      notifs = notifs.filter(n => n.user_id === filters.userId);
    }
    if (filters?.orderId) {
      notifs = notifs.filter(n => n.order_id === filters.orderId);
    }
    if (filters?.channel) {
      notifs = notifs.filter(n => n.channel === filters.channel);
    }
    return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  createNotification: (notifData: Omit<Notification, 'id' | 'created_at'>) => {
    const data = loadDatabase();
    if (!Array.isArray(data.notifications)) data.notifications = [];
    const newNotif: Notification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    data.notifications.unshift(newNotif);
    saveDatabase(data);
    return newNotif;
  },

  markNotificationRead: (id: string) => {
    const data = loadDatabase();
    if (!Array.isArray(data.notifications)) return;
    const notif = data.notifications.find(n => n.id === id);
    if (notif) {
      notif.status = 'read';
      saveDatabase(data);
    }
  }
};

// Helper: Generate realistic WhatsApp and SMS notifications based on order lifecycle events
function generateNotificationsForStatus(
  order: Order,
  status: OrderStatus,
  details?: {
    rejection_reason?: string;
    cancellation_reason?: string;
    seller_preparation_minutes?: number;
    delivery_partner_name?: string;
  }
): Notification[] {
  const notifs: Notification[] = [];
  const now = new Date().toISOString();
  const phone = order.delivery_receiver_phone || order.customer_phone;
  const name = order.delivery_receiver_name || order.customer_name;
  const shop = order.shop_name;

  if (status === 'order_confirmed') {
    notifs.push({
      id: `notif-${Date.now()}-wa-conf`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'order_confirmed',
      channel: 'whatsapp',
      recipient_phone: phone,
      title: '🛍️ Order Confirmed!',
      message: `Hi ${name}, your order #${order.order_number} from *${shop}* is confirmed! Total: ₹${order.total_amount}. Same-day express delivery in progress.`,
      status: 'delivered',
      created_at: now,
    });
    notifs.push({
      id: `notif-${Date.now()}-sms-conf`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'order_confirmed',
      channel: 'sms',
      recipient_phone: phone,
      title: 'LocalKart Order Confirmed',
      message: `LK-ALERT: Order #${order.order_number} from ${shop} is confirmed. Same-day express delivery underway. Track live at LocalKart.`,
      status: 'delivered',
      created_at: now,
    });
  } else if (status === 'seller_accepted' || status === 'preparing') {
    const mins = details?.seller_preparation_minutes || order.seller_preparation_minutes || 25;
    notifs.push({
      id: `notif-${Date.now()}-wa-prep`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: status === 'seller_accepted' ? 'seller_accepted' : 'preparing',
      channel: 'whatsapp',
      recipient_phone: phone,
      title: '👨‍🍳 Shop is Packing Your Items',
      message: `*${shop}* accepted order #${order.order_number}! Fresh items are currently being packed with care. Estimated prep: ~${mins} mins.`,
      status: 'delivered',
      created_at: now,
    });
  } else if (status === 'ready_for_pickup' || status === 'delivery_partner_assigned') {
    const rider = details?.delivery_partner_name || order.delivery_partner_name || 'Rajesh Kumar (Express Rider)';
    notifs.push({
      id: `notif-${Date.now()}-wa-rider`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'rider_assigned',
      channel: 'whatsapp',
      recipient_phone: phone,
      title: '🛵 Delivery Partner Assigned',
      message: `Rider *${rider}* has been assigned to order #${order.order_number} and is heading to *${shop}* for pickup.`,
      status: 'delivered',
      created_at: now,
    });
  } else if (status === 'picked_up' || status === 'out_for_delivery') {
    const rider = details?.delivery_partner_name || order.delivery_partner_name || 'Rajesh Kumar';
    const otp = order.delivery_otp || '4892';
    notifs.push({
      id: `notif-${Date.now()}-wa-out`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'rider_arriving',
      channel: 'whatsapp',
      recipient_phone: phone,
      title: '⚡ Out for Delivery!',
      message: `Rider *${rider}* is on the way to ${order.delivery_area_name}! Please share OTP *${otp}* upon doorstep delivery.`,
      status: 'delivered',
      created_at: now,
    });
    notifs.push({
      id: `notif-${Date.now()}-sms-otp`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'otp_available',
      channel: 'sms',
      recipient_phone: phone,
      title: 'LocalKart Doorstep OTP',
      message: `LocalKart OTP: ${otp} is your verification code for order #${order.order_number}. Share with rider ${rider} only at your door.`,
      status: 'delivered',
      created_at: now,
    });
  } else if (status === 'delivered') {
    notifs.push({
      id: `notif-${Date.now()}-wa-del`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'order_delivered',
      channel: 'whatsapp',
      recipient_phone: phone,
      title: '🎉 Order Delivered!',
      message: `Order #${order.order_number} delivered successfully! We hope you enjoy your items from *${shop}*. Thank you for shopping local with LocalKart.`,
      status: 'delivered',
      created_at: now,
    });
    notifs.push({
      id: `notif-${Date.now()}-sms-del`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'order_delivered',
      channel: 'sms',
      recipient_phone: phone,
      title: 'LocalKart Order Delivered',
      message: `LK-ALERT: Order #${order.order_number} from ${shop} delivered. Have feedback? Rate your experience on LocalKart.`,
      status: 'delivered',
      created_at: now,
    });
  } else if (status === 'cancelled') {
    const reason = details?.cancellation_reason || order.cancellation_reason || 'Customer requested';
    notifs.push({
      id: `notif-${Date.now()}-wa-cancel`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'order_cancelled',
      channel: 'whatsapp',
      recipient_phone: phone,
      title: '❌ Order Cancelled & Refund Initiated',
      message: `Order #${order.order_number} has been cancelled (${reason}). A full refund of ₹${order.total_amount} has been initiated to your original payment method.`,
      status: 'delivered',
      created_at: now,
    });
    notifs.push({
      id: `notif-${Date.now()}-sms-cancel`,
      user_id: order.user_id,
      order_id: order.id,
      order_number: order.order_number,
      type: 'order_cancelled',
      channel: 'sms',
      recipient_phone: phone,
      title: 'LocalKart Order Cancelled',
      message: `LK-ALERT: Order #${order.order_number} cancelled. 100% refund of INR ${order.total_amount} initiated. Reference: REF-${order.order_number}.`,
      status: 'delivered',
      created_at: now,
    });
  }

  return notifs;
}
