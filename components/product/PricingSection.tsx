'use client';

import { cn } from '@/lib/utils';
import { formatToman, toPersianDigits } from '@/lib/utils';
import type { QuantityDiscount } from '@/lib/types';
import type { PricingResult } from '@/lib/product-pricing';

interface Props {
  basePrice: number;
  oldPrice?: number;
  discountPercent?: number;
  pricing: PricingResult;
  tiers: QuantityDiscount[];
}

export default function PricingSection({
  basePrice,
  oldPrice,
  discountPercent,
  pricing,
  tiers,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <p className="text-2xl sm:text-3xl font-black text-gray-900">
          {formatToman(pricing.unitPrice)}
        </p>
        {oldPrice && oldPrice > basePrice && (
          <p className="text-sm text-gray-400 line-through mb-1">
            {formatToman(oldPrice)}
          </p>
        )}
        {discountPercent && discountPercent > 0 && (
          <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full mb-1">
            {toPersianDigits(discountPercent)}٪ تخفیف
          </span>
        )}
      </div>

      {pricing.discountPercent > 0 && (
        <div className="bg-brand/5 border border-brand/15 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">قیمت واحد:</span>
            <span className="font-bold">{formatToman(pricing.unitPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">تعداد انتخابی:</span>
            <span className="font-bold">{toPersianDigits(pricing.quantity)}</span>
          </div>
          {pricing.activeTier && (
            <div className="flex justify-between text-brand">
              <span>تخفیف فعال:</span>
              <span className="font-bold">
                {toPersianDigits(pricing.activeTier.discountPercent)}٪ برای خرید {toPersianDigits(pricing.activeTier.minQuantity)} عدد یا بیشتر
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-brand/10 pt-2">
            <span className="text-gray-800 font-semibold">قیمت نهایی:</span>
            <span className="font-black text-lg text-gray-900">{formatToman(pricing.total)}</span>
          </div>
          {pricing.savings > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>صرفه‌جویی:</span>
              <span className="font-bold">{formatToman(pricing.savings)}</span>
            </div>
          )}
        </div>
      )}

      {tiers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="py-2.5 px-3 text-start font-semibold">حداقل تعداد</th>
                <th className="py-2.5 px-3 text-start font-semibold">تخفیف</th>
              </tr>
            </thead>
            <tbody>
              {tiers
                .sort((a, b) => a.minQuantity - b.minQuantity)
                .map((tier) => {
                  const isActive = pricing.activeTier?.minQuantity === tier.minQuantity;

                  return (
                    <tr
                      key={tier.minQuantity}
                      className={cn(
                        'border-t border-gray-50 transition-colors',
                        isActive && 'bg-brand/5 text-brand font-semibold',
                      )}
                    >
                      <td className="py-2.5 px-3">
                        {toPersianDigits(tier.minQuantity)} عدد و بیشتر
                      </td>
                      <td className="py-2.5 px-3">
                        {toPersianDigits(tier.discountPercent)}٪
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
