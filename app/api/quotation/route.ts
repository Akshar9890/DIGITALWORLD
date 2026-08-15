export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getPriceForQuantity, getStandardPrice } from "@/lib/pricing";
import { getCourierCharge, getGSTAmount, GST_RATE } from "@/lib/shipping";
import { generateQuotationNumber } from "@/lib/utils";

const quotationSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  customerName: z.string().min(2, "Please enter your name"),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number required"),
  customerEmail: z.string().email("Valid email required"),
  companyName: z.string().optional(),
  gstin: z.string().regex(/^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})?$/, "Invalid GSTIN format").optional(),
  deliveryAddress: z.string().optional(),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit pincode required"),
  state: z.string().optional(),
  notes: z.string().max(500).optional(),
});

/**
 * POST /api/quotation — Generate an instant B2C quotation.
 *
 * Pricing is NEVER taken from the client. The server loads the product's
 * tier table and resolves the unit price with the SAME function used by
 * cart & checkout (getPriceForQuantity), so a quotation always matches
 * what the customer will pay at checkout.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = quotationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid details", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { productId, quantity, customerName, customerPhone, customerEmail, companyName, gstin, deliveryAddress, pincode, state, notes } = result.data;

    // 1. Product must exist and be active
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, slug: true, isActive: true, stockStatus: true, weightGrams: true },
    });
    if (!product || !product.isActive || product.stockStatus === "out_of_stock") {
      return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
    }

    // 2. Resolve pricing server-side (single source of truth)
    const productPrices = await db.productPrice.findMany({
      where: { productId },
      include: { tier: true },
      orderBy: { tier: { minQty: "asc" } },
    });
    if (productPrices.length === 0) {
      return NextResponse.json({ error: "Product has no pricing configured" }, { status: 400 });
    }

    const tierTable = productPrices.map((p) => ({
      tierId: p.tierId,
      tierName: p.tier.name,
      minQty: p.tier.minQty,
      maxQty: p.tier.maxQty,
      pricePerUnit: Number(p.pricePerUnit),
      isRetail: p.tier.isRetail,
      isActive: false,
    }));

    const tier = getPriceForQuantity(tierTable, quantity);
    if (!tier) {
      return NextResponse.json({ error: "Could not resolve pricing" }, { status: 400 });
    }

    const unitPrice = tier.pricePerUnit;
    const standardPrice = getStandardPrice(tierTable) ?? unitPrice;
    const subtotal = Math.round(unitPrice * quantity * 100) / 100;
    const gstAmount = getGSTAmount(subtotal);
    const courier = getCourierCharge(product.weightGrams * quantity, quantity);
    const grandTotal = Math.round((subtotal + gstAmount + courier.amount) * 100) / 100;

    // 3. Next quotation number for this year
    const prefix = `DW-QT-${new Date().getFullYear()}-`;
    const existing = await db.quotation.findMany({
      where: { quotationNumber: { startsWith: prefix } },
      select: { quotationNumber: true },
    });
    let sequence = 1;
    if (existing.length > 0) {
      const maxSeq = existing.reduce((max, q) => {
        const num = parseInt(q.quotationNumber.replace(prefix, ""), 10);
        return Number.isFinite(num) && num > max ? num : max;
      }, 0);
      sequence = maxSeq + 1;
    }
    const quotationNumber = generateQuotationNumber(sequence);

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    // 4. Save (optional auth — guests can quote too)
    const session = await auth();
    const quotation = await db.quotation.create({
      data: {
        quotationNumber,
        userId: session?.user?.id ?? null,
        productId,
        productName: product.name,
        productSlug: product.slug,
        quantity,
        unitPrice,
        standardPrice,
        appliedTierName: tier.tierName,
        subtotal,
        gstRate: GST_RATE,
        gstAmount,
        courierCharge: courier.amount,
        grandTotal,
        customerName,
        customerPhone,
        customerEmail,
        companyName: companyName || null,
        gstin: gstin || null,
        deliveryAddress: deliveryAddress || null,
        pincode,
        state: state || null,
        notes: notes || null,
        status: "open",
        validUntil,
      },
    });

    return NextResponse.json({ quotation }, { status: 201 });
  } catch (error) {
    console.error("Quotation POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
