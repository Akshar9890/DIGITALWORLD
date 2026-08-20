"use client";

import { useState, useEffect } from "react";
import {
  X,
  Truck,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { CourierOption } from "@/lib/shipping/types";

interface DispatchModalProps {
  order: {
    id: string;
    orderNumber: string;
    grandTotal: number;
    shippingAddress?: {
      name?: string;
      phone?: string;
      line1?: string;
      city?: string;
      state?: string;
      pincode?: string;
    } | null;
    user?: { name: string | null; email: string } | null;
    items?: { id: string; quantity: number; product: { name: string } }[];
  };
  onClose: () => void;
  onSuccess: (shipment: any) => void;
}

export default function DispatchModal({
  order,
  onClose,
  onSuccess,
}: DispatchModalProps) {
  const [activeTab, setActiveTab] = useState<"api" | "manual">("api");
  const [weightGrams, setWeightGrams] = useState(500);
  const [lengthCm, setLengthCm] = useState(15);
  const [widthCm, setWidthCm] = useState(10);
  const [heightCm, setHeightCm] = useState(10);

  // API State
  const [checkingCouriers, setCheckingCouriers] = useState(false);
  const [courierOptions, setCourierOptions] = useState<CourierOption[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Manual State
  const [manualCourier, setManualCourier] = useState("DTDC Express");
  const [manualAwb, setManualAwb] = useState("");
  const [manualTrackingUrl, setManualTrackingUrl] = useState("");
  const [manualEstDays, setManualEstDays] = useState(3);
  const [manualShippingCost, setManualShippingCost] = useState(100);
  const [manualNotes, setManualNotes] = useState("");

  const handleCheckServiceability = async () => {
    setCheckingCouriers(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/shipments/${order.id}/serviceability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightGrams, lengthCm, widthCm, heightCm }),
      });

      const data = await res.json();
      if (res.ok) {
        setCourierOptions(data.couriers || []);
        if (data.couriers?.length > 0) {
          setSelectedCourier(data.couriers[0]);
        }
      } else {
        setApiError(data.error || "Failed to fetch courier options");
      }
    } catch (err: any) {
      setApiError(err.message || "Network error checking serviceability");
    } finally {
      setCheckingCouriers(false);
    }
  };

  // Auto-check courier options on mount
  useEffect(() => {
    handleCheckServiceability();
  }, []);

  const handleCreateApiShipment = async () => {
    if (!selectedCourier) return;
    setIsDispatching(true);
    setApiError(null);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          provider: "shiprocket",
          courierId: selectedCourier.id,
          courierName: selectedCourier.name,
          courierCode: selectedCourier.code,
          weightGrams,
          lengthCm,
          widthCm,
          heightCm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.shipment) {
        onSuccess(data.shipment);
        onClose();
      } else {
        setApiError(data.error || "Failed to create shipment");
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to dispatch order");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCreateManualShipment = async () => {
    if (!manualCourier || !manualAwb) {
      setApiError("Courier name and AWB / Tracking number are required.");
      return;
    }

    setIsDispatching(true);
    setApiError(null);
    try {
      const estDate = new Date(Date.now() + manualEstDays * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch("/api/admin/shipments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          courierName: manualCourier,
          awbNumber: manualAwb,
          trackingUrl: manualTrackingUrl || undefined,
          estimatedDeliveryDate: estDate,
          weightGrams,
          lengthCm,
          widthCm,
          heightCm,
          notes: manualNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.shipment) {
        onSuccess(data.shipment);
        onClose();
      } else {
        setApiError(data.error || "Failed to save manual shipment");
      }
    } catch (err: any) {
      setApiError(err.message || "Network error saving shipment");
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="font-headline-sm text-white">
                Dispatch Order {order.orderNumber}
              </h3>
              <p className="text-xs text-slate-gray">
                Assign courier, generate AWB tracking number & notify customer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-gray hover:text-white p-2 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-outline-variant/20 px-6 pt-2 bg-surface-container-high/30">
          <button
            onClick={() => {
              setActiveTab("api");
              setApiError(null);
            }}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "api"
                ? "border-primary-container text-primary-container"
                : "border-transparent text-slate-gray hover:text-white"
            }`}
          >
            ⚡ Courier Aggregator (API)
          </button>
          <button
            onClick={() => {
              setActiveTab("manual");
              setApiError(null);
            }}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "manual"
                ? "border-primary-container text-primary-container"
                : "border-transparent text-slate-gray hover:text-white"
            }`}
          >
            ✍️ Manual Tracking Entry
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Error Banner */}
          {apiError && (
            <div className="bg-status-error/10 border border-status-error/30 text-status-error p-3 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Destination Summary */}
          <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant/15 flex flex-wrap justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-gray block">Recipient:</span>
              <span className="font-bold text-white">
                {order.shippingAddress?.name || order.user?.name || "Customer"}
              </span>
              <span className="text-slate-gray block mt-0.5">
                {order.shippingAddress?.phone || "No phone"}
              </span>
            </div>
            <div>
              <span className="text-slate-gray block">Destination:</span>
              <span className="font-bold text-white">
                {order.shippingAddress?.city || "Vadodara"},{" "}
                {order.shippingAddress?.state || "Gujarat"} -{" "}
                <span className="text-primary-container font-mono">
                  {order.shippingAddress?.pincode || "390010"}
                </span>
              </span>
            </div>
            <div>
              <span className="text-slate-gray block">Items ({order.items?.length || 1}):</span>
              <span className="font-bold text-white line-clamp-1 max-w-[160px]">
                {order.items?.[0]?.product?.name || "Fire Aerosol Device"}
              </span>
            </div>
          </div>

          {/* Package Weight & Dimensions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-gray mb-3 flex items-center gap-1.5">
              <Package size={14} className="text-tertiary" /> Package Dimensions & Weight
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-gray block mb-1">
                  Weight (Grams)
                </label>
                <input
                  type="number"
                  min={50}
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(Number(e.target.value))}
                  className="input-field w-full text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-gray block mb-1">Length (cm)</label>
                <input
                  type="number"
                  min={1}
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Number(e.target.value))}
                  className="input-field w-full text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-gray block mb-1">Width (cm)</label>
                <input
                  type="number"
                  min={1}
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className="input-field w-full text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-gray block mb-1">Height (cm)</label>
                <input
                  type="number"
                  min={1}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="input-field w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Tab 1: API Courier Aggregator */}
          {activeTab === "api" && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-gray">
                  Available Courier Options
                </span>
                <button
                  type="button"
                  onClick={handleCheckServiceability}
                  disabled={checkingCouriers}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  {checkingCouriers ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Search size={12} />
                  )}
                  Check Availability
                </button>
              </div>

              {courierOptions.length === 0 && !checkingCouriers && (
                <div className="p-8 text-center bg-surface-container-high/20 rounded-xl border border-dashed border-outline-variant/30">
                  <Truck size={32} className="mx-auto text-slate-gray mb-2 opacity-50" />
                  <p className="text-xs text-slate-gray">
                    Click &quot;Check Availability&quot; to fetch live rates & delivery times from courier partners.
                  </p>
                </div>
              )}

              {courierOptions.length > 0 && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {courierOptions.map((c) => {
                    const isSelected = selectedCourier?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCourier(c)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-primary-container/15 border-primary-container text-white"
                            : "bg-surface-container-high/40 border-outline-variant/20 hover:border-outline-variant/50 text-on-surface"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-primary-container bg-primary-container"
                                : "border-outline-variant"
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{c.name}</p>
                            <p className="text-xs text-slate-gray">
                              Est. Delivery: {c.minDays || c.estimatedDays}–{c.maxDays || c.estimatedDays + 2} Days
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-status-success text-sm">
                            {formatINR(c.totalCharge)}
                          </span>
                          <span className="text-[10px] text-slate-gray block">Available</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Manual Courier Entry */}
          {activeTab === "manual" && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-slate-gray block mb-1.5 font-medium">
                  Select Courier Partner Preset
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { name: "DTDC Express", url: "https://www.dtdc.in/tracking/shipment-tracking.asp?tracking_no=", days: 3 },
                    { name: "Blue Dart Express", url: "https://www.bluedart.com/tracking?track=", days: 2 },
                    { name: "Delhivery Logistics", url: "https://www.delhivery.com/track/package/", days: 4 },
                    { name: "Shree Anjani", url: "https://shreeanjani.co.in/", days: 2 },
                    { name: "India Post (Speed Post)", url: "https://www.indiapost.gov.in/_layouts/15/dpt.cept.trackconsignment/tracking.aspx", days: 4 },
                    { name: "Shree Tirupati", url: "https://www.shreetirupaticourier.net/", days: 3 },
                    { name: "Professional", url: "https://www.tpcindia.com/", days: 3 },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setManualCourier(preset.name);
                        setManualEstDays(preset.days);
                        if (manualAwb) {
                          setManualTrackingUrl(preset.url.includes("=") ? `${preset.url}${manualAwb}` : preset.url);
                        } else {
                          setManualTrackingUrl(preset.url);
                        }
                      }}
                      className={`text-xs py-1 px-2.5 rounded-lg border transition-all ${
                        manualCourier === preset.name
                          ? "bg-primary-container/20 border-primary-container text-white font-bold"
                          : "bg-surface-container-high/40 border-outline-variant/30 text-slate-gray hover:text-white"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-gray block mb-1">
                    Courier Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DTDC, Blue Dart, Delhivery, Professional"
                    value={manualCourier}
                    onChange={(e) => setManualCourier(e.target.value)}
                    className="input-field w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-gray block mb-1">
                    AWB / Tracking Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. D123456789 or 249012389"
                    value={manualAwb}
                    onChange={(e) => {
                      const val = e.target.value;
                      setManualAwb(val);
                      if (manualTrackingUrl && manualTrackingUrl.includes("=")) {
                        const baseUrl = manualTrackingUrl.split("=")[0] + "=";
                        setManualTrackingUrl(`${baseUrl}${val}`);
                      }
                    }}
                    className="input-field w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-gray block mb-1">
                  Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://track.dtdc.com/..."
                  value={manualTrackingUrl}
                  onChange={(e) => setManualTrackingUrl(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-gray block mb-1">
                    Estimated Delivery Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={manualEstDays}
                    onChange={(e) => setManualEstDays(Number(e.target.value))}
                    className="input-field w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-gray block mb-1">
                    Internal Notes / Comments
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Box 1 of 1 dispatched via ground"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="input-field w-full text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-outline-variant/20 flex items-center justify-between gap-4 bg-surface-container-high/30">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2.5 px-4"
          >
            Cancel
          </button>

          {activeTab === "api" ? (
            <button
              type="button"
              onClick={handleCreateApiShipment}
              disabled={!selectedCourier || isDispatching}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-50"
            >
              {isDispatching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Truck size={16} />
              )}
              {isDispatching ? "Generating AWB..." : "Dispatch & Generate AWB"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateManualShipment}
              disabled={!manualCourier || !manualAwb || isDispatching}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-50"
            >
              {isDispatching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {isDispatching ? "Saving..." : "Save Manual Shipment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
