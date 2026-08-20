"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";
import {
  FileDown,
  Printer,
  MessageCircle,
  Mail,
  ShoppingCart,
  CheckCircle2,
  Shield,
} from "lucide-react";

export type QuotationViewData = {
  id: string;
  quotationNumber: string;
  createdAt: string; // ISO
  validUntil: string; // ISO
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName?: string | null;
  gstin?: string | null;
  deliveryAddress?: string | null;
  pincode: string;
  state?: string | null;
  productId: string;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  standardPrice: number;
  appliedTierName: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  courierCharge: number;
  grandTotal: number;
};

interface Props {
  quotation: QuotationViewData;
  showActions?: boolean;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function QuotationView({ quotation: q, showActions = true }: Props) {
  const router = useRouter();
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading">("idle");

  const gstPct = Math.round(q.gstRate * 100);
  const hasDiscount = q.standardPrice > q.unitPrice;
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/quotation/${q.id}`;

  const whatsappText = encodeURIComponent(
    [
      `🔥 DigitalWorld – Instant Quotation`,
      ``,
      `${q.productName}`,
      `Quantity: ${q.quantity} PCS`,
      `Rate: ${formatINR(q.unitPrice)}/PCS`,
      `Subtotal: ${formatINR(q.subtotal)}`,
      `GST: ${formatINR(q.gstAmount)}`,
      `Courier: ${formatINR(q.courierCharge)}`,
      `*Total: ${formatINR(q.grandTotal)}*`,
      ``,
      `Quotation: ${q.quotationNumber}`,
      ``,
      `View quotation: ${viewUrl}`,
    ].join("\n")
  );

  const emailSubject = encodeURIComponent(`Instant Quotation ${q.quotationNumber} from DIGITALWORLD`);
  const emailBody = encodeURIComponent(
    [
      `Hi,`,
      ``,
      `Please find my instant quotation from DIGITALWORLD below.`,
      ``,
      `Quotation No: ${q.quotationNumber}`,
      `Product: ${q.productName}`,
      `Quantity: ${q.quantity} PCS`,
      `Grand Total: ${formatINR(q.grandTotal)} (incl. GST)`,
      ``,
      `View / Download: ${viewUrl}`,
    ].join("\n")
  );

  const handleCheckout = async () => {
    setCheckoutState("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: q.productId, quantity: q.quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      router.push("/checkout");
    } catch {
      setCheckoutState("idle");
      alert("Could not start checkout. Please try again.");
    }
  };

  return (
    <div className="print-doc w-full">
      {/* ── Document ──────────────────────────────────────────────────────────── */}
      <div className="bento-card overflow-hidden !bg-[#ffffff] text-[#1F2937]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 px-6 md:px-10 py-8 border-b-4 border-primary-container bg-white">
          <div>
            <h2 className="font-headline-lg text-primary-container tracking-wide">DIGITALWORLD</h2>
            <p className="text-xs text-slate-gray tracking-widest uppercase">
              Fire Safety &amp; Protection Solutions
            </p>
          </div>
          <div className="text-left sm:text-right">
            <h3 className="font-headline-sm text-primary-container text-xl">INSTANT QUOTATION</h3>
            <p className="text-xs text-slate-gray mt-1">{q.quotationNumber}</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 md:px-10 pt-6">
          {[
            { label: "Quotation No", value: q.quotationNumber },
            { label: "Date", value: fmtDate(q.createdAt) },
            { label: "Valid Until", value: fmtDate(q.validUntil) },
          ].map((m) => (
            <div key={m.label} className="border border-outline-variant/30 rounded-lg p-3 bg-[#FAFAF8]">
              <p className="text-[10px] uppercase tracking-widest text-slate-gray mb-1">{m.label}</p>
              <p className="font-headline-sm text-sm text-[#111827]">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Prepared For */}
        <div className="px-6 md:px-10 pt-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-gray mb-2">Prepared For</p>
          <div className="border border-outline-variant/30 rounded-lg p-4 bg-[#FAFAF8] flex flex-col gap-1">
            <p className="font-headline-sm text-[#111827]">{q.customerName}</p>
            {q.companyName && (
              <p className="text-sm text-[#374151]">Company: {q.companyName}</p>
            )}
            {q.gstin && (
              <p className="text-sm text-[#374151]">GSTIN: {q.gstin}</p>
            )}
            <p className="text-sm text-[#374151]">Mobile: {q.customerPhone}</p>
            <p className="text-sm text-[#374151]">Email: {q.customerEmail}</p>
            {q.deliveryAddress && (
              <p className="text-sm text-[#374151]">Address: {q.deliveryAddress}</p>
            )}
            <p className="text-sm text-[#374151]">
              Delivery Pincode: {q.pincode}
              {q.state ? ` • ${q.state}` : ""}
            </p>
          </div>
        </div>

        {/* Product table */}
        <div className="px-6 md:px-10 pt-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-gray mb-2">Products &amp; Pricing</p>
          <table className="w-full text-sm border border-outline-variant/30 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#2B2B2E] text-white">
                <th className="text-left px-4 py-3 font-label-caps text-[11px] tracking-wider">Product</th>
                <th className="px-4 py-3 font-label-caps text-[11px] tracking-wider text-center">Qty</th>
                <th className="px-4 py-3 font-label-caps text-[11px] tracking-wider text-right">Unit Price</th>
                <th className="px-4 py-3 font-label-caps text-[11px] tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#FAFAF8]">
                <td className="px-4 py-3 font-medium text-[#111827]">{q.productName}</td>
                <td className="px-4 py-3 text-center">{q.quantity} PCS</td>
                <td className="px-4 py-3 text-right">{formatINR(q.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatINR(q.subtotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quantity discount applied */}
        <div className="px-6 md:px-10 pt-5">
          <div className="border border-tertiary bg-[#FEF3C7] rounded-lg p-4">
            <p className="font-headline-sm text-sm text-[#92400E] mb-1">
              Quantity Discount Applied: {q.appliedTierName}
            </p>
            <p className="text-sm text-[#92400E]">
              Standard Price: {formatINR(q.standardPrice)}/PCS &nbsp;•&nbsp; Applied Price:{" "}
              <b>{formatINR(q.unitPrice)}/PCS</b>
              {hasDiscount && (
                <>
                  &nbsp;•&nbsp; You save <b>{formatINR(q.standardPrice - q.unitPrice)}/PCS</b>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end px-6 md:px-10 pt-6 pb-8">
          <div className="w-full max-w-sm flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-[#374151]">
              <span>Product Subtotal</span>
              <span>{formatINR(q.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#374151]">
              <span>GST ({gstPct}%)</span>
              <span>{q.gstAmount > 0 ? formatINR(q.gstAmount) : "₹0.00 (Exempt / Excl.)"}</span>
            </div>
            <div className="flex justify-between text-[#374151] border-b border-outline-variant/30 pb-3">
              <span>Shipping Charge</span>
              <span>{q.courierCharge > 0 ? formatINR(q.courierCharge) : "FREE"}</span>
            </div>
            <div className="flex justify-between items-center bg-primary-container text-white rounded-lg px-4 py-3 mt-1">
              <span className="font-headline-sm">GRAND TOTAL</span>
              <span className="font-headline-md">{formatINR(q.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ────────────────────────────────────────────────────── */}
      {showActions && (
        <div className="print:hidden flex flex-wrap gap-3 mt-8">
          <a href={`/api/quotation/${q.id}/pdf?download=1`} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="gap-2 border-tertiary text-tertiary">
              <FileDown size={18} /> Download PDF
            </Button>
          </a>
          <Button variant="secondary" className="gap-2" onClick={() => window.print()}>
            <Printer size={18} /> Print
          </Button>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || ""}?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary" className="gap-2 border-[#25D366]/40 text-[#25D366]">
              <MessageCircle size={18} /> Share on WhatsApp
            </Button>
          </a>
          <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`}>
            <Button variant="secondary" className="gap-2">
              <Mail size={18} /> Email Quotation
            </Button>
          </a>
          <Button
            className="gap-2 ml-auto"
            size="lg"
            isLoading={checkoutState === "loading"}
            onClick={handleCheckout}
          >
            <ShoppingCart size={18} /> Proceed to Checkout
          </Button>
        </div>
      )}

      {/* Validity note */}
      <div className="print:hidden flex items-center gap-2 mt-6 text-sm text-on-surface-variant">
        <CheckCircle2 size={16} className="text-status-success" />
        This quotation is valid until {fmtDate(q.validUntil)}. Prices match what you will pay at checkout.
      </div>

      {/* Print-only branding */}
      <div className="hidden print:flex items-center gap-2 mt-8 text-xs text-slate-gray">
        <Shield size={14} /> DIGITALWORLD • Fire Safety &amp; Protection Solutions • {viewUrl}
      </div>
    </div>
  );
}
