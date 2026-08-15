"use client";

import { useState, useEffect } from "react";
import { Building2, Check, X, Eye, Filter } from "lucide-react";

interface Company {
  id: string;
  companyName: string;
  gstin: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  assignedTier: {
    id: string;
    name: string;
  } | null;
}

type FilterTab = "all" | "pending" | "approved" | "rejected";

const statusBadgeClass: Record<string, string> = {
  pending: "badge-pending",
  approved: "badge-success",
  rejected: "badge-error",
};

const tabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCompanies = (status?: FilterTab) => {
    setLoading(true);
    const url = status && status !== "all"
      ? `/api/admin/companies?status=${status}`
      : "/api/admin/companies";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies(activeTab);
  }, [activeTab]);

  const handleApprove = async (companyId: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      setSelectedCompany(null);
      fetchCompanies(activeTab);
    } catch (err) {
      console.error("Failed to approve company:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (companyId: string) => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionReason }),
      });
      setSelectedCompany(null);
      setShowRejectInput(false);
      setRejectionReason("");
      fetchCompanies(activeTab);
    } catch (err) {
      console.error("Failed to reject company:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectPanel = () => {
    setShowRejectInput(true);
    setRejectionReason("");
  };

  const cancelReject = () => {
    setShowRejectInput(false);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      <div className="bento-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">B2B Companies</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-gray">
            <Filter size={16} />
            <span>{companies.length} total</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>GSTIN</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className="font-medium">{company.companyName}</td>
                    <td>{company.user.name ?? "—"}</td>
                    <td>{company.user.email}</td>
                    <td className="font-mono text-sm">{company.gstin}</td>
                    <td>
                      <span className={statusBadgeClass[company.status] ?? "badge"}>
                        {company.status}
                      </span>
                    </td>
                    <td>
                      {new Date(company.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedCompany(company)}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-8">
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCompany && (
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="font-headline-sm text-white">
                {selectedCompany.companyName}
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedCompany(null);
                setShowRejectInput(false);
                setRejectionReason("");
              }}
              className="text-slate-gray hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-gray block mb-1">Contact Person</span>
              <span className="text-on-surface">{selectedCompany.user.name ?? "—"}</span>
            </div>
            <div>
              <span className="text-slate-gray block mb-1">Email</span>
              <span className="text-on-surface">{selectedCompany.user.email}</span>
            </div>
            <div>
              <span className="text-slate-gray block mb-1">Phone</span>
              <span className="text-on-surface">{selectedCompany.user.phone ?? "—"}</span>
            </div>
            <div>
              <span className="text-slate-gray block mb-1">GSTIN</span>
              <span className="text-on-surface font-mono">{selectedCompany.gstin}</span>
            </div>
          </div>

          {selectedCompany.assignedTier && (
            <div className="text-sm">
              <span className="text-slate-gray">Assigned Tier: </span>
              <span className="badge-wholesale">{selectedCompany.assignedTier.name}</span>
            </div>
          )}

          {selectedCompany.status === "pending" && (
            <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/20">
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedCompany.id)}
                  disabled={actionLoading}
                  className="btn-primary"
                >
                  <Check size={16} />
                  Approve
                </button>
                {!showRejectInput && (
                  <button
                    onClick={openRejectPanel}
                    disabled={actionLoading}
                    className="btn-danger"
                  >
                    <X size={16} />
                    Reject
                  </button>
                )}
              </div>

              {showRejectInput && (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Enter rejection reason..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="input-field"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(selectedCompany.id)}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="btn-danger"
                    >
                      <X size={16} />
                      Confirm Reject
                    </button>
                    <button
                      onClick={cancelReject}
                      disabled={actionLoading}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedCompany.status !== "pending" && selectedCompany.rejectionReason && (
            <div className="text-sm pt-4 border-t border-outline-variant/20">
              <span className="text-slate-gray">Rejection Reason: </span>
              <span className="text-status-error">{selectedCompany.rejectionReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
