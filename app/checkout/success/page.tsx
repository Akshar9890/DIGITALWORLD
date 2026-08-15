import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatINR } from "@/lib/utils";

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

  return (
    <div className="page-container py-20 flex flex-col items-center text-center min-h-[80vh] justify-center">
      <div className="bento-card p-10 md:p-14 max-w-2xl w-full flex flex-col items-center gap-6 animate-fade-in-up">

        {/* Success Icon */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-status-success/20 flex items-center justify-center ring-4 ring-status-success/30">
            <CheckCircle2 size={48} className="text-status-success" />
          </div>
        </div>

        <div>
          <h1 className="font-headline-lg text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-on-surface-variant text-sm max-w-md">
            Your order has been confirmed and is now being prepared for dispatch. You'll receive updates on your email.
          </p>
        </div>

        {/* Order Reference */}
        <div className="w-full bg-surface-container rounded-xl p-5 flex flex-col gap-3 text-sm text-left border border-outline-variant/20">
          <div className="flex justify-between items-center">
            <span className="text-slate-gray">Order Number</span>
            <span className="font-bold text-white font-mono">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-gray">Amount Paid</span>
            <span className="font-bold text-status-success">{formatINR(Number(order.grandTotal))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-gray">Status</span>
            <span className="badge-success">Processing</span>
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

        {/* What happens next */}
        <div className="w-full bg-tertiary/5 border border-tertiary/20 rounded-xl p-4 text-left">
          <p className="text-tertiary text-xs font-bold uppercase tracking-wider mb-3">What happens next?</p>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li className="flex items-center gap-2"><Package size={13} className="text-tertiary shrink-0" /> Your order is being processed by our team</li>
            <li className="flex items-center gap-2"><Package size={13} className="text-tertiary shrink-0" /> You'll receive a confirmation email with your GST invoice</li>
            <li className="flex items-center gap-2"><Package size={13} className="text-tertiary shrink-0" /> Dispatch typically happens within 1–2 business days</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
          <Link href="/account/orders" className="flex-1">
            <Button className="w-full gap-2">
              <Package size={16} /> VIEW MY ORDERS
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
