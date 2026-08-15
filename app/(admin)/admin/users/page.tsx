"use client";



import { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  adminSubRole: string | null;
  createdAt: string;
  _count: { orders: number; quotations: number };
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
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-primary-container" />
          <h1 className="font-headline-md text-white">Users</h1>
        </div>
        <span className="text-xs text-slate-gray">{filtered.length} users</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
        <input
          type="text"
          placeholder="Search by name or email..."
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Quotations</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium text-white">{user.name ?? "—"}</td>
                    <td className="text-on-surface-variant">{user.email}</td>
                    <td className="text-on-surface-variant">{user.phone ?? "—"}</td>
                    <td>
                      <span className={ROLE_BADGE[user.role] ?? "badge"}>
                        {user.role?.replace(/_/g, " ")}
                      </span>
                      {user.adminSubRole && (
                        <span className="badge-info ml-1 text-[10px]">{user.adminSubRole}</span>
                      )}
                    </td>
                    <td className="text-center">{user._count?.orders ?? 0}</td>
                    <td className="text-center">{user._count?.quotations ?? 0}</td>
                    <td className="text-slate-gray text-sm">
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
