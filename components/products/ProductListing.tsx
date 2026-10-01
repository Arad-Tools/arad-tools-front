'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, SearchX, Sparkles, Folder, RotateCcw } from 'lucide-react';
import type {
  Category, Product, ProductFilters, ProductFilterMeta, ProductListingPreset, SearchFallbackData,
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
  initialFallback?: SearchFallbackData | null;
}

export default function ProductListing({
  categories,
  preset,
  initialProducts,
  initialMeta,
  initialFilters,
  initialPagination,
  initialFallback,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState(initialProducts);
  const [fallback, setFallback] = useState<SearchFallbackData | null | undefined>(initialFallback);
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
      setFallback(productResult.fallback ?? null);
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
        onSelectCategory={(slug) => {
          handleFilterChange({
            ...filters,
            category: slug ? [slug] : undefined,
            subcategory: undefined,
            spec: undefined,
            page: 1,
          });
        }}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">
            {filters.q
              ? `نتایج جستجو برای «${filters.q}»`
              : (preset?.title ?? 'محصولات')}
          </h1>
          {(preset?.subtitle || filters.q) && (
            <p className="text-sm text-gray-500 mt-1">
              {filters.q
                ? `${toPersianDigits(pagination.total)} محصول یافت شد`
                : preset?.subtitle}
            </p>
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
                <div className="space-y-8">
                  <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-4">
                      <SearchX className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {filters.q
                        ? `هیچ نتیجه‌ای برای «${filters.q}» پیدا نشد`
                        : 'محصولی با این فیلترها یافت نشد'}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mt-1.5">
                      املای کلمات را بررسی کنید یا عبارت ساده‌تر و کلی‌تری را جستجو نمایید.
                    </p>

                    {/* Did you mean suggestion (شرط ۱۸) */}
                    {fallback?.did_you_mean && (
                      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-amber-900">
                        <span>آیا منظور شما</span>
                        <button
                          type="button"
                          onClick={() => handleFilterChange({ ...filters, q: fallback.did_you_mean! })}
                          className="font-black text-brand hover:underline"
                        >
                          «{fallback.did_you_mean}»
                        </button>
                        <span>بود؟</span>
                      </div>
                    )}

                    {/* Related Categories (شرط ۱۸) */}
                    {fallback?.related_categories && fallback.related_categories.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100 max-w-xl mx-auto">
                        <p className="text-xs font-bold text-gray-400 mb-3">دسته‌بندی‌های مرتبط پیشنهادی:</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {fallback.related_categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/products?category=${encodeURIComponent(cat.slug)}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-brand/10 border border-gray-200/80 hover:border-brand/30 text-gray-700 hover:text-brand rounded-lg text-xs font-semibold transition-colors"
                            >
                              <Folder className="w-3.5 h-3.5 text-gray-400" />
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clear Filters Button */}
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => handleFilterChange({ ...DEFAULT_FILTERS, ...presetDefaults })}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        پاک کردن جستجو و فیلترها
                      </button>
                    </div>
                  </div>

                  {/* Recommended / In-stock products fallback (شرط ۱۸: کاربر هرگز با بن‌بست مواجه نشود) */}
                  {fallback?.suggested_products && fallback.suggested_products.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            کالاهای پیشنهادی و پربازدید در انبار
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5">
                            شاید این محصولات محبوب برای شما کاربردی باشند
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                        {fallback.suggested_products.map((p, i) => (
                          <ProductCard
                            key={p.id}
                            product={{
                              id: String(p.id),
                              title: p.title,
                              slug: p.slug,
                              image: p.image || '',
                              price: p.price,
                              rating: 5,
                              reviewsCount: 0,
                              category: '',
                              brand: '',
                              inStock: p.in_stock,
                            }}
                            priority={i < 3}
                          />
                        ))}
                      </div>
                    </div>
                  )}
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
