import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
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
  if (products.length === 0) return null;

  return (
    <section
      className={cn(
        'rounded-2xl overflow-hidden',
        highlight ? 'bg-gradient-to-l from-orange-50 to-amber-50 border border-orange-100 p-4' : '',
      )}
      aria-label={title}
    >
      {/* ── Section Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Accent bar */}
          <div className={cn('w-1 h-7 rounded-full flex-shrink-0', highlight ? 'bg-brand' : 'bg-navy-800')} aria-hidden />
          <div>
            {subtitle && (
              <p className="text-xs font-medium text-gray-400 mb-0.5">{subtitle}</p>
            )}
            <h2 className={cn('text-lg font-black', highlight ? 'text-brand' : 'text-gray-900')}>
              {title}
            </h2>
          </div>
        </div>

        {viewAllLink && (
          <Link
            href={viewAllLink}
            className={cn(
              'flex items-center gap-1 text-sm font-semibold transition-colors flex-shrink-0',
              highlight
                ? 'text-brand hover:text-brand-700'
                : 'text-navy-800 hover:text-brand',
            )}
          >
            مشاهده همه
            {/* Arrow points left (forward) in RTL */}
            <ChevronLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* ── Product Grid — Horizontal Scroll ────────────────────────────── */}
      {/* 
        RTL scroll: overflow-x-auto with flex row.
        dir="rtl" on parent means scroll starts from the right,
        so first product (index 0) appears on the far right — natural for Persian users.
      */}
      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mb-2"
        role="list"
        aria-label={`لیست ${title}`}
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            role="listitem"
            className="flex-shrink-0 w-44 sm:w-52 md:w-56"
          >
            <ProductCard product={product} priority={i < 3} />
          </div>
        ))}

        {/* "View all" card at the end (leftmost in RTL) */}
        {viewAllLink && (
          <div className="flex-shrink-0 w-40 sm:w-44">
            <Link
              href={viewAllLink}
              className="h-full min-h-[260px] flex flex-col items-center justify-center gap-2 bg-gray-50 border border-gray-200 border-dashed rounded-2xl text-gray-400 hover:text-brand hover:border-brand hover:bg-orange-50 transition-all duration-200 p-4 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-brand/10 flex items-center justify-center transition-colors">
                <ChevronLeft className="w-5 h-5 group-hover:text-brand" />
              </div>
              <span className="text-sm font-semibold text-center leading-relaxed">
                مشاهده<br />همه محصولات
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
