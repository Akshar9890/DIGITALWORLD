# DigitalWorld — Hybrid B2B Wholesale & B2C E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

**DigitalWorld** is a high-performance, enterprise-grade e-commerce platform engineered specifically to serve as a **hybrid B2B wholesale portal and B2C retail storefront**. Built to digitalize sales of industrial and safety products (e.g., thermal aerosol fire suppression systems), the platform bridges single-unit retail purchases with tiered wholesale volume pricing, automated quote generation, GST-compliant invoicing, and Pan-India logistics.

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
   - [7.4 Indian GST Tax Calculation Engine (`computeGST` & `computeInvoiceTotals`)](#74-indian-gst-tax-calculation-engine-computegst--computeinvoicetotals)
   - [7.5 Dynamic Courier Shipping Charge Calculation (`calculateShipping` & `getCourierCharge`)](#75-dynamic-courier-shipping-charge-calculation-calculateshipping--getcouriercharge)
   - [7.6 Indian Currency Amount-to-Words Converter (`amountToWords`)](#76-indian-currency-amount-to-words-converter-amounttowords)
   - [7.7 Razorpay Webhook Verification & HMAC SHA-256 Execution](#77-razorpay-webhook-verification--hmac-sha-256-execution)
   - [7.8 B2B Wholesale Onboarding & Approval Workflow](#78-b2b-wholesale-onboarding--approval-workflow)
8. [Application User Journeys](#8-application-user-journeys)
9. [API Route Directory & Endpoints](#9-api-route-directory--endpoints)
10. [Design System & Aesthetics](#10-design-system--aesthetics)
11. [Environment Setup & Installation Guide](#11-environment-setup--installation-guide)
12. [Database Seeding & Operations](#12-database-seeding--operations)
13. [Testing & Quality Assurance](#13-testing--quality-assurance)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Executive Summary & Overview

Traditional B2B industrial selling relies heavily on manual WhatsApp/email negotiations, delayed quote generation, and error-prone manual GST invoicing. DigitalWorld modernizes this process into a unified web application serving two distinct customer types from a single product catalog:

- **Retail Customers (B2C):** Browse listed products, view standard prices, add to cart, check out with instant shipping & GST calculation, and pay via online payment gateways (UPI, Credit/Debit Cards, Netbanking).
- **Approved Business Buyers (B2B):** (Distributors, electrical contractors, facility managers) Apply for wholesale accounts, unlock exclusive tiered volume pricing upon approval, request formal PDF quotations, and obtain automated GST-compliant invoices with HSN breakdowns.

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
        └───────────────────────────┘                     └───────────────────────────┘
```

### Key Business Goals
1. **Catalog Centralization:** Maintain product specifications, high-resolution media, PDF technical datasheets, and tier tables in one place.
2. **Dynamic Volume Tiering:** Support quantity tiers (e.g., 10–49, 50–99, 100–499, 500–999, 1000–4999, 5000+ units).
3. **GST Tax Compliance:** Compute CGST + SGST (intra-state) vs IGST (inter-state) dynamically based on seller and buyer locations (18% default rate).
4. **Logistics Optimization:** Calculate weight-based courier charges up to 50 units and route orders > 50 units for custom team freight quoting.

---

## 3. System Architecture & Data Flow

DigitalWorld is built on a modern, decoupled monolithic structure powered by Next.js 14 App Router and Prisma ORM:

```
[ Client Browser ]
       │
       ├── HTTP / React Server Components / Server Actions
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
            │                  │                │               │
            ▼                  ▼                ▼               ▼
┌─────────────────────────┐  ┌────────────────────┐  ┌──────────────────┐
│  PostgreSQL Database    │  │  S3 / R2 Storage   │  │ Payment Gateway  │
│ (Prisma ORM Engine)     │  │ (Datasheets/PDFs)  │  │  (Razorpay SDK)  │
└─────────────────────────┘  └────────────────────┘  └──────────────────┘
```

---

## 4. Complete Repository Structure

```
digitalworld-app/
├── app/                              # Next.js App Router Structure
│   ├── admin/                        # Admin Portal (Role-gated routes)
│   ├── account/                      # User Account, Orders & Quotes Dashboard
│   │   ├── orders/                   # Order Tracking & Invoice Download
│   │   └── quotes/                   # Generated Formal PDF Quotation List
│   ├── api/                          # Serverless REST API Handlers
│   │   ├── cart/                     # Universal Cart (Guest Cookies / DB User)
│   │   ├── checkout/                 # Order Initialization & Razorpay Setup
│   │   ├── payment/callback/         # HMAC Signed Razorpay Webhook Handler
│   │   ├── quotes/                   # Instant & Formal Quote Generator
│   │   └── wholesale/apply/          # B2B Company Application Handler
│   ├── cart/                         # Cart UI & Optimistic Updates
│   ├── checkout/                     # Address Selection, GST & Payment Gateway
│   ├── products/                     # Product Catalog & Detail Page (SSR)
│   │   └── [slug]/                   # Dynamic Pricing & Pincode Checker
│   ├── wholesale/                    # B2B Wholesale Registration Form
│   ├── layout.tsx                    # Global Root Layout
│   └── page.tsx                      # Homepage with Hero & Featured Tiers
├── components/                       # UI Component Library
│   ├── cart/                         # Cart Drawer, Item Rows, Summary Card
│   ├── checkout/                     # Address Form, Summary & Gateway Button
│   ├── layout/                       # Header, Footer, Category Nav
│   ├── products/                     # Product Card, Spec Table, Tier Table
│   └── ui/                           # Primitive Components (Buttons, Dialogs)
├── lib/                              # Core Domain & Mathematical Engines
│   ├── db.ts                         # Singleton Prisma Client Instance
│   ├── pricing.ts                    # Dual-Persona Server Pricing Engine
│   ├── shipping.ts                   # Courier Calculation & Weight Math
│   ├── tax.ts                        # GST Breakdown & Words Converter
│   └── utils.ts                      # Formatting & Classname Helpers
├── prisma/                           # Database Schema & Seed Data
│   ├── schema.prisma                 # Complete Relational Database Model
│   └── seed.ts                       # Database Seed Script (Products & Tiers)
├── public/                           # Static Assets (Images, Icons)
├── styles/                           # Global CSS & Tailwind Directives
├── auth.ts                           # Auth.js (v5) Configuration & Handlers
├── middleware.ts                     # Auth & Role Enforcement Middleware
├── next.config.js                    # Next.js Compiler Settings
├── package.json                      # Dependency Manifest
├── tailwind.config.ts                # Tailwind Custom Theme Configuration
└── tsconfig.json                     # TypeScript Compiler Options
```

---

## 5. Technology Stack & Core Dependencies

| Category | Technology | Purpose / Justification |
|---|---|---|
| **Framework** | **Next.js 14 (App Router)** | Server-side rendering (SSR), Incremental Static Regeneration (ISR), React Server Components |
| **Language** | **TypeScript 5.0+** | Strict end-to-end type safety for financial & pricing calculations |
| **Database** | **PostgreSQL 15+** | Relational integrity, ACID compliance, structured JSON spec storage |
| **ORM** | **Prisma 6.0** | Type-safe database queries, schema migrations, and relational mapping |
| **Authentication** | **Auth.js v5 (`next-auth`)** | Role-based session management (`retail`, `wholesale_pending`, `wholesale_approved`, `admin`) |
| **State & Data Fetching**| **TanStack React Query v5** | Optimistic UI updates, caching, background cart synchronization |
| **Styling** | **Tailwind CSS 3.4** | Utility-first styling matching the Safety Alert design system |
| **Payments** | **Razorpay Node SDK** | Server-side order creation & client checkout popups |
| **PDF Generation** | **`@react-pdf/renderer`** | Server/Client rendering of official GST Invoices and Quotes |
| **Form Handling** | **React Hook Form + Zod** | Schema validation for addresses, checkout, and B2B GSTIN applications |
| **Animations** | **Framer Motion** | Smooth interactive drawer transitions, tier table highlights |

---

## 6. Database Schema & Data Models (Prisma)

The Prisma database schema (`prisma/schema.prisma`) enforces relational integrity across users, companies, products, tiered pricing, quotes, orders, payments, and invoices.

```mermaid
erDiagram
    User ||--o| Company : owns
    User ||--o{ CartItem : holds
    User ||--o{ Order : places
    User ||--o{ QuoteRequest : submits
    Company ||--o{ Order : places
    Company }|--|| PricingTier : assigned
    Category ||--o{ Product : categorizes
    Product ||--o{ ProductPrice : has
    PricingTier ||--o{ ProductPrice : defines
    Order ||--o{ OrderItem : contains
    Order ||--o| Payment : paid_by
    Order ||--o| Invoice : generates
    QuoteRequest ||--o| Order : converts_to
```

### Key Prisma Enums
- `UserRole`: `retail` | `wholesale_pending` | `wholesale_approved` | `admin`
- `CompanyStatus`: `pending` | `approved` | `rejected`
- `OrderStatus`: `pending_payment` | `payment_failed` | `processing` | `shipped` | `delivered` | `cancelled` | `refunded`
- `PaymentStatus`: `initiated` | `authorized` | `captured` | `failed` | `refunded` | `partially_refunded`
- `QuoteStatus`: `open` | `quoted` | `accepted` | `converted` | `expired` | `closed`

---

## 7. Core Algorithms & Business Logic

### 7.1 Dual-Persona Server-Side Price Resolution Engine (`resolvePrice`)

**Location:** [`lib/pricing.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/pricing.ts#L137-L200)

#### Architectural Requirement
Client-submitted unit prices are **never trusted**. Every calculation executed on the cart, checkout, or instant quote route forces a server-side price resolution using `resolvePrice()`.

#### Mathematical Formulation & Workflow
Given:
- Product ID: $P$
- Requested Quantity: $Q$
- Buyer Role: $R \in \{\text{retail}, \text{wholesale\_pending}, \text{wholesale\_approved}, \text{admin}\}$
- Assigned Company Tier ID: $T_{\text{company}}$ (if approved B2B)

$$\text{Unit Price } U = \begin{cases}
P_{\text{assigned}} & \text{if } R = \text{wholesale\_approved} \land T_{\text{company}} \text{ exists} \land P_{\text{assigned}} < P_{\text{qty}} \\
P_{\text{qty}} & \text{otherwise (where } P_{\text{qty}} \text{ matches } Q \in [\text{minQty}, \text{maxQty}]) \\
P_{\text{base}} & \text{fallback if no tier range matches}
\end{cases}$$

#### Source Code Implementation
```typescript
export async function resolvePrice(
  productId: string,
  quantity: number,
  context: PricingContext
): Promise<PriceResult> {
  const { role, assignedTierId } = context;

  // 1. Fetch all tier prices for product ordered by minQty ascending
  const productPrices = await prisma.productPrice.findMany({
    where: { productId },
    include: { tier: true },
    orderBy: { tier: { minQty: "asc" } },
  });

  if (productPrices.length === 0) {
    throw new Error(`No pricing found for product ${productId}`);
  }

  // 2. Match quantity against defined quantity tiers
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

  // 3. B2B Rule: If wholesale approved user has an assigned tier giving a lower price, use it
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

  // 4. Default fallback to base retail tier
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

### 7.2 Quantity Tier Matching Logic (`getPriceForQuantity`)

**Location:** [`lib/pricing.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/pricing.ts#L63-L78)

Sorts tiers by minimum quantity and selects the largest matching range:

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
    .pop(); // Returns the largest tier range that encapsulates the quantity

  return match || null;
}
```

---

### 7.3 Nudge & Tier Unlock Hint Algorithm (`getNextTierHint`)

**Location:** [`lib/pricing.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/pricing.ts#L117-L128)

Drives conversion optimization on the UI by calculating how many additional units are needed to unlock a lower unit price tier:

```typescript
export function getNextTierHint(
  tiers: TierLike[],
  quantity: number
): TierUnlockHint | null {
  const next = getNextTierUnlock(tiers, quantity);
  if (!next) return null;

  const piecesToUnlock = next.minQty - quantity;
  // Threshold Rule: Only nudge if 3 or fewer items are needed to prevent user fatigue
  if (piecesToUnlock > 3) return null;

  return { piecesToUnlock, tier: next };
}
```

---

### 7.4 Indian GST Tax Calculation Engine (`computeGST` & `computeInvoiceTotals`)

**Location:** [`lib/tax.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/tax.ts#L54-L140)

#### Regulatory Rule
- **Intra-State Transactions (Seller State == Buyer State):** Tax is split evenly into Central GST (CGST) and State GST (SGST):
  $$\text{CGST Rate} = \frac{\text{GST Rate}}{2}, \quad \text{SGST Rate} = \frac{\text{GST Rate}}{2}$$
- **Inter-State Transactions (Seller State != Buyer State):** Integrated GST (IGST) applies at full rate:
  $$\text{IGST Rate} = \text{GST Rate}, \quad \text{CGST Rate} = 0, \quad \text{SGST Rate} = 0$$

#### Implementation Code
```typescript
export function computeGST(
  taxableValue: number,
  sellerState: string,
  buyerState: string,
  gstRate: number = 0.18
): GSTBreakdown {
  const normalSeller = sellerState.trim().toLowerCase();
  const normalBuyer = buyerState.trim().toLowerCase();
  const isSameState = normalSeller === normalBuyer;

  const totalGSTAmount = roundToTwo(taxableValue * gstRate);

  if (isSameState) {
    const halfRate = gstRate / 2;
    const halfGST = roundToTwo(taxableValue * halfRate);
    return {
      taxableValue,
      isSameState: true,
      sellerState,
      buyerState,
      cgstRate: halfRate,
      cgstAmount: halfGST,
      sgstRate: halfRate,
      sgstAmount: halfGST,
      igstRate: 0,
      igstAmount: 0,
      totalGST: roundToTwo(halfGST + halfGST),
      totalWithGST: roundToTwo(taxableValue + halfGST + halfGST),
    };
  } else {
    return {
      taxableValue,
      isSameState: false,
      sellerState,
      buyerState,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRate,
      igstAmount: totalGSTAmount,
      totalGST: totalGSTAmount,
      totalWithGST: roundToTwo(taxableValue + totalGSTAmount),
    };
  }
}
```

---

### 7.5 Dynamic Courier Shipping Charge Calculation (`calculateShipping` & `getCourierCharge`)

**Location:** [`lib/shipping.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/shipping.ts#L24-L45)

#### Business Rules
1. **Standard Parcels ($\le 50$ units):** Freight is calculated based on total weight in kilograms ($\text{Rate} = ₹50/\text{kg}$, $\text{Minimum Floor} = ₹100$).
2. **Bulk Shipments ($> 50$ units):** Online freight charge set to $₹0$; UI notes `"Bulk order (Shipping quoted by team)"`.

```typescript
export function getCourierCharge(totalWeightGrams: number, totalQuantity: number = 1): CourierCharge {
  if (totalWeightGrams <= 0) return { amount: 0, isFree: true, isBulk: false };

  // Rule: Bulk shipments (>50 pcs) require custom freight quoting by sales team
  if (totalQuantity > 50) {
    return {
      amount: 0,
      isFree: true,
      isBulk: true,
      note: "Bulk order (Shipping quoted by team)",
    };
  }

  const exactKg = totalWeightGrams / 1000;
  let charge = exactKg * COURIER_RATE_PER_KG; // ₹50/kg

  if (charge < MIN_SHIPPING_CHARGE) {
    charge = MIN_SHIPPING_CHARGE; // ₹100 floor
  }

  return { amount: Math.round(charge), isFree: false, isBulk: false };
}
```

---

### 7.6 Indian Currency Amount-to-Words Converter (`amountToWords`)

**Location:** [`lib/tax.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/lib/tax.ts#L203-L235)

Converts numeric totals into Indian financial wording using **Lakhs ($10^5$)** and **Crores ($10^7$)** for official GST invoices:

```typescript
function numToWords(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n] + " ";
  if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
  if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred " + numToWords(n % 100);
  if (n < 100000) return numToWords(Math.floor(n / 1000)) + "Thousand " + numToWords(n % 1000);
  if (n < 10000000) return numToWords(Math.floor(n / 100000)) + "Lakh " + numToWords(n % 100000);
  return numToWords(Math.floor(n / 10000000)) + "Crore " + numToWords(n % 10000000);
}

export function amountToWords(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paiseRaw = Math.round((rounded - rupees) * 100);

  let result = "Rupees " + (rupees === 0 ? "Zero " : numToWords(rupees).trim() + " ");
  if (paiseRaw > 0) result += `and ${numToWords(paiseRaw).trim()} Paise `;
  return result.trim() + " Only";
}
```

---

### 7.7 Razorpay Webhook Verification & HMAC SHA-256 Execution

**Location:** `app/api/payment/callback/route.ts`

Ensures zero-tampering payment processing via HMAC SHA-256 signature verification:

$$\text{Generated Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_SECRET})$$

```typescript
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Idempotent state mutation: Update payment status & clear cart
  await prisma.payment.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      status: "captured",
      razorpayPaymentId: razorpay_payment_id,
      webhookVerified: true,
    },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "processing", paymentStatus: "captured" },
  });

  return NextResponse.json({ success: true });
}
```

---

### 7.8 B2B Wholesale Onboarding & Approval Workflow

```
[ Visitor / Retail User ]
          │
          ▼ Submits `/wholesale` Form (Company Name, GSTIN, Expected Volume)
┌──────────────────────────────────────────────────────────┐
│  Create `Company` (status: pending)                      │
│  Update `User` role: `wholesale_pending`                │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
            [ Admin Review Queue ]
                          │
           ┌──────────────┴──────────────┐
           ▼                             ▼
   [ Action: Approve ]           [ Action: Reject ]
   Assign PricingTier            Provide Reason
   Role = `wholesale_approved`   Role = `retail`
   Email Notification Sent       Email Notification Sent
```

---

## 8. Application User Journeys

### 1. B2C Retail Flow
1. Visitor browses catalog at standard MSRP.
2. Selects quantity; if close to a bulk tier threshold ($\le 3$ items), receives a dynamic unlock banner.
3. Adds items to cart (stored via secure HTTP-only session cookie for guests or in DB for logged-in users).
4. Enters shipping address; system computes GST and weight-based courier charges.
5. Completes checkout via Razorpay popup.
6. Order placed; GST invoice auto-generated.

### 2. B2B Wholesale Flow
1. Partner fills out wholesale application with valid GSTIN.
2. Admin reviews business credentials and assigns a pricing tier.
3. Upon approval, partner logs in and immediately sees discounted volume tier tables on product pages.
4. Partner either buys directly at locked tier prices or clicks **Request Formal Quote**.
5. System generates an official quote (DW-QT-2026-XXXX) downloadable as a PDF.
6. Partner converts approved quote to an order in 1 click.

---

## 9. API Route Directory & Endpoints

| Route Endpoint | Method | Role Access | Description |
|---|---|---|---|
| `/api/cart` | `GET`, `POST`, `DELETE` | Public / All | Get, add, or clear items in current cart session |
| `/api/checkout` | `POST` | Public / All | Validate cart, resolve server prices, create Razorpay order |
| `/api/payment/callback` | `POST` | Server Webhook | Verify HMAC payment signature and mutate order state |
| `/api/wholesale/apply` | `POST` | Authenticated | Submit B2B wholesale application & GSTIN |
| `/api/quotes` | `GET`, `POST` | B2B Approved | Request instant quote or generate formal B2B PDF quote |
| `/api/admin/applications` | `GET`, `PATCH` | Admin Only | Review, approve, or reject pending B2B accounts |
| `/api/admin/orders` | `GET`, `PATCH` | Admin Only | Update order fulfillment status and re-issue invoices |

---

## 10. Design System & Aesthetics

DigitalWorld incorporates a high-visibility **"Safety Alert"** design theme tailored for industrial hardware and safety equipment:

| Token Name | Color Hex Code | Usage |
|---|---|---|
| **Primary Red** | `#B32418` | Primary CTA buttons, brand badges, headers |
| **Charcoal Dark** | `#2B2B2E` | Text primary, navbar background, footer |
| **Amber Warning** | `#F2A93B` | Wholesale highlights, tier unlock nudges, pending badges |
| **Light Canvas** | `#F9FAFB` | Background canvas, secondary cards |
| **Border Gray** | `#E5E7EB` | Dividers, spec tables, input outlines |

---

## 11. Environment Setup & Installation Guide

### Prerequisites
- **Node.js:** v18.x or v20.x
- **PostgreSQL:** v15+ database server
- **npm** or **yarn**

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env` and `.env.local`:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digitalworld?schema=public"

# Auth.js Secrets
AUTH_SECRET="generate-a-32-character-secret-key-here"
AUTH_URL="http://localhost:3000"

# Razorpay Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YourTestKeyId"
RAZORPAY_KEY_SECRET="YourRazorpaySecretKey"

# Business Information (For Invoices)
BUSINESS_NAME="DigitalWorld Industrial Safety Solutions"
BUSINESS_GSTIN="07AAAAA0000A1Z5"
BUSINESS_STATE="Delhi"
```

### 3. Initialize Database & Run Server
```bash
# Push schema to database
npm run db:push

# Seed products and pricing tiers
npm run db:seed

# Start Next.js development server
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 12. Database Seeding & Operations

The repository includes a TypeScript database seeder located at [`prisma/seed.ts`](file:///Users/akshar/Desktop/DIGITALWORLD/digitalworld-app/prisma/seed.ts). It pre-configures:

1. **Standard Categories:** (Fire Suppression, Industrial Safety, Electrical Safety).
2. **Standard Volume Pricing Tiers:**
   - 1–9 units (Retail Base)
   - 10–49 units
   - 50–99 units
   - 100–499 units
   - 500–999 units
   - 1000–4999 units
   - 5000+ units
3. **Demo Admin Account:** `admin@digitalworld.in` (password: `admin123`).

To trigger database re-seeding:
```bash
npm run db:seed
```

---

## 13. Testing & Quality Assurance

```bash
# Run unit & logic tests (Vitest)
npm run test

# Run type check across Next.js app
npm run typecheck

# Run Playwright E2E checkout suite
npx playwright test
```

---

## 14. Future Roadmap

- [ ] **Shiprocket Logistics API Integration:** Real-time pincode serviceability and automated tracking updates.
- [ ] **Automated PDF Storage (Cloudflare R2):** Auto-upload generated GST invoices and quotations to S3-compatible object storage.
- [ ] **ERP / Tally Synchronization:** Two-way sync for stock availability and financial accounting.
- [ ] **Multi-Warehouse Routing:** Automatic order split based on stock location and buyer proximity.

---

<p center>
  <b>DigitalWorld Architecture & Implementation Specification</b> • Crafted for Scalable Industrial E-Commerce
</p>
