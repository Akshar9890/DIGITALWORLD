export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Check,
} from "lucide-react";

const statusSteps = [
  { key: "pending_payment", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Paid & Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStatusIndex(status: string): number {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { orderId } = await params;

  const order = await db.order.findFirst({
    where: {
      OR: [
        { id: orderId, userId: session.user.id },
        { orderNumber: orderId, userId: session.user.id },
      ],
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, images: true, hsnCode: true } },
        },
      },
      shippingAddress: true,
      payment: true,
      invoice: true,
    },
  });

  if (!order) notFound();

  const currentStep = getStatusIndex(order.status);
  const isPaid = order.paymentStatus === "captured" || order.status !== "pending_payment";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link
          href="/account/orders"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-slate-gray hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-headline-md text-white">Order {order.orderNumber}</h2>
            {isPaid && (
              <span className="bg-status-success/20 text-status-success text-xs px-2.5 py-1 rounded-full font-bold border border-status-success/30 flex items-center gap-1">
                <Check size={12} /> Payment Confirmed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-gray mt-0.5">
            Placed on{" "}
            {order.createdAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Payment Confirmation Banner */}
      {isPaid && (
        <div className="bento-card p-4 border-status-success/30 bg-status-success/10 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-status-success shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">Payment Received Successfully!</p>
            <p className="text-xs text-on-surface-variant">
              Your payment has been captured via Razorpay. Our warehouse team is now packing and preparing your items for shipment.
            </p>
          </div>
        </div>
      )}

      {/* Status Tracker */}
      <div className="bento-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-sm text-white">Fulfillment Status</h3>
          <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
            {order.status === "processing" ? "Paid & Packing" : order.status}
          </span>
        </div>

        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-container-high" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-status-success transition-all"
            style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
          />

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "bg-status-success/20 border-status-success text-status-success"
                      : "bg-surface-container border-outline-variant/30 text-slate-gray"
                  } ${isCurrent ? "ring-2 ring-status-success/30" : ""}`}
                >
                  <step.icon size={18} />
                </div>
                <span
                  className={`text-[11px] font-label-caps tracking-wider text-center ${
                    isCompleted ? "text-on-surface font-bold" : "text-slate-gray"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {order.trackingNumber && (
          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center gap-3">
            <Truck size={16} className="text-tertiary" />
            <div>
              <span className="text-xs text-slate-gray">Tracking Number</span>
              <p className="text-sm text-white font-bold">{order.trackingNumber}</p>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-sm text-tertiary hover:underline"
              >
                Track Shipment
              </a>
            )}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bento-card p-6">
        <h3 className="font-headline-sm text-white mb-4">Items Ordered</h3>
        <div className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center bg-surface-container rounded-lg p-4">
              <div className="h-16 w-16 bg-surface-container-high rounded border border-outline-variant/30 flex items-center justify-center shrink-0">
                <Package size={20} className="text-slate-gray" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`}>
                  <h4 className="text-sm font-medium text-white hover:text-tertiary truncate transition-colors">
                    {item.product.name}
                  </h4>
                </Link>
                <p className="text-xs text-slate-gray mt-1">
                  Qty: {item.quantity} × {formatINR(Number(item.unitPrice))}
                </p>
                <p className="text-xs text-slate-gray">HSN: {item.product.hsnCode}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-white">{formatINR(Number(item.lineTotal))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Summary */}
        <div className="bento-card p-6">
          <h3 className="font-headline-sm text-white mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-tertiary" /> Payment Summary
          </h3>
          <div className="flex flex-col gap-2 text-body-technical">
            <div className="flex justify-between">
              <span className="text-slate-gray">Subtotal</span>
              <span className="text-white">{formatINR(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-gray">Shipping</span>
              <span className="text-white">{formatINR(Number(order.shippingAmount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-gray">GST</span>
              <span className="text-white">{formatINR(Number(order.totalGST))}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant/20">
              <span className="text-white font-bold">Grand Total</span>
              <span className="text-primary-container font-bold">{formatINR(Number(order.grandTotal))}</span>
            </div>
          </div>
          {order.payment && (
            <div className="mt-4 pt-3 border-t border-outline-variant/20 text-xs text-slate-gray flex items-center justify-between">
              <div>
                <span>Payment Status: </span>
                <span className="text-status-success font-bold uppercase">
                  {order.payment.status === "captured" ? "✓ CONFIRMED (PAID)" : order.payment.status}
                </span>
                {order.payment.method && <span className="text-slate-gray"> via {order.payment.method.toUpperCase()}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bento-card p-6">
            <h3 className="font-headline-sm text-white mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-tertiary" /> Shipping Address
            </h3>
            <div className="text-body-technical text-on-surface-variant flex flex-col gap-1">
              <p className="text-white font-bold">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* Invoice */}
      {order.invoice && (
        <div className="bento-card p-6 flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-white">Invoice</h3>
            <p className="text-xs text-slate-gray">{order.invoice.invoiceNumber}</p>
          </div>
          {order.invoice.pdfUrl && (
            <a
              href={order.invoice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-2 px-4"
            >
              DOWNLOAD INVOICE
            </a>
          )}
        </div>
      )}
    </div>
  );
}
