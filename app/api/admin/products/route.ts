import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";


export const dynamic = "force-dynamic";
const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  categoryId: z.string().optional(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  weightGrams: z.number().int().positive(),
  hsnCode: z.string().optional(),
  isActive: z.boolean().optional(),
  stockStatus: z.string().optional(),
  specs: z.any().optional(),
  images: z.array(z.string()).optional(),
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

    const product = await db.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId ?? "",
        shortDesc: data.shortDesc,
        description: data.description,
        weightGrams: data.weightGrams,
        hsnCode: data.hsnCode ?? "",
        isActive: data.isActive ?? true,
        stockStatus: data.stockStatus ?? "in_stock",
        specs: data.specs ?? {},
        images: data.images ?? [],
      },
      include: {
        prices: { include: { tier: true } },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Admin products POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
