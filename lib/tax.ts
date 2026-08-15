/**
 * lib/tax.ts — GST Calculation Engine
 *
 * Handles:
 *  - CGST + SGST for intra-state transactions
 *  - IGST for inter-state transactions
 *  - GST on goods + GST on shipping
 *  - Amount in words (Indian numbering: lakhs/crores)
 *
 * DEFAULT GST RATE: 18% (configurable per product HSN)
 */

export const DEFAULT_GST_RATE = 0.18; // 18%
export const SHIPPING_GST_RATE = 0.18; // 18% on shipping

export interface GSTBreakdown {
  taxableValue: number;
  isSameState: boolean;
  sellerState: string;
  buyerState: string;

  // Intra-state
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;

  // Inter-state
  igstRate: number;
  igstAmount: number;

  totalGST: number;
  totalWithGST: number;
}

export interface ShippingGST {
  shippingValue: number;
  shippingGST: number;
  totalShipping: number;
}

export interface InvoiceTotals {
  subtotal: number;
  goods: GSTBreakdown;
  shipping: ShippingGST;
  grandTotal: number;
  amountInWords: string;
}

/**
 * Compute GST for a given taxable amount.
 * Determines CGST+SGST vs IGST based on seller/buyer state.
 */
export function computeGST(
  taxableValue: number,
  sellerState: string,
  buyerState: string,
  gstRate: number = DEFAULT_GST_RATE
): GSTBreakdown {
  // Normalize state names for comparison
  const normalSeller = sellerState.trim().toLowerCase();
  const normalBuyer = buyerState.trim().toLowerCase();
  const isSameState = normalSeller === normalBuyer;

  const totalGSTAmount = roundToTwo(taxableValue * gstRate);

  if (isSameState) {
    // Intra-state: CGST (half) + SGST (half)
    const halfRate = gstRate / 2;
    const halfGST = roundToTwo(taxableValue * halfRate);
    return {
      taxableValue,
      isSameState: true,
      sellerState,
      buyerState,
      cgstRate: halfRate,
      cgstAmount: halfGST,
      sgstRate: halfRate,
      sgstAmount: halfGST,
      igstRate: 0,
      igstAmount: 0,
      totalGST: roundToTwo(halfGST + halfGST),
      totalWithGST: roundToTwo(taxableValue + halfGST + halfGST),
    };
  } else {
    // Inter-state: IGST (full rate)
    return {
      taxableValue,
      isSameState: false,
      sellerState,
      buyerState,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRate,
      igstAmount: totalGSTAmount,
      totalGST: totalGSTAmount,
      totalWithGST: roundToTwo(taxableValue + totalGSTAmount),
    };
  }
}

/**
 * Compute GST on shipping cost.
 */
export function computeShippingGST(shippingValue: number): ShippingGST {
  const gst = roundToTwo(shippingValue * SHIPPING_GST_RATE);
  return {
    shippingValue,
    shippingGST: gst,
    totalShipping: roundToTwo(shippingValue + gst),
  };
}

/**
 * Compute full invoice totals.
 */
export function computeInvoiceTotals(
  subtotal: number,
  shippingValue: number,
  sellerState: string,
  buyerState: string,
  gstRate: number = DEFAULT_GST_RATE
): InvoiceTotals {
  const goods = computeGST(subtotal, sellerState, buyerState, gstRate);
  const shipping = computeShippingGST(shippingValue);
  const grandTotal = roundToTwo(
    goods.totalWithGST + shipping.totalShipping
  );

  return {
    subtotal,
    goods,
    shipping,
    grandTotal,
    amountInWords: amountToWords(grandTotal),
  };
}

// ─── Shipping calculation ──────────────────────────────────────────────────

export interface ShippingCalculation {
  weightKg: number;
  ratePerKg: number;
  rawCost: number;
  appliedCost: number;  // After free threshold check
  isFree: boolean;
  gst: number;
  total: number;
}

import { getCourierCharge } from "./shipping";

export function calculateShipping(
  weightGrams: number,
  _orderValue: number = 0,
  _ratePerKg: number = 50,
  _minCharge: number = 100,
  _freeThreshold: number | null = null,
  _isB2B: boolean = false,
  quantity: number = 1
): ShippingCalculation {
  const courier = getCourierCharge(weightGrams, quantity);
  const appliedCost = courier.amount;
  const isFree = courier.isFree;
  const gst = roundToTwo(appliedCost * SHIPPING_GST_RATE);

  return {
    weightKg: weightGrams / 1000,
    ratePerKg: 0,
    rawCost: appliedCost,
    appliedCost,
    isFree,
    gst,
    total: roundToTwo(appliedCost + gst),
  };
}

// ─── Amount in Words (Indian numbering system) ─────────────────────────────

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function numToWords(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n] + " ";
  if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
  if (n < 1000)
    return ones[Math.floor(n / 100)] + " Hundred " + numToWords(n % 100);
  if (n < 100000)
    return numToWords(Math.floor(n / 1000)) + "Thousand " + numToWords(n % 1000);
  if (n < 10000000)
    return numToWords(Math.floor(n / 100000)) + "Lakh " + numToWords(n % 100000);
  return (
    numToWords(Math.floor(n / 10000000)) + "Crore " + numToWords(n % 10000000)
  );
}

export function amountToWords(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paiseRaw = Math.round((rounded - rupees) * 100);

  let result = "Rupees ";
  if (rupees === 0) {
    result += "Zero ";
  } else {
    result += numToWords(rupees).trim() + " ";
  }

  if (paiseRaw > 0) {
    result += `and ${numToWords(paiseRaw).trim()} Paise `;
  }

  return result.trim() + " Only";
}

// ─── Utilities ─────────────────────────────────────────────────────────────

export function roundToTwo(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}
