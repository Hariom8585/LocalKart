# LocalKart
> **Hyperlocal Marketplace & Same-Day Delivery Platform**

LocalKart bridges nearby neighborhood stores and local consumers, enabling same-day express doorstep deliveries (30–60 minutes) across target Indian cities: **Ludhiana**, **Chandigarh**, and **Delhi NCR**.

---

## 1. Project Overview
LocalKart is a multi-sided hyperlocal commerce ecosystem built for modern local trade. It connects customers seeking immediate convenience with trusted neighborhood merchants (kirana stores, pharmacies, bakeries, daily provisions) and an on-demand express delivery partner fleet.

The platform provides a production-tested, unified web experience powered by Next.js, TypeScript, React 18, and standard vanilla CSS tokens.

---

## 2. Problem Statement
- **Quick Commerce Monopolies**: Large dark-store models bypass local merchants and neighborhood retailers.
- **Local Retailer Invisibility**: Independent kiranas, pharmacies, and specialty food shops lack modern digital infrastructure, live inventory management, and route dispatching.
- **Fragmented Delivery**: Same-day delivery from specific local shops is often unorganized, manual, or dependent on uncoordinated phone calls.

---

## 3. The Solution
LocalKart empowers brick-and-mortar stores to compete in the digital era:
- **Location-Aware Shop & Item Discovery**: Customers discover verified local shops within their delivery radius.
- **Single-Shop Cart Integrity**: Guarantees fast, single-stop fulfillment from a single local store per checkout.
- **Fair Marketplace Economics**: Transparent delivery fee slabs, modest merchant commission rates, and real-time inventory synchronization.
- **Role-Based Portals**: Dedicated operational interfaces for Customers, Sellers, Delivery Partners, and Platform Admins.

---

## 4. Main Features
- **Multi-City & Locality Discovery**: Dynamic city selection (Ludhiana, Chandigarh, Delhi NCR) with geo-mapped areas.
- **Single-Shop Checkout**: Automatic validation preventing cross-store item mixing.
- **Flexible Delivery Slots**: Express same-day (30–60 mins) and scheduled evening slots.
- **Promo Coupon System**: Fixed and percentage-based discounts with minimum order thresholds and redemption tracking.
- **Hybrid Payment Architecture**: Dual-mode payment processing (Instant Mock Simulator for zero-cost development + Live Razorpay Checkout SDK).
- **5-Minute Customer Cancellation Window**: Strict 5-minute countdown grace period with automatic inventory restoration, locking once store preparation starts.
- **Doorstep OTP Verification**: Secure 4-digit one-time password required by delivery partners to complete delivery.
- **Zero-Cost Notification Simulator**: Real-time WhatsApp Business and SMS alert dispatch simulator tracking all 8 order lifecycle stages without external paid APIs.
- **Customer Account Management**: Multi-address management, 1-click reorder, order history, and official printable tax receipts.

---

## 5. Workflows by User Role

### Customer Workflow
1. Select delivery city and area locality.
2. Browse verified local neighborhood stores and product catalogs.
3. Add products to cart (single-shop cart rule enforced).
4. Review delivery fee, platform fee, and applicable GST; apply promo coupon.
5. Select or add a delivery address and choose a delivery time slot.
6. Complete payment via Razorpay Checkout or built-in mock gateway simulator.
7. Track live order progression with real-time countdown timer, delivery OTP, and assigned rider details.
8. View simulated WhatsApp & SMS order notifications and print official tax invoice.

### Seller Workflow (`/seller`)
1. Access merchant overview showing active store status, revenue, pending orders, and catalog counts.
2. Review new incoming orders; accept with custom preparation time estimate or reject with reason.
3. Manage catalog (`/seller/catalog`): add new products, adjust pricing, update discount percentages, and update stock quantities.
4. Manage store settings (`/seller/settings`): toggle store open/closed status, update minimum order value, and set base delivery fees.

### Delivery Partner Workflow (`/delivery`)
1. Toggle online/offline availability in current serviceable city.
2. View assigned pickup and delivery tasks with shop location, delivery address, and customer contact proxy.
3. Transition order status from assigned to picked up and out for delivery.
4. Input 4-digit doorstep customer OTP to securely verify and complete delivery.
5. Track daily delivery earnings and completed trip history (`/delivery/history`).

### Platform Admin Workflow (`/admin`)
1. Super Admin control center with system-wide GMV, active stores, order count, and delivery metrics.
2. Shop moderation & KYC verification (`/admin/shops`).
3. Multi-city & locality management (`/admin/cities`).
4. Product category taxonomy management (`/admin/categories`).
5. Promo coupon creation and usage auditing (`/admin/coupons`).
6. Distance-based delivery fee slabs and platform fee settings (`/admin/delivery-fee`).

---

