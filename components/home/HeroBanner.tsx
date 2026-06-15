'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroBannerItem } from '@/lib/types';
import { toPersianDigits } from '@/lib/utils';

interface Props {
  banners: HeroBannerItem[];
}

// Fallback banner shown when no banners are returned from API
const FALLBACK_BANNER: HeroBannerItem = {
  id: 'fallback',
  title: 'ابزار حرفه‌ای برای کار حرفه‌ای',
  subtitle: 'بهترین برندهای جهانی با قیمت رقابتی و ارسال سریع سراسر ایران',
  image: '',
  ctaText: 'مشاهده محصولات',
  ctaLink: '/products',
  badge: 'تخفیف تا ۳۰٪',
  bgGradient: '',
};

export default function HeroBanner({ banners }: Props) {
  const items = banners.length > 0 ? banners : [FALLBACK_BANNER];
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % items.length),
    [items.length],
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + items.length) % items.length),
    [items.length],
  );

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, items.length]);

  const banner = items[current];

  return (
    <section
      className="relative overflow-hidden bg-navy-900 select-none"
      aria-label="بنر اصلی"
      aria-roledescription="اسلایدر"
    >
      {/* ── Gradient Background ─────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 bg-gradient-to-l transition-all duration-700 ${
          banner.bgGradient || 'from-navy-950 via-navy-900 to-navy-800'
        }`}
        style={{ opacity: 0.97 }}
        aria-hidden
      />

      {/* ── Decorative grid overlay ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px)',
        }}
        aria-hidden
      />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="relative container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center min-h-[320px] md:min-h-[420px] py-12 md:py-0 gap-8">

          {/* Text — right side in RTL */}
          <div className="flex-1 text-white text-center md:text-right">
            {banner.badge && (
              <span className="inline-block bg-brand text-white text-xs font-bold px-3 py-1 rounded-full mb-4 shadow">
                {banner.badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-snug mb-4 text-shadow">
              {banner.title}
            </h1>
            <p className="text-gray-300 text-base md:text-lg mb-8 max-w-md md:max-w-none leading-loose">
              {banner.subtitle}
            </p>
            <Link
              href={banner.ctaLink}
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-brand/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {banner.ctaText}
              {/* Arrow points LEFT in RTL (forward direction) */}
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Visual / Image — left side in RTL */}
          <div className="flex-shrink-0 md:w-80 lg:w-96">
            <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl aspect-[4/3]">
              {banner.image ? (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="object-cover"
                  priority={current === 0}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/40">
                    <div className="text-7xl mb-2">🔧</div>
                    <div className="text-sm font-medium">ابزار حرفه‌ای</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Prev / Next Buttons ─────────────────────────────────────────────── */}
      {items.length > 1 && (
        <>
          {/* In RTL: "previous" slide is on the LEFT, "next" is on the RIGHT */}
          <button
            onClick={prev}
            className="absolute top-1/2 -translate-y-1/2 start-3 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="اسلاید قبلی"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 end-3 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="اسلاید بعدی"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Dot Indicators ─────────────────────────────────────────────────── */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10" role="tablist">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setCurrent(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`اسلاید ${toPersianDigits(i + 1)}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-brand' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
