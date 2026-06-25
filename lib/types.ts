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
  categorySlug?: string;
  brandSlug?: string;
  stockQuantity?: number;
}

export type AvailabilityStatus = 'in_stock' | 'out_of_stock' | 'restocking';

export interface LabeledSpecification {
  key: string;
  label: string;
  value: string;
}

export interface QuantityDiscount {
  minQuantity: number;
  discountPercent: number;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface ProductReview {
  id: string;
  authorName: string;
  rating: number;
  body?: string;
  createdAt?: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface ProductDetail extends Product {
  sku?: string;
  images: string[];
  videoUrl?: string;
  discountPercent?: number;
  availabilityStatus: AvailabilityStatus;
  availabilityLabel: string;
  viewsCount?: number;
  specifications?: Record<string, string | number | boolean>;
  labeledSpecifications: LabeledSpecification[];
  description?: string;
  keyFeatures: string[];
  quantityDiscounts: QuantityDiscount[];
  faqs: ProductFAQ[];
  metaTitle?: string;
  metaDescription?: string;
  breadcrumbs: BreadcrumbItem[];
  relatedProducts: Product[];
  videos?: Video[];
  reviews?: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  embedUrl?: string;
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
  parentId?: string | null;
  children?: Category[];
}

// ─── Product Listing & Filters ────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: string;
  parentSlug?: string;
}

export interface SpecFilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface ProductFilterMeta {
  total: number;
  priceRange: { min: number; max: number };
  categories: FilterOption[];
  subcategories: FilterOption[];
  brands: FilterOption[];
  stock: FilterOption[];
  rating: FilterOption[];
  attributes: Record<string, SpecFilterGroup>;
  tools: Record<string, SpecFilterGroup>;
  sortOptions: FilterOption[];
  activeFilters: ActiveFilter[];
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  display: string;
}

export interface ProductFilters {
  q?: string;
  category?: string[];
  subcategory?: string[];
  brand?: string[];
  min_price?: number;
  max_price?: number;
  stock?: string[];
  min_rating?: number;
  on_sale?: boolean;
  featured?: boolean;
  bestseller?: boolean;
  is_new?: boolean;
  badge?: string;
  spec?: Record<string, string[]>;
  sort?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedProducts {
  products: Product[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface ProductListingPreset {
  title: string;
  subtitle?: string;
  defaultFilters?: Partial<ProductFilters>;
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

// ─── Customer Auth ────────────────────────────────────────────────────────────

export interface Customer {
  id: number;
  mobile: string;
  name: string | null;
  email: string | null;
  profile_complete: boolean;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
  message?: string;
}

