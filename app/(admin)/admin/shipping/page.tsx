"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Package,
  Search,
  Settings,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Eye,
  MapPin,
  Save,
  Scale,
  Boxes,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface ShipmentItem {
  id: string;
  orderId: string;
  provider: string;
  courierName: string;
  courierCode?: string;
  awbNumber: string;
  trackingUrl?: string;
  status: string;
  estimatedDeliveryDate?: string;
  pickupDate?: string;
  weightGrams: number;
  labelUrl?: string;
  createdAt: string;
  order: {
    orderNumber: string;
    grandTotal: number;
    shippingAddress?: {
      name?: string;
      city?: string;
      state?: string;
      pincode?: string;
    } | null;
    user?: { name: string | null; email: string } | null;
  };
  trackingEvents: {
    description?: string;
    location?: string;
    eventTimestamp: string;
  }[];
}

interface ShippingRulesForm {
  calculationMode: "weight" | "quantity";
  chargeUpTo1Kg: number;
  chargeUpTo2Kg: number;
  chargeUpTo3Kg: number;
  chargeUpTo5Kg: number;
  chargeAbove5KgPerKg: number;
  ratePerKg: number;
  freeShippingAboveAmount: number;
  charge1to10: number;
  charge11to20: number;
  charge21to30: number;
  freeThresholdQty: number;
}

