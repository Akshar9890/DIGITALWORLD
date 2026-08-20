export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { ShipmentStatus } from "@prisma/client";

const manualShipmentSchema = z.object({
  orderId: z.string(),
  courierName: z.string().min(1, "Courier name is required"),
  awbNumber: z.string().min(1, "AWB / Tracking number is required"),
  trackingUrl: z.string().optional(),
  status: z.nativeEnum(ShipmentStatus).default(ShipmentStatus.IN_TRANSIT),
  estimatedDeliveryDate: z.string().optional(),
  dispatchDate: z.string().optional(),
  weightGrams: z.number().default(500),
  lengthCm: z.number().default(15),
  widthCm: z.number().default(10),
  heightCm: z.number().default(10),
  shippingCost: z.number().default(0),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = manualShipmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      orderId,
      courierName,
      awbNumber,
      trackingUrl,
      status,
      estimatedDeliveryDate,
      dispatchDate,
      weightGrams,
      lengthCm,
      widthCm,
      heightCm,
      shippingCost,
      notes,
    } = parsed.data;

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if AWB number is already in use by another shipment
    const existingAwb = await db.shipment.findUnique({
      where: { awbNumber },
    });

    if (existingAwb && existingAwb.orderId !== order.id) {
      return NextResponse.json(
        { error: "This AWB / Tracking number is already assigned to another shipment." },
        { status: 400 }
      );
    }

    const estDate = estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    const pDate = dispatchDate ? new Date(dispatchDate) : new Date();

    // Check if shipment already exists for this order
    const existingOrderShipment = await db.shipment.findFirst({
      where: { orderId: order.id },
    });

    // Create or update shipment
    let shipment;
    if (existingOrderShipment) {
      shipment = await db.shipment.update({
        where: { id: existingOrderShipment.id },
        data: {
          provider: "manual",
          courierName,
          awbNumber,
          trackingUrl: trackingUrl || null,
          status,
          estimatedDeliveryDate: estDate,
          pickupDate: pDate,
          weightGrams,
          lengthCm,
          widthCm,
          heightCm,
          shippingCost,
          notes,
        },
      });
    } else if (existingAwb) {
      shipment = await db.shipment.update({
        where: { id: existingAwb.id },
        data: {
          orderId: order.id,
          provider: "manual",
          courierName,
          trackingUrl: trackingUrl || null,
          status,
          estimatedDeliveryDate: estDate,
          pickupDate: pDate,
          weightGrams,
          lengthCm,
          widthCm,
          heightCm,
          shippingCost,
          notes,
        },
      });
    } else {
      shipment = await db.shipment.create({
        data: {
          orderId: order.id,
          provider: "manual",
          courierName,
          awbNumber,
          trackingUrl: trackingUrl || null,
          status,
          estimatedDeliveryDate: estDate,
          pickupDate: pDate,
          weightGrams,
          lengthCm,
          widthCm,
          heightCm,
          shippingCost,
          notes,
        },
      });
    }

    // Update order status & tracking info
    await db.order.update({
      where: { id: order.id },
      data: {
        status: "shipped",
        trackingNumber: awbNumber,
        trackingUrl: trackingUrl || null,
      },
    });

    // Log manual tracking event
    await db.shipmentTrackingEvent.create({
      data: {
        shipmentId: shipment.id,
        provider: "manual",
        courier: courierName,
        awbNumber,
        externalStatus: "DISPATCHED",
        internalStatus: status,
        location: "Warehouse Dispatch",
        description: notes || `Dispatched via ${courierName}. Tracking: ${awbNumber}`,
        eventTimestamp: new Date(),
      },
    });

    // Revalidate paths for real-time customer and admin sync
    try {
      revalidatePath("/admin/orders");
      revalidatePath("/account/orders");
      revalidatePath(`/account/orders/${order.id}`);
      revalidatePath(`/account/orders/${order.orderNumber}`);
      revalidatePath("/track-order");
    } catch (e) {
      console.warn("revalidatePath error:", e);
    }

    return NextResponse.json({ success: true, shipment });
  } catch (error: any) {
    console.error("POST /api/admin/shipments/manual error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
