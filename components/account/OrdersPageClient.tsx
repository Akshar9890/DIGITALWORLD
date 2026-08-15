"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, Search, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Order = {
  id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  trackingNumber: string | null;
  items: {
    product: { name: string; slug: string };
    quantity: number;
    unitPrice: number;
  }[];
};

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusColor(status: string) {
  if (["delivered", "completed"].includes(status))
    return "bg-status-success/20 text-status-success";
  if (["processing", "shipped"].includes(status))
    return "bg-tertiary/20 text-tertiary";
  if (["cancelled", "refunded", "payment_failed"].includes(status))
    return "bg-status-error/20 text-status-error";
  return "bg-surface-container-high text-slate-gray";
}

export default function OrdersPageClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsSearching(true);
    setTrackingError("");

    try {
      const res = await fetch(
        `/api/account/track?orderId=${encodeURIComponent(trackingId.trim())}`
      );

      if (!res.ok) {
        const data = await res.json();
        setTrackingError(data.error || "Order not found");
        return;
      }

      const order = await res.json();
      router.push(`/account/orders/${order.id}`);
    } catch {
      setTrackingError("Failed to search for order");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h2 className="font-headline-md text-white">Order History</h2>

        {/* Order Tracking Search */}
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray"
            />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => {
                setTrackingId(e.target.value);
                setTrackingError("");
              }}
              className="input-field pl-9 w-56 text-sm"
              placeholder="Track by Order ID"
            />
          </div>
          <Button type="submit" size="sm" isLoading={isSearching}>
            <Truck size={14} /> TRACK
          </Button>
        </form>
      </div>

      {trackingError && (
        <div className="bg-error-container/20 border border-status-error/30 text-status-error px-4 py-3 rounded-control text-sm">
          {trackingError}
        </div>
      )}

      {initialOrders.length === 0 ? (
        <div className="bento-card p-12 text-center flex flex-col items-center justify-center">
          <Package size={48} className="text-slate-gray mb-4" />
          <h3 className="font-headline-sm text-white mb-2">No orders found</h3>
          <p className="text-body-technical text-on-surface-variant max-w-sm mb-6">
            You haven&apos;t placed any orders yet. Discover our range of safety products.
          </p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {initialOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="bento-card p-6 border-outline-variant/20 overflow-hidden hover:border-tertiary/40 transition-colors group"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-outline-variant/10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-headline-sm text-white">
                      {order.orderNumber || `Order #${order.id.slice(0, 8)}`}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-xs text-slate-gray">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col sm:items-end">
                    <span className="font-headline-sm text-white">
                      {formatINR(Number(order.grandTotal))}
                    </span>
                    <span className="text-xs text-slate-gray">
                      {order.items.length} items
                    </span>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-gray group-hover:text-tertiary group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="h-10 w-10 bg-surface-container rounded border border-outline-variant/30 flex items-center justify-center shrink-0">
                      <Package size={14} className="text-slate-gray" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-white truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-gray">
                        Qty: {item.quantity} × {formatINR(Number(item.unitPrice))}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-slate-gray ml-13">
                    +{order.items.length - 3} more item(s)
                  </p>
                )}
              </div>

              {order.trackingNumber && (
                <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center gap-2 text-xs text-tertiary">
                  <Truck size={14} />
                  <span>Tracking: {order.trackingNumber}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
