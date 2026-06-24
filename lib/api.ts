import type {
  Product, Video, BlogPost, Brand, Category, HeroBannerItem,
} from './types';

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Used as fallback when API_BASE is unset or the API returns an error.
// Swap these with real API endpoints via NEXT_PUBLIC_API_URL in .env

const mockCategories: Category[] = [
  { id: '1', name: 'ابزار برقی',       icon: '⚡', slug: 'power-tools',   color: 'bg-orange-50 text-orange-700 border-orange-200'  },
  { id: '2', name: 'ابزار دستی',       icon: '🔧', slug: 'hand-tools',    color: 'bg-blue-50 text-blue-700 border-blue-200'        },
  { id: '3', name: 'جوشکاری',          icon: '🔥', slug: 'welding',       color: 'bg-red-50 text-red-700 border-red-200'          },
  { id: '4', name: 'اندازه‌گیری',      icon: '📐', slug: 'measuring',     color: 'bg-indigo-50 text-indigo-700 border-indigo-200'  },
  { id: '5', name: 'تجهیزات ایمنی',   icon: '🦺', slug: 'safety',        color: 'bg-yellow-50 text-yellow-700 border-yellow-200'  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'دریل چکشی بوش GSB 750 RE',
    slug: 'bosch-gsb-750-re',
    image: 'https://placehold.co/400x400/1a2e44/ffffff?text=%D8%AF%D8%B1%DB%8C%D9%84+%D8%A8%D9%88%D8%B4',
    price: 4_850_000,
    oldPrice: 5_600_000,
    badge: 'sale',
    rating: 4.7,
    reviewsCount: 312,
    category: 'ابزار برقی',
    brand: 'بوش',
    inStock: true,
  },
  {
    id: '2',
    title: 'فرز آنگولار ماکیتا GA5040C',
    slug: 'makita-ga5040c',
    image: 'https://placehold.co/400x400/2d4a22/ffffff?text=%D9%81%D8%B1%D8%B2+%D9%85%D8%A7%DA%A9%DB%8C%D8%AA%D8%A7',
    price: 3_200_000,
    oldPrice: 3_800_000,
    badge: 'sale',
    rating: 4.5,
    reviewsCount: 187,
    category: 'ابزار برقی',
    brand: 'ماکیتا',
    inStock: true,
  },
  {
    id: '3',
    title: 'پیچ‌گوشتی شارژی ماکیتا DF488D 18V',
    slug: 'makita-df488d',
    image: 'https://placehold.co/400x400/1a3a5f/ffffff?text=%D9%BE%DB%8C%DA%86%DA%AF%D9%88%D8%B4%D8%AA%DB%8C',
    price: 6_450_000,
    badge: 'bestseller',
    rating: 4.9,
    reviewsCount: 521,
    category: 'ابزار برقی',
    brand: 'ماکیتا',
    inStock: true,
  },
  {
    id: '4',
    title: 'لول لیزری بوش GLL 3-80 Professional',
    slug: 'bosch-gll-3-80',
    image: 'https://placehold.co/400x400/3a1f5f/ffffff?text=%D9%84%D9%88%D9%84+%D9%84%DB%8C%D8%B2%D8%B1%DB%8C',
    price: 8_900_000,
    oldPrice: 10_200_000,
    badge: 'sale',
    rating: 4.6,
    reviewsCount: 98,
    category: 'اندازه‌گیری',
    brand: 'بوش',
    inStock: true,
  },
  {
    id: '5',
    title: 'آچار پنوماتیک هیلتی SFH22-A',
    slug: 'hilti-sfh22a',
    image: 'https://placehold.co/400x400/4a1520/ffffff?text=%D8%A2%DA%86%D8%A7%D8%B1+%D9%87%DB%8C%D9%84%D8%AA%DB%8C',
    price: 12_750_000,
    badge: 'featured',
    rating: 4.8,
    reviewsCount: 76,
    category: 'ابزار برقی',
    brand: 'هیلتی',
    inStock: false,
  },
  {
    id: '6',
    title: 'اره برقی رونده بلک‌اند‌دکر KS701E',
    slug: 'bnd-ks701e',
    image: 'https://placehold.co/400x400/1f3f1f/ffffff?text=%D8%A7%D8%B1%D9%87+%D8%A8%D8%B1%D9%82%DB%8C',
    price: 2_100_000,
    oldPrice: 2_500_000,
    badge: 'new',
    rating: 4.3,
    reviewsCount: 44,
    category: 'ابزار برقی',
    brand: 'بلک‌اند‌دکر',
    inStock: true,
  },
  {
    id: '7',
    title: 'مته SDS Plus هیلتی TE 6-A36',
    slug: 'hilti-te6-a36',
    image: 'https://placehold.co/400x400/2f1f3f/ffffff?text=%D9%85%D8%AA%D9%87+SDS',
    price: 18_500_000,
    badge: 'featured',
    rating: 4.9,
    reviewsCount: 203,
    category: 'ابزار برقی',
    brand: 'هیلتی',
    inStock: true,
  },
  {
    id: '8',
    title: 'کمپرسور هوا ۵۰ لیتری بوش Professional',
    slug: 'bosch-compressor-50l',
    image: 'https://placehold.co/400x400/1f2f3f/ffffff?text=%DA%A9%D9%85%D9%BE%D8%B1%D8%B3%D9%88%D8%B1',
    price: 9_200_000,
    oldPrice: 10_800_000,
    badge: 'sale',
    rating: 4.4,
    reviewsCount: 156,
    category: 'ابزار برقی',
    brand: 'بوش',
    inStock: true,
  },
];

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'آموزش صحیح استفاده از دریل چکشی',
    thumbnail: 'https://placehold.co/320x200/1a2e44/ffffff?text=%D8%A2%D9%85%D9%88%D8%B2%D8%B4+%D8%AF%D8%B1%DB%8C%D9%84',
    videoUrl: '#',
    productId: '1',
    duration: '۴:۳۲',
  },
  {
    id: '2',
    title: 'فرز آنگولار؛ تکنیک‌های سنگ‌زنی حرفه‌ای',
    thumbnail: 'https://placehold.co/320x200/2d4a22/ffffff?text=%D8%B3%D9%86%DA%AF+%D8%B2%D9%86%DB%8C',
    videoUrl: '#',
    productId: '2',
    duration: '۶:۱۵',
  },
  {
    id: '3',
    title: 'معرفی خط کامل محصولات ماکیتا ۱۴۰۳',
    thumbnail: 'https://placehold.co/320x200/3a2040/ffffff?text=%D9%85%D8%A7%DA%A9%DB%8C%D8%AA%D8%A7+%DB%B1%DB%B4%DB%B0%DB%B3',
    videoUrl: '#',
    duration: '۸:۴۸',
  },
  {
    id: '4',
    title: 'نکات ایمنی ضروری در جوشکاری',
    thumbnail: 'https://placehold.co/320x200/402020/ffffff?text=%D8%A7%DB%8C%D9%85%D9%86%DB%8C+%D8%AC%D9%88%D8%B4%DA%A9%D8%A7%D8%B1%DB%8C',
    videoUrl: '#',
    duration: '۵:۰۲',
  },
  {
    id: '5',
    title: 'راهنمای انتخاب بیت و مته مناسب',
    thumbnail: 'https://placehold.co/320x200/204030/ffffff?text=%D8%A7%D9%86%D8%AA%D8%AE%D8%A7%D8%A8+%D9%85%D8%AA%D9%87',
    videoUrl: '#',
    duration: '۳:۵۵',
  },
];

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'راهنمای جامع خرید دریل برقی برای مصارف خانگی و صنعتی',
    excerpt:
      'انتخاب دریل مناسب به نوع کار و نیاز شما بستگی دارد. در این راهنما تفاوت انواع دریل‌های برقی، شارژی و چکشی را با هم بررسی می‌کنیم تا بهترین انتخاب را داشته باشید.',
    image: 'https://placehold.co/600x400/1a2e44/ffffff?text=%D8%B1%D8%A7%D9%87%D9%86%D9%85%D8%A7%DB%8C+%D8%AE%D8%B1%DB%8C%D8%AF',
    slug: 'drill-buying-guide',
    category: 'راهنمای خرید',
    readTime: 7,
  },
  {
    id: '2',
    title: 'مقایسه بوش و ماکیتا: کدام برند برای کار شما مناسب‌تر است؟',
    excerpt:
      'بوش و ماکیتا هر دو از بزرگ‌ترین تولیدکنندگان ابزار صنعتی در جهان هستند. در این مقاله به صورت دقیق بررسی می‌کنیم کدام یک برای نوع کار شما مناسب‌تر است.',
    image: 'https://placehold.co/600x400/2d4a22/ffffff?text=%D9%85%D9%82%D8%A7%DB%8C%D8%B3%D9%87+%D8%A8%D8%B1%D9%86%D8%AF',
    slug: 'bosch-vs-makita',
    category: 'مقایسه برند',
    readTime: 9,
  },
  {
    id: '3',
    title: '۱۰ نکته طلایی برای نگهداری از ابزار برقی و افزایش عمر آن‌ها',
    excerpt:
      'نگهداری صحیح از ابزار، عمر مفید و عملکرد آن را به طور چشمگیری افزایش می‌دهد. این ۱۰ نکته ساده و کاربردی را برای مراقبت از ابزارهایتان رعایت کنید.',
    image: 'https://placehold.co/600x400/3a2020/ffffff?text=%D9%86%DA%AF%D9%87%D8%AF%D8%A7%D8%B1%DB%8C',
    slug: 'tool-maintenance-tips',
    category: 'آموزش و نگهداری',
    readTime: 5,
  },
];

