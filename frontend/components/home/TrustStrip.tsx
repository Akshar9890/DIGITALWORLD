"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Zap, Wrench, Box, Truck, FileCheck } from "lucide-react";

export function TrustStrip() {
  const items = [
    { label: "AUTOMATIC ACTIVATION", desc: "Self-triggering 170°C heat sensor", icon: Zap },
    { label: "EASY INSTALLATION", desc: "No complex piping or pressure vessels", icon: Wrench },
    { label: "COMPACT DESIGN", desc: "Fits inside tight electrical panels", icon: Box },
    { label: "PAN-INDIA DELIVERY", desc: "Fast insured dispatch across India", icon: Truck },
    { label: "GST INVOICE", desc: "18% GST invoice for B2B input credit", icon: FileCheck },
  ];

  return (
    <section className="bg-[#18191b] border-b border-outline-variant/20 py-8 overflow-hidden">
      <div className="page-container">
        <ScrollReveal variant="fade-up">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex flex-col gap-1.5 p-3 rounded-lg border border-outline-variant/15 bg-surface-charcoal/50 hover:bg-surface-container-high/60 transition-colors"
                >
                  <div className="flex items-center gap-2 text-tertiary">
                    <Icon size={18} />
                    <span className="font-label-caps text-[11px] font-bold tracking-wider text-white">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[12px] text-slate-gray leading-tight">
                    {item.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
