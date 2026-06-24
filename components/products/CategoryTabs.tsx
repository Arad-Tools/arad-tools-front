'use client';

import Link from 'next/link';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  categories: Category[];
  activeSlugs?: string[];
  basePath?: string;
}

export default function CategoryTabs({
  categories,
  activeSlugs = [],
  basePath = '/products',
}: Props) {
  const isAllActive = activeSlugs.length === 0;

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
          <Link
            href={basePath}
            className={cn(
              'flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all',
              isAllActive
                ? 'bg-navy-800 text-white border-navy-800'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-navy-300 hover:text-navy-800',
            )}
          >
            همه محصولات
          </Link>

          {categories.map((cat) => {
            const active = activeSlugs.includes(cat.slug);

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all',
                  active
                    ? 'bg-navy-800 text-white border-navy-800'
                    : cn(cat.color, 'hover:shadow-sm'),
                )}
              >
                <span aria-hidden>{cat.icon}</span>
                {cat.name}
              </Link>
            );
          })}

          <Link
            href="/categories"
            className="flex-shrink-0 text-sm font-semibold text-brand hover:text-brand-700 px-2 whitespace-nowrap"
          >
            همه دسته‌بندی‌ها →
          </Link>
        </div>
      </div>
    </div>
  );
}
