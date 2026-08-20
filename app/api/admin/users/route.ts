import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        adminSubRole: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            grandTotal: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            orders: true,
            quotations: true,
          },
        },
      },
    });

    const transformedUsers = users.map((user) => {
      // Calculate total spent on successful / captured / delivered orders
      const validOrders = user.orders.filter(
        (o) =>
          o.paymentStatus === "captured" ||
          o.status === "processing" ||
          o.status === "shipped" ||
          o.status === "delivered"
      );

      const totalSpent = validOrders.reduce(
        (sum, o) => sum + Number(o.grandTotal || 0),
        0
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        adminSubRole: user.adminSubRole,
        createdAt: user.createdAt.toISOString(),
        ordersCount: user._count.orders,
        quotationsCount: user._count.quotations,
        totalSpent,
        lastOrder: user.orders[0]
          ? {
              orderNumber: user.orders[0].orderNumber,
              status: user.orders[0].status,
              createdAt: user.orders[0].createdAt.toISOString(),
            }
          : null,
      };
    });

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
