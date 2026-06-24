'use client';

import { ShoppingCart } from 'lucide-react';
import { formatToman } from '@/lib/utils';
import { useCart } from '@/lib/stores/cart-context';
import QuantitySelector from './QuantitySelector';
import type { ProductDetail } from '@/lib/types';

interface Props {
  product: ProductDetail;
  quantity: number;
  onQuantityChange: (q: number) => void;
  finalTotal: number;
  maxQuantity?: number;
  canPurchase: boolean;
}

export default function MobileStickyBar({
  product,
  quantity,
  onQuantityChange,
  finalTotal,
  maxQuantity,
  canPurchase,
}: Props) {
  const { addItem } = useCart();

  if (!canPurchase) return null;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: finalTotal / quantity,
    }, quantity);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 safe-area-pb">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <p className="text-xs text-gray-500 mb-0.5">قیمت نهایی</p>
          <p className="text-base font-black text-gray-900">{formatToman(finalTotal)}</p>
        </div>

        <QuantitySelector
          quantity={quantity}
          onChange={onQuantityChange}
          max={maxQuantity}
          size="sm"
        />

        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-white font-bold text-sm active:scale-[0.98] transition-transform"
        >
          <ShoppingCart className="w-4 h-4" />
          افزودن به سبد
        </button>
      </div>
    </div>
  );
}
