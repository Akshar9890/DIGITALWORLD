export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ShipmentStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ShipmentStatus | null;
    const provider = searchParams.get("provider");
    const courier = searchParams.get("courier");
    const query = searchParams.get("query")?.trim().toLowerCase();

    // Query filters
    const where: any = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;
    if (courier) where.courierName = { contains: courier, mode: "insensitive" };
    if (query) {
      where.OR = [
        { awbNumber: { contains: query, mode: "insensitive" } },
        { courierName: { contains: query, mode: "insensitive" } },
        {
          order: {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { user: { name: { contains: query, mode: "insensitive" } } },
              { user: { email: { contains: query, mode: "insensitive" } } },
              { shippingAddress: { pincode: { contains: query } } },
              { shippingAddress: { city: { contains: query, mode: "insensitive" } } },
            ],
          },
        },
      ];
    }

    // Fetch filtered shipments
    const shipments = await db.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            grandTotal: true,
            status: true,
            paymentStatus: true,
            shippingAddress: true,
            user: { select: { name: true, email: true } },
            items: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        trackingEvents: {
          orderBy: { eventTimestamp: "desc" },
          take: 3,
        },
      },
    });

    // Compute status counts for dashboard stats
    const allShipments = await db.shipment.findMany({
      select: { status: true },
    });

    const counts = {
      total: allShipments.length,
      pending: allShipments.filter((s) => s.status === "SHIPMENT_CREATED" || s.status === "PACKED").length,
      pickedUp: allShipments.filter((s) => s.status === "PICKED_UP" || s.status === "PICKUP_SCHEDULED").length,
      inTransit: allShipments.filter((s) => s.status === "IN_TRANSIT" || s.status === "REACHED_DESTINATION").length,
      outForDelivery: allShipments.filter((s) => s.status === "OUT_FOR_DELIVERY").length,
      delivered: allShipments.filter((s) => s.status === "DELIVERED").length,
      ndr: allShipments.filter((s) => s.status === "NDR" || s.status === "DELIVERY_ATTEMPTED").length,
      rto: allShipments.filter((s) => s.status === "RTO_INITIATED" || s.status === "RTO_IN_TRANSIT" || s.status === "RTO_DELIVERED").length,
      delayed: allShipments.filter((s) => s.status === "DELAYED").length,
    };

    return NextResponse.json({ shipments, counts });
  } catch (error) {
    console.error("GET /api/admin/shipments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