## 6. Payment Architecture
LocalKart features an adaptive dual-mode payment gateway architecture:

```
                  ┌──────────────────────────────┐
                  │ Customer Initiates Checkout  │
                  └──────────────┬───────────────┘
                                 │
                   [POST /api/checkout/create-order]
                   (Server-side item & total verify)
                                 │
                 Is MOCK_PAYMENT_ENABLED or Keys Absent?
                                / \
                              YES  NO
                              /     \
                             v       v
             ┌─────────────────────┐ ┌───────────────────────────┐
             │ Mock Gateway Engine │ │ Razorpay Checkout Web SDK │
             │  - Simulated delay  │ │  - Secure popup modal     │
             │  - Valid signature  │ │  - UPI / Card / Netbanking│
             └──────────┬──────────┘ └─────────────┬─────────────┘
                        │                          │
                        └────────────┬─────────────┘
                                     │
                   [POST /api/checkout/verify-payment]
                   (HMAC-SHA256 Cryptographic Verification)
                                     │
                                     v
                        ┌─────────────────────────┐
                        │ Order Confirmed & Paid  │
                        └─────────────────────────┘
```

- **Mock Payment Mode (Default for Local Development)**: When `MOCK_PAYMENT_ENABLED=true` or when test keys are placeholders, checkout simulates authentic payment gateway delays and generates valid mock signatures.
- **Live Razorpay Checkout Mode**: When configured with valid Razorpay Key ID and Secret, the server communicates with `https://api.razorpay.com/v1/orders` and loads `https://checkout.razorpay.com/v1/checkout.js` on the client.
- **Security**: The `RAZORPAY_KEY_SECRET` is strictly server-side and never exposed to the client or browser bundles.

---

## 7. Order Lifecycle & Status Progression
Orders move through standard granular stages:

| Status Code | Label | Description |
|---|---|---|
| `pending_payment` | Payment Pending | Order initialized; awaiting gateway transaction |
| `order_confirmed` | Order Placed | Payment verified; store notified (5-min cancellation active) |
| `seller_accepted` | Store Accepted | Merchant accepted order; cancellation locked |
| `preparing` | Packing Items | Merchant packing fresh products |
| `ready_for_pickup` | Ready for Pickup | Packed package awaiting rider collection |
| `delivery_partner_assigned` | Rider Assigned | Express courier allocated to delivery task |
| `picked_up` | Package Picked Up | Rider picked up package from merchant |
| `out_for_delivery` | Out for Delivery | Rider en route to customer doorstep |
| `delivered` | Delivered | Verified by customer doorstep 4-digit OTP |
| `cancelled` | Cancelled | Aborted by customer (within 5 mins) or admin; refund initiated |
| `rejected` | Store Rejected | Rejected by merchant (out of stock, closed, etc.) |

---

## 8. 5-Minute Cancellation Rule
- Customers can cancel an order **only within 5 minutes (300 seconds)** of order placement.
- Once a store accepts the order (`seller_accepted` or later), direct customer cancellation is locked to protect merchant food and item preparation.
- Cancellation automatically restores item inventory stock in the database.
- A live 1-second countdown ticker displays remaining cancellation time on `/orders/[id]`.

---

## 9. Notification Simulator
LocalKart includes a built-in notification simulator designed to replicate production messaging workflows without paid SMS or WhatsApp business gateway subscriptions:
- **WhatsApp View**: WhatsApp Business styling, verified green checkmark badge, bold markdown rendering (`*text*`), timestamps, and read receipt toggles.
- **SMS View**: Mobile cellular alert formatting with `LK-ALERT` sender ID.
- **Event Coverage**: Auto-generates simulated notifications on all 8 lifecycle events (`order_confirmed`, `seller_accepted`, `preparing`, `rider_assigned`, `rider_arriving`, `otp_available`, `order_delivered`, `order_cancelled`).
- **Interactive Triggers**: Quick-action dispatch buttons for on-demand demonstration.

---

## 10. Tech Stack
- **Framework**: Next.js 14 (Pages Router)
- **Language**: TypeScript (strict type checking)
- **UI Library**: React 18
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design Tokens (Responsive, mobile-first, dark mode accents)
- **Data Layer**: Relational JSON file database (`.data/localkart_db.json`) with in-memory caching and automatic schema migrations
- **Payment SDK**: Razorpay Checkout Web SDK (`checkout.js`) with HMAC-SHA256 signature verification

---

