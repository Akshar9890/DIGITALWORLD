export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const formData = await req.formData();
    const razorpay_payment_id = formData.get("razorpay_payment_id") as string;
    const razorpay_order_id = formData.get("razorpay_order_id") as string;
    const razorpay_signature = formData.get("razorpay_signature") as string;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return NextResponse.redirect(new URL("/checkout?error=payment_failed", req.url));
    }

    // Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.redirect(new URL("/checkout?error=invalid_signature", req.url));
    }

    // Mark Order as Processing and create Payment record
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

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "processing", paymentStatus: "captured" } // Payment successful, moved to processing
      });

      // Clear the user's cart
      const session = await auth();
      const sessionId = cookies().get("dw_cart_session")?.value;
      if (session?.user?.id) {
        await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
      } else if (sessionId) {
        await tx.cartItem.deleteMany({ where: { sessionId } });
      }

      return updatedOrder;
    });

    return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}`, req.url));
  } catch (error) {
    console.error("Payment Callback Error:", error);
    return NextResponse.redirect(new URL("/checkout?error=server_error", req.url));
  }
}
