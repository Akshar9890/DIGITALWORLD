import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotationPDF } from "@/components/quotation/QuotationPDF";

export const runtime = "nodejs";

/**
 * GET /api/quotation/[id]/pdf?download=1
 * Renders the stored quotation as a professional PDF.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await db.quotation.findUnique({
      where: { id: params.id },
    });
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const buffer = await renderToBuffer(
      <QuotationPDF
        data={{
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          createdAt: quotation.createdAt,
          validUntil: quotation.validUntil,
          customerName: quotation.customerName,
          customerPhone: quotation.customerPhone,
          customerEmail: quotation.customerEmail,
          companyName: quotation.companyName,
          gstin: quotation.gstin,
          deliveryAddress: quotation.deliveryAddress,
          pincode: quotation.pincode,
          state: quotation.state,
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
        }}
      />
    );

    const url = new URL(_req.url);
    const download = url.searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${quotation.quotationNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Quotation PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
