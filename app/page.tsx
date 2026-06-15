import {
  getProducts,
  getVideos,
  getBlogPosts,
  getBrands,
  getCategories,
  getHeroBanners,
} from '@/lib/api';
import Header            from '@/components/home/Header';
import HeroBanner        from '@/components/home/HeroBanner';
import CategoryStrip     from '@/components/home/CategoryStrip';
import ProductSection    from '@/components/home/ProductSection';
import VideoStoriesSection from '@/components/home/VideoStoriesSection';
import BlogSection       from '@/components/home/BlogSection';
import BrandSection      from '@/components/home/BrandSection';
import Footer            from '@/components/home/Footer';
import TrustBar          from '@/components/home/TrustBar';

// ── Revalidate the whole route every 5 min as a safety net ───────────────────
// Individual fetches have their own revalidate settings in lib/api.ts.
export const revalidate = 300;

// ── Helper: unwrap PromiseSettledResult safely ────────────────────────────────
function resolve<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

// ── Page Component (Server Component) ────────────────────────────────────────
export default async function HomePage() {
  // All sections fetch in parallel. If one fails it falls back gracefully.
  const [products, videos, posts, brands, categories, banners] =
    await Promise.allSettled([
      getProducts(),
      getVideos(),
      getBlogPosts(),
      getBrands(),
      getCategories(),
      getHeroBanners(),
    ]);

  const allProducts   = resolve(products,   []);
  const allVideos     = resolve(videos,     []);
  const allPosts      = resolve(posts,      []);
  const allBrands     = resolve(brands,     []);
  const allCategories = resolve(categories, []);
  const allBanners    = resolve(banners,    []);

  // Derived product lists
  const featured     = allProducts.filter((p) => p.badge === 'featured');
  const bestSellers  = allProducts.filter((p) => p.badge === 'bestseller');
  const saleProducts = allProducts.filter((p) => p.badge === 'sale');
  const newProducts  = allProducts.filter((p) => p.badge === 'new');

  // Pad featured with top-rated if too few
  const featuredFilled = featured.length >= 4
    ? featured
    : [...featured, ...allProducts.filter((p) => p.badge !== 'featured')].slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────── */}
      <Header />

      <main>
        {/* ── Hero ────────────────────────────────────────────── */}
        <HeroBanner banners={allBanners} />

        {/* ── Category Quick Access ────────────────────────────── */}
        <CategoryStrip categories={allCategories} />

        {/* ── Trust Signals ────────────────────────────────────── */}
        <TrustBar />

        <div className="container mx-auto px-4 space-y-12 py-8">
          {/* ── Featured Products ─────────────────────────────── */}
          <ProductSection
            title="محصولات ویژه"
            subtitle="منتخب هفته"
            products={featuredFilled.slice(0, 6)}
            viewAllLink="/products/featured"
          />

          {/* ── Best Sellers ──────────────────────────────────── */}
          {bestSellers.length > 0 && (
            <ProductSection
              title="پرفروش‌ترین‌ها"
              subtitle="پرطرفدار‌ترین ابزارهای هفته"
              products={[...bestSellers, ...allProducts].slice(0, 6)}
              viewAllLink="/products/bestsellers"
            />
          )}

          {/* ── Special Offers ────────────────────────────────── */}
          <ProductSection
            title="پیشنهادات شگفت‌انگیز"
            subtitle="تخفیف‌های ویژه با زمان محدود"
            products={saleProducts.slice(0, 6)}
            viewAllLink="/products/sale"
            highlight
          />
        </div>

        {/* ── Video Stories ────────────────────────────────────── */}
        <VideoStoriesSection videos={allVideos} />

        <div className="container mx-auto px-4 space-y-12 py-8">
          {/* ── New Arrivals ──────────────────────────────────── */}
          <ProductSection
            title="تازه‌واردها"
            subtitle="آخرین محصولات اضافه‌شده"
            products={[...newProducts, ...allProducts].slice(0, 6)}
            viewAllLink="/products/new"
          />
        </div>

        {/* ── Blog ─────────────────────────────────────────────── */}
        <BlogSection posts={allPosts} />

        {/* ── Brands ───────────────────────────────────────────── */}
        <BrandSection brands={allBrands} />
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