const STATUS_TABS = [
  { label: "All Shipments", value: "all" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Pending Pickup", value: "SHIPMENT_CREATED" },
  { label: "NDR / Failed", value: "NDR" },
  { label: "RTO", value: "RTO_INITIATED" },
];

export default function AdminShippingPage() {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Shipping Rules Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [rulesSuccess, setRulesSuccess] = useState(false);
  const [rules, setRules] = useState<ShippingRulesForm>({
    calculationMode: "weight",
    chargeUpTo1Kg: 100,
    chargeUpTo2Kg: 200,
    chargeUpTo3Kg: 300,
    chargeUpTo5Kg: 500,
    chargeAbove5KgPerKg: 100,
    ratePerKg: 100,
    freeShippingAboveAmount: 15000,
    charge1to10: 100,
    charge11to20: 200,
    charge21to30: 300,
    freeThresholdQty: 31,
  });

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (searchQuery) params.set("query", searchQuery);

      const res = await fetch(`/api/admin/shipments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setShipments(data.shipments || []);
        setCounts(data.counts || {});
      }
    } catch (err) {
      console.error("Failed to fetch shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const res = await fetch("/api/admin/shipping");
      if (res.ok) {
        const data = await res.json();
        setRules({
          calculationMode: data.calculationMode || "weight",
          chargeUpTo1Kg: Number(data.chargeUpTo1Kg ?? 100),
          chargeUpTo2Kg: Number(data.chargeUpTo2Kg ?? 200),
          chargeUpTo3Kg: Number(data.chargeUpTo3Kg ?? 300),
          chargeUpTo5Kg: Number(data.chargeUpTo5Kg ?? 500),
          chargeAbove5KgPerKg: Number(data.chargeAbove5KgPerKg ?? 100),
          ratePerKg: Number(data.ratePerKg ?? 100),
          freeShippingAboveAmount: Number(data.freeShippingAboveAmount ?? 15000),
          charge1to10: Number(data.charge1to10 ?? 100),
          charge11to20: Number(data.charge11to20 ?? 200),
          charge21to30: Number(data.charge21to30 ?? 300),
          freeThresholdQty: Number(data.freeThresholdQty ?? 31),
        });
      }
    } catch (err) {
      console.error("Failed to fetch shipping rules:", err);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchRules();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShipments();
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setRulesSaving(true);
    setRulesSuccess(false);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      if (res.ok) {
        setRulesSuccess(true);
        setTimeout(() => setRulesSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to update shipping rules:", err);
    } finally {
      setRulesSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Truck className="text-tertiary" size={26} />
            <h1 className="font-headline-md text-white">Shipping &amp; Logistics</h1>
          </div>
          <p className="text-xs text-slate-gray mt-1">
            Live Shiprocket courier tracking, automated webhooks, and customer shipping charge rates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 transition-colors ${
              showSettings ? "bg-primary-container text-black font-bold" : ""
            }`}
          >
            <Sliders size={14} /> {showSettings ? "Hide Rate Settings" : "Configure Shipping Rates"}
          </button>
          <button
            onClick={fetchShipments}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Shipping Charge Rates Configurator Card */}
      {showSettings && (
        <div className="bento-card p-6 border-primary-container/40 bg-surface-container/90 relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <Scale size={20} className="text-primary-container" />
              <div>
                <h3 className="font-headline-sm text-white text-base">
                  Customer Shipping Charge &amp; Weight Slabs
                </h3>
                <p className="text-xs text-slate-gray">
                  Configure the exact shipping fees billed to customers in Cart, Checkout, and Quotations.
                </p>
              </div>
            </div>
            {rulesSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-status-success bg-status-success/10 px-3 py-1.5 rounded-full border border-status-success/30">
                <CheckCircle2 size={14} /> Shipping Rates Updated!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveRules} className="space-y-6">
            {/* Calculation Mode Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Calculation Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                <button
                  type="button"
                  onClick={() => setRules({ ...rules, calculationMode: "weight" })}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    rules.calculationMode === "weight"
                      ? "bg-primary-container/15 border-primary-container text-white shadow-sm"
                      : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  <Scale size={18} className={rules.calculationMode === "weight" ? "text-primary-container mt-0.5" : "text-slate-gray mt-0.5"} />
                  <div>
                    <div className="font-bold text-xs">Weight-Based Slabs (Recommended)</div>
                    <div className="text-[11px] text-slate-gray">
                      1kg = ₹100, 2kg = ₹200, 3kg = ₹300, etc.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRules({ ...rules, calculationMode: "quantity" })}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    rules.calculationMode === "quantity"
                      ? "bg-primary-container/15 border-primary-container text-white shadow-sm"
                      : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  <Boxes size={18} className={rules.calculationMode === "quantity" ? "text-primary-container mt-0.5" : "text-slate-gray mt-0.5"} />
                  <div>
                    <div className="font-bold text-xs">Quantity-Based Slabs</div>
                    <div className="text-[11px] text-slate-gray">
                      1–10 pcs = ₹100, 11–20 pcs = ₹200, etc.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* WEIGHT-BASED SLABS */}
            {rules.calculationMode === "weight" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-1.5">
                  <Scale size={14} /> Weight Slabs (INR)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">Up to 1 KG (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rules.chargeUpTo1Kg}
                      onChange={(e) => setRules({ ...rules, chargeUpTo1Kg: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">Up to 2 KG (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rules.chargeUpTo2Kg}
                      onChange={(e) => setRules({ ...rules, chargeUpTo2Kg: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">Up to 3 KG (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rules.chargeUpTo3Kg}
                      onChange={(e) => setRules({ ...rules, chargeUpTo3Kg: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">Up to 5 KG (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rules.chargeUpTo5Kg}
                      onChange={(e) => setRules({ ...rules, chargeUpTo5Kg: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">Above 5 KG (₹/Extra KG)</label>
                    <input
                      type="number"
                      min="0"
                      value={rules.chargeAbove5KgPerKg}
                      onChange={(e) => setRules({ ...rules, chargeAbove5KgPerKg: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* QUANTITY-BASED SLABS */}
            {rules.calculationMode === "quantity" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes size={14} /> Quantity Slabs (INR)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">1–10 PCS (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rules.charge1to10}
                      onChange={(e) => setRules({ ...rules, charge1to10: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">11–20 PCS (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rules.charge11to20}
                      onChange={(e) => setRules({ ...rules, charge11to20: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">21–30 PCS (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rules.charge21to30}
                      onChange={(e) => setRules({ ...rules, charge21to30: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-gray block mb-1">Free Shipping Min Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={rules.freeThresholdQty}
                      onChange={(e) => setRules({ ...rules, freeThresholdQty: Number(e.target.value) })}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Free Shipping Cart Value Threshold */}
            <div className="pt-2 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-md">
                <label className="text-[11px] text-white font-bold block mb-1">
                  Free Shipping Cart Value Threshold (₹)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-gray">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={rules.freeShippingAboveAmount}
                    onChange={(e) => setRules({ ...rules, freeShippingAboveAmount: Number(e.target.value) })}
                    className="input-field w-40 text-xs font-mono"
                  />
                  <span className="text-[11px] text-slate-gray">
                    (Orders above this subtotal get 100% Free Shipping. Set 0 to disable)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={rulesSaving}
                className="btn-primary text-xs py-2 px-6 flex items-center gap-2 font-bold tracking-wide shadow-md shadow-primary-container/20 self-end sm:self-auto"
              >
                <Save size={14} /> {rulesSaving ? "Saving..." : "Save Shipping Rates"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
          <span className="text-[11px] text-slate-gray uppercase tracking-wider block">Total</span>
          <span className="text-xl font-bold text-white mt-1 block">{counts.total || 0}</span>
        </div>
        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
          <span className="text-[11px] text-slate-gray uppercase tracking-wider block">Pending</span>
          <span className="text-xl font-bold text-tertiary mt-1 block">{counts.pending || 0}</span>
        </div>
        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
          <span className="text-[11px] text-slate-gray uppercase tracking-wider block">In Transit</span>
          <span className="text-xl font-bold text-primary-container mt-1 block">{counts.inTransit || 0}</span>
        </div>
        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
          <span className="text-[11px] text-slate-gray uppercase tracking-wider block">Out for Delivery</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">{counts.outForDelivery || 0}</span>
        </div>
        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
          <span className="text-[11px] text-slate-gray uppercase tracking-wider block">Delivered</span>
          <span className="text-xl font-bold text-status-success mt-1 block">{counts.delivered || 0}</span>
        </div>
        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
          <span className="text-[11px] text-slate-gray uppercase tracking-wider block">NDR / Issues</span>
          <span className="text-xl font-bold text-status-error mt-1 block">{counts.ndr || 0}</span>
        </div>
        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
          <span className="text-[11px] text-slate-gray uppercase tracking-wider block">RTO</span>
          <span className="text-xl font-bold text-purple-400 mt-1 block">{counts.rto || 0}</span>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-1.5 rounded-control text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? "bg-primary-container/20 text-primary-container border border-primary-container/30"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
          <input
            type="text"
            placeholder="Search AWB, Order #, Pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 pr-8 py-1.5 w-full text-xs"
          />
        </form>
      </div>

      {/* Shipments Table */}
      <div className="bento-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
            <p className="text-slate-gray mt-4 text-xs">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Package size={42} className="text-slate-gray mb-3 opacity-40" />
            <h3 className="font-headline-sm text-white mb-1">No shipments found</h3>
            <p className="text-xs text-slate-gray max-w-sm">
              {searchQuery
                ? "No shipments matched your search criteria."
                : "There are no shipments in this category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table text-xs">
              <thead>
                <tr>
                  <th>AWB / Tracking #</th>
                  <th>Order #</th>
                  <th>Courier Partner</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Est. Delivery</th>
                  <th>Last Event</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((ship) => {
                  const lastEv = ship.trackingEvents?.[0];
                  return (
                    <tr key={ship.id} className="hover:bg-surface-container-high/30">
                      <td>
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-white text-xs">
                            {ship.awbNumber}
                          </span>
                          <span className="text-[10px] text-slate-gray uppercase">
                            Provider: {ship.provider}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/admin/orders`}
                          className="font-bold text-primary-container hover:underline"
                        >
                          {ship.order.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <span className="font-medium text-white">{ship.courierName}</span>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-white">
                            {ship.order.shippingAddress?.city || "—"},{" "}
                            {ship.order.shippingAddress?.state || "—"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-gray">
                            PIN: {ship.order.shippingAddress?.pincode || "—"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="min-w-[155px]">
                          <CustomSelect
                            value={ship.status}
                            onChange={async (newStatus) => {
                              try {
                                const res = await fetch(`/api/admin/shipments/${ship.id}/status`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: newStatus }),
                                });
                                if (res.ok) {
                                  fetchShipments();
                                }
                              } catch (err) {
                                console.error("Failed to update shipment status:", err);
                              }
                            }}
                            options={[
                              { value: "SHIPMENT_CREATED", label: "Shipment Created" },
                              { value: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
                              { value: "PICKED_UP", label: "Picked Up" },
                              { value: "IN_TRANSIT", label: "In Transit" },
                              { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
                              { value: "DELIVERED", label: "Delivered" },
                              { value: "DELAYED", label: "Delayed" },
                              { value: "NDR", label: "NDR / Failed" },
                              { value: "RTO_INITIATED", label: "RTO Initiated" },
                            ]}
                            triggerClassName="text-[11px] py-1 px-2 bg-surface-container-high border-outline-variant/30"
                          />
                        </div>
                      </td>
                      <td className="text-slate-gray">
                        {ship.estimatedDeliveryDate
                          ? new Date(ship.estimatedDeliveryDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "3–5 Days"}
                      </td>
                      <td>
                        <span className="text-[11px] text-on-surface-variant line-clamp-1 max-w-[180px]">
                          {lastEv?.description || "Manifest Generated"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/track-order?query=${ship.awbNumber}`}
                            target="_blank"
                            className="p-1.5 bg-surface-container-high rounded border border-outline-variant/30 text-slate-gray hover:text-white"
                            title="Public Tracking"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </div>
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
