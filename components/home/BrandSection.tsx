import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import type { BrandSectionProps } from '@/lib/types';
import { toPersianDigits } from '@/lib/utils';

export default function BrandSection({ brands }: BrandSectionProps) {
  if (brands.length === 0) return null;

  return (
    <section className="bg-white py-12 border-t border-gray-100" aria-label="برندهای معتبر">
      <div className="container mx-auto px-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-navy-800 flex-shrink-0" aria-hidden />
            <div>
              <p className="text-xs font-medium text-gray-400 mb-0.5">تامین‌کنندگان رسمی</p>
              <h2 className="text-lg font-black text-gray-900">برندهای معتبر جهانی</h2>
            </div>
          </div>
          <Link
            href="/brands"
            className="flex items-center gap-1 text-sm font-semibold text-navy-800 hover:text-brand transition-colors"
          >
            همه برندها
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Brand Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="group flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-brand/30 hover:bg-orange-50 hover:shadow-md transition-all duration-200 active:scale-95"
              aria-label={`${brand.name} — ${toPersianDigits(brand.productCount ?? 0)} محصول`}
            >
              {/* Logo container */}
              <div className="relative w-full aspect-[2/1] flex items-center justify-center">
                <Image
                  src={brand.logo || 'https://placehold.co/140x70/f8f9fa/1a2e44?text=Brand'}
                  alt={`لوگوی ${brand.name}`}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Brand name */}
              <span className="text-xs font-bold text-gray-600 group-hover:text-brand transition-colors">
                {brand.name}
              </span>

              {/* Product count */}
              {brand.productCount && (
                <span className="text-[10px] text-gray-400">
                  {toPersianDigits(brand.productCount)} محصول
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
