'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { trackOrder } from '@/lib/ecommerce-api';
import type { Order } from '@/lib/types';
import { formatToman, toPersianDigits } from '@/lib/utils';

const STEPS = [
  { key: 'pending_payment', label: 'در انتظار پرداخت', icon: CreditCard },
  { key: 'processing', label: 'در حال پردازش', icon: Package },
  { key: 'shipped', label: 'ارسال شده', icon: Truck },
  { key: 'delivered', label: 'تحویل داده شده', icon: CheckCircle2 },
];

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('لطفاً شماره سفارش را وارد کنید.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await trackOrder(orderNumber.trim(), mobile.trim() || undefined);
      setOrder(res.order);
    } catch (err: any) {
      setOrder(null);
      setError(err.message || 'سفارشی با این مشخصات یافت نشد.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
      case 'refunded':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 text-brand mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            پیگیری وضعیت سفارش
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            با وارد کردن شماره سفارش و شماره موبایل خود می‌توانید از آخرین وضعیت بسته‌بندی، ارسال و رهگیری مطلع شوید.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  شماره سفارش <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="مثال: ORD-20260925-ABCD"
                    dir="ltr"
                    className="w-full text-left font-mono px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  شماره موبایل خریدار (اختیاری جهت تطابق)
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="09123456789"
                  dir="ltr"
                  className="w-full text-left font-mono px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand/25"
            >
              {loading ? (
                <span>در حال استعلام...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>پیگیری سفارش</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Result */}
        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-medium">سفارش</span>
                    <span className="text-base font-bold font-mono text-gray-900" dir="ltr">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>ثبت شده در: {toPersianDigits(order.createdAt ?? '')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.statusLabel}
                  </span>
                </div>
              </div>

              {/* Progress Steps (if not cancelled) */}
              {order.status !== 'cancelled' && order.status !== 'refunded' ? (
                <div className="pt-8 pb-4">
                  <div className="relative">
                    {/* Line */}
                    <div className="absolute top-5 inset-x-8 sm:inset-x-12 h-0.5 bg-gray-200 -z-0" />
                    <div
                      className="absolute top-5 right-8 sm:right-12 h-0.5 bg-brand transition-all duration-500 -z-0"
                      style={{
                        width:
                          currentStep === -1
                            ? '0%'
                            : `${(currentStep / (STEPS.length - 1)) * 100}%`,
                      }}
                    />

                    {/* Nodes */}
                    <div className="grid grid-cols-4 relative z-10">
                      {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 transition-all ${
                                isCurrent
                                  ? 'bg-brand text-white ring-4 ring-brand/20 shadow-md'
                                  : isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-[11px] sm:text-xs font-medium leading-tight ${
                                isDone ? 'text-gray-900 font-bold' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>این سفارش لغو یا مسترد گردیده است.</span>
                </div>
              )}
            </div>

            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span>اطلاعات تحویل‌گیرنده و آدرس</span>
                </div>
                {order.shippingAddress ? (
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-400">تحویل‌گیرنده:</span>
                      <span className="font-bold text-gray-800">
                        {order.shippingAddress.recipient_name}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-400">شماره تماس:</span>
                      <span className="font-mono text-gray-800" dir="ltr">
                        {order.shippingAddress.recipient_mobile}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-400">کد پستی:</span>
                      <span className="font-mono text-gray-800" dir="ltr">
                        {order.shippingAddress.postal_code}
                      </span>
                    </div>
                    <div className="pt-2 text-gray-700 leading-relaxed">
                      {order.shippingAddress.province}، {order.shippingAddress.city}، {order.shippingAddress.address}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">اطلاعات آدرس ثبت نشده است.</p>
                )}
              </div>

              {/* Financial & Payment Summary */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-sm">
                  <CreditCard className="w-4 h-4 text-brand" />
                  <span>خلاصه پرداخت</span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>مبلغ اقلام سفارش:</span>
                    <span>{formatToman(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>هزینه بسته‌بندی و ارسال:</span>
                    <span className="text-emerald-600 font-medium">رایگان</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-100 font-bold text-gray-900">
                    <span>مبلغ پرداختی:</span>
                    <span className="text-brand font-black">{formatToman(order.totalAmount)}</span>
                  </div>

                  {order.trackingCode && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400 block mb-1">کد پیگیری مرسوله / تراکنش:</span>
                      <span className="font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded inline-block" dir="ltr">
                        {order.trackingCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                اقلام این سفارش ({toPersianDigits(order.items?.length || 0)} مورد)
              </h2>
              <div className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 relative overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.productSlug ? `/product/${item.productSlug}` : '#'}
                        className="text-sm font-bold text-gray-900 hover:text-brand transition-colors block truncate"
                      >
                        {item.productTitle}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>تعداد: {toPersianDigits(item.quantity)}</span>
                        {item.seller && (
                          <span>فروشنده: {item.seller.storeName}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold text-gray-900 block">
                        {formatToman(item.totalPrice)}
                      </span>
                      <span className="text-xs text-gray-400">
                        هر واحد: {formatToman(item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:underline"
              >
                <span>بازگشت به فروشگاه و ادامه خرید</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
