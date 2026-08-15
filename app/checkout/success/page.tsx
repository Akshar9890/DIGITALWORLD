export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Package, ArrowRight, FileText, Download, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatINR } from "@/lib/utils";
import { getOrCreateInvoice } from "@/lib/invoice";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId: string };
}) {
  const { orderId } = searchParams;

  if (!orderId) redirect("/");

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { name: true } } } },
    },
  });

  if (!order) redirect("/");

  // Ensure invoice is generated in database
  const invoice = await getOrCreateInvoice(order.id);

  return (
    <div className="page-container py-16 flex flex-col items-center text-center min-h-[80vh] justify-center">
      <div className="bento-card p-8 md:p-12 max-w-2xl w-full flex flex-col items-center gap-6 animate-fade-in-up">

        {/* Success Icon */}
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-status-success/20 flex items-center justify-center ring-4 ring-status-success/30">
            <CheckCircle2 size={42} className="text-status-success" />
          </div>
        </div>

        <div>
          <h1 className="font-headline-lg text-white mb-1">Payment Successful! 🎉</h1>
          <p className="text-on-surface-variant text-sm max-w-md">
            Your order has been confirmed and is now being prepared for dispatch. Your GST Tax Invoice is ready below.
          </p>
        </div>

        {/* Order Reference */}
        <div className="w-full bg-surface-container rounded-xl p-5 flex flex-col gap-3 text-sm text-left border border-outline-variant/20">
          <div className="flex justify-between items-center">
            <span className="text-slate-gray">Order Number</span>
            <span className="font-bold text-white font-mono">{order.orderNumber}</span>
          </div>
          {invoice && (
            <div className="flex justify-between items-center">
              <span className="text-slate-gray">GST Invoice Number</span>
              <span className="font-bold text-tertiary font-mono">{invoice.invoiceNumber}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-slate-gray">Amount Paid</span>
            <span className="font-bold text-status-success">{formatINR(Number(order.grandTotal))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-gray">Status</span>
            <span className="badge-success">Paid & Processing</span>
          </div>
          {order.items.length > 0 && (
            <div className="pt-2 border-t border-outline-variant/20">
              <p className="text-slate-gray mb-2">Items Ordered</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-on-surface-variant">
                  <span className="line-clamp-1 flex-1 pr-4">{item.product.name}</span>
                  <span className="shrink-0">× {item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Download / View Box */}
        <div className="w-full bg-status-success/10 border border-status-success/30 rounded-xl p-4 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="text-status-success shrink-0" size={28} />
            <div>
              <p className="text-sm font-bold text-white">GST Tax Invoice Ready</p>
              <p className="text-xs text-on-surface-variant">View your official GST invoice online or download a PDF receipt.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Link href={`/orders/${order.id}/invoice`} className="flex-1 sm:flex-none">
              <Button size="sm" className="w-full gap-1 text-xs py-2 px-3">
                <Eye size={14} /> VIEW ONLINE
              </Button>
            </Link>
            <a
              href={`/api/orders/${order.id}/invoice/pdf?download=1`}
              download={`${invoice?.invoiceNumber || order.orderNumber}.pdf`}
              className="flex-1 sm:flex-none"
            >
              <Button size="sm" variant="secondary" className="w-full gap-1 text-xs py-2 px-3 border-status-success text-status-success hover:bg-status-success/20">
                <Download size={14} /> DOWNLOAD PDF
              </Button>
            </a>
          </div>
        </div>

        {/* What happens next */}
        <div className="w-full bg-tertiary/5 border border-tertiary/20 rounded-xl p-4 text-left">
          <p className="text-tertiary text-xs font-bold uppercase tracking-wider mb-2">What happens next?</p>
          <ul className="space-y-1.5 text-xs text-on-surface-variant">
            <li className="flex items-center gap-2"><Package size={13} className="text-tertiary shrink-0" /> Your order is being processed by our warehouse team</li>
            <li className="flex items-center gap-2"><Package size={13} className="text-tertiary shrink-0" /> You can view/download your GST Tax Invoice anytime from your account</li>
            <li className="flex items-center gap-2"><Package size={13} className="text-tertiary shrink-0" /> Dispatch typically happens within 1–2 business days</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full pt-1">
          <Link href="/account/orders" className="flex-1">
            <Button className="w-full gap-2" variant="secondary">
              <Package size={16} /> VIEW ALL ORDERS
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="secondary" className="w-full gap-2 border-tertiary text-tertiary">
              CONTINUE SHOPPING <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-gray">
          Questions? Contact us at{" "}
          <a href="mailto:digitalworld9890@gmail.com" className="text-tertiary hover:underline">
            digitalworld9890@gmail.com
          </a>{" "}
          or WhatsApp{" "}
          <a href="https://wa.me/917043633303" className="text-tertiary hover:underline">
            +91 70436 33303
          </a>
        </p>
      </div>
    </div>
  );
}
