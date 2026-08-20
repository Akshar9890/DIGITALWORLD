"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  Shield,
  Thermometer,
  Zap,
  Wind,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Atom,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HowItWorksTimeline() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const stages = [
    {
      num: "01",
      title: "NORMAL STANDBY",
      headline: "Autonomous Ready State",
      summary: "Non-pressurized solid aerosol compound sits in passive standby for 10 years without requiring power, piping, or pressure monitoring.",
      techDetails: "Zero internal pressure prevents leakage or cylinder explosion risks. The solid composite is stable from -50°C to +90°C.",
      icon: Shield,
      tag: "10-YEAR LIFESPAN",
    },
    {
      num: "02",
      title: "HEAT DETECTED",
      headline: "Thermal Sensor Trigger",
      summary: "Thermal cord detects localized ambient enclosure temperatures reaching ≥ 170°C or direct open flame exposure.",
      techDetails: "Thermal activation cord requires zero electricity or battery backup. Responds in milliseconds to arcing or thermal runaway.",
      icon: Thermometer,
      tag: "≥ 170°C / FLAME SENSING",
    },
    {
      num: "03",
      title: "ACTIVATION",
      headline: "Solid Compound Initiation",
      summary: "Thermal trigger initializes the internal chemical generator, transforming the solid composite into ultra-fine micron aerosol gas.",
      techDetails: "Proprietary oxidizer composition: Sr(NO₃)₂ 60% / KNO₃ 20%. Controlled exothermic initiation within the insulated casing.",
      icon: Zap,
      tag: "NON-EXPLOSIVE",
    },
    {
      num: "04",
      title: "AEROSOL DISCHARGE",
      headline: "360° Volumetric Dispersion",
      summary: "Dual nozzles discharge clean potassium aerosol, flooding the enclosed volume in under 5 seconds.",
      techDetails: "Microscopic particulate suspension (1–2 microns) flows around busbars, breakers, and dense wire harnesses without shadowing.",
      icon: Wind,
      tag: "≤ 5 SEC DISCHARGE",
    },
    {
      num: "05",
      title: "FIRE SUPPRESSION",
      headline: "Potassium Radical Chain-Breaking",
      summary: "Potassium radicals (K·) react with free radicals (O·, H·, OH·) in the flame, breaking combustion chemistry without displacing oxygen.",
      techDetails: "Reaction: K + OH → KOH. Operates by chemical interference, keeping room oxygen levels safe for breathing.",
      icon: Atom,
      tag: "O₂ NOT DISPLACED",
    },
    {
      num: "06",
      title: "PROTECTED",
      headline: "Zero Residue & Asset Safe",
      summary: "Combustion is extinguished. The aerosol dissipates with ventilation, leaving zero corrosive or conductive residue on electronics.",
      techDetails: "Safe on live electrical circuits up to 24 kV. Post-discharge cleanup requires standard ventilation without water damage.",
      icon: ShieldCheck,
      tag: "ZERO CONDUCTIVE ASH",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#161719] border-b border-outline-variant/20 relative">
      <div className="page-container">
        <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-caps text-xs tracking-widest text-tertiary uppercase flex items-center justify-center gap-1.5 mb-2">
            <Flame size={14} className="text-primary-container" />
            <span>INTERACTIVE ENGINEERING TIMELINE</span>
          </span>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-white font-bold">
            How Condensed Aerosol Suppression Works
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            A 6-stage autonomous suppression sequence that requires zero electrical wiring, zero piping, and leaves zero residue on sensitive electronics.
          </p>
        </ScrollReveal>

        {/* Interactive Step Selector Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? "border-tertiary bg-surface-container-high shadow-lg ring-1 ring-tertiary"
                    : "border-outline-variant/20 bg-surface-container/60 hover:bg-surface-container hover:border-outline-variant/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-slate-gray">{st.num}</span>
                    <Icon
                      size={18}
                      className={isActive ? "text-tertiary" : "text-slate-gray"}
                    />
                  </div>
                  <h4 className="font-headline-sm text-xs font-bold text-white tracking-wide">
                    {st.title}
                  </h4>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTimelineBar"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-tertiary"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Stage Expanded Detail Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bento-card p-8 lg:p-10 border-tertiary/40 bg-surface-charcoal/90 relative overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-2xl font-bold text-tertiary">
                    {stages[activeStep].num}
                  </span>
                  <span className="text-xs font-label-caps text-slate-gray uppercase">
                    / STAGE {activeStep + 1} OF 6
                  </span>
                  <span className="badge-info text-xs">
                    {stages[activeStep].tag}
                  </span>
                </div>

                <h3 className="font-headline-md text-2xl lg:text-3xl text-white font-bold">
                  {stages[activeStep].headline}
                </h3>

                <p className="text-body-lg text-on-surface-variant leading-relaxed">
                  {stages[activeStep].summary}
                </p>

                <div className="p-4 rounded-xl bg-surface-container/80 border border-outline-variant/20 text-xs md:text-sm text-slate-gray font-body-technical">
                  <strong className="text-white block mb-1">Technical Specification:</strong>
                  {stages[activeStep].techDetails}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-container border border-outline-variant/30 text-center">
                <div className="h-20 w-20 rounded-2xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary mb-3">
                  {(() => {
                    const CurrentIcon = stages[activeStep].icon;
                    return <CurrentIcon size={40} className="text-tertiary" />;
                  })()}
                </div>
                <span className="font-label-caps text-xs text-tertiary tracking-widest uppercase">
                  {stages[activeStep].title}
                </span>
                <span className="text-xs text-slate-gray mt-1">Autonomous Mechanism</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
