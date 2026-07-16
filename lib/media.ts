import type {
  BlogPost,
  Brand,
  HeroBannerItem,
  Product,
  ProductDetail,
  Video,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

/** Site origin derived from NEXT_PUBLIC_API_URL (strips trailing /api). */
export function getApiOrigin(): string {
  if (!API_BASE) {
    return '';
  }

  try {
    const url = new URL(API_BASE);
    url.pathname = url.pathname.replace(/\/api\/?$/, '');

    const path = url.pathname.replace(/\/$/, '');

    return `${url.origin}${path === '' || path === '/' ? '' : path}`;
  } catch {
    return '';
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

  const trimmed = src.trim();

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
