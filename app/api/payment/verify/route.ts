export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { sendOrderConfirmationEmail } from "@/lib/email";

const verifySchema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = result.data;

    // ── Verify Razorpay Signature ────────────────────────────────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch", { expectedSignature, razorpay_signature });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // ── Validate Order & Payment match in Database ───────────────────────────
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Enforce that razorpay_order_id belongs to this database order
    if (existingOrder.payment && existingOrder.payment.razorpayOrderId !== razorpay_order_id) {
      console.error("Security Alert: razorpay_order_id mismatch with database order", {
        dbRazorpayId: existingOrder.payment.razorpayOrderId,
        requestRazorpayId: razorpay_order_id,
      });
      return NextResponse.json(
        { error: "Payment does not match the specified order" },
        { status: 400 }
      );
    }

    // Idempotency: If payment is already captured, return success immediately
    if (existingOrder.paymentStatus === "captured") {
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        alreadyCaptured: true,
      });
    }

    // ── Update DB in a transaction ───────────────────────────────────────────
    const order = await db.$transaction(async (tx) => {
      await tx.payment.upsert({
        where: { orderId },
        update: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: existingOrder.grandTotal,
          status: "captured",
          method: "razorpay",
          webhookVerified: true,
          capturedAt: new Date(),
        },
        create: {
          orderId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: existingOrder.grandTotal,
          currency: "INR",
          status: "captured",
          method: "razorpay",
          webhookVerified: true,
          capturedAt: new Date(),
        },
      });

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: "processing", paymentStatus: "captured" },
      });

      // Clear cart after successful payment
      const session = await auth();
      const sessionId = cookies().get("dw_cart_session")?.value;
      if (session?.user?.id) {
        await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
      } else if (sessionId) {
        await tx.cartItem.deleteMany({ where: { sessionId } });
      }

      return updated;
    });

    // ── Send Email Notification ──────────────────────────────────────────────
    try {
      const orderWithItems = await db.order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { product: { select: { name: true } } } },
          shippingAddress: true,
          user: { select: { name: true, email: true } },
        },
      });

      if (orderWithItems) {
        const email = orderWithItems.user?.email || "customer@digitalworld.com";
        const name = orderWithItems.shippingAddress?.name || orderWithItems.user?.name || "Valued Customer";

        await sendOrderConfirmationEmail({
          customerEmail: email,
          customerName: name,
          orderNumber: orderWithItems.orderNumber,
          orderId: orderWithItems.id,
          grandTotal: Number(orderWithItems.grandTotal),
          createdAt: orderWithItems.createdAt,
          items: orderWithItems.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
            total: Number(i.lineTotal),
          })),
        });
      }
    } catch (emailErr) {
      console.error("Non-blocking order email error:", emailErr);
    }

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
