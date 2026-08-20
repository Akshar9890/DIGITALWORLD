"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowRight, FileText, Zap, Radio, CheckCircle2, Flame, Boxes, Scale } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#121413] py-16 lg:py-24 border-b border-outline-variant/20">
      {/* Precision Engineering Grid Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 industrial-grid opacity-30" />

      {/* Atmospheric Radial Lights */}
      <div className="pointer-events-none absolute left-1/2 top-[-10rem] -z-10 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full bg-primary-container/15 blur-[160px]" />
      <div className="pointer-events-none absolute right-[-10rem] top-[20rem] -z-10 h-[40rem] w-[40rem] rounded-full bg-tertiary/10 blur-[150px]" />

      <div className="page-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Small Engineering Label */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary-container/40 bg-primary-container/10 px-3.5 py-1.5 text-label-caps text-primary shadow-sm"
            >
              <Radio size={14} className="animate-pulse" />
              <span>CERTIFIED INDUSTRIAL FIRE PROTECTION PLATFORM</span>
            </motion.div>

            {/* Main Staggered Headline */}
            <h1 className="font-headline-lg-mobile text-on-surface lg:font-headline-lg tracking-tight font-bold">
              <motion.span
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                Industrial Fire Protection
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-tertiary"
              >
                For Critical Enclosed Equipment.
              </motion.span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-2xl text-body-lg text-on-surface-variant leading-relaxed"
            >
              Automatic condensed aerosol fire suppression for electrical panels, control cabinets, battery enclosures, server racks, and industrial machinery. Autonomous thermal trigger. Zero piping. Zero conductive residue.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto"
            >
              <Link href="/catalog">
                <MagneticButton className="btn-primary w-full sm:w-auto gap-2 px-8 py-3.5 text-xs tracking-wider shadow-xl shadow-primary-container/25">
                  <Flame size={16} />
                  <span>BROWSE PRODUCTS</span>
                  <ArrowRight size={16} />
                </MagneticButton>
              </Link>
              <Link href="/quotation">
                <MagneticButton className="btn-secondary w-full sm:w-auto gap-2 px-7 py-3.5 text-xs tracking-wider border-tertiary text-tertiary">
                  <FileText size={16} />
                  <span>GET A B2B QUOTE</span>
                </MagneticButton>
              </Link>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-outline-variant/20 w-full"
            >
              <div>
                <span className="block font-headline-md text-white text-xl lg:text-2xl font-mono">170°C</span>
                <span className="text-[11px] font-label-caps text-slate-gray">THERMAL TRIGGER</span>
              </div>
              <div>
                <span className="block font-headline-md text-tertiary text-xl lg:text-2xl font-mono">&le; 5 SEC</span>
                <span className="text-[11px] font-label-caps text-slate-gray">DISCHARGE SPEED</span>
              </div>
              <div>
                <span className="block font-headline-md text-status-success text-xl lg:text-2xl font-mono">10 YRS</span>
                <span className="text-[11px] font-label-caps text-slate-gray">SERVICE LIFE</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Product Showcase Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-surface-container-high/80 via-surface-charcoal/95 to-surface-container-lowest border border-outline-variant/30 p-6 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 industrial-grid opacity-20 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container/90 border border-tertiary/20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-container/20 border border-primary-container/50 text-primary-container mb-4 shadow-inner">
                  <Flame size={44} className="text-tertiary" />
                </div>
                <span className="font-label-caps text-xs tracking-widest text-tertiary">QRR0.01G/S &amp; QRRO-10</span>
                <h3 className="font-headline-sm text-lg text-white mt-1">Condensed Aerosol Suppressor</h3>
                <p className="text-body-technical text-xs text-slate-gray mt-2 leading-relaxed">
                  Autonomous direct-to-source suppression unit. Non-pressurized, 10-year shelf life, zero residue.
                </p>

                <div className="mt-5 w-full pt-4 border-t border-outline-variant/20">
                  <Link href="/catalog" className="w-full">
                    <button className="btn-primary w-full py-2.5 text-[11px] tracking-wider">
                      VIEW PRODUCTS
                    </button>
                  </Link>
                </div>
              </div>

              {/* Technical Badges */}
              <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-gray px-2">
                <span>⚡ 100 g/m³ Design Density</span>
                <span>🛡️ Non-Conductive</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