## 11. Project Structure
```
localkart/
├── .data/                           # Runtime local JSON database
├── public/                          # Static assets and icons
├── src/
│   ├── components/
│   │   ├── customer/                # ProductCard, ShopCard, CartDrawer, Modals
│   │   ├── layout/                  # Navbar, MobileNav, Footer
│   │   └── notifications/           # NotificationSimulatorModal
│   ├── context/
│   │   ├── AuthContext.tsx          # Multi-role authentication & user switching
│   │   ├── CartContext.tsx          # Single-shop cart state & calculations
│   │   └── LocationContext.tsx      # Multi-city, area selection & saved addresses
│   ├── lib/
│   │   ├── db.ts                    # Relational file database, queries & migrations
│   │   ├── razorpay.ts              # Razorpay API client & signature verification
│   │   ├── seed-data.ts             # Initial multi-city seed catalog
│   │   └── utils.ts                 # Currency formatters, status steps & helpers
│   ├── pages/
│   │   ├── api/                     # 17 REST API endpoints
│   │   │   ├── addresses/           # Customer address CRUD
│   │   │   ├── checkout/            # create-order & verify-payment
│   │   │   ├── notifications/       # Notification simulator endpoint
│   │   │   ├── orders/              # Order lifecycle & customer cancellation
│   │   │   └── ...                  # Shops, products, coupons, admin config
│   │   ├── admin/                   # Platform Super Admin dashboard pages
│   │   ├── customer/                # Customer account, address & order history
│   │   ├── delivery/                # Rider dispatch & payout history
│   │   ├── orders/                  # Order list and live tracking (/orders/[id])
│   │   ├── products/                # Product details page (/products/[id])
│   │   ├── seller/                  # Merchant dashboard, catalog & store settings
│   │   ├── shops/                   # Shop discovery and shop storefront (/shops/[id])
│   │   ├── checkout.tsx             # Multi-step checkout workflow
│   │   └── index.tsx                # Hyperlocal marketplace homepage
│   ├── styles/
│   │   └── globals.css              # Design tokens, typography & responsive layouts
│   └── types/
│       └── index.ts                 # TypeScript domain interfaces
├── .env.example                     # Environment template (safe placeholders)
├── .gitignore                       # Git ignore rules
├── next.config.js                   # Next.js configuration
├── package.json                     # Scripts & dependencies
├── supabase_schema.sql              # Production PostgreSQL/Supabase migration script
└── tsconfig.json                    # TypeScript compiler options
```

---

## 12. Environment Variables

Create a `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

| Variable | Description | Default / Example |
|---|---|---|
| `RAZORPAY_KEY_ID` | Razorpay Key ID (Server-side) | `rzp_test_placeholder_key_id` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key (Server-side only) | `rzp_test_placeholder_secret` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (Client-side SDK) | `rzp_test_placeholder_key_id` |
| `MOCK_PAYMENT_ENABLED` | Toggle mock payment simulator | `true` |
| `NEXT_PUBLIC_APP_NAME` | Platform Brand Name | `LocalKart` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `JWT_SECRET` | Auth Token Secret | `super-secret-jwt-key` |
| `DATABASE_URL` | Optional PostgreSQL / Supabase connection | *(Optional)* |

> **Security Note**: Never commit `.env.local` to version control. The `.gitignore` file is configured to exclude all `.env*.local` files.

---

## 13. Local Setup & Development

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or later

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/localkart.git
cd localkart

# 2. Install dependencies
npm install

# 3. Create environment configuration
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

The application will start at `http://localhost:3000`.

---

## 14. Build & Production Commands

```bash
# Type check TypeScript codebase
npm run typecheck

# Run ESLint linter
npm run lint

# Compile production build
npm run build

# Start production server
npm run start
```

---

## 15. Deployment Instructions

### Vercel Deployment (Recommended)
1. Push the repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. In Project Settings > Environment Variables, configure:
   - `NEXT_PUBLIC_APP_NAME=LocalKart`
   - `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`
   - `MOCK_PAYMENT_ENABLED=true` (or configure your live Razorpay credentials)
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (if running live payments)
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` (if running live payments)
4. Deploy. Next.js will build all 21 routes automatically.

> **Serverless Database Deployment Note**:
> LocalKart's built-in local JSON database (`.data/localkart_db.json`) operates with in-memory caching and graceful serverless fallback. Because Vercel Serverless Functions have ephemeral, read-only root filesystems, writes made to the local JSON database persist in memory during the lambda instance lifecycle but will reset across cold starts or multiple function instances.
> For persistent multi-region production deployments, connect the platform to Supabase or PostgreSQL by executing `supabase_schema.sql` and setting `DATABASE_URL`.

---

## 16. Future Roadmap
- **Live GPS Rider Tracking**: WebSocket / Pusher integration for real-time rider latitude/longitude map tracking.
- **Automated WhatsApp Business API**: Direct integration with Gupshup or Twilio WhatsApp API.
- **Multi-Vendor Batching**: Intelligent multi-store order routing for nearby merchants.
- **Native Mobile Apps**: React Native / Expo companion apps for Delivery Partners and Merchants.

---

## License
MIT License. Developed for LocalKart Hyperlocal Commerce.