const mockBrands: Brand[] = [
  { id: '1', name: 'بوش',          logo: 'https://placehold.co/140x70/f8f9fa/1a2e44?text=BOSCH',        slug: 'bosch',         featured: true,  productCount: 145 },
  { id: '2', name: 'ماکیتا',       logo: 'https://placehold.co/140x70/f8f9fa/004d98?text=MAKITA',        slug: 'makita',        featured: true,  productCount: 203 },
  { id: '3', name: 'هیلتی',        logo: 'https://placehold.co/140x70/f8f9fa/cc0000?text=HILTI',         slug: 'hilti',         featured: true,  productCount: 87  },
  { id: '4', name: 'استنلی',       logo: 'https://placehold.co/140x70/f8f9fa/d97706?text=STANLEY',       slug: 'stanley',       featured: true,  productCount: 124 },
  { id: '5', name: 'بلک‌اند‌دکر', logo: 'https://placehold.co/140x70/f8f9fa/111827?text=BLACK%2BDECKER', slug: 'black-decker',  featured: true,  productCount: 96  },
  { id: '6', name: 'دورادو',       logo: 'https://placehold.co/140x70/f8f9fa/166534?text=DURADO',        slug: 'durado',        featured: false, productCount: 78  },
];

const mockHeroBanners: HeroBannerItem[] = [
  {
    id: '1',
    title: 'ابزار حرفه‌ای برای کار حرفه‌ای',
    subtitle: 'بهترین برندهای جهانی با قیمت رقابتی و تحویل سریع',
    image: 'https://placehold.co/800x500/1a2e44/ffffff?text=Hero+Banner',
    ctaText: 'مشاهده محصولات',
    ctaLink: '/products',
    badge: 'تخفیف تا ۳۰٪',
    bgGradient: 'from-navy-900 via-navy-800 to-navy-700',
  },
  {
    id: '2',
    title: 'ماکیتا ۱۸ ولت — انقلاب شارژی',
    subtitle: 'کامل‌ترین خط محصولات ۱۸ ولت با گارانتی اصل',
    image: 'https://placehold.co/800x500/004d98/ffffff?text=Makita+18V',
    ctaText: 'خرید کنید',
    ctaLink: '/brands/makita',
    badge: 'جدید',
    bgGradient: 'from-blue-900 via-blue-800 to-blue-700',
  },
];

