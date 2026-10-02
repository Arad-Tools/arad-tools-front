'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/stores/cart-context';
import { formatToman, toPersianDigits, cn } from '@/lib/utils';
import { productImage } from '@/lib/media';

export default function CartPopover() {
  const { items, count, total, hydrated, removeItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Close popover when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Clear timeout helper
  const cancelClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Hover handlers with debounce
  const handleMouseEnter = useCallback(() => {
    cancelClose();
    setIsOpen(true);
  }, [cancelClose]);

  const handleMouseLeave = useCallback(() => {
    cancelClose();
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, [cancelClose]);

  // Click / touch toggle handler
  const handleTriggerClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const nativeEvent = e.nativeEvent as unknown as PointerEvent;
    const isTouch =
      (nativeEvent && 'pointerType' in nativeEvent && nativeEvent.pointerType === 'touch') ||
      (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches);

    if (isTouch) {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  // Close on click outside & Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Cart Trigger Button ────────────────────────────────────── */}
      <Link
        href="/cart"
        onClick={handleTriggerClick}
        aria-label={`سبد خرید — ${hydrated ? toPersianDigits(count) : '۰'} آیتم`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          'relative p-2 rounded-lg transition-colors flex items-center justify-center',
          isOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white',
        )}
      >
        <ShoppingCart className="w-5 h-5" />
        {hydrated && count > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 bg-brand rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm leading-none">
            {toPersianDigits(count)}
          </span>
        )}
      </Link>

      {/* ── Mobile Backdrop ────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 sm:hidden backdrop-blur-[1px] transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Popover Dropdown Card ──────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="پیش‌نمایش سبد خرید"
        className={cn(
          // Mobile: floating below header, centered within viewport
          // Desktop (sm+): anchored to cart button with end-0 (RTL left-0)
          'fixed inset-x-3 top-[68px] max-w-md mx-auto sm:max-w-none sm:mx-0',
          'sm:absolute sm:inset-x-auto sm:top-full sm:mt-2 sm:end-0 sm:w-[380px]',
          'z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 text-gray-800',
          'origin-top transition-all duration-200 ease-out',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible',
        )}
      >
        {/* Invisible bridge over the gap to maintain hover continuity on desktop */}
        <div className="hidden sm:block absolute -top-3 inset-x-0 h-3" aria-hidden="true" />

        {/* ── Popover Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-navy-900">سبد خرید</span>
            {hydrated && count > 0 && (
              <span className="text-[11px] bg-brand/10 text-brand font-bold px-2 py-0.5 rounded-full">
                {toPersianDigits(count)} کالا
              </span>
            )}
          </div>
          {hydrated && items.length > 0 && (
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-brand transition-colors font-medium"
            >
              مشاهده کامل
            </Link>
          )}
        </div>

        {/* ── Popover Body ─────────────────────────────────────────── */}
        {!hydrated ? (
          <div className="py-8 text-center text-xs text-gray-400">
            در حال بارگذاری...
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-navy-900 mb-1">سبد خرید شما خالی است</p>
            <p className="text-xs text-gray-500 mb-4">می‌توانید محصولات را بررسی کرده و به سبد خود اضافه کنید.</p>
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand/20"
            >
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          /* Items List */
          <div className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-gray-100 px-3.5 py-1 scrollbar-thin">
            {items.map((item) => (
              <div
                key={item.productId}
                className="py-3 flex items-start gap-3 group relative"
              >
                {/* Product Image */}
                <Link
                  href={`/product/${item.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 block"
                >
                  <Image
                    src={productImage(item.image)}
                    alt={item.title || 'تصویر محصول'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="56px"
                  />
                </Link>

                {/* Info & Subtotal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-medium text-gray-800 hover:text-brand line-clamp-2 transition-colors leading-snug"
                    >
                      {item.title}
                    </Link>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(item.productId);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 -m-1 rounded-md transition-colors flex-shrink-0"
                      title="حذف از سبد خرید"
                      aria-label={`حذف ${item.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-medium">
                        {toPersianDigits(item.quantity)} عدد
                      </span>
                      <span className="text-[11px]">× {formatToman(item.price)}</span>
                    </div>
                    <div className="font-bold text-navy-900 text-xs">
                      {formatToman(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Popover Footer ───────────────────────────────────────── */}
        {hydrated && items.length > 0 && (
          <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 rounded-b-2xl space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium text-xs">مبلغ قابل پرداخت:</span>
              <span className="font-extrabold text-base text-brand">{formatToman(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 text-xs font-semibold transition-colors shadow-sm"
              >
                <ShoppingCart className="w-4 h-4 text-gray-500" />
                <span>مشاهده سبد</span>
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand/20 transition-all"
              >
                <span>تسویه حساب</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
