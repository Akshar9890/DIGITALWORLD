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
import { Shield, Zap, Minus, Plus, ShoppingCart, FileText, CheckCircle2, MessageCircle, MapPin, Flame } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");

  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{ delivering: boolean; msg: string } | null>(null);
  const [cartState, setCartState] = useState<"idle" | "adding" | "added">("idle");

  // ── Shared pricing engine (same function used by cart, quotation & checkout) ──
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
    // Simulated check for Phase 1
    setPincodeResult({
      delivering: true,
      msg: `Delivers to ${pincode} by ${new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
    });
  };

  return (
    <div className="w-full">
      {/* ── Breadcrumb & Top Section ──────────────────────────────────────────── */}
      <div className="page-container py-8">
        <div className="flex gap-2 text-sm text-slate-gray mb-8 font-body-technical">
          <span>Home</span>
          <span>/</span>
          <span>{product.category.name}</span>
          <span>/</span>
          <span className="text-on-surface truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── Left Column: Images ────────────────────────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative w-full aspect-square rounded-2xl border border-outline-variant/30 bg-surface-charcoal overflow-hidden flex items-center justify-center group shadow-2xl">
              <Image
                src={product.images[selectedImageIndex] || "/images/products/heat-aerosol-1.jpg"}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 rounded-lg bg-surface-charcoal/80 border border-outline-variant/30 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono text-tertiary">
                OFFICIAL PRODUCT IMAGE
              </div>
            </div>
            
            {/* Thumbnail Rail */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative aspect-square rounded-xl border overflow-hidden transition-all ${
                    selectedImageIndex === i
                      ? 'border-tertiary shadow-[0_0_12px_rgba(255,185,86,0.3)] ring-2 ring-tertiary/40'
                      : 'border-outline-variant/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>


          {/* ── Right Column: Details & Actions ────────────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge-success">In Stock</span>
              {tierTable.length > 1 && <span className="badge-info">Bulk Quantity Pricing</span>}
            </div>
            
            {/* Title & Desc */}
            <h1 className="font-headline-md text-white mb-2">{product.name}</h1>
            <p className="text-body-technical text-on-surface-variant mb-6">
              {product.shortDesc}
            </p>
            
            {/* Ratings */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Zap key={star} size={16} className={star <= Math.round(product.averageRating) ? "star-filled" : "star-empty"} />
                ))}
              </div>
              <span className="text-sm text-slate-gray">{product.averageRating.toFixed(1)} ({product.reviewCount} reviews)</span>
            </div>

            <hr className="border-outline-variant/20 mb-8" />

            {/* Price block */}
            <div className="flex items-end gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-sm text-slate-gray font-label-caps tracking-widest uppercase mb-1">
                  {activeTier?.tierName || "Price"} • {formatINR(displayPrice)}/PCS
                </span>
                <div className="flex items-baseline gap-3">
                  {hasDiscount && (
                    <span className="text-lg text-slate-gray line-through">{formatINR(standardPrice)}</span>
                  )}
                  <span className="text-4xl font-headline-md text-white">
                    {formatINR(displayPrice)}
                  </span>
                  <span className="text-body-technical text-slate-gray mb-1">/ unit (excl. 18% GST)</span>
                </div>
              </div>
            </div>

            {/* Subtotal preview */}
            <div className="text-sm text-tertiary mb-4 bg-tertiary/10 border border-tertiary/20 rounded-md px-3 py-2 w-max">
              {formatINR(displayPrice)} × {quantity} = <span className="font-bold">{formatINR(subtotal)}</span> + GST
            </div>

            {/* Quantity Discount Applied hint */}
            {hasDiscount && activeTier && (
              <div className="flex items-center gap-2 text-sm mb-4 bg-status-success/10 border border-status-success/25 rounded-md px-3 py-2 w-max">
                <CheckCircle2 size={15} className="text-status-success" />
                <span className="text-status-success">
                  Quantity Discount Applied: <b>{activeTier.tierName}</b> (was {formatINR(standardPrice)}/PCS)
                </span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-body-technical text-on-surface-variant">Quantity:</span>
              <div className="flex items-center rounded-control border border-outline-variant/50 bg-surface-container-high overflow-hidden h-12 w-44 shadow-inner shadow-black/20">
                <button 
                  onClick={() => handleQtyChange(quantity - 1)}
                  className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <Minus size={16} />
                </button>
                <input
                  aria-label="Quantity"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => handleQuantityInput(event.target.value)}
                  className="h-full min-w-0 flex-1 appearance-none border-x border-outline-variant/40 bg-transparent text-center text-base font-bold tabular-nums text-white outline-none focus:bg-surface-container-highest"
                />
                <button 
                  onClick={() => handleQtyChange(quantity + 1)}
                  className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-xs text-slate-gray">PCS</span>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-slate-gray">Quick quantity:</span>
              {[1, 5, 10, 20, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setQuantity(amount)}
                  className={`rounded-control border px-3 py-1.5 text-xs font-bold transition-colors ${
                    quantity === amount
                      ? "border-tertiary bg-tertiary/15 text-tertiary"
                      : "border-outline-variant/30 bg-surface-container text-on-surface-variant hover:border-tertiary/60 hover:text-tertiary"
                  }`}
                >
                  {amount} PCS
                </button>
              ))}
            </div>

            {/* Unlock next tier hint */}
            {nextTierHint && (
              <button
                onClick={() => setQuantity(quantity + nextTierHint.piecesToUnlock)}
                className="group flex items-center gap-2 text-sm mb-6 bg-tertiary/10 border border-tertiary/30 hover:bg-tertiary/20 rounded-md px-3 py-2 w-max transition-colors text-left"
              >
                <Flame size={16} className="text-tertiary shrink-0" />
                <span className="text-tertiary">
                  Add {nextTierHint.piecesToUnlock} more {nextTierHint.piecesToUnlock === 1 ? "piece" : "pieces"} and unlock{" "}
                  <b>{formatINR(nextTierHint.tier.pricePerUnit)}/PCS</b>!
                </span>
              </button>
            )}

            {quantity >= 5000 && (
              <div className="flex items-center gap-2 text-sm mb-6 bg-primary-container/10 border border-primary-container/30 rounded-md px-3 py-2 w-max text-left">
                <span className="text-primary-container">
                  Need a custom quotation for 5,000+ PCS? <a href="/contact" className="font-bold underline hover:text-white transition-colors">Contact us</a>
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-8">
              <Button
                size="lg"
                className="w-full gap-2 text-sm font-bold bg-primary-container hover:bg-primary-container/90 text-white border border-primary-container shadow-lg shadow-primary-container/20"
                onClick={handleBuyNow}
                disabled={cartState !== "idle"}
              >
                ⚡ BUY NOW
              </Button>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 gap-2 text-sm"
                  onClick={handleAddToCart}
                  disabled={cartState !== "idle"}
                >
                  <ShoppingCart size={18} />
                  {cartState === "adding" ? "ADDING..." : cartState === "added" ? "ADDED ✓" : "ADD TO CART"}
                </Button>
                <Link href={`/quotation?product=${product.slug}&qty=${quantity}`} className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full gap-2 text-sm border-tertiary text-tertiary">
                    <FileText size={18} />
                    GET INSTANT QUOTATION
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-xs text-slate-gray -mt-4 mb-8">
              Need a quotation? Get it instantly — no company details needed, valid for 30 days.
            </p>

            {/* Pincode & Shipping */}
            <div className="bento-card p-4 border-outline-variant/20 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-primary-container" />
                <span className="font-headline-sm text-sm text-white">Check Delivery Estimate</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit Pincode"
                  className="input-field py-2 text-sm"
                />
                <Button variant="secondary" onClick={handleCheckPincode} className="h-full">Check</Button>
              </div>
              {pincodeResult && (
                <p className="mt-2 text-sm text-status-success flex items-center gap-1">
                  <CheckCircle2 size={14} /> {pincodeResult.msg}
                </p>
              )}
            </div>

            {/* WhatsApp Enquiry */}
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || ""}?text=${encodeURIComponent(product.whatsappMsg || "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-control border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle size={18} />
              Enquire on WhatsApp
            </a>

          </div>
        </div>
      </div>

      {/* ── Bulk Quantity Pricing Table (visible to all buyers) ───────────────── */}
      {tierTable.length > 1 && (
        <div className="bg-surface-charcoal border-t border-outline-variant/20 py-16">
          <div className="page-container">
            <h4 className="font-label-caps text-xs text-slate-gray uppercase tracking-widest mb-3">
              🔥 Bulk Quantity Pricing Available
            </h4>
            <p className="text-body-technical text-on-surface-variant mb-6">
              The more you buy, the less you pay per piece. The applied price is shown automatically in your cart and quotation.
            </p>
            <table className="tier-table max-w-xl">
              <thead>
                <tr>
                  <th>Quantity</th>
                  <th>Price / Unit</th>
                  <th>You Save</th>
                </tr>
              </thead>
              <tbody>
                {tierTable.map((tier) => {
                  const isActive = activeTier?.tierId === tier.tierId;
                  const saving = standardPrice - tier.pricePerUnit;
                  return (
                    <tr key={tier.tierId} className={isActive ? "active-row" : ""}>
                      <td>{tier.tierName}</td>
                      <td className="price">{formatINR(tier.pricePerUnit)}</td>
                      <td className="text-status-success">
                        {saving > 0 ? `Save ${formatINR(saving)}/PCS` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Bottom Section: Specs & Reviews ───────────────────────────────────── */}
      <div className="bg-surface-charcoal border-t border-outline-variant/20 py-16">
        <div className="page-container">
          
          {/* Tabs */}
          <div className="flex border-b border-outline-variant/20 mb-8">
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-8 py-4 font-headline-sm text-lg transition-colors relative ${
                activeTab === "specs" ? "text-white" : "text-slate-gray hover:text-on-surface-variant"
              }`}
            >
              Technical Specifications
              {activeTab === "specs" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-container" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-8 py-4 font-headline-sm text-lg transition-colors relative ${
                activeTab === "reviews" ? "text-white" : "text-slate-gray hover:text-on-surface-variant"
              }`}
            >
              Reviews ({product.reviewCount})
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-container" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
                {Object.entries(specs).map(([key, spec]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-outline-variant/10">
                    <span className="text-body-technical text-slate-gray">{spec.label}</span>
                    <span className="text-body-technical font-medium text-white text-right max-w-[60%]">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="flex flex-col gap-6">
                {product.reviews.length === 0 ? (
                  <p className="text-on-surface-variant">No reviews yet for this product.</p>
                ) : (
                  product.reviews.map(review => (
                    <div key={review.id} className="bento-card p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Zap key={star} size={14} className={star <= review.rating ? "star-filled" : "star-empty"} />
                            ))}
                          </div>
                          <h4 className="font-headline-sm text-white">{review.title}</h4>
                        </div>
                        <span className="text-xs text-slate-gray">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-body-technical text-on-surface-variant mb-4">{review.comment}</p>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs">
                          {review.user.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-white">{review.user.name || "Anonymous User"}</span>
                          {review.verifiedPurchase && <span className="text-[10px] text-status-success">Verified Purchase</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
