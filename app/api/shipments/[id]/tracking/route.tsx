export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { shippingRegistry } from "@/lib/shipping";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // Find shipment by shipment ID or order ID or AWB number
    const shipment = await db.shipment.findFirst({
      where: {
        OR: [{ id }, { orderId: id }, { awbNumber: id }],
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            userId: true,
            shippingAddress: true,
          },
        },
        trackingEvents: { orderBy: { eventTimestamp: "desc" } },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    // Security check: non-admin users can only view their own shipments
    if (session?.user?.role !== "admin" && session?.user?.id !== shipment.order.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let liveTracking: any = null;

    // Fetch live tracking from provider adapter only for API-integrated couriers (shiprocket, delhivery)
    if (shipment.provider !== "manual") {
      try {
        const provider = shippingRegistry.getProvider(shipment.provider);
        liveTracking = await provider.getTracking(shipment.awbNumber);

        if (liveTracking?.success && liveTracking.events?.length > 0) {
          // Update shipment status if changed
          if (liveTracking.currentStatus && liveTracking.currentStatus !== shipment.status) {
            await db.shipment.update({
              where: { id: shipment.id },
              data: {
                status: liveTracking.currentStatus,
                estimatedDeliveryDate: liveTracking.estimatedDeliveryDate || shipment.estimatedDeliveryDate,
              },
            });

            // Synchronize Order status
            if (liveTracking.currentStatus === "DELIVERED") {
              await db.order.update({
                where: { id: shipment.orderId },
                data: { status: "delivered" },
              });
            } else if (
              liveTracking.currentStatus === "OUT_FOR_DELIVERY" ||
              liveTracking.currentStatus === "IN_TRANSIT"
            ) {
              await db.order.update({
                where: { id: shipment.orderId },
                data: { status: "shipped" },
              });
            }
          }

          // Log new tracking events in DB
          for (const ev of liveTracking.events) {
            const existingEvent = await db.shipmentTrackingEvent.findFirst({
              where: {
                shipmentId: shipment.id,
                internalStatus: ev.internalStatus,
                description: ev.description,
              },
            });

            if (!existingEvent) {
              await db.shipmentTrackingEvent.create({
                data: {
                  shipmentId: shipment.id,
                  provider: shipment.provider,
                  courier: shipment.courierName,
                  awbNumber: shipment.awbNumber,
                  externalStatus: ev.externalStatus,
                  internalStatus: ev.internalStatus,
                  location: ev.location,
                  description: ev.description,
                  eventTimestamp: ev.timestamp,
                  rawPayload: ev.rawPayload || null,
                },
              });
            }
          }
        }
      } catch (providerErr) {
        console.warn("External provider tracking fetch failed:", providerErr);
      }
    }

    // Re-fetch latest shipment with tracking events
    const updatedShipment = await db.shipment.findUnique({
      where: { id: shipment.id },
      include: {
        trackingEvents: { orderBy: { eventTimestamp: "desc" } },
        order: { select: { orderNumber: true } },
      },
    });

    return NextResponse.json({ shipment: updatedShipment, liveTracking });
  } catch (error) {
    console.error("GET /api/shipments/[id]/tracking error:", error);
    return NextResponse.json(
      { error: "Tracking information is temporarily unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
