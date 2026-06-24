'use client';

import { X } from 'lucide-react';
import type { ActiveFilter, ProductFilters } from '@/lib/types';
import { clearAllFilters, removeActiveFilter } from '@/lib/product-filters';

interface Props {
  activeFilters: ActiveFilter[];
  filters: ProductFilters;
  presetDefaults?: Partial<ProductFilters>;
  onChange: (filters: ProductFilters) => void;
}

export default function ActiveFilterChips({
  activeFilters,
  filters,
  presetDefaults,
  onChange,
}: Props) {
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => onChange(removeActiveFilter(filters, chip.key, chip.value))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold border border-navy-100 hover:bg-navy-100 transition-colors"
        >
          <span className="text-gray-500">{chip.label}:</span>
          {chip.display}
          <X className="w-3 h-3 opacity-60" />
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(clearAllFilters(presetDefaults))}
        className="text-xs font-semibold text-brand hover:text-brand-700 px-2"
      >
        پاک کردن همه
      </button>
    </div>
  );
}
