export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getOrCreateInvoice } from "@/lib/invoice";
import { notFound } from "next/navigation";
import { formatINR, getEstimatedDeliveryRange } from "@/lib/utils";
import Link from "next/link";
import { Download, ArrowLeft, ShieldCheck, Truck, Calendar } from "lucide-react";
import PrintButton from "./PrintButton";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!orderId) notFound();

  const invoice = await getOrCreateInvoice(orderId);
  if (!invoice || !invoice.order) notFound();

  const order = invoice.order;
  const deliveryInfo = getEstimatedDeliveryRange(order.createdAt);

  return (
    <div className="min-h-screen bg-surface-dim text-on-surface py-10 px-4 print:bg-white print:text-black print:p-0 print:m-0 print:min-h-0">
      {/* Print-specific style override */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, footer, nav, .print\\:hidden, #whatsapp-widget {
            display: none !important;
          }
          .invoice-card {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-text-black {
            color: #000000 !important;
          }
          .print-text-muted {
            color: #374151 !important;
          }
          .print-bg-gray {
            background-color: #f9fafb !important;
          }
          .print-border-gray {
            border-color: #9ca3af !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href={`/account/orders/${order.id}`}
          className="flex items-center gap-2 text-sm text-slate-gray hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Order
        </Link>
        <div className="flex items-center gap-3">
          <PrintButton />
          <a
            href={`/api/orders/${order.id}/invoice/pdf?download=1`}
            download={`${invoice.invoiceNumber}.pdf`}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            <Download size={16} /> DOWNLOAD PDF
          </a>
        </div>
      </div>

      {/* Invoice Document Box */}
      <div className="invoice-card max-w-4xl mx-auto bg-surface-container rounded-2xl p-8 md:p-12 border border-outline-variant/30 shadow-2xl print:shadow-none print:border-none print:bg-white print:p-0 print:rounded-none">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-outline-variant/30 pb-6 mb-8 print:border-black">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-status-success print-text-black" size={28} />
              <h1 className="text-2xl font-black tracking-tight text-white print-text-black">
                DIGITALWORLD
              </h1>
            </div>
            <p className="text-xs text-slate-gray print-text-muted mt-1">
              Industrial Fire Tech • GST Registered
            </p>
            <p className="text-xs text-slate-gray print-text-muted">
              Vadodara, Gujarat - 390010
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-status-success/20 text-status-success border border-status-success/30 font-bold text-xs px-3 py-1 rounded-full mb-2 print-border-gray print-text-black">
              TAX INVOICE (PAID)
            </span>
            <h2 className="text-lg font-bold font-mono text-white print-text-black">
              {invoice.invoiceNumber}
            </h2>
            <p className="text-xs text-slate-gray print-text-muted">
              Date: {new Date(invoice.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Billed From / Billed To Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
          {/* Seller Box */}
          <div className="bg-surface-container-high/40 p-5 rounded-xl border border-outline-variant/20 print-bg-gray print-border-gray">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-gray block mb-2 print-text-muted">
              Billed From (Seller)
            </span>
            <p className="font-bold text-white print-text-black">{invoice.sellerName}</p>
            <p className="text-on-surface-variant print-text-muted text-xs mt-1">
              {invoice.sellerAddress}
            </p>
            <p className="text-on-surface-variant print-text-muted text-xs">
              State: {invoice.sellerState}
            </p>
            <p className="font-bold text-primary-container print-text-black text-xs mt-2">
              GSTIN: {invoice.sellerGstin}
            </p>
          </div>

          {/* Buyer Box */}
          <div className="bg-surface-container-high/40 p-5 rounded-xl border border-outline-variant/20 print-bg-gray print-border-gray">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-gray block mb-2 print-text-muted">
              Billed To & Shipping Address
            </span>
            <p className="font-bold text-white print-text-black">{invoice.buyerName}</p>
            <p className="text-on-surface-variant print-text-muted text-xs mt-1">
              {invoice.shippingAddress}
            </p>
            <p className="text-on-surface-variant print-text-muted text-xs">
              State: {invoice.buyerState} | Email: {invoice.buyerEmail}
            </p>
            {invoice.buyerGstin && (
              <p className="font-bold text-tertiary print-text-black text-xs mt-2">
                GSTIN: {invoice.buyerGstin}
              </p>
            )}
          </div>
        </div>

        {/* Order, Payment & Delivery Meta */}
        <div className="bg-surface-container-high/20 p-4 rounded-xl mb-8 flex flex-wrap justify-between gap-4 text-xs border border-outline-variant/10 print-bg-gray print-border-gray">
          <div>
            <span className="text-slate-gray print-text-muted">Order #: </span>
            <span className="font-bold text-white print-text-black">{order.orderNumber}</span>
          </div>
          {order.payment && (
            <div>
              <span className="text-slate-gray print-text-muted">Payment Method: </span>
              <span className="font-bold text-status-success print-text-black uppercase">
                {order.payment.method || "Razorpay Online"} (Captured)
              </span>
            </div>
          )}
          {order.payment?.razorpayPaymentId && (
            <div>
              <span className="text-slate-gray print-text-muted">Txn ID: </span>
              <span className="font-mono text-white print-text-black">
                {order.payment.razorpayPaymentId}
              </span>
            </div>
          )}
          <div className="w-full pt-2 border-t border-outline-variant/10 print-border-gray flex items-center gap-2">
            <Truck size={14} className="text-tertiary print-text-black shrink-0" />
            <span className="text-slate-gray print-text-muted font-medium">Estimated Delivery Date: </span>
            <span className="font-bold text-white print-text-black">
              {deliveryInfo.displayText}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs uppercase tracking-wider text-slate-gray print-border-gray print-text-black">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-2 text-center">HSN/SAC</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Taxable Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 print-border-gray">
              {order.items.map((item, idx) => (
                <tr key={item.id} className="text-on-surface print-text-black">
                  <td className="py-3 px-2 text-slate-gray print-text-muted">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-white print-text-black">
                    {item.product.name}
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-slate-gray print-text-muted font-mono">
                    {item.product.hsnCode || "8424"}
                  </td>
                  <td className="py-3 px-2 text-center font-bold print-text-black">{item.quantity}</td>
                  <td className="py-3 px-4 text-right print-text-black">{formatINR(Number(item.unitPrice))}</td>
                  <td className="py-3 px-4 text-right font-bold print-text-black">
                    {formatINR(Number(item.lineTotal))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax Calculation Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-8">
          {/* Amount In Words */}
          <div className="bg-surface-container-high/30 p-4 rounded-xl border border-outline-variant/20 print-bg-gray print-border-gray">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-gray print-text-muted block mb-1">
              Amount Chargeable (in words)
            </span>
            <p className="font-bold text-white print-text-black text-sm">
              {invoice.amountInWords}
            </p>
            <p className="text-xs text-slate-gray print-text-muted mt-3">
              • Place of Supply: {invoice.buyerState}
              <br />
              • Tax Type: {invoice.isSameState ? "CGST (9%) + SGST (9%)" : "IGST (18%)"}
            </p>
          </div>

          {/* Summary Table */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between py-1 border-b border-outline-variant/10 print-border-gray">
              <span className="text-slate-gray print-text-muted">Total Taxable Value</span>
              <span className="text-white print-text-black font-medium">
                {formatINR(Number(invoice.taxableValue))}
              </span>
            </div>

            {invoice.isSameState ? (
              <>
                <div className="flex justify-between py-1 border-b border-outline-variant/10 print-border-gray">
                  <span className="text-slate-gray print-text-muted">CGST (9%)</span>
                  <span className="text-white print-text-black">
                    {formatINR(Number(invoice.cgstAmount))}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/10 print-border-gray">
                  <span className="text-slate-gray print-text-muted">SGST (9%)</span>
                  <span className="text-white print-text-black">
                    {formatINR(Number(invoice.sgstAmount))}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1 border-b border-outline-variant/10 print-border-gray">
                <span className="text-slate-gray print-text-muted">IGST (18%)</span>
                <span className="text-white print-text-black">
                  {formatINR(Number(invoice.igstAmount))}
                </span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-outline-variant/10 print-border-gray">
              <span className="text-slate-gray print-text-muted">Shipping Charge</span>
              <span className="text-white print-text-black">
                {Number(invoice.shippingValue) > 0
                  ? formatINR(Number(invoice.shippingValue))
                  : "FREE"}
              </span>
            </div>

            <div className="flex justify-between py-3 font-bold text-base border-t-2 border-status-success print-border-gray text-white print-text-black mt-2">
              <span>Grand Total</span>
              <span className="text-status-success print-text-black">
                {formatINR(Number(invoice.grandTotal))}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center text-xs text-slate-gray print-text-muted gap-4 print:border-black">
          <p>This is a computer-generated GST Tax Invoice. No signature required.</p>
          <p className="font-bold text-white print-text-black">
            For DIGITALWORLD Industrial Fire Tech
          </p>
        </div>

      </div>
    </div>
  );
}
