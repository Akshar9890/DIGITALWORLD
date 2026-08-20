/**
 * lib/shiprocket/orders.ts — Adhoc Order Creation in Shiprocket
 */

import { shiprocketRequest } from "./client";

export interface CreateShiprocketOrderParams {
  orderId: string;
  orderNumber: string;
  orderDate?: string; // "YYYY-MM-DD HH:MM"
  pickupLocation?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    hsnCode?: string;
  }[];
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  orderValue: number;
  isCod?: boolean;
}

export interface ShiprocketOrderResult {
  success: boolean;
  orderId?: number;
  shipmentId?: number;
  status?: string;
  statusCode?: number;
  error?: string;
}

export async function createShiprocketOrder(
  params: CreateShiprocketOrderParams
): Promise<ShiprocketOrderResult> {
  const pickupLocation =
    params.pickupLocation ||
    process.env.SHIPROCKET_PICKUP_LOCATION ||
    "Primary";

  const dateStr = params.orderDate || new Date().toISOString().slice(0, 19).replace("T", " ");

  const nameParts = (params.customerName || "Customer").trim().split(" ");
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "Customer";

  const payload = {
    order_id: params.orderNumber,
    order_date: dateStr,
    pickup_location: pickupLocation,
    channel_id: "",
    comment: `DIGITALWORLD Order ${params.orderNumber}`,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: params.deliveryAddress.line1,
    billing_address_2: params.deliveryAddress.line2 || "",
    billing_city: params.deliveryAddress.city,
    billing_pincode: params.deliveryAddress.pincode,
    billing_state: params.deliveryAddress.state,
    billing_country: "India",
    billing_email: params.customerEmail,
    billing_phone: params.customerPhone.replace(/\D/g, "").slice(-10) || "9999999999",
    shipping_is_billing: true,
    order_items: params.items.map((i, idx) => ({
      name: i.name,
      sku: i.sku || `SKU-${idx + 1}`,
      units: i.quantity,
      selling_price: i.unitPrice,
      discount: 0,
      tax: 0,
      hsn: i.hsnCode || 8424,
    })),
    payment_method: params.isCod ? "COD" : "Prepaid",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: params.orderValue,
    length: Math.max(1, params.lengthCm),
    breadth: Math.max(1, params.widthCm),
    height: Math.max(1, params.heightCm),
    weight: Math.max(0.1, Number((params.weightGrams / 1000).toFixed(2))), // kg
  };

  const res = await shiprocketRequest({
    method: "POST",
    endpoint: "/orders/create/adhoc",
    body: payload,
  });

  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error || "Failed to create order in Shiprocket",
    };
  }

  const orderId = res.data.order_id;
  const shipmentId = res.data.shipment_id;

  return {
    success: true,
    orderId,
    shipmentId,
    status: res.data.status,
    statusCode: res.data.status_code,
  };
}
