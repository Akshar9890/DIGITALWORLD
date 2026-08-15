"use client";

export const dynamic = "force-dynamic";


import { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";
import {
  ShoppingCart,
  Search,
  Filter,
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";

type OrderStatus =
  | "pending_payment"
  | "payment_failed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  grandTotal: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

const STATUS_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending_payment: "badge-pending",
  payment_failed: "badge-error",
  processing: "badge-info",
  shipped: "badge-success",
  delivered: "badge-success",
  cancelled: "badge-error",
  refunded: "badge-error",
};

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Payment Failed", value: "payment_failed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

const STATUS_ICONS: Record<string, typeof Package> = {
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async (status?: OrderStatus | "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") {
        params.set("status", status);
      }
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="text-tertiary" size={24} />
          <h2 className="font-headline-md text-white">Orders</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-gray">
          <Filter size={14} />
          <span>{filteredOrders.length} orders</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray"
        />
        <input
          type="text"
          placeholder="Search by order #, customer name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-control text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? "bg-primary-container/20 text-primary-container border border-primary-container/30"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bento-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
            <p className="text-slate-gray mt-4 text-sm">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Package size={48} className="text-slate-gray mb-4" />
            <h3 className="font-headline-sm text-white mb-2">No orders found</h3>
            <p className="text-body-technical text-on-surface-variant max-w-sm">
              {searchQuery
                ? "No orders match your search criteria."
                : "There are no orders in this category yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td className="font-medium text-white">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-white">{order.customerName}</span>
                          <span className="text-xs text-slate-gray">
                            {order.customerEmail}
                          </span>
                        </div>
                      </td>
                      <td>{order.items.length}</td>
                      <td className="font-medium text-white">
                        {formatINR(order.grandTotal)}
                      </td>
                      <td>
                        <span className={STATUS_BADGE[order.status]}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="text-slate-gray">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <ChevronDown
                          size={16}
                          className={`text-slate-gray transition-transform ${
                            expandedOrderId === order.id ? "rotate-180" : ""
                          }`}
                        />
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {expandedOrderId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-surface-container/30">
                        <td colSpan={7} className="!p-0">
                          <div className="p-6 flex flex-col gap-6 animate-fade-in-up">
                            {/* Order Items */}
                            <div>
                              <h4 className="text-sm font-label-caps text-on-surface-variant tracking-wider mb-3">
                                Order Items
                              </h4>
                              <div className="flex flex-col gap-3">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between bg-surface-container rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 bg-surface-container-high rounded border border-outline-variant/30 flex items-center justify-center shrink-0">
                                        <Package size={14} className="text-slate-gray" />
                                      </div>
                                      <div>
                                        <span className="text-sm text-white">
                                          {item.productName}
                                        </span>
                                        <span className="text-xs text-slate-gray ml-2">
                                          Qty: {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-sm text-white font-medium">
                                      {formatINR(item.total)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-surface-container rounded-lg p-4">
                                <span className="text-xs text-slate-gray uppercase tracking-wider">
                                  Payment Method
                                </span>
                                <p className="text-sm text-white mt-1">
                                  {order.paymentMethod || "N/A"}
                                </p>
                              </div>
                              <div className="bg-surface-container rounded-lg p-4">
                                <span className="text-xs text-slate-gray uppercase tracking-wider">
                                  Shipping Address
                                </span>
                                <p className="text-sm text-white mt-1">
                                  {order.shippingAddress || "N/A"}
                                </p>
                              </div>
                              <div className="bg-surface-container rounded-lg p-4">
                                <span className="text-xs text-slate-gray uppercase tracking-wider">
                                  Notes
                                </span>
                                <p className="text-sm text-white mt-1">
                                  {order.notes || "No notes"}
                                </p>
                              </div>
                            </div>

                            {/* Status Update */}
                            <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/10">
                              <span className="text-sm text-on-surface-variant">
                                Update Status:
                              </span>
                              <div className="relative">
                                <select
                                  value={order.status}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(
                                      order.id,
                                      e.target.value as OrderStatus
                                    );
                                  }}
                                  disabled={updatingStatus === order.id}
                                  onClick={(e) => e.stopPropagation()}
                                  className="input-field appearance-none pr-8 min-w-[180px] disabled:opacity-50"
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={14}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-gray pointer-events-none"
                                />
                              </div>
                              {updatingStatus === order.id && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
