import type {
  Product, Video, BlogPost, Brand, Category, HeroBannerItem,
  ProductFilters, ProductFilterMeta, PaginatedProducts,
  ProductDetail, ProductReview,
  ContactInquiryPayload, ContactInquiryResponse, TrackOrderResponse,
} from './types';
import { buildFilterQueryString } from './product-filters';
import {
  normalizeBlogPost,
  normalizeBrand,
  normalizeHeroBanner,
  normalizeProduct,
  normalizeProductDetail,
  normalizeVideo,
} from './media';

// ─── API Base URL Configuration ──────────────────────────────────────────────
const DEFAULT_API_URL = 'https://api.aradtoolsco.ir/api';

/**
 * Resolves the active API base URL.
 * In SSR / Docker environment, INTERNAL_API_URL can be used for container-to-container calls.
 * In the browser, it always uses NEXT_PUBLIC_API_URL or defaults to DEFAULT_API_URL.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    const internal = process.env.INTERNAL_API_URL?.trim();
    if (internal) {
      return internal.replace(/\/$/, '');
    }
  }

  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub && !pub.includes('backend:8000') && !pub.includes('62.60.198.143')) {
    return pub.replace(/\/$/, '');
  }

  return DEFAULT_API_URL;
}

// ─── API Fetch Helpers ───────────────────────────────────────────────────────

/** Unwrap Laravel API Resource collections ({ data: [...] }) or plain arrays. */
function unwrapApiList<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === 'object' && Array.isArray((json as { data?: unknown }).data)) {
    return (json as { data: T[] }).data;
  }
  return [];
}

async function safeFetchList<T>(
  path: string,
  fallback: T[] = [],
  revalidate = 300,
  normalize?: (item: T) => T,
): Promise<T[]> {
  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}${path}`, {
      next: { revalidate },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json: unknown = await res.json();
    const items = unwrapApiList<T>(json);

    return items.map((item) => normalize?.(item) ?? item);
  } catch (err) {
    console.warn(`[API] ${path} failed:`, err);
    return fallback.map((item) => normalize?.(item) ?? item);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** revalidate: 5 min — products change moderately often */
export async function getProducts(): Promise<Product[]> {
  return safeFetchList('/products', [], 300, normalizeProduct);
}

/** revalidate: 1 h — videos rarely change */
export async function getVideos(): Promise<Video[]> {
  return safeFetchList('/videos', [], 3600, normalizeVideo);
}

/** revalidate: 10 min — editorial content updated daily */
export async function getBlogPosts(): Promise<BlogPost[]> {
  return safeFetchList('/blog', [], 600, normalizeBlogPost);
}

/** revalidate: 1 h — brand list is stable */
export async function getBrands(): Promise<Brand[]> {
  return safeFetchList('/brands', [], 3600, normalizeBrand);
}

/** revalidate: 1 h — single brand page */
export async function getBrand(slug: string): Promise<Brand | null> {
  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}/brands/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json: unknown = await res.json();
    const data = json && typeof json === 'object' && 'data' in json
      ? (json as { data: Brand }).data
      : (json as Brand);

    return data ? normalizeBrand(data) : null;
  } catch (err) {
    console.warn(`[API] /brands/${slug} failed:`, err);
    return null;
  }
}

/** revalidate: 1 h — categories rarely change */
export async function getCategories(): Promise<Category[]> {
  return safeFetchList('/categories', [], 3600);
}

/** revalidate: 30 min — banners updated for campaigns */
export async function getHeroBanners(): Promise<HeroBannerItem[]> {
  return safeFetchList('/banners', [], 1800, normalizeHeroBanner);
}

// ─── Paginated / Filtered Products ────────────────────────────────────────────

interface LaravelPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface LaravelPaginatedResponse<T> {
  data: T[];
  meta?: LaravelPaginationMeta;
}

function unwrapPaginatedProducts(json: unknown): PaginatedProducts {
  if (json && typeof json === 'object' && 'data' in json) {
    const payload = json as LaravelPaginatedResponse<Product>;
    const products = Array.isArray(payload.data) ? payload.data : [];
    const meta = payload.meta;

    return {
      products: products.map(normalizeProduct),
      meta: {
        currentPage: meta?.current_page ?? 1,
        lastPage: meta?.last_page ?? 1,
        perPage: meta?.per_page ?? products.length,
        total: meta?.total ?? products.length,
      },
    };
  }

  const products = unwrapApiList<Product>(json).map(normalizeProduct);
  return {
    products,
    meta: { currentPage: 1, lastPage: 1, perPage: products.length, total: products.length },
  };
}

/** Fetch paginated products with filters — works client & server side */
export async function getProductsFiltered(
  filters: ProductFilters = {},
  options: { revalidate?: number; cache?: RequestCache } = {},
): Promise<PaginatedProducts> {
  const qs = buildFilterQueryString(filters);
  const path = qs ? `/products?${qs}` : '/products';
  const apiBase = getApiBaseUrl();

  try {
    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {};

    if (typeof window === 'undefined') {
      fetchOptions.next = { revalidate: options.revalidate ?? 60 };
    } else {
      fetchOptions.cache = options.cache ?? 'no-store';
    }

    const res = await fetch(`${apiBase}${path}`, fetchOptions);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json: unknown = await res.json();
    return unwrapPaginatedProducts(json);
  } catch (err) {
    console.warn(`[API] ${path} failed:`, err);
    return {
      products: [],
      meta: {
        currentPage: filters.page ?? 1,
        lastPage: 1,
        perPage: filters.per_page ?? 24,
        total: 0,
      },
    };
  }
}

/** Fetch dynamic filter metadata / facets */
export async function getProductFilters(
  filters: ProductFilters = {},
): Promise<ProductFilterMeta> {
  const qs = buildFilterQueryString(filters);
  const path = qs ? `/products/filters?${qs}` : '/products/filters';
  const apiBase = getApiBaseUrl();

  const emptyMeta: ProductFilterMeta = {
    total: 0,
    priceRange: { min: 0, max: 0 },
    categories: [],
    subcategories: [],
    brands: [],
    stock: [
      { value: 'in_stock', label: 'موجود', count: 0 },
      { value: 'out_of_stock', label: 'ناموجود', count: 0 },
    ],
    rating: [
      { value: '4', label: '۴ ستاره و بالاتر', count: 0 },
    ],
    attributes: {},
    tools: {},
    sortOptions: [
      { value: 'newest', label: 'جدیدترین' },
      { value: 'price_asc', label: 'ارزان‌ترین' },
      { value: 'price_desc', label: 'گران‌ترین' },
      { value: 'rating', label: 'بیشترین امتیاز' },
      { value: 'bestseller', label: 'پرفروش‌ترین' },
    ],
    activeFilters: [],
  };

  try {
    const res = await fetch(`${apiBase}${path}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json() as { data: ProductFilterMeta };
    return json.data ?? emptyMeta;
  } catch (err) {
    console.warn(`[API] ${path} failed:`, err);
    return emptyMeta;
  }
}

