import { Resend } from "resend";
import { formatINR, getEstimatedDeliveryRange } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export type OrderEmailParams = {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  grandTotal: number;
  createdAt: Date;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  shippingAddressStr?: string;
};

export async function sendOrderConfirmationEmail(params: OrderEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SIMULATION] Resend API Key not set. Order confirmation email simulated for:", params.customerEmail);
    return { success: true, simulated: true };
  }

  const delivery = getEstimatedDeliveryRange(params.createdAt);
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatINR(item.unitPrice)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${formatINR(item.total)}</td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - ${params.orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; color: #18181b; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #10b981; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">DIGITALWORLD</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Industrial Fire Tech • Order Confirmation</p>
          </div>

          <!-- Content -->
          <div style="padding: 24px;">
            <h2 style="font-size: 18px; margin-top: 0; color: #10b981;">Thank you for your order, ${params.customerName}! 🎉</h2>
            <p style="font-size: 14px; color: #52525b; line-height: 1.5;">
              Your order <strong>${params.orderNumber}</strong> has been successfully placed and payment is confirmed. Our warehouse team is preparing your shipment.
            </p>

            <!-- Delivery Box -->
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #065f46; font-weight: bold;">Estimated Delivery Window</p>
              <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold; color: #047857;">
                📦 ${delivery.displayText}
              </p>
            </div>

            <!-- Items Table -->
            <h3 style="font-size: 15px; margin-bottom: 10px; color: #18181b;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f4f4f5; text-transform: uppercase; font-size: 11px; color: #71717a;">
                  <th style="padding: 8px 10px; text-align: left;">Item</th>
                  <th style="padding: 8px 10px; text-align: center;">Qty</th>
                  <th style="padding: 8px 10px; text-align: right;">Price</th>
                  <th style="padding: 8px 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Total -->
            <div style="text-align: right; margin-bottom: 24px; padding-top: 10px; border-top: 2px solid #10b981;">
              <span style="font-size: 14px; color: #71717a;">Grand Total (Incl. GST & Shipping): </span>
              <span style="font-size: 20px; font-weight: bold; color: #10b981;">${formatINR(params.grandTotal)}</span>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0 10px;">
              <a href="${baseUrl}/orders/${params.orderId}/invoice" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; margin-right: 10px;">
                📄 View GST Invoice Online
              </a>
              <a href="${baseUrl}/api/orders/${params.orderId}/invoice/pdf?download=1" style="background-color: #27272a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                ⬇ Download Invoice PDF
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f4f4f5; padding: 16px; text-align: center; font-size: 12px; color: #71717a;">
            <p style="margin: 0;">DIGITALWORLD Industrial Fire Tech • Vadodara, Gujarat</p>
            <p style="margin: 5px 0 0;">Need help? Email <a href="mailto:digitalworld9890@gmail.com" style="color: #10b981;">digitalworld9890@gmail.com</a> or WhatsApp +91 70436 33303</p>
          </div>

        </div>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: "DIGITALWORLD <orders@digitalworld.in>",
      to: params.customerEmail,
      subject: `Order Confirmation & GST Invoice - ${params.orderNumber}`,
      html: emailHtml,
    });
    return { success: true, data };
  } catch (err) {
    console.error("Failed to send order email:", err);
    return { success: false, error: err };
  }
}
