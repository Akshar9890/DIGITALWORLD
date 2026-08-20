import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
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

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { name: true, slug: true } } },
        },
        user: { select: { id: true, name: true, email: true } },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Admin order GET error:", error);
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
    const result = updateOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", issues: result.error.issues }, { status: 400 });
    }

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = { status: result.data.status };
    if (result.data.trackingNumber !== undefined) {
      updateData.trackingNumber = result.data.trackingNumber;
    }
    if (result.data.trackingUrl !== undefined) {
      updateData.trackingUrl = result.data.trackingUrl;
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    const targetStatus = result.data.status;
    const shipment = await db.shipment.findFirst({
      where: { orderId: order.id },
    });

    let updatedShipment = shipment;

    if (shipment) {
      if (targetStatus === "delivered" && shipment.status !== "DELIVERED") {
        updatedShipment = await db.shipment.update({
          where: { id: shipment.id },
          data: { status: "DELIVERED" },
        });

        await db.shipmentTrackingEvent.create({
          data: {
            shipmentId: shipment.id,
            provider: shipment.provider,
            courier: shipment.courierName,
            awbNumber: shipment.awbNumber,
            externalStatus: "DELIVERED",
            internalStatus: "DELIVERED",
            location: "Destination Facility",
            description: "Package successfully delivered to recipient.",
            eventTimestamp: new Date(),
          },
        });
      } else if (targetStatus === "shipped" && shipment.status === "SHIPMENT_CREATED") {
        updatedShipment = await db.shipment.update({
          where: { id: shipment.id },
          data: { status: "IN_TRANSIT" },
        });

        await db.shipmentTrackingEvent.create({
          data: {
            shipmentId: shipment.id,
            provider: shipment.provider,
            courier: shipment.courierName,
            awbNumber: shipment.awbNumber,
            externalStatus: "IN_TRANSIT",
            internalStatus: "IN_TRANSIT",
            location: "Logistics Hub",
            description: "Shipment in transit to destination station.",
            eventTimestamp: new Date(),
          },
        });
      } else if (targetStatus === "cancelled" && shipment.status !== "CANCELLED") {
        updatedShipment = await db.shipment.update({
          where: { id: shipment.id },
          data: { status: "CANCELLED" },
        });
      }
    }

    try {
      revalidatePath("/admin/orders");
      revalidatePath("/account/orders");
      revalidatePath(`/account/orders/${order.id}`);
      revalidatePath(`/account/orders/${order.orderNumber}`);
      revalidatePath("/track-order");
    } catch (e) {
      console.warn("revalidatePath error:", e);
    }

    return NextResponse.json({ ...order, shipment: updatedShipment });
  } catch (error) {
    console.error("Admin order PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
