"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Filter, ExternalLink } from "lucide-react";
import { formatINR } from "@/lib/utils";
import Link from "next/link";

interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  validUntil: string;
  product: { name: string; slug: string } | null;
}

const STATUS_BADGE: Record<string, string> = {
  open: "badge-info",
  quoted: "badge-pending",
  accepted: "badge-success",
  converted: "badge-success",
  expired: "badge-error",
  closed: "badge-error",
};

const TABS = ["all", "open", "quoted", "accepted", "converted", "expired", "closed"] as const;

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = activeTab !== "all" ? `?status=${activeTab}` : "";
    fetch(`/api/admin/quotations${params}`)
      .then((res) => res.json())
      .then((data) => {
        setQuotations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);

  const filtered = quotations.filter((q) => {
    const term = search.toLowerCase();
    return (
      q.quotationNumber?.toLowerCase().includes(term) ||
      q.customerName?.toLowerCase().includes(term) ||
      q.customerEmail?.toLowerCase().includes(term) ||
      q.product?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-primary-container" />
          <h1 className="font-headline-md text-white">Quotations</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-gray">
          <Filter size={14} />
          <span>{filtered.length} records</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
        <input
          type="text"
          placeholder="Search by quotation #, name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-control text-sm font-medium whitespace-nowrap capitalize transition-colors ${
              activeTab === tab
                ? "bg-primary-container/20 text-primary-container border border-primary-container/30"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bento-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
            <p className="text-slate-gray mt-4 text-sm">Loading quotations…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="text-slate-gray mx-auto mb-4" />
            <h3 className="font-headline-sm text-white mb-2">No quotations found</h3>
            <p className="text-body-technical text-on-surface-variant">
              {search ? "No quotations match your search." : "No quotations in this category yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quotation #</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Valid Until</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => {
                  const isExpired = q.validUntil && new Date(q.validUntil) < new Date();
                  return (
                    <tr key={q.id}>
                      <td className="font-medium text-white font-mono text-xs">{q.quotationNumber}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-white">{q.customerName}</span>
                          <span className="text-xs text-slate-gray">{q.customerEmail}</span>
                          <span className="text-xs text-slate-gray">{q.customerPhone}</span>
                        </div>
                      </td>
                      <td className="text-sm">{q.product?.name ?? "—"}</td>
                      <td>{q.quantity}</td>
                      <td className="font-medium text-white">{formatINR(Number(q.grandTotal))}</td>
                      <td>
                        <span className={STATUS_BADGE[q.status] ?? "badge"}>
                          {q.status}
                        </span>
                      </td>
                      <td className="text-slate-gray text-sm">
                        {new Date(q.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className={`text-sm ${isExpired ? "text-status-error" : "text-slate-gray"}`}>
                        {q.validUntil
                          ? new Date(q.validUntil).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/quotation/${q.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 btn-secondary text-xs px-3 py-1.5"
                        >
                          <ExternalLink size={13} />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
