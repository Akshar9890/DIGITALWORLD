"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import {
  FileText,
  Download,
  Printer,
  Shield,
  Zap,
  CheckCircle2,
  Flame,
  ChevronRight,
  ArrowLeft,
  Maximize2,
  FileCheck,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function CatalogPage() {
  const [selectedImg, setSelectedImg] = useState<string>("/images/products/heat-aerosol-1.jpg");

  const catalogImages = [
    { src: "/images/products/heat-aerosol-1.jpg", label: "01. Fire Suppression Action", desc: "Aerosol discharge extinguishing electrical flame instantly" },
    { src: "/images/products/heat-aerosol-6.jpg", label: "02. Dual-Nozzle Rapid Spread", desc: "Symmetrical left & right nozzle discharge for fast coverage" },
    { src: "/images/products/heat-aerosol-7.jpg", label: "03. Automatic Thermal Induction", desc: "Auto-trigger in electrical panels at open flame or 170°C" },
    { src: "/images/products/heat-aerosol-2.jpg", label: "04. Product Dimensions", desc: "3.03in × 2.44in × 0.75in body with 5.12in thermal cord" },
    { src: "/images/products/heat-aerosol-3.jpg", label: "05. Clean Agent Spray", desc: "Colorless, odorless, harmless, leaves zero conductive residue" },
    { src: "/images/products/heat-aerosol-4.jpg", label: "06. Easy Installation", desc: "DIN Rail snap mounting & 3M VHB adhesive mounting" },
    { src: "/images/products/heat-aerosol-8.jpg", label: "07. Bulk Deployment Pack", desc: "Multi-unit array for large electrical switchgear panels" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#121413] text-on-surface py-12">
      <div className="page-container">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-outline-variant/20 print:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-label-caps text-slate-gray hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> BACK TO PRODUCTS
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="btn-secondary gap-2 text-xs py-2.5 px-4 flex-1 sm:flex-none"
            >
              <Printer size={15} /> PRINT CATALOG
            </button>

            <Link href="/quotation" className="flex-1 sm:flex-none">
              <MagneticButton className="btn-primary gap-2 text-xs py-2.5 px-5 w-full">
                <FileText size={15} /> GET QUOTATION
              </MagneticButton>
            </Link>
          </div>
        </div>

        {/* Catalog Banner */}
        <div className="py-10 border-b border-outline-variant/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-white shadow-lg">
              <Shield size={22} />
            </div>
            <div>
              <span className="font-label-caps text-xs text-tertiary tracking-widest block uppercase">
                DIGITALWORLD OFFICIAL PRODUCT CATALOG / 2026
              </span>
              <h1 className="font-headline-lg text-white font-bold tracking-tight">
                Heat Aerosol Fire Suppression Device
              </h1>
            </div>
          </div>
          <p className="text-body-lg text-on-surface-variant max-w-3xl mt-2 leading-relaxed">
            Technical product specifications, mounting dimensions, dual-nozzle airflow diagrams, and volume discount schedule for electrical panels, control cabinets, and battery enclosures.
          </p>
        </div>

        {/* Main Catalog Gallery Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-12">
          {/* Main Large Display View */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative w-full aspect-[4/3] rounded-2xl border border-outline-variant/30 bg-surface-charcoal overflow-hidden flex items-center justify-center group shadow-2xl">
              <Image
                src={selectedImg}
                alt="Product Catalog Diagram"
                fill
                priority
                className="object-contain p-4"
              />
              <div className="absolute top-4 left-4 rounded-lg bg-surface-charcoal/80 border border-outline-variant/30 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono text-tertiary">
                {catalogImages.find((i) => i.src === selectedImg)?.label || "CATALOG DIAGRAM"}
              </div>
            </div>

            <p className="text-body-technical text-sm text-slate-gray bg-surface-container/60 p-4 rounded-xl border border-outline-variant/15">
              💡 <strong className="text-white">Catalog Note:</strong> {catalogImages.find((i) => i.src === selectedImg)?.desc}
            </p>
          </div>

          {/* Thumbnail Selection List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="font-headline-sm text-sm text-slate-gray uppercase tracking-wider font-label-caps mb-1">
              Catalog Diagrams ({catalogImages.length} Slides)
            </h3>

            <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {catalogImages.map((item, i) => {
                const isSelected = selectedImg === item.src;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(item.src)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? "border-tertiary bg-surface-container-high shadow-lg"
                        : "border-outline-variant/20 bg-surface-container/40 hover:bg-surface-container-high/40"
                    }`}
                  >
                    <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-outline-variant/30 bg-black">
                      <Image src={item.src} alt={item.label} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-bold truncate ${isSelected ? "text-tertiary" : "text-white"}`}>
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-gray truncate">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full Technical Datasheet Specification Table */}
        <div className="bento-card p-8 border-outline-variant/30 my-12">
          <div className="flex items-center justify-between pb-6 border-b border-outline-variant/20 mb-6">
            <div className="flex items-center gap-3">
              <FileCheck size={24} className="text-primary-container" />
              <h2 className="font-headline-md text-2xl text-white font-bold">
                Verified Product Specifications (QRR0.01G/S & QRRO-10)
              </h2>
            </div>
            <span className="text-xs font-label-caps text-status-success border border-status-success/30 bg-status-success/10 px-3 py-1 rounded-full">
              EN 15276-1:2019 CERTIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <span className="text-slate-gray text-xs block mb-1">Model Numbers</span>
              <span className="text-white font-bold block">QRR0.01G/S (Adhesive) / QRRO-10 (DIN)</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <span className="text-slate-gray text-xs block mb-1">Operating Temp Range</span>
              <span className="text-white font-bold block">-50°C to +90°C</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <span className="text-slate-gray text-xs block mb-1">Service Lifespan</span>
              <span className="text-status-success font-bold block">10 Years (Zero refilling required)</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <span className="text-slate-gray text-xs block mb-1">Extinguishing Density</span>
              <span className="text-white font-bold block">100 g/m³</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <span className="text-slate-gray text-xs block mb-1">Protection Space</span>
              <span className="text-white font-bold block">0.1 m³ / Volume ≥60 g/m³</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <span className="text-slate-gray text-xs block mb-1">Automatic Trigger</span>
              <span className="text-tertiary font-bold block">Open Flame or 170°C Thermal Cord</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <span className="text-slate-gray text-xs block mb-1">Discharge Type</span>
              <span className="text-white font-bold block">Colorless, Odorless, Clean, Harmless</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <span className="text-slate-gray text-xs block mb-1">Mounting Support</span>
              <span className="text-white font-bold block">Standard 35mm DIN Rail / 3M VHB Tape</span>
            </div>
          </div>
        </div>

        {/* Volume Pricing Schedule */}
        <div className="bento-card p-8 border-tertiary/30 bg-surface-charcoal/90 mb-12">
          <h2 className="font-headline-md text-2xl text-white font-bold mb-6">
            Official B2B Volume Pricing Schedule
          </h2>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quantity Tier</th>
                  <th>Price Per Unit (Excl. GST)</th>
                  <th>GST Rate</th>
                  <th>Shipping Rule</th>
                  <th>Order Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-white">1 – 9 PCS</td>
                  <td>{formatINR(300)}</td>
                  <td>18% GST</td>
                  <td>Standard Courier (Weight-based)</td>
                  <td><Link href="/cart" className="text-tertiary font-bold hover:underline">Order Online</Link></td>
                </tr>
                <tr>
                  <td className="font-bold text-white">10 – 49 PCS</td>
                  <td>{formatINR(275)} <span className="badge-wholesale ml-2">Tier 1</span></td>
                  <td>18% GST</td>
                  <td>Standard Courier (Weight-based)</td>
                  <td><Link href="/cart" className="text-tertiary font-bold hover:underline">Order Online</Link></td>
                </tr>
                <tr>
                  <td className="font-bold text-white">50 – 99 PCS</td>
                  <td>{formatINR(225)} <span className="badge-wholesale ml-2">Tier 2</span></td>
                  <td>18% GST</td>
                  <td>Standard Courier (Weight-based)</td>
                  <td><Link href="/cart" className="text-tertiary font-bold hover:underline">Order Online</Link></td>
                </tr>
                <tr>
                  <td className="font-bold text-white">100 – 499 PCS</td>
                  <td>{formatINR(200)} <span className="badge-wholesale ml-2">Tier 3</span></td>
                  <td>18% GST</td>
                  <td className="text-tertiary font-bold">Bulk Order (Quoted by Team)</td>
                  <td><Link href="/quotation?qty=100" className="text-tertiary font-bold hover:underline">Request Quote</Link></td>
                </tr>
                <tr>
                  <td className="font-bold text-white">500+ PCS</td>
                  <td>{formatINR(165)} <span className="badge-wholesale ml-2">Tier 4</span></td>
                  <td>18% GST</td>
                  <td className="text-tertiary font-bold">Bulk Order (Quoted by Team)</td>
                  <td><Link href="/quotation?qty=500" className="text-tertiary font-bold hover:underline">Request Quote</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-2xl bg-gradient-to-r from-surface-container-high via-surface-charcoal to-surface-container-high border border-outline-variant/30 gap-6">
          <div>
            <h3 className="font-headline-sm text-xl text-white font-bold">Need a Custom Project Quotation?</h3>
            <p className="text-body-technical text-slate-gray mt-1">
              Generate an official PDF quotation instantly or talk to our technical engineering sales team.
            </p>
          </div>
          <Link href="/quotation">
            <button className="btn-primary gap-2 px-8 py-3.5 text-xs tracking-wider whitespace-nowrap">
              <FileText size={16} /> GENERATE INSTANT QUOTATION
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
