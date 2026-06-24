'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ProductFilters, ProductFilterMeta } from '@/lib/types';
import { toggleArrayFilter, toggleSpecFilter } from '@/lib/product-filters';
import { cn, formatToman, toPersianDigits } from '@/lib/utils';

interface Props {
  filters: ProductFilters;
  meta: ProductFilterMeta;
  onChange: (filters: ProductFilters) => void;
  className?: string;
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0 py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-bold text-gray-800 mb-3"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && children}
    </div>
  );
}

function MultiCheckbox({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string; count?: number }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (!options.length) {
    return <p className="text-xs text-gray-400">گزینه‌ای موجود نیست</p>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
      {options.map((opt) => {
        const checked = selected.includes(opt.value);

        return (
          <label
            key={opt.value}
            className={cn(
              'flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 text-sm transition-colors',
              checked ? 'bg-brand/5 text-brand' : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(opt.value)}
              className="rounded border-gray-300 text-brand focus:ring-brand/30"
            />
            <span className="flex-1">{opt.label}</span>
            {opt.count != null && (
              <span className="text-xs text-gray-400">{toPersianDigits(opt.count)}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export default function ProductFiltersSidebar({ filters, meta, onChange, className }: Props) {
  const [minPrice, setMinPrice] = useState(String(filters.min_price ?? meta.priceRange.min ?? ''));
  const [maxPrice, setMaxPrice] = useState(String(filters.max_price ?? meta.priceRange.max ?? ''));

  const applyPriceRange = () => {
    onChange({
      ...filters,
      page: 1,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const specGroups = [
    ...Object.values(meta.attributes ?? {}),
    ...Object.values(meta.tools ?? {}),
  ];

  return (
    <aside className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden', className)}>
      <h2 className="text-base font-black text-gray-900 px-4 pt-4 pb-2 flex-shrink-0">فیلتر محصولات</h2>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
      <FilterSection title="دسته‌بندی">
        <MultiCheckbox
          options={meta.categories}
          selected={filters.category ?? []}
          onToggle={(v) => onChange(toggleArrayFilter(filters, 'category', v))}
        />
      </FilterSection>

      {meta.subcategories.length > 0 && (
        <FilterSection title="زیردسته‌بندی">
          <MultiCheckbox
            options={meta.subcategories}
            selected={filters.subcategory ?? []}
            onToggle={(v) => onChange(toggleArrayFilter(filters, 'subcategory', v))}
          />
        </FilterSection>
      )}

      <FilterSection title="برند">
        <MultiCheckbox
          options={meta.brands}
          selected={filters.brand ?? []}
          onToggle={(v) => onChange(toggleArrayFilter(filters, 'brand', v))}
        />
      </FilterSection>

      <FilterSection title="بازه قیمت">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="حداقل"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
            />
            <input
              type="number"
              placeholder="حداکثر"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
            />
          </div>
          {meta.priceRange.max > 0 && (
            <p className="text-xs text-gray-400">
              {formatToman(meta.priceRange.min)} — {formatToman(meta.priceRange.max)}
            </p>
          )}
          <button
            type="button"
            onClick={applyPriceRange}
            className="w-full py-2 rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-700 transition-colors"
          >
            اعمال قیمت
          </button>
        </div>
      </FilterSection>

      <FilterSection title="موجودی">
        <MultiCheckbox
          options={meta.stock}
          selected={filters.stock ?? []}
          onToggle={(v) => onChange(toggleArrayFilter(filters, 'stock', v))}
        />
      </FilterSection>

      <FilterSection title="امتیاز کاربران">
        <MultiCheckbox
          options={meta.rating}
          selected={filters.min_rating ? [String(filters.min_rating)] : []}
          onToggle={(v) => onChange({
            ...filters,
            page: 1,
            min_rating: filters.min_rating === Number(v) ? undefined : Number(v),
          })}
        />
      </FilterSection>

      <FilterSection title="ویژگی‌های محصول">
        <div className="space-y-3">
          {[
            { key: 'on_sale', label: 'تخفیف‌دار', checked: !!filters.on_sale },
            { key: 'featured', label: 'محصول ویژه', checked: !!filters.featured },
            { key: 'bestseller', label: 'پرفروش', checked: !!filters.bestseller },
            { key: 'is_new', label: 'جدیدترین', checked: !!filters.is_new },
          ].map(({ key, label, checked }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-600">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange({
                  ...filters,
                  page: 1,
                  [key]: !checked,
                })}
                className="rounded border-gray-300 text-brand focus:ring-brand/30"
              />
              {label}
            </label>
          ))}
        </div>
      </FilterSection>

      {specGroups.map((group) => (
        <FilterSection key={group.key} title={group.label} defaultOpen={false}>
          <MultiCheckbox
            options={group.options}
            selected={filters.spec?.[group.key] ?? []}
            onToggle={(v) => onChange(toggleSpecFilter(filters, group.key, v))}
          />
        </FilterSection>
      ))}
      </div>
    </aside>
  );
}
