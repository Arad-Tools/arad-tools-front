import type {
  BlogPost,
  Brand,
  BreadcrumbItem,
  HeroBannerItem,
  LabeledSpecification,
  Product,
  ProductDetail,
  ProductFAQ,
  ProductReview,
  QuantityDiscount,
  Video,
} from './types';

const DEFAULT_PUBLIC_ORIGIN = 'https://api.aradtoolsco.ir';

/** Site origin derived from NEXT_PUBLIC_API_URL (strips trailing /api). */
export function getApiOrigin(): string {
  // If running in browser on production domain
  if (typeof window !== 'undefined' && window.location.hostname.includes('aradtoolsco.ir')) {
    return DEFAULT_PUBLIC_ORIGIN;
  }

  const base = process.env.NEXT_PUBLIC_API_URL?.trim();

  // If unset, or pointing to Docker internal network name or closed VPS raw IP
  if (!base || base.includes('backend:8000') || base.includes('62.60.198.143')) {
    return DEFAULT_PUBLIC_ORIGIN;
  }

  try {
    const url = new URL(base);
    url.pathname = url.pathname.replace(/\/api\/?$/, '');

    const path = url.pathname.replace(/\/$/, '');

    return `${url.origin}${path === '' || path === '/' ? '' : path}`;
  } catch {
    return DEFAULT_PUBLIC_ORIGIN;
  }
}

export const PRODUCT_PLACEHOLDER = '/images/product-placeholder.svg';

/**
 * Resolves storage/media paths from the Laravel API to absolute URLs.
 *
 * Product images:  https://{host}/storage/media/{id}
 * Relative paths:  /storage/...  →  {origin}/storage/...
 * External URLs:   returned unchanged (http/https or aparat CDN)
 */
export function resolveMediaUrl(src?: string | null): string | undefined {
  if (!src?.trim()) {
    return undefined;
  }

  let trimmed = src.trim();

  // If already a placeholder or static frontend asset, return local relative path directly
  if (
    trimmed.includes('product-placeholder.svg') ||
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('images/')
  ) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  // If the URL contains an internal Docker host, closed raw IP, or localhost in production,
  // extract the pathname to rebase onto the reachable public API origin.
  const isInternalOrDeadHost =
    /^https?:\/\/(?:62\.60\.198\.143|backend)(?::\d+)?(\/.*)?$/i.test(trimmed) ||
    (process.env.NODE_ENV === 'production' && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/.*)?$/i.test(trimmed));

  if (isInternalOrDeadHost) {
    try {
      const parsed = new URL(trimmed);
      trimmed = parsed.pathname + parsed.search;
    } catch {
      // ignore
    }
  }

  if (
    trimmed.includes('product-placeholder.svg') ||
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('images/')
  ) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  const origin = getApiOrigin();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return origin ? `${origin}${path}` : path;
}

export function resolveMediaUrls(sources?: Array<string | null | undefined>): string[] {
  if (!sources?.length) {
    return [];
  }

  return sources
    .map((src) => resolveMediaUrl(src))
    .filter((src): src is string => Boolean(src));
}

export function productImage(src?: string | null): string {
  if (!src || !src.trim() || src.includes('product-placeholder.svg')) {
    return PRODUCT_PLACEHOLDER;
  }

  return resolveMediaUrl(src) ?? PRODUCT_PLACEHOLDER;
}

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    image: productImage(product.image),
  };
}

function parseJsonArray<T>(input: unknown): T[] {
  if (Array.isArray(input)) {
    return input as T[];
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed || trimmed === '[]') return [];
    try {
      let parsed: unknown = JSON.parse(trimmed);
      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      if (Array.isArray(parsed)) {
        return parsed as T[];
      }
    } catch {
      return [];
    }
  }
  return [];
}

