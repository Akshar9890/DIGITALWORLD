/**
 * lib/shipping.ts — Shared Courier/Shipping Charge
 *
 * Single source of truth for courier charges.
 * Business Rule:
 * Shipping cost is applied for 1 pc to 50 pcs.
 * For bulk orders (> 50 pcs), shipping charge will be communicated by the team (0 charge at checkout).
 */

export const COURIER_RATE_PER_KG = 50; // ₹50 per kg
export const MIN_SHIPPING_CHARGE = 100; // Minimum ₹100
export const GST_RATE = 0.18; // GST on goods (18%)

export interface CourierCharge {
  amount: number;
  isFree: boolean;
  isBulk: boolean;
  note?: string;
}

/**
 * Courier charge for a given total shipment weight and quantity.
 * Business Rules:
 * - 1 to 10 pcs: ₹100
 * - 11 to 20 pcs: ₹200
 * - 21 to 30 pcs: ₹300
 * - 31 to 100 pcs: Free Shipping (₹0)
 * - Bulk orders (>100 pcs): Shipping quoted by team
 */
export interface ShippingRulesConfig {
  charge1to10?: number;
  charge11to20?: number;
  charge21to30?: number;
  freeThresholdQty?: number;
}

/**
 * Courier charge for a given total shipment weight and quantity.
 * Supports configurable rates set by Admin.
 */
export function getCourierCharge(
  totalWeightGrams: number = 0,
  totalQuantity: number = 1,
  config?: ShippingRulesConfig
): CourierCharge {
  if (totalQuantity <= 0) return { amount: 0, isFree: true, isBulk: false };

  const c1to10 = config?.charge1to10 ?? 100;
  const c11to20 = config?.charge11to20 ?? 200;
  const c21to30 = config?.charge21to30 ?? 300;
  const freeQty = config?.freeThresholdQty ?? 31;

  if (totalQuantity > 100) {
    return {
      amount: 0,
      isFree: true,
      isBulk: true,
      note: "Bulk order (Shipping quoted by team)",
    };
  }

  if (totalQuantity >= freeQty) {
    return {
      amount: 0,
      isFree: true,
      isBulk: false,
      note: `Free Shipping (${freeQty}+ PCS)`,
    };
  }

  if (totalQuantity >= 21) {
    return { amount: c21to30, isFree: false, isBulk: false };
  }

  if (totalQuantity >= 11) {
    return { amount: c11to20, isFree: false, isBulk: false };
  }

  return { amount: c1to10, isFree: false, isBulk: false };
}


/**
 * GST amount on goods (18% flat).
 */
export function getGSTAmount(subtotal: number): number {
  return Math.round(subtotal * GST_RATE * 100) / 100;
}
