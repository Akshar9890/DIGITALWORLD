import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rule = await db.shippingRule.findUnique({
      where: { id: "default-shipping" },
    });

    let config = {
      charge1to10: 100,
      charge11to20: 200,
      charge21to30: 300,
      freeThresholdQty: 31,
    };

    if (rule?.notes) {
      try {
        const parsed = JSON.parse(rule.notes);
        config = {
          charge1to10: Number(parsed.charge1to10 ?? 100),
          charge11to20: Number(parsed.charge11to20 ?? 200),
          charge21to30: Number(parsed.charge21to30 ?? 300),
          freeThresholdQty: Number(parsed.freeThresholdQty ?? 31),
        };
      } catch {
        // fallback
      }
    } else if (rule?.minCharge) {
      config.charge1to10 = Number(rule.minCharge);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Public shipping-rules GET error:", error);
    return NextResponse.json({
      charge1to10: 100,
      charge11to20: 200,
      charge21to30: 300,
      freeThresholdQty: 31,
    });
  }
}