// ─── Product Detail ───────────────────────────────────────────────────────────

/** Fetch single product detail by slug */
export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json: unknown = await res.json();
    const data = json && typeof json === 'object' && 'data' in json
      ? (json as { data: ProductDetail }).data
      : (json as ProductDetail);

    return data && data.slug ? normalizeProductDetail(data) : null;
  } catch (err) {
    console.warn(`[API] /products/${slug} failed:`, err);
    return null;
  }
}

/** Submit product review */
export async function submitProductReview(
  slug: string,
  data: { authorName: string; rating: number; body?: string },
): Promise<ProductReview | null> {
  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}/products/${encodeURIComponent(slug)}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) return null;
    return res.json() as Promise<ProductReview>;
  } catch {
    return null;
  }
}

/** Request stock notification */
export async function notifyStockAvailable(slug: string, mobile: string): Promise<boolean> {
  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}/products/${encodeURIComponent(slug)}/notify-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ mobile }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch products by slugs for recently viewed */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (!slugs.length) return [];

  const results: Product[] = [];

  for (const slug of slugs) {
    const detail = await getProduct(slug);
    if (detail) {
      results.push(detail);
    }
  }

  return results;
}

// ─── Contact & Order Tracking ─────────────────────────────────────────────────

/** Submit contact inquiry or order tracking message */
export async function submitContactInquiry(
  data: ContactInquiryPayload,
): Promise<ContactInquiryResponse> {
  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json() as ContactInquiryResponse;

    if (!res.ok) {
      return {
        success: false,
        message: (json as { message?: string })?.message || 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.',
      };
    }

    return json;
  } catch (err) {
    console.warn('[API] /contact submission failed:', err);
    return {
      success: false,
      message: 'برقراری ارتباط با سرور برقرار نشد. لطفاً اینترنت خود را بررسی نمایید.',
    };
  }
}

/** Track an order or support inquiry by tracking/order code */
export async function trackOrderInquiry(
  code: string,
  phone?: string,
): Promise<TrackOrderResponse> {
  const apiBase = getApiBaseUrl();
  const params = new URLSearchParams({ code: code.trim() });
  if (phone?.trim()) {
    params.set('phone', phone.trim());
  }

  try {
    const res = await fetch(`${apiBase}/contact/track?${params.toString()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    const json = await res.json() as TrackOrderResponse;
    return json;
  } catch (err) {
    console.warn('[API] /contact/track failed:', err);
    return {
      found: false,
      message: 'خطا در دریافت وضعیت سفارش. لطفاً اتصال اینترنت خود را بررسی کنید.',
    };
  }
}

