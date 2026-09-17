import type {
  BlogPost,
  Brand,
  HeroBannerItem,
  Product,
  ProductDetail,
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

export const PRODUCT_PLACEHOLDER = '/images/product-placeholder.svg';

export function productImage(src?: string | null): string {
  return resolveMediaUrl(src) ?? PRODUCT_PLACEHOLDER;
}

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    image: productImage(product.image),
  };
}

export function normalizeProductDetail(detail: ProductDetail): ProductDetail {
  const images = resolveMediaUrls(detail.images);
  const primary = resolveMediaUrl(detail.image) ?? images[0];

  return {
    ...detail,
    image: primary ?? PRODUCT_PLACEHOLDER,
    images: images.length > 0 ? images : primary ? [primary] : [],
    relatedProducts: detail.relatedProducts?.map(normalizeProduct) ?? [],
    videos: detail.videos?.map(normalizeVideo),
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
