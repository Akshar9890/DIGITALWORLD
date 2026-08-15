import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTierTable } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/**
 * GET /api/product-tiers?productId=xxx
 * Returns the full quantity-tier pricing table for a product.
 * If productId is missing, defaults to the first active product.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let productId = searchParams.get("productId");

    if (!productId) {
      const firstProduct = await db.product.findFirst({
        where: { isActive: true },
        select: { id: true },
      });
      if (firstProduct) {
        productId = firstProduct.id;
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "No products available" }, { status: 404 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, slug: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product unavailable" }, { status: 404 });
    }

    const tiers = await getTierTable(productId, { role: "retail" }, 1);

    return NextResponse.json({ productId, productName: product.name, productSlug: product.slug, tiers });
  } catch (error) {
    console.error("product-tiers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
