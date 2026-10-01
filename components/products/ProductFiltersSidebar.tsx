'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Filter as FilterIcon, Layers, Search, Sparkles, Tag } from 'lucide-react';
import type { FilterOption, ProductFilterMeta, ProductFilters, SpecFilterGroup } from '@/lib/types';
import { clearAllFilters, toggleArrayFilter, toggleSpecFilter } from '@/lib/product-filters';
import { cn, formatToman, toPersianDigits } from '@/lib/utils';

interface Props {
  filters: ProductFilters;
  meta: ProductFilterMeta;
  onChange: (filters: ProductFilters) => void;
  className?: string;
}

function FilterSection({
  title,
  icon,
  badgeCount,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  badgeCount?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0 py-3.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-bold text-gray-800 mb-2.5 transition-colors hover:text-brand"
      >
        <span className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
          {badgeCount != null && badgeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold rounded-full bg-brand text-white">
              {toPersianDigits(badgeCount)}
            </span>
          )}
        </span>
        <span className="text-gray-400 hover:text-gray-600">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function SearchableCheckboxList({
  options,
  selected,
  onToggle,
  placeholder = 'جستجو در گزینه‌ها...',
}: {
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  if (!options.length) {
    return <p className="text-xs text-gray-400 py-1">گزینه‌ای موجود نیست</p>;
  }

  return (
    <div className="space-y-2">
      {options.length > 5 && (
        <div className="relative mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-3 pr-7 py-1 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand/40"
          />
          <Search className="w-3 h-3 text-gray-400 absolute right-2 top-2" />
        </div>
      )}

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 scrollbar-hide">
        {filteredOptions.length === 0 ? (
          <p className="text-xs text-gray-400 py-1">موردی یافت نشد</p>
        ) : (
          filteredOptions.map((opt) => {
            const checked = selected.includes(opt.value);

            return (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 text-xs transition-colors',
                  checked ? 'bg-brand/10 text-brand font-medium' : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(opt.value)}
                  className="rounded border-gray-300 text-brand focus:ring-brand/30 w-3.5 h-3.5"
                />
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.count != null && (
                  <span className="text-[11px] text-gray-400 font-mono">
                    ({toPersianDigits(opt.count)})
                  </span>
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ProductFiltersSidebar({ filters, meta, onChange, className }: Props) {
  const [minPrice, setMinPrice] = useState(String(filters.min_price ?? ''));
  const [maxPrice, setMaxPrice] = useState(String(filters.max_price ?? ''));

  const applyPriceRange = () => {
    onChange({
      ...filters,
      page: 1,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  // Merge category specific filters from API
  const categoryFilters = useMemo(() => {
    const map = new Map<string, SpecFilterGroup>();

    // 1. Dedicated category filters from API
    if (meta.category_filters) {
      Object.entries(meta.category_filters).forEach(([k, group]) => {
        map.set(k, group);
      });
    }

    // 2. Fallbacks from attributes and tools if not already present
    if (meta.attributes) {
      Object.entries(meta.attributes).forEach(([k, group]) => {
        if (!map.has(k)) map.set(k, group);
      });
    }
    if (meta.tools) {
      Object.entries(meta.tools).forEach(([k, group]) => {
        if (!map.has(k)) map.set(k, group);
      });
    }

    return Array.from(map.values());
  }, [meta.category_filters, meta.attributes, meta.tools]);

  const hasActiveFilters = Boolean(
    meta.activeFilters?.length > 0 ||
    filters.on_sale ||
    filters.min_price ||
    filters.max_price ||
    filters.brand?.length ||
    filters.stock?.length ||
    Object.keys(filters.spec ?? {}).length > 0
  );

  return (
    <aside className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden', className)}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-brand" />
          <span>فیلتر محصولات</span>
        </h2>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange(clearAllFilters())}
            className="text-[11px] font-semibold text-brand hover:text-brand-700 transition-colors"
          >
            حذف همه
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-6">
        {/* Category & Subcategory Navigation */}
        {meta.categories?.length > 0 && (
          <FilterSection
            title="دسته‌بندی"
            badgeCount={filters.category?.length}
            defaultOpen={true}
          >
            <SearchableCheckboxList
              options={meta.categories}
              selected={filters.category ?? []}
              onToggle={(v) => onChange(toggleArrayFilter(filters, 'category', v))}
              placeholder="جستجو در دسته‌ها..."
            />
          </FilterSection>
        )}

        {meta.subcategories?.length > 0 && (
          <FilterSection
            title="زیردسته‌بندی"
            badgeCount={filters.subcategory?.length}
            defaultOpen={true}
          >
            <SearchableCheckboxList
              options={meta.subcategories}
              selected={filters.subcategory ?? []}
              onToggle={(v) => onChange(toggleArrayFilter(filters, 'subcategory', v))}
              placeholder="جستجو در زیردسته‌ها..."
            />
          </FilterSection>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            1. فیلترهای عمومی محصولات (General Filters)
            1. برند  2. محدوده قیمت  3. موجودی کالا  4. تخفیف‌دار
           ══════════════════════════════════════════════════════════════════ */}
        <div className="my-2 pt-3 pb-1">
          <div className="flex items-center gap-1.5 px-1 pb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-black tracking-wide text-gray-700">فیلترهای عمومی</span>
          </div>

          {/* 1. برند (Brand) */}
          <FilterSection
            title="برند"
            badgeCount={filters.brand?.length}
            defaultOpen={true}
          >
            <SearchableCheckboxList
              options={meta.brands ?? []}
              selected={filters.brand ?? []}
              onToggle={(v) => onChange(toggleArrayFilter(filters, 'brand', v))}
              placeholder="جستجوی برند..."
            />
          </FilterSection>

          {/* 2. محدوده قیمت (Price Range) */}
          <FilterSection title="محدوده قیمت" defaultOpen={true}>
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[11px] text-gray-400 mb-1">از قیمت (تومان)</span>
                  <input
                    type="number"
                    placeholder="حداقل"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-brand/40"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-gray-400 mb-1">تا قیمت (تومان)</span>
                  <input
                    type="number"
                    placeholder="حداکثر"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-brand/40"
                  />
                </div>
              </div>

              {meta.priceRange?.max > 0 && (
                <p className="text-[11px] text-gray-400 font-medium text-center">
                  {formatToman(meta.priceRange.min)} تا {formatToman(meta.priceRange.max)}
                </p>
              )}

              <button
                type="button"
                onClick={applyPriceRange}
                className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
              >
                اعمال محدوده قیمت
              </button>
            </div>
          </FilterSection>

          {/* 3. موجودی کالا (Stock) */}
          <FilterSection
            title="موجودی کالا"
            badgeCount={filters.stock?.length}
            defaultOpen={true}
          >
            <SearchableCheckboxList
              options={meta.stock ?? []}
              selected={filters.stock ?? []}
              onToggle={(v) => onChange(toggleArrayFilter(filters, 'stock', v))}
            />
          </FilterSection>

          {/* 4. تخفیف‌دار (On Sale / Discounted) */}
          <div className="py-2.5">
            <label className={cn(
              'flex items-center justify-between cursor-pointer rounded-xl p-2.5 border transition-all text-xs font-semibold',
              filters.on_sale
                ? 'bg-red-50/70 border-red-200 text-red-700'
                : 'bg-gray-50/70 border-gray-100 text-gray-700 hover:bg-gray-100/70'
            )}>
              <span className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-red-500" />
                <span>فقط کالاهای تخفیف‌دار</span>
              </span>
              <input
                type="checkbox"
                checked={Boolean(filters.on_sale)}
                onChange={() => onChange({
                  ...filters,
                  page: 1,
                  on_sale: !filters.on_sale,
                })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-400 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            2. فیلترهای اختصاصی دسته‌بندی (Category-Specific Filters)
            شامل فیلترهای انتخاب‌شده برای دسته‌بندی فعلی:
            نوع ابزار، ولتاژ، توان، نوع باتری، جنس، سایز، ابعاد، لولا، ریل، و...
           ══════════════════════════════════════════════════════════════════ */}
        {categoryFilters.length > 0 && (
          <div className="my-2 pt-3">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-black tracking-wide text-gray-700">فیلترهای اختصاصی دسته‌بندی</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {toPersianDigits(categoryFilters.length)} فیلتر
              </span>
            </div>

            {categoryFilters.map((group) => {
              const selectedGroupValues = filters.spec?.[group.key] ?? [];

              return (
                <FilterSection
                  key={group.key}
                  title={group.label}
                  badgeCount={selectedGroupValues.length}
                  defaultOpen={selectedGroupValues.length > 0}
                >
                  <SearchableCheckboxList
                    options={group.options}
                    selected={selectedGroupValues}
                    onToggle={(v) => onChange(toggleSpecFilter(filters, group.key, v))}
                    placeholder={`جستجو در ${group.label}...`}
                  />
                </FilterSection>
              );
            })}
          </div>
        )}

        {/* Additional Optional Attributes (امتیاز کاربران و برچسب‌های ویژه) */}
        <div className="mt-2 pt-2">
          {meta.rating?.length > 0 && (
            <FilterSection title="امتیاز کاربران" defaultOpen={false}>
              <SearchableCheckboxList
                options={meta.rating}
                selected={filters.min_rating ? [String(filters.min_rating)] : []}
                onToggle={(v) => onChange({
                  ...filters,
                  page: 1,
                  min_rating: filters.min_rating === Number(v) ? undefined : Number(v),
                })}
              />
            </FilterSection>
          )}

          <FilterSection title="سایر نشان‌ها" defaultOpen={false}>
            <div className="space-y-2">
              {[
                { key: 'featured', label: 'محصول ویژه', checked: Boolean(filters.featured) },
                { key: 'bestseller', label: 'پرفروش‌ترین‌ها', checked: Boolean(filters.bestseller) },
                { key: 'is_new', label: 'جدیدترین محصولات', checked: Boolean(filters.is_new) },
              ].map(({ key, label, checked }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange({
                      ...filters,
                      page: 1,
                      [key]: !checked,
                    })}
                    className="rounded border-gray-300 text-brand focus:ring-brand/30 w-3.5 h-3.5"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>
    </aside>
  );
}
