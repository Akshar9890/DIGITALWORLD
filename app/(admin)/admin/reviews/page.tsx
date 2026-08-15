"use client";



import { useState, useEffect } from "react";
import { Star, Search, Filter, Check, X } from "lucide-react";

interface Review {
  id: string;
  product: { name: string; slug: string };
  user: { name: string | null; email: string };
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-pending",
  published: "badge-success",
  flagged: "badge-error",
  rejected: "badge-error",
};

const TABS = ["all", "pending", "published", "flagged", "rejected"] as const;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = (status?: string) => {
    setLoading(true);
    const params = status && status !== "all" ? `?status=${status}` : "";
    fetch(`/api/admin/reviews${params}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } catch (err) {
      console.error("Failed to update review:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reviews.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.product?.name?.toLowerCase().includes(term) ||
      (r.user?.name ?? "").toLowerCase().includes(term) ||
      r.user?.email?.toLowerCase().includes(term)
    );
  });

  const renderStars = (count: number) => (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "fill-primary-container text-primary-container" : "text-slate-gray"}
        />
      ))}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star size={24} className="text-primary-container" />
          <h1 className="font-headline-md text-white">Reviews</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-gray">
          <Filter size={14} />
          <span>{filtered.length} reviews</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
        <input
          type="text"
          placeholder="Search by product, user, or email..."
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
            <p className="text-slate-gray mt-4 text-sm">Loading reviews…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Star size={48} className="text-slate-gray mx-auto mb-4" />
            <h3 className="font-headline-sm text-white mb-2">No reviews found</h3>
            <p className="text-body-technical text-on-surface-variant">
              {search ? "No reviews match your search." : "No reviews in this category yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((review) => (
                  <tr key={review.id}>
                    <td className="font-medium text-white">{review.product?.name ?? "—"}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-white">{review.user?.name ?? "—"}</span>
                        <span className="text-xs text-slate-gray">{review.user?.email}</span>
                      </div>
                    </td>
                    <td>{renderStars(review.rating)}</td>
                    <td className="max-w-xs">
                      <p className="text-sm text-on-surface-variant truncate" title={review.comment}>
                        {review.comment?.length > 80
                          ? review.comment.slice(0, 80) + "…"
                          : review.comment}
                      </p>
                    </td>
                    <td>
                      <span className={STATUS_BADGE[review.status] ?? "badge"}>
                        {review.status}
                      </span>
                    </td>
                    <td className="text-slate-gray text-sm">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-right">
                      {review.status === "pending" || review.status === "flagged" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Approve"
                            disabled={actionLoading === review.id}
                            onClick={() => handleStatusChange(review.id, "published")}
                            className="p-2 rounded-control bg-surface-container-high hover:bg-status-success/20 text-on-surface-variant hover:text-status-success transition-colors disabled:opacity-50"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            title="Reject"
                            disabled={actionLoading === review.id}
                            onClick={() => handleStatusChange(review.id, "rejected")}
                            className="p-2 rounded-control bg-surface-container-high hover:bg-status-error/20 text-on-surface-variant hover:text-status-error transition-colors disabled:opacity-50"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-gray text-sm">—</span>
                      )}
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
