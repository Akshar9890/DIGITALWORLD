import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";

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

    // ── Update DB in a transaction ───────────────────────────────────────────
    const order = await db.$transaction(async (tx) => {
      const dbOrder = await tx.order.findUnique({ where: { id: orderId } });
      if (!dbOrder) throw new Error("Order not found");

      await tx.payment.update({
        where: { orderId },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: dbOrder.grandTotal,
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

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
