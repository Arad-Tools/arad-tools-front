'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, User, Menu, X, Phone, ChevronDown, ChevronUp, Layers, Tag, BookOpen,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import { useCart } from '@/lib/stores/cart-context';
import { useAuth } from '@/lib/stores/auth-context';
import { getCategories } from '@/lib/api';
import type { Category } from '@/lib/types';
import ProfileMenu from '@/components/auth/ProfileMenu';
import LoginModal from '@/components/auth/LoginModal';
import SearchForm from '@/components/search/SearchForm';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const { count: cartCount } = useCart();
  const { isAuthenticated, hydrated, openLogin, logout } = useAuth();

  useEffect(() => {
    let isMounted = true;
    getCategories().then((data) => {
      if (isMounted && data.length > 0) {
        setCategories(data);
      }
    }).catch(() => {
      // Fallback handled inside getCategories
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="bg-navy-800 text-gray-200 text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:02112345678" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3 h-3" />
              <span dir="ltr">{toPersianDigits('021-1234-5678')}</span>
            </a>
            <span className="text-gray-500">|</span>
            <span>پشتیبانی ۲۴/۷</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ارسال رایگان برای خرید بالای ۵ میلیون تومان</span>
            <span className="text-gray-500">|</span>
            <Link href="/products" className="hover:text-white transition-colors">پیگیری سفارش</Link>
          </div>
        </div>
      </div>

      {/* ── Main Header ─────────────────────────────────────────────────────── */}
      <div className="bg-navy-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3">

            {/* ── Logo — start (right in RTL) ─────────────────────────────── */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group" aria-label="ابزار آراد - صفحه اصلی">
              <Image
                src="/Arad-logo3.png"
                alt="لوگوی ابزار آراد"
                width={1536}
                height={1024}
                priority
                className="h-10 sm:h-12 md:h-13 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
              />
              <div className="hidden sm:block">
                <span className="font-black text-xl tracking-tight">ابزار آراد</span>
                <p className="text-gray-400 text-[10px] leading-none mt-0.5">ابزار و تجهیزات صنعتی</p>
              </div>
            </Link>

            {/* ── Search — center ─────────────────────────────────────────── */}
            <div className="flex-1 max-w-xl mx-auto">
              <Suspense fallback={null}>
                <SearchForm />
              </Suspense>
            </div>

            {/* ── Actions — end (left in RTL) ─────────────────────────────── */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`سبد خرید — ${toPersianDigits(cartCount)} آیتم`}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 w-4 h-4 bg-brand rounded-full flex items-center justify-center text-[10px] font-bold">
                    {toPersianDigits(cartCount)}
                  </span>
                )}
              </Link>

              {/* User */}
              {hydrated && isAuthenticated ? (
                <ProfileMenu />
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                  aria-label="ورود و ثبت‌نام"
                >
                  <User className="w-4 h-4" />
                  <span>ورود</span>
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Nav Bar ────────────────────────────────────────────────── */}
      <nav className="bg-navy-800 hidden md:block relative" aria-label="دسته‌بندی محصولات">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {/* All categories mega menu trigger */}
            <li className="relative">
              <Link
                href="/products"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-white px-4 py-3 bg-brand hover:bg-brand-700 transition-colors whitespace-nowrap"
              >
                <Menu className="w-4 h-4" />
                <span>همه دسته‌بندی‌ها</span>
              </Link>

              {/* Mega menu dropdown */}
              {megaMenuOpen && categories.length > 0 && (
                <div
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  onMouseLeave={() => setMegaMenuOpen(false)}
                  className="absolute start-0 top-full w-72 bg-white text-gray-800 shadow-xl rounded-b-xl border border-gray-100 z-50 py-2 animate-fade-in"
                >
                  {categories.map((cat) => (
                    <div key={cat.id} className="group relative">
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.slug)}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 hover:text-brand transition-colors text-sm font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        {cat.children && cat.children.length > 0 && (
                          <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400" />
                        )}
                      </Link>

                      {/* Subcategories flyout */}
                      {cat.children && cat.children.length > 0 && (
                        <div className="hidden group-hover:block absolute start-full top-0 w-64 bg-white text-gray-800 shadow-xl rounded-xl border border-gray-100 z-50 py-2 ms-1">
                          {cat.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/products?subcategory=${encodeURIComponent(sub.slug)}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="block px-4 py-2 hover:bg-gray-50 hover:text-brand transition-colors text-sm font-medium"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>

            {/* Dynamic categories from backend API */}
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className="text-sm font-medium text-gray-300 hover:text-white px-4 py-3 block whitespace-nowrap transition-colors hover:bg-white/5"
                >
                  {cat.name}
                </Link>
              </li>
            ))}

            <li>
              <Link
                href="/brands"
                className="text-sm font-medium text-gray-300 hover:text-white px-4 py-3 block whitespace-nowrap transition-colors hover:bg-white/5"
              >
                برندها
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Mobile Drawer ───────────────────────────────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          {/* Slide-in menu from right (RTL start) */}
          <div
            className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl md:hidden animate-slide-in-rtl overflow-y-auto"
            role="dialog"
            aria-modal
            aria-label="منوی موبایل"
          >
            <div className="bg-navy-900 text-white p-4 flex items-center justify-between">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-black text-lg">
                <Image
                  src="/Arad-logo3.png"
                  alt="لوگوی ابزار آراد"
                  width={1536}
                  height={1024}
                  className="h-8 w-auto object-contain"
                />
                <span>ابزار آراد</span>
              </Link>
              <button onClick={() => setMenuOpen(false)} aria-label="بستن منو">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search in mobile */}
            <div className="p-4 border-b">
              <Suspense fallback={null}>
                <SearchForm variant="mobile" onSubmit={() => setMenuOpen(false)} />
              </Suspense>
            </div>

            {/* General quick links */}
            <div className="p-3 border-b bg-gray-50/50">
              <p className="text-xs font-bold text-gray-400 px-2 mb-2">دسترسی سریع</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link
                  href="/products"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-brand"
                >
                  <Layers className="w-3.5 h-3.5 text-brand" />
                  همه محصولات
                </Link>
                <Link
                  href="/brands"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-brand"
                >
                  <Tag className="w-3.5 h-3.5 text-brand" />
                  برندها
                </Link>
              </div>
            </div>

            {/* Mobile category nav links fetched from Backend API */}
            <div className="py-2">
              <p className="text-xs font-bold text-gray-400 px-4 py-2">دسته‌بندی‌های محصولات</p>
              {categories.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">در حال دریافت دسته‌بندی‌ها...</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {categories.map((cat) => {
                    const hasChildren = cat.children && cat.children.length > 0;
                    const isExpanded = !!expandedCategories[cat.id];

                    return (
                      <li key={cat.id} className="text-sm">
                        <div className="flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gray-50 font-semibold">
                          <Link
                            href={`/products?category=${encodeURIComponent(cat.slug)}`}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 flex-1 hover:text-brand transition-colors"
                          >
                            <span className="text-base">{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Link>
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={() => toggleCategoryExpand(cat.id)}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                              aria-label={`نمایش زیردسته‌بندی‌های ${cat.name}`}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>

                        {/* Collapsible Subcategories */}
                        {hasChildren && isExpanded && (
                          <ul className="bg-gray-50 border-t border-gray-100 py-1 ps-8 pe-4 space-y-1">
                            {cat.children?.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  href={`/products?subcategory=${encodeURIComponent(sub.slug)}`}
                                  onClick={() => setMenuOpen(false)}
                                  className="block py-2 text-xs font-medium text-gray-600 hover:text-brand transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-4 mt-2 space-y-2 border-t">
              {hydrated && isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn-outline w-full flex items-center justify-center gap-2">
                    داشبورد
                  </Link>
                  <Link href="/cart" onClick={() => setMenuOpen(false)} className="btn-outline w-full flex items-center justify-center gap-2">
                    سبد خرید
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); void logout(); }}
                    className="w-full text-sm text-red-600 py-2.5 font-medium"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); openLogin(); }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  ورود / ثبت‌نام
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <LoginModal />
    </header>
  );
}

