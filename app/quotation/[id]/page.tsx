import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { QuotationView, QuotationViewData } from "@/components/quotation/QuotationView";

export const dynamic = "force-dynamic";

/**
 * /quotation/[id] — Public view of a saved Instant Quotation.
 * Reached from the "View / Download" link shared on WhatsApp / Email.
 */
export default async function QuotationViewPage({
  params,
}: {
  params: { id: string };
}) {
  const quotation = await db.quotation.findUnique({
    where: { id: params.id },
  });

  if (!quotation) notFound();

  const data: QuotationViewData = {
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    createdAt: quotation.createdAt.toISOString(),
    validUntil: quotation.validUntil.toISOString(),
    customerName: quotation.customerName,
    customerPhone: quotation.customerPhone,
    customerEmail: quotation.customerEmail,
    companyName: quotation.companyName,
    gstin: quotation.gstin,
    deliveryAddress: quotation.deliveryAddress,
    pincode: quotation.pincode,
    state: quotation.state,
    productId: quotation.productId,
    productSlug: quotation.productSlug,
    productName: quotation.productName,
    quantity: quotation.quantity,
    unitPrice: Number(quotation.unitPrice),
    standardPrice: Number(quotation.standardPrice),
    appliedTierName: quotation.appliedTierName,
    subtotal: Number(quotation.subtotal),
    gstRate: Number(quotation.gstRate),
    gstAmount: Number(quotation.gstAmount),
    courierCharge: Number(quotation.courierCharge),
    grandTotal: Number(quotation.grandTotal),
  };

  return (
    <div className="page-container py-10 md:py-16 max-w-4xl">
      <h1 className="sr-only">
        Instant Quotation {quotation.quotationNumber} — DIGITALWORLD
      </h1>
      <QuotationView quotation={data} />
    </div>
  );
}
