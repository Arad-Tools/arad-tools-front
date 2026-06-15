'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, ShoppingCart, User, Menu, X, Phone, ChevronDown,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'ابزار برقی',     href: '/category/power-tools'  },
  { label: 'ابزار دستی',     href: '/category/hand-tools'   },
  { label: 'جوشکاری',        href: '/category/welding'      },
  { label: 'ایمنی',          href: '/category/safety'       },
  { label: 'برندها',         href: '/brands'                },
  { label: 'وبلاگ',          href: '/blog'                  },
];

export default function Header() {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [cartCount ] = useState(0); // wire to real cart store in production

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
            <Link href="/track" className="hover:text-white transition-colors">پیگیری سفارش</Link>
          </div>
        </div>
      </div>

      {/* ── Main Header ─────────────────────────────────────────────────────── */}
      <div className="bg-navy-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3">

            {/* ── Logo — start (right in RTL) ─────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group" aria-label="ابزار آراد - صفحه اصلی">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-black text-white text-sm shadow">
                ا
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-xl tracking-tight">ابزار آراد</span>
                <p className="text-gray-400 text-[10px] leading-none mt-0.5">ابزار و تجهیزات صنعتی</p>
              </div>
            </Link>

            {/* ── Search — center ─────────────────────────────────────────── */}
            <div className="flex-1 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="search"
                  placeholder="جستجو در ابزار، برند و دسته‌بندی..."
                  className="
                    w-full bg-white/10 border border-white/20 rounded-xl
                    pe-10 ps-4 py-2.5 text-sm text-white placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-brand/70 focus:bg-white/15
                    transition-all duration-200
                  "
                />
              </div>
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
              <Link href="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors" aria-label="ورود و ثبت‌نام">
                <User className="w-4 h-4" />
                <span>ورود</span>
              </Link>

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
      <nav className="bg-navy-800 hidden md:block" aria-label="دسته‌بندی محصولات">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {/* All categories mega menu trigger */}
            <li>
              <button className="flex items-center gap-2 text-sm font-medium text-white px-4 py-3 bg-brand hover:bg-brand-700 transition-colors whitespace-nowrap">
                <Menu className="w-4 h-4" />
                <span>همه دسته‌بندی‌ها</span>
              </button>
            </li>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-gray-300 hover:text-white px-4 py-3 block whitespace-nowrap transition-colors hover:bg-white/5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
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
              <Link href="/" onClick={() => setMenuOpen(false)} className="font-black text-lg">ابزار آراد</Link>
              <button onClick={() => setMenuOpen(false)} aria-label="بستن منو">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search in mobile */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 w-4 h-4" />
                <input
                  type="search"
                  placeholder="جستجو..."
                  className="w-full border border-gray-200 rounded-xl pe-10 ps-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>

            {/* Mobile nav links */}
            <ul className="py-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-brand font-medium transition-colors border-b border-gray-50"
                  >
                    {link.label}
                    {/* RTL arrow — points left (back) */}
                    <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="p-4 mt-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                ورود / ثبت‌نام
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
