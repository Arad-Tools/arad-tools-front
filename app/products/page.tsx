import { Suspense } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import ProductListing from '@/components/products/ProductListing';
import { getCategories, getProductsFiltered, getProductFilters } from '@/lib/api';
import { parseFiltersFromSearchParams, DEFAULT_FILTERS } from '@/lib/product-filters';
import type { ProductFilters } from '@/lib/types';

export const revalidate = 60;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toURLSearchParams(
  params: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, v));
    } else if (value != null) {
      sp.set(key, value);
    }
  }

  return sp;
}

async function ProductsPageContent({ searchParams }: Props) {
  const rawParams = await searchParams;
  const parsed = parseFiltersFromSearchParams(toURLSearchParams(rawParams));
  const filters: ProductFilters = { ...DEFAULT_FILTERS, ...parsed };

  const [categories, productResult, filterMeta] = await Promise.all([
    getCategories(),
    getProductsFiltered(filters),
    getProductFilters(filters),
  ]);

  return (
    <ProductListing
      categories={categories}
      initialProducts={productResult.products}
      initialMeta={filterMeta}
      initialFilters={filters}
      initialPagination={{
        currentPage: productResult.meta.currentPage,
        lastPage: productResult.meta.lastPage,
        total: productResult.meta.total,
      }}
    />
  );
}

export default function ProductsPage(props: Props) {
  return (
    <ShopShell>
      <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center text-gray-400">در حال بارگذاری...</div>}>
        <ProductsPageContent {...props} />
      </Suspense>
    </ShopShell>
  );
}
