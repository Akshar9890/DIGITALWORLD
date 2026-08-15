import { auth } from "@/auth";
import { db } from "@/lib/db";
import OrdersPageClient from "@/components/account/OrdersPageClient";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true } },
        },
      },
    },
  });

  const serialized = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    grandTotal: Number(order.grandTotal),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    trackingNumber: order.trackingNumber,
    items: order.items.map((item) => ({
      product: { name: item.product.name, slug: item.product.slug },
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  }));

  return <OrdersPageClient initialOrders={serialized} />;
}
