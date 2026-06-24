'use client';

import { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { notifyStockAvailable } from '@/lib/api';
import { toPersianDigits } from '@/lib/utils';

export default function StockNotifyForm({ slug }: { slug: string }) {
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^09\d{9}$/.test(mobile)) {
      setError('شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۱۲۳۴۵۶۷)');
      return;
    }

    setStatus('loading');
    const ok = await notifyStockAvailable(slug, mobile);
    setStatus(ok ? 'success' : 'error');

    if (!ok) {
      setError('خطا در ثبت درخواست. دوباره تلاش کنید.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm font-medium">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        درخواست شما ثبت شد. به محض موجود شدن، به شما اطلاع می‌دهیم.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-600">
        این محصول در حال حاضر موجود نیست. شماره موبایل خود را وارد کنید تا به محض موجود شدن مطلع شوید.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
          dir="ltr"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
          aria-label="شماره موبایل"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy text-white font-bold text-sm hover:bg-navy-700 disabled:opacity-60 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {status === 'loading' ? 'در حال ثبت...' : 'موجود شد اطلاع بده'}
        </button>
      </div>
      {(error || status === 'error') && (
        <p className="text-sm text-red-600">{error || 'خطا در ثبت درخواست'}</p>
      )}
      <p className="text-xs text-gray-400">
        مثال: {toPersianDigits('09121234567')}
      </p>
    </form>
  );
}
