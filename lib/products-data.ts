export type PriceTier = { min: number; max: number | null; price: number; label: string };

export type Product = {
  id?: string;
  slug: string;
  name: string;
  model: string;
  tagline: string;
  description: string;
  hsn: string;
  mrp: number;
  basePrice: number;
  images: { src: string; alt: string }[];
  specs: { label: string; value: string }[];
  highlights: string[];
  tiers: PriceTier[];
};

export const media = {
  heroSpray: "/images/products/heat-aerosol-1.jpg",
  fireDemo: "/images/products/heat-aerosol-5.jpg",
  install: "/images/products/heat-aerosol-4.jpg",
  dimensions: "/images/products/heat-aerosol-2.jpg",
  dualNozzle: "/images/products/heat-aerosol-6.jpg",
  panel: "/images/products/heat-aerosol-7.jpg",
  pack5: "/images/products/heat-aerosol-8.jpg",
};

const makeTiers = (base: number): PriceTier[] => [
  { min: 1, max: 9, price: base, label: "Retail" },
  { min: 10, max: 49, price: Math.round(base * 0.92), label: "Trade" },
  { min: 50, max: 99, price: Math.round(base * 0.85), label: "Dealer" },
  { min: 100, max: 499, price: Math.round(base * 0.78), label: "Distributor" },
  { min: 500, max: null, price: Math.round(base * 0.7), label: "OEM" },
];

export const products: Product[] = [
  {
    slug: "qrr-001g-s",
    name: "Heat Aerosol Fire Extinguishing Device",
    model: "QRR0.01G/S",
    tagline: "Dual-nozzle micro suppression for electrical panels",
    description:
      "A compact, fully autonomous aerosol suppression unit engineered for distribution boards, control cabinets and battery enclosures. Triggers automatically at open flame or 170°C — no power, no wiring, no maintenance.",
    hsn: "84241000",
    mrp: 2450,
    basePrice: 1890,
    images: [
      { src: media.heroSpray, alt: "QRR0.01G/S releasing residue-free aerosol inside a cabinet" },
      { src: media.dualNozzle, alt: "Dual-nozzle discharge detail of the QRR0.01G/S device" },
      { src: media.dimensions, alt: "Product dimensions of the QRR0.01G/S device" },
      { src: media.install, alt: "DIN rail and 3M adhesive mounting options" },
    ],
    specs: [
      { label: "Model", value: "QRR0.01G/S" },
      { label: "Operating temperature", value: "-50°C to +90°C" },
      { label: "Service life", value: "10 years" },
      { label: "Extinguishing density", value: "100 g/m³" },
      { label: "Casing surface temp.", value: "≤ 200°C" },
      { label: "Thermal clearance", value: "0.3 m ≤ 75°C · 0.12 m ≤ 200°C" },
      { label: "Oxidiser content", value: "Sr(NO₃) 60% / KNO₃ 20%" },
      { label: "Compliance", value: "EN 15276-1:2019, EN 15276-2:2019" },
      { label: "Dimensions", value: "3.03 in × 2.44 in × 0.75 in" },
      { label: "Activation", value: "Open flame or ≥ 170°C" },
    ],
    highlights: [
      "Dual nozzle, 360° aerosol dispersion",
      "Colourless, odourless, residue-free discharge",
      "DIN rail clip + 3M VHB adhesive in the box",
      "Zero electricity, zero wiring, zero maintenance",
    ],
    tiers: makeTiers(1890),
  },
  {
    slug: "qrro-10",
    name: "Heat Aerosol Device — Wired Probe",
    model: "QRRO-10",
    tagline: "Probe-lead suppression for tight enclosures",
    description:
      "The wired-probe variant places two thermal sensing leads exactly where heat originates — ideal for busbars, MCB banks and dense panels where the body cannot sit next to the risk.",
    hsn: "84241000",
    mrp: 2890,
    basePrice: 2240,
    images: [
      { src: media.fireDemo, alt: "QRRO-10 suppressing a breaker fire with aerosol jet" },
      { src: media.panel, alt: "Device installed inside an industrial control panel" },
      { src: media.pack5, alt: "Five-pack of wired probe aerosol devices" },
    ],
    specs: [
      { label: "Model", value: "QRRO-10" },
      { label: "Protection space", value: "0.1 m³ · volume ≥ 60 g/m³" },
      { label: "Service life", value: "10 years" },
      { label: "Operating temperature", value: "-20°C to +90°C" },
      { label: "Relative humidity", value: "≤ 95%" },
      { label: "Extinction rate", value: "≥ 95%" },
      { label: "Standards", value: "GA499.1-2010, CE, RoHS, ISO 9001, ISO 14001" },
      { label: "Probe wire length", value: "5.12 in" },
    ],
    highlights: [
      "Twin thermal probe leads for pinpoint sensing",
      "Fits behind busbars and dense MCB rows",
      "Sold singly or in 5-unit contractor packs",
      "Non-conductive, safe on live equipment",
    ],
    tiers: makeTiers(2240),
  },
];

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug || slug.includes(p.slug) || (slug.includes("heat-aerosol") && p.slug === "qrr-001g-s"));

export const priceForQty = (p: Product, qty: number) =>
  p.tiers.find((t) => qty >= t.min && (t.max === null || qty <= t.max)) ?? p.tiers[0];

export const nextTierHint = (p: Product, qty: number) => {
  const next = p.tiers.find((t) => t.min > qty);
  if (!next) return null;
  return { need: next.min - qty, price: next.price, label: next.label };
};

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const GST_RATE = 0.18;
