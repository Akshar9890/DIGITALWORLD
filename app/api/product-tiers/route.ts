import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTierTable } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/**
 * GET /api/product-tiers?productId=xxx
 * Returns the full quantity-tier pricing table for a product.
 * Used by the Instant Quotation wizard for client-side live preview.
 * The server always re-resolves final prices via /api/quotation.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product unavailable" }, { status: 404 });
    }

    const tiers = await getTierTable(productId, { role: "retail" }, 1);

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error("product-tiers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
