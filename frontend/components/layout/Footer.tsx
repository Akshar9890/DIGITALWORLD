"use client";

import Link from "next/link";
import { Shield, Mail, Phone, MapPin, ArrowUpRight, Flame } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function Footer() {
  return (
    <footer className="border-t border-outline-variant/30 bg-[#111214] text-on-surface pt-16 pb-12">
      <div className="page-container">
        <ScrollReveal variant="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-outline-variant/20">
            {/* Brand Column */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-white shadow-lg">
                  <Shield size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-2xl leading-none text-white font-bold">
                    DIGITALWORLD
                  </span>
                  <span className="text-[10px] font-label-caps tracking-[0.2em] text-primary mt-1">
                    INDUSTRIAL FIRE SUPPRESSION
                  </span>
                </div>
              </div>

              <p className="text-body-technical text-on-surface-variant max-w-md leading-relaxed">
                Fire Protection. Simplified. Advanced heat aerosol fire suppression systems engineered for electrical panels, control cabinets, MCB boxes, and critical industrial assets.
              </p>

              <div className="flex items-center gap-3 text-xs font-label-caps text-tertiary">
                <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse" />
                <span>CE / ISO / ISI CERTIFIED FIRE SAFETY</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <p className="font-label-caps text-xs tracking-widest text-slate-gray uppercase mb-1">
                Products & Tools
              </p>
              <Link href="/products" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                Fire Aerosol Devices
              </Link>
              <Link href="/catalog" className="text-sm text-on-surface-variant hover:text-white transition-colors font-bold text-tertiary">
                Product Catalog & Specs
              </Link>

              <Link href="/quotation" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                Instant Quotation Wizard
              </Link>
              <Link href="/wholesale" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                Wholesale / B2B Access
              </Link>
              <Link href="/cart" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                Cart & Order Tracking
              </Link>
            </div>

            {/* Information */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <p className="font-label-caps text-xs tracking-widest text-slate-gray uppercase mb-1">
                Company & Policy
              </p>
              <Link href="/about" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                About DIGITALWORLD
              </Link>
              <Link href="/contact" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                Contact & Support
              </Link>
              <Link href="/shipping" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                Shipping & GST Invoice
              </Link>
              <Link href="/terms" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-sm text-on-surface-variant hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <p className="font-label-caps text-xs tracking-widest text-slate-gray uppercase mb-1">
                Industrial Support
              </p>
              <a href="tel:+917043633303" className="flex items-center gap-2.5 text-sm text-on-surface-variant hover:text-white transition-colors">
                <Phone size={16} className="text-primary-container" />
                <span>+91 70436 33303</span>
              </a>
              <a href="mailto:digitalworld9890@gmail.com" className="flex items-center gap-2.5 text-sm text-on-surface-variant hover:text-white transition-colors">
                <Mail size={16} className="text-primary-container" />
                <span>digitalworld9890@gmail.com</span>
              </a>
              <div className="flex items-start gap-2.5 text-sm text-slate-gray pt-1">
                <MapPin size={16} className="text-primary-container shrink-0 mt-0.5" />
                <span>Industrial Area, Phase 2, New Delhi, India</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-gray font-body-technical">
          <p>© {new Date().getFullYear()} DIGITALWORLD. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span>Pan-India Courier Delivery</span>
            <span>•</span>
            <span>18% GST Compliant Invoice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
