export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Package, FileText, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch recent orders
  const recentOrders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      items: { include: { product: { select: { name: true } } } }
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-headline-md text-white">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Links */}
        <Link href="/account/orders" className="bento-card p-6 border-outline-variant/20 hover:border-tertiary/40 transition-colors group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <div>
              <h3 className="font-headline-sm text-white">My Orders</h3>
              <p className="text-xs text-slate-gray">View and track your previous orders</p>
            </div>
          </div>
          <ArrowRight className="text-slate-gray group-hover:text-white transition-colors" />
        </Link>
        
        <Link href="/account/quotes" className="bento-card p-6 border-tertiary/30 bg-tertiary/5 hover:border-tertiary transition-colors group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-headline-sm text-white">My Quotations</h3>
              <p className="text-xs text-slate-gray">Instant quotations you generated — download or share</p>
            </div>
          </div>
          <ArrowRight className="text-tertiary group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="bento-card p-6 border-outline-variant/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline-sm text-white">Recent Orders</h3>
          <Link href="/account/orders" className="text-sm text-tertiary hover:underline font-bold">View All</Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-gray mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="btn-primary inline-flex">Browse Products</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recentOrders.map(order => (
              <div key={order.id} className="bg-surface-container rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-gray font-label-caps uppercase mb-1">Order #{order.id.slice(0,8)}</span>
                  <span className="text-sm text-white line-clamp-1">
                    {order.items.length} item(s) • {order.items[0]?.product.name} {order.items.length > 1 ? '& more' : ''}
                  </span>
                </div>
                <div className="flex justify-between md:flex-col md:items-end gap-2 md:gap-1 w-full md:w-auto">
                  <span className="font-headline-sm text-white">{formatINR(Number(order.grandTotal))}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-status-success/20 text-status-success' : 
                    order.status === 'processing' ? 'bg-tertiary/20 text-tertiary' : 
                    'bg-surface-container-high text-slate-gray'
                  }`}>
                    {order.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
