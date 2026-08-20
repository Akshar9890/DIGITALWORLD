# DigitalWorld — Backend Architecture & Core Services

This directory contains the **Backend Business Logic**, database models, pricing & tax engines, multi-carrier courier brokerage, and transactional integrations.

---

## 📂 Directory Structure

```text
backend/
├── lib/                  # Authoritative domain engines & services
│   ├── db.ts             # Prisma Client PostgreSQL database singleton
│   ├── email.ts          # Resend transactional order & quotation email dispatcher
│   ├── pricing.ts        # Dual-Persona Server Price Resolution Engine (resolvePrice)
│   ├── tax.ts            # Unified Indian GST Tax Matrix (CGST/SGST/IGST & amountToWords)
│   ├── shipping.ts       # Courier charge calculation logic
│   ├── shipping/         # Multi-carrier logistics provider abstraction
│   │   ├── registry.ts          # Dynamic ShippingRegistry provider factory
│   │   ├── types.ts             # CourierOption, ShipmentStatus, TrackingEventData
│   │   ├── status-normalizer.ts # 19/20-state standardized lifecycle state machine
│   │   ├── manual.provider.ts   # Offline / Manual courier dispatch provider
│   │   ├── shiprocket.provider.ts # Shiprocket v2 API integration
│   │   └── delhivery.provider.ts  # Delhivery direct API integration
│   └── utils.ts          # Currency, date formatters, and classnames helper
└── prisma/               # Database persistence & migrations
    ├── schema.prisma     # PostgreSQL data models (Order, Shipment, TrackingEvent, PriceTier)
    └── seed.ts           # Seeder script for initial catalog, volume tiers & admin account
```

---

## ⚙️ Core Engines & Responsibilities

1. **Pricing Engine (`lib/pricing.ts`):** Matches order quantities to volume tiers and enforces B2B company-specific wholesale pricing overrides.
2. **GST Tax Engine (`lib/tax.ts`):** Calculates 18% GST partitioned dynamically by seller and buyer state (Intra-state CGST 9% + SGST 9% vs Inter-state IGST 18%).
3. **Logistics Registry (`lib/shipping/`):** Evaluates volumetric weight, fetches live rates across Shiprocket & Delhivery, and normalizes carrier webhook events into 19 standardized states.
4. **Data Persistence (`prisma/`):** Strict relational schemas with cascade triggers, unique AWB constraints, and indexes.
