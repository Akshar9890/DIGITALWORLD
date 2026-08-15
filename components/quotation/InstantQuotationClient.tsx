"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { QuotationView, QuotationViewData } from "@/components/quotation/QuotationView";
import { getPriceForQuantity, getNextTierHint } from "@/lib/pricing";
import { getCourierCharge, getGSTAmount } from "@/lib/shipping";
import { formatINR, isValidPhone, isValidPincode } from "@/lib/utils";
import { PincodeInput, type PincodeResult } from "@/components/ui/PincodeInput";
import {
  Package,
  Minus,
  Plus,
  Flame,
  ChevronLeft,
  FileText,
  CheckCircle2,
  Loader2,
  User,
  MapPin,
} from "lucide-react";
import type { TierDisplay } from "@/lib/pricing";

type ProductOption = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  weightGrams: number;
};

interface Props {
  products: ProductOption[];
  initialSlug?: string;
  initialQty: number;
}

type Step = "product" | "details" | "done";

export function InstantQuotationClient({ products, initialSlug, initialQty }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("product");
  const [selectedId, setSelectedId] = useState<string>(
    products.find((p) => p.slug === initialSlug)?.id || products[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(initialQty);
  const [tierTable, setTierTable] = useState<TierDisplay[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    companyName: "",
    gstin: "",
    deliveryAddress: "",
    pincode: "",
    state: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<QuotationViewData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const product = products.find((p) => p.id === selectedId);

  const loadTiers = async (productId: string) => {
    setLoadingTiers(true);
    try {
      const res = await fetch(`/api/product-tiers?productId=${productId}`);
      if (!res.ok) throw new Error("Failed to load pricing");
      const data = await res.json();
      setTierTable(data.tiers);
    } catch {
      setTierTable([]);
    } finally {
      setLoadingTiers(false);
    }
  };

  const handleProductSelect = (id: string) => {
    setSelectedId(id);
    setQuantity(1);
    loadTiers(id);
  };

  const handleQuantityInput = (value: string) => {
    const nextQuantity = Number.parseInt(value, 10);
    if (Number.isFinite(nextQuantity) && nextQuantity >= 1) {
      setQuantity(nextQuantity);
    }
  };

  useMemo(() => {
    if (selectedId) loadTiers(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const activeTier = getPriceForQuantity(tierTable, quantity);
  const displayPrice = activeTier?.pricePerUnit || 0;
  const subtotal = displayPrice * quantity;
  const gstAmount = getGSTAmount(subtotal);
  const totalWeightGrams = product ? product.weightGrams * quantity : 0;
  const courier = getCourierCharge(totalWeightGrams, quantity);
  const grandTotal = subtotal + gstAmount + courier.amount;
  const nextTierHint = getNextTierHint(tierTable, quantity);
  const standardPrice = tierTable.length > 0 ? tierTable[0].pricePerUnit : 0;
  const hasDiscount = displayPrice > 0 && displayPrice < standardPrice;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.customerName.trim().length < 2) e.customerName = "Please enter your name";
    if (!isValidPhone(form.customerPhone)) e.customerPhone = "Valid 10-digit mobile number required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) e.customerEmail = "Valid email required";
    if (!isValidPincode(form.pincode)) e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = async () => {
    if (!product) return;
    if (!validate()) return;
    setGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quotation");
      }
      setGenerated(data.quotation);
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const [buying, setBuying] = useState(false);

  const handleBuyNow = async () => {
    if (!product) return;

    // Require login before checkout
    if (!session?.user) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    setBuying(true);
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
      // Invalidate stale cart cache so checkout sees the fresh cart immediately
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push("/checkout");
    } catch {
      setBuying(false);
      alert("Could not proceed to checkout. Please try again.");
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Pincode auto-fill handler
  const handlePincodeResolved = (result: PincodeResult) => {
    setForm((f) => ({
      ...f,
      pincode: result.pincode,
      state: result.state,
      deliveryAddress: f.deliveryAddress || result.area,
    }));
  };

  const handlePincodeChange = (val: string) => {
    setForm((f) => ({ ...f, pincode: val }));
  };

  if (step === "done" && generated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-status-success mb-2">
          <CheckCircle2 size={20} />
          <span className="font-headline-sm text-status-success">
            Quotation {generated.quotationNumber} generated successfully!
          </span>
        </div>
        <QuotationView quotation={generated} />
        <div className="print:hidden">
          <Button variant="secondary" className="gap-2" onClick={() => { setGenerated(null); setStep("product"); }}>
            <ChevronLeft size={18} /> New Quotation
          </Button>
        </div>
      </div>
    );
  }

  const inputCls = (err?: string) => `input-field ${err ? "border-status-error" : ""}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* ── Left: wizard ─────────────────────────────────────────────────────── */}
      <div className="lg:col-span-7 print:hidden">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8 text-sm">
          {(["product", "details"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s
                    ? "bg-primary-container text-white"
                    : step === "details" || step === "done"
                    ? "bg-status-success/20 text-status-success"
                    : "bg-surface-container-high text-slate-gray"
                }`}
              >
                {i + 1}
              </div>
              <span className={step === s ? "text-white" : "text-slate-gray"}>
                {s === "product" ? "Product & Quantity" : "Your Details"}
              </span>
              {i === 0 && <div className="w-10 h-px bg-outline-variant/30" />}
            </div>
          ))}
        </div>

        {/* Step 1: product + quantity */}
        {step === "product" && (
          <div className="flex flex-col gap-8">
            <div className="bento-card p-6 md:p-8">
              <h3 className="font-headline-sm text-white mb-6 flex items-center gap-2">
                <Package size={20} className="text-tertiary" /> Select Product
              </h3>

              <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProductSelect(p.id)}
                    className={`text-left rounded-control border p-4 transition-colors ${
                      p.id === selectedId
                        ? "border-tertiary bg-tertiary/10"
                        : "border-outline-variant/20 hover:border-outline-variant/40"
                    }`}
                  >
                    <span className="block text-sm font-medium text-white">{p.name}</span>
                    {p.shortDesc && (
                      <span className="block text-xs text-slate-gray mt-1 line-clamp-2">{p.shortDesc}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bento-card p-6 md:p-8">
              <h3 className="font-headline-sm text-white mb-6">Quantity &amp; Pricing</h3>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-body-technical text-on-surface-variant">Quantity:</span>
                <div className="flex items-center rounded-control border border-outline-variant/50 bg-surface-container-high overflow-hidden h-12 w-44 shadow-inner shadow-black/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    aria-label="Quotation quantity"
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(event) => handleQuantityInput(event.target.value)}
                    className="h-full min-w-0 flex-1 appearance-none border-x border-outline-variant/40 bg-transparent text-center text-base font-bold tabular-nums text-white outline-none focus:bg-surface-container-highest"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
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

              {loadingTiers ? (
                <div className="flex items-center gap-2 text-slate-gray text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading pricing...
                </div>
              ) : displayPrice > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-surface-container rounded-lg px-4 py-3 text-sm">
                    <span className="text-on-surface-variant">Unit Price:</span>
                    {hasDiscount && (
                      <span className="text-slate-gray line-through">{formatINR(standardPrice)}</span>
                    )}
                    <span className="font-bold text-white">{formatINR(displayPrice)}/PCS</span>
                    {activeTier && (
                      <span className="badge-info">{activeTier.tierName}</span>
                    )}
                    <span className="text-xs text-slate-gray">(excl. GST)</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-primary-container/5 border border-primary-container/15 rounded-lg px-4 py-3 text-sm">
                    <span className="text-on-surface-variant">Estimated Totals</span>
                    <span className="text-white">
                      {formatINR(displayPrice)} × {quantity} = <b>{formatINR(subtotal)}</b>
                    </span>
                    <span className="text-slate-gray">GST (18%): {formatINR(gstAmount)}</span>
                    <span className="text-slate-gray">
                      Courier: {courier.amount > 0 ? formatINR(courier.amount) : <b className="text-status-success">FREE</b>}
                    </span>
                    <span className="text-tertiary font-bold">
                      Grand Total: {formatINR(grandTotal)}
                    </span>
                  </div>

                  {nextTierHint && (
                    <button
                      onClick={() => setQuantity(quantity + nextTierHint.piecesToUnlock)}
                      className="flex items-center gap-2 text-sm bg-tertiary/10 border border-tertiary/30 hover:bg-tertiary/20 rounded-md px-3 py-2 w-max transition-colors text-left"
                    >
                      <Flame size={15} className="text-tertiary shrink-0" />
                      <span className="text-tertiary">
                        Add {nextTierHint.piecesToUnlock} more {nextTierHint.piecesToUnlock === 1 ? "piece" : "pieces"}...{" "}
                        {quantity + nextTierHint.piecesToUnlock} × {formatINR(nextTierHint.tier.pricePerUnit)} = {formatINR((quantity + nextTierHint.piecesToUnlock) * nextTierHint.tier.pricePerUnit)} 
                        <b> (Save {formatINR(standardPrice * (quantity + nextTierHint.piecesToUnlock) - (quantity + nextTierHint.piecesToUnlock) * nextTierHint.tier.pricePerUnit)}!)</b>
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-slate-gray text-sm">Select a product to see pricing.</p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-primary-container hover:bg-primary-container/90 text-white font-bold px-8 shadow-lg shadow-primary-container/20"
                  onClick={handleBuyNow}
                  isLoading={buying}
                  disabled={!product || displayPrice === 0}
                >
                  ⚡ BUY NOW (PROCEED TO CHECKOUT)
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto gap-2 border-tertiary text-tertiary"
                  onClick={() => setStep("details")}
                  disabled={!product || displayPrice === 0}
                >
                  <FileText size={18} /> GET INSTANT QUOTATION <ChevronLeft size={18} className="rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: customer details */}
        {step === "details" && (
          <div className="bento-card p-6 md:p-8">
            <h3 className="font-headline-sm text-white mb-2 flex items-center gap-2">
              <User size={20} className="text-tertiary" /> Your Details
            </h3>
            <p className="text-sm text-slate-gray mb-6">
              Enter your details below. Company Name & GSTIN are optional — add them for B2B quotations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Full Name *</label>
                <input value={form.customerName} onChange={set("customerName")} className={inputCls(errors.customerName)} placeholder="e.g. Rahul Sharma" />
                {errors.customerName && <span className="input-error">{errors.customerName}</span>}
              </div>
              <div>
                <label className="input-label">Mobile Number *</label>
                <input value={form.customerPhone} onChange={set("customerPhone")} className={inputCls(errors.customerPhone)} placeholder="10-digit mobile" inputMode="numeric" maxLength={10} />
                {errors.customerPhone && <span className="input-error">{errors.customerPhone}</span>}
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Email *</label>
                <input type="email" value={form.customerEmail} onChange={set("customerEmail")} className={inputCls(errors.customerEmail)} placeholder="you@example.com" />
                {errors.customerEmail && <span className="input-error">{errors.customerEmail}</span>}
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Company Name (optional)</label>
                <input value={form.companyName} onChange={set("companyName")} className={inputCls()} placeholder="Your company name" />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">GSTIN (optional)</label>
                <input value={form.gstin} onChange={set("gstin")} className={inputCls(errors.gstin)} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                {errors.gstin && <span className="input-error">{errors.gstin}</span>}
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Delivery Address (optional)</label>
                <input value={form.deliveryAddress} onChange={set("deliveryAddress")} className={inputCls()} placeholder="House no, street, area, landmark" />
              </div>
              {/* ── Pincode auto-fill ───────────────────────────────────── */}
              <div>
                <PincodeInput
                  label="Delivery Pincode"
                  required
                  value={form.pincode}
                  onChange={handlePincodeChange}
                  onResolved={handlePincodeResolved}
                  error={errors.pincode}
                  placeholder="6-digit pincode"
                />
              </div>
              <div>
                <label className="input-label">State (auto-filled)</label>
                <input
                  value={form.state}
                  onChange={set("state")}
                  className={inputCls()}
                  placeholder="Auto-filled from pincode"
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Notes (optional)</label>
                <textarea value={form.notes} onChange={set("notes")} rows={3} className={inputCls()} placeholder="Anything we should know? (max 500 chars)" />
              </div>
            </div>

            {errorMsg && <p className="text-status-error text-sm mt-4">{errorMsg}</p>}

            {/* Summary */}
            <div className="mt-8 bg-surface-container rounded-lg px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="text-white font-medium">{product?.name}</span>
              <span className="text-slate-gray">{quantity} PCS × {formatINR(displayPrice)}</span>
              <span className="text-tertiary font-bold ml-auto">Total: {formatINR(grandTotal)}</span>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="secondary" className="gap-2" onClick={() => setStep("product")}>
                <ChevronLeft size={18} /> Back
              </Button>
              <Button size="lg" className="gap-2" isLoading={generating} onClick={handleGenerate}>
                <FileText size={18} /> GENERATE QUOTATION
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: live summary ──────────────────────────────────────────────── */}
      <div className="lg:col-span-5 print:hidden">
        <div className="bento-card p-6 sticky top-24">
          <h3 className="font-headline-sm text-white mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-tertiary" /> Quotation Summary
          </h3>

          {!product ? (
            <p className="text-slate-gray text-sm">Select a product to begin.</p>
          ) : (
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between gap-4 items-center">
                <span className="text-on-surface-variant line-clamp-2">{product.name}</span>
                {step !== "done" ? (
                  <div className="flex items-center rounded-control border border-outline-variant/50 bg-surface-container-high overflow-hidden h-10 w-36 shrink-0 shadow-inner shadow-black/20">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"><Minus size={14} /></button>
                    <input
                      aria-label="Quotation summary quantity"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(event) => handleQuantityInput(event.target.value)}
                      className="h-full min-w-0 flex-1 appearance-none border-x border-outline-variant/40 bg-transparent text-center text-sm font-bold tabular-nums text-white outline-none focus:bg-surface-container-highest"
                    />
                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"><Plus size={14} /></button>
                  </div>
                ) : (
                  <span className="text-white font-medium shrink-0">{quantity} PCS</span>
                )}
              </div>
              <hr className="border-outline-variant/20" />
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Unit Price ({activeTier?.tierName || "—"})</span>
                <span className="text-white">{displayPrice > 0 ? formatINR(displayPrice) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Product Subtotal</span>
                <span className="text-white font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">GST (18%)</span>
                <span className="text-white">{formatINR(gstAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Courier Charges</span>
                <span className="text-white">{courier.amount > 0 ? formatINR(courier.amount) : "FREE"}</span>
              </div>
              <hr className="border-outline-variant/20" />
              <div className="flex justify-between items-center">
                <span className="font-headline-sm text-white">GRAND TOTAL</span>
                <span className="font-headline-md text-primary-container">{formatINR(grandTotal)}</span>
              </div>

              {hasDiscount ? (
                <div className="bg-status-success/10 border border-status-success/25 rounded-md px-3 py-2 flex flex-col gap-1">
                  <p className="text-status-success text-xs flex items-center gap-1 font-bold">
                    <Flame size={14} /> You're getting bulk pricing! [{activeTier?.tierName} tier]
                  </p>
                  <p className="text-status-success text-xs">
                    You are saving {formatINR(standardPrice - displayPrice)}/PCS vs the standard {formatINR(standardPrice)}.
                  </p>
                  {activeTier && (
                    <p className="text-status-success text-xs font-bold mt-1">
                      🎉 You've unlocked {formatINR(activeTier.pricePerUnit)}/PCS!
                    </p>
                  )}
                </div>
              ) : (
                nextTierHint && (
                  <div className="bg-tertiary/10 border border-tertiary/30 rounded-md px-3 py-2 flex flex-col gap-1">
                    <p className="text-tertiary text-xs flex items-center gap-1">
                      <Flame size={14} /> Bulk discounts available
                    </p>
                    <button 
                      onClick={() => setQuantity(quantity + nextTierHint.piecesToUnlock)}
                      className="text-left text-tertiary text-xs hover:underline font-bold"
                    >
                      Add {nextTierHint.piecesToUnlock} more pieces to unlock {formatINR(nextTierHint.tier.pricePerUnit)}/PCS!
                    </button>
                  </div>
                )
              )}

              <Button
                size="lg"
                className="w-full gap-2 mt-4 bg-primary-container hover:bg-primary-container/90 text-white font-bold shadow-lg shadow-primary-container/20 py-3 text-sm"
                onClick={handleBuyNow}
                isLoading={buying}
                disabled={!product || displayPrice === 0}
              >
                ⚡ BUY NOW (PROCEED TO CHECKOUT)
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-slate-gray mt-6">
            Same pricing engine as your cart & checkout — no surprises.
          </p>
        </div>
      </div>
    </div>
  );
}
