import Link from 'next/link';
import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
}

// Fallback categories when API fails
const FALLBACK: Category[] = [
  { id: '1', name: 'ابزار برقی',      icon: '⚡', slug: 'power-tools', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: '2', name: 'ابزار دستی',      icon: '🔧', slug: 'hand-tools',  color: 'bg-blue-50 text-blue-700 border-blue-200'       },
  { id: '3', name: 'جوشکاری',         icon: '🔥', slug: 'welding',     color: 'bg-red-50 text-red-700 border-red-200'         },
  { id: '4', name: 'اندازه‌گیری',     icon: '📐', slug: 'measuring',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: '5', name: 'ایمنی',           icon: '🦺', slug: 'safety',      color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
];

export default function CategoryStrip({ categories }: Props) {
  const items = categories.length > 0 ? categories : FALLBACK;

  return (
    <nav
      className="bg-white border-b border-gray-200 shadow-sm"
      aria-label="دسته‌بندی‌ها"
    >
      <div className="container mx-auto px-4">
        {/* Horizontal scroll — in RTL, scroll start is on the right */}
        <div
          className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-3"
          role="list"
        >
          {items.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              role="listitem"
              className={`
                flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold
                whitespace-nowrap transition-all duration-150
                hover:shadow-md hover:-translate-y-0.5 active:scale-95
                focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-none
                ${cat.color}
              `}
            >
              <span role="img" aria-label={cat.name} className="text-base leading-none">
                {cat.icon}
              </span>
              {cat.name}
            </Link>
          ))}

          {/* View all — always last (leftmost in RTL) */}
          <Link
            href="/categories"
            className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-300 bg-gray-50 text-gray-600 text-sm font-semibold whitespace-nowrap hover:bg-gray-100 transition-colors"
          >
            همه دسته‌بندی‌ها →
          </Link>
        </div>
      </div>
    </nav>
  );
}
