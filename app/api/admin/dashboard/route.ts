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

    // Filter for successful/captured paid orders only
    const paidOrdersWhere = {
      OR: [
        { paymentStatus: "captured" },
        { status: { in: ["processing", "shipped", "delivered"] } },
      ],
    };

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalQuotations,
      totalCompanies,
      revenue,
      recentOrders,
      recentQuotations,
    ] = await Promise.all([
      db.user.count(),
      db.product.count(),

      // Count ONLY paid/successful orders
      db.order.count({ where: paidOrdersWhere }),

      db.quotation.count(),
      db.company.count(),

      // Total revenue ONLY from paid/captured orders
      db.order.aggregate({
        _sum: { grandTotal: true },
        where: paidOrdersWhere,
      }),

      // Recent orders: ONLY paid/successful orders
      db.order.findMany({
        where: paidOrdersWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          grandTotal: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),

      db.quotation.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          quotationNumber: true,
          customerName: true,
          grandTotal: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      totals: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        quotations: totalQuotations,
        companies: totalCompanies,
      },
      revenue: Number(revenue._sum.grandTotal ?? 0),
      recentOrders,
      recentQuotations,
      ordersByStatus: [],
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
