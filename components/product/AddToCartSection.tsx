'use client';

import { useState } from 'react';
import { ShoppingCart, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/stores/cart-context';
import type { ProductDetail } from '@/lib/types';

interface Props {
  product: ProductDetail;
  quantity: number;
  finalPrice: number;
}

export default function AddToCartSection({ product, quantity, finalPrice }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: finalPrice / quantity,
    }, quantity);

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-bold transition-all active:scale-[0.98]',
          added
            ? 'bg-emerald-600 text-white'
            : 'bg-brand text-white hover:bg-brand-700 shadow-lg shadow-brand/25',
        )}
      >
        {added ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            به سبد خرید اضافه شد
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            افزودن به سبد خرید
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all"
      >
        <Zap className="w-4 h-4" />
        خرید فوری
      </button>
    </div>
  );
}
