import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { resolvePrice } from "@/lib/pricing";
import { cookies } from "next/headers";
import { generateSessionToken } from "@/lib/utils";
import { z } from "zod";

const cartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

async function getSessionIdentifier(isWrite: boolean = false) {
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id, sessionId: null, newSessionId: null };
  }

  let sessionId = cookies().get("dw_cart_session")?.value;
  let newSessionId = null;

  if (!sessionId && isWrite) {
    sessionId = generateSessionToken();
    newSessionId = sessionId;
  }
  return { userId: null, sessionId, newSessionId };
}

// GET /api/cart — Fetch cart items with resolved pricing
export async function GET() {
  try {
    const { userId, sessionId } = await getSessionIdentifier(false);

    // A guest without a cart cookie has no cart. Do not query every guest row.
    if (!userId && !sessionId) {
      return NextResponse.json({ items: [], subtotal: 0, totalWeightGrams: 0 });
    }
    const authSession = await auth();
    const role = authSession?.user?.role || "retail";

    let assignedTierId = null;
    if (role === "wholesale_approved" && userId) {
      const company = await db.company.findUnique({
        where: { userId },
        select: { assignedTierId: true }
      });
      assignedTierId = company?.assignedTierId;
    }

    const pricingContext = { role, assignedTierId };

    const items = await db.cartItem.findMany({
      where: userId ? { userId } : { sessionId },
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true, stockStatus: true, weightGrams: true }
        }
      },
      orderBy: { addedAt: "desc" }
    });

    // Resolve current price for each item
    const resolvedItems = await Promise.all(
      items.map(async (item) => {
        const price = await resolvePrice(item.productId, item.quantity, pricingContext);
        return {
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          unitPrice: price.unitPrice,
          subtotal: price.subtotal,
          tierName: price.tierName
        };
      })
    );

    const cartSubtotal = resolvedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const totalWeight = resolvedItems.reduce((acc, item) => acc + (item.product.weightGrams * item.quantity), 0);

    return NextResponse.json({
      items: resolvedItems,
      subtotal: cartSubtotal,
      totalWeightGrams: totalWeight
    });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/cart — Add/Update item
export async function POST(req: Request) {
  try {
    const { userId, sessionId, newSessionId } = await getSessionIdentifier(true);
    
    const body = await req.json();
    const result = cartSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", issues: result.error.issues }, { status: 400 });
    }

    const { productId, quantity } = result.data;

    // Check product exists and is in stock
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { isActive: true, stockStatus: true }
    });

    if (!product || !product.isActive || product.stockStatus === "out_of_stock") {
      return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
    }

    // Upsert cart item
    const existingItem = await db.cartItem.findFirst({
      where: userId 
        ? { userId, productId } 
        : { sessionId, productId }
    });

    if (existingItem) {
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: quantity } // Replace quantity (or add? we'll just replace based on UI design)
      });
    } else {
      await db.cartItem.create({
        data: {
          userId,
          sessionId,
          productId,
          quantity
        }
      });
    }

    const response = NextResponse.json({ success: true });

    // Persist the guest-cart identifier so later Add to Cart actions update the
    // same product row instead of creating unrelated guest carts.
    if (newSessionId) {
      response.cookies.set("dw_cart_session", newSessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/cart — Remove item
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const { userId, sessionId } = await getSessionIdentifier();

    // Ensure item belongs to user/session before deleting
    const item = await db.cartItem.findUnique({ where: { id: itemId } });
    if (!item || (userId && item.userId !== userId) || (!userId && item.sessionId !== sessionId)) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await db.cartItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
