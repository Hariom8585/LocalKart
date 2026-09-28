-- =============================================================================
-- LOCALKART - HYPERLOCAL MARKETPLACE & SAME-DAY DELIVERY PLATFORM
-- Production PostgreSQL / Supabase Relational Schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & USERS
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'delivery_partner', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CITIES & LOCALITIES (Multi-City Architecture)
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT true,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    delivery_zone_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_areas_city_id ON areas(city_id);

-- 3. CUSTOMER SAVED ADDRESSES
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(50) DEFAULT 'Home', -- 'Home', 'Work', 'Other'
    receiver_name VARCHAR(150) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    flat_house_no VARCHAR(255) NOT NULL,
    area_locality VARCHAR(255) NOT NULL,
    city_id UUID REFERENCES cities(id),
    pincode VARCHAR(10) NOT NULL,
    landmark VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- 4. SHOPS & MERCHANTS
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    address_line TEXT NOT NULL,
    area_id UUID REFERENCES areas(id),
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    delivery_radius_km DECIMAL(4, 2) DEFAULT 8.00,
    min_order_amount DECIMAL(10, 2) DEFAULT 99.00,
    base_delivery_fee DECIMAL(10, 2) DEFAULT 25.00,
    estimated_delivery_min INT DEFAULT 35,
    estimated_delivery_max INT DEFAULT 60,
    rating DECIMAL(3, 2) DEFAULT 4.80,
    rating_count INT DEFAULT 0,
    is_open BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    commission_rate DECIMAL(5, 2) DEFAULT 8.00, -- Platform commission percentage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shops_city_id ON shops(city_id);
CREATE INDEX idx_shops_seller_id ON shops(seller_id);

-- Shop serviceable areas mapping
CREATE TABLE shop_serviceable_areas (
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    PRIMARY KEY (shop_id, area_id)
);

-- Shop operating hours
CREATE TABLE shop_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false
);

-- Shop documents for KYC
CREATE TABLE shop_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- 'gst_certificate', 'fssai_license', 'pan_card', 'trade_license'
    doc_number VARCHAR(100) NOT NULL,
    file_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES & SHOP CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_categories (
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (shop_id, category_id)
);

-- 6. PRODUCTS & INVENTORY
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    unit VARCHAR(50) DEFAULT '1 piece', -- '1 kg', '500 g', '1 litre', '1 pack'
    original_price DECIMAL(10, 2) NOT NULL,
    discounted_price DECIMAL(10, 2) NOT NULL,
    discount_percentage INT GENERATED ALWAYS AS (
        CASE WHEN original_price > 0 AND discounted_price < original_price
        THEN ROUND(((original_price - discounted_price) / original_price) * 100)
        ELSE 0 END
    ) STORED,
    stock_quantity INT NOT NULL DEFAULT 50,
    low_stock_threshold INT DEFAULT 10,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3, 2) DEFAULT 4.70,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category_id ON products(category_id);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0
);

-- 7. CARTS & CART ITEMS (1 Shop per Cart rule)
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    coupon_code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_cart UNIQUE (user_id)
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- 8. COUPONS
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' or 'flat'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2),
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    city_id UUID REFERENCES cities(id),
    shop_id UUID REFERENCES shops(id),
    usage_limit INT DEFAULT 1000,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 9. ORDERS & ORDER ITEMS
CREATE TYPE order_status AS ENUM (
    'pending_payment',
    'payment_successful',
    'order_confirmed',
    'seller_accepted',
    'preparing',
    'ready_for_pickup',
    'delivery_partner_assigned',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'rejected',
    'refund_initiated',
    'refunded'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    status order_status NOT NULL DEFAULT 'pending_payment',
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    coupon_code VARCHAR(50),
    delivery_slot VARCHAR(100) DEFAULT 'Same-Day Express (30–60 mins)',
    estimated_delivery_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,
    
    -- Delivery Address Snapshot
    delivery_receiver_name VARCHAR(150) NOT NULL,
    delivery_receiver_phone VARCHAR(20) NOT NULL,
    delivery_address_line TEXT NOT NULL,
    delivery_area_name VARCHAR(150) NOT NULL,
    delivery_city_name VARCHAR(100) NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    delivery_landmark VARCHAR(255),
    
    -- Seller notes & prep
    seller_preparation_minutes INT DEFAULT 20,
    rejection_reason TEXT,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

-- 10. PAYMENTS (Razorpay)
CREATE TYPE payment_status AS ENUM ('pending', 'captured', 'failed', 'refunded');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL, -- 'upi', 'card', 'netbanking', 'wallet'
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'pending',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    error_message TEXT,
    is_mock BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DELIVERY PARTNERS & DELIVERIES
CREATE TABLE delivery_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) DEFAULT 'Motorcycle', -- 'Motorcycle', 'Scooter', 'Electric Bike', 'Bicycle'
    vehicle_number VARCHAR(50),
    driving_license_no VARCHAR(100),
    is_online BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT true,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 4.90,
    total_deliveries_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE delivery_task_status AS ENUM (
    'assigned',
    'accepted',
    'at_shop',
    'picked_up',
    'on_the_way',
    'delivered',
    'cancelled'
);

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    delivery_partner_id UUID REFERENCES delivery_partners(id) ON DELETE SET NULL,
    status delivery_task_status NOT NULL DEFAULT 'assigned',
    delivery_otp VARCHAR(6) NOT NULL DEFAULT '4921',
    delivery_fee_earned DECIMAL(10, 2) DEFAULT 40.00,
    tip_amount DECIMAL(10, 2) DEFAULT 0.00,
    pickup_time TIMESTAMPTZ,
    delivered_time TIMESTAMPTZ,
    masked_customer_phone VARCHAR(20) DEFAULT '+91 98XXX-XXXXX',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REVIEWS & RATINGS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    shop_rating INT CHECK (shop_rating >= 1 AND shop_rating <= 5),
    product_rating INT CHECK (product_rating >= 1 AND product_rating <= 5),
    delivery_rating INT CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    review_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. IN-APP NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'order_status', 'promo', 'alert'
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CUSTOMER FAVORITE SHOPS & PRODUCTS
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. PLATFORM SETTINGS & DELIVERY FEE CONFIG
CREATE TABLE platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery fee configuration example:
-- key: 'delivery_slabs'
-- value: [
--   {"max_km": 2.0, "fee": 20},
--   {"max_km": 5.0, "fee": 35},
--   {"max_km": 8.0, "fee": 50},
--   {"free_delivery_min_order": 499}
-- ]
