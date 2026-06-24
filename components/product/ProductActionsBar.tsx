'use client';

import { useState } from 'react';
import {
  Heart, GitCompare, Share2, Link2, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlist, useCompare } from '@/lib/stores/product-actions';

interface Props {
  slug: string;
  title: string;
}

export default function ProductActionsBar({ slug, title }: Props) {
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const { toggle: toggleCompare, has: inCompare } = useCompare();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/product/${slug}`
    : `/product/${slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const shareLinks = [
    {
      label: 'واتساپ',
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + pageUrl)}`,
      className: 'bg-green-500',
    },
    {
      label: 'تلگرام',
      href: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`,
      className: 'bg-sky-500',
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => toggleWishlist(slug)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
          inWishlist(slug)
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        )}
        aria-label="افزودن به علاقه‌مندی‌ها"
      >
        <Heart className={cn('w-4 h-4', inWishlist(slug) && 'fill-current')} />
        <span className="hidden sm:inline">علاقه‌مندی</span>
      </button>

      <button
        type="button"
        onClick={() => toggleCompare(slug)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
          inCompare(slug)
            ? 'border-navy/30 bg-navy/5 text-navy'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        )}
        aria-label="افزودن به مقایسه"
      >
        <GitCompare className="w-4 h-4" />
        <span className="hidden sm:inline">مقایسه</span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShareOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 text-sm font-medium transition-all"
          aria-label="اشتراک‌گذاری"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">اشتراک</span>
        </button>

        {shareOpen && (
          <div className="absolute top-full mt-2 end-0 z-20 bg-white rounded-xl shadow-lg border border-gray-100 p-2 min-w-[160px] animate-in fade-in">
            {shareLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('block text-center text-white text-sm font-semibold py-2 px-3 rounded-lg mb-1 last:mb-0', link.className)}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
              {copied ? 'کپی شد!' : 'کپی لینک'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
