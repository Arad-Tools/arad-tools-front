'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Search,
  Package,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import ShopShell from '@/components/layout/ShopShell';
import { submitContactInquiry, trackOrderInquiry } from '@/lib/api';
import type { TrackOrderResponse } from '@/lib/types';
import { toPersianDigits, cn } from '@/lib/utils';

function ContactContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'track' ? 'track' : 'contact';

  const [activeTab, setActiveTab] = useState<'contact' | 'track'>(initialTab);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'track') {
      setActiveTab('track');
    } else if (tabParam === 'contact') {
      setActiveTab('contact');
    }
  }, [searchParams]);

  // ── Contact Form State ──
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    order_code: '',
    subject: 'پیگیری سفارش',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    trackingCode?: string;
  } | null>(null);

  // ── Order Tracking State ──
  const [trackCode, setTrackCode] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<TrackOrderResponse | null>(null);
  const [hasTracked, setHasTracked] = useState(false);

  // Handle Contact Submit
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    const res = await submitContactInquiry(formData);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setSubmitResult({
        success: true,
        message: res.message,
        trackingCode: res.data.tracking_code,
      });
      setFormData({
        name: '',
        phone: '',
        order_code: '',
        subject: 'پیگیری سفارش',
        message: '',
      });
    } else {
      setSubmitResult({
        success: false,
        message: res.message || 'خطا در ارسال پیام. لطفاً اطلاعات را بررسی نمایید.',
      });
    }
  };

  // Handle Order Track Submit
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCode.trim()) return;

    setIsTracking(true);
    setHasTracked(true);
    setTrackResult(null);

    const res = await trackOrderInquiry(trackCode, trackPhone);
    setIsTracking(false);
    setTrackResult(res);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="مسیر راهنما">
        <Link href="/" className="hover:text-brand transition-colors">خانه</Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-semibold">تماس با ما و پیگیری سفارش</span>
      </nav>

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 text-brand-300 text-xs font-bold mb-3 border border-brand/30">
            <span>پشتیبانی و امور مشتریان ابزار آراد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-3 leading-snug">
            ارتباط مستقیم و پیگیری آنلاین سفارش
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            جهت استعلام وضعیت بسته ارسالی، پیگیری مرسولات یا ثبت سوالات و مشاوره تخصصی ابزار با تیم پشتیبانی در ارتباط باشید.
          </p>
        </div>

        {/* Tab Switcher in Banner */}
        <div className="mt-8 flex gap-2 sm:gap-3 border-b border-white/10 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={cn(
              'flex items-center gap-2 px-4 sm:px-6 py-3 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2',
              activeTab === 'track'
                ? 'bg-white text-navy-900 border-brand shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5 border-transparent',
            )}
          >
            <Package className="w-4 h-4 text-brand" />
            <span>پیگیری سریع سفارش</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={cn(
              'flex items-center gap-2 px-4 sm:px-6 py-3 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2',
              activeTab === 'contact'
                ? 'bg-white text-navy-900 border-brand shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5 border-transparent',
            )}
          >
            <MessageSquare className="w-4 h-4 text-brand" />
            <span>ارسال پیام و فرم تماس</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Main Tab Area (8 Cols) ── */}
        <div className="lg:col-span-8">
          {activeTab === 'track' ? (
            /* ─────────────────────────────────────────────────────────────
               ORDER TRACKING TAB
            ───────────────────────────────────────────────────────────── */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand" />
                  <span>پیگیری وضعیت سفارش و بسته پستی</span>
                </h2>
                <p className="text-xs text-gray-500">
                  کد پیگیری مرسوله (یا شماره سفارش) و شماره موبایلی که با آن ثبت سفارش کرده‌اید را وارد کنید.
                </p>
              </div>

              {/* Tracking Form */}
              <form onSubmit={handleTrackSubmit} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="trackCode" className="block text-xs font-bold text-gray-700 mb-1.5">
                      کد پیگیری یا شماره سفارش <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="trackCode"
                        type="text"
                        required
                        value={trackCode}
                        onChange={(e) => setTrackCode(e.target.value)}
                        placeholder="مثال: ORD-1002 یا TRK-AB12CD"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute end-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="trackPhone" className="block text-xs font-bold text-gray-700 mb-1.5">
                      شماره موبایل ثبت سفارش (اختیاری)
                    </label>
                    <input
                      id="trackPhone"
                      type="tel"
                      value={trackPhone}
                      onChange={(e) => setTrackPhone(e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all text-left dir-ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isTracking || !trackCode.trim()}
                  className="w-full sm:w-auto px-8 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-700 active:scale-95 transition-all shadow-md shadow-brand/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTracking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال استعلام وضعیت...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>استعلام وضعیت سفارش</span>
                    </>
                  )}
                </button>
              </form>

              {/* Tracking Result View */}
              {hasTracked && trackResult && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
                  {trackResult.found && trackResult.data ? (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="font-bold text-emerald-900 text-sm">
                            اطلاعات مرسوله یافت شد
                          </span>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {trackResult.data.status_label || 'در حال آماده‌سازی'}
                        </span>
                      </div>

                      {/* Timeline Steps */}
                      <div className="py-4">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-1 shadow-sm">
                              ۱
                            </div>
                            <span className="font-bold text-gray-800">ثبت سفارش</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-1 shadow-sm">
                              ۲
                            </div>
                            <span className="font-bold text-gray-800">تایید مالی</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 shadow-sm transition-all',
                              trackResult.data.status === 'resolved' || trackResult.data.status === 'in_progress'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-200 text-gray-600',
                            )}>
                              ۳
                            </div>
                            <span className="font-bold text-gray-800">ارسال مرسوله</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 shadow-sm transition-all',
                              trackResult.data.status === 'resolved'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-200 text-gray-600',
                            )}>
                              ۴
                            </div>
                            <span className="font-bold text-gray-800">تحویل مشتری</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 p-3.5 rounded-xl border border-emerald-100">
                        <div>
                          <span className="text-gray-500">کد رهگیری: </span>
                          <span className="font-mono font-bold text-gray-800" dir="ltr">{trackResult.data.tracking_code}</span>
                        </div>
                        {trackResult.data.order_code && (
                          <div>
                            <span className="text-gray-500">شماره سفارش: </span>
                            <span className="font-mono font-bold text-gray-800">{trackResult.data.order_code}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">موضوع / نوع: </span>
                          <span className="font-semibold text-gray-800">{trackResult.data.subject}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">آخرین بروزرسانی: </span>
                          <span className="font-medium text-gray-800">
                            {new Date(trackResult.data.updated_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-900 text-sm mb-1">
                            سفارشی با این مشخصات یافت نشد
                          </p>
                          <p className="text-xs text-amber-800 leading-relaxed mb-3">
                            ممکن است کد سفارش را اشتباه وارد کرده باشید، یا سفارش شما هنوز در سامانه کد نخورده باشد. در صورت بروز هرگونه ابهام، فرم زیر را برای پیگیری ارسال فرمایید.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('contact');
                              setFormData((prev) => ({
                                ...prev,
                                order_code: trackCode,
                                phone: trackPhone || prev.phone,
                                subject: 'پیگیری سفارش',
                              }));
                            }}
                            className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                          >
                            <span>ثبت درخواست پیگیری برای کد {trackCode}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Informational Guidance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1">زمان‌بندی ارسال مرسولات</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      سفارش‌های تهران همان روز یا روز بعد توسط پیک تحویل می‌شوند. سفارش‌های شهرستان از طریق پست پیشتاز یا تیپاکس ظرف ۲۴ الی ۴۸ ساعت ارسال می‌گردند.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1">ضمانت اصالت و سلامت</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      تمامی ابزارها با بسته‌بندی ایمن و گارانتی اصالت کالا ارسال می‌شوند و تا ۷ روز مهلت تست فنی دارند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               CONTACT FORM TAB
            ───────────────────────────────────────────────────────────── */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand" />
                  <span>فرم تماس، مشاوره و پیگیری سفارش</span>
                </h2>
                <p className="text-xs text-gray-500">
                  پیام، پیشنهاد یا درخواست پیگیری خود را ثبت نمایید تا همکاران ما در اسرع وقت پاسخ دهند.
                </p>
              </div>

              {submitResult && (
                <div className={cn(
                  'mb-6 p-4 rounded-2xl border text-sm flex items-start gap-3',
                  submitResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900',
                )}>
                  {submitResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{submitResult.message}</p>
                    {submitResult.trackingCode && (
                      <p className="text-xs mt-1 font-semibold text-emerald-800">
                        کد پیگیری درخواست شما: <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300" dir="ltr">{submitResult.trackingCode}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="contactName" className="block text-xs font-bold text-gray-700 mb-1.5">
                      نام و نام خانوادگی <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: علی احمدی"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="contactPhone" className="block text-xs font-bold text-gray-700 mb-1.5">
                      شماره تماس / موبایل <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all text-left dir-ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Subject */}
                  <div>
                    <label htmlFor="contactSubject" className="block text-xs font-bold text-gray-700 mb-1.5">
                      موضوع پیام
                    </label>
                    <select
                      id="contactSubject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm bg-white transition-all"
                    >
                      <option value="پیگیری سفارش">پیگیری سفارش</option>
                      <option value="مشاوره خرید ابزار">مشاوره تخصصی خرید ابزار</option>
                      <option value="پشتیبانی فنی و گارانتی">پشتیبانی فنی و خدمات پس از فروش</option>
                      <option value="انتقادات و پیشنهادات">انتقادات و پیشنهادات</option>
                      <option value="همکاری تجاری">همکاری تجاری و خرید عمده</option>
                    </select>
                  </div>

                  {/* Order code */}
                  <div>
                    <label htmlFor="contactOrderCode" className="block text-xs font-bold text-gray-700 mb-1.5">
                      شماره سفارش (در صورت وجود)
                    </label>
                    <input
                      id="contactOrderCode"
                      type="text"
                      value={formData.order_code}
                      onChange={(e) => setFormData({ ...formData, order_code: e.target.value })}
                      placeholder="مثال: ORD-1002"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contactMessage" className="block text-xs font-bold text-gray-700 mb-1.5">
                    متن پیام یا شرح پیگیری <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contactMessage"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="لطفاً جزئیات سوال یا پیگیری سفارش خود را اینجا بنویسید..."
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-700 active:scale-95 transition-all shadow-md shadow-brand/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال ثبت پیام...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ارسال پیام</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Sidebar: Store Info & Direct Channels (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick contact card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3">
              اطلاعات ارتباط مستقیم
            </h3>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">تلفن‌های تماس</span>
                <a href="tel:02112345678" className="text-sm font-bold text-gray-900 hover:text-brand block dir-ltr">
                  {toPersianDigits('021-1234-5678')}
                </a>
                <a href="tel:09121234567" className="text-xs font-semibold text-gray-600 hover:text-brand block dir-ltr mt-0.5">
                  {toPersianDigits('0912-123-4567')}
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">آدرس دفتر مرکزی و فروشگاه</span>
                <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                  تهران، میدان حسن‌آباد، خیابان امام خمینی، روبروی بیمارستان سینا، پلاک ۲۴
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">ساعات کاری و پاسخگویی</span>
                <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                  شنبه تا چهارشنبه: ۹:۰۰ الی ۱۸:۰۰
                </p>
                <p className="text-xs font-medium text-gray-500">
                  پنج‌شنبه‌ها: ۹:۰۰ الی ۱۴:۰۰
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">پست الکترونیکی</span>
                <a href="mailto:info@aradtoolsco.ir" className="text-xs font-bold text-gray-800 hover:text-brand block" dir="ltr">
                  info@aradtoolsco.ir
                </a>
              </div>
            </div>
          </div>

          {/* Social Messengers Card */}
          <div className="bg-gradient-to-br from-gray-50 to-orange-50/40 rounded-3xl p-6 border border-gray-200/80 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 mb-2">
              پیام‌رسان‌های آنلاین
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              برای ارتباط سریع و ارسال تصاویر قطعات و ابزار در پیام‌رسان‌های زیر پیام بگذارید:
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <a
                href="https://t.me/Aradprofessionaltools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-sky-600 font-bold hover:bg-sky-50 transition-colors shadow-xs"
              >
                <span>تلگرام</span>
              </a>
              <a
                href="https://ble.ir/arad_tools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors shadow-xs"
              >
                <span>بله</span>
              </a>
              <a
                href="https://rubika.ir/c0Do88J01d8b789eaee5165eeb016709"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-purple-600 font-bold hover:bg-purple-50 transition-colors shadow-xs"
              >
                <span>روبیکا</span>
              </a>
              <a
                href="https://wa.me/989121234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-green-600 font-bold hover:bg-green-50 transition-colors shadow-xs"
              >
                <span>واتساپ</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <ShopShell>
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      }>
        <ContactContent />
      </Suspense>
    </ShopShell>
  );
}
