'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  RotateCcw,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import ShopShell from '@/components/layout/ShopShell';
import { trackOrderApi } from '@/lib/ecommerce-api';
import type { Order } from '@/lib/types';
import { formatToman, toPersianDigits } from '@/lib/utils';

function ResultContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') ?? '';
  const status = searchParams.get('status') ?? 'success';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));

  useEffect(() => {
    if (orderNumber) {
      trackOrderApi(orderNumber)
        .then((res) => setOrder(res.order))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  const isSuccess = status === 'success';

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8 text-center">
        {/* Status Icon */}
        <div className="mb-6 flex justify-center">
          {isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-bounce-short">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-black text-navy-900 mb-2">
          {isSuccess ? 'سفارش شما با موفقیت ثبت و پرداخت شد!' : 'پرداخت با خطا مواجه شد'}
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
          {isSuccess
            ? 'از اعتماد و خرید شما سپاسگزاریم. سفارش شما جهت بسته‌بندی و ارسال به انبار ارسال گردید.'
            : 'تراکنش پرداخت تکمیل نشد. در صورت کسر وجه از حساب، مبلغ ظرف ۷۲ ساعت توسط بانک بازگشت داده خواهد شد.'}
        </p>

        {/* Order Details Card */}
        {orderNumber && (
          <div className="bg-gray-50/80 rounded-2xl p-6 mb-8 text-right space-y-3.5 border border-gray-100">
            <div className="flex justify-between items-center text-sm pb-2.5 border-b border-gray-200/60">
              <span className="text-gray-500">شماره سفارش:</span>
              <span className="font-mono font-bold text-gray-900 select-all" dir="ltr">
                {orderNumber}
              </span>
            </div>

            {order && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">وضعیت سفارش:</span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {order.statusLabel}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">مبلغ پرداخت شده:</span>
                  <span className="font-extrabold text-brand">
                    {formatToman(order.totalAmount)}
                  </span>
                </div>

                {order.shippingAddress && (
                  <div className="pt-2 text-xs text-gray-500 leading-relaxed border-t border-gray-200/60">
                    <span className="block font-medium text-gray-700 mb-0.5">آدرس تحویل:</span>
                    <span>
                      {order.shippingAddress.province}، {order.shippingAddress.city}، {order.shippingAddress.address}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isSuccess ? (
            <>
              <Link
                href="/dashboard"
                className="btn-primary py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <Package className="w-4 h-4" />
                مشاهده در سفارش‌های من
              </Link>
              <Link
                href="/products"
                className="py-3 px-6 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                بازگشت به فروشگاه
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/checkout"
                className="btn-primary py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                تلاش مجدد برای پرداخت
              </Link>
              <Link
                href="/cart"
                className="py-3 px-6 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                بازگشت به سبد خرید
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <ShopShell>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-20 text-center text-gray-500">
            در حال بارگذاری نتیجه پرداخت...
          </div>
        }
      >
        <ResultContent />
      </Suspense>
    </ShopShell>
  );
}
