import { HeroSection } from "@/components/home/HeroSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProblemRiskSection } from "@/components/home/ProblemRiskSection";
import { HowItWorksTimeline } from "@/components/home/HowItWorksTimeline";
import { HomePricingCalculator } from "@/components/home/HomePricingCalculator";
import { TechnicalDocsSection } from "@/components/home/TechnicalDocsSection";
import { CircleGauge, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative bg-[#121413] text-on-surface overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Trust Strip Bar */}
      <TrustStrip />

      {/* Risk / Problem Applications */}
      <ProblemRiskSection />

      {/* How It Works Interactive 6-Stage Timeline */}
      <HowItWorksTimeline />

      {/* Product Pricing Calculator & Quantity Tiers */}
      <HomePricingCalculator />

      {/* Technical Documents, Reviews & FAQ Accordions */}
      <TechnicalDocsSection />

      {/* Wholesale Banner */}
      <section className="py-14 bg-[#18191b] border-t border-outline-variant/20">
        <div className="page-container">
          <div className="bento-card p-8 lg:p-10 border-primary-container/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 bg-gradient-to-r from-surface-charcoal via-surface-container-high to-surface-charcoal">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary-container/20 border border-primary-container/40 p-3.5 text-primary shrink-0">
                <CircleGauge size={28} />
              </div>
              <div>
                <span className="font-label-caps text-xs text-tertiary tracking-widest block uppercase">
                  INDUSTRIAL CONTRACTORS &amp; DISTRIBUTORS
                </span>
                <h2 className="font-headline-md text-2xl lg:text-3xl text-white font-bold mt-1">
                  Apply for Wholesale &amp; B2B Partner Pricing
                </h2>
                <p className="text-body-technical text-on-surface-variant mt-2 max-w-2xl">
                  Register your company GSTIN to receive custom volume tiers, credit terms, and dedicated technical account support.
                </p>
              </div>
            </div>

            <Link href="/wholesale" className="shrink-0 w-full lg:w-auto">
              <button className="btn-primary w-full lg:w-auto gap-2 px-8 py-3.5 text-xs tracking-wider shadow-lg">
                <span>APPLY FOR B2B PARTNER ACCESS</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
