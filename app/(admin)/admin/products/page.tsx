"use client";

export const dynamic = "force-dynamic";


import { useEffect, useState } from "react";
import { formatINR } from "@/lib/utils";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  Loader2,
} from "lucide-react";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

type TierPrice = {
  id: string;
  pricePerUnit: number;
  currency: string;
  tier: {
    id: string;
    name: string;
    minQty: number;
    maxQty: number | null;
  };
};

type Product = {
  id: string;
  name: string;
  slug: string;
  weightGrams: number;
  isActive: boolean;
  stockStatus: StockStatus;
  prices: TierPrice[];
};

const stockStatusLabels: Record<StockStatus, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

const stockStatusBadge: Record<StockStatus, string> = {
  in_stock: "badge-success",
  low_stock: "badge-pending",
  out_of_stock: "badge-error",
};

function ProductRowSkeleton() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

function TierBadges({ prices }: { prices: TierPrice[] }) {
  if (!prices || prices.length === 0) {
    return <span className="text-xs text-slate-gray">No tiers</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      {prices.map((p) => (
        <div key={p.id} className="flex items-center gap-2 text-xs">
          <span className="text-slate-gray whitespace-nowrap">{p.tier.name}:</span>
          <span className="text-primary-container font-bold">
            {formatINR(Number(p.pricePerUnit))}
          </span>
        </div>
      ))}
    </div>
  );
}

interface EditForm {
  stockStatus: StockStatus;
  isActive: boolean;
  tierPrices: { tierId: string; tierName: string; pricePerUnit: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    stockStatus: "in_stock",
    isActive: true,
    tierPrices: [],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      stockStatus: product.stockStatus,
      isActive: product.isActive,
      tierPrices: product.prices.map((p) => ({
        tierId: p.tier.id,
        tierName: p.tier.name,
        pricePerUnit: String(Number(p.pricePerUnit)),
      })),
    });
  };

  const closeEdit = () => {
    setEditingProduct(null);
  };

  const handleTierPriceChange = (tierId: string, value: string) => {
    setEditForm((f) => ({
      ...f,
      tierPrices: f.tierPrices.map((tp) =>
        tp.tierId === tierId ? { ...tp, pricePerUnit: value } : tp
      ),
    }));
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    // Validate prices
    const invalidPrices = editForm.tierPrices.filter(
      (tp) => isNaN(Number(tp.pricePerUnit)) || Number(tp.pricePerUnit) <= 0
    );
    if (invalidPrices.length > 0) {
      showToast("All prices must be valid positive numbers", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockStatus: editForm.stockStatus,
          isActive: editForm.isActive,
          tierPrices: editForm.tierPrices.map((tp) => ({
            tierId: tp.tierId,
            pricePerUnit: Number(tp.pricePerUnit),
          })),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
      showToast("Product updated successfully", "success");
      closeEdit();
    } catch {
      showToast("Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (productId: string) => {
    if (!confirm("Deactivate this product? It will be hidden from the storefront.")) return;
    setDeleting(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isActive: false } : p))
      );
      showToast("Product deactivated", "success");
    } catch {
      showToast("Failed to deactivate product", "error");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesActive = showInactive ? true : p.isActive;
    return matchesSearch && matchesActive;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl animate-fade-in-up ${
            toast.type === "success"
              ? "bg-status-success text-white"
              : "bg-status-error text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={24} className="text-primary-container" />
          <h1 className="text-headline-lg font-headline-md text-on-surface">Products</h1>
        </div>
        <button className="btn-primary" disabled title="Create product coming soon">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="bento-card p-5 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray"
            />
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? (
              <ToggleRight size={18} className="text-tertiary" />
            ) : (
              <ToggleLeft size={18} className="text-slate-gray" />
            )}
            {showInactive ? "Showing All" : "Show Inactive"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Weight (g)</th>
                <th>Stock Status</th>
                <th>Active</th>
                <th>Tier Prices</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <ProductRowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-gray">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    <td className="text-slate-gray">{product.slug}</td>
                    <td>{product.weightGrams}</td>
                    <td>
                      <span
                        className={`badge ${stockStatusBadge[product.stockStatus] ?? "badge-pending"}`}
                      >
                        {stockStatusLabels[product.stockStatus] ?? product.stockStatus}
                      </span>
                    </td>
                    <td>
                      {product.isActive ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-error">Inactive</span>
                      )}
                    </td>
                    <td>
                      <TierBadges prices={product.prices} />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-control hover:bg-surface-container-high text-on-surface-variant hover:text-tertiary transition-colors"
                          title="Edit product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeactivate(product.id)}
                          disabled={deleting === product.id || !product.isActive}
                          className="p-2 rounded-control hover:bg-surface-container-high text-on-surface-variant hover:text-status-error transition-colors disabled:opacity-30"
                          title={product.isActive ? "Deactivate product" : "Already inactive"}
                        >
                          {deleting === product.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-gray pt-2 border-t border-outline-variant/10">
          <span>
            {loading ? "Loading..." : `${filtered.length} of ${products.length} products`}
          </span>
          <span>Total {products.length} products</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bento-card w-full max-w-lg p-7 space-y-5 shadow-2xl border border-outline-variant/20 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-white">Edit Product</h2>
              <button
                onClick={closeEdit}
                className="text-slate-gray hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-gray uppercase tracking-wider">Product</p>
              <p className="text-on-surface font-medium">{editingProduct.name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-gray uppercase tracking-wider block">
                Stock Status
              </label>
              <select
                value={editForm.stockStatus}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, stockStatus: e.target.value as StockStatus }))
                }
                className="input-field w-full"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Tier Prices */}
            {editForm.tierPrices.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-gray uppercase tracking-wider">
                    Tier Prices (₹ per unit, excl. GST)
                  </label>
                  <span className="text-[10px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
                    Live pricing
                  </span>
                </div>
                <div className="space-y-2">
                  {editForm.tierPrices.map((tp) => (
                    <div
                      key={tp.tierId}
                      className="flex items-center gap-3 bg-surface-container rounded-control px-3 py-2"
                    >
                      <span className="text-sm text-on-surface-variant w-28 shrink-0">
                        {tp.tierName}
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray text-sm font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={tp.pricePerUnit}
                          onChange={(e) =>
                            handleTierPriceChange(tp.tierId, e.target.value)
                          }
                          className="input-field pl-7 py-1.5 text-sm w-full"
                        />
                      </div>
                      <span className="text-xs text-slate-gray shrink-0">
                        /unit
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-gray">
                  💡 Changes apply immediately to cart, checkout & quotation engine.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between py-3 px-4 rounded-control bg-surface-container border border-outline-variant/20">
              <span className="text-sm text-on-surface">Active on Storefront</span>
              <button
                onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editForm.isActive ? "bg-primary-container" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editForm.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={closeEdit} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
