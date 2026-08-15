import { db } from "@/lib/db";
import { amountToWords } from "@/lib/tax";

export async function getOrCreateInvoice(orderId: string) {
  // Check if invoice already exists
  let invoice = await db.invoice.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: {
                select: { name: true, slug: true, hsnCode: true },
              },
            },
          },
          user: { select: { name: true, email: true } },
          shippingAddress: true,
          payment: true,
        },
      },
    },
  });

  if (invoice) return invoice;

  // Fetch order details to generate invoice
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, hsnCode: true } },
        },
      },
      user: { select: { name: true, email: true } },
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) return null;

  const sellerState = "Gujarat";
  const buyerState = order.buyerState || order.shippingAddress?.state || "Gujarat";
  const isSameState =
    order.isSameState ?? (sellerState.toLowerCase() === buyerState.toLowerCase());

  const buyerAddressStr = order.shippingAddress
    ? `${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
    : "Registered Delivery Address";

  const numPart = order.orderNumber.replace("DW-2026-", "").replace("DW-", "");
  const invoiceNumber = `DW-INV-2026-${numPart.padStart(4, "0")}`;

  const taxableVal = Number(order.taxableAmount || order.subtotal);
  const totalGST = Number(order.totalGST || 0);
  const grandTotal = Number(order.grandTotal);

  const cgstRate = isSameState ? 0.09 : 0;
  const cgstAmount = isSameState ? Number(order.cgstAmount || totalGST / 2) : 0;

  const sgstRate = isSameState ? 0.09 : 0;
  const sgstAmount = isSameState ? Number(order.sgstAmount || totalGST / 2) : 0;

  const igstRate = !isSameState ? 0.18 : 0;
  const igstAmount = !isSameState ? Number(order.igstAmount || totalGST) : 0;

  // Create invoice record
  await db.invoice.create({
    data: {
      orderId: order.id,
      invoiceNumber,
      sellerGstin: process.env.NEXT_PUBLIC_SELLER_GSTIN || "24ABCDE1234F1Z5",
      sellerName: "DIGITALWORLD Industrial Fire Tech",
      sellerAddress: "Plot No. 402, GIDC Industrial Estate, Vadodara, Gujarat - 390010",
      sellerState: "Gujarat",

      buyerName: order.shippingAddress?.name || order.user?.name || "Customer",
      buyerEmail: order.user?.email || "customer@digitalworld.com",
      buyerGstin: order.shippingAddress?.gstin || null,
      billingAddress: buyerAddressStr,
      shippingAddress: buyerAddressStr,
      buyerState,
      placeOfSupply: buyerState,

      isSameState,
      taxableValue: taxableVal,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalGST,
      shippingValue: Number(order.shippingAmount || 0),
      shippingGST: 0,
      grandTotal,
      amountInWords: amountToWords(grandTotal),
    },
  });

  // Re-fetch with full relations
  return await db.invoice.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: { select: { name: true, slug: true, hsnCode: true } },
            },
          },
          user: { select: { name: true, email: true } },
          shippingAddress: true,
          payment: true,
        },
      },
    },
  });
}
