import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateShippingSchema = z.object({
  calculationMode: z.enum(["weight", "quantity"]).default("quantity"),
  // Weight-based slabs (e.g. 1kg = ₹100, 2kg = ₹200)
  chargeUpTo1Kg: z.number().min(0).default(100),
  chargeUpTo2Kg: z.number().min(0).default(200),
  chargeUpTo3Kg: z.number().min(0).default(300),
  chargeUpTo5Kg: z.number().min(0).default(500),
  chargeAbove5KgPerKg: z.number().min(0).default(100),
  ratePerKg: z.number().min(0).default(100),
  freeShippingAboveAmount: z.number().min(0).default(15000),

  // Quantity-based slabs
  charge1to10: z.number().min(0).default(100),
  charge11to20: z.number().min(0).default(150),
  charge21to30: z.number().min(0).default(250),
  freeThresholdQty: z.number().min(1).default(100),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rule = await db.shippingRule.findUnique({
      where: { id: "default-shipping" },
    });

    const defaultConfig = {
      calculationMode: "quantity",
      chargeUpTo1Kg: 100,
      chargeUpTo2Kg: 200,
      chargeUpTo3Kg: 300,
      chargeUpTo5Kg: 500,
      chargeAbove5KgPerKg: 100,
      ratePerKg: 100,
      freeShippingAboveAmount: 15000,
      charge1to10: 100,
      charge11to20: 150,
      charge21to30: 250,
      freeThresholdQty: 100,
    };

    if (!rule) {
      rule = await db.shippingRule.create({
        data: {
          id: "default-shipping",
          ratePerKg: 100,
          minCharge: 100,
          freeThresholdValue: 15000,
          gstRate: 0.18,
          notes: JSON.stringify(defaultConfig),
        },
      });
    }

    let parsedConfig = { ...defaultConfig };
    if (rule.notes) {
      try {
        const parsed = JSON.parse(rule.notes);
        parsedConfig = { ...defaultConfig, ...parsed };
      } catch {
        // fallback
      }
    }

    return NextResponse.json({
      id: rule.id,
      ...parsedConfig,
    });
  } catch (error) {
    console.error("Admin shipping GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateShippingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid shipping data", details: result.error.errors }, { status: 400 });
    }

    const data = result.data;
    const notesJson = JSON.stringify(data);

    const updated = await db.shippingRule.upsert({
      where: { id: "default-shipping" },
      update: {
        ratePerKg: data.ratePerKg,
        minCharge: data.chargeUpTo1Kg,
        freeThresholdValue: data.freeShippingAboveAmount,
        notes: notesJson,
      },
      create: {
        id: "default-shipping",
        ratePerKg: data.ratePerKg,
        minCharge: data.chargeUpTo1Kg,
        freeThresholdValue: data.freeShippingAboveAmount,
        gstRate: 0.18,
        notes: notesJson,
      },
    });

    return NextResponse.json({
      id: updated.id,
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Admin shipping PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
