"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Thermometer, Zap, ShieldCheck } from "lucide-react";

export function HowItWorksTimeline() {
  const steps = [
    {
      num: "01",
      title: "HEAT DETECTED",
      desc: "Thermal activation cord senses localized ambient temperatures reaching 170°C inside the protected cabinet.",
      detail: "No electrical wiring or battery power needed for trigger.",
      icon: Thermometer,
      highlightColor: "border-primary-container text-primary-container",
    },
    {
      num: "02",
      title: "THERMAL ACTIVATION",
      desc: "Thermal reaction triggers the micro-aerosol solid compound to initialize rapid transformation.",
      detail: "Non-pressurized vessel ensures safe storage and zero explosion risk.",
      icon: Zap,
      highlightColor: "border-tertiary text-tertiary",
    },
    {
      num: "03",
      title: "AEROSOL RELEASE",
      desc: "Ultra-fine potassium aerosol floods the enclosure within seconds, breaking the chemical fire reaction.",
      detail: "Leaves zero conductive residue; safe for live electrical circuits.",
      icon: ShieldCheck,
      highlightColor: "border-status-success text-status-success",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#161719] border-b border-outline-variant/20 relative">
      <div className="page-container">
        <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-caps text-xs tracking-widest text-tertiary uppercase">
            ENGINEERING MECHANISM
          </span>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-white font-bold mt-2">
            How Heat Aerosol Suppression Works
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-4">
            Autonomous protection sequence requiring zero human intervention, zero piping, and zero external electrical power.
          </p>
        </ScrollReveal>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.num} variant="fade-up" delay={idx * 0.15}>
                <div className="bento-card h-full p-8 relative flex flex-col justify-between border-outline-variant/25 hover:border-tertiary/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-3xl font-bold text-slate-gray/60">
                        {step.num}
                      </span>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container border ${step.highlightColor}`}>
                        <Icon size={24} />
                      </div>
                    </div>

                    <h3 className="font-headline-sm text-lg text-white tracking-wide mb-3">
                      {step.title}
                    </h3>
                    <p className="text-body-technical text-on-surface-variant leading-relaxed mb-6">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/15 text-xs text-slate-gray font-body-technical">
                    {step.detail}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
