import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  categoryId: z.string().optional(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  weightGrams: z.number().int().positive("Weight must be greater than 0"),
  hsnCode: z.string().optional(),
  isActive: z.boolean().optional(),
  stockStatus: z.string().optional(),
  images: z.array(z.string()).optional(),
  tierPrices: z
    .array(
      z.object({
        tierId: z.string(),
        pricePerUnit: z.number().positive(),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db.product.findMany({
      orderBy: { name: "asc" },
      include: {
        prices: {
          include: { tier: true },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", issues: result.error.issues }, { status: 400 });
    }

    const data = result.data;

    // Check slug uniqueness
    const existing = await db.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }

    // Ensure categoryId exists
    let categoryId = data.categoryId;
    if (!categoryId) {
      const firstCat = await db.category.findFirst();
      if (firstCat) {
        categoryId = firstCat.id;
      } else {
        const newCat = await db.category.create({
          data: {
            name: "Fire Suppression",
            slug: "fire-suppression",
            description: "Fire safety and suppression devices",
          },
        });
        categoryId = newCat.id;
      }
    }

    // Get pricing tiers
    const tiers = await db.pricingTier.findMany({
      orderBy: { sortOrder: "asc" },
    });

    // Create product inside transaction with prices
    const newProduct = await db.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          categoryId: categoryId!,
          shortDesc: data.shortDesc || "",
          description: data.description || "",
          weightGrams: data.weightGrams,
          hsnCode: data.hsnCode || "8424",
          isActive: data.isActive ?? true,
          stockStatus: data.stockStatus || "in_stock",
          specs: {},
          images: data.images && data.images.length > 0 ? data.images : ["/images/products/heat-aerosol-1.jpg"],
        },
      });

      // Create prices for all tiers
      if (data.tierPrices && data.tierPrices.length > 0) {
        for (const tp of data.tierPrices) {
          await tx.productPrice.create({
            data: {
              productId: p.id,
              tierId: tp.tierId,
              pricePerUnit: tp.pricePerUnit,
            },
          });
        }
      } else {
        // Default tier prices if not provided
        for (const tier of tiers) {
          const defaultPrice = tier.minQty >= 500 ? 150 : tier.minQty >= 100 ? 200 : tier.minQty >= 50 ? 250 : tier.minQty >= 10 ? 275 : 300;
          await tx.productPrice.create({
            data: {
              productId: p.id,
              tierId: tier.id,
              pricePerUnit: defaultPrice,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: p.id },
        include: {
          prices: { include: { tier: true } },
        },
      });
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Admin products POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
