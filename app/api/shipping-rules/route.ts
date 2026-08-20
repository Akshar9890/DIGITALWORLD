import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rule = await db.shippingRule.findUnique({
      where: { id: "default-shipping" },
    });

    const defaultConfig = {
      calculationMode: "weight",
      chargeUpTo1Kg: 100,
      chargeUpTo2Kg: 200,
      chargeUpTo3Kg: 300,
      chargeUpTo5Kg: 500,
      chargeAbove5KgPerKg: 100,
      ratePerKg: 100,
      freeShippingAboveAmount: 15000,
      charge1to10: 100,
      charge11to20: 200,
      charge21to30: 300,
      freeThresholdQty: 31,
    };

    if (rule?.notes) {
      try {
        const parsed = JSON.parse(rule.notes);
        return NextResponse.json({
          ...defaultConfig,
          ...parsed,
        });
      } catch {
        // fallback
      }
    }

    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error("Public shipping-rules GET error:", error);
    return NextResponse.json({
      calculationMode: "weight",
      chargeUpTo1Kg: 100,
      chargeUpTo2Kg: 200,
      chargeUpTo3Kg: 300,
      chargeUpTo5Kg: 500,
      chargeAbove5KgPerKg: 100,
      ratePerKg: 100,
      freeShippingAboveAmount: 15000,
      charge1to10: 100,
      charge11to20: 200,
      charge21to30: 300,
      freeThresholdQty: 31,
    });
  }
}
