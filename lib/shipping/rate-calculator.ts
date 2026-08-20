/**
 * lib/shipping/rate-calculator.ts — Storefront Courier & Weight-Based Shipping Rules Engine
 */

export const GST_RATE = 0.18; // GST on goods (18%)

export interface CourierCharge {
  amount: number;
  isFree: boolean;
  isBulk: boolean;
  note?: string;
}

export interface ShippingRulesConfig {
  calculationMode?: "weight" | "quantity";
  
  // Weight-based rates (e.g. 1kg = ₹100, 2kg = ₹200, 3kg = ₹300)
  chargeUpTo1Kg?: number;
  chargeUpTo2Kg?: number;
  chargeUpTo3Kg?: number;
  chargeUpTo5Kg?: number;
  chargeAbove5KgPerKg?: number;
  ratePerKg?: number;
  minWeightCharge?: number;

  // Quantity-based rates (e.g. 1–10 pcs, 11–20 pcs)
  charge1to10?: number;
  charge11to20?: number;
  charge21to30?: number;
  freeThresholdQty?: number;

  // Cart amount free shipping
  freeShippingAboveAmount?: number;
}

/**
 * Courier charge calculation supporting weight slabs (1kg = ₹100, 2kg = ₹200, etc.)
 * or quantity slabs, configured dynamically in the Admin dashboard.
 */
export function getCourierCharge(
  totalWeightGrams: number = 0,
  totalQuantity: number = 1,
  config?: ShippingRulesConfig,
  cartSubtotal: number = 0
): CourierCharge {
  if (totalQuantity <= 0) return { amount: 0, isFree: true, isBulk: false };

  // Free shipping above cart value (if configured > 0)
  if (
    config?.freeShippingAboveAmount &&
    config.freeShippingAboveAmount > 0 &&
    cartSubtotal >= config.freeShippingAboveAmount
  ) {
    return {
      amount: 0,
      isFree: true,
      isBulk: false,
      note: `Free Shipping (Orders above ₹${config.freeShippingAboveAmount.toLocaleString("en-IN")})`,
    };
  }

  const calculationMode = config?.calculationMode ?? "weight";

  // 1. WEIGHT-BASED SLAB CALCULATION (1kg = ₹100, 2kg = ₹200, etc.)
  if (calculationMode === "weight") {
    const weightKg = Math.max(0.1, totalWeightGrams / 1000);
    const ceilKg = Math.ceil(weightKg);

    const charge1Kg = Number(config?.chargeUpTo1Kg ?? 100);
    const charge2Kg = Number(config?.chargeUpTo2Kg ?? 200);
    const charge3Kg = Number(config?.chargeUpTo3Kg ?? 300);
    const charge5Kg = Number(config?.chargeUpTo5Kg ?? 500);
    const ratePerExtraKg = Number(config?.chargeAbove5KgPerKg ?? config?.ratePerKg ?? 100);

    let amount = 0;
    if (ceilKg <= 1) {
      amount = charge1Kg;
    } else if (ceilKg === 2) {
      amount = charge2Kg;
    } else if (ceilKg === 3) {
      amount = charge3Kg;
    } else if (ceilKg <= 5) {
      amount = charge5Kg;
    } else {
      const extraKg = ceilKg - 5;
      amount = charge5Kg + extraKg * ratePerExtraKg;
    }

    // Bulk freight note for exceptionally heavy industrial cargo (> 50kg)
    if (ceilKg > 50) {
      return {
        amount,
        isFree: false,
        isBulk: true,
        note: `Heavy Industrial Cargo (${weightKg.toFixed(1)} KG)`,
      };
    }

    return {
      amount,
      isFree: false,
      isBulk: false,
      note: `Standard Shipping (${weightKg.toFixed(1)} KG)`,
    };
  }

  // 2. QUANTITY-BASED SLAB CALCULATION (Fallback)
  const c1to10 = Number(config?.charge1to10 ?? 100);
  const c11to20 = Number(config?.charge11to20 ?? 200);
  const c21to30 = Number(config?.charge21to30 ?? 300);
  const freeQty = Number(config?.freeThresholdQty ?? 31);

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

export function getGSTAmount(subtotal: number): number {
  return Math.round(subtotal * GST_RATE * 100) / 100;
}
