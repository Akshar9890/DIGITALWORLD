export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { shippingRegistry } from "@/lib/shipping";
import { z } from "zod";

const serviceabilitySchema = z.object({
  weightGrams: z.number().default(500),
  lengthCm: z.number().default(15),
  widthCm: z.number().default(10),
  heightCm: z.number().default(10),
  provider: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = serviceabilitySchema.safeParse(body);

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { shippingAddress: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { weightGrams, lengthCm, widthCm, heightCm, provider } =
      parsed.success ? parsed.data : serviceabilitySchema.parse({});

    const pickupPincode = process.env.NEXT_PUBLIC_SELLER_PINCODE || "390010";
    const deliveryPincode = order.shippingAddress?.pincode || "390010";

    const couriers = await shippingRegistry.getCombinedServiceability(
      {
        pickupPincode,
        deliveryPincode,
        weightGrams,
        lengthCm,
        widthCm,
        heightCm,
        orderValue: Number(order.grandTotal),
      },
      provider
    );

    return NextResponse.json({
      pickupPincode,
      deliveryPincode,
      weightGrams,
      couriers,
    });
  } catch (error) {
    console.error("POST /api/shipments/[id]/serviceability error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
