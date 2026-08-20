"use client";

import { useState, useEffect } from "react";
import { Users, Search, ShoppingBag, FileText, IndianRupee } from "lucide-react";
import { formatINR } from "@/lib/utils";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  adminSubRole: string | null;
  createdAt: string;
  ordersCount: number;
  quotationsCount: number;
  totalSpent: number;
  lastOrder?: {
    orderNumber: string;
    status: string;
    createdAt: string;
  } | null;
}

const ROLE_BADGE: Record<string, string> = {
  admin: "badge-info",
  wholesale_approved: "badge-success",
  wholesale_pending: "badge-pending",
  retail: "badge-pending",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone ?? "").includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-primary-container" />
          <h1 className="font-headline-md text-white">Registered Users & Customers</h1>
        </div>
        <span className="text-xs text-slate-gray">{filtered.length} users</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Table */}
      <div className="bento-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
            <p className="text-slate-gray mt-4 text-sm">Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="text-slate-gray mx-auto mb-4" />
            <h3 className="font-headline-sm text-white mb-2">No users found</h3>
            <p className="text-body-technical text-on-surface-variant">
              {search ? "No users match your search." : "No users yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th className="text-center">Orders</th>
                  <th className="text-right">Total Spent</th>
                  <th className="text-center">Quotations</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{user.name ?? "—"}</span>
                        <span className="text-xs text-slate-gray">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-on-surface-variant">
                        {user.phone || "—"}
                      </span>
                    </td>
                    <td>
                      <span className={ROLE_BADGE[user.role] ?? "badge"}>
                        {user.role?.replace(/_/g, " ")}
                      </span>
                      {user.adminSubRole && (
                        <span className="badge-info ml-1 text-[10px]">{user.adminSubRole}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {user.ordersCount > 0 ? (
                        <Link
                          href={`/admin/orders?query=${encodeURIComponent(user.email)}`}
                          className="inline-flex items-center gap-1 text-primary-container hover:underline font-bold text-xs"
                        >
                          <ShoppingBag size={12} />
                          {user.ordersCount}
                        </Link>
                      ) : (
                        <span className="text-slate-gray text-xs">0</span>
                      )}
                    </td>
                    <td className="text-right font-medium">
                      {user.totalSpent > 0 ? (
                        <span className="text-status-success text-xs font-mono font-bold">
                          {formatINR(user.totalSpent)}
                        </span>
                      ) : (
                        <span className="text-slate-gray text-xs">₹0</span>
                      )}
                    </td>
                    <td className="text-center">
                      {user.quotationsCount > 0 ? (
                        <Link
                          href={`/admin/quotations?query=${encodeURIComponent(user.email)}`}
                          className="inline-flex items-center gap-1 text-tertiary hover:underline font-bold text-xs"
                        >
                          <FileText size={12} />
                          {user.quotationsCount}
                        </Link>
                      ) : (
                        <span className="text-slate-gray text-xs">0</span>
                      )}
                    </td>
                    <td className="text-slate-gray text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
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
      </div>
    </div>
  );
}
