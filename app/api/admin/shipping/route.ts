import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateShippingSchema = z.object({
  charge1to10: z.number().min(0),
  charge11to20: z.number().min(0),
  charge21to30: z.number().min(0),
  freeThresholdQty: z.number().min(1),
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

    if (!rule) {
      rule = await db.shippingRule.create({
        data: {
          id: "default-shipping",
          ratePerKg: 50,
          minCharge: 100,
          freeThresholdValue: 5000,
          gstRate: 0.18,
          notes: JSON.stringify({
            charge1to10: 100,
            charge11to20: 200,
            charge21to30: 300,
            freeThresholdQty: 31,
          }),
        },
      });
    }

    let parsedNotes = {
      charge1to10: 100,
      charge11to20: 200,
      charge21to30: 300,
      freeThresholdQty: 31,
    };

    if (rule.notes) {
      try {
        parsedNotes = JSON.parse(rule.notes);
      } catch {
        // fallback
      }
    }

    return NextResponse.json({
      id: rule.id,
      charge1to10: parsedNotes.charge1to10 ?? 100,
      charge11to20: parsedNotes.charge11to20 ?? 200,
      charge21to30: parsedNotes.charge21to30 ?? 300,
      freeThresholdQty: parsedNotes.freeThresholdQty ?? 31,
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
      return NextResponse.json({ error: "Invalid shipping data" }, { status: 400 });
    }

    const data = result.data;
    const notesJson = JSON.stringify({
      charge1to10: data.charge1to10,
      charge11to20: data.charge11to20,
      charge21to30: data.charge21to30,
      freeThresholdQty: data.freeThresholdQty,
    });

    const updated = await db.shippingRule.upsert({
      where: { id: "default-shipping" },
      update: {
        minCharge: data.charge1to10,
        notes: notesJson,
      },
      create: {
        id: "default-shipping",
        ratePerKg: 50,
        minCharge: data.charge1to10,
        gstRate: 0.18,
        notes: notesJson,
      },
    });

    return NextResponse.json({
      id: updated.id,
      charge1to10: data.charge1to10,
      charge11to20: data.charge11to20,
      charge21to30: data.charge21to30,
      freeThresholdQty: data.freeThresholdQty,
    });
  } catch (error) {
    console.error("Admin shipping PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
