export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error("[Razorpay Webhook] Webhook secret is not configured in environment variables.");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!signature) {
      console.warn("[Razorpay Webhook] Missing x-razorpay-signature header.");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature with HMAC SHA256
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("[Razorpay Webhook] Invalid webhook signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;
      const method = paymentEntity?.method || "razorpay";
      const bank = paymentEntity?.bank || null;
      const wallet = paymentEntity?.wallet || null;
      const vpa = paymentEntity?.vpa || null;

      if (!razorpayOrderId) {
        console.warn("[Razorpay Webhook] Missing order_id in payment payload");
        return NextResponse.json({ received: true });
      }

      // Find the payment record associated with this Razorpay order
      const existingPayment = await db.payment.findUnique({
        where: { razorpayOrderId },
        include: { order: true },
      });

      if (existingPayment) {
        // Idempotent update: mark captured
        await db.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              razorpayPaymentId: razorpayPaymentId || existingPayment.razorpayPaymentId,
              status: "captured",
              method,
              bank,
              wallet,
              vpa,
              webhookVerified: true,
              webhookPayload: event,
              capturedAt: new Date(),
            },
          });

          await tx.order.update({
            where: { id: existingPayment.orderId },
            data: {
              status: "processing",
              paymentStatus: "captured",
            },
          });
        });

        // Send order confirmation email if not already sent
        try {
          const orderWithDetails = await db.order.findUnique({
            where: { id: existingPayment.orderId },
            include: {
              items: { include: { product: { select: { name: true } } } },
              shippingAddress: true,
              user: { select: { name: true, email: true } },
            },
          });

          if (orderWithDetails) {
            const customerEmail = orderWithDetails.user?.email || "customer@digitalworld.com";
            const customerName =
              orderWithDetails.shippingAddress?.name ||
              orderWithDetails.user?.name ||
              "Valued Customer";

            await sendOrderConfirmationEmail({
              customerEmail,
              customerName,
              orderNumber: orderWithDetails.orderNumber,
              orderId: orderWithDetails.id,
              grandTotal: Number(orderWithDetails.grandTotal),
              createdAt: orderWithDetails.createdAt,
              items: orderWithDetails.items.map((i) => ({
                name: i.product.name,
                quantity: i.quantity,
                unitPrice: Number(i.unitPrice),
                total: Number(i.lineTotal),
              })),
            });
          }
        } catch (emailErr) {
          console.error("[Razorpay Webhook] Email error:", emailErr);
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const failureReason = paymentEntity?.error_description || "Payment failed at gateway";

      if (razorpayOrderId) {
        const existingPayment = await db.payment.findUnique({
          where: { razorpayOrderId },
        });

        if (existingPayment) {
          await db.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: "failed",
                failureReason,
                webhookPayload: event,
              },
            });

            await tx.order.update({
              where: { id: existingPayment.orderId },
              data: {
                paymentStatus: "failed",
              },
            });
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
