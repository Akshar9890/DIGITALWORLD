"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  getPriceForQuantity,
  getNextTierHint,
  getStandardPrice,
  TierDisplay,
  PriceResult,
} from "@/lib/pricing";
import { formatINR } from "@/lib/utils";
import {
  Shield,
  Zap,
  Minus,
  Plus,
  ShoppingCart,
  FileText,
  CheckCircle2,
  MessageCircle,
  MapPin,
  Flame,
  Scale,
  Download,
  ShieldCheck,
  Cpu,
  BatteryCharging,
  Server,
  Factory,
  ArrowRight,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import type { Product, Review, UserRole, Category } from "@prisma/client";

type ProductWithDetails = Product & {
  category: Category;
  reviews: (Review & { user: { name: string | null; image: string | null } })[];
};

interface Props {
  product: ProductWithDetails;
  tierTable: TierDisplay[];
  initialPrice: PriceResult;
  role: UserRole;
}

export function ProductDetailsClient({ product, tierTable, initialPrice, role }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "applications" | "documents" | "reviews">("specs");

  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{ delivering: boolean; msg: string } | null>(null);
  const [cartState, setCartState] = useState<"idle" | "adding" | "added">("idle");

  // Mini Sizing Calculator State
  const [panelLength, setPanelLength] = useState(800);
  const [panelWidth, setPanelWidth] = useState(600);
  const [panelHeight, setPanelHeight] = useState(300);

  const calculatedM3 = Number(((panelLength / 1000) * (panelWidth / 1000) * (panelHeight / 1000)).toFixed(3));
  const recommendedCount = Math.max(1, Math.ceil(calculatedM3 / 0.1));

  // Shared pricing engine
  const activeTier = getPriceForQuantity(tierTable, quantity);
  const displayPrice = activeTier ? activeTier.pricePerUnit : initialPrice.unitPrice;
  const subtotal = displayPrice * quantity;
  const standardPrice = getStandardPrice(tierTable) ?? initialPrice.unitPrice;
  const hasDiscount = displayPrice < standardPrice;
  const nextTierHint = getNextTierHint(tierTable, quantity);

  const isB2B = role === "wholesale_approved" || role === "admin";
  const specs = product.specs as Record<string, { label: string; value: string }>;

  const handleQtyChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleQuantityInput = (value: string) => {
    const nextQuantity = Number.parseInt(value, 10);
    if (Number.isFinite(nextQuantity) && nextQuantity >= 1) {
      setQuantity(nextQuantity);
    }
  };

  const handleAddToCart = async () => {
    setCartState("adding");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      setCartState("added");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }
      router.refresh();
      setTimeout(() => setCartState("idle"), 2500);
    } catch {
      setCartState("idle");
      alert("Could not add to cart. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    setCartState("adding");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }
      router.push("/checkout");
    } catch {
      setCartState("idle");
      alert("Could not proceed to checkout. Please try again.");
    }
  };

  const handleCheckPincode = () => {
    if (pincode.length !== 6) return;
    setPincodeResult({
      delivering: true,
      msg: `Express shipping available to ${pincode} (Delivered within 3–5 business days)`
    });
  };

  const quickSpecItems = [
    { label: "Protection Volume", value: "0.10 m³ (100 Liters)" },
    { label: "Extinguishing Agent", value: "10g Solid Composite" },
    { label: "Activation Trigger", value: "≥ 170°C or Open Flame" },
    { label: "Discharge Time", value: "< 5 Seconds" },
    { label: "Mounting Type", value: "DIN Rail Snap / 3M VHB" },
    { label: "Service Life", value: "10 Years (Zero Pressure)" },
  ];

  const applications = [
    { name: "Electrical Distribution Panels", icon: Zap, desc: "LT/HT panels, switchboards, busbar compartments" },
    { name: "Control & Relay Cabinets", icon: Cpu, desc: "PLC, VFD drives, and automation racks" },
    { name: "Battery Enclosures & UPS", icon: BatteryCharging, desc: "Lithium-ion battery racks, inverter cabinets" },
    { name: "Server & Network Racks", icon: Server, desc: "Edge telecom racks, server cabinets, CCTV NVRs" },
    { name: "Industrial Machinery", icon: Factory, desc: "CNC machines, generator sets, manufacturing tooling" },
  ];

  const technicalDocuments = [
    { title: "Product Technical Datasheet", type: "PDF", size: "1.4 MB", tag: "Datasheet", file: "/documents/digitalworld-datasheet.pdf" },
    { title: "Engineering Installation & Mounting Manual", type: "PDF", size: "2.1 MB", tag: "Manual", file: "/documents/digitalworld-installation-manual.pdf" },
    { title: "Material Safety Data Sheet (MSDS)", type: "PDF", size: "850 KB", tag: "MSDS", file: "/documents/digitalworld-msds.pdf" },
    { title: "EN 15276 / ISO Compliance Certificate", type: "PDF", size: "1.8 MB", tag: "Certificate", file: "/documents/digitalworld-certificate.pdf" },
  ];

  return (
    <div className="w-full bg-[#121413] text-on-surface">
      {/* Breadcrumb Section */}
      <div className="page-container py-6">
        <div className="flex gap-2 text-xs text-slate-gray mb-6 font-body-technical">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-white transition-colors">Catalog</Link>
          <span>/</span>
          <span className="text-tertiary truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Product Gallery & Quick Highlights */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="relative w-full aspect-square rounded-2xl border border-outline-variant/30 bg-surface-charcoal overflow-hidden flex items-center justify-center group shadow-2xl">
              <Image
                src={product.images[selectedImageIndex] || "/images/products/heat-aerosol-1.jpg"}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 rounded-lg bg-surface-charcoal/90 border border-outline-variant/30 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono text-tertiary">
                OFFICIAL INDUSTRIAL SPECIFICATION
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative aspect-square rounded-xl border overflow-hidden transition-all ${
                    selectedImageIndex === i
                      ? "border-tertiary shadow-[0_0_12px_rgba(255,185,86,0.3)] ring-2 ring-tertiary/40"
                      : "border-outline-variant/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Quick Specs Matrix */}
            <div className="bento-card p-6 border-outline-variant/30 bg-surface-container/60 space-y-3">
              <h3 className="font-label-caps text-xs text-slate-gray uppercase tracking-widest flex items-center justify-between">
                <span>QUICK SPECIFICATIONS</span>
                <Link href="/compare" className="text-tertiary hover:underline lowercase font-sans">
                  compare models &rarr;
                </Link>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-body-technical pt-2">
                {quickSpecItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-surface-charcoal border border-outline-variant/20">
                    <span className="text-[10px] text-slate-gray block uppercase font-label-caps">{item.label}</span>
                    <span className="font-mono text-white font-semibold mt-0.5 block">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Quantity & CTAs */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Badges & Model */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge-success text-xs">In Stock</span>
              <span className="badge-info text-xs">10-Year Maintenance Free</span>
              <span className="badge-wholesale text-xs">18% GST Input Credit</span>
            </div>

            <h1 className="font-headline-md text-2xl lg:text-3xl text-white font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-body-technical text-sm text-slate-gray leading-relaxed mb-6">
              {product.shortDesc}
            </p>

            {/* Price Box */}
            <div className="bento-card p-6 border-outline-variant/30 bg-surface-charcoal/90 mb-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-label-caps text-slate-gray block">
                    APPLIED UNIT PRICE ({activeTier?.tierName || "1–9 PCS"})
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    {hasDiscount && (
                      <span className="text-base text-slate-gray line-through">{formatINR(standardPrice)}</span>
                    )}
                    <span className="font-headline-md text-3xl text-white font-bold">
                      {formatINR(displayPrice)}
                    </span>
                    <span className="text-xs text-slate-gray">/ unit (+ 18% GST)</span>
                  </div>
                </div>
                {hasDiscount && (
                  <span className="badge-success text-xs font-bold">
                    Tier Discount Applied
                  </span>
                )}
              </div>

              {/* Subtotal Preview */}
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 flex justify-between text-xs">
                <span className="text-slate-gray">Subtotal ({quantity} pcs):</span>
                <span className="font-mono font-bold text-tertiary">{formatINR(subtotal)} + GST</span>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-label-caps text-slate-gray block">QUANTITY (PCS):</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-control border border-outline-variant/40 bg-surface-container overflow-hidden h-12 w-40">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(quantity - 1)}
                      className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      aria-label="Quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQuantityInput(e.target.value)}
                      className="h-full min-w-0 flex-1 appearance-none bg-transparent text-center text-base font-bold text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyChange(quantity + 1)}
                      className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[5, 10, 25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuantity(amt)}
                        className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
                          quantity === amt
                            ? "border-tertiary bg-tertiary/20 text-tertiary"
                            : "border-outline-variant/30 bg-surface-container text-slate-gray hover:text-white"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {nextTierHint && (
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + nextTierHint.piecesToUnlock)}
                    className="flex items-center gap-1.5 text-xs text-tertiary mt-2 hover:underline text-left"
                  >
                    <Flame size={13} />
                    <span>
                      Add <strong>{nextTierHint.piecesToUnlock} more pcs</strong> to unlock {formatINR(nextTierHint.tier.pricePerUnit)}/unit!
                    </span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartState !== "idle"}
                  className="btn-primary py-3 text-xs tracking-wider gap-2 w-full shadow-lg"
                >
                  <ShoppingCart size={16} />
                  <span>{cartState === "adding" ? "ADDING..." : cartState === "added" ? "ADDED ✓" : "ADD TO CART"}</span>
                </button>

                <Link href={`/quotation?product=${product.slug}&qty=${quantity}`} className="w-full">
                  <button className="btn-secondary py-3 text-xs tracking-wider gap-2 w-full border-tertiary text-tertiary">
                    <FileText size={16} />
                    <span>GET B2B QUOTE</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Pincode Estimate */}
            <div className="bento-card p-4 border-outline-variant/20 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-primary" />
                <span className="font-headline-sm text-xs text-white">Check Pincode Delivery</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit Pincode"
                  className="input-field py-1.5 text-xs"
                />
                <Button variant="secondary" onClick={handleCheckPincode} className="text-xs h-auto py-1.5">
                  Check
                </Button>
              </div>
              {pincodeResult && (
                <p className="mt-2 text-xs text-status-success flex items-center gap-1">
                  <CheckCircle2 size={13} /> {pincodeResult.msg}
                </p>
              )}
            </div>

            {/* WhatsApp Support */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917043633303"}?text=${encodeURIComponent(`Hi DigitalWorld team, I am interested in ${product.name} (Model: ${product.slug}). Can you share bulk quotation details?`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-xs font-bold"
            >
              <MessageCircle size={16} />
              <span>Talk to Engineering Team on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sizing Checker: "Is this right for my application?" */}
      <section className="bg-surface-charcoal border-t border-outline-variant/20 py-12">
        <div className="page-container max-w-6xl">
          <div className="bento-card p-8 border-tertiary/40 bg-surface-container-high/90">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <span className="font-label-caps text-xs text-tertiary tracking-widest uppercase">
                  SIZING VERIFICATION
                </span>
                <h3 className="font-headline-md text-2xl text-white font-bold">
                  Is this unit right for your enclosure?
                </h3>
                <p className="text-body-technical text-xs text-slate-gray leading-relaxed">
                  Enter your panel dimensions below to verify volumetric coverage against the standard 100 g/m³ design density.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-label-caps text-slate-gray block">LENGTH (MM)</label>
                    <input
                      type="number"
                      value={panelLength}
                      onChange={(e) => setPanelLength(Number(e.target.value) || 0)}
                      className="input-field h-10 text-center font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-label-caps text-slate-gray block">WIDTH (MM)</label>
                    <input
                      type="number"
                      value={panelWidth}
                      onChange={(e) => setPanelWidth(Number(e.target.value) || 0)}
                      className="input-field h-10 text-center font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-label-caps text-slate-gray block">HEIGHT (MM)</label>
                    <input
                      type="number"
                      value={panelHeight}
                      onChange={(e) => setPanelHeight(Number(e.target.value) || 0)}
                      className="input-field h-10 text-center font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-xl border border-outline-variant/30 bg-surface-charcoal p-6 text-center space-y-3">
                <div>
                  <span className="text-[10px] font-label-caps text-slate-gray block">ENCLOSURE VOLUME</span>
                  <span className="font-mono text-2xl font-bold text-white">{calculatedM3} m³</span>
                </div>
                <div>
                  <span className="text-[10px] font-label-caps text-slate-gray block">RECOMMENDED QUANTITY</span>
                  <span className="font-mono text-3xl font-bold text-tertiary">{recommendedCount} PCS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity(recommendedCount)}
                  className="btn-primary w-full py-2.5 text-xs tracking-wider"
                >
                  SET QUANTITY TO {recommendedCount} PCS
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section: Detailed Specs, Applications, Technical Documents, Reviews */}
      <section className="border-t border-outline-variant/20 py-16">
        <div className="page-container max-w-6xl">
          {/* Tab Navigation */}
          <div className="flex border-b border-outline-variant/20 mb-8 overflow-x-auto">
            {[
              { id: "specs", label: "Technical Specifications" },
              { id: "applications", label: "Where Can I Use It?" },
              { id: "documents", label: "Technical Documents" },
              { id: "reviews", label: `Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-headline-sm text-sm tracking-wider uppercase transition-colors relative shrink-0 ${
                  activeTab === tab.id ? "text-white font-bold" : "text-slate-gray hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: Specs */}
          {activeTab === "specs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
              {Object.entries(specs).map(([key, spec]) => (
                <div key={key} className="flex justify-between py-3 border-b border-outline-variant/10 text-xs md:text-sm">
                  <span className="text-slate-gray font-body-technical">{spec.label}</span>
                  <span className="font-semibold text-white text-right max-w-[60%] font-mono">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Applications */}
          {activeTab === "applications" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {applications.map((app, idx) => {
                const Icon = app.icon;
                return (
                  <div key={idx} className="bento-card p-6 border-outline-variant/20 space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary">
                      <Icon size={20} />
                    </div>
                    <h4 className="font-headline-sm text-base text-white font-semibold">{app.name}</h4>
                    <p className="text-body-technical text-xs text-slate-gray leading-relaxed">{app.desc}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: Technical Documents Download Center */}
          {activeTab === "documents" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicalDocuments.map((doc, idx) => (
                <div key={idx} className="bento-card p-6 border-outline-variant/20 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="badge-info text-[10px]">{doc.tag}</span>
                    <h4 className="font-headline-sm text-base text-white font-semibold">{doc.title}</h4>
                    <span className="text-xs text-slate-gray font-mono">{doc.size} · {doc.type}</span>
                  </div>
                  <Link href="/catalog">
                    <button className="btn-secondary px-4 py-2 text-xs tracking-wider gap-1.5 border-tertiary text-tertiary">
                      <Download size={14} />
                      <span>DOWNLOAD</span>
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {product.reviews.length === 0 ? (
                <p className="text-xs text-slate-gray">No reviews submitted yet for this product.</p>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="bento-card p-6 border-outline-variant/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <h5 className="font-headline-sm text-sm text-white font-bold">{rev.title}</h5>
                      <span className="text-xs text-slate-gray">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-body-technical text-xs text-on-surface-variant leading-relaxed">{rev.comment}</p>
                    <span className="text-[11px] text-tertiary block font-semibold">— {rev.user.name || "Industrial Buyer"}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
