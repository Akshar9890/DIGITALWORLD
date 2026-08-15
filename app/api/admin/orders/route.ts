import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const includePending = searchParams.get("includePending") === "true";

    // By default, filter out pending_payment attempts and only show successful paid orders
    let where: any;
    if (status) {
      where = { status };
    } else if (includePending) {
      where = {};
    } else {
      where = {
        OR: [
          { paymentStatus: "captured" },
          { status: { in: ["processing", "shipped", "delivered"] } },
        ],
      };
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        shippingAddress: { select: { name: true, line1: true, city: true, state: true, pincode: true } },
        payment: { select: { method: true, status: true } },
        items: {
          include: { product: { select: { name: true, slug: true } } },
        },
      },
    });

    // Normalize to the shape the admin orders page expects
    const normalized = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name ?? o.shippingAddress?.name ?? "Guest",
      customerEmail: o.user?.email ?? "—",
      grandTotal: Number(o.grandTotal),
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
      paymentMethod: o.payment?.method ?? null,
      shippingAddress: o.shippingAddress
        ? `${o.shippingAddress.line1}, ${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.pincode}`
        : null,
      notes: o.notes ?? null,
      items: o.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name ?? "Unknown",
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.lineTotal),
      })),
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
