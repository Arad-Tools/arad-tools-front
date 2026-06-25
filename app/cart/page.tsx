'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import ShopShell from '@/components/layout/ShopShell';
import { useCart } from '@/lib/stores/cart-context';
import { formatToman, toPersianDigits } from '@/lib/utils';

export default function CartPage() {
  const { items, hydrated, updateQuantity, removeItem, count } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!hydrated) {
    return (
      <ShopShell>
        <div className="container mx-auto px-4 py-16 text-center text-gray-500">
          در حال بارگذاری...
        </div>
      </ShopShell>
    );
  }

  return (
    <ShopShell>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-900 mb-6">سبد خرید</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">سبد خرید شما خالی است.</p>
            <Link href="/products" className="btn-primary inline-flex">
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 flex gap-4"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} className="font-medium text-gray-900 hover:text-brand line-clamp-2">
                      {item.title}
                    </Link>
                    <p className="text-brand font-bold mt-1">{formatToman(item.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-50"
                          aria-label="کاهش"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-medium">{toPersianDigits(item.quantity)}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-50"
                          aria-label="افزایش"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        aria-label="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 h-fit">
              <h2 className="font-bold text-lg mb-4">خلاصه سفارش</h2>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>تعداد اقلام</span>
                <span>{toPersianDigits(count)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-100">
                <span>جمع کل</span>
                <span className="text-brand">{formatToman(total)}</span>
              </div>
              <button type="button" className="btn-primary w-full mt-6" disabled>
                ادامه خرید (به‌زودی)
              </button>
            </div>
          </div>
        )}
      </div>
    </ShopShell>
  );
}
