import type { QuantityDiscount } from './types';

export interface PricingResult {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountPercent: number;
  activeTier: QuantityDiscount | null;
  savings: number;
  total: number;
}

export function getActiveDiscountTier(
  quantity: number,
  tiers: QuantityDiscount[],
): QuantityDiscount | null {
  if (!tiers.length || quantity < 1) {
    return null;
  }

  const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);

  return sorted.find((tier) => quantity >= tier.minQuantity) ?? null;
}

export function calculateProductPricing(
  basePrice: number,
  quantity: number,
  tiers: QuantityDiscount[],
): PricingResult {
  const qty = Math.max(1, quantity);
  const subtotal = basePrice * qty;
  const activeTier = getActiveDiscountTier(qty, tiers);
  const discountPercent = activeTier?.discountPercent ?? 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;
  const unitPrice = Math.round(total / qty);

  return {
    unitPrice,
    quantity: qty,
    subtotal,
    discountPercent,
    activeTier,
    savings: discountAmount,
    total,
  };
}

export function clampQuantity(
  value: number,
  min = 1,
  max?: number,
): number {
  const clamped = Math.max(min, Math.floor(value));

  if (max != null && max > 0) {
    return Math.min(clamped, max);
  }

  return clamped;
}
