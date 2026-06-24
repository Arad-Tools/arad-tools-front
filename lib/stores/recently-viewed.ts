'use client';

import { useCallback } from 'react';
import type { ProductDetail } from '@/lib/types';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

const MAX_RECENT = 12;

export function useRecentlyViewed() {
  const { value: slugs, setValue, hydrated } = useLocalStorage<string[]>('arad-recently-viewed', []);

  const add = useCallback(
    (slug: string) => {
      setValue((prev) => {
        const filtered = prev.filter((s) => s !== slug);
        return [slug, ...filtered].slice(0, MAX_RECENT);
      });
    },
    [setValue],
  );

  return { slugs, add, hydrated };
}

export function filterRecentProducts(
  products: ProductDetail['relatedProducts'],
  recentSlugs: string[],
  currentSlug: string,
): ProductDetail['relatedProducts'] {
  return recentSlugs
    .filter((slug) => slug !== currentSlug)
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
}
