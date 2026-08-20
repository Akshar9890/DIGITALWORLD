export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { shippingRegistry } from "@/lib/shipping";
import { z } from "zod";

const createShipmentSchema = z.object({
  orderId: z.string(),
  provider: z.string().default("shiprocket"),
  courierId: z.string().optional(),
  courierName: z.string().optional(),
  courierCode: z.string().optional(),
  weightGrams: z.number().default(500),
  lengthCm: z.number().default(15),
  widthCm: z.number().default(10),
  heightCm: z.number().default(10),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const where: any = {};
    if (orderId) where.orderId = orderId;

    const shipments = await db.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            grandTotal: true,
            shippingAddress: true,
            user: { select: { name: true, email: true } },
          },
        },
        trackingEvents: { orderBy: { eventTimestamp: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ shipments });
  } catch (error) {
    console.error("GET /api/shipments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createShipmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      orderId,
      provider: providerKey,
      courierId,
      courierName,
      courierCode,
      weightGrams,
      lengthCm,
      widthCm,
      heightCm,
    } = parsed.data;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { name: true, hsnCode: true } } } },
        shippingAddress: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let shippingProvider = shippingRegistry.getProvider(providerKey);

    const deliveryAddress = {
      line1: order.shippingAddress?.line1 || "Street Address",
      line2: order.shippingAddress?.line2 || undefined,
      city: order.shippingAddress?.city || "Vadodara",
      state: order.shippingAddress?.state || "Gujarat",
      pincode: order.shippingAddress?.pincode || "390010",
    };

    let result = await shippingProvider.createShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress?.name || order.user?.name || "Customer",
      customerEmail: order.user?.email || "customer@digitalworld.com",
      customerPhone: order.shippingAddress?.phone || "9999999999",
      deliveryAddress,
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        hsnCode: i.product.hsnCode || "8424",
      })),
      weightGrams,
      lengthCm,
      widthCm,
      heightCm,
      orderValue: Number(order.grandTotal),
      courierId,
      courierName: courierName || "DTDC Express",
      courierCode,
    });

    // If external provider fails, fallback to manual provider
    if (!result.success && providerKey !== "manual") {
      const fallbackProvider = shippingRegistry.getProvider("manual");
      result = await fallbackProvider.createShipment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.shippingAddress?.name || order.user?.name || "Customer",
        customerEmail: order.user?.email || "customer@digitalworld.com",
        customerPhone: order.shippingAddress?.phone || "9999999999",
        deliveryAddress,
        items: order.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          hsnCode: i.product.hsnCode || "8424",
        })),
        weightGrams,
        lengthCm,
        widthCm,
        heightCm,
        orderValue: Number(order.grandTotal),
        courierId,
        courierName: courierName || "DTDC Express",
        courierCode,
      });
    }

    if (!result.success || !result.awbNumber) {
      return NextResponse.json(
        { error: result.error || "Failed to create shipment" },
        { status: 400 }
      );
    }

    // Check if shipment already exists for this order (Single Authoritative Shipment)
    const existingShipment = await db.shipment.findFirst({
      where: { orderId: order.id },
    });

    let shipment;
    if (existingShipment) {
      shipment = await db.shipment.update({
        where: { id: existingShipment.id },
        data: {
          provider: result.provider,
          providerShipmentId: result.providerShipmentId,
          courierId: courierId || null,
          courierName: result.courierName,
          courierCode: result.courierCode || courierCode || null,
          awbNumber: result.awbNumber,
          trackingUrl: result.trackingUrl,
          status: "SHIPMENT_CREATED",
          estimatedDeliveryDate: result.estimatedDeliveryDate,
          pickupDate: result.pickupDate,
          weightGrams,
          lengthCm,
          widthCm,
          heightCm,
          labelUrl: result.labelUrl,
        },
      });
    } else {
      shipment = await db.shipment.create({
        data: {
          orderId: order.id,
          provider: result.provider,
          providerShipmentId: result.providerShipmentId,
          courierId: courierId || null,
          courierName: result.courierName,
          courierCode: result.courierCode || courierCode || null,
          awbNumber: result.awbNumber,
          trackingUrl: result.trackingUrl,
          status: "SHIPMENT_CREATED",
          estimatedDeliveryDate: result.estimatedDeliveryDate,
          pickupDate: result.pickupDate,
          weightGrams,
          lengthCm,
          widthCm,
          heightCm,
          labelUrl: result.labelUrl,
        },
      });
    }

    // Update order status to shipped and store tracking number
    await db.order.update({
      where: { id: order.id },
      data: {
        status: "shipped",
        trackingNumber: result.awbNumber,
        trackingUrl: result.trackingUrl,
      },
    });

    // Log initial tracking event
    await db.shipmentTrackingEvent.create({
      data: {
        shipmentId: shipment.id,
        provider: result.provider,
        courier: result.courierName,
        awbNumber: result.awbNumber,
        externalStatus: "MANIFESTED",
        internalStatus: "SHIPMENT_CREATED",
        location: "Warehouse Origin",
        description: `Shipment created via ${result.courierName}. AWB: ${result.awbNumber}`,
        eventTimestamp: new Date(),
      },
    });

    // Revalidate paths for real-time customer and admin sync
    try {
      revalidatePath("/admin/orders");
      revalidatePath("/admin/shipping");
      revalidatePath("/account/orders");
      revalidatePath(`/account/orders/${order.id}`);
      revalidatePath(`/account/orders/${order.orderNumber}`);
      revalidatePath("/track-order");
    } catch (e) {
      console.warn("revalidatePath error:", e);
    }

    return NextResponse.json({ success: true, shipment });
  } catch (error: any) {
    console.error("POST /api/shipments error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
