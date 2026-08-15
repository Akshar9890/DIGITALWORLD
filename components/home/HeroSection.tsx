"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, ArrowRight, FileText, Zap, Radio, Thermometer, CheckCircle2, Flame, Boxes } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function HeroSection() {
  const callouts = [
    { title: "THERMAL ACTIVATION", value: "170°C Auto Trigger", top: "18%", left: "12%", dir: "left" },
    { title: "CLEAN AGENT", value: "Zero Residue / Safe", top: "25%", right: "8%", dir: "right" },
    { title: "COMPACT DESIGN", value: "Fits Inside Enclosures", bottom: "30%", left: "10%", dir: "left" },
    { title: "ZERO PRESSURE", value: "10 Year Shelf Life", bottom: "22%", right: "12%", dir: "right" },
  ];

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
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Small Label */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary-container/40 bg-primary-container/10 px-3.5 py-1.5 text-label-caps text-primary shadow-sm"
            >
              <Radio size={14} className="animate-pulse" />
              <span>FIRE SUPPRESSION TECHNOLOGY / 01</span>
            </motion.div>

            {/* Main Staggered Headline */}
            <h1 className="font-headline-lg-mobile text-on-surface lg:font-headline-lg tracking-tight font-bold">
              <motion.span
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                Protect What Keeps
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-tertiary"
              >
                Your Business Running.
              </motion.span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-body-lg text-on-surface-variant leading-relaxed"
            >
              Automatic heat aerosol fire suppression devices designed for electrical panels, MCB boxes, battery enclosures, and critical industrial machinery. Instant trigger. Zero pressure. No residue.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link href="/products">
                <MagneticButton className="btn-primary w-full sm:w-auto gap-2 px-8 py-3.5 text-sm tracking-wider shadow-xl shadow-primary-container/25">
                  <span>BROWSE PRODUCTS</span>
                  <ArrowRight size={18} />
                </MagneticButton>
              </Link>
              <Link href="/quotation">
                <MagneticButton className="btn-secondary w-full sm:w-auto gap-2 px-8 py-3.5 text-sm tracking-wider">
                  <FileText size={18} className="text-tertiary" />
                  <span>GET INSTANT QUOTATION</span>
                </MagneticButton>
              </Link>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-outline-variant/20 w-full"
            >
              <div>
                <span className="block font-headline-md text-white text-xl lg:text-2xl font-mono">170°C</span>
                <span className="text-[11px] font-label-caps text-slate-gray">AUTO TRIGGER</span>
              </div>
              <div>
                <span className="block font-headline-md text-tertiary text-xl lg:text-2xl font-mono">0 SEC</span>
                <span className="text-[11px] font-label-caps text-slate-gray">PIPELESS</span>
              </div>
              <div>
                <span className="block font-headline-md text-status-success text-xl lg:text-2xl font-mono">10 YRS</span>
                <span className="text-[11px] font-label-caps text-slate-gray">LIFESPAN</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Product Showcase & Animated SVG Callouts */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] lg:min-h-[540px]">
            {/* Ambient Background Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md aspect-square rounded-2xl bg-gradient-to-b from-surface-container-high/80 via-surface-charcoal/90 to-surface-container-lowest border border-outline-variant/30 p-6 backdrop-blur-xl shadow-2xl flex items-center justify-center overflow-hidden"
            >
              {/* Grid Background inside Box */}
              <div className="absolute inset-0 industrial-grid opacity-20 pointer-events-none" />

              {/* Central Glowing Shield / Product Graphic */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 flex flex-col items-center justify-center p-8 rounded-2xl bg-surface-container/90 border border-tertiary/30 shadow-2xl backdrop-blur-md text-center max-w-xs"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-container/20 border border-primary-container/50 text-primary-container mb-4 shadow-inner">
                  <Flame size={48} className="animate-pulse text-tertiary" />
                </div>
                <span className="font-label-caps text-xs tracking-widest text-tertiary">DW-AERO 100 DEVICE</span>
                <h3 className="font-headline-sm text-lg text-white mt-1">Heat Aerosol Suppression</h3>
                <p className="text-body-technical text-xs text-slate-gray mt-2">
                  Independent compact unit with automatic thermal cable detector.
                </p>

                <div className="mt-4 flex items-center gap-2 rounded-full bg-surface-container-highest px-3 py-1 border border-outline-variant/30 text-[11px] text-on-surface">
                  <span className="h-2 w-2 rounded-full bg-status-success" />
                  <span>READY FOR DEPLOYMENT</span>
                </div>
              </motion.div>

              {/* Floating Technical Indicators Around Product */}
              <div className="absolute top-6 left-6 flex items-center gap-2 rounded-lg bg-surface-charcoal/90 border border-outline-variant/30 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono text-on-surface">
                <Zap size={13} className="text-tertiary" />
                <span>10G CAPACITY</span>
              </div>

              <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg bg-surface-charcoal/90 border border-outline-variant/30 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono text-on-surface">
                <CheckCircle2 size={13} className="text-status-success" />
                <span>ISO / CE TESTED</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
