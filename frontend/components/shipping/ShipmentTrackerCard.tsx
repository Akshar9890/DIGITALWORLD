"use client";

import { useState } from "react";
import {
  Truck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
  PackageCheck,
  Building,
} from "lucide-react";

interface TrackingEvent {
  id?: string;
  internalStatus: string;
  externalStatus?: string;
  location?: string;
  description?: string;
  timestamp?: string | Date;
  eventTimestamp?: string | Date;
}

interface ShipmentTrackerCardProps {
  shipment: {
    id: string;
    courierName: string;
    courierCode?: string | null;
    awbNumber: string;
    trackingUrl?: string | null;
    status: string;
    estimatedDeliveryDate?: string | Date | null;
    pickupDate?: string | Date | null;
    trackingEvents?: TrackingEvent[];
  };
}

const STEPS = [
  { key: "ORDER_PLACED", label: "Order Placed" },
  { key: "PACKED", label: "Packed" },
  { key: "PICKED_UP", label: "Dispatched" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function ShipmentTrackerCard({ shipment }: ShipmentTrackerCardProps) {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [events, setEvents] = useState<TrackingEvent[]>(shipment.trackingEvents || []);
  const [currentStatus, setCurrentStatus] = useState(shipment.status);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopyAwb = () => {
    navigator.clipboard.writeText(shipment.awbNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/shipments/${shipment.id}/tracking`);
      if (res.ok) {
        const data = await res.json();
        if (data.shipment) {
          setCurrentStatus(data.shipment.status);
          setEvents(data.shipment.trackingEvents || []);
        }
      }
    } catch (err) {
      console.error("Failed to refresh tracking:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Determine active step index
  const getStepIndex = (status: string) => {
    switch (status) {
      case "ORDER_PLACED":
      case "PAYMENT_CONFIRMED":
      case "PROCESSING":
        return 0;
      case "PACKED":
      case "SHIPMENT_CREATED":
        return 1;
      case "PICKUP_SCHEDULED":
      case "PICKED_UP":
        return 2;
      case "IN_TRANSIT":
      case "REACHED_DESTINATION":
        return 3;
      case "OUT_FOR_DELIVERY":
        return 4;
      case "DELIVERED":
        return 5;
      default:
        return 2;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-lg mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant/15">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container">
            <Truck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-gray uppercase tracking-wider">
                Courier: {shipment.courierName}
              </span>
              <span className="badge-info text-[10px] py-0.5">
                {currentStatus.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-gray">AWB / Tracking:</span>
              <span className="font-mono font-bold text-white text-sm">
                {shipment.awbNumber}
              </span>
              <button
                onClick={handleCopyAwb}
                className="text-slate-gray hover:text-white p-1 rounded transition-colors"
                title="Copy AWB"
              >
                {copied ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            title="Refresh Tracking Status"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Live Status</span>
          </button>
          {shipment.trackingUrl && (
            <a
              href={shipment.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span>Courier Portal</span>
            </a>
          )}
        </div>
      </div>

      {/* Expected Delivery Banner */}
      <div className="my-5 p-3.5 bg-surface-container-high/40 rounded-xl border border-outline-variant/15 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-white">
          <Clock size={16} className="text-tertiary" />
          <span>
            Expected Delivery:{" "}
            <strong className="text-primary-container font-semibold">
              {shipment.estimatedDeliveryDate
                ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "3–5 Business Days"}
            </strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-gray hidden sm:inline">
          Dispatched from Vadodara Hub
        </span>
      </div>

      {/* Normalized 6-Step Visual Timeline */}
      <div className="py-4">
        <div className="grid grid-cols-6 gap-1 relative">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.key} className="flex flex-col items-center text-center relative">
                {/* Step Connector Line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`absolute top-3.5 left-1/2 w-full h-1 -z-0 transition-colors ${
                      idx < activeIndex
                        ? "bg-status-success"
                        : "bg-surface-container-highest"
                    }`}
                  />
                )}

                {/* Step Node Icon */}
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center z-10 transition-all ${
                    isCompleted
                      ? "bg-status-success text-white ring-4 ring-status-success/20"
                      : "bg-surface-container-highest text-slate-gray border border-outline-variant/40"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <span className="text-[11px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[11px] mt-2 leading-tight transition-colors ${
                    isCurrent
                      ? "text-primary-container font-bold"
                      : isCompleted
                      ? "text-white font-medium"
                      : "text-slate-gray"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Tracking Activities Log */}
      <div className="mt-4 pt-4 border-t border-outline-variant/15">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-xs text-slate-gray hover:text-white py-1 font-medium transition-colors"
        >
          <span>Detailed Tracking Activities ({events.length})</span>
          {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-3 max-h-56 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-xs text-slate-gray py-2 italic">
                Shipment has been manifested. Tracking scans will appear once picked up by courier.
              </p>
            ) : (
              events.map((ev, i) => {
                const ts = ev.eventTimestamp || ev.timestamp;
                return (
                  <div
                    key={ev.id || i}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container-high/30 border border-outline-variant/10 text-xs"
                  >
                    <div className="mt-0.5 text-primary-container shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{ev.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-gray mt-0.5">
                        {ev.location && <span>Location: {ev.location}</span>}
                        {ts && (
                          <span>
                            {new Date(ts).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
