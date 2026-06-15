// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  oldPrice?: number;
  badge?: 'sale' | 'new' | 'bestseller' | 'featured';
  rating: number;
  reviewsCount: number;
  category: string;
  brand: string;
  inStock?: boolean;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  productId?: string;
  duration: string; // e.g. "۴:۳۲"
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  category: string;
  readTime: number; // minutes
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  slug: string;
  featured: boolean;
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  color: string; // Tailwind bg+text class pair
}

export interface HeroBannerItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  bgGradient: string; // Tailwind gradient classes
}

// ─── Section Component Props ─────────────────────────────────────────────────

export interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  highlight?: boolean; // renders with accent background
}

export interface BlogSectionProps {
  posts: BlogPost[];
}

export interface BrandSectionProps {
  brands: Brand[];
}

export interface VideoStoriesSectionProps {
  videos: Video[];
}

export interface CategoryStripProps {
  categories: Category[];
}

export interface HeroBannerProps {
  banners: HeroBannerItem[];
}
