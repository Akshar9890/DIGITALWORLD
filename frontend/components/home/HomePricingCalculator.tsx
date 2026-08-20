"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { formatINR } from "@/lib/utils";
import { getPriceForQuantity } from "@/lib/pricing";
import { Minus, Plus, ShoppingCart, FileText, Zap, Flame, CheckCircle2 } from "lucide-react";

type TierItem = {
  tierId: string;
  tierName: string;
  minQty: number;
  maxQty: number | null;
  pricePerUnit: number;
  isRetail: boolean;
  isActive: boolean;
};

// Default fallback tiers if loading
const DEFAULT_TIERS: TierItem[] = [
  { tierId: "t1", tierName: "1–9 PCS", minQty: 1, maxQty: 9, pricePerUnit: 300, isRetail: true, isActive: false },
  { tierId: "t2", tierName: "10–49 PCS", minQty: 10, maxQty: 49, pricePerUnit: 275, isRetail: false, isActive: false },
  { tierId: "t3", tierName: "50–99 PCS", minQty: 50, maxQty: 99, pricePerUnit: 225, isRetail: false, isActive: false },
  { tierId: "t4", tierName: "100–499 PCS", minQty: 100, maxQty: 499, pricePerUnit: 200, isRetail: false, isActive: false },
  { tierId: "t5", tierName: "500+ PCS", minQty: 500, maxQty: null, pricePerUnit: 165, isRetail: false, isActive: false },
];

