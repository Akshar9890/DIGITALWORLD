import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getTierTable, resolvePrice } from "@/lib/pricing";
import { ProductDetailsClient } from "@/components/catalog/ProductDetailsClient";
import type { UserRole } from "@prisma/client";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Fetch product with category and reviews
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, image: true } } },
      }
    }
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Get current user context
  const session = await auth();
  const role: UserRole = session?.user?.role || "retail";
  
  // Find company if user is wholesale
  let assignedTierId = null;
  if (role === "wholesale_approved" && session?.user?.id) {
    const company = await db.company.findUnique({
      where: { userId: session.user.id },
      select: { assignedTierId: true }
    });
    assignedTierId = company?.assignedTierId;
  }

  const pricingContext = { role, assignedTierId };

  // Generate tier table for the UI
  const tierTable = await getTierTable(product.id, pricingContext, 1);
  
  // Get default price for 1 qty
  const initialPrice = await resolvePrice(product.id, 1, pricingContext);

  return (
    <div className="flex flex-col w-full">
      <ProductDetailsClient 
        product={product} 
        tierTable={tierTable} 
        initialPrice={initialPrice}
        role={role}
      />
    </div>
  );
}
