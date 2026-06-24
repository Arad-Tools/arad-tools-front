'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn, formatRating, toPersianDigits } from '@/lib/utils';
import { submitProductReview } from '@/lib/api';
import type { ProductReview } from '@/lib/types';

type SortOption = 'newest' | 'highest' | 'lowest';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'جدیدترین',
  highest: 'بالاترین امتیاز',
  lowest: 'پایین‌ترین امتیاز',
};

interface Props {
  slug: string;
  rating: number;
  reviewsCount: number;
  initialReviews: ProductReview[];
}

export default function ProductReviews({
  slug,
  rating,
  reviewsCount,
  initialReviews,
}: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [sort, setSort] = useState<SortOption>('newest');
  const [authorName, setAuthorName] = useState('');
  const [body, setBody] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const sorted = [...reviews].sort((a, b) => {
    switch (sort) {
      case 'highest': return b.rating - a.rating;
      case 'lowest': return a.rating - b.rating;
      default: return 0;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) return;

    setSubmitting(true);
    setMessage('');

    const review = await submitProductReview(slug, {
      authorName: authorName.trim(),
      rating: userRating,
      body: body.trim() || undefined,
    });

    setSubmitting(false);

    if (review) {
      setReviews((prev) => [review, ...prev]);
      setAuthorName('');
      setBody('');
      setUserRating(5);
      setMessage('نظر شما با موفقیت ثبت شد.');
    } else {
      setMessage('خطا در ثبت نظر. دوباره تلاش کنید.');
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">نظرات و امتیازها</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200',
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-800">{formatRating(rating)}</span>
            <span className="text-sm text-gray-400">
              ({toPersianDigits(reviewsCount)} نظر)
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
                sort === key
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
              )}
            >
              {SORT_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
        <h3 className="text-sm font-bold text-gray-800">ثبت نظر</h3>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setUserRating(i + 1)}
              aria-label={`امتیاز ${i + 1}`}
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  i < userRating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200',
                )}
              />
            </button>
          ))}
        </div>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="نام شما"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          {submitting ? 'در حال ارسال...' : 'ثبت نظر'}
        </button>
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </form>

      <div className="space-y-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">هنوز نظری ثبت نشده است.</p>
        ) : (
          sorted.map((review) => (
            <article key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 text-sm">{review.authorName}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3.5 h-3.5',
                        i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200',
                      )}
                    />
                  ))}
                </div>
              </div>
              {review.body && (
                <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
