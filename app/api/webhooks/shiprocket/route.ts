export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { normalizeShiprocketStatus } from "@/lib/shiprocket";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawSecret = req.headers.get("x-api-key") || req.headers.get("Authorization");
    const configuredSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;

    // Validate webhook secret if configured
    if (configuredSecret && rawSecret && rawSecret !== configuredSecret) {
      console.warn("[Shiprocket Webhook] Invalid security token received in x-api-key");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const awb = payload.awb || payload.awb_code || payload.tracking_data?.awb_code || payload.awb_number;
    const shipmentId = payload.shipment_id || payload.order_id || payload.shipmentId;
    const rawStatus =
      payload.current_status ||
      payload.status ||
      payload.tracking_data?.current_status ||
      payload.scans?.[0]?.activity;

    if (!awb && !shipmentId) {
      return NextResponse.json(
        { error: "Missing AWB or Shipment ID in webhook payload" },
        { status: 400 }
      );
    }

    // Locate the matching DIGITALWORLD Shipment by AWB or providerShipmentId
    const shipment = await db.shipment.findFirst({
      where: {
        OR: [
          ...(awb ? [{ awbNumber: String(awb) }] : []),
          ...(shipmentId ? [{ providerShipmentId: String(shipmentId) }] : []),
        ],
      },
      include: { order: true },
    });

    if (!shipment) {
      console.warn(`[Shiprocket Webhook] Shipment not found for AWB: ${awb}, Shipment ID: ${shipmentId}`);
      // Return 200 so Shiprocket does not endlessly retry unmapped demo webhooks
      return NextResponse.json({ received: true, matched: false });
    }

    const internalStatus = rawStatus ? normalizeShiprocketStatus(rawStatus) : shipment.status;
    const location = payload.current_location || payload.location || payload.scans?.[0]?.location || "Logistics Hub";
    const description = payload.scan_description || payload.activity || payload.scans?.[0]?.activity || `Shipment status updated to ${rawStatus || internalStatus}`;
    const timestamp = payload.timestamp || payload.date ? new Date(payload.timestamp || payload.date) : new Date();

    // Idempotency: Create deterministic hash to prevent duplicate event logs
    const eventHash = crypto
      .createHash("sha256")
      .update(`${shipment.id}-${internalStatus}-${location}-${timestamp.getTime()}`)
      .digest("hex");

    const duplicate = await db.shipmentTrackingEvent.findFirst({
      where: {
        shipmentId: shipment.id,
        internalStatus,
        location,
      },
    });

    if (!duplicate) {
      await db.shipmentTrackingEvent.create({
        data: {
          shipmentId: shipment.id,
          provider: "shiprocket",
          courier: shipment.courierName,
          awbNumber: shipment.awbNumber,
          externalStatus: String(rawStatus || internalStatus),
          internalStatus,
          location,
          description,
          eventTimestamp: timestamp,
          rawPayload: payload,
        },
      });
    }

    // Update shipment status and ETD
    const updateData: any = {
      status: internalStatus,
    };

    if (payload.etd || payload.expected_date) {
      updateData.estimatedDeliveryDate = new Date(payload.etd || payload.expected_date);
    }

    await db.shipment.update({
      where: { id: shipment.id },
      data: updateData,
    });

    // Synchronize parent order status
    if (internalStatus === "DELIVERED" && shipment.order.status !== "delivered") {
      await db.order.update({
        where: { id: shipment.orderId },
        data: { status: "delivered" },
      });
    } else if (
      (internalStatus === "IN_TRANSIT" ||
        internalStatus === "OUT_FOR_DELIVERY" ||
        internalStatus === "PICKED_UP") &&
      shipment.order.status === "processing"
    ) {
      await db.order.update({
        where: { id: shipment.orderId },
        data: { status: "shipped" },
      });
    }

    // Revalidate paths for real-time customer and admin synchronization
    try {
      revalidatePath("/admin/orders");
      revalidatePath("/admin/shipping");
      revalidatePath("/account/orders");
      revalidatePath(`/account/orders/${shipment.orderId}`);
      revalidatePath(`/account/orders/${shipment.order.orderNumber}`);
      revalidatePath("/track-order");
    } catch (e) {
      console.warn("Webhook revalidatePath error:", e);
    }

    return NextResponse.json({
      success: true,
      awb: shipment.awbNumber,
      status: internalStatus,
    });
  } catch (error) {
    console.error("[Shiprocket Webhook Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
