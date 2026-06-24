import type { ProductFilters } from './types';

const ARRAY_KEYS = ['category', 'subcategory', 'brand', 'stock'] as const;
const BOOLEAN_KEYS = ['on_sale', 'featured', 'bestseller', 'is_new'] as const;

export const DEFAULT_FILTERS: ProductFilters = {
  sort: 'newest',
  page: 1,
  per_page: 24,
};

export const SORT_LABELS: Record<string, string> = {
  newest:     'جدیدترین',
  oldest:     'قدیمی‌ترین',
  price_asc:  'ارزان‌ترین',
  price_desc: 'گران‌ترین',
  bestseller: 'پرفروش‌ترین',
  popular:    'محبوب‌ترین',
  rating:     'بیشترین امتیاز',
  views:      'بیشترین بازدید',
};

/** Parse URLSearchParams into ProductFilters */
export function parseFiltersFromSearchParams(params: URLSearchParams): ProductFilters {
  const filters: ProductFilters = { ...DEFAULT_FILTERS };

  if (params.get('q')) {
    filters.q = params.get('q')!;
  }

  for (const key of ARRAY_KEYS) {
    const values = params.getAll(key).flatMap((v) => v.split(',')).filter(Boolean);
    if (values.length) {
      filters[key] = values;
    }
  }

  if (params.get('min_price')) {
    filters.min_price = Number(params.get('min_price'));
  }
  if (params.get('max_price')) {
    filters.max_price = Number(params.get('max_price'));
  }
  if (params.get('min_rating')) {
    filters.min_rating = Number(params.get('min_rating'));
  }

  for (const key of BOOLEAN_KEYS) {
    if (params.get(key) === '1' || params.get(key) === 'true') {
      filters[key] = true;
    }
  }

  if (params.get('badge')) {
    filters.badge = params.get('badge')!;
  }
  if (params.get('sort')) {
    filters.sort = params.get('sort')!;
  }
  if (params.get('page')) {
    filters.page = Number(params.get('page'));
  }

  const spec: Record<string, string[]> = {};
  params.forEach((value, key) => {
    const match = key.match(/^spec\[([^\]]+)\]$/);
    if (match) {
      const specKey = match[1];
      spec[specKey] = [...(spec[specKey] ?? []), ...value.split(',').filter(Boolean)];
    }
  });
  if (Object.keys(spec).length) {
    filters.spec = spec;
  }

  return filters;
}

/** Build query string from ProductFilters */
export function buildFilterQueryString(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set('q', filters.q);
  }

  for (const key of ARRAY_KEYS) {
    filters[key]?.forEach((v) => params.append(key, v));
  }

  if (filters.min_price != null) {
    params.set('min_price', String(filters.min_price));
  }
  if (filters.max_price != null) {
    params.set('max_price', String(filters.max_price));
  }
  if (filters.min_rating != null) {
    params.set('min_rating', String(filters.min_rating));
  }

  for (const key of BOOLEAN_KEYS) {
    if (filters[key]) {
      params.set(key, '1');
    }
  }

  if (filters.badge) {
    params.set('badge', filters.badge);
  }
  if (filters.sort && filters.sort !== 'newest') {
    params.set('sort', filters.sort);
  }
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }
  if (filters.per_page) {
    params.set('per_page', String(filters.per_page));
  }

  if (filters.spec) {
    for (const [key, values] of Object.entries(filters.spec)) {
      values.forEach((v) => params.append(`spec[${key}]`, v));
    }
  }

  return params.toString();
}

/** Remove a single active filter chip */
export function removeActiveFilter(
  filters: ProductFilters,
  key: string,
  value: string,
): ProductFilters {
  const next = { ...filters, page: 1 };

  if (key.startsWith('spec.')) {
    const specKey = key.replace('spec.', '');
    const spec = { ...next.spec };
    spec[specKey] = (spec[specKey] ?? []).filter((v) => v !== value);
    if (!spec[specKey]?.length) {
      delete spec[specKey];
    }
    next.spec = Object.keys(spec).length ? spec : undefined;
    return next;
  }

  switch (key) {
    case 'category':
    case 'subcategory':
    case 'brand':
    case 'stock':
      next[key] = (next[key] ?? []).filter((v) => v !== value);
      if (!next[key]?.length) {
        delete next[key];
      }
      break;
    case 'min_price':
      delete next.min_price;
      break;
    case 'max_price':
      delete next.max_price;
      break;
    case 'min_rating':
      delete next.min_rating;
      break;
    case 'on_sale':
    case 'featured':
    case 'bestseller':
    case 'is_new':
      next[key] = false;
      break;
  }

  return next;
}

/** Clear all filters except preset defaults */
export function clearAllFilters(presetDefaults?: Partial<ProductFilters>): ProductFilters {
  return {
    ...DEFAULT_FILTERS,
    ...presetDefaults,
  };
}

/** Toggle a value in a multi-select filter array */
export function toggleArrayFilter(
  filters: ProductFilters,
  key: keyof ProductFilters,
  value: string,
): ProductFilters {
  const current = (filters[key] as string[] | undefined) ?? [];
  const exists = current.includes(value);
  const updated = exists ? current.filter((v) => v !== value) : [...current, value];

  return {
    ...filters,
    page: 1,
    [key]: updated.length ? updated : undefined,
  };
}

/** Toggle a spec filter value */
export function toggleSpecFilter(
  filters: ProductFilters,
  specKey: string,
  value: string,
): ProductFilters {
  const spec = { ...filters.spec };
  const current = spec[specKey] ?? [];
  const exists = current.includes(value);
  const updated = exists ? current.filter((v) => v !== value) : [...current, value];

  if (updated.length) {
    spec[specKey] = updated;
  } else {
    delete spec[specKey];
  }

  return {
    ...filters,
    page: 1,
    spec: Object.keys(spec).length ? spec : undefined,
  };
}

/** Stable key for comparing filter state */
export function filtersCacheKey(filters: ProductFilters): string {
  return buildFilterQueryString(filters);
}