function parseKeyFeatures(input: unknown): string[] {
  const arr = parseJsonArray<unknown>(input);
  if (arr.length > 0) {
    return arr
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
      .filter((item) => item.length > 0);
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed && !trimmed.startsWith('[') && !trimmed.startsWith('{')) {
      return trimmed.split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function parseFaqs(input: unknown): ProductFAQ[] {
  const arr = parseJsonArray<unknown>(input);
  return arr
    .filter((f): f is Record<string, unknown> => Boolean(f && typeof f === 'object'))
    .map((f) => ({
      question: String(f.question ?? '').trim(),
      answer: String(f.answer ?? '').trim(),
    }))
    .filter((f) => f.question.length > 0);
}

function parseQuantityDiscounts(input: unknown): QuantityDiscount[] {
  const arr = parseJsonArray<Record<string, unknown>>(input);
  return arr
    .map((tier) => ({
      minQuantity: Number(tier?.minQuantity ?? tier?.min_quantity ?? 0),
      discountPercent: Number(tier?.discountPercent ?? tier?.discount_percent ?? 0),
    }))
    .filter((tier) => tier.minQuantity > 0 && tier.discountPercent > 0);
}

function parseBreadcrumbs(input: unknown): BreadcrumbItem[] {
  const arr = parseJsonArray<Record<string, unknown>>(input);
  return arr
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      label: String(item.label ?? '').trim(),
      href: String(item.href ?? '#').trim(),
    }))
    .filter((item) => item.label.length > 0);
}

function parseLabeledSpecs(input: unknown): LabeledSpecification[] {
  const arr = parseJsonArray<Record<string, unknown>>(input);
  return arr
    .filter((s): s is Record<string, unknown> => Boolean(s && typeof s === 'object'))
    .map((s) => ({
      key: String(s.key ?? '').trim(),
      label: String(s.label ?? s.key ?? '').trim(),
      value: String(s.value ?? '').trim(),
    }))
    .filter((s) => s.label.length > 0 && s.value.length > 0);
}

export function normalizeProductDetail(detail: ProductDetail): ProductDetail {
  const rawImages = parseJsonArray<string>(detail.images);
  const images = resolveMediaUrls(rawImages).filter(
    (url) => !url.includes('product-placeholder.svg'),
  );
  const rawPrimary = resolveMediaUrl(detail.image);
  const primary = (rawPrimary && !rawPrimary.includes('product-placeholder.svg'))
    ? rawPrimary
    : images[0] ?? PRODUCT_PLACEHOLDER;
  const safeImages = images.length > 0 ? images : [primary];

  const rawRelated = parseJsonArray<Product>(detail.relatedProducts);
  const rawVideos = parseJsonArray<Video>(detail.videos);
  const rawReviews = parseJsonArray<ProductReview>(detail.reviews);

  return {
    ...detail,
    id: String(detail.id),
    image: primary,
    images: safeImages,
    keyFeatures: parseKeyFeatures(detail.keyFeatures),
    faqs: parseFaqs(detail.faqs),
    quantityDiscounts: parseQuantityDiscounts(detail.quantityDiscounts),
    breadcrumbs: parseBreadcrumbs(detail.breadcrumbs),
    labeledSpecifications: parseLabeledSpecs(detail.labeledSpecifications),
    relatedProducts: rawRelated.map(normalizeProduct),
    videos: rawVideos.map(normalizeVideo),
    reviews: rawReviews,
  };
}

export function normalizeVideo(video: Video): Video {
  return {
    ...video,
    thumbnail: resolveMediaUrl(video.thumbnail) ?? '',
  };
}

export function normalizeBlogPost(post: BlogPost): BlogPost {
  return {
    ...post,
    image: productImage(post.image),
  };
}

export function normalizeBrand(brand: Brand): Brand {
  return {
    ...brand,
    logo: resolveMediaUrl(brand.logo) ?? '',
  };
}

export function normalizeHeroBanner(banner: HeroBannerItem): HeroBannerItem {
  return {
    ...banner,
    image: resolveMediaUrl(banner.image) ?? '',
  };
}
