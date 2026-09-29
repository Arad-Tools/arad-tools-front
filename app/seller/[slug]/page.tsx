'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Package,
  ArrowRight,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { fetchSellerBySlug } from '@/lib/ecommerce-api';
import type { Product, Seller } from '@/lib/types';
import ProductCard from '@/components/home/ProductCard';
import { formatRating, toPersianDigits } from '@/lib/utils';

export default function SellerProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    fetchSellerBySlug(slug)
      .then((res) => {
        setSeller(res.seller);
        setProducts(res.products || []);
      })
      .catch((err) => {
        setError(err.message || 'فروشگاه یافت نشد.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-10">
        <div className="container mx-auto px-4 max-w-6xl space-y-6">
          <div className="h-64 rounded-3xl bg-white animate-pulse border border-gray-100" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-white animate-pulse border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-16 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-gray-100 shadow-sm mx-4">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">فروشگاه مورد نظر پیدا نشد</h1>
          <p className="text-gray-500 text-xs sm:text-sm mb-6">
            ممکن است نشانی فروشگاه تغییر کرده باشد یا فعالیت این غرفه موقتاً متوقف شده باشد.
          </p>
          <Link
            href="/sellers"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-700 transition-colors"
          >
            <span>مشاهده همه فروشندگان</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-10">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            خانه
          </Link>
          <span>/</span>
          <Link href="/sellers" className="hover:text-gray-600 transition-colors">
            فروشندگان
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">{seller.storeName}</span>
        </div>

        {/* Seller Profile Banner */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-28 sm:h-36 bg-gradient-to-r from-navy via-slate-800 to-amber-700 relative" />

          <div className="px-6 sm:px-10 pb-8 relative -mt-12 sm:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-2 shadow-lg border border-gray-100 relative overflow-hidden flex-shrink-0">
                  <div className="w-full h-full rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 relative overflow-hidden">
                    {seller.logo ? (
                      <Image
                        src={seller.logo}
                        alt={seller.storeName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Store className="w-12 h-12" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                      {seller.storeName}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      فروشنده تایید شده
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{formatRating(seller.rating)}</span>
                      <span className="text-gray-400 font-normal">رضایت خریداران</span>
                    </div>
                    {seller.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{seller.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تضمین اصالت کالا</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-700 font-medium">
                  <Truck className="w-4 h-4 text-brand" />
                  <span>ارسال ایمن و سریع</span>
                </div>
              </div>
            </div>

            {/* Description & Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs sm:text-sm">
              <div className="md:col-span-2 space-y-2">
                <h3 className="font-bold text-gray-800">درباره این فروشگاه:</h3>
                <p className="text-gray-600 leading-relaxed">
                  {seller.description || 'تأمین‌کننده و توزیع‌کننده تخصصی در بستر بازارگاه آراد ابزار.'}
                </p>
              </div>

              <div className="bg-gray-50/70 p-4 rounded-2xl space-y-2 border border-gray-100 text-xs">
                <h4 className="font-bold text-gray-800 mb-2">اطلاعات ارتباطی:</h4>
                {seller.phone && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>شماره تماس:</span>
                    <span className="font-mono font-bold" dir="ltr">{seller.phone}</span>
                  </div>
                )}
                {seller.email && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>ایمیل:</span>
                    <span className="font-mono" dir="ltr">{seller.email}</span>
                  </div>
                )}
                {seller.contactName && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>مسئول غرفه:</span>
                    <span className="font-medium text-gray-800">{seller.contactName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand" />
              <span>محصولات این غرفه ({toPersianDigits(products.length)})</span>
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-sm mb-1">
                درحال حاضر کالایی در این غرفه درج نشده است
              </h3>
              <p className="text-gray-400 text-xs">
                به‌زودی محصولات جدید این فروشنده بارگذاری خواهد شد.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