// ─── API Fetch Helper ─────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Fetches data from API with Next.js ISR caching.
 * Falls back to mock data if API is unreachable or returns an error.
 */
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
  fallback: T[],
  revalidate = 300,
): Promise<T[]> {
  if (!API_BASE) {
    console.warn(`[API] NEXT_PUBLIC_API_URL is unset — using mock data for ${path}`);
    return fallback;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: unknown = await res.json();
    const items = unwrapApiList<T>(json);
    if (items.length === 0 && fallback.length > 0) {
      // Empty DB is valid; only fall back when the response shape is wrong.
      if (!Array.isArray(json) && !(json && typeof json === 'object' && 'data' in json)) {
        throw new Error('Unexpected response shape');
      }
    }
    return items;
  } catch (err) {
    console.warn(`[API] ${path} failed — using mock data.`, err);
    return fallback;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** revalidate: 5 min — products change moderately often */
export async function getProducts(): Promise<Product[]> {
  return safeFetchList('/products', mockProducts, 300);
}

/** revalidate: 1 h — videos rarely change */
export async function getVideos(): Promise<Video[]> {
  return safeFetchList('/videos', mockVideos, 3600);
}

/** revalidate: 10 min — editorial content updated daily */
export async function getBlogPosts(): Promise<BlogPost[]> {
  return safeFetchList('/blog', mockBlogPosts, 600);
}

/** revalidate: 1 h — brand list is stable */
export async function getBrands(): Promise<Brand[]> {
  return safeFetchList('/brands', mockBrands, 3600);
}

/** revalidate: 1 h — categories rarely change */
export async function getCategories(): Promise<Category[]> {
  return safeFetchList('/categories', mockCategories, 3600);
}

/** revalidate: 30 min — banners updated for campaigns */
export async function getHeroBanners(): Promise<HeroBannerItem[]> {
  return safeFetchList('/banners', mockHeroBanners, 1800);
}
