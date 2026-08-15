"use client";

import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { Zap, Cpu, Battery, Server, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProblemRiskSection() {
  const risks = [
    {
      title: "Electrical Panels",
      desc: "Short circuits and loose terminals are the #1 cause of industrial panel fires.",
      icon: Zap,
      stat: "80% of Panel Fires Start Inside",
      riskLevel: "HIGH RISK ZONE",
    },
    {
      title: "MCB & Breaker Boxes",
      desc: "High load overcurrent leads to insulation melting and flashover risks.",
      icon: ShieldAlert,
      stat: "Instant Suppression Needed",
      riskLevel: "CRITICAL ASSET",
    },
    {
      title: "Control Cabinets & PLCs",
      desc: "PLC & automation downtime costs thousands per minute of factory outage.",
      icon: Cpu,
      stat: "Zero Damage to Electronics",
      riskLevel: "HIGH VALUE",
    },
    {
      title: "Battery Enclosures & BESS",
      desc: "Thermal runaway in lithium battery banks spreads in seconds without intervention.",
      icon: Battery,
      stat: "170°C Immediate Trigger",
      riskLevel: "THERMAL THREAT",
    },
    {
      title: "Server & IT Racks",
      desc: "Clean aerosol leaves zero residue, protecting sensitive network equipment.",
      icon: Server,
      stat: "Clean Agent Safe",
      riskLevel: "IT INFRASTRUCTURE",
    },
  ];

  return (
    <section id="applications" className="py-20 bg-[#121413] border-b border-outline-variant/20">
      <div className="page-container">
        <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-caps text-xs tracking-widest text-primary uppercase">
            RISK ASSESSMENT & APPLICATION ZONES
          </span>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-white font-bold mt-2">
            Fire Doesn’t Wait. Neither Should Protection.
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-4">
            Industrial equipment operates under constant thermal and electrical stress. Discover where heat aerosol devices provide instant, non-destructive fire suppression.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {risks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <div className="group bento-card h-full p-7 flex flex-col justify-between border-outline-variant/20 hover:border-tertiary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/30 text-tertiary group-hover:bg-tertiary/10 transition-colors">
                        <Icon size={24} />
                      </div>
                      <span className="text-[10px] font-label-caps tracking-widest text-slate-gray border border-outline-variant/30 px-2.5 py-1 rounded">
                        {item.riskLevel}
                      </span>
                    </div>

                    <h3 className="font-headline-sm text-xl text-white group-hover:text-tertiary transition-colors mb-3">
                      {item.title}
                    </h3>
                    <p className="text-body-technical text-on-surface-variant leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-outline-variant/15 flex items-center justify-between text-xs font-label-caps">
                    <span className="text-primary font-bold">{item.stat}</span>
                    <Link
                      href={`/quotation?product=heat-aerosol-fire-extinguishing-device&qty=1`}
                      className="inline-flex items-center gap-1 text-slate-gray group-hover:text-white transition-colors"
                    >
                      <span>PROTECT</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
