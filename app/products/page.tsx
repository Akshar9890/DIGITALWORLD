import { db } from "@/lib/db";
import { auth } from "@/auth";
import { resolvePrice } from "@/lib/pricing";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import { Shield, Zap, ArrowRight, FileText, Star, Package } from "lucide-react";
import type { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await auth();
  const role: UserRole = session?.user?.role || "retail";

  const products = await db.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  // Resolve base price for each product
  const productsWithPrice = await Promise.all(
    products.map(async (p) => {
      const priceResult = await resolvePrice(p.id, 1, { role, assignedTierId: null });
      return { ...p, price: priceResult.unitPrice };
    })
  );

  return (
    <div className="min-h-screen bg-[#121413] text-on-surface py-12">
      <div className="page-container">
        {/* Page Header */}
        <div className="pb-10 border-b border-outline-variant/20">
          <span className="font-label-caps text-xs text-tertiary tracking-widest block uppercase mb-2">
            DIGITALWORLD — FIRE SAFETY SOLUTIONS
          </span>
          <h1 className="font-headline-lg text-white font-bold tracking-tight text-3xl lg:text-4xl mb-3">
            Our Products
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Professional-grade automatic fire suppression devices for electrical panels, control cabinets, and battery enclosures.
          </p>
        </div>

        {/* Product Grid */}
        {productsWithPrice.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Package size={48} className="text-slate-gray" />
            <p className="text-on-surface-variant text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
            {productsWithPrice.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block"
              >
                <div className="bento-card border-outline-variant/30 overflow-hidden transition-all duration-300 hover:border-tertiary/50 hover:shadow-2xl hover:shadow-tertiary/10 hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative aspect-[4/3] bg-surface-charcoal overflow-hidden">
                    <Image
                      src={product.images[0] || "/images/products/heat-aerosol-1.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Category Badge */}
                    {product.category && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-surface-charcoal/90 border border-outline-variant/30 backdrop-blur-sm text-[10px] font-label-caps text-tertiary tracking-wider">
                        {product.category.name}
                      </div>
                    )}
                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-status-success/15 border border-status-success/30 text-[10px] font-label-caps text-status-success tracking-wider">
                      IN STOCK
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h2 className="font-headline-sm text-white font-bold text-lg leading-tight mb-2 group-hover:text-tertiary transition-colors">
                      {product.name}
                    </h2>
                    <p className="text-body-technical text-sm text-slate-gray line-clamp-2 mb-4">
                      {product.shortDesc}
                    </p>

                    {/* Key Features */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-label-caps px-2 py-1 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface-variant">
                        <Zap size={10} className="text-tertiary" /> Auto-Trigger 170°C
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-label-caps px-2 py-1 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface-variant">
                        <Shield size={10} className="text-primary" /> 10-Year Life
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-label-caps px-2 py-1 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface-variant">
                        <Star size={10} className="text-yellow-400" /> DIN Rail / VHB
                      </span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                      <div>
                        <span className="text-[11px] text-slate-gray block">Starting from</span>
                        <span className="text-xl font-bold text-white font-mono">
                          {formatINR(product.price)}
                          <span className="text-xs text-slate-gray font-normal ml-1">/ pc</span>
                        </span>
                        <span className="text-[10px] text-slate-gray">+ 18% GST</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-tertiary group-hover:gap-3 transition-all duration-300">
                        VIEW DETAILS <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-2xl bg-gradient-to-r from-surface-container-high via-surface-charcoal to-surface-container-high border border-outline-variant/30 gap-6 mt-4">
          <div>
            <h3 className="font-headline-sm text-xl text-white font-bold">Need a Bulk or Custom Order?</h3>
            <p className="text-body-technical text-slate-gray mt-1">
              Get an instant PDF quotation or apply for wholesale B2B pricing.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/quotation" className="flex-1 sm:flex-none">
              <button className="btn-secondary gap-2 px-6 py-3 text-xs tracking-wider w-full">
                <FileText size={15} /> GET QUOTATION
              </button>
            </Link>
            <Link href="/wholesale" className="flex-1 sm:flex-none">
              <button className="btn-primary gap-2 px-6 py-3 text-xs tracking-wider w-full">
                B2B ACCESS <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
