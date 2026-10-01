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
  seller?: { id: number; storeName: string; slug: string; rating?: number } | null;
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
  id?: number;
  seller?: { id: number; storeName: string; slug: string } | null;
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

export interface GeneralFilterMeta {
  brands: FilterOption[];
  priceRange: { min: number; max: number };
  stock: FilterOption[];
  on_sale_count?: number;
}

export interface SpecFilterGroup {
  key: string;
  label: string;
  type?: string;
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
  general?: GeneralFilterMeta;
  category_filters?: Record<string, SpecFilterGroup>;
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

export interface SearchSuggestionProduct {
  id: number | string;
  title: string;
  slug: string;
  sku?: string;
  price: number;
  formatted_price: string;
  image?: string | null;
  in_stock: boolean;
  stock_quantity?: number;
}

export interface SearchSuggestionCategory {
  id: number | string;
  name: string;
  slug: string;
  count: number;
}

export interface SearchSuggestionBrand {
  id: number | string;
  name: string;
  slug: string;
  logo?: string | null;
  count: number;
}

export interface SearchSuggestionsData {
  products: SearchSuggestionProduct[];
  categories: SearchSuggestionCategory[];
  brands: SearchSuggestionBrand[];
  exact_match?: SearchSuggestionProduct | null;
  total_results: number;
  has_more: boolean;
  view_all_url: string;
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  created_at: string;
}

export interface SearchFallbackData {
  did_you_mean?: string | null;
  related_categories: Array<{ id: number | string; name: string; slug: string }>;
  suggested_products: Array<{
    id: number | string;
    title: string;
    slug: string;
    sku?: string;
    price: number;
    formatted_price: string;
    image?: string | null;
    in_stock: boolean;
  }>;
}

export interface PaginatedProducts {
  products: Product[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  fallback?: SearchFallbackData | null;
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
  isSeller?: boolean;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
  message?: string;
}

// ─── Contact & Order Tracking ─────────────────────────────────────────────────

export interface ContactInquiryPayload {
  name: string;
  phone: string;
  order_code?: string;
  subject?: string;
  message: string;
}

export interface ContactInquiryResponse {
  success: boolean;
  message: string;
  data?: {
    tracking_code: string;
    name: string;
    order_code: string | null;
    status: string;
    status_label: string;
    created_at: string;
  };
}

export interface TrackOrderResponse {
  found: boolean;
  message?: string;
  data?: {
    tracking_code: string;
    order_code: string | null;
    name?: string;
    status: string;
    status_label: string;
    subject: string;
    created_at: string;
    updated_at: string;
  };
}

// ─── Ecommerce Domain Types ───────────────────────────────────────────────────

export interface CustomerAddress {
  id: number;
  title: string;
  recipientName: string;
  recipientMobile: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  buildingNumber?: string | null;
  unit?: string | null;
  isDefault: boolean;
  fullAddress: string;
}

export interface AddressInput {
  title?: string;
  recipient_name: string;
  recipient_mobile: string;
  province: string;
  city: string;
  postal_code: string;
  address: string;
  building_number?: string;
  unit?: string;
  is_default?: boolean;
}

export interface Seller {
  id: number;
  storeName: string;
  slug: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  description?: string | null;
  logo?: string | null;
  status: string;
  statusLabel: string;
  commissionRate: number;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  productTitle: string;
  productSku?: string | null;
  productSlug?: string | null;
  image?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  status: string;
  seller?: { id: number; storeName: string; slug: string } | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: {
    recipient_name: string;
    recipient_mobile: string;
    province: string;
    city: string;
    postal_code: string;
    address: string;
    building_number?: string;
    unit?: string;
  };
  customerNotes?: string | null;
  trackingCode?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
  items?: OrderItem[];
  itemsCount?: number;
}

export interface Payment {
  id: number;
  orderId: number;
  gateway: string;
  gatewayLabel: string;
  status: string;
  statusLabel: string;
  amount: number;
  trackingCode?: string | null;
  referenceId?: string | null;
  cardPan?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
}

export interface CheckoutPayload {
  address_id?: number;
  recipient_name?: string;
  recipient_mobile?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  building_number?: string;
  unit?: string;
  customer_notes?: string;
  payment_method?: string;
}

export interface CheckoutResponse {
  message: string;
  order: Order;
  payment: Payment;
  redirectUrl: string;
}


