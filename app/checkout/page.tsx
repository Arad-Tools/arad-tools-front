'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import ShopShell from '@/components/layout/ShopShell';
import { useAuth } from '@/lib/stores/auth-context';
import { useCart } from '@/lib/stores/cart-context';
import {
  createAddress,
  fetchAddresses,
  submitCheckout,
  submitMockPayment,
} from '@/lib/ecommerce-api';
import type { CustomerAddress } from '@/lib/types';
import { formatToman, toPersianDigits } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { customer, token, isAuthenticated, openLogin, hydrated: authHydrated } = useAuth();
  const { items, total, count, clearCart, hydrated: cartHydrated } = useCart();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    title: 'خانه',
    recipient_name: customer?.name ?? '',
    recipient_mobile: customer?.mobile ?? '',
    province: 'تهران',
    city: 'تهران',
    postal_code: '',
    address: '',
    building_number: '',
    unit: '',
  });

  // Load addresses when authenticated
  useEffect(() => {
    if (token) {
      setLoadingAddresses(true);
      fetchAddresses(token)
        .then((list) => {
          setAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        })
        .catch(() => {
          // ignore
        })
        .finally(() => setLoadingAddresses(false));
    }
  }, [token]);

  // Update default recipient name/mobile when customer loads
  useEffect(() => {
    if (customer) {
      setNewAddress((prev) => ({
        ...prev,
        recipient_name: prev.recipient_name || (customer.name ?? ''),
        recipient_mobile: prev.recipient_mobile || customer.mobile,
      }));
    }
  }, [customer]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setError(null);
      const res = await createAddress(
        {
          ...newAddress,
          is_default: addresses.length === 0,
        },
        token,
      );
      setAddresses((prev) => [res.address, ...prev]);
      setSelectedAddressId(res.address.id);
      setShowNewAddressModal(false);
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت آدرس');
    }
  };

  const handlePlaceOrder = async () => {
    if (!token) {
      openLogin();
      return;
    }

    if (items.length === 0) {
      setError('سبد خرید شما خالی است.');
      return;
    }

    if (!selectedAddressId && addresses.length > 0) {
      setError('لطفاً یک آدرس برای ارسال انتخاب کنید.');
      return;
    }

    if (addresses.length === 0 && (!newAddress.address || !newAddress.recipient_name || !newAddress.postal_code)) {
      setShowNewAddressModal(true);
      setError('لطفاً ابتدا آدرس تحویل سفارش را وارد نمایید.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = selectedAddressId
        ? {
            address_id: selectedAddressId,
            customer_notes: notes,
            payment_method: 'mock',
          }
        : {
            ...newAddress,
            customer_notes: notes,
            payment_method: 'mock',
          };

      const result = await submitCheckout(payload, token);

      // Auto-simulate mock payment
      const paymentRef = result.payment.referenceId;
      if (paymentRef) {
        await submitMockPayment(paymentRef, true);
      }

      // Clear local cart
      clearCart();

      // Redirect to success page
      router.push(`/checkout/result?order=${result.order.orderNumber}&status=success`);
    } catch (err: any) {
      setError(err.message || 'خطایی در ثبت سفارش رخ داد.');
      setSubmitting(false);
    }
  };

  if (!authHydrated || !cartHydrated) {
    return (
      <ShopShell>
        <div className="container mx-auto px-4 py-20 text-center text-gray-500">
          در حال بارگذاری اطلاعات خرید...
        </div>
      </ShopShell>
    );
  }

  if (items.length === 0) {
    return (
      <ShopShell>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="bg-white rounded-3xl p-10 shadow-card border border-gray-100">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-navy-900 mb-2">سبد خرید شما خالی است</h1>
            <p className="text-gray-500 text-sm mb-6">
              برای ثبت سفارش، ابتدا کالاهای مورد نظر خود را به سبد خرید اضافه کنید.
            </p>
            <Link href="/products" className="btn-primary inline-flex w-full justify-center">
              مشاهده فروشگاه
            </Link>
          </div>
        </div>
      </ShopShell>
    );
  }

  return (
    <ShopShell>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/cart" className="hover:text-brand flex items-center gap-1">
            سبد خرید
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-900 font-medium">تسویه حساب و پرداخت</span>
        </div>

        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 mb-8">
          نهایی‌سازی و ثبت سفارش
        </h1>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xs font-bold"
            >
              بستن
            </button>
          </div>
        )}

        {/* Auth prompt if not logged in */}
        {!isAuthenticated && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy-900">ورود به حساب کاربری</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  برای ذخیره سابقه سفارش و پیگیری آسان، لطفاً وارد حساب خود شوید.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openLogin}
              className="btn-primary text-sm py-2 px-6 whitespace-nowrap"
            >
              ورود یا ثبت‌نام با شماره موبایل
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Form Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-lg text-navy-900">آدرس تحویل سفارش</h2>
                </div>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressModal(true)}
                    className="text-xs text-brand hover:text-brand-dark font-bold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    آدرس جدید
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  در حال بارگذاری آدرس‌ها...
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <label
                        key={addr.id}
                        className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand bg-brand/5 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address_selection"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 text-brand focus:ring-brand"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-navy-900 text-sm">
                                {addr.title || 'آدرس'}
                              </span>
                              {addr.isDefault && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                  پیش‌فرض
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed mb-1.5">
                              {addr.fullAddress}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>گیرنده: {addr.recipientName}</span>
                              <span>موبایل: {toPersianDigits(addr.recipientMobile)}</span>
                              <span>کدپستی: {toPersianDigits(addr.postalCode)}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                /* Inline Address form for first-time / guest */
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        نام و نام خانوادگی تحویل‌گیرنده *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.recipient_name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, recipient_name: e.target.value })
                        }
                        placeholder="مثال: علی محمدی"
                        className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        شماره موبایل تحویل‌گیرنده *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newAddress.recipient_mobile}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, recipient_mobile: e.target.value })
                        }
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        استان *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.province}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, province: e.target.value })
                        }
                        className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        شهر *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        کد پستی (۱۰ رقمی) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={newAddress.postal_code}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, postal_code: e.target.value })
                        }
                        placeholder="۱۲۳۴۵۶۷۸۹۰"
                        className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      آدرس پستی کامل *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, address: e.target.value })
                      }
                      placeholder="خیابان، کوچه، پلاک، واحد..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-lg text-navy-900">روش پرداخت</h2>
              </div>

              <div className="space-y-3">
                <label className="block p-4 rounded-2xl border-2 border-brand bg-brand/5 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        defaultChecked
                        className="text-brand focus:ring-brand"
                      />
                      <div>
                        <span className="font-bold text-sm text-navy-900 block">
                          درگاه پرداخت آنلاین شتابی (شبیه‌ساز تستی)
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5 block">
                          پرداخت امن با تمامی کارت‌های عضو شبکه شتاب (محیط آزمایشی فعال)
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-brand" />
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Order Notes */}
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6 lg:p-8">
              <h2 className="font-bold text-base text-navy-900 mb-2">یادداشت سفارش (اختیاری)</h2>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توضیحات تکمیلی در مورد نحوه ارسال یا زمان تحویل..."
                className="w-full text-sm border border-gray-200 rounded-2xl p-3.5 focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Sidebar Summary Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-lg text-navy-900 mb-4 pb-3 border-b border-gray-100">
                اقلام سفارش ({toPersianDigits(count)} عدد)
              </h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 text-sm">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-xs line-clamp-1">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{toPersianDigits(item.quantity)} عدد</span>
                        <span className="font-bold text-brand">
                          {formatToman(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span>مجموع خرید</span>
                  <span className="font-medium text-gray-900">{formatToman(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    هزینه ارسال
                  </span>
                  <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                    رایگان
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-extrabold text-navy-900 pt-4 border-t border-gray-100 mb-6">
                <span>مبلغ نهایی</span>
                <span className="text-brand font-black text-xl">{formatToman(total)}</span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="btn-primary w-full py-4 text-base rounded-2xl shadow-xl shadow-brand/25 hover:shadow-brand/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>در حال انتقال به درگاه پرداخت...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>پرداخت و ثبت نهایی</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>ضمانت اصالت و سلامت فیزیکی کالا</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for adding address */}
        {showNewAddressModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-lg text-navy-900">افزودن آدرس جدید</h3>
                <button
                  type="button"
                  onClick={() => setShowNewAddressModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      عنوان آدرس
                    </label>
                    <input
                      type="text"
                      value={newAddress.title}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, title: e.target.value })
                      }
                      placeholder="مثال: خانه، محل کار"
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      نام تحویل‌گیرنده *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipient_name}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, recipient_name: e.target.value })
                      }
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">استان *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.province}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, province: e.target.value })
                      }
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">شهر *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      کد پستی *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={newAddress.postal_code}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, postal_code: e.target.value })
                      }
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    شماره موبایل *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAddress.recipient_mobile}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, recipient_mobile: e.target.value })
                    }
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    نشانی پستی دقیق *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address: e.target.value })
                    }
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:bg-gray-100"
                  >
                    انصراف
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5">
                    ذخیره آدرس
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ShopShell>
  );
}