export function HomePricingCalculator() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(10);
  const [adding, setAdding] = useState(false);
  const [selectedImg, setSelectedImg] = useState("/images/products/heat-aerosol-1.jpg");
  const [productId, setProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState("DW-AERO 100 Suppression Device");
  const [tiers, setTiers] = useState<TierItem[]>(DEFAULT_TIERS);

  const productPhotos = [
    { src: "/images/products/heat-aerosol-1.jpg", label: "Action" },
    { src: "/images/products/heat-aerosol-6.jpg", label: "Dual Nozzle" },
    { src: "/images/products/heat-aerosol-7.jpg", label: "Panel Mount" },
    { src: "/images/products/heat-aerosol-2.jpg", label: "Dimensions" },
  ];

  // Fetch live prices from DB on load
  useEffect(() => {
    async function loadLivePrices() {
      try {
        const res = await fetch("/api/product-tiers");
        if (res.ok) {
          const data = await res.json();
          if (data.tiers && data.tiers.length > 0) {
            setTiers(data.tiers);
          }
          if (data.productId) {
            setProductId(data.productId);
          }
          if (data.productName) {
            setProductName(data.productName);
          }
        }
      } catch (err) {
        console.error("Failed to load live product tiers:", err);
      }
    }
    loadLivePrices();
  }, []);

  const activeTierMatch = getPriceForQuantity(
    tiers.map((t) => ({
      tierId: t.tierId,
      tierName: t.tierName,
      minQty: t.minQty,
      maxQty: t.maxQty,
      pricePerUnit: t.pricePerUnit,
    })),
    quantity
  );

  const currentTier = tiers.find((t) => t.tierId === activeTierMatch?.tierId) || tiers[0];
  const unitPrice = currentTier.pricePerUnit;
  const retailTier = tiers.find((t) => t.minQty === 1) || tiers[0];
  const standardPrice = retailTier.pricePerUnit;
  const subtotal = unitPrice * quantity;
  const totalSavings = Math.max(0, (standardPrice - unitPrice) * quantity);

  // Next tier hint calculation
  const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);
  const currentTierIndex = sortedTiers.findIndex((t) => t.tierId === currentTier.tierId);
  const nextTier = sortedTiers[currentTierIndex + 1];
  const itemsToNextTier = nextTier ? nextTier.minQty - quantity : 0;

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10000, prev + delta)));
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productId || "cm6t68001000008l41yq01yq0",
          quantity,
        }),
      });
      if (res.ok) {
        router.push("/cart");
      } else {
        router.push(`/quotation?qty=${quantity}`);
      }
    } catch {
      router.push(`/quotation?qty=${quantity}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="py-20 bg-[#121413] border-b border-outline-variant/20">
      <div className="page-container">
        <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-caps text-xs tracking-widest text-tertiary uppercase">
            TRANSPARENT VOLUME PRICING
          </span>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-white font-bold mt-2">
            Quantity Pricing & Live Calculator
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-4">
            Industrial pricing scaled for panel builders, contractors, and safety teams. Automatic GST invoice & weight-based courier calculation.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tiers List (Left) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <h3 className="font-headline-sm text-sm text-slate-gray uppercase tracking-wider mb-2 font-label-caps">
              Official Quantity Discount Tiers
            </h3>

            {tiers.map((t) => {
              const isActive = currentTier.tierId === t.tierId;
              return (
                <div
                  key={t.tierId || t.tierName}
                  onClick={() => setQuantity(t.minQty)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isActive
                      ? "border-tertiary bg-surface-container-high/90 shadow-xl"
                      : "border-outline-variant/20 bg-surface-container/50 hover:bg-surface-container-high/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        isActive ? "bg-tertiary animate-pulse" : "bg-slate-gray/40"
                      }`}
                    />
                    <div>
                      <span className="font-headline-sm text-sm text-white font-semibold block">
                        {t.minQty} {t.maxQty ? `– ${t.maxQty}` : "+"} PCS
                      </span>
                      <span className="text-xs text-slate-gray">{t.tierName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-headline-sm text-base text-white font-mono block">
                      {formatINR(t.pricePerUnit)}
                    </span>
                    <span className="text-[11px] text-slate-gray">/ UNIT + GST</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Calculator Box (Right) */}
          <div className="lg:col-span-6 bento-card p-6 md:p-8 border-tertiary/30 bg-surface-charcoal/90 relative">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-5">
              <div>
                <span className="font-label-caps text-xs text-tertiary tracking-widest block">
                  LIVE ESTIMATOR
                </span>
                <h3 className="font-headline-sm text-xl text-white mt-1">{productName}</h3>
              </div>
              <Flame size={24} className="text-primary-container shrink-0" />
            </div>

            {/* Product Photo Gallery Preview inside Live Estimator */}
            <div className="mb-6 rounded-xl border border-outline-variant/30 bg-surface-container overflow-hidden p-3">
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-outline-variant/20 mb-3 bg-black">
                <Image
                  src={selectedImg}
                  alt="Product Photo"
                  fill
                  className="object-contain p-2"
                />
                <div className="absolute top-2 left-2 rounded bg-surface-charcoal/80 border border-outline-variant/30 px-2 py-1 text-[10px] font-mono text-tertiary">
                  OFFICIAL PRODUCT PHOTO
                </div>
              </div>

              {/* Photo Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {productPhotos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(photo.src)}
                    className={`relative aspect-square rounded-lg border overflow-hidden transition-all ${
                      selectedImg === photo.src
                        ? "border-tertiary ring-2 ring-tertiary/40 scale-95"
                        : "border-outline-variant/20 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={photo.src} alt={photo.label} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Control */}
            <div className="mb-6">
              <label className="text-xs font-label-caps text-slate-gray block mb-3">
                SELECT QUANTITY (PCS)
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQtyChange(-1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/30 text-white hover:bg-surface-container-highest transition-colors"
                >
                  <Minus size={18} />
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-field h-12 text-center text-xl font-mono font-bold text-white bg-surface-container border-outline-variant/40"
                />

                <button
                  onClick={() => handleQtyChange(1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/30 text-white hover:bg-surface-container-highest transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Tier Unlock Notification */}
              {nextTier && itemsToNextTier > 0 && (
                <div className="mt-3 p-2.5 rounded-lg bg-tertiary/10 border border-tertiary/30 text-xs text-tertiary flex items-center gap-2">
                  <Zap size={14} className="shrink-0" />
                  <span>
                    Add <strong>{itemsToNextTier} more pcs</strong> to unlock {formatINR(nextTier.pricePerUnit)}/unit price!
                  </span>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 bg-surface-container/70 p-5 rounded-xl border border-outline-variant/20 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-gray">Unit Price ({currentTier.tierName})</span>
                <AnimatedCounter value={unitPrice} className="text-white font-semibold" />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-gray">Subtotal ({quantity} pcs)</span>
                <AnimatedCounter value={subtotal} className="text-white font-semibold" />
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-sm pt-2 border-t border-outline-variant/15 text-status-success">
                  <span className="flex items-center gap-1 font-label-caps text-xs">
                    <CheckCircle2 size={14} /> Total Quantity Savings
                  </span>
                  <AnimatedCounter value={totalSavings} className="font-bold text-status-success" />
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary py-3 text-xs tracking-wider gap-2 w-full"
              >
                <ShoppingCart size={16} />
                <span>{adding ? "ADDING..." : "ADD TO CART"}</span>
              </button>

              <Link href={`/quotation?qty=${quantity}`}>
                <button className="btn-secondary py-3 text-xs tracking-wider gap-2 w-full">
                  <FileText size={16} className="text-tertiary" />
                  <span>INSTANT QUOTE</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
