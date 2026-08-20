"use client";

import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { AnimatedAccordion } from "@/components/ui/AnimatedAccordion";
import { FileText, Download, ShieldCheck, Star, ExternalLink, MessageCircle } from "lucide-react";
import Link from "next/link";

export function TechnicalDocsSection() {
  const docs = [
    {
      title: "TECHNICAL DATASHEET",
      desc: "Complete electrical, thermal, and chemical composition specifications for DW-AERO 100.",
      fileSize: "1.8 MB • PDF",
      tag: "SPECIFICATION",
    },
    {
      title: "INSTALLATION MANUAL",
      desc: "Step-by-step mounting guide for electrical panels, control boxes, and battery cabinets.",
      fileSize: "2.4 MB • PDF",
      tag: "GUIDE",
    },
    {
      title: "FIRE SAFETY COMPLIANCE",
      desc: "Certified engineering drawings and laboratory test reports for aerosol fire suppression devices.",
      fileSize: "3.1 MB • PDF",
      tag: "CERTIFICATE",
    },
  ];

  const faqs = [
    {
      id: "faq-1",
      title: "How does automatic activation work without electricity?",
      content:
        "The DW-AERO 100 features a thermal activation sensor cord wrapped inside the unit. When the internal cabinet temperature reaches 170°C, the sensor cord automatically ignites the solid aerosol compound without requiring any battery or power supply.",
      tag: "ACTIVATION",
    },
    {
      id: "faq-2",
      title: "Is the aerosol clean and safe for electronics?",
      content:
        "Yes. The aerosol release consists of ultra-fine potassium gas particles that extinguish fire by breaking the free-radical chemical chain reaction. It produces zero conductive residue and will not damage delicate microprocessors or PLC boards.",
      tag: "CLEAN AGENT",
    },
    {
      id: "faq-3",
      title: "How do I calculate GST credit for B2B orders?",
      content:
        "DIGITALWORLD issues an official 18% GST tax invoice with every order. Provide your GSTIN during checkout or quotation generation to claim full Input Tax Credit (ITC).",
      tag: "TAX & GST",
    },
    {
      id: "faq-4",
      title: "What is the shelf life and maintenance requirement?",
      content:
        "DW-AERO units have an operational lifespan of 10 years with zero pressure monitoring or annual weight refill requirements.",
      tag: "MAINTENANCE",
    },
  ];

  const reviews = [
    {
      name: "Rajesh Sharma",
      role: "Chief Electrical Engineer, Apex Power Systems",
      comment:
        "Installed 45 DW-AERO units across our main HT distribution panels. The instant quotation wizard saved us days of back-and-forth approval time.",
      rating: 5,
    },
    {
      name: "Vikram Malhotra",
      role: "Safety Director, Horizon Infra Solutions",
      comment:
        "Outstanding compact fire suppression units. The automatic thermal activation cord gives total peace of mind for unattended control cabinets.",
      rating: 5,
    },
  ];

  return (
    <section id="technical" className="py-20 bg-[#161719] border-b border-outline-variant/20">
      <div className="page-container">
        {/* Technical Documentation Cards */}
        <ScrollReveal variant="fade-up" className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="font-label-caps text-xs tracking-widest text-primary uppercase">
                ENGINEERING RESOURCES
              </span>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-white font-bold mt-1">
                Technical Documentation
              </h2>
            </div>
            <p className="text-body-technical text-slate-gray max-w-md">
              Download certified engineering drawings, installation schematics, and testing reports.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {docs.map((doc) => (
              <StaggerItem key={doc.title}>
                <div className="group bento-card p-6 flex flex-col justify-between border-outline-variant/20 hover:border-tertiary/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-label-caps text-[10px] text-tertiary border border-tertiary/30 bg-tertiary/10 px-2 py-0.5 rounded">
                        {doc.tag}
                      </span>
                      <FileText size={20} className="text-slate-gray group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-headline-sm text-base text-white group-hover:text-tertiary transition-colors mb-2">
                      {doc.title}
                    </h3>
                    <p className="text-body-technical text-xs text-on-surface-variant leading-relaxed">
                      {doc.desc}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-outline-variant/15 flex items-center justify-between text-xs text-slate-gray">
                    <span>{doc.fileSize}</span>
                    <Link
                      href="/catalog"
                      className="inline-flex items-center gap-1 text-tertiary font-bold hover:underline"
                    >
                      <Download size={14} />
                      <span>VIEW CATALOG</span>
                    </Link>

                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </ScrollReveal>

        {/* Customer Reviews & FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-outline-variant/20">
          {/* Reviews (Left) */}
          <div id="reviews" className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <span className="font-label-caps text-xs tracking-widest text-status-success uppercase">
                VERIFIED INDUSTRIAL REVIEWS
              </span>
              <h3 className="font-headline-md text-2xl text-white font-bold mt-1">
                Trusted by Industrial Engineers
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {reviews.map((r, i) => (
                <div key={i} className="bento-card p-6 border-outline-variant/20">
                  <div className="flex gap-1 text-tertiary mb-3">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} size={14} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-body-technical text-sm text-on-surface-variant leading-relaxed mb-4">
                    "{r.comment}"
                  </p>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-outline-variant/15">
                    <span className="text-white font-semibold">{r.name}</span>
                    <span className="text-slate-gray">{r.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordion (Right) */}
          <div id="faq" className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <span className="font-label-caps text-xs tracking-widest text-tertiary uppercase">
                FREQUENTLY ASKED QUESTIONS
              </span>
              <h3 className="font-headline-md text-2xl text-white font-bold mt-1">
                Technical FAQ
              </h3>
            </div>

            <AnimatedAccordion items={faqs} />
          </div>
        </div>
      </div>
    </section>
  );
}
