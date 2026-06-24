'use client';

import { useCallback } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

const MAX_COMPARE = 4;

export function useWishlist() {
  const { value: slugs, setValue, hydrated } = useLocalStorage<string[]>('arad-wishlist', []);

  const toggle = useCallback(
    (slug: string) => {
      setValue((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
      );
    },
    [setValue],
  );

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, toggle, has, hydrated };
}

export function useCompare() {
  const { value: slugs, setValue, hydrated } = useLocalStorage<string[]>('arad-compare', []);

  const toggle = useCallback(
    (slug: string) => {
      setValue((prev) => {
        if (prev.includes(slug)) {
          return prev.filter((s) => s !== slug);
        }
        if (prev.length >= MAX_COMPARE) {
          return [...prev.slice(1), slug];
        }
        return [...prev, slug];
      });
    },
    [setValue],
  );

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, toggle, has, hydrated, max: MAX_COMPARE };
}
