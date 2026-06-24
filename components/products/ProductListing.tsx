'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type {
  Category, Product, ProductFilters, ProductFilterMeta, ProductListingPreset,
} from '@/lib/types';
import { getProductsFiltered, getProductFilters } from '@/lib/api';
import {
  buildFilterQueryString,
  parseFiltersFromSearchParams,
  filtersCacheKey,
  DEFAULT_FILTERS,
} from '@/lib/product-filters';
import CategoryTabs from './CategoryTabs';
import ProductFiltersSidebar from './ProductFiltersSidebar';
import ActiveFilterChips from './ActiveFilterChips';
import ProductSortBar from './ProductSortBar';
import ProductCard from '@/components/home/ProductCard';
import { cn, toPersianDigits } from '@/lib/utils';

interface Props {
  categories: Category[];
  preset?: ProductListingPreset;
  initialProducts: Product[];
  initialMeta: ProductFilterMeta;
  initialFilters: ProductFilters;
  initialPagination?: { currentPage: number; lastPage: number; total: number };
}

export default function ProductListing({
  categories,
  preset,
  initialProducts,
  initialMeta,
  initialFilters,
  initialPagination,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState(initialProducts);
  const [meta, setMeta] = useState(initialMeta);
  const [pagination, setPagination] = useState({
    currentPage: initialPagination?.currentPage ?? initialFilters.page ?? 1,
    lastPage: initialPagination?.lastPage ?? 1,
    total: initialPagination?.total ?? initialMeta.total,
  });
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const presetDefaults = preset?.defaultFilters;

  const syncUrl = useCallback((nextFilters: ProductFilters) => {
    const qs = buildFilterQueryString(nextFilters);
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [pathname, router]);

  const fetchResults = useCallback(async (nextFilters: ProductFilters) => {
    setLoading(true);
    try {
      const [productResult, filterMeta] = await Promise.all([
        getProductsFiltered(nextFilters),
        getProductFilters(nextFilters),
      ]);
      setProducts(productResult.products);
      setMeta(filterMeta);
      setPagination({
        currentPage: productResult.meta.currentPage,
        lastPage: productResult.meta.lastPage,
        total: productResult.meta.total,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback((nextFilters: ProductFilters) => {
    const merged = { ...DEFAULT_FILTERS, ...presetDefaults, ...nextFilters };
    setFilters(merged);
    syncUrl(merged);

    startTransition(() => {
      fetchResults(merged);
    });
  }, [presetDefaults, syncUrl, fetchResults]);

  // Sync when user navigates with browser back/forward
  useEffect(() => {
    const parsed = parseFiltersFromSearchParams(searchParams);
    const merged = { ...DEFAULT_FILTERS, ...presetDefaults, ...parsed };
    const key = filtersCacheKey(merged);

    if (key !== filtersCacheKey(filters)) {
      setFilters(merged);
      fetchResults(merged);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const activeCategorySlugs = filters.category ?? (
    pathname.startsWith('/category/')
      ? [pathname.replace('/category/', '')]
      : []
  );

  const goToPage = (page: number) => {
    handleFilterChange({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <CategoryTabs
        categories={categories}
        activeSlugs={activeCategorySlugs}
        basePath="/products"
      />

      <div className="container mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">{preset?.title ?? 'محصولات'}</h1>
          {preset?.subtitle && (
            <p className="text-sm text-gray-500 mt-1">{preset.subtitle}</p>
          )}
        </div>

        <div className="flex gap-6 items-start">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-28 self-start">
            <ProductFiltersSidebar
              filters={filters}
              meta={meta}
              onChange={handleFilterChange}
              className="max-h-[calc(100vh-7rem)]"
            />
          </div>

          {/* Mobile drawer */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
                aria-hidden
              />
              <div className="relative ms-auto w-full max-w-sm h-full overflow-y-auto bg-white shadow-xl p-4">
                <ProductFiltersSidebar
                  filters={filters}
                  meta={meta}
                  onChange={(f) => {
                    handleFilterChange(f);
                    setMobileFiltersOpen(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">
            <ProductSortBar
              filters={filters}
              meta={meta}
              onChange={handleFilterChange}
              onToggleMobileFilters={() => setMobileFiltersOpen(true)}
            />

            <ActiveFilterChips
              activeFilters={meta.activeFilters}
              filters={filters}
              presetDefaults={presetDefaults}
              onChange={handleFilterChange}
            />

            {/* Loading overlay */}
            <div className={cn('relative', (loading || isPending) && 'opacity-60 pointer-events-none')}>
              {(loading || isPending) && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-brand animate-spin" />
                </div>
              )}

              {products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-500 font-semibold">محصولی با این فیلترها یافت نشد.</p>
                  <button
                    type="button"
                    onClick={() => handleFilterChange({ ...DEFAULT_FILTERS, ...presetDefaults })}
                    className="mt-4 text-sm font-semibold text-brand hover:text-brand-700"
                  >
                    پاک کردن فیلترها
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} priority={i < 4} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-bold transition-colors',
                      page === pagination.currentPage
                        ? 'bg-navy-800 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-navy-300',
                    )}
                  >
                    {toPersianDigits(page)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
