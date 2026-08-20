export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ShipmentStatus } from "@prisma/client";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.nativeEnum(ShipmentStatus),
  location: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(
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
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status value", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status, location, description } = parsed.data;

    const shipment = await db.shipment.findFirst({
      where: {
        OR: [{ id }, { awbNumber: id }, { orderId: id }],
      },
      include: { order: true },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    // Update shipment status
    const updatedShipment = await db.shipment.update({
      where: { id: shipment.id },
      data: { status },
    });

    // Synchronize parent order status
    let newOrderStatus = shipment.order.status;
    if (status === "DELIVERED") {
      newOrderStatus = "delivered";
    } else if (
      status === "OUT_FOR_DELIVERY" ||
      status === "IN_TRANSIT" ||
      status === "PICKED_UP" ||
      status === "SHIPMENT_CREATED" ||
      status === "PICKUP_SCHEDULED"
    ) {
      newOrderStatus = "shipped";
    } else if (status === "CANCELLED") {
      newOrderStatus = "cancelled";
    }

    const updatedOrder = await db.order.update({
      where: { id: shipment.orderId },
      data: {
        status: newOrderStatus,
        trackingNumber: shipment.awbNumber,
        trackingUrl: shipment.trackingUrl,
      },
    });

    // Log the new tracking event
    const statusLabels: Record<string, string> = {
      SHIPMENT_CREATED: `Shipment manifested with ${shipment.courierName}. AWB: ${shipment.awbNumber}`,
      PICKUP_SCHEDULED: "Pickup scheduled with courier partner.",
      PICKED_UP: `Shipment picked up by ${shipment.courierName} courier executive.`,
      IN_TRANSIT: "Package in transit to delivery station.",
      REACHED_DESTINATION: "Package arrived at local delivery hub.",
      OUT_FOR_DELIVERY: "Out for delivery with courier executive. Package will be delivered today.",
      DELIVERED: "Shipment successfully delivered to recipient.",
      DELAYED: "Shipment slightly delayed in transit due to operational factors.",
      NDR: "Delivery attempted, customer contact or address verification pending.",
      RTO_INITIATED: "RTO initiated: Package being returned to origin warehouse.",
      CANCELLED: "Shipment cancelled.",
    };

    const statusKey = String(status);
    const eventDesc = description || statusLabels[statusKey] || `Shipment status updated to ${statusKey.replace(/_/g, " ")}`;
    const eventLoc = location || (
      statusKey === "OUT_FOR_DELIVERY" || statusKey === "DELIVERED"
        ? "Destination Hub"
        : statusKey === "PICKED_UP" || statusKey === "SHIPMENT_CREATED"
        ? "Vadodara Central Hub"
        : "Regional Logistics Hub"
    );

    await db.shipmentTrackingEvent.create({
      data: {
        shipmentId: shipment.id,
        provider: shipment.provider,
        courier: shipment.courierName,
        awbNumber: shipment.awbNumber,
        externalStatus: statusKey,
        internalStatus: status,
        location: eventLoc,
        description: eventDesc,
        eventTimestamp: new Date(),
      },
    });

    // Revalidate paths for real-time customer and admin sync
    try {
      revalidatePath("/admin/orders");
      revalidatePath("/account/orders");
      revalidatePath(`/account/orders/${shipment.orderId}`);
      revalidatePath(`/account/orders/${shipment.order.orderNumber}`);
      revalidatePath("/track-order");
    } catch (e) {
      console.warn("revalidatePath error:", e);
    }

    return NextResponse.json({
      success: true,
      shipment: updatedShipment,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/shipments/[id]/status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
