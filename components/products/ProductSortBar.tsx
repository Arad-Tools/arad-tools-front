'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { ProductFilters, ProductFilterMeta } from '@/lib/types';
import { SORT_LABELS } from '@/lib/product-filters';
import { toPersianDigits } from '@/lib/utils';

interface Props {
  filters: ProductFilters;
  meta: ProductFilterMeta;
  onChange: (filters: ProductFilters) => void;
  onToggleMobileFilters: () => void;
}

export default function ProductSortBar({
  filters,
  meta,
  onChange,
  onToggleMobileFilters,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileFilters}
          className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 text-sm font-semibold text-gray-700 border border-gray-200"
        >
          <SlidersHorizontal className="w-4 h-4" />
          فیلترها
        </button>
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-800">{toPersianDigits(meta.total)}</span>
          {' '}محصول
        </p>
      </div>

      <div className="relative">
        <label htmlFor="product-sort" className="sr-only">مرتب‌سازی</label>
        <select
          id="product-sort"
          value={filters.sort ?? 'newest'}
          onChange={(e) => onChange({ ...filters, sort: e.target.value, page: 1 })}
          className="appearance-none pe-9 ps-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          {(meta.sortOptions.length ? meta.sortOptions : Object.entries(SORT_LABELS).map(([value, label]) => ({ value, label }))).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
