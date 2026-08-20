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
  ReceiptText,
  Download,
} from "lucide-react";
import ShipmentTrackerCard from "@/components/shipping/ShipmentTrackerCard";

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
      shipments: {
        include: {
          trackingEvents: { orderBy: { eventTimestamp: "desc" } },
        },
      },
    },
  });

  if (!order) notFound();

  const currentStep = getStatusIndex(order.status);
  const rawShipment = order.shipments?.[0];
  const activeShipment = rawShipment
    ? {
        ...rawShipment,
        shippingCost: rawShipment.shippingCost ? Number(rawShipment.shippingCost) : 0,
      }
    : null;
  const isPaid = order.paymentStatus === "captured" || order.status !== "pending_payment";

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/account/orders"
        className="flex items-center gap-2 text-sm text-slate-gray hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-md text-white">{order.orderNumber}</h1>
            <span className="badge-info text-xs">
              {order.status === "processing" ? "Paid & Processing" : order.status}
            </span>
          </div>
          <p className="text-xs text-slate-gray mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/orders/${order.id}/invoice`}
            className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
          >
            <ReceiptText size={14} /> View Invoice
          </Link>
          <a
            href={`/api/orders/${order.id}/invoice/pdf`}
            download={`Invoice-${order.orderNumber}.pdf`}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            <Download size={14} /> Download PDF
          </a>
        </div>
      </div>

      {/* Payment Captured Notice Banner */}
      {order.paymentStatus === "captured" && (
        <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-status-success shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Payment Confirmed (₹{Number(order.grandTotal).toLocaleString("en-IN")})
            </span>
            <p className="text-xs text-on-surface-variant">
              Your payment has been captured via Razorpay. Our warehouse team is now packing and preparing your items for shipment.
            </p>
          </div>
        </div>
      )}

      {/* Live Courier Tracking Tracker */}
      {activeShipment ? (
        <ShipmentTrackerCard shipment={activeShipment as any} />
      ) : (
        /* Default Preparation Tracker */
        <div className="bento-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-sm text-white">Fulfillment Status</h3>
            <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
              {order.status === "processing" ? "Paid & Packing" : order.status}
            </span>
          </div>

          <div className="flex items-center justify-between relative">
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
        </div>
      )}

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
            <CreditCard size={18} className="text-tertiary" /> Payment &amp; Tax Summary
          </h3>
          <div className="flex flex-col gap-2 text-body-technical text-xs md:text-sm">
            <div className="flex justify-between">
              <span className="text-slate-gray">Taxable Subtotal</span>
              <span className="text-white font-medium">{formatINR(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-gray">Shipping &amp; Handling</span>
              <span className="text-white">{formatINR(Number(order.shippingAmount))}</span>
            </div>

            {/* Statutory Tax Breakdown */}
            <div className="py-2 border-y border-outline-variant/15 flex flex-col gap-1.5 bg-surface-container/40 p-2.5 rounded-lg">
              <div className="flex justify-between text-slate-gray text-[11px]">
                <span>Place of Supply</span>
                <span className="font-bold text-white">{order.buyerState || "Gujarat"}</span>
              </div>
              <div className="flex justify-between text-slate-gray text-[11px]">
                <span>Applicable GST Rate</span>
                <span className="font-mono text-tertiary font-bold">18% (HSN 8424)</span>
              </div>

              {order.isSameState ? (
                <>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>CGST (9%)</span>
                    <span className="font-mono text-white">{formatINR(Number(order.cgstAmount))}</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>SGST (9%)</span>
                    <span className="font-mono text-white">{formatINR(Number(order.sgstAmount))}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>IGST (18%)</span>
                  <span className="font-mono text-white">{formatINR(Number(order.igstAmount || order.totalGST))}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-slate-gray font-bold">Total GST (18%)</span>
              <span className="text-white font-bold">{formatINR(Number(order.totalGST))}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-sm md:text-base">
              <span className="text-white font-black">Grand Total</span>
              <span className="text-primary-container font-black">{formatINR(Number(order.grandTotal))}</span>
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

      {/* Tax Invoice Section */}
      {isPaid && (
        <div className="bento-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-status-success/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-status-success/20 flex items-center justify-center text-status-success shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-headline-sm text-white">GST Tax Invoice</h3>
              <p className="text-xs text-slate-gray">
                {order.invoice?.invoiceNumber || `DW-INV-2026-${order.orderNumber.replace("DW-2026-", "")}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/orders/${order.id}/invoice`}
              className="btn-primary text-xs py-2 px-4 flex-1 sm:flex-none text-center"
            >
              VIEW ONLINE
            </Link>
            <a
              href={`/api/orders/${order.id}/invoice/pdf?download=1`}
              download={`DW-INV-${order.orderNumber}.pdf`}
              className="btn-secondary text-xs py-2 px-4 border-status-success text-status-success flex-1 sm:flex-none text-center hover:bg-status-success/20"
            >
              DOWNLOAD PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
