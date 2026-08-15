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

    const [totalUsers, totalProducts, totalOrders, totalQuotations, totalCompanies, revenue, recentOrders, recentQuotations, ordersByStatus] =
      await Promise.all([
        db.user.count(),
        db.product.count(),
        db.order.count(),
        db.quotation.count(),
        db.company.count(),
        db.order.aggregate({
          _sum: { grandTotal: true },
          where: { status: { notIn: ["cancelled", "refunded"] } },
        }),
        db.order.findMany({
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
        db.order.groupBy({
          by: ["status"],
          _count: true,
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
      ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count })),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
