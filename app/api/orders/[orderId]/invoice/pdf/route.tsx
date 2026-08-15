import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";
import { getOrCreateInvoice } from "@/lib/invoice";

import { getEstimatedDeliveryRange } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * GET /api/orders/[orderId]/invoice/pdf?download=1
 * Renders the GST Tax Invoice as a PDF.
 */
export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const invoice = await getOrCreateInvoice(orderId);
    if (!invoice || !invoice.order) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const delivery = getEstimatedDeliveryRange(invoice.order.createdAt);

    const buffer = await renderToBuffer(
      <InvoicePDF
        data={{
          invoiceNumber: invoice.invoiceNumber,
          orderNumber: invoice.order.orderNumber,
          issuedAt: invoice.issuedAt,
          estimatedDelivery: delivery.displayText,

          sellerName: invoice.sellerName,
          sellerGstin: invoice.sellerGstin,
          sellerAddress: invoice.sellerAddress,
          sellerState: invoice.sellerState,

          buyerName: invoice.buyerName,
          buyerEmail: invoice.buyerEmail,
          buyerGstin: invoice.buyerGstin,
          shippingAddress: invoice.shippingAddress,
          buyerState: invoice.buyerState,

          paymentMethod: invoice.order.payment?.method,
          paymentId: invoice.order.payment?.razorpayPaymentId,

          items: invoice.order.items.map((item) => ({
            id: item.id,
            productName: item.product.name,
            hsnCode: item.product.hsnCode || "8424",
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            lineTotal: Number(item.lineTotal),
          })),

          isSameState: invoice.isSameState,
          taxableValue: Number(invoice.taxableValue),
          cgstRate: Number(invoice.cgstRate),
          cgstAmount: Number(invoice.cgstAmount),
          sgstRate: Number(invoice.sgstRate),
          sgstAmount: Number(invoice.sgstAmount),
          igstRate: Number(invoice.igstRate),
          igstAmount: Number(invoice.igstAmount),
          totalGST: Number(invoice.totalGST),
          shippingValue: Number(invoice.shippingValue),
          grandTotal: Number(invoice.grandTotal),
          amountInWords: invoice.amountInWords,
        }}
      />
    );

    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF render error:", error);
    return NextResponse.json({ error: "Failed to generate invoice PDF" }, { status: 500 });
  }
}
