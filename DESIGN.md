# DigitalWorld — Design System & UI/UX Architecture

> **Industrial Fire Tech Aesthetics • High-Conversion B2B/B2C Safety Commerce**

This document establishes the official design system, visual identity, interaction guidelines, and component specifications for the **DigitalWorld** web platform.

---

## 📑 Table of Contents

1. [Design Philosophy & Brand Identity](#1-design-philosophy--brand-identity)
2. [Color Palette & Token System](#2-color-palette--token-system)
3. [Typography Hierarchy](#3-typography-hierarchy)
4. [Grid, Spacing & Layout Architecture](#4-grid-spacing--layout-architecture)
5. [Interactive Motion & Micro-Animations](#5-interactive-motion--micro-animations)
6. [Component Library & Specifications](#6-component-library--specifications)
   - [Navbar & Header System](#61-navbar--header-system)
   - [Bento Grid Cards](#62-bento-grid-cards)
   - [Live Volume Pricing Estimator](#63-live-volume-pricing-estimator)
   - [Shipment Tracker Timeline Card](#64-shipment-tracker-timeline-card)
   - [Admin Dispatch & Logistics Modals](#65-admin-dispatch--logistics-modals)
   - [Form Controls & Data Tables](#66-form-controls--data-tables)
7. [Print & PDF Document Aesthetics](#7-print--pdf-document-aesthetics)
8. [Accessibility (a11y) & Dark Mode Standards](#8-accessibility-a11y--dark-mode-standards)

---

## 1. Design Philosophy & Brand Identity

DigitalWorld sells mission-critical fire safety suppression devices (`QRR0.01G/S` and `QRRO-10`) used in electrical panels, control cabinets, and battery enclosures. The visual design reflects **extreme industrial reliability, engineering precision, and modern safety technology**.

### Core Tenets:
- **Obsidian Dark Foundation:** Deep industrial dark palette (`#121413`, `#18191b`) reduces eye fatigue in operations and gives physical hardware an authoritative, high-tech presence.
- **Safety Signal Accents:** Vivid Fire Suppression Crimson (`#B32418` / `#dc2626`) and Safety Amber (`#F2A93B`) draw immediate attention to critical actions, active tiers, and fire alerts.
- **Engineering Precision:** Clean monospace data tags, technical specifications with crisp border strokes (`border-outline-variant/30`), and glassmorphic elevation.
- **Fluid & Tactile Micro-Interactions:** Magnetic cursor tracking, spring physics buttons, and real-time counter interpolations.

---

## 2. Color Palette & Token System

DigitalWorld uses Tailwind CSS with CSS variable bindings for seamless tokenization:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DIGITALWORLD COLOR PALETTE                      │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│ Surface Base    │ Charcoal Surface │ Safety Crimson  │ Warning Amber   │
│ #121413         │ #1c1e22          │ #B32418         │ #F2A93B         │
│ (Main Canvas)   │ (Bento Cards)    │ (Primary CTA)   │ (Tier Badges)   │
├─────────────────┼──────────────────┼─────────────────┼─────────────────┤
│ Slate Gray      │ Pure White       │ Success Emerald │ Border Outline  │
│ #94A3B8         │ #FFFFFF          │ #10B981         │ rgba(255,255,255│
│ (Muted Labels)  │ (Headings)       │ (Delivered/OK)  │ , 0.12)         │
└─────────────────┴──────────────────┴─────────────────┴─────────────────┘
```

### Color Tokens

| Token Name | Class / Variable | Hex Code | Role / Usage |
|---|---|---|---|
| **Background** | `bg-background` | `#121413` | Root canvas background |
| **Surface Charcoal** | `bg-surface-charcoal` | `#1c1e22` | Cards, modal sheets, tables |
| **Surface Container High**| `bg-surface-container-high` | `#25272c` | Interactive hovers, elevated containers |
| **Primary Container** | `bg-primary-container` | `#B32418` | Primary CTA buttons, shield badge |
| **Primary Red Accent** | `text-primary` | `#dc2626` | Flame icons, ping indicators, highlight text |
| **Tertiary / Amber** | `text-tertiary` | `#F2A93B` | Wholesale tags, pricing tier badges, shipping alerts |
| **Success Emerald** | `text-status-success` | `#10B981` | Delivered status, online live badges, stock availability |
| **Error Coral** | `text-status-error` | `#EF4444` | Out of stock, payment failure, RTO status |
| **Slate Gray** | `text-slate-gray` | `#94A3B8` | Subtitles, helper text, technical metadata |
| **Outline Variant** | `border-outline-variant`| `rgba(255,255,255,0.15)` | Subtle technical dividing borders |

---

## 3. Typography Hierarchy

The typographic system utilizes **Outfit** (Primary UI & Display), **Space Grotesk** (Engineering & Numbers), and **JetBrains Mono** (HSN codes, order IDs, AWB tracking numbers).

```
Headline LG (Hero Display)  ─── 48px / 56px  Bold (Tracking -0.02em)
Headline MD (Section Title) ─── 32px / 40px  Bold (Tracking -0.01em)
Headline SM (Card Title)    ─── 20px / 28px  SemiBold
Body Technical / Code       ─── 13px / 18px  Monospace (Uppercase tracking 0.1em)
Body Regular                ─── 15px / 24px  Regular text
Label Caps (Badges/Tags)    ─── 11px / 14px  Heavy Caps (Tracking 0.18em)
```

---

## 4. Grid, Spacing & Layout Architecture

- **Page Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (1280px max-width container).
- **Section Vertical Rhythm:** `py-16 lg:py-24` on major sections; `gap-6` or `gap-8` on bento grids.
- **Bento Grid Ratios:** 12-column flexible grid system (`lg:col-span-8` main display + `lg:col-span-4` sidebar specifications).
- **Border Radii:**
  - Badges & Pills: `rounded-full` (9999px)
  - Cards & Bentos: `rounded-2xl` (16px)
  - Controls & Buttons: `rounded-xl` (12px)
  - Modals & Drawers: `rounded-3xl` (24px)

---

## 5. Interactive Motion & Micro-Animations

DigitalWorld utilizes **Framer Motion** for all interactive components:

1. **Custom Magnetic Cursor:** Attracts subtly toward primary CTA buttons and links with smooth spring damping (`stiffness: 400, damping: 25`).
2. **Scroll-Driven Reveal (`ScrollReveal`):** Elements fade and translate upward (`y: 20 -> 0`, `opacity: 0 -> 1`) on viewport intersection.
3. **Live Number Interpolation (`AnimatedCounter`):** Pricing totals and unit discounts interpolate smoothly over 350ms during quantity adjustments.
4. **Cart Badge Pulse:** Scale animation `[1, 1.35, 1]` upon adding items to cart.
5. **Timeline Node Pulsing:** Active delivery milestone nodes pulse with an emerald or amber ring.

---

## 6. Component Library & Specifications

### 6.1 Navbar & Header System
- **Two-tier layout:**
  - **Utility Top Bar:** Quick contact links (`+91 70436 33303`, `digitalworld9890@gmail.com`) and compliance banner (`18% GST Invoice Included`).
  - **Main Navigation Bar:** Streamlined 5 primary links (**Catalog**, **Applications**, **How It Works**, **Specifications**, **Track Order**) with generous spacing (`gap-8`), Search, Cart counter badge, Profile dropdown, and `[ GET QUOTATION ]` magnetic CTA.
- **Scroll Transition:** Transparent background on top of page transitioning into glassmorphic `bg-surface-charcoal/95 backdrop-blur-xl shadow-2xl` upon scrolling > 20px.

### 6.2 Bento Grid Cards (`.bento-card`)
- Built with `bg-surface-charcoal/80 border border-outline-variant/30 rounded-2xl p-6 lg:p-8 backdrop-blur-md`.
- Features subtle radial gradient hover glow (`group-hover:border-primary-container/40`).

### 6.3 Live Volume Pricing Estimator
- Displays real-time quantity discount tiers (1–9, 10–49, 50–99, 100–499, 500+ units).
- Active tier highlighted with a luminous golden amber border (`border-tertiary shadow-lg`).
- Interactive Stepper (`-` and `+`) with rapid continuous increment and instant price calculation.

### 6.4 Shipment Tracker Timeline Card (`ShipmentTrackerCard`)
- Visual chronological tracking progress bar with 5 standardized milestone steps:
  1. **Order Confirmed** (`ORDER_PLACED` / `PAYMENT_CONFIRMED`)
  2. **Packed & Ready** (`PACKED` / `SHIPMENT_CREATED`)
  3. **In Transit** (`PICKED_UP` / `IN_TRANSIT`)
  4. **Out for Delivery** (`OUT_FOR_DELIVERY`)
  5. **Delivered** (`DELIVERED`)
- Displays Courier Badge (Shiprocket, Delhivery, Blue Dart, DTDC), AWB tracking number with 1-click copy, and estimated delivery dates.

### 6.5 Admin Dispatch & Logistics Modals (`DispatchModal`)
- Dual mode interface:
  - **Live Courier Comparison:** Instant freight rate fetch from Shiprocket & Delhivery sorted by price and delivery speed.
  - **Manual Courier Entry:** Admin inputs offline courier name, AWB tracking number, and tracking URL for local transport or self-dispatch.

### 6.6 Form Controls & Data Tables
- Inputs feature dark slate fill (`bg-surface-container`), focus ring (`focus:border-tertiary focus:ring-1 focus:ring-tertiary`), and clear labels.
- Data tables use alternate zebra row highlighting, sticky headers, and responsive horizontal scrolling wrappers.

---

## 7. Print & PDF Document Aesthetics

Invoices (`/orders/[orderId]/invoice`) and Quotations (`/quotation/[id]`):
- **Clean White Industrial Canvas:** Optimized for standard A4 physical printing (`@media print { body { background: #ffffff; color: #000000; } }`).
- **Official GST Header:** Seller GSTIN, PAN, HSN Breakdown table (CGST 9% + SGST 9% or IGST 18%), and Indian Rupee Amount-in-Words (`amountToWords`).
- **Digital Authenticity Stamp:** Includes QR code for online invoice verification and authorized signature blocks.

---

## 8. Accessibility (a11y) & Dark Mode Standards

- **Color Contrast:** All text tokens adhere to WCAG 2.1 AA contrast requirements (minimum 4.5:1 for body copy and 3:1 for large headers against `#121413`).
- **Keyboard Navigability:** Full tab index support across quantity selectors, image carousels, and dialog modals with visible focus rings.
- **Accessible ARIA States:** Modals and dropdowns feature `aria-expanded`, `aria-haspopup`, and `role="dialog"` attributes.

---

*DigitalWorld Design System • Engineered by Google DeepMind Antigravity*
