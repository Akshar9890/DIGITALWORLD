# DigitalWorld
### Industrial Fire Protection • B2B & B2C Commerce

Modern commerce infrastructure for industrial fire suppression and electrical safety products.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2340?style=flat-square&logo=razorpay)](https://razorpay.com/)
[![Shiprocket](https://img.shields.io/badge/Shiprocket-Logistics_API-7952B3?style=flat-square)](https://shiprocket.in/)

---

<p align="center">
  <img src="./public/images/database-erd-shipment-flow.png" alt="DigitalWorld Commerce Architecture & Database ERD" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

---

## 📌 Overview

**DigitalWorld** is a full-stack commerce platform engineered specifically for industrial fire protection technology (e.g., Heat Aerosol Fire Extinguishing Devices `QRR0.01G/S` and `QRRO-10`). It unifies single-unit retail purchases with tiered wholesale volume pricing, automated PDF quotation generation, GST-compliant invoicing, and multi-carrier live order tracking.

### 🛍️ For Retail Customers
- Browse certified fire suppression products and technical datasheets
- Interactive quantity estimator with real-time volume tier discounts
- Instant checkout with automated intra/inter-state GST calculation (CGST+SGST vs IGST)
- Secure payments via UPI, Cards, and Netbanking (Razorpay)
- Live milestone order tracking

### 🏢 For Business Customers (B2B)
- Dedicated B2B wholesale onboarding with GSTIN verification
- Company-specific volume tier pricing unlocked upon approval
- Instant automated formal PDF Quotation generation with HSN breakdown
- Downloadable GST tax invoices with Amount-in-Words legal compliance
- Dedicated dispatch and multi-carrier fulfillment tracking

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Product Catalog** | High-resolution product specifications, CAD specs, and technical PDF datasheets |
| **Server-Side Pricing** | Single source of truth volume pricing engine preventing client-side cart tampering |
| **Instant Quote Builder** | Generate print-ready and downloadable PDF quotations with dynamic QR validation |
| **Indian GST Engine** | Automatic 18% GST split into CGST (9%) + SGST (9%) or IGST (18%) by state matching |
| **Online Payments** | Razorpay integration with timing-safe HMAC SHA-256 signature verification |
| **Multi-Carrier Logistics** | Shiprocket and Delhivery API integrations with 19-state lifecycle normalization |
| **Admin Dispatch Center** | Compare live courier rates or assign manual courier dispatches with AWB numbers |
| **Public Order Tracker** | Secure `/track-order` lookup with customer phone/email data masking |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, React Server Components)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

### Backend & Database
- **Runtime:** Node.js 18+ / 20+
- **ORM:** [Prisma ORM 6](https://www.prisma.io/)
- **Database:** [PostgreSQL 15+](https://www.postgresql.org/)
- **Authentication:** [NextAuth.js (Auth.js v5)](https://authjs.dev/)

### Integrations & Services
- **Payments:** [Razorpay](https://razorpay.com/) (Standard Checkout & Webhooks)
- **Logistics:** [Shiprocket API v2](https://shiprocket.in/) & Delhivery Direct
- **Transactional Email:** [Resend API](https://resend.com/)
- **Document Generation:** [@react-pdf/renderer](https://react-pdf.org/)

---

## 🏗️ System Architecture

```text
DigitalWorld Commerce
│
├── 🌐 Presentation Tier
│   ├── Storefront (SSR / React Server Components)
│   ├── B2B Wholesale Portal (KYC & Quotations)
│   └── Admin Fulfillment Dashboard
│
├── ⚡ Application Core (Next.js 14 App Router)
│   ├── Dynamic Price Engine (lib/pricing.ts)
│   ├── GST Tax Engine (lib/tax.ts)
│   ├── Shipping Brokerage (lib/shipping/)
│   └── Auth & RBAC Security (auth.ts)
│
└── ☁️ Infrastructure & Services
    ├── PostgreSQL (Prisma ORM Data Persistence)
    ├── Razorpay (Payment Processing & Webhooks)
    ├── Shiprocket (Pan-India Multi-Carrier Logistics)
    └── Resend (Order Confirmation & Invoicing Emails)
```

---

## 📂 Project Structure & Architecture Mapping

DigitalWorld is organized as a unified full-stack Next.js application with clean separation between **Frontend (UI/UX & Client Logic)** and **Backend (API Handlers, Algorithms & Persistence)**:

```text
digitalworld-app/
│
├── 🎨 FRONTEND ARCHITECTURE (Storefront, UI & Client Interactions)
│   ├── app/                              # Next.js Server & Client Page Routes
│   │   ├── (auth)/                       # Customer & B2B Login / Register UI
│   │   ├── (admin)/admin/                # Admin Panel Interface & Dispatch Modals
│   │   ├── account/                      # Customer Portal (Orders, Tracking, Settings)
│   │   ├── cart/                         # Interactive Shopping Cart with live tier updates
│   │   ├── catalog/                      # Product Catalog & Technical Specification UI
│   │   ├── checkout/                     # Multi-step Checkout Flow & Razorpay Modal
│   │   ├── quotation/                    # Instant B2B PDF Quotation Generator
│   │   └── track-order/                  # Public Milestone Timeline Tracker
│   ├── components/                       # Modular React Presentation Components
│   │   ├── admin/                        # Order tables, status badges, dispatch modal
│   │   ├── home/                         # HeroSection, LiveEstimator, Specs, TrustStrip
│   │   ├── layout/                       # Sticky Navbar, Footer, Mobile Navigation
│   │   ├── shipping/                     # ShipmentTrackerCard, DeliveryTimeline
│   │   └── ui/                           # CustomCursor, MagneticButton, AnimatedCounters
│   └── styles/                           # Global Tailwind CSS & animation tokens
│
├── ⚙️ BACKEND ARCHITECTURE (Business Logic, APIs, Security & Database)
│   ├── app/api/                          # Secure Serverless Route Handlers
│   │   ├── admin/                        # Orders, Shipments & Manual Courier Dispatch
│   │   ├── checkout/                     # Server price validation & order generation
│   │   ├── payment/verify/               # Cryptographic HMAC SHA-256 capture
│   │   ├── shipments/                    # Live courier rates & tracking service
│   │   └── webhooks/                     # Authoritative Razorpay & Shiprocket Webhooks
│   ├── lib/                              # Domain Logic & Server Engines
│   │   ├── db.ts                         # Prisma Client Database Singleton
│   │   ├── pricing.ts                    # Dual-Persona Server Price Resolution Engine
│   │   ├── tax.ts                        # Unified Indian GST Tax Matrix (CGST/SGST/IGST)
│   │   ├── shipping/                     # Multi-carrier Registry & 19-state FSM
│   │   └── email.ts                      # Resend Transactional Order Email Templates
│   ├── prisma/                           # PostgreSQL Schema & Seed Data Engine
│   │   ├── schema.prisma                 # Database Models (Orders, Shipments, Tiers)
│   │   └── seed.ts                       # Seeder for Catalog, Categories & Rules
│   └── auth.ts                           # NextAuth.js / Auth.js Session & RBAC Engine
│
└── 📚 DOCUMENTATION & CONFIGURATION
    ├── docs/                             # Deep-dive engineering specifications
    ├── public/                           # Static assets, product imagery, diagrams
    └── DESIGN.md                         # Official UI/UX Design System Guidelines
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Akshar9890/DIGITALWORLD.git
cd DIGITALWORLD/digitalworld-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/digitalworld?schema=public"
AUTH_SECRET="generate-a-32-character-secret-key"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YourKeyId"
RAZORPAY_KEY_SECRET="YourRazorpaySecret"
RAZORPAY_WEBHOOK_SECRET="YourWebhookSecret"
SHIPROCKET_EMAIL="your-email@domain.com"
SHIPROCKET_PASSWORD="your-password"
ADMIN_EMAIL="admin@digitalworld.com"
ADMIN_INITIAL_PASSWORD="YourSecureAdminPassword"
```

### 4. Initialize database
```bash
# Push schema to PostgreSQL
npx prisma db push

# Seed categories, products, volume tiers, and admin account
npm run db:seed
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Pricing Integrity

- **Server-Authoritative Pricing:** The client never controls prices, tiers, or GST calculations. All totals are recomputed server-side during checkout.
- **Cryptographic Signature Verification:** Razorpay payment webhooks and callbacks use timing-safe HMAC SHA-256 validation (`crypto.timingSafeEqual`).
- **Role-Based Access Control (RBAC):** Admin routes (`/admin/*`) and sensitive APIs are guarded by session authentication and role verification.
- **Zero Exposed Secrets:** All credentials, keys, and webhook secrets are kept strictly in environment variables.

---

## 📚 Deep-Dive Technical Documentation

Detailed architectural and engineering documentation is maintained in the [`docs/`](./docs) directory:

- 🏛️ **[System Architecture & Data Flow](./docs/ARCHITECTURE.md)** — 3D isometric architecture and reactive sequence flow.
- 🗄️ **[Database Models & ERD](./docs/DATABASE.md)** — Relational entity schema, keys, and Prisma models.
- 🧮 **[Pricing & Tax Engine](./docs/PRICING.md)** — Dynamic quantity tier matching, unlock hints, and GST splitting.
- 💳 **[Payments & Checkout](./docs/PAYMENTS.md)** — Razorpay integration, HMAC verification, and idempotency.
- 🚚 **[Logistics & Shipping](./docs/SHIPPING.md)** — Multi-carrier registry, volumetric weight, and 19-state lifecycle.
- 🛡️ **[Security & KYC](./docs/SECURITY.md)** — RBAC, timing-attack protection, and B2B verification workflows.

---

## 🗺️ Roadmap

- [x] Server-authoritative quantity-tier pricing engine
- [x] Instant B2B PDF quotation generator with HSN breakdown
- [x] Unified Indian GST tax calculation (CGST/SGST vs IGST)
- [x] Razorpay online checkout with HMAC signature verification
- [x] Shiprocket & Delhivery multi-carrier courier integration
- [x] Public live order tracking timeline (`/track-order`)
- [ ] Automated SMS / WhatsApp milestone dispatch notifications
- [ ] Enterprise ERP integration (Tally / SAP webhook connectors)

---

## 📄 License

Private & Proprietary • © DigitalWorld Industrial Fire Tech. All Rights Reserved.
