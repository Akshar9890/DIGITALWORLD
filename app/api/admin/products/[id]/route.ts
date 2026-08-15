import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Schema that now includes tier prices
const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  categoryId: z.string().optional(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  weightGrams: z.number().int().positive().optional(),
  hsnCode: z.string().optional(),
  isActive: z.boolean().optional(),
  stockStatus: z.string().optional(),
  specs: z.any().optional(),
  images: z.array(z.string()).optional(),
  // ── NEW: tier price updates ─────────────────────────────────────────────
  tierPrices: z
    .array(
      z.object({
        tierId: z.string(),
        pricePerUnit: z.number().positive(),
      })
    )
    .optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        prices: { include: { tier: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Admin product GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { tierPrices, ...productData } = result.data;

    // ── Update product fields ────────────────────────────────────────────────
    const product = await db.product.update({
      where: { id },
      data: productData,
      include: {
        prices: { include: { tier: true } },
      },
    });

    // ── Update / upsert tier prices ──────────────────────────────────────────
    if (tierPrices && tierPrices.length > 0) {
      await Promise.all(
        tierPrices.map((tp) =>
          db.productPrice.upsert({
            where: { productId_tierId: { productId: id, tierId: tp.tierId } },
            update: { pricePerUnit: tp.pricePerUnit },
            create: {
              productId: id,
              tierId: tp.tierId,
              pricePerUnit: tp.pricePerUnit,
            },
          })
        )
      );
    }

    // Return product with refreshed prices
    const updated = await db.product.findUnique({
      where: { id },
      include: { prices: { include: { tier: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin product PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = await db.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
