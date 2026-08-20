# DigitalWorld — Frontend Architecture & UI Component Suite

This directory contains the entire **Frontend Presentation Layer**, UI components, animation systems, design tokens, and client interactions for DigitalWorld.

---

## 📂 Directory Structure

```text
frontend/
├── components/           # Modular React components
│   ├── account/          # Customer account management & order history UI
│   ├── admin/            # Admin order tables, dispatch modals & courier selection
│   ├── catalog/          # Product catalog, volume tiers & comparison cards
│   ├── home/             # HeroSection, LiveEstimator, ProblemRisk, HowItWorks, TrustStrip
│   ├── invoice/          # Print-ready GST Tax Invoice rendering
│   ├── layout/           # Sticky Navbar, Footer, Mobile BottomSheet navigation
│   ├── quotation/        # Instant B2B PDF Quotation Generator & Preview
│   ├── shipping/         # ShipmentTrackerCard & live milestone tracking timeline
│   ├── site/             # ProductCard, Reveal, Navigation helpers
│   └── ui/               # Atomic components (MagneticButton, CustomCursor, AnimatedCounter, PincodeInput)
└── styles/               # Global CSS, Tailwind styling tokens & keyframes
```

---

## 🎨 UI/UX Features & Capabilities

- **Framer Motion Micro-Interactions:** Smooth scroll storytelling, number counters, magnetic CTA buttons, and custom cursor animations.
- **Glassmorphism Design System:** Tailored dark/light theme tokens, subtle translucent borders, and backdrop blurs.
- **Dynamic Pricing Calculator:** Real-time quantity slider with instant tier unlock hints and projected savings.
- **Instant Quotation Builder:** 5-step wizard generating download-ready PDF quotations with dynamic QR codes.
- **Live Milestone Tracker:** 11-step visual shipping progression with carrier badges and AWB direct tracking links.
