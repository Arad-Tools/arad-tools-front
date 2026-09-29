'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Star,
  MapPin,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { fetchSellers } from '@/lib/ecommerce-api';
import type { Seller } from '@/lib/types';
import { formatRating, toPersianDigits } from '@/lib/utils';

export default function SellersDirectoryPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers()
      .then((data) => setSellers(data || []))
      .catch((err) => {
        console.error('Failed to fetch sellers:', err);
        setSellers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-navy via-slate-900 to-navy text-white p-8 sm:p-12 mb-10 overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
              <span>بازارگاه تخصصی ابزار و تجهیزات صنعتی</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight">
              غرفه‌ها و فروشندگان معتبر آراد ابزار
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              تأمین‌کنندگان مستقیم، واردکنندگان رسمی و معتبرترین فروشگاه‌های ابزارآلات در سراسر کشور با ضمانت اصالت کالا و ارسال سریع در کنار شما هستند.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard?tab=seller"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <Store className="w-4 h-4" />
                <span>ثبت نام و افتتاح غرفه فروشنده</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sellers Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-brand" />
              <span>تمام فروشندگان فعال ({toPersianDigits(sellers.length)})</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-white animate-pulse border border-gray-100 p-6" />
              ))}
            </div>
          ) : sellers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-base mb-1">فروشگاهی یافت نشد</h3>
              <p className="text-gray-400 text-xs mb-6">
                شما می‌توانید اولین فروشنده رسمی در این بازارگاه تخصصی باشید!
              </p>
              <Link
                href="/dashboard?tab=seller"
                className="px-6 py-2.5 bg-brand text-white font-bold rounded-xl text-xs inline-flex items-center gap-2"
              >
                <span>شروع به عنوان فروشنده</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 relative overflow-hidden">
                        {seller.logo ? (
                          <Image
                            src={seller.logo}
                            alt={seller.storeName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Store className="w-7 h-7" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Link
                            href={`/seller/${seller.slug}`}
                            className="font-black text-gray-900 text-base hover:text-brand transition-colors block truncate"
                          >
                            {seller.storeName}
                          </Link>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{formatRating(seller.rating)}</span>
                          <span className="text-gray-400 font-normal">امتیاز رضایت</span>
                        </div>
                      </div>
                    </div>

                    {seller.description && (
                      <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                        {seller.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-50">
                      {seller.address && (
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{seller.address}</span>
                        </div>
                      )}
                      {seller.phone && (
                        <div className="flex items-center gap-2" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-mono">{seller.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      فروشنده تایید شده
                    </span>
                    <Link
                      href={`/seller/${seller.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                    >
                      <span>مشاهده محصولات</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
