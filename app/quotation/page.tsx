import { db } from "@/lib/db";
import { InstantQuotationClient } from "@/components/quotation/InstantQuotationClient";

export const dynamic = "force-dynamic";

/**
 * /quotation — Instant Quotation (B2C)
 *
 * Flow: select product → quantity → customer details → quotation generated.
 * Deep-links from product pages: /quotation?product=<slug>&qty=<n>
 */
export default async function QuotationPage({
  searchParams,
}: {
  searchParams: { product?: string; qty?: string };
}) {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDesc: true,
      weightGrams: true,
    },
    orderBy: { name: "asc" },
  });

  const initialSlug = searchParams.product;
  const initialQty = Math.max(
    1,
    Math.min(50000, parseInt(searchParams.qty || "1", 10) || 1)
  );

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-surface-charcoal border-b border-outline-variant/20 pt-16 pb-10">
        <div className="page-container max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-tertiary/30 bg-tertiary/10 px-3 py-1 w-max mb-5">
            <span className="font-label-caps text-[10px] tracking-widest text-tertiary uppercase">
              Instant Quotation
            </span>
          </div>
          <h1 className="font-headline-lg text-white mb-3">Get a Professional Quotation Instantly</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Select your quantity and enter your details — your quotation with GST, courier
            estimate, and quantity discount is generated in seconds. No company details, no GSTIN.
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section className="py-12 page-container max-w-6xl">
        <InstantQuotationClient
          products={products}
          initialSlug={initialSlug}
          initialQty={initialQty}
        />
      </section>
    </div>
  );
}
