"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
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
  Tag,
  Percent,
  Check,
  X,
  RotateCcw,
  Sparkles,
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

  // ── New Features: GST Option & Custom Target Price ────────────────────────
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [isCustomPrice, setIsCustomPrice] = useState<boolean>(false);
  const [customPriceInput, setCustomPriceInput] = useState<string>("");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    companyName: "",
    gstin: "",
    country: "India",
    deliveryAddress: "",
    pincode: "",
    city: "",
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
    setIsCustomPrice(false);
    setCustomPriceInput("");
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

  // Fetch active admin shipping rules
  const { data: shippingRules } = useQuery({
    queryKey: ["shipping-rules"],
    queryFn: async () => {
      const res = await fetch("/api/shipping-rules");
      if (!res.ok) return undefined;
      return res.json();
    },
  });

  const activeTier = getPriceForQuantity(tierTable, quantity);
  const standardTierPrice = activeTier?.pricePerUnit || 0;

  // Custom unit price vs standard tier price
  const customNum = Number.parseFloat(customPriceInput);
  const hasValidCustomPrice = isCustomPrice && Number.isFinite(customNum) && customNum > 0;
  const displayPrice = hasValidCustomPrice ? customNum : standardTierPrice;

  const subtotal = displayPrice * quantity;
  // GST calculation: 18% if includeGst is true, otherwise 0
  const gstAmount = includeGst ? getGSTAmount(subtotal) : 0;
  const totalWeightGrams = product ? product.weightGrams * quantity : 0;
  const courier = getCourierCharge(totalWeightGrams, quantity, shippingRules, subtotal);
  const grandTotal = subtotal + gstAmount + courier.amount;

  const nextTierHint = getNextTierHint(tierTable, quantity);
  const standardPrice = tierTable.length > 0 ? tierTable[0].pricePerUnit : 0;
  const hasDiscount = !hasValidCustomPrice && displayPrice > 0 && displayPrice < standardPrice;

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
          customUnitPrice: hasValidCustomPrice ? displayPrice : undefined,
          includeGst,
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
      city: result.city,
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
                {s === "product" ? "Product & Pricing" : "Your Details"}
              </span>
              {i === 0 && <div className="w-10 h-px bg-outline-variant/30" />}
            </div>
          ))}
        </div>

        {/* Step 1: product + quantity + custom price + GST */}
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

            <div className="bento-card p-6 md:p-8 space-y-6">
              <h3 className="font-headline-sm text-white flex items-center justify-between">
                <span>Quantity &amp; Pricing Setup</span>
                {activeTier && (
                  <span className="text-xs font-normal text-tertiary border border-tertiary/30 px-2.5 py-1 rounded-full bg-tertiary/10">
                    Tier: {activeTier.tierName}
                  </span>
                )}
              </h3>

              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-body-technical text-on-surface-variant font-medium">Quantity:</span>
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

              {/* Quick quantity shortcuts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-slate-gray">Quick quantity:</span>
                {[1, 5, 10, 20, 50, 100, 500].map((amount) => (
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

              <hr className="border-outline-variant/20" />

              {/* ── GST OPTION TOGGLE (With GST vs Without GST) ──────────────── */}
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent size={18} className="text-primary-container" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Tax Preference (GST)
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${includeGst ? "bg-primary-container/20 text-primary-container" : "bg-status-success/20 text-status-success"}`}>
                    {includeGst ? "18% GST Applicable" : "0% GST (Tax Cancelled / Exempt)"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIncludeGst(true)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      includeGst
                        ? "bg-primary-container/20 border-primary-container text-white shadow-sm"
                        : "bg-surface-container-high border-outline-variant/20 text-slate-gray hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">With GST (18%)</div>
                      <div className="text-[10px] text-slate-gray">Standard commercial tax invoice</div>
                    </div>
                    {includeGst && <Check size={16} className="text-primary-container shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIncludeGst(false)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      !includeGst
                        ? "bg-status-success/20 border-status-success text-white shadow-sm"
                        : "bg-surface-container-high border-outline-variant/20 text-slate-gray hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-status-success">Without GST (0%)</div>
                      <div className="text-[10px] text-slate-gray">Cancels &amp; removes GST from total</div>
                    </div>
                    {!includeGst && <Check size={16} className="text-status-success shrink-0" />}
                  </button>
                </div>
              </div>

              {/* ── CUSTOM TARGET PRICE SECTION (Arrange own price) ──────────── */}
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={18} className="text-tertiary" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Arrange Custom Target Price
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isCustomPrice;
                      setIsCustomPrice(next);
                      if (!next) setCustomPriceInput("");
                    }}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${
                      isCustomPrice
                        ? "bg-tertiary text-black"
                        : "bg-surface-container-high text-on-surface-variant hover:text-white border border-outline-variant/30"
                    }`}
                  >
                    <Sparkles size={13} />
                    {isCustomPrice ? "Custom Price Active" : "+ Propose Own Price"}
                  </button>
                </div>

                {isCustomPrice ? (
                  <div className="p-3 bg-surface-container-high rounded-lg border border-tertiary/30 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-gray">
                        Enter your requested unit price (₹/PCS):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomPrice(false);
                          setCustomPriceInput("");
                        }}
                        className="text-[11px] text-slate-gray hover:text-white flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Reset to Tier ({formatINR(standardTierPrice)})
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray font-mono text-xs">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder={`Default: ${standardTierPrice}`}
                          value={customPriceInput}
                          onChange={(e) => setCustomPriceInput(e.target.value)}
                          className="input-field pl-7 pr-3 py-2 w-full text-xs font-mono font-bold text-white"
                        />
                      </div>
                      <span className="text-xs font-mono text-tertiary font-bold">/ PCS</span>
                    </div>

                    <p className="text-[11px] text-slate-gray">
                      Quotation will be generated with your custom requested unit rate of{" "}
                      <b className="text-tertiary">{formatINR(displayPrice)}/PCS</b>.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-gray">
                    Standard slab pricing: <b className="text-white">{formatINR(standardTierPrice)}/PCS</b>. Click <i>"+ Propose Own Price"</i> if you have specific budget requirements.
                  </p>
                )}
              </div>

              {/* Live Price & Totals Breakdown */}
              {loadingTiers ? (
                <div className="flex items-center gap-2 text-slate-gray text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading pricing...
                </div>
              ) : displayPrice > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-surface-container rounded-lg px-4 py-3 text-sm">
                    <span className="text-on-surface-variant">Active Unit Price:</span>
                    {hasDiscount && (
                      <span className="text-slate-gray line-through">{formatINR(standardPrice)}</span>
                    )}
                    <span className="font-bold text-white">{formatINR(displayPrice)}/PCS</span>
                    {hasValidCustomPrice ? (
                      <span className="text-xs font-bold text-tertiary bg-tertiary/15 border border-tertiary/30 px-2 py-0.5 rounded">
                        Custom Arranged Rate
                      </span>
                    ) : (
                      activeTier && <span className="badge-info">{activeTier.tierName}</span>
                    )}
                    <span className="text-xs text-slate-gray">
                      {includeGst ? "(excl. GST)" : "(Zero GST)"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-primary-container/5 border border-primary-container/15 rounded-lg px-4 py-3 text-sm">
                    <span className="text-on-surface-variant font-medium">Estimated Totals</span>
                    <span className="text-white">
                      {formatINR(displayPrice)} × {quantity} = <b>{formatINR(subtotal)}</b>
                    </span>
                    <span className="text-slate-gray flex items-center justify-between">
                      <span>GST (18%):</span>
                      <span>
                        {includeGst ? (
                          formatINR(gstAmount)
                        ) : (
                          <b className="text-status-success">CANCELLED / EXEMPT (₹0)</b>
                        )}
                      </span>
                    </span>
                    <span className="text-slate-gray flex items-center justify-between">
                      <span>Courier Shipping:</span>
                      <span>
                        {courier.amount > 0 ? (
                          formatINR(courier.amount)
                        ) : (
                          <b className="text-status-success">FREE</b>
                        )}
                      </span>
                    </span>
                    <hr className="border-outline-variant/20 my-1" />
                    <span className="text-tertiary font-bold flex items-center justify-between text-base">
                      <span>Grand Total:</span>
                      <span>{formatINR(grandTotal)}</span>
                    </span>
                  </div>

                  {nextTierHint && !hasValidCustomPrice && (
                    <button
                      onClick={() => setQuantity(quantity + nextTierHint.piecesToUnlock)}
                      className="flex items-center gap-2 text-sm bg-tertiary/10 border border-tertiary/30 hover:bg-tertiary/20 rounded-md px-3 py-2 w-max transition-colors text-left"
                    >
                      <Flame size={15} className="text-tertiary shrink-0" />
                      <span className="text-tertiary text-xs">
                        Add {nextTierHint.piecesToUnlock} more pieces to unlock{" "}
                        <b>{formatINR(nextTierHint.tier.pricePerUnit)}/PCS</b>!
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
              <User size={20} className="text-tertiary" /> Your Details &amp; Requirements
            </h3>
            <p className="text-sm text-slate-gray mb-6">
              Enter your contact details to generate your customized quotation PDF.
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
              {/* Street / Delivery Address */}
              <div className="md:col-span-2">
                <label className="input-label">Delivery Address (optional)</label>
                <input value={form.deliveryAddress} onChange={set("deliveryAddress")} className={inputCls()} placeholder="House no, street, area, landmark" />
              </div>

              {/* City */}
              <div>
                <label className="input-label">City (optional)</label>
                <input
                  value={form.city}
                  onChange={set("city")}
                  className={inputCls()}
                  placeholder="e.g. Vadodara"
                />
              </div>

              {/* State */}
              <div>
                <label className="input-label">State</label>
                <input
                  value={form.state}
                  onChange={set("state")}
                  className={inputCls()}
                  placeholder="e.g. Gujarat"
                />
              </div>

              {/* Pincode auto-fill */}
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
                <label className="input-label">Project / Special Requirement Notes (optional)</label>
                <textarea value={form.notes} onChange={set("notes")} rows={3} className={inputCls()} placeholder="Mention any specific requirements, certifications, or delivery requests..." />
              </div>
            </div>

            {errorMsg && <p className="text-status-error text-sm mt-4">{errorMsg}</p>}

            {/* Summary */}
            <div className="mt-8 bg-surface-container rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-white font-medium">{product?.name}</span>
                <span className="text-slate-gray text-xs">
                  {quantity} PCS × {formatINR(displayPrice)} {includeGst ? "(With 18% GST)" : "(Without GST)"}
                </span>
              </div>
              <span className="text-tertiary font-bold text-base">Grand Total: {formatINR(grandTotal)}</span>
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
                <span className="text-on-surface-variant">
                  Unit Price {hasValidCustomPrice ? "(Custom Target)" : `(${activeTier?.tierName || "—"})`}
                </span>
                <span className="text-white font-mono font-medium">
                  {displayPrice > 0 ? formatINR(displayPrice) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Product Subtotal</span>
                <span className="text-white font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">
                  GST {includeGst ? "(18%)" : "(0% - Excl.)"}
                </span>
                <span className={includeGst ? "text-white" : "text-status-success font-semibold"}>
                  {includeGst ? formatINR(gstAmount) : "CANCELLED (₹0)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Shipping Charge</span>
                <span className="text-white">{courier.amount > 0 ? formatINR(courier.amount) : "FREE"}</span>
              </div>
              <hr className="border-outline-variant/20" />
              <div className="flex justify-between items-center">
                <span className="font-headline-sm text-white">GRAND TOTAL</span>
                <span className="font-headline-md text-primary-container">{formatINR(grandTotal)}</span>
              </div>

              {hasDiscount && !hasValidCustomPrice ? (
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
              ) : null}

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
            Instant B2B/B2C customized quotation — download PDF or proceed directly.
          </p>
        </div>
      </div>
    </div>
  );
}
