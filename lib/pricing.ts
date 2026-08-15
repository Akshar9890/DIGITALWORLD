/**
 * lib/pricing.ts — Price Resolution Engine
 *
 * Single source of truth for pricing used by:
 *  - Product page display (server component)
 *  - Cart calculation (API route)
 *  - Instant Quotation generation (API route)
 *  - Checkout (API route + webhook)
 *
 * RULE: Client-submitted prices are NEVER trusted.
 *       This function is always called server-side.
 *
 * B2C RULE: Quantity-tier pricing applies to EVERYONE (retail included).
 *           CART, QUOTATION and CHECKOUT all use getPriceForQuantity() /
 *           resolvePrice() so a quotation can never disagree with checkout.
 */

import { PricingTier, ProductPrice, UserRole } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { db } from "@/lib/db";

const prisma = db;

export interface PricingContext {
  role: UserRole;
  assignedTierId?: string | null;
}

export interface PriceResult {
  unitPrice: number;           // INR, per unit
  tierId: string;
  tierName: string;
  quantity: number;
  subtotal: number;
}

export interface TierDisplay {
  tierId: string;
  tierName: string;
  minQty: number;
  maxQty: number | null;
  pricePerUnit: number;
  isRetail: boolean;
  isActive: boolean;           // highlighted if current qty falls in this tier
}

export interface TierLike {
  tierId: string;
  tierName: string;
  minQty: number;
  maxQty: number | null;
  pricePerUnit: number;
}

/**
 * The shared B2C quantity-pricing function.
 * Given any set of quantity tiers and a quantity, returns the applied tier
 * (the largest tier whose range contains the quantity), or null if none match.
 *
 * CART, QUOTATION and CHECKOUT all use this exact function (or its server
 * equivalent resolvePrice) so pricing can never drift between screens.
 */
export function getPriceForQuantity(
  tiers: TierLike[],
  quantity: number
): TierLike | null {
  if (!tiers || tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);

  const match = sorted
    .filter(
      (t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty)
    )
    .pop(); // last match = the largest tier that fits

  return match || null;
}

/**
 * Returns the next (cheaper) tier the customer can unlock by increasing
 * quantity. Used for the "Add 1 more piece and unlock ₹X/PCS!" nudge.
 */
export function getNextTierUnlock(
  tiers: TierLike[],
  quantity: number
): TierLike | null {
  if (!tiers || tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  return sorted.find((t) => t.minQty > quantity) || null;
}

/**
 * Standard (undiscounted) per-unit price for a product — the cheapest
 * base tier (normally the retail / lowest-quantity tier). Used to show
 * "Standard Price: ₹300/PCS → Applied Price: ₹275/PCS" discount transparency.
 */
export function getStandardPrice(
  tiers: TierLike[]
): number | null {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  return sorted[0].pricePerUnit;
}

export interface TierUnlockHint {
  piecesToUnlock: number;
  tier: TierLike;
}

/**
 * Nudge shown when the customer is a few pieces away from a cheaper tier,
 * e.g. "Add 1 more piece and unlock ₹275/PCS!". Returns null when the next
 * tier is too far away (>3 pieces) so the hint never feels like nagging.
 */
export function getNextTierHint(
  tiers: TierLike[],
  quantity: number
): TierUnlockHint | null {
  const next = getNextTierUnlock(tiers, quantity);
  if (!next) return null;

  const piecesToUnlock = next.minQty - quantity;
  if (piecesToUnlock > 3) return null;

  return { piecesToUnlock, tier: next };
}

/**
 * Resolve the correct unit price for a given product + quantity + buyer context.
 *
 * B2C: quantity tiers apply to every buyer (retail included).
 * B2B: wholesale_approved buyers may additionally benefit from their
 *      assigned company tier if it is more favorable than the qty match.
 */
export async function resolvePrice(
  productId: string,
  quantity: number,
  context: PricingContext
): Promise<PriceResult> {
  const { role, assignedTierId } = context;

  // Fetch all prices for this product
  const productPrices = await prisma.productPrice.findMany({
    where: { productId },
    include: { tier: true },
    orderBy: { tier: { minQty: "asc" } },
  });

  if (productPrices.length === 0) {
    throw new Error(`No pricing found for product ${productId}`);
  }

  // B2C + B2B: match quantity to the tier range (everyone gets bulk discounts)
  let matched = getPriceForQuantity(
    productPrices.map((p) => ({
      tierId: p.tierId,
      tierName: p.tier.name,
      minQty: p.tier.minQty,
      maxQty: p.tier.maxQty,
      pricePerUnit: Number(p.pricePerUnit),
    })),
    quantity
  );

  // Wholesale: if company has an assigned tier, use it IF it gives a better (lower) price
  if (role === "wholesale_approved" && assignedTierId) {
    const assignedPrice = productPrices.find((p) => p.tierId === assignedTierId);
    if (
      assignedPrice &&
      (!matched || Number(assignedPrice.pricePerUnit) < matched.pricePerUnit)
    ) {
      matched = {
        tierId: assignedPrice.tierId,
        tierName: assignedPrice.tier.name,
        minQty: assignedPrice.tier.minQty,
        maxQty: assignedPrice.tier.maxQty,
        pricePerUnit: Number(assignedPrice.pricePerUnit),
      };
    }
  }

  // Fallback to the first (cheapest base) tier if nothing matched
  const chosen = matched || {
    tierId: productPrices[0].tierId,
    tierName: productPrices[0].tier.name,
    minQty: productPrices[0].tier.minQty,
    maxQty: productPrices[0].tier.maxQty,
    pricePerUnit: Number(productPrices[0].pricePerUnit),
  };

  return {
    unitPrice: chosen.pricePerUnit,
    tierId: chosen.tierId,
    tierName: chosen.tierName,
    quantity,
    subtotal: chosen.pricePerUnit * quantity,
  };
}

/**
 * Get the full tier table for display on the product page.
 * B2C: the complete bulk-pricing ladder is shown to every visitor.
 */
export async function getTierTable(
  productId: string,
  _context?: PricingContext,
  currentQty: number = 1
): Promise<TierDisplay[]> {
  const productPrices = await prisma.productPrice.findMany({
    where: { productId },
    include: { tier: true },
    orderBy: { tier: { minQty: "asc" } },
  });

  return productPrices.map((p) => {
    const t = p.tier;
    const isActive =
      currentQty >= t.minQty && (t.maxQty === null || currentQty <= t.maxQty);
    return {
      tierId: p.tierId,
      tierName: t.name,
      minQty: t.minQty,
      maxQty: t.maxQty,
      pricePerUnit: Number(p.pricePerUnit),
      isRetail: t.isRetail,
      isActive,
    };
  });
}

/**
 * Resolve price without DB (used client-side for preview only).
 * Pass in pre-fetched tiers. Server always recalculates.
 */
export function resolveClientPreviewPrice(
  tiers: TierDisplay[],
  quantity: number
): TierDisplay | null {
  const match = getPriceForQuantity(tiers, quantity);
  if (!match) return null;
  return {
    ...match,
    isRetail: tiers.find((t) => t.tierId === match.tierId)?.isRetail ?? false,
    isActive: true,
  };
}
