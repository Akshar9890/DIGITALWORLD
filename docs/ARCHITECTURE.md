# DigitalWorld — System Architecture & Data Flow

DigitalWorld is built on a decoupled, high-performance architecture powered by Next.js 14 App Router, TypeScript, Prisma ORM, and resilient cloud integration brokers.

---

## 1. 3D Layered Isometric Architecture

```text
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
                           │     /    │ Engine       │   │  GST Matrix      │  /   │
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

---

## 2. End-to-End Reactive Data Flow

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

## 3. Core Architectural Principles

1. **Server-Side Authority:** The client browser never dictates prices, tax breakdowns, or grand totals. Every checkout and quotation is verified on the server against active database rules.
2. **Decoupled Monolith:** Business logic is organized in pure TypeScript modules (`lib/pricing.ts`, `lib/tax.ts`, `lib/shipping/`) with zero coupling to React rendering layers.
3. **Pluggable Logistics:** The shipping abstraction layer allows seamless addition of new courier APIs without changing checkout or tracking controllers.
