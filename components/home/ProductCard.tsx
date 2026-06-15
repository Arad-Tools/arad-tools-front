import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Package } from 'lucide-react';
import type { Product } from '@/lib/types';
import {
  formatToman, renderBadgeLabel, calcDiscount, toPersianDigits, cn,
} from '@/lib/utils';

interface Props {
  product: Product;
  priority?: boolean; // pass true for above-the-fold cards
}

export default function ProductCard({ product, priority = false }: Props) {
  const { label, className: badgeClass } = renderBadgeLabel(product.badge ?? '');
  const discount = calcDiscount(product.price, product.oldPrice);

  return (
    <article className="product-card group relative bg-white rounded-2xl border border-gray-100 shadow-product hover:shadow-product-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">

      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <Link href={`/product/${product.slug}`} className="block overflow-hidden bg-gray-50 aspect-square relative" tabIndex={-1} aria-hidden>
        <Image
          src={product.image || 'https://placehold.co/600x400?text=Loading'}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="product-img object-contain p-4 transition-transform duration-400"
          priority={priority}
        />
      </Link>

      {/* ── Badge Overlay ──────────────────────────────────────────────────── */}
      {product.badge && (
        <span
          className={cn(
            'absolute top-2.5 end-2.5 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10',
            badgeClass,
          )}
        >
          {label}
        </span>
      )}

      {/* ── Discount Percent ─────────────────────────────────────────────── */}
      {discount > 0 && (
        <span className="absolute top-2.5 start-2.5 text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full z-10">
          {toPersianDigits(discount)}٪
        </span>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">

        {/* Brand */}
        <span className="text-xs font-semibold text-gray-400 tracking-wide">
          {product.brand}
        </span>

        {/* Title */}
        <Link href={`/product/${product.slug}`} className="group/title">
          <h3 className="text-sm font-semibold text-gray-800 leading-relaxed line-clamp-2 group-hover/title:text-brand transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <div className="flex items-center gap-0.5" aria-label={`امتیاز ${toPersianDigits(product.rating.toFixed(1))} از ۵`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3 h-3',
                  i < Math.round(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200',
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            ({toPersianDigits(product.reviewsCount)})
          </span>
        </div>

        {/* Price block */}
        <div className="flex items-end justify-between mt-1">
          <div>
            {/* Old price — strikethrough */}
            {product.oldPrice && product.oldPrice > product.price && (
              <p className="text-xs text-gray-400 line-through mb-0.5">
                {formatToman(product.oldPrice)}
              </p>
            )}
            {/* Current price */}
            <p className="text-base font-black text-gray-900 leading-none">
              {formatToman(product.price)}
            </p>
          </div>

          {/* Out of stock indicator */}
          {product.inStock === false && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Package className="w-3 h-3" />
              ناموجود
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <button
          disabled={product.inStock === false}
          aria-label={`افزودن ${product.title} به سبد خرید`}
          className={cn(
            'mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
            product.inStock === false
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-brand/10 text-brand hover:bg-brand hover:text-white active:scale-95 focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-none',
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.inStock === false ? 'ناموجود' : 'افزودن به سبد'}
        </button>
      </div>
    </article>
  );
}
