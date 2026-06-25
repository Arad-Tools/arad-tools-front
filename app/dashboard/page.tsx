'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { User, ShoppingBag, Phone, Mail } from 'lucide-react';
import ShopShell from '@/components/layout/ShopShell';
import { useAuth } from '@/lib/stores/auth-context';
import { toPersianDigits } from '@/lib/utils';

export default function DashboardPage() {
  const { customer, isAuthenticated, hydrated, openLogin } = useAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      openLogin();
    }
  }, [hydrated, isAuthenticated, openLogin]);

  if (!hydrated || !isAuthenticated || !customer) {
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="bg-navy-900 text-white px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{customer.name ?? 'کاربر'}</h1>
                  <p className="text-gray-400 text-sm mt-0.5" dir="ltr">{toPersianDigits(customer.mobile)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>شماره موبایل:</span>
                <span dir="ltr" className="font-medium text-gray-900">{toPersianDigits(customer.mobile)}</span>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>ایمیل:</span>
                  <span dir="ltr" className="font-medium text-gray-900">{customer.email}</span>
                </div>
              )}

              <hr className="border-gray-100" />

              <Link
                href="/cart"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-brand/30 hover:bg-brand/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-brand" />
                  <span className="font-medium">سبد خرید</span>
                </div>
                <span className="text-sm text-gray-400">مشاهده</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
