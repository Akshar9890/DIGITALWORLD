export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { getPriceForQuantity, getStandardPrice } from "@/lib/pricing";
import { getCourierCharge, getGSTAmount, GST_RATE } from "@/lib/shipping";
import { generateQuotationNumber, formatINR } from "@/lib/utils";

const quotationSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  customUnitPrice: z.number().min(1).optional(),
  includeGst: z.boolean().default(true),
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
 * POST /api/quotation — Generate an instant quotation with optional custom price & GST toggle.
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

    const {
      productId,
      quantity,
      customUnitPrice,
      includeGst,
      customerName,
      customerPhone,
      customerEmail,
      companyName,
      gstin,
      deliveryAddress,
      pincode,
      state,
      notes,
    } = result.data;

    // 1. Product must exist and be active
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, slug: true, isActive: true, stockStatus: true, weightGrams: true },
    });
    if (!product || !product.isActive || product.stockStatus === "out_of_stock") {
      return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
    }

    // 2. Resolve pricing server-side
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

    // Customer target price or default tier price
    const tierUnitPrice = tier.pricePerUnit;
    const isCustom = customUnitPrice !== undefined && customUnitPrice > 0;
    const unitPrice = isCustom ? Number(customUnitPrice) : tierUnitPrice;

    const standardPrice = getStandardPrice(tierTable) ?? tierUnitPrice;
    const subtotal = Math.round(unitPrice * quantity * 100) / 100;
    const effectiveGstRate = includeGst ? GST_RATE : 0;
    const gstAmount = includeGst ? getGSTAmount(subtotal) : 0;

    // Fetch active shipping rule if available
    const shippingRule = await db.shippingRule.findUnique({
      where: { id: "default-shipping" },
    });
    let shippingConfig;
    if (shippingRule?.notes) {
      try {
        shippingConfig = JSON.parse(shippingRule.notes);
      } catch {
        // fallback
      }
    }

    const courier = getCourierCharge(product.weightGrams * quantity, quantity, shippingConfig, subtotal);
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

    const appliedTierName = isCustom
      ? `Custom Target Price (Requested: ${formatINR(unitPrice)})`
      : tier.tierName;

    // Compile customer requirement notes
    const combinedNotes = [
      notes,
      isCustom ? `[Customer Target Rate: ${formatINR(unitPrice)}/PCS]` : null,
      !includeGst ? `[Tax Preference: Without GST (0%)]` : `[Tax Preference: With 18% GST]`,
    ]
      .filter(Boolean)
      .join(" | ");

    // 4. Save quotation
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
        appliedTierName,
        subtotal,
        gstRate: effectiveGstRate,
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
        notes: combinedNotes || null,
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
