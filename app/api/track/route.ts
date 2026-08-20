export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shippingRegistry } from "@/lib/shipping";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();
    const verify = searchParams.get("verify")?.trim().toLowerCase();

    if (!query) {
      return NextResponse.json(
        { error: "Order Number or AWB Number is required" },
        { status: 400 }
      );
    }

    // Find shipment by AWB or by Order Number
    const shipment = await db.shipment.findFirst({
      where: {
        OR: [
          { awbNumber: { equals: query, mode: "insensitive" } },
          { order: { orderNumber: { equals: query, mode: "insensitive" } } },
        ],
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            shippingAddress: {
              select: { city: true, state: true, pincode: true, name: true, phone: true },
            },
            user: { select: { email: true, name: true } },
            items: {
              include: {
                product: { select: { name: true, slug: true, images: true } },
              },
            },
          },
        },
        trackingEvents: {
          orderBy: { eventTimestamp: "desc" },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "No shipment found for this Order or AWB number." },
        { status: 404 }
      );
    }

    // If verification provided (email or last 4 digits of phone), validate it
    if (verify) {
      const email = shipment.order.user?.email?.toLowerCase();
      const phone = shipment.order.shippingAddress?.phone || "";
      const matchesEmail = email && email.includes(verify);
      const matchesPhone = phone && phone.endsWith(verify);

      if (!matchesEmail && !matchesPhone) {
        return NextResponse.json(
          { error: "Verification failed. Please check the email or phone number provided." },
          { status: 403 }
        );
      }
    }

    // Mask customer name & phone for public tracking privacy
    const rawName = shipment.order.shippingAddress?.name || shipment.order.user?.name || "Customer";
    const maskedName = rawName.slice(0, 2) + "*** " + rawName.split(" ").slice(1).join(" ");
    const cityState = `${shipment.order.shippingAddress?.city || "City"}, ${shipment.order.shippingAddress?.state || "State"}`;

    return NextResponse.json({
      success: true,
      shipment: {
        id: shipment.id,
        orderNumber: shipment.order.orderNumber,
        awbNumber: shipment.awbNumber,
        courierName: shipment.courierName,
        courierCode: shipment.courierCode,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        pickupDate: shipment.pickupDate,
        destination: cityState,
        customerName: maskedName,
        items: shipment.order.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          image: i.product.images?.[0] || null,
        })),
        events: shipment.trackingEvents.map((ev) => ({
          id: ev.id,
          internalStatus: ev.internalStatus,
          externalStatus: ev.externalStatus,
          location: ev.location,
          description: ev.description,
          timestamp: ev.eventTimestamp,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/track error:", error);
    return NextResponse.json(
      { error: "Tracking service is temporarily unavailable." },
      { status: 500 }
    );
  }
}
