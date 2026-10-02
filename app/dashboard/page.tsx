'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import ShopShell from '@/components/layout/ShopShell';
import { useAuth } from '@/lib/stores/auth-context';
import {
  cancelCustomerOrder,
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchCustomerOrders,
  fetchSellerDashboard,
  registerAsSeller,
  setDefaultAddress,
} from '@/lib/ecommerce-api';
import type { CustomerAddress, Order, Seller } from '@/lib/types';
import { formatToman, toPersianDigits } from '@/lib/utils';

type DashboardTab = 'orders' | 'addresses' | 'profile' | 'seller';

export default function DashboardPage() {
  const { customer, token, isAuthenticated, hydrated, openLogin, logout, saveProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Profile edit state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Add Address Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: 'خانه',
    recipient_name: '',
    recipient_mobile: '',
    province: 'آذربایجان غربی',
    city: 'ارومیه',
    postal_code: '',
    address: '',
    building_number: '',
    unit: '',
  });

  // Seller Dashboard state
  const [sellerData, setSellerData] = useState<{
    seller: Seller;
    stats: { totalProducts: number; totalOrders: number; totalRevenue: number };
    recentOrders: any[];
  } | null>(null);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [sellerForm, setSellerForm] = useState({
    store_name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  });
  const [submittingSeller, setSubmittingSeller] = useState(false);
  const [sellerMsg, setSellerMsg] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      openLogin();
    }
  }, [hydrated, isAuthenticated, openLogin]);

  useEffect(() => {
    if (customer) {
      setName(customer.name ?? '');
      setEmail(customer.email ?? '');
      setNewAddr((prev) => ({
        ...prev,
        recipient_name: prev.recipient_name || (customer.name ?? ''),
        recipient_mobile: prev.recipient_mobile || customer.mobile,
      }));
      setSellerForm((prev) => ({
        ...prev,
        contact_name: prev.contact_name || (customer.name ?? ''),
        phone: prev.phone || customer.mobile,
        email: prev.email || (customer.email ?? ''),
      }));
    }
  }, [customer]);

  // Load orders
  const loadOrders = () => {
    if (!token) return;
    setLoadingOrders(true);
    fetchCustomerOrders(token)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  };

  // Load addresses
  const loadAddresses = () => {
    if (!token) return;
    setLoadingAddresses(true);
    fetchAddresses(token)
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  };

  // Load seller data
  const loadSeller = () => {
    if (!token) return;
    setLoadingSeller(true);
    fetchSellerDashboard(token)
      .then(setSellerData)
      .catch(() => {})
      .finally(() => setLoadingSeller(false));
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'orders') loadOrders();
      if (activeTab === 'addresses') loadAddresses();
      if (activeTab === 'seller') loadSeller();
    }
  }, [token, activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      await saveProfile({ name, email });
      setProfileMsg('اطلاعات با موفقیت ذخیره شد.');
    } catch (err: any) {
      setProfileMsg(err.message || 'خطا در ثبت اطلاعات.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await createAddress(
        {
          ...newAddr,
          is_default: addresses.length === 0,
        },
        token,
      );
      setShowAddressModal(false);
      loadAddresses();
    } catch {
      // error handled in form
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!token || !confirm('آیا از حذف این آدرس اطمینان دارید؟')) return;
    await deleteAddress(id, token);
    loadAddresses();
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!token) return;
    await setDefaultAddress(id, token);
    loadAddresses();
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (!token || !confirm('آیا مایل به لغو این سفارش هستید؟')) return;
    try {
      await cancelCustomerOrder(orderNumber, token);
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'خطا در لغو سفارش');
    }
  };

  const handleRegisterSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setSubmittingSeller(true);
      setSellerMsg(null);
      await registerAsSeller(sellerForm, token);
      setSellerMsg('درخواست فروشندگی شما با موفقیت تایید شد!');
      loadSeller();
    } catch (err: any) {
      setSellerMsg(err.message || 'خطا در ثبت درخواست فروشندگی.');
    } finally {
      setSubmittingSeller(false);
    }
  };

  if (!hydrated || !isAuthenticated || !customer) {
    return (
      <ShopShell>
        <div className="container mx-auto px-4 py-20 text-center text-gray-500">
          در حال بارگذاری اطلاعات حساب کاربری...
        </div>
      </ShopShell>
    );
  }

  return (
    <ShopShell>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 text-center">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8" />
              </div>
              <h2 className="font-extrabold text-navy-900 text-base">{customer.name || 'کاربر گرامی'}</h2>
              <p className="text-xs text-gray-400 mt-1" dir="ltr">
                {toPersianDigits(customer.mobile)}
              </p>
            </div>

            <nav className="bg-white rounded-3xl p-3 shadow-card border border-gray-100 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>سفارش‌های من</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'addresses'
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>آدرس‌های تحویل</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span>اطلاعات حساب</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seller')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'seller'
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4" />
                  <span>پنل فروشندگان</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  چندفروشندگی
                </span>
              </button>

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-card border border-gray-100">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h1 className="font-extrabold text-lg text-navy-900">سفارش‌های من</h1>
                  <span className="text-xs text-gray-500">
                    {toPersianDigits(orders.length)} سفارش ثبت‌شده
                  </span>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    در حال دریافت سفارش‌ها...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center">
                    <Package className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">تاکنون سفارشی ثبت نکرده‌اید.</p>
                    <Link href="/products" className="btn-primary text-xs py-2.5 px-6 inline-flex">
                      مشاهده کاتالوگ ابزارها
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all bg-gray-50/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/60 text-xs">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-navy-900 font-mono" dir="ltr">
                              {ord.orderNumber}
                            </span>
                            <span className="text-gray-400">
                              {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('fa-IR') : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : ord.status === 'processing' || ord.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.statusLabel}
                            </span>
                            <span className="font-extrabold text-brand text-sm">
                              {formatToman(ord.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items previews */}
                        {ord.items && ord.items.length > 0 && (
                          <div className="py-3 flex flex-wrap gap-3">
                            {ord.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-100 text-xs"
                              >
                                {item.image && (
                                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                    <Image
                                      src={item.image}
                                      alt={item.productTitle}
                                      fill
                                      className="object-cover"
                                      sizes="32px"
                                    />
                                  </div>
                                )}
                                <span className="font-medium text-gray-800 line-clamp-1 max-w-[160px]">
                                  {item.productTitle}
                                </span>
                                <span className="text-gray-400">×{toPersianDigits(item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {ord.trackingCode ? `کد رهگیری پستی: ${ord.trackingCode}` : 'ارسال از انبار مرکزی ابزارسرا'}
                          </span>
                          <div className="flex gap-2">
                            {ord.status === 'pending_payment' && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(ord.orderNumber)}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                              >
                                لغو سفارش
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-card border border-gray-100">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h1 className="font-extrabold text-lg text-navy-900">آدرس‌های تحویل سفارش</h1>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    افزودن آدرس جدید
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    در حال دریافت آدرس‌ها...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-16 text-center">
                    <MapPin className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">هنوز آدرسی ثبت نکرده‌اید.</p>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="btn-primary text-xs py-2.5 px-6 inline-flex"
                    >
                      افزودن اولین آدرس
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="rounded-2xl border border-gray-100 p-5 bg-gray-50/50 hover:border-gray-200 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-navy-900 text-sm">{addr.title}</span>
                            {addr.isDefault ? (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                                پیش‌فرض
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-xs text-brand hover:underline font-semibold"
                              >
                                انتخاب به عنوان پیش‌فرض
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed mb-3">
                            {addr.fullAddress}
                          </p>
                          <div className="space-y-1 text-xs text-gray-500 mb-4">
                            <div>گیرنده: {addr.recipientName}</div>
                            <div>تلفن همراه: {toPersianDigits(addr.recipientMobile)}</div>
                            <div>کد پستی: {toPersianDigits(addr.postalCode)}</div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-card border border-gray-100 max-w-xl">
                <h1 className="font-extrabold text-lg text-navy-900 mb-6 pb-4 border-b border-gray-100">
                  ویرایش اطلاعات حساب
                </h1>

                {profileMsg && (
                  <div className="mb-4 p-3.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      شماره موبایل (غیرقابل تغییر)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={toPersianDigits(customer.mobile)}
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="نام خود را وارد کنید"
                      className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      آدرس ایمیل (اختیاری)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary text-xs py-2.5 px-6 rounded-xl"
                    >
                      {savingProfile ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Seller Multi-Vendor Tab */}
            {activeTab === 'seller' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-card border border-gray-100">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-brand" />
                    <h1 className="font-extrabold text-lg text-navy-900">پنل فروشندگان (مارکت‌پلیس)</h1>
                  </div>
                  {sellerData?.seller && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold">
                      فروشگاه فعال: {sellerData.seller.storeName}
                    </span>
                  )}
                </div>

                {sellerData?.seller ? (
                  /* Seller Stats & Dashboard */
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100">
                        <span className="text-xs text-blue-600 block mb-1">کالاهای ثبت‌شده</span>
                        <span className="text-2xl font-black text-navy-900">
                          {toPersianDigits(sellerData.stats.totalProducts)}
                        </span>
                      </div>
                      <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100">
                        <span className="text-xs text-emerald-600 block mb-1">تعداد فروش موفق</span>
                        <span className="text-2xl font-black text-navy-900">
                          {toPersianDigits(sellerData.stats.totalOrders)}
                        </span>
                      </div>
                      <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-100">
                        <span className="text-xs text-amber-600 block mb-1">درآمد ناخالص فروشنده</span>
                        <span className="text-2xl font-black text-brand">
                          {formatToman(sellerData.stats.totalRevenue)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h2 className="font-bold text-sm text-navy-900 mb-3">سفارش‌های اخیر شما</h2>
                      {sellerData.recentOrders.length === 0 ? (
                        <p className="text-xs text-gray-500 py-6 text-center">هنوز سفارشی برای کالاهای شما ثبت نشده است.</p>
                      ) : (
                        <div className="space-y-2">
                          {sellerData.recentOrders.map((ordItem) => (
                            <div
                              key={ordItem.id}
                              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 text-xs bg-gray-50/40"
                            >
                              <span>{ordItem.productTitle} (×{toPersianDigits(ordItem.quantity)})</span>
                              <span className="font-bold text-emerald-700">{formatToman(ordItem.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Seller Registration Form */
                  <div className="max-w-xl">
                    <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                      با ثبت‌نام به عنوان فروشنده در ابزارسرا، می‌توانید محصولات ابزارآلات و صنعتی خود را به هزاران مشتری معرفی کرده و به فروش برسانید.
                    </p>

                    {sellerMsg && (
                      <div className="mb-4 p-3.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium">
                        {sellerMsg}
                      </div>
                    )}

                    <form onSubmit={handleRegisterSeller} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          نام فروشگاه یا برند تجاری *
                        </label>
                        <input
                          type="text"
                          required
                          value={sellerForm.store_name}
                          onChange={(e) =>
                            setSellerForm({ ...sellerForm, store_name: e.target.value })
                          }
                          placeholder="مثال: بازرگانی ابزار دقیق البرز"
                          className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            نام و نام خانوادگی نماینده *
                          </label>
                          <input
                            type="text"
                            required
                            value={sellerForm.contact_name}
                            onChange={(e) =>
                              setSellerForm({ ...sellerForm, contact_name: e.target.value })
                            }
                            className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            شماره تماس ثابت یا همراه *
                          </label>
                          <input
                            type="text"
                            required
                            value={sellerForm.phone}
                            onChange={(e) =>
                              setSellerForm({ ...sellerForm, phone: e.target.value })
                            }
                            className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          نشانی فروشگاه یا انبار
                        </label>
                        <textarea
                          rows={2}
                          value={sellerForm.address}
                          onChange={(e) =>
                            setSellerForm({ ...sellerForm, address: e.target.value })
                          }
                          className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          درباره فروشگاه و حوزه فعالیت
                        </label>
                        <textarea
                          rows={3}
                          value={sellerForm.description}
                          onChange={(e) =>
                            setSellerForm({ ...sellerForm, description: e.target.value })
                          }
                          placeholder="توضیح مختصر در مورد سابقه، تخصص، یا نمایندگی‌ها..."
                          className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-brand focus:outline-none"
                        />
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={submittingSeller}
                          className="btn-primary text-xs py-3 px-8 rounded-xl shadow-md"
                        >
                          {submittingSeller ? 'در حال ثبت نام...' : 'ثبت نام و ایجاد فروشگاه'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-base text-navy-900">افزودن آدرس جدید</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAddress} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">عنوان آدرس</label>
                    <input
                      type="text"
                      value={newAddr.title}
                      onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                      placeholder="مثال: خانه، کارگاه"
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">تحویل‌گیرنده *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.recipient_name}
                      onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })}
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
                      value={newAddr.province}
                      onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">شهر *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">کد پستی *</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={newAddr.postal_code}
                      onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">شماره همراه *</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.recipient_mobile}
                    onChange={(e) => setNewAddr({ ...newAddr, recipient_mobile: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">آدرس کامل *</label>
                  <textarea
                    required
                    rows={2}
                    value={newAddr.address}
                    onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
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
