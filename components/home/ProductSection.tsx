'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import ProductCard from './ProductCard';
import type { ProductSectionProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  highlight = false,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // In RTL, scrollLeft can be negative or positive depending on browser implementation.
    // Normalized check:
    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = Math.abs(el.scrollLeft);

    setCanScrollRight(current > 5);
    setCanScrollLeft(current < maxScroll - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, products]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 300;
    // In RTL, moving forward (towards end/leftmost) is scrollLeft - 300 (or + depending on browser)
    const sign = direction === 'left' ? -1 : 1;
    el.scrollBy({ left: sign * scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  if (products.length === 0) return null;

  return (
    <section
      className={cn(
        'rounded-2xl overflow-hidden relative',
        highlight ? 'bg-gradient-to-l from-orange-50 via-amber-50/50 to-orange-50 border border-orange-200/80 p-5 shadow-sm' : 'py-2',
      )}
      aria-label={title}
    >
      {/* ── Section Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Accent bar */}
          <div className={cn('w-1.5 h-7 rounded-full flex-shrink-0', highlight ? 'bg-brand shadow-sm shadow-brand/40' : 'bg-navy-800')} aria-hidden />
          <div>
            {subtitle && (
              <p className="text-xs font-semibold text-gray-500 mb-0.5">{subtitle}</p>
            )}
            <h2 className={cn('text-lg font-black', highlight ? 'text-brand' : 'text-gray-900')}>
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Slider navigation arrows */}
          <div className="hidden sm:flex items-center gap-1.5 ms-2">
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="محصولات قبلی"
              className={cn(
                'w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm',
                canScrollRight
                  ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-60',
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="محصولات بعدی"
              className={cn(
                'w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm',
                canScrollLeft
                  ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-60',
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className={cn(
                'flex items-center gap-1 text-sm font-bold transition-all px-3 py-1 rounded-xl flex-shrink-0',
                highlight
                  ? 'text-brand hover:bg-brand/10'
                  : 'text-navy-800 hover:text-brand hover:bg-gray-100',
              )}
            >
              مشاهده همه
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Product Grid — Horizontal Scroll ────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-hide pb-3 pt-1 -mb-2 scroll-smooth"
        role="list"
        aria-label={`لیست ${title}`}
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            role="listitem"
            className="flex-shrink-0 w-44 sm:w-52 md:w-56 flex flex-col self-stretch"
          >
            <ProductCard product={product} priority={i < 3} />
          </div>
        ))}

        {/* ── "نمایش همه محصولات" Card ─────────────────────────────────────── */}
        {viewAllLink && (
          <div className="flex-shrink-0 w-44 sm:w-52 md:w-56 flex flex-col self-stretch">
            <Link
              href={viewAllLink}
              className="h-full min-h-[340px] flex flex-col items-center justify-center p-5 text-center rounded-2xl bg-gradient-to-b from-orange-50/90 via-white to-amber-50/70 border-2 border-brand/30 hover:border-brand hover:shadow-product-hover shadow-product transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
              aria-label={`مشاهده همه محصولات ${title}`}
            >
              {/* Subtle decorative background pattern */}
              <div className="absolute inset-0 bg-radial-at-c from-brand/5 to-transparent pointer-events-none" />

              {/* Circle Icon */}
              <div className="w-14 h-14 rounded-full bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110 mb-3 z-10">
                <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
              </div>

              {/* Title */}
              <span className="text-base font-black text-gray-900 group-hover:text-brand transition-colors mb-1.5 z-10 leading-snug">
                نمایش همه محصولات
              </span>

              {/* Subtitle */}
              <span className="text-xs text-gray-500 font-medium z-10 line-clamp-2">
                مشاهده آرشیو کامل {title}
              </span>

              {/* CTA Button Badge */}
              <div className="mt-4 px-4 py-1.5 rounded-xl bg-brand text-white text-xs font-bold group-hover:bg-brand-700 shadow-sm transition-all duration-200 z-10 flex items-center gap-1">
                <span>ورود به دسته</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
