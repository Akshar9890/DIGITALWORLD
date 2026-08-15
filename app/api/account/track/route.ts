import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const trackSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const result = trackSchema.safeParse({ orderId });
    if (!result.success) {
      return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: {
        OR: [
          { id: orderId, userId: session.user.id },
          { orderNumber: orderId, userId: session.user.id },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        grandTotal: true,
        trackingNumber: true,
        trackingUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your Order ID." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ACCOUNT_TRACK]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
