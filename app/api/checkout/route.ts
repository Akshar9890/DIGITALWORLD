import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { resolvePrice } from "@/lib/pricing";
import { getCourierCharge, getGSTAmount, GST_RATE } from "@/lib/shipping";
import { computeGST, roundToTwo } from "@/lib/tax";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
import { z } from "zod";

const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    email: z.string().email(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    gstin: z.string().optional(),
  }),
});

async function getSessionIdentifier() {
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id, sessionId: null };
  }
  const sessionId = cookies().get("dw_cart_session")?.value;
  return { userId: null, sessionId };
}

async function nextOrderNumber() {
  const prefix = `DW-${new Date().getFullYear()}-`;
  const existing = await db.order.findMany({
    where: { orderNumber: { startsWith: prefix } },
    select: { orderNumber: true },
  });
  let sequence = 1;
  if (existing.length > 0) {
    const maxSeq = existing.reduce((max, o) => {
      const num = parseInt(o.orderNumber.replace(prefix, ""), 10);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);
    sequence = maxSeq + 1;
  }
  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  try {
    const { userId, sessionId } = await getSessionIdentifier();

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "Cart is empty or session expired" }, { status: 400 });
    }

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid shipping details" }, { status: 400 });
    }

    const { shippingAddress } = result.data;

    // Pricing context — same engine as cart & quotation
    const authSession = await auth();
    const role = authSession?.user?.role || "retail";

    let assignedTierId = null;
    if (role === "wholesale_approved" && userId) {
      const company = await db.company.findUnique({
        where: { userId },
        select: { assignedTierId: true },
      });
      assignedTierId = company?.assignedTierId;
    }

    const pricingContext = { role, assignedTierId };

    // Fetch Cart
    const items = await db.cartItem.findMany({
      where: userId ? { userId } : { sessionId },
      include: { product: true },
    });

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Resolve prices server-side (single source of truth — never trust the client)
    let subtotal = 0;
    let totalWeightGrams = 0;
    const orderItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      hsnCode: string;
    }[] = [];

    for (const item of items) {
      if (!item.product.isActive || item.product.stockStatus === "out_of_stock") {
        return NextResponse.json(
          { error: `Product ${item.product.name} is out of stock` },
          { status: 400 }
        );
      }

      const price = await resolvePrice(item.productId, item.quantity, pricingContext);
      subtotal = roundToTwo(subtotal + price.subtotal);
      totalWeightGrams += item.quantity * item.product.weightGrams;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: price.unitPrice,
        lineTotal: price.subtotal,
        hsnCode: item.product.hsnCode,
      });
    }

    // Courier + GST — same helpers as the Instant Quotation
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const courier = getCourierCharge(totalWeightGrams, totalQuantity);

    const shippingAmount = courier.amount;
    const totalGST = getGSTAmount(subtotal);

    const sellerState = process.env.BUSINESS_STATE || "Maharashtra";
    const buyerState = shippingAddress.state;
    const gst = computeGST(subtotal, sellerState, buyerState, GST_RATE);
    const taxableAmount = roundToTwo(subtotal + shippingAmount);
    const grandTotal = roundToTwo(subtotal + totalGST + shippingAmount);

    // Convert to paise for Razorpay
    const amountInPaise = Math.round(grandTotal * 100);

    const orderNumber = await nextOrderNumber();

    // ── Create Razorpay Order via direct API (no SDK wrapper) ───────────────
    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;

    console.log("[Razorpay] key_id:", keyId?.substring(0, 12) + "...", "| secret length:", keySecret?.length);

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      }),
    });

    const rzpOrder = await rzpResponse.json() as { id: string; amount: number; currency: string; [key: string]: any };

    if (!rzpResponse.ok) {
      console.error("[Razorpay] Order creation failed:", rzpOrder);
      return NextResponse.json({ error: "Payment gateway error: " + (rzpOrder.error?.description || "Unknown") }, { status: 502 });
    }

    console.log("[Razorpay] Order created:", rzpOrder.id);

    // Create DB Order + Payment in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "pending_payment",
          paymentStatus: "initiated",
          subtotal,
          shippingAmount,
          taxableAmount,
          sellerState,
          buyerState,
          isSameState: gst.isSameState,
          cgstAmount: gst.cgstAmount,
          sgstAmount: gst.sgstAmount,
          igstAmount: gst.igstAmount,
          totalGST,
          grandTotal,
          items: { create: orderItemsData },
          payment: {
            create: {
              razorpayOrderId: rzpOrder.id,
              amount: grandTotal,
              currency: "INR",
              status: "initiated",
              method: "razorpay",
            },
          },
        },
        include: { items: true },
      });

      // Create the address records (shipping = billing for now)
      const shippingAddressRecord = await tx.address.create({
        data: {
          userId,
          label: "Shipping",
          name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          line1: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          gstin: shippingAddress.gstin || null,
        },
      });

      await tx.order.update({
        where: { id: newOrder.id },
        data: { shippingAddressId: shippingAddressRecord.id },
      });

      // Cart is cleared only after successful payment (in the webhook).
      return newOrder;
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR",
    });
  } catch (error) {
    console.error("Checkout POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
