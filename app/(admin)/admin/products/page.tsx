"use client";


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
  Truck,
  Image as ImageIcon,
  CheckCircle2,
  DollarSign,
  Tag,
  Layers,
} from "lucide-react";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

type PricingTierDef = {
  id: string;
  name: string;
  minQty: number;
  maxQty: number | null;
};

type TierPrice = {
  id: string;
  pricePerUnit: number;
  currency: string;
  tier: PricingTierDef;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  description?: string | null;
  hsnCode?: string | null;
  weightGrams: number;
  images: string[];
  isActive: boolean;
  stockStatus: StockStatus;
  prices: TierPrice[];
};

type ShippingConfig = {
  charge1to10: number;
  charge11to20: number;
  charge21to30: number;
  freeThresholdQty: number;
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

// Default quantity tiers fallback
const DEFAULT_TIERS: PricingTierDef[] = [
  { id: "tier-retail", name: "1–9 PCS", minQty: 1, maxQty: 9 },
  { id: "tier-10", name: "10–49 PCS", minQty: 10, maxQty: 49 },
  { id: "tier-50", name: "50–99 PCS", minQty: 50, maxQty: 99 },
  { id: "tier-100", name: "100–499 PCS", minQty: 100, maxQty: 499 },
  { id: "tier-500", name: "500+ PCS", minQty: 500, maxQty: null },
];

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
        <div key={p.id || p.tier?.id} className="flex items-center gap-2 text-xs">
          <span className="text-slate-gray whitespace-nowrap">{p.tier?.name}:</span>
          <span className="text-primary-container font-bold">
            {formatINR(Number(p.pricePerUnit))}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ── Modals State ──────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);

  // ── Add Product Form State ────────────────────────────────────────────────
  const [addForm, setAddForm] = useState({
    name: "",
    slug: "",
    shortDesc: "",
    description: "",
    weightGrams: "280",
    hsnCode: "8424",
    stockStatus: "in_stock" as StockStatus,
    isActive: true,
    images: [
      "/images/products/heat-aerosol-1.jpg",
      "/images/products/heat-aerosol-2.jpg",
    ],
    newImageUrl: "",
    tierPrices: DEFAULT_TIERS.map((t) => ({
      tierId: t.id,
      tierName: t.name,
      pricePerUnit: t.minQty >= 500 ? "165" : t.minQty >= 100 ? "200" : t.minQty >= 50 ? "225" : t.minQty >= 10 ? "275" : "300",
    })),
  });

  // ── Edit Form State ───────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    name: "",
    shortDesc: "",
    description: "",
    weightGrams: "280",
    hsnCode: "8424",
    stockStatus: "in_stock" as StockStatus,
    isActive: true,
    images: [] as string[],
    newImageUrl: "",
    tierPrices: [] as { tierId: string; tierName: string; pricePerUnit: string }[],
  });

  // ── Courier Charges Form State ────────────────────────────────────────────
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
    charge1to10: 100,
    charge11to20: 200,
    charge21to30: 300,
    freeThresholdQty: 31,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [savingShipping, setSavingShipping] = useState(false);

  // ── Load Products & Shipping Rules ────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingConfig = async () => {
    try {
      const res = await fetch("/api/admin/shipping");
      if (res.ok) {
        const data = await res.json();
        setShippingConfig(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchShippingConfig();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string, isAdd: boolean) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    if (isAdd) {
      setAddForm((f) => ({ ...f, name, slug }));
    } else {
      setEditForm((f) => ({ ...f, name }));
    }
  };

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const openEdit = (product: Product) => {
    setEditingProduct(product);

    // Build tier prices mapping
    const existingTierMap = new Map(product.prices.map((p) => [p.tier?.id || p.id, String(Number(p.pricePerUnit))]));

    const mappedTierPrices = DEFAULT_TIERS.map((t) => ({
      tierId: t.id,
      tierName: t.name,
      pricePerUnit: existingTierMap.get(t.id) || (t.minQty >= 500 ? "165" : t.minQty >= 100 ? "200" : t.minQty >= 50 ? "225" : t.minQty >= 10 ? "275" : "300"),
    }));

    setEditForm({
      name: product.name,
      shortDesc: product.shortDesc || "",
      description: product.description || "",
      weightGrams: String(product.weightGrams || 280),
      hsnCode: product.hsnCode || "8424",
      stockStatus: product.stockStatus,
      isActive: product.isActive,
      images: product.images && product.images.length > 0 ? product.images : ["/images/products/heat-aerosol-1.jpg"],
      newImageUrl: "",
      tierPrices: mappedTierPrices,
    });
  };

  // ── Handle Save Created Product ───────────────────────────────────────────
  const handleCreateProduct = async () => {
    if (!addForm.name.trim()) {
      showToast("Product name is required", "error");
      return;
    }
    if (!addForm.slug.trim()) {
      showToast("Slug is required", "error");
      return;
    }

    const weightGrams = Number(addForm.weightGrams);
    if (isNaN(weightGrams) || weightGrams <= 0) {
      showToast("Weight must be a valid positive number", "error");
      return;
    }

    setSaving(true);
    try {
      const formattedTierPrices = addForm.tierPrices.map((tp) => ({
        tierId: tp.tierId,
        pricePerUnit: Number(tp.pricePerUnit) || 100,
      }));

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          slug: addForm.slug,
          shortDesc: addForm.shortDesc,
          description: addForm.description,
          weightGrams,
          hsnCode: addForm.hsnCode,
          stockStatus: addForm.stockStatus,
          isActive: addForm.isActive,
          images: addForm.images,
          tierPrices: formattedTierPrices,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      showToast("Product added successfully! 🎉", "success");
      setShowAddModal(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to create product", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Handle Update Product ─────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    setSaving(true);
    try {
      const formattedTierPrices = editForm.tierPrices.map((tp) => ({
        tierId: tp.tierId,
        pricePerUnit: Number(tp.pricePerUnit) || 100,
      }));

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          shortDesc: editForm.shortDesc,
          description: editForm.description,
          weightGrams: Number(editForm.weightGrams) || 280,
          hsnCode: editForm.hsnCode,
          stockStatus: editForm.stockStatus,
          isActive: editForm.isActive,
          images: editForm.images,
          tierPrices: formattedTierPrices,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();

      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
      showToast("Product updated successfully", "success");
      setEditingProduct(null);
    } catch {
      showToast("Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Handle Save Shipping Courier Charges ─────────────────────────────────
  const handleSaveShipping = async () => {
    setSavingShipping(true);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charge1to10: Number(shippingConfig.charge1to10),
          charge11to20: Number(shippingConfig.charge11to20),
          charge21to30: Number(shippingConfig.charge21to30),
          freeThresholdQty: Number(shippingConfig.freeThresholdQty),
        }),
      });

      if (!res.ok) throw new Error("Failed to update shipping");
      const updated = await res.json();
      setShippingConfig(updated);
      showToast("Courier charges updated successfully! 🚚", "success");
      setShowShippingModal(false);
    } catch {
      showToast("Failed to update courier charges", "error");
    } finally {
      setSavingShipping(false);
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
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl animate-fade-in-up flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-status-success text-white"
              : "bg-status-error text-white"
          }`}
        >
          <CheckCircle2 size={16} />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package size={28} className="text-primary-container" />
          <div>
            <h1 className="text-headline-lg font-headline-md text-on-surface">Products & Shipping</h1>
            <p className="text-xs text-slate-gray">Manage store products, tier pricing, photos & courier charges</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Manage Courier Charges Button */}
          <button
            onClick={() => setShowShippingModal(true)}
            className="btn-secondary flex items-center gap-2 border-tertiary/40 text-tertiary hover:bg-tertiary/10"
          >
            <Truck size={16} />
            Courier Charges
          </button>

          {/* Add Product Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Courier Charge Summary Bar */}
      <div className="bento-card p-4 flex flex-wrap items-center justify-between gap-4 border border-tertiary/20 bg-tertiary/5">
        <div className="flex items-center gap-3">
          <Truck className="text-tertiary shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-tertiary">Active Admin Courier Charges</p>
            <p className="text-xs text-on-surface-variant">
              1–10 PCS: <span className="font-bold text-white">₹{shippingConfig.charge1to10}</span> | 
              11–20 PCS: <span className="font-bold text-white">₹{shippingConfig.charge11to20}</span> | 
              21–30 PCS: <span className="font-bold text-white">₹{shippingConfig.charge21to30}</span> | 
              Free Shipping: <span className="font-bold text-status-success">{shippingConfig.freeThresholdQty}+ PCS</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowShippingModal(true)}
          className="text-xs text-tertiary font-bold hover:underline"
        >
          Change Rates →
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
                <th>Product</th>
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
                Array.from({ length: 5 }).map((_, i) => <ProductRowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-gray">
                    No products found. Click "+ Add Product" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id}>
                    <td className="font-medium">
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover border border-outline-variant/30 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                            <ImageIcon size={18} className="text-slate-gray" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{product.name}</p>
                          <p className="text-xs text-slate-gray line-clamp-1">{product.shortDesc || "No short description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-gray text-xs">{product.slug}</td>
                    <td>{product.weightGrams}g</td>
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

      {/* ── 1. ADD PRODUCT MODAL ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bento-card w-full max-w-2xl p-7 space-y-5 shadow-2xl border border-outline-variant/20 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Plus size={20} className="text-primary-container" />
                <h2 className="font-headline-sm text-white">Add New Product</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-gray hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Fire Aerosol Extinguisher"
                  value={addForm.name}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  className="input-field w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider">URL Slug *</label>
                <input
                  type="text"
                  placeholder="fire-aerosol-extinguisher"
                  value={addForm.slug}
                  onChange={(e) => setAddForm((f) => ({ ...f, slug: e.target.value }))}
                  className="input-field w-full font-mono text-xs"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-1">
              <label className="text-xs text-slate-gray uppercase tracking-wider">Short Description</label>
              <input
                type="text"
                placeholder="Compact automatic heat aerosol fire suppressor for electrical panels."
                value={addForm.shortDesc}
                onChange={(e) => setAddForm((f) => ({ ...f, shortDesc: e.target.value }))}
                className="input-field w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-gray uppercase tracking-wider">Full Product Description</label>
              <textarea
                rows={3}
                placeholder="Detailed specifications, mounting instructions, application areas..."
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field w-full text-sm"
              />
            </div>

            {/* Specs & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider">Weight (Grams) *</label>
                <input
                  type="number"
                  min={1}
                  value={addForm.weightGrams}
                  onChange={(e) => setAddForm((f) => ({ ...f, weightGrams: e.target.value }))}
                  className="input-field w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider">HSN Code</label>
                <input
                  type="text"
                  value={addForm.hsnCode}
                  onChange={(e) => setAddForm((f) => ({ ...f, hsnCode: e.target.value }))}
                  className="input-field w-full font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider">Stock Status</label>
                <select
                  value={addForm.stockStatus}
                  onChange={(e) => setAddForm((f) => ({ ...f, stockStatus: e.target.value as StockStatus }))}
                  className="input-field w-full"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Photos & Images */}
            <div className="space-y-2 border-t border-outline-variant/20 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-gray uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-tertiary" /> Product Photos & Image URLs
                </label>
                <span className="text-xs text-slate-gray">{addForm.images.length} images added</span>
              </div>

              {/* Added Images Preview List */}
              <div className="flex flex-wrap gap-2">
                {addForm.images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={imgUrl}
                      alt={`Product image ${idx + 1}`}
                      className="h-16 w-16 object-cover rounded-lg border border-outline-variant/30"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAddForm((f) => ({
                          ...f,
                          images: f.images.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute -top-1.5 -right-1.5 bg-status-error text-white rounded-full p-0.5 shadow hover:scale-110 transition-transform"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Image URL */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL (e.g. https://... or /images/products/photo.jpg)"
                  value={addForm.newImageUrl}
                  onChange={(e) => setAddForm((f) => ({ ...f, newImageUrl: e.target.value }))}
                  className="input-field flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (addForm.newImageUrl.trim()) {
                      setAddForm((f) => ({
                        ...f,
                        images: [...f.images, f.newImageUrl.trim()],
                        newImageUrl: "",
                      }));
                    }
                  }}
                  className="btn-secondary py-1 text-xs whitespace-nowrap"
                >
                  + Add URL
                </button>
              </div>
            </div>

            {/* Tier Prices */}
            <div className="space-y-3 border-t border-outline-variant/20 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} className="text-primary-container" /> Quantity Tier Prices (₹ per unit, excl. GST)
                </label>
                <span className="text-[10px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
                  Tiered Wholesale Engine
                </span>
              </div>

              <div className="space-y-2">
                {addForm.tierPrices.map((tp, idx) => (
                  <div
                    key={tp.tierId}
                    className="flex items-center gap-3 bg-surface-container rounded-control px-3 py-2"
                  >
                    <span className="text-xs text-on-surface-variant w-28 shrink-0 font-medium">
                      {tp.tierName}
                    </span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={tp.pricePerUnit}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddForm((f) => ({
                            ...f,
                            tierPrices: f.tierPrices.map((item, i) =>
                              i === idx ? { ...item, pricePerUnit: val } : item
                            ),
                          }));
                        }}
                        className="input-field pl-7 py-1 text-xs w-full font-bold text-white"
                      />
                    </div>
                    <span className="text-xs text-slate-gray shrink-0">/unit</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-outline-variant/20">
              <button
                onClick={handleCreateProduct}
                disabled={saving}
                className="btn-primary flex-1 gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Creating Product..." : "Create Product"}
              </button>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. EDIT PRODUCT MODAL ────────────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bento-card w-full max-w-2xl p-7 space-y-5 shadow-2xl border border-outline-variant/20 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Edit size={20} className="text-tertiary" />
                <h2 className="font-headline-sm text-white">Edit Product</h2>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-gray hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-field w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-gray uppercase tracking-wider">Weight (Grams)</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.weightGrams}
                    onChange={(e) => setEditForm((f) => ({ ...f, weightGrams: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-gray uppercase tracking-wider">HSN Code</label>
                  <input
                    type="text"
                    value={editForm.hsnCode}
                    onChange={(e) => setEditForm((f) => ({ ...f, hsnCode: e.target.value }))}
                    className="input-field w-full font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-gray uppercase tracking-wider">Stock Status</label>
                  <select
                    value={editForm.stockStatus}
                    onChange={(e) => setEditForm((f) => ({ ...f, stockStatus: e.target.value as StockStatus }))}
                    className="input-field w-full"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider">Short Description</label>
                <input
                  type="text"
                  value={editForm.shortDesc}
                  onChange={(e) => setEditForm((f) => ({ ...f, shortDesc: e.target.value }))}
                  className="input-field w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider">Full Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="input-field w-full text-sm"
                />
              </div>
            </div>

            {/* Photos & Images */}
            <div className="space-y-2 border-t border-outline-variant/20 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-gray uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-tertiary" /> Product Photos
                </label>
                <span className="text-xs text-slate-gray">{editForm.images.length} images</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {editForm.images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={imgUrl}
                      alt={`Image ${idx + 1}`}
                      className="h-16 w-16 object-cover rounded-lg border border-outline-variant/30"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((f) => ({
                          ...f,
                          images: f.images.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute -top-1.5 -right-1.5 bg-status-error text-white rounded-full p-0.5 shadow hover:scale-110 transition-transform"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste new image URL"
                  value={editForm.newImageUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, newImageUrl: e.target.value }))}
                  className="input-field flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (editForm.newImageUrl.trim()) {
                      setEditForm((f) => ({
                        ...f,
                        images: [...f.images, f.newImageUrl.trim()],
                        newImageUrl: "",
                      }));
                    }
                  }}
                  className="btn-secondary py-1 text-xs whitespace-nowrap"
                >
                  + Add Photo
                </button>
              </div>
            </div>

            {/* Tier Prices */}
            {editForm.tierPrices.length > 0 && (
              <div className="space-y-3 border-t border-outline-variant/20 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-gray uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} className="text-primary-container" /> Quantity Tier Prices (₹ per unit, excl. GST)
                  </label>
                  <span className="text-[10px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
                    Live pricing
                  </span>
                </div>
                <div className="space-y-2">
                  {editForm.tierPrices.map((tp, idx) => (
                    <div
                      key={tp.tierId}
                      className="flex items-center gap-3 bg-surface-container rounded-control px-3 py-2"
                    >
                      <span className="text-xs text-on-surface-variant w-28 shrink-0 font-medium">
                        {tp.tierName}
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray text-xs font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={tp.pricePerUnit}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditForm((f) => ({
                              ...f,
                              tierPrices: f.tierPrices.map((item, i) =>
                                i === idx ? { ...item, pricePerUnit: val } : item
                              ),
                            }));
                          }}
                          className="input-field pl-7 py-1 text-xs w-full font-bold text-white"
                        />
                      </div>
                      <span className="text-xs text-slate-gray shrink-0">/unit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Toggle */}
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
              <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1 gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving Changes…" : "Save Changes"}
              </button>
              <button onClick={() => setEditingProduct(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. COURIER / SHIPPING CHARGES MODAL ─────────────────────────────── */}
      {showShippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bento-card w-full max-w-md p-7 space-y-5 shadow-2xl border border-outline-variant/20 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-tertiary" />
                <h2 className="font-headline-sm text-white">Admin Courier Charges</h2>
              </div>
              <button
                onClick={() => setShowShippingModal(false)}
                className="text-slate-gray hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-gray">
              Configure delivery courier charges applied at checkout and quotation calculations.
            </p>

            <div className="space-y-4">
              {/* 1 - 10 PCS */}
              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider block">
                  1 – 10 PCS Courier Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={shippingConfig.charge1to10}
                    onChange={(e) =>
                      setShippingConfig((c) => ({ ...c, charge1to10: Number(e.target.value) }))
                    }
                    className="input-field pl-8 w-full font-bold text-white"
                  />
                </div>
              </div>

              {/* 11 - 20 PCS */}
              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider block">
                  11 – 20 PCS Courier Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={shippingConfig.charge11to20}
                    onChange={(e) =>
                      setShippingConfig((c) => ({ ...c, charge11to20: Number(e.target.value) }))
                    }
                    className="input-field pl-8 w-full font-bold text-white"
                  />
                </div>
              </div>

              {/* 21 - 30 PCS */}
              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider block">
                  21 – 30 PCS Courier Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={shippingConfig.charge21to30}
                    onChange={(e) =>
                      setShippingConfig((c) => ({ ...c, charge21to30: Number(e.target.value) }))
                    }
                    className="input-field pl-8 w-full font-bold text-white"
                  />
                </div>
              </div>

              {/* Free Shipping Qty Threshold */}
              <div className="space-y-1">
                <label className="text-xs text-slate-gray uppercase tracking-wider block">
                  Free Shipping Minimum Quantity (PCS)
                </label>
                <input
                  type="number"
                  min={1}
                  value={shippingConfig.freeThresholdQty}
                  onChange={(e) =>
                    setShippingConfig((c) => ({ ...c, freeThresholdQty: Number(e.target.value) }))
                  }
                  className="input-field w-full font-bold text-status-success"
                />
                <p className="text-[11px] text-slate-gray">
                  Orders with {shippingConfig.freeThresholdQty}+ PCS automatically receive Free Shipping (₹0).
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-outline-variant/20">
              <button
                onClick={handleSaveShipping}
                disabled={savingShipping}
                className="btn-primary flex-1 gap-2"
              >
                {savingShipping ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savingShipping ? "Saving..." : "Save Courier Rates"}
              </button>
              <button onClick={() => setShowShippingModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
