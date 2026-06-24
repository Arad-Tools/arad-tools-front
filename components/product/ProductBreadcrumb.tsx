import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/types';

export default function ProductBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.href} className="flex items-center gap-1">
            {index > 0 && <ChevronLeft className="w-3.5 h-3.5 text-gray-300" aria-hidden />}
            {isLast ? (
              <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-brand transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
