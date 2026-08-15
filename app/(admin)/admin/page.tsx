"use client";



import { useEffect, useState } from "react";
import { formatINR } from "@/lib/utils";
import {
  Users,
  Package,
  ShoppingCart,
  FileText,
  Building2,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

interface DashboardData {
  totals: {
    users: number;
    products: number;
    orders: number;
    quotations: number;
    companies: number;
  };
  revenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    grandTotal: number;
    status: string;
    createdAt: string;
    user: { name: string | null; email: string } | null;
  }[];
  recentQuotations: {
    id: string;
    quotationNumber: string;
    customerName: string;
    grandTotal: number;
    status: string;
    createdAt: string;
  }[];
  ordersByStatus: { status: string; count: number }[];
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "processing")
    return <span className="badge-success">Paid (Processing)</span>;
  if (["delivered", "completed", "approved", "paid"].includes(s))
    return <span className="badge-success">{status}</span>;
  if (["pending", "sent", "in_progress"].includes(s))
    return <span className="badge-pending">{status.replace("_", " ")}</span>;
  if (["cancelled", "rejected", "refunded", "failed"].includes(s))
    return <span className="badge-error">{status}</span>;
  return <span className="badge-info">{status}</span>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-gray">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bento-card p-12 text-center">
        <p className="text-status-error font-headline-sm">
          {error ?? "Unable to load dashboard data."}
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Users", value: data.totals.users, icon: Users },
    { label: "Products", value: data.totals.products, icon: Package },
    { label: "Orders", value: data.totals.orders, icon: ShoppingCart },
    { label: "Quotations", value: data.totals.quotations, icon: FileText },
    { label: "B2B Companies", value: data.totals.companies, icon: Building2 },
    {
      label: "Total Revenue",
      value: formatINR(data.revenue),
      icon: IndianRupee,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline-md text-white">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-2 text-primary-container mb-1">
              <stat.icon size={16} />
              <span className="stat-label">{stat.label}</span>
            </div>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <section className="bento-card p-6">
        <h2 className="font-headline-sm text-white mb-4">Recent Orders</h2>
        {data.recentOrders.length === 0 ? (
          <p className="text-slate-gray text-sm py-8 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.orderNumber}</td>
                    <td>{order.user?.email ?? "—"}</td>
                    <td>{formatINR(Number(order.grandTotal))}</td>
                    <td>{statusBadge(order.status)}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Quotations */}
      <section className="bento-card p-6">
        <h2 className="font-headline-sm text-white mb-4">Recent Quotations</h2>
        {data.recentQuotations.length === 0 ? (
          <p className="text-slate-gray text-sm py-8 text-center">No quotations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quotation #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentQuotations.map((qt) => (
                  <tr key={qt.id}>
                    <td className="font-medium">{qt.quotationNumber}</td>
                    <td>{qt.customerName}</td>
                    <td>{formatINR(Number(qt.grandTotal))}</td>
                    <td>{statusBadge(qt.status)}</td>
                    <td>
                      {new Date(qt.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Orders by Status */}
      <section className="bento-card p-6">
        <h2 className="font-headline-sm text-white mb-4">Orders by Status</h2>
        {data.ordersByStatus.length === 0 ? (
          <p className="text-slate-gray text-sm py-8 text-center">No data.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.ordersByStatus.map((item) => (
              <li
                key={item.status}
                className="flex items-center justify-between px-4 py-2 rounded-control bg-surface-container-high/50"
              >
                <div className="flex items-center gap-3">
                  {statusBadge(item.status)}
                  <span className="text-on-surface-variant text-sm capitalize">
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <span className="text-on-surface font-medium">{item.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
