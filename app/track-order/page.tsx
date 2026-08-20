"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  PackageSearch,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

const TRACKING_STEPS = [
  { key: "ORDER_PLACED", label: "Order Placed" },
  { key: "PACKED", label: "Packed & Ready" },
  { key: "PICKED_UP", label: "Dispatched" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || searchParams.get("awb") || searchParams.get("order") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTracking = async (searchVal: string) => {
    if (!searchVal.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track?query=${encodeURIComponent(searchVal.trim())}`);
      const data = await res.json();
      if (res.ok && data.shipment) {
        setShipment(data.shipment);
      } else {
        setShipment(null);
        setError(data.error || "No shipment found matching this Order ID or AWB number.");
      }
    } catch (err: any) {
      setError("Tracking service is currently unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "ORDER_PLACED":
      case "PENDING":
        return 0;
      case "PACKED":
      case "MANIFESTED":
        return 1;
      case "PICKED_UP":
      case "DISPATCHED":
        return 2;
      case "IN_TRANSIT":
        return 3;
      case "OUT_FOR_DELIVERY":
        return 4;
      case "DELIVERED":
        return 5;
      default:
        return 0;
    }
  };

  const currentStep = shipment ? getStepIndex(shipment.status) : 0;

  return (
    <div className="aura min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <Reveal className="max-w-2xl">
          <span className="label-caps text-gold-foreground font-semibold">Live Courier Tracking</span>
          <h1 className="mt-3 font-display text-4xl lg:text-5xl font-bold text-foreground">Where is my shipment?</h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Enter your AWB tracking number or Order ID (e.g. <strong className="text-foreground font-mono">DW-2026-0010</strong>) to view real-time courier milestones.
          </p>
        </Reveal>

        {/* Search Bar */}
        <Reveal delay={80} className="mt-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTracking(query);
            }}
            className="glass grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl p-2.5 shadow-glass border border-border/60"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter AWB or Order Number (e.g. D123466 or DW-2026-0010)"
              className="min-w-0 bg-transparent px-4 py-3 font-mono text-sm text-foreground outline-hidden placeholder:text-muted-foreground/60"
              aria-label="AWB or order ID"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground transition-all hover:shadow-lift disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <PackageSearch className="size-4" />}
              <span>Track</span>
            </button>
          </form>
        </Reveal>

        {error && (
          <Reveal className="mt-8">
            <div className="glass rounded-2xl p-6 border border-destructive/30 bg-destructive/5 flex items-start gap-4">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-destructive">Tracking Record Not Found</p>
                <p className="text-muted-foreground mt-1">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Need help? Contact dispatch support at <a href="tel:+917043633303" className="text-primary underline">+91 70436 33303</a>.
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {shipment && (
          <Reveal className="mt-10">
            <div className="glass rounded-3xl p-8 lg:p-10 shadow-glass border border-border/60">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
                <div>
                  <span className="label-caps text-muted-foreground font-medium">Carrier &amp; Mode</span>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">
                    {shipment.courierName || "Authorized Surface Courier"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order ID: <strong className="font-mono text-foreground">{shipment.orderId}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopy(shipment.awbNumber || shipment.orderId)}
                    className="inline-flex items-center gap-2 rounded-xl glass-soft px-4 py-2.5 font-mono text-xs font-semibold text-foreground border border-border/60 hover:bg-secondary transition-colors"
                  >
                    <span>AWB: {shipment.awbNumber || "PENDING"}</span>
                    {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </button>

                  {shipment.trackingUrl && (
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:shadow-md transition-all"
                    >
                      <span>Direct Courier Site</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>

              {/* Milestone Timeline */}
              <div className="mt-8">
                <ol className="space-y-0">
                  {TRACKING_STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const isCurrent = i === currentStep;

                    return (
                      <li key={step.key} className="grid grid-cols-[auto_minmax(0,1fr)] gap-5">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "grid size-8 shrink-0 place-items-center rounded-full border transition-colors shadow-sm",
                              done
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-muted-foreground"
                            )}
                          >
                            {done ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-muted" />}
                          </span>
                          {i < TRACKING_STEPS.length - 1 && (
                            <span
                              className={cn(
                                "w-0.5 flex-1 min-h-[42px]",
                                i < currentStep ? "bg-primary" : "bg-border/60"
                              )}
                            />
                          )}
                        </div>
                        <div className="min-w-0 pb-6">
                          <div className="flex items-center justify-between gap-4">
                            <p
                              className={cn(
                                "truncate font-medium text-sm",
                                isCurrent ? "text-primary font-bold" : done ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="label-caps text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                                Current Status
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {isCurrent && shipment.currentLocation
                              ? `Location: ${shipment.currentLocation}`
                              : done
                              ? "Completed"
                              : "Pending dispatch milestone"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Tracking Events History */}
              {shipment.events && shipment.events.length > 0 && (
                <div className="mt-8 border-t border-border/50 pt-6">
                  <h3 className="text-xs font-semibold label-caps text-muted-foreground mb-4">Detailed Courier Activity Log</h3>
                  <div className="space-y-3">
                    {shipment.events.map((ev: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between text-xs bg-secondary/30 p-3 rounded-xl border border-border/40">
                        <div>
                          <p className="font-semibold text-foreground">{ev.status || ev.activity}</p>
                          <p className="text-muted-foreground mt-0.5">{ev.location || "En-route Hub"}</p>
                        </div>
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {new Date(ev.timestamp || ev.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="aura min-h-screen grid place-items-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
