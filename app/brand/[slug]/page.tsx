import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ShopShell from '@/components/layout/ShopShell';
import ProductListing from '@/components/products/ProductListing';
import { getBrand, getCategories, getProductsFiltered, getProductFilters } from '@/lib/api';
import { parseFiltersFromSearchParams, DEFAULT_FILTERS } from '@/lib/product-filters';
import type { ProductFilters } from '@/lib/types';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
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

async function BrandPageContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) {
    notFound();
  }

  const rawParams = await searchParams;
  const parsed = parseFiltersFromSearchParams(toURLSearchParams(rawParams));
  const filters: ProductFilters = {
    ...DEFAULT_FILTERS,
    ...parsed,
    brand: parsed.brand?.length ? parsed.brand : [slug],
  };

  const [categories, productResult, filterMeta] = await Promise.all([
    getCategories(),
    getProductsFiltered(filters),
    getProductFilters(filters),
  ]);

  return (
    <ProductListing
      categories={categories}
      preset={{
        title: brand.name,
        subtitle: `محصولات برند ${brand.name}`,
        defaultFilters: { brand: [slug] },
      }}
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

export default function BrandProductsPage(props: Props) {
  return (
    <ShopShell>
      <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center text-gray-400">در حال بارگذاری...</div>}>
        <BrandPageContent {...props} />
      </Suspense>
    </ShopShell>
  );
}
