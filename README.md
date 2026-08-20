# DigitalWorld — Hybrid B2B Wholesale & B2C E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![Shiprocket](https://img.shields.io/badge/Shiprocket-Logistics_API-7952B3?style=for-the-badge)](https://shiprocket.in/)

**DigitalWorld** is a high-performance, enterprise-grade e-commerce platform engineered specifically to serve as a **hybrid B2B wholesale portal and B2C retail storefront**. Built to digitalize sales of industrial fire suppression and electrical safety products (e.g., Heat Aerosol Fire Extinguishing Devices `QRR0.01G/S` and `QRRO-10`), the platform bridges single-unit retail purchases with tiered wholesale volume pricing, automated PDF quotation generation, GST-compliant invoicing, and a Pan-India multi-carrier live tracking logistics engine.

---

## 📑 Table of Contents

1. [Executive Summary & Overview](#1-executive-summary--overview)
2. [Core Business Vision & Dual-Persona Architecture](#2-core-business-vision--dual-persona-architecture)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [Complete Repository Structure](#4-complete-repository-structure)
5. [Technology Stack & Core Dependencies](#5-technology-stack--core-dependencies)
6. [Database Schema & Data Models (Prisma)](#6-database-schema--data-models-prisma)
7. [Core Algorithms & Business Logic](#7-core-algorithms--business-logic)
   - [7.1 Dual-Persona Server-Side Price Resolution Engine (`resolvePrice`)](#71-dual-persona-server-side-price-resolution-engine-resolveprice)
   - [7.2 Quantity Tier Matching Logic (`getPriceForQuantity`)](#72-quantity-tier-matching-logic-getpriceforquantity)
   - [7.3 Nudge & Tier Unlock Hint Algorithm (`getNextTierHint`)](#73-nudge--tier-unlock-hint-algorithm-getnexttierhint)
   - [7.4 Unified Indian GST Tax Calculation Engine (`computeInvoiceTotals`)](#74-unified-indian-gst-tax-calculation-engine-computeinvoicetotals)
   - [7.5 Courier Logistics & Shipping Abstraction Layer (`ShippingRegistry`)](#75-courier-logistics--shipping-abstraction-layer-shippingregistry)
   - [7.6 Indian Currency Amount-to-Words Converter (`amountToWords`)](#76-indian-currency-amount-to-words-converter-amounttowords)
   - [7.7 Razorpay Payment Security & Authoritative Webhook Engine](#77-razorpay-payment-security--authoritative-webhook-engine)
   - [7.8 B2B Wholesale Onboarding & Approval Workflow](#78-b2b-wholesale-onboarding--approval-workflow)
8. [Application User Journeys](#8-application-user-journeys)
9. [API Route Directory & Endpoints](#9-api-route-directory--endpoints)
10. [Design System & UI/UX Standards](#10-design-system--uiux-standards)
11. [Environment Setup & Installation Guide](#11-environment-setup--installation-guide)
12. [Database Seeding & Operations](#12-database-seeding--operations)
13. [Testing & Quality Assurance](#13-testing--quality-assurance)

---

## 1. Executive Summary & Overview

Traditional B2B industrial selling relies heavily on manual WhatsApp/email negotiations, delayed quote generation, and error-prone manual GST invoicing. DigitalWorld modernizes this process into a unified web application serving two distinct customer types from a single product catalog:

- **Retail Customers (B2C):** Browse listed products, view standard prices, customize quantities in real-time, add to cart, check out with instant shipping & GST calculation, and pay via online payment gateways (UPI, Cards, Netbanking).
- **Approved Business Buyers (B2B):** (Distributors, panel builders, electrical contractors) Apply for wholesale accounts, unlock exclusive tiered volume pricing upon approval, generate formal PDF quotations, and obtain automated GST-compliant invoices with HSN breakdowns.

---

## 2. Core Business Vision & Dual-Persona Architecture

DigitalWorld eliminates pricing friction through a **single source of truth** server-side pricing engine. 

```
                                 ┌───────────────────────────┐
                                 │   DigitalWorld Platform   │
                                 └─────────────┬─────────────┘
                                               │
                      ┌────────────────────────┴────────────────────────┐
                      ▼                                                 ▼
        ┌───────────────────────────┐                     ┌───────────────────────────┐
        │       B2C Retailer        │                     │   B2B Wholesale Partner   │
        ├───────────────────────────┤                     ├───────────────────────────┤
        │ • Standard MSRP Prices    │                     │ • Requires GSTIN Approval │
        │ • Instant Cart & Checkout │                     │ • Unlocks Tiered Pricing  │
        │ • B2C Quantity Discounts  │                     │ • Instant PDF Quotations  │
        │ • Direct Payment (UPI/Card)│                    │ • Formal B2B Quotes       │
        │ • GST Invoice (Retail)    │                     │ • GST Invoicing (B2B)     │
        │ • Live Order Tracking     │                     │ • Dedicated Account Rep   │
        └───────────────────────────┘                     └───────────────────────────┘
```

### Key Business Goals
1. **Catalog Centralization:** Maintain product specifications, high-resolution media, PDF technical datasheets, and tier tables in one authoritative place.
2. **Dynamic Volume Tiering:** Support quantity tiers (e.g., 1–9, 10–49, 50–99, 100–499, 500+ units).
3. **Unified GST Tax Compliance:** Compute CGST + SGST (intra-state) vs IGST (inter-state) dynamically based on seller and buyer locations (18% default rate) across checkout, Razorpay, database, and PDF invoices.
4. **Multi-Carrier Live Shipping & Tracking:** Full courier abstraction supporting **Shiprocket** (Delhivery, Blue Dart, DTDC, Xpressbees, Shadowfax), **Delhivery Direct**, and **Manual / Offline Courier Dispatch** with 20 normalized tracking states.

---

## 3. System Architecture & Data Flow

DigitalWorld is built on a modern, decoupled monolithic structure powered by Next.js 14 App Router and Prisma ORM:

```
[ Client Browser / Customer / Admin ]
       │
       ├── HTTPS / React Server Components / Server Actions
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 14 App Router                           │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌──────────────┐  │
│  │ Storefront Pages (SSR)│ │ B2B Portal Routes    │ │ Admin Panel  │  │
│  └───────────┬───────────┘ └──────────┬───────────┘ └──────┬───────┘  │
│              └────────────────────────┼────────────────────┘          │
│                                       ▼                               │
│                         Service & Logic Layer                         │
│    ┌──────────────┐   ┌─────────────┐   ┌────────────┐   ┌─────────┐  │
│    │ Pricing (ts) │   │ Tax/GST (ts)│   │Shipping(ts)│   │Auth (ts)│  │
│    └──────┬───────┘   └──────┬──────┘   └─────┬──────┘   └────┬────┘  │
└───────────┼──────────────────┼────────────────┼───────────────┼───────┘
            ▼                  ▼                ▼               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Prisma ORM & PostgreSQL Database                   │
│   • Users & Roles    • Products & Tiers   • Orders & Items             │
│   • Shipments & Tracking Events           • Invoices & Quotations      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐            ┌──────────────┐            ┌────────────────┐
│   Razorpay   │            │  Shiprocket  │            │   Resend API   │
│ Payment API  │            │ Logistics    │            │ Transactional  │
│ & Webhooks   │            │ Multi-Courier│            │ Order Emails   │
└──────────────┘            └──────────────┘            └────────────────┘
```

---

## 4. Complete Repository Structure

```
digitalworld-app/
├── app/
│   ├── (admin)/admin/              # Admin dashboard (Orders, Products, Shipping, Users, Quotes)
│   ├── (auth)/                     # Login, Register, Wholesale application pages
│   ├── account/                    # Customer account portal (Orders, Quotes, Settings)
│   │   └── orders/[orderId]/       # Live tracking timeline & order detail
│   ├── api/                        # Next.js API route handlers
│   │   ├── admin/                  # Admin management endpoints
│   │   │   ├── orders/[id]/        # Order mutation & shipment sync
│   │   │   ├── shipments/          # Shipment queries & manual courier dispatch
│   │   │   └── shipments/[id]/status # Live shipment status updates & tracking logs
│   │   ├── checkout/               # Secure cart validation & Razorpay order creation
│   │   ├── payment/verify/         # HMAC signature verification & payment capture
│   │   ├── shipments/              # Courier rate comparison & serviceability
│   │   └── webhooks/               # Authoritative webhook receivers
│   │       ├── payment/razorpay/   # Razorpay server-to-server webhook
│   │       └── shipping/shiprocket/ # Shiprocket live tracking webhook
│   ├── cart/                       # Interactive shopping cart
│   ├── catalog/                    # Complete product catalog & volume pricing table
│   ├── checkout/                   # Checkout flow & payment modal
│   ├── orders/[orderId]/invoice/   # Print-ready GST invoice
│   ├── quotation/                  # Instant quotation generator & PDF download
│   ├── track-order/                # Public tracking lookup with data masking
│   └── page.tsx                    # Homepage (Hero, Live Estimator, Specs, Trust)
├── components/
│   ├── admin/                      # Admin UI components (DispatchModal, OrderTable)
│   ├── home/                       # Homepage sections (HeroSection, HomePricingCalculator)
│   ├── layout/                     # Layout components (Navbar, Footer, MobileNav)
│   ├── shipping/                   # ShipmentTrackerCard & tracking timeline UI
│   └── ui/                         # Atomic UI (CustomCursor, MagneticButton, AnimatedCounter)
├── lib/
│   ├── db.ts                       # Prisma Client singleton
│   ├── email.ts                    # Resend email templates & dispatchers
│   ├── pricing.ts                  # Dual-persona price resolution algorithm
│   ├── shipping.ts                 # Courier charge calculation logic
│   ├── shipping/                   # Multi-provider shipping abstraction layer
│   │   ├── types.ts                # CourierOption, ShipmentStatus, TrackingEventData
│   │   ├── registry.ts             # Dynamic ShippingRegistry provider factory
│   │   ├── status-normalizer.ts    # 20-state standardized status mapper
│   │   ├── manual.provider.ts      # Manual / Offline courier implementation
│   │   ├── shiprocket.provider.ts  # Shiprocket v2 API integration
│   │   └── delhivery.provider.ts   # Delhivery direct API integration
│   ├── tax.ts                      # Unified Indian GST engine (computeInvoiceTotals)
│   └── utils.ts                    # Currency formatters, date formatters, styling helpers
├── prisma/
│   ├── schema.prisma               # PostgreSQL data models & enums
│   └── seed.ts                     # Database seeder for categories, products, tiers, rules
└── DESIGN.md                       # Official UI/UX Design System Specification
```

---

## 5. Technology Stack & Core Dependencies

| Technology | Purpose | Key Package / Version |
|---|---|---|
| **Framework** | Full-stack React framework with SSR | `next@14.2.35` |
| **Language** | Type safety across backend & frontend | `typescript@^5` |
| **Database & ORM** | Relational data persistence | `postgresql` / `@prisma/client@^6.19` |
| **Authentication** | Session-based & JWT auth | `next-auth@5.0.0-beta.25` |
| **Payment Gateway** | Indian payment processing (UPI/Cards) | `razorpay@^2.9.4` |
| **Logistics Engine** | Multi-carrier courier integration | `Shiprocket API v2` & `Delhivery API` |
| **Styling & UI** | Utility-first CSS & Animations | `tailwindcss@^3.4`, `framer-motion@^11.0` |
| **PDF Generation** | Server-side invoice & quote PDFs | `@react-pdf/renderer@^3.4.4` |
| **Email Service** | Transactional order emails | `resend@^3.2.0` |
| **Validation** | Schema and input validation | `zod@^3.22.4` |

---

## 6. Database Schema & Data Models (Prisma)

### Key Schema Models

```prisma
enum ShipmentStatus {
  ORDER_PLACED
  PAYMENT_CONFIRMED
  PROCESSING
  PACKED
  SHIPMENT_CREATED
  PICKUP_SCHEDULED
  PICKED_UP
  IN_TRANSIT
  REACHED_DESTINATION
  OUT_FOR_DELIVERY
  DELIVERED
  DELAYED
  NDR
  RTO_INITIATED
  RTO_IN_TRANSIT
  RTO_DELIVERED
  LOST
  DAMAGED
  CANCELLED
}

model Order {
  id              String         @id @default(cuid())
  orderNumber     String         @unique
  userId          String?
  status          OrderStatus    @default(pending_payment)
  paymentStatus   PaymentStatus  @default(initiated)
  subtotal        Decimal        @db.Decimal(10, 2)
  shippingAmount  Decimal        @default(0) @db.Decimal(10, 2)
  taxableAmount   Decimal        @db.Decimal(10, 2)
  isSameState     Boolean        @default(true)
  cgstAmount      Decimal        @default(0) @db.Decimal(10, 2)
  sgstAmount      Decimal        @default(0) @db.Decimal(10, 2)
  igstAmount      Decimal        @default(0) @db.Decimal(10, 2)
  totalGST        Decimal        @db.Decimal(10, 2)
  grandTotal      Decimal        @db.Decimal(10, 2)
  items           OrderItem[]
  payment         Payment?
  shipments       Shipment[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model Shipment {
  id                    String                  @id @default(cuid())
  orderId               String
  order                 Order                   @relation(fields: [orderId], references: [id])
  provider              String                  // "shiprocket", "delhivery", "manual"
  courierName           String                  // "Delhivery Surface", "Blue Dart", "Manual"
  awbNumber             String                  @unique
  status                ShipmentStatus          @default(SHIPMENT_CREATED)
  shippingCost          Decimal                 @default(0) @db.Decimal(10, 2)
  trackingUrl           String?
  estimatedDeliveryDate DateTime?
  events                ShipmentTrackingEvent[]
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
}

model ShipmentTrackingEvent {
  id             String         @id @default(cuid())
  shipmentId     String
  shipment       Shipment       @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  status         ShipmentStatus
  location       String?
  description    String?
  externalStatus String?
  timestamp      DateTime       @default(now())
}
```

---

## 7. Core Algorithms & Business Logic

### 7.1 Dual-Persona Server-Side Price Resolution Engine (`resolvePrice`)
**Location:** [`lib/pricing.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/pricing.ts)
Ensures client cart tamper-resistance by resolving prices against active database tiers and user roles.

### 7.4 Unified Indian GST Tax Calculation Engine (`computeInvoiceTotals`)
**Location:** [`lib/tax.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/tax.ts)
Single authoritative function used across checkout, Razorpay order creation, order storage, and invoice generation:
- **Intra-State (Seller State === Buyer State):** Split 18% GST into CGST (9%) + SGST (9%).
- **Inter-State (Seller State !== Buyer State):** Applied as IGST (18%).
- Computes goods GST, shipping GST, and exact Grand Total with zero rounding discrepancy.

### 7.5 Courier Logistics & Shipping Abstraction Layer (`ShippingRegistry`)
**Location:** [`lib/shipping/`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/shipping/)
- **Provider Interface:** `checkServiceability()`, `getRates()`, `createShipment()`, `trackShipment()`, `cancelShipment()`.
- **Status Normalization:** Maps provider-specific webhooks into 20 standardized `ShipmentStatus` lifecycle states.
- **Admin Dispatch Modal:** Supports one-click live rate selection or offline manual AWB entry.

### 7.7 Razorpay Payment Security & Authoritative Webhook Engine
**Location:** [`app/api/payment/verify/route.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/app/api/payment/verify/route.ts) & [`app/api/webhooks/payment/razorpay/route.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/app/api/webhooks/payment/razorpay/route.ts)
- Enforces `request.orderId -> db.order -> payment.razorpayOrderId === request.razorpay_order_id`.
- Validates HMAC SHA-256 signatures with `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET`.
- Handles asynchronous webhook events (`order.paid`, `payment.captured`, `payment.failed`) with complete idempotency.

---

## 8. Application User Journeys

```
[ Visitor / Customer ]
       │
       ├── Browse Catalog & Live Estimator ──> Select Quantity (1–9, 10–49, 50–99)
       ├── Add to Cart ──> Enter Shipping Address & State
       ├── Instant Unified GST & Courier Calculation
       ├── Pay via Razorpay (UPI / Card / Netbanking)
       │
[ Database / Order Created ]
       │
       ├── Instant Order Confirmation Email Sent
       │
[ Admin Fulfillment ]
       │
       ├── Admin Order Dashboard ──> Click [ DISPATCH ORDER ]
       ├── Compare Live Courier Rates OR Enter Offline Courier & AWB
       │
[ Live Tracking ]
       │
       ├── Customer Dashboard / Public Tracker (/track-order)
       └── Chronological Milestone Timeline Updates via Webhook
```

---

## 9. API Route Directory & Endpoints

| Category | Endpoint | Methods | Description |
|---|---|---|---|
| **Cart** | `/api/cart` | `GET`, `POST`, `DELETE` | Cart management session & database items |
| **Checkout** | `/api/checkout` | `POST` | Server price resolution & Razorpay order generation |
| **Payment** | `/api/payment/verify` | `POST` | HMAC signature verification & payment capture |
| **Webhooks** | `/api/webhooks/payment/razorpay` | `POST` | Authoritative Razorpay webhook receiver |
| **Webhooks** | `/api/webhooks/shipping/shiprocket` | `POST` | Shiprocket live tracking webhook receiver |
| **Logistics** | `/api/shipments` | `GET`, `POST` | Courier rate fetching & shipment creation |
| **Logistics** | `/api/shipments/[id]/tracking` | `GET` | Live tracking status and event timeline |
| **Public Track**| `/api/track` | `GET` | Public tracking lookup by order/AWB number |
| **Admin Orders**| `/api/admin/orders` | `GET`, `PATCH` | Order management & status synchronization |
| **Admin Ship** | `/api/admin/shipments/manual` | `POST` | Offline/manual courier dispatch with AWB |
| **Admin Status**| `/api/admin/shipments/[id]/status`| `PATCH`| Inline shipment status updates |
| **Quotations** | `/api/quotation` | `GET`, `POST` | Generate formal B2B quotes & PDF downloads |

---

## 10. Design System & UI/UX Standards

See the full **[DESIGN.md](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/DESIGN.md)** specification for details on typography, color tokens, bento grids, micro-interactions, and accessibility standards.

---

## 11. Environment Setup & Installation Guide

### Prerequisites
- **Node.js:** v18.x or v20.x
- **PostgreSQL:** v15+ database instance
- **npm** or **pnpm**

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure `.env`
```env
# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digitalworld?schema=public"

# Authentication
AUTH_SECRET="generate-a-32-character-secret-key-here"
AUTH_URL="http://localhost:3000"

# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YourTestKeyId"
RAZORPAY_KEY_SECRET="YourRazorpaySecretKey"
RAZORPAY_WEBHOOK_SECRET="YourRazorpayWebhookSecret"

# Shiprocket Logistics (Optional for Live Couriers)
SHIPROCKET_EMAIL="your-email@domain.com"
SHIPROCKET_PASSWORD="your-password"
SHIPROCKET_DEFAULT_PICKUP_PINCODE="110020"

# Admin Initial Credentials
ADMIN_EMAIL="admin@digitalworld.com"
ADMIN_INITIAL_PASSWORD="Admin@DigitalWorld2026!"

# Business Information (For Invoices)
BUSINESS_NAME="DigitalWorld Industrial Safety Solutions"
BUSINESS_GSTIN="07AAAAA0000A1Z5"
BUSINESS_STATE="Maharashtra"
```

### 3. Initialize Database & Run Server
```bash
# Push schema migrations to PostgreSQL
npx prisma db push

# Seed initial categories, products, tiers, and shipping rules
npm run db:seed

# Start Next.js development server
npm run dev
```

---

## 12. Database Seeding & Operations

The TypeScript database seeder located at [`prisma/seed.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/prisma/seed.ts) configures:
1. **Product Categories:** Fire Suppression, Safety Gear, Industrial Tech.
2. **Product Catalog:** Heat Aerosol Fire Extinguishing Device (`QRR0.01G/S` and `QRRO-10`).
3. **Volume Discount Tiers:** 1–9 PCS (₹100), 10–49 PCS (₹275), 50–99 PCS (₹250), 100–499 PCS (₹200), 500+ PCS (₹165).
4. **Admin User Account:** Seeded from environment variables.

To execute database seeding:
```bash
npm run db:seed
```

---

## 13. Testing & Quality Assurance

```bash
# Verify strict TypeScript type checking & ESLint
npm run build

# Run unit tests
npm run test
```

---

<p align="center">
  <b>DigitalWorld Industrial Fire Tech</b> • Engineered for Maximum Industrial Safety & Precision
</p>
