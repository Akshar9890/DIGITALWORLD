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
3. [System Architecture & 3D Isometric Data Flow](#3-system-architecture--3d-isometric-data-flow)
   - [3.1 3D Layered Isometric Architecture](#31-3d-layered-isometric-architecture)
   - [3.2 End-to-End Reactive Data Flow](#32-end-to-end-reactive-data-flow)
4. [Complete Repository Structure](#4-complete-repository-structure)
5. [Technology Stack & Core Dependencies](#5-technology-stack--core-dependencies)
6. [Database Schema & Data Models (Prisma)](#6-database-schema--data-models-prisma)
7. [Core Algorithms & Mathematical Logic](#7-core-algorithms--mathematical-logic)
   - [7.1 Dual-Persona Server-Side Price Resolution Engine (`resolvePrice`)](#71-dual-persona-server-side-dynamic-price-resolution-engine-resolveprice)
   - [7.2 Dynamic Quantity Tier Matching Algorithm (`getPriceForQuantity`)](#72-dynamic-quantity-tier-matching-algorithm-getpriceforquantity)
   - [7.3 Tier Unlock Nudge & Upsell Incentive Algorithm (`getNextTierHint`)](#73-tier-unlock-nudge--upsell-incentive-algorithm-getnexttierhint)
   - [7.4 Unified Indian GST Tax Calculation Engine (`computeInvoiceTotals`)](#74-unified-indian-gst-tax-calculation-engine-computeinvoicetotals)
   - [7.5 Multi-Carrier Courier Brokerage & Shipping Engine (`ShippingRegistry`)](#75-multi-carrier-courier-brokerage--shipping-engine-shippingregistry)
   - [7.6 20-State Courier Status Normalization Finite State Machine](#76-20-state-courier-status-normalization-finite-state-machine)
   - [7.7 Indian Currency Amount-to-Words Algorithm (`amountToWords`)](#77-indian-currency-amount-to-words-algorithm-amounttowords)
   - [7.8 Authoritative Cryptographic HMAC-SHA256 Payment Verification & Idempotency](#78-authoritative-cryptographic-hmac-sha256-payment-verification--idempotency)
   - [7.9 B2B Wholesale Onboarding & Approval Workflow](#79-b2b-wholesale-onboarding--approval-workflow)
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

## 3. System Architecture & 3D Isometric Data Flow

DigitalWorld is built on a high-throughput, decoupled monolithic architecture powered by Next.js 14 App Router, Prisma ORM, and resilient cloud integration brokers.

### 3.1 3D Layered Isometric Architecture

```
                                  ==================================================
                                  ▼  TIER 1: CLIENT INTERFACE & PRESENTATION LAYER  ▲
                                  ==================================================
                                    /                                             /│
                                   /  ┌───────────────┐   ┌─────────────────┐    / │
                                  /   │  B2C Visitor  │   │  B2B Wholesale  │   /  │
                                 /    │  Storefront   │   │  Portal (KYC)   │  /   │
                                /     └───────┬───────┘   └────────┬────────┘ /    │
                               /              │  ┌───────────────┐ │         /     │
                              /               └─▶│  Admin Panel  │◀┘        /      │
                             /                   │  & Logistics  │         /       │
                            /                    └───────┬───────┘        /        │
                           /─────────────────────────────┼───────────────/         │
                           │                             │               │         │
                           │                             ▼ (HTTPS/WSS)   │         │
                           │      ==================================================
                           │      ▼  TIER 2: EDGE ROUTING & APPLICATION RUNTIME    ▲
                           │      ==================================================
                           │        /                                             /│
                           │       /  ┌─────────────────────────────────────┐    / │
                           │      /   │      Next.js 14 App Router Core     │   /  │
                           │     /    │  ┌──────────────┐ ┌───────────────┐ │  /   │
                           │    /     │  │ Server Action│ │ API Handlers  │ │ /    │
                           │   /      │  │ & SSR Pages  │ │ (/api/v1/*)   │ │/     │
                           │  /       │  └───────┬──────┘ └───────┬───────┘ │      │
                           │ /        └──────────┼────────────────┼─────────┘      │
                           │/────────────────────┼────────────────┼────────────────│
                           │                     │                │                │
                           │                     ▼                ▼                │
                           │      ==================================================
                           │      ▼  TIER 3: CORE ALGORITHM & DOMAIN SERVICE MESH  ▲
                           │      ==================================================
                           │        /                                             /│
                           │       /  ┌──────────────┐   ┌──────────────────┐    / │
                           │      /   │ resolvePrice │   │computeInvoiceTot.│   /  │
                           │     /    │ Engine ($7.1)│   │  GST Matrix ($7.4)│  /   │
                           │    /     └───────┬──────┘   └────────┬─────────┘ /    │
                           │   /              │  ┌──────────────┐ │          /     │
                           │  /               └─▶│ShippingRegist│◀┘         /      │
                           │ /                   │Courier Layer │          /       │
                           │/                    └───────┬──────┘         /        │
                           │─────────────────────────────┼───────────────/         │
                           │                             │                         │
                           │                             ▼ (Prisma / API SDKs)     │
                           │      ==================================================
                           │      ▼  TIER 4: PERSISTENCE & MULTI-CLOUD INTEGRATIONS▲
                           │      ==================================================
                           │        /                                             /
                           │       /  ┌──────────────┐   ┌──────────────────┐    /
                           │      /   │  PostgreSQL  │   │     Razorpay     │   /
                           │     /    │  Database    │   │  Payment Gateway │  /
                           │    /     └───────┬──────┘   └────────┬─────────┘ /
                           │   /              │  ┌──────────────┐ │          /
                           │  /               └─▶│  Shiprocket  │◀┘         /
                           │ /                   │Live Logistics│          /
                           │/                    └──────────────┘         /
                           ================================================
```

### 3.2 End-to-End Reactive Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer / B2B Buyer
    participant Client as 🖥️ Next.js Client (UI/Cart)
    participant Edge as ⚡ Next.js App Router (Server)
    participant Pricing as 🧮 Pricing Engine (lib/pricing.ts)
    participant Tax as 🏛️ GST Engine (lib/tax.ts)
    participant DB as 🗄️ PostgreSQL (Prisma)
    participant Razorpay as 💳 Razorpay Gateway
    participant Logistics as 🚚 Logistics (Shiprocket/Manual)

    Customer->>Client: Selects Product & Quantity (e.g., Qty = 50)
    Client->>Edge: POST /api/checkout (Payload: items, address)
    activate Edge
    Edge->>Pricing: resolvePrice(productId, qty, userContext)
    Pricing->>DB: Query ProductPrice & PricingTier
    DB-->>Pricing: Active Tiers [1-9: ₹300, 10-49: ₹275, 50-99: ₹225, ...]
    Pricing-->>Edge: Resolved Unit Price: ₹225 | Subtotal: ₹11,250
    Edge->>Tax: computeInvoiceTotals(subtotal, shipping, sellerState, buyerState)
    Tax-->>Edge: GST Breakdown (CGST+SGST or IGST 18%) + Grand Total
    Edge->>Razorpay: orders.create({ amount: GrandTotalInPaise })
    Razorpay-->>Edge: razorpay_order_id (rzp_order_xxx)
    Edge->>DB: Create Order (status: PENDING_PAYMENT)
    Edge-->>Client: Order Created + Checkout Options
    deactivate Edge
    Client->>Customer: Render Razorpay Standard Checkout Modal
    Customer->>Razorpay: Authorize Payment (UPI / Card / Netbanking)
    Razorpay-->>Edge: Webhook: payment.captured (HMAC SHA-256 Signed)
    activate Edge
    Edge->>Edge: Verify Signature (crypto.timingSafeEqual)
    Edge->>DB: Update Order (PAID) & Create Invoice Record
    Edge->>Logistics: ShippingRegistry.createShipment(orderData)
    Logistics-->>Edge: AWB Number & Tracking URL
    Edge->>DB: Create Shipment (status: SHIPMENT_CREATED)
    deactivate Edge
    Edge-->>Customer: Transactional Order Confirmation Email + Invoice PDF
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

## 7. Core Algorithms & Mathematical Logic

DigitalWorld implements 8 authoritative algorithms across pricing, tax engineering, multi-carrier courier dispatch, and cryptographic payment verification.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DIGITALWORLD ALGORITHM SUITE                       │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ 7.1 Dynamic Pricing  │ 7.2 Tier Search      │ 7.3 Unlock Nudge & Incentives │
│ 7.4 GST Tax Matrix   │ 7.5 Logistics Engine │ 7.6 20-State FSM Normalizer   │
│ 7.7 Currency Words   │ 7.8 HMAC Security    │ 7.9 B2B Wholesale Verification│
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

---

### 7.1 Dual-Persona Server-Side Dynamic Price Resolution Engine (`resolvePrice`)
**Location:** [`lib/pricing.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/pricing.ts)

#### Mathematical & Logical Specification
Let $P$ be a product with sorted pricing tiers $T = [t_1, t_2, \dots, t_k]$ where $t_i.\text{minQty} < t_{i+1}.\text{minQty}$.  
For customer order quantity $Q$ and buyer context $C = \langle \text{role}, \text{assignedTierId} \rangle$:

1. **Active Quantity Tier Selection ($t^*$):**
   ```text
   t* = Largest tier in T such that (t.minQty <= Q) AND (t.maxQty == null OR Q <= t.maxQty)
   ```

2. **Wholesale Override Evaluation ($P_{\text{eff}}$):**
   ```text
   IF role == "wholesale_approved" AND assignedTierId != null:
       P_eff = MIN(t*.pricePerUnit, assignedTierPrice.pricePerUnit)
   ELSE:
       P_eff = t*.pricePerUnit
   ```

3. **Subtotal Formulation:**
   ```text
   Subtotal = P_eff * Q
   ```

```mermaid
flowchart TD
    Start([Input: productId, quantity Q, userContext]) --> FetchTiers[(Fetch ProductPrices and Tiers from DB)]
    FetchTiers --> Sort[Sort Tiers Ascending by minQty]
    Sort --> FilterMatch{"Filter Tiers where: minQty <= Q and (maxQty == null or Q <= maxQty)"}
    FilterMatch --> FindLargest["Select Last Match (t*)"]
    FindLargest --> CheckWholesale{"Role == 'wholesale_approved' and assignedTierId != null?"}
    CheckWholesale -- Yes --> ComparePrices{"assignedPrice < tierPrice?"}
    ComparePrices -- Yes --> Override["Set Chosen Price = assignedPrice"]
    ComparePrices -- No --> Keep["Set Chosen Price = tierPrice"]
    CheckWholesale -- No --> Keep
    Override --> CalcSubtotal["Subtotal = Chosen Price * Q"]
    Keep --> CalcSubtotal
    CalcSubtotal --> ReturnResult([Return PriceResult: unitPrice, tierId, subtotal])
```

#### TypeScript Implementation
```typescript
export async function resolvePrice(
  productId: string,
  quantity: number,
  context: PricingContext
): Promise<PriceResult> {
  const { role, assignedTierId } = context;

  const productPrices = await prisma.productPrice.findMany({
    where: { productId },
    include: { tier: true },
    orderBy: { tier: { minQty: "asc" } },
  });

  if (productPrices.length === 0) {
    throw new Error(`No pricing found for product ${productId}`);
  }

  let matched = getPriceForQuantity(
    productPrices.map((p) => ({
      tierId: p.tierId,
      tierName: p.tier.name,
      minQty: p.tier.minQty,
      maxQty: p.tier.maxQty,
      pricePerUnit: Number(p.pricePerUnit),
    })),
    quantity
  );

  if (role === "wholesale_approved" && assignedTierId) {
    const assignedPrice = productPrices.find((p) => p.tierId === assignedTierId);
    if (
      assignedPrice &&
      (!matched || Number(assignedPrice.pricePerUnit) < matched.pricePerUnit)
    ) {
      matched = {
        tierId: assignedPrice.tierId,
        tierName: assignedPrice.tier.name,
        minQty: assignedPrice.tier.minQty,
        maxQty: assignedPrice.tier.maxQty,
        pricePerUnit: Number(assignedPrice.pricePerUnit),
      };
    }
  }

  const chosen = matched || {
    tierId: productPrices[0].tierId,
    tierName: productPrices[0].tier.name,
    minQty: productPrices[0].tier.minQty,
    maxQty: productPrices[0].tier.maxQty,
    pricePerUnit: Number(productPrices[0].pricePerUnit),
  };

  return {
    unitPrice: chosen.pricePerUnit,
    tierId: chosen.tierId,
    tierName: chosen.tierName,
    quantity,
    subtotal: chosen.pricePerUnit * quantity,
  };
}
```

---

### 7.2 Dynamic Quantity Tier Matching Algorithm (`getPriceForQuantity`)
**Location:** [`lib/pricing.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/pricing.ts#L63-L78)

Computes the active tier in $O(N \log N)$ time (where $N \le 10$ is the number of catalog tiers). Guarantees consistent evaluation across Cart, Instant Quotation, and Server Checkout.

```typescript
export function getPriceForQuantity(
  tiers: TierLike[],
  quantity: number
): TierLike | null {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);

  const match = sorted
    .filter(
      (t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty)
    )
    .pop(); // Highest minQty range that encloses quantity

  return match || null;
}
```

---

### 7.3 Tier Unlock Nudge & Upsell Incentive Algorithm (`getNextTierHint`)
**Location:** [`lib/pricing.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/pricing.ts#L117-L128)

Maximizes average order volume (AOV) by identifying when a customer is close to unlocking a cheaper tier:

```text
ΔQ = nextTier.minQty - currentQuantity

Nudge Trigger Condition:
- IF (1 <= ΔQ <= 3): Display "Add ΔQ more pieces to unlock lower price!"
- ELSE: Suppress hint (prevent notification fatigue)

Projected Savings:
Savings = (currentQuantity * currentUnitPrice) - ((currentQuantity + ΔQ) * nextTierUnitPrice)
```

```typescript
export function getNextTierHint(
  tiers: TierLike[],
  quantity: number
): TierUnlockHint | null {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  const next = sorted.find((t) => t.minQty > quantity);
  if (!next) return null;

  const piecesToUnlock = next.minQty - quantity;
  if (piecesToUnlock > 3) return null; // Suppress if > 3 units away

  return { piecesToUnlock, tier: next };
}
```

---

### 7.4 Unified Indian GST Tax Calculation Engine (`computeInvoiceTotals`)
**Location:** [`lib/tax.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/tax.ts#L54-L139)

#### State Normalization & Tax Partition Logic
Let `sellerState` and `buyerState` be the normalized geographic strings:

```text
isSameState = (trim(lowercase(sellerState)) === trim(lowercase(buyerState)))

Tax Breakdown Formulation:
- Goods GST Rate (r) = 18% (0.18)
- Shipping GST Rate (rs) = 18% (0.18)

IF isSameState === true (Intra-State Transaction):
    CGST = roundToTwo(Subtotal * 0.09)
    SGST = roundToTwo(Subtotal * 0.09)
    IGST = 0.00
ELSE (Inter-State Transaction):
    CGST = 0.00
    SGST = 0.00
    IGST = roundToTwo(Subtotal * 0.18)

Shipping GST = roundToTwo(ShippingCost * 0.18)
Grand Total  = roundToTwo(Subtotal + TotalGoodsGST + ShippingCost + ShippingGST)
```

```
                                    ┌────────────────────────┐
                                    │ Input: Subtotal, States│
                                    └───────────┬────────────┘
                                                │
                                  Normalize(Seller) == Normalize(Buyer)?
                                               / \
                                       YES    /   \    NO
                                             /     \
                       ┌────────────────────┐       ┌────────────────────┐
                       │ Intra-State Branch │       │ Inter-State Branch │
                       ├────────────────────┤       ├────────────────────┤
                       │ CGST = 9%          │       │ CGST = 0%          │
                       │ SGST = 9%          │       │ SGST = 0%          │
                       │ IGST = 0%          │       │ IGST = 18%         │
                       └─────────┬──────────┘       └─────────┬──────────┘
                                 │                            │
                                 └──────────────┬─────────────┘
                                                ▼
                                    ┌────────────────────────┐
                                    │ Add Shipping Cost + 18%│
                                    │ Execute roundToTwo()   │
                                    │ Generate Words (INR)   │
                                    └────────────────────────┘
```

---

### 7.5 Multi-Carrier Courier Brokerage & Shipping Engine (`ShippingRegistry`)
**Location:** [`lib/shipping/`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/shipping/)

#### Volumetric Weight & Multi-Provider Rate Selector
For carton dimensions $L \times W \times H$ in centimeters and actual weight $W_{\text{actual}}$ in kilograms:

```text
Volumetric Weight (kg) = (Length * Width * Height) / 5000
Chargeable Weight (kg) = MAX(Actual Weight, Volumetric Weight)
```

```typescript
export class ShippingRegistry {
  private static providers: Map<string, ShippingProvider> = new Map();

  public static register(name: string, provider: ShippingProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  public static async getBestRates(
    pickupPincode: string,
    deliveryPincode: string,
    weightGrams: number,
    cod: boolean
  ): Promise<CourierOption[]> {
    const activeProviders = Array.from(this.providers.values());
    const ratePromises = activeProviders.map((p) =>
      p.getRates(pickupPincode, deliveryPincode, weightGrams, cod).catch(() => [])
    );
    const results = await Promise.all(ratePromises);
    // Flatten and sort by lowest rate, then shortest estimated delivery days
    return results.flat().sort((a, b) => a.rate - b.rate || a.etdDays - b.etdDays);
  }
}
```

---

### 7.6 20-State Courier Status Normalization Finite State Machine
**Location:** [`lib/shipping/status-normalizer.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/shipping/status-normalizer.ts)

Maps raw webhooks from Shiprocket, Delhivery, Blue Dart, and manual courier dispatches into a deterministic state lifecycle:

```mermaid
stateDiagram-v2
    [*] --> ORDER_PLACED: Checkout Completed
    ORDER_PLACED --> PAYMENT_CONFIRMED: Razorpay Captured
    PAYMENT_CONFIRMED --> PROCESSING: Warehouse Picklist
    PROCESSING --> PACKED: Barcode Scanned
    PACKED --> SHIPMENT_CREATED: AWB Assigned
    SHIPMENT_CREATED --> PICKUP_SCHEDULED: Manifest Generated
    PICKUP_SCHEDULED --> PICKED_UP: Courier Scan
    PICKED_UP --> IN_TRANSIT: Line Haul Transit
    IN_TRANSIT --> REACHED_DESTINATION: Destination Hub Scan
    REACHED_DESTINATION --> OUT_FOR_DELIVERY: Assigned to Courier Agent
    OUT_FOR_DELIVERY --> DELIVERED: OTP / Signature Verified
    DELIVERED --> [*]

    OUT_FOR_DELIVERY --> NDR: Delivery Attempt Failed
    NDR --> OUT_FOR_DELIVERY: Re-attempt Scheduled
    NDR --> RTO_INITIATED: Max Retries Exceeded
    RTO_INITIATED --> RTO_IN_TRANSIT: Reverse Line Haul
    RTO_IN_TRANSIT --> RTO_DELIVERED: Returned to Warehouse
    RTO_DELIVERED --> [*]

    IN_TRANSIT --> DELAYED: Weather/Logistics Delay
    DELAYED --> IN_TRANSIT: Transit Resumed
    IN_TRANSIT --> LOST: Insurance Claim
    IN_TRANSIT --> DAMAGED: Exception Flagged
```

---

### 7.7 Indian Currency Amount-to-Words Algorithm (`amountToWords`)
**Location:** [`lib/tax.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/tax.ts#L181-L224)

Decomposes numbers into Indian numbering units (`Crore` $\to$ `Lakh` $\to$ `Thousand` $\to$ `Hundred` $\to$ `Tens` $\to$ `Units` $\to$ `Paise`) for legal Indian GST tax invoices.

```typescript
function numToWords(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n] + " ";
  if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
  if (n < 1000)
    return ones[Math.floor(n / 100)] + " Hundred " + numToWords(n % 100);
  if (n < 100000)
    return numToWords(Math.floor(n / 1000)) + " Thousand " + numToWords(n % 1000);
  if (n < 10000000)
    return numToWords(Math.floor(n / 100000)) + " Lakh " + numToWords(n % 100000);
  return numToWords(Math.floor(n / 10000000)) + " Crore " + numToWords(n % 10000000);
}

export function amountToWords(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let result = "Rupees " + (rupees === 0 ? "Zero " : numToWords(rupees).trim() + " ");
  if (paise > 0) result += `and ${numToWords(paise).trim()} Paise `;
  return result.trim() + " Only";
}
```

---

### 7.8 Authoritative Cryptographic HMAC-SHA256 Payment Verification & Idempotency
**Location:** [`app/api/payment/verify/route.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/app/api/payment/verify/route.ts)

Protects against timing attacks and double-capture through constant-time byte comparisons and transactional database idempotency locks:

```text
Generated Signature = HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
Is Valid = crypto.timingSafeEqual(Buffer(Generated Signature), Buffer(Received Signature))
```

```typescript
const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest("hex");

const isAuthentic = crypto.timingSafeEqual(
  Buffer.from(generatedSignature, "utf-8"),
  Buffer.from(razorpay_signature, "utf-8")
);

if (!isAuthentic) {
  throw new Error("Cryptographic Signature Mismatch — Payment Rejected");
}
```

---

### 7.9 B2B Wholesale Onboarding & Approval Workflow

```mermaid
flowchart LR
    A["B2B Application Submitted"] --> B["GSTIN Verification (Regex Check)"]
    B --> C{"Admin Review"}
    C -- Approved --> D["Role: wholesale_approved"]
    D --> E["Unlock Custom Volume Tier"]
    E --> F["Instant PDF Quotations with HSN"]
    C -- Rejected --> G["Role: b2c_retailer"]
```

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
