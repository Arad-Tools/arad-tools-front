import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ShopShell from '@/components/layout/ShopShell';
import ProductListing from '@/components/products/ProductListing';
import { getCategories, getProductsFiltered, getProductFilters } from '@/lib/api';
import { parseFiltersFromSearchParams, DEFAULT_FILTERS } from '@/lib/product-filters';
import { PRODUCT_PRESETS, VALID_PRESETS } from '@/lib/product-presets';
import type { ProductFilters } from '@/lib/types';

export const revalidate = 60;

interface Props {
  params: Promise<{ preset: string }>;
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

async function PresetPageContent({ params, searchParams }: Props) {
  const { preset: presetSlug } = await params;

  if (!VALID_PRESETS.includes(presetSlug)) {
    notFound();
  }

  const preset = PRODUCT_PRESETS[presetSlug];
  const rawParams = await searchParams;
  const parsed = parseFiltersFromSearchParams(toURLSearchParams(rawParams));
  const filters: ProductFilters = {
    ...DEFAULT_FILTERS,
    ...preset.defaultFilters,
    ...parsed,
  };

  const [categories, productResult, filterMeta] = await Promise.all([
    getCategories(),
    getProductsFiltered(filters),
    getProductFilters(filters),
  ]);

  return (
    <ProductListing
      categories={categories}
      preset={preset}
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

export default function PresetProductsPage(props: Props) {
  return (
    <ShopShell>
      <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center text-gray-400">در حال بارگذاری...</div>}>
        <PresetPageContent {...props} />
      </Suspense>
    </ShopShell>
  );
}
