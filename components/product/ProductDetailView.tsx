'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Star, Store, ShieldCheck } from 'lucide-react';
import type { Product, ProductDetail } from '@/lib/types';
import { calculateProductPricing, clampQuantity } from '@/lib/product-pricing';
import { formatRating, toPersianDigits } from '@/lib/utils';
import { useRecentlyViewed } from '@/lib/stores/recently-viewed';
import { getProductsBySlugs } from '@/lib/api';

import ProductBreadcrumb from './ProductBreadcrumb';
import ProductGallery from './ProductGallery';
import ProductAvailabilityBadge from './ProductAvailabilityBadge';
import ProductActionsBar from './ProductActionsBar';
import QuantitySelector from './QuantitySelector';
import PricingSection from './PricingSection';
import AddToCartSection from './AddToCartSection';
import StockNotifyForm from './StockNotifyForm';
import ProductSpecifications from './ProductSpecifications';
import ProductDescription from './ProductDescription';
import KeyFeatures from './KeyFeatures';
import ProductCarousel from './ProductCarousel';
import ProductReviews from './ProductReviews';
import ProductFAQ from './ProductFAQ';
import TrustIndicators from './TrustIndicators';
import MobileStickyBar from './MobileStickyBar';

interface Props {
  product: ProductDetail;
}

export default function ProductDetailView({ product }: Props) {
  const maxQty = product.stockQuantity && product.stockQuantity > 0
    ? product.stockQuantity
    : undefined;

  const [quantity, setQuantity] = useState(1);
  const { add: addRecent, slugs: recentSlugs, hydrated } = useRecentlyViewed();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const canPurchase = product.availabilityStatus === 'in_stock';

  const pricing = useMemo(
    () => calculateProductPricing(product.price, quantity, product.quantityDiscounts),
    [product.price, quantity, product.quantityDiscounts],
  );

  useEffect(() => {
    addRecent(product.slug);
  }, [addRecent, product.slug]);

  useEffect(() => {
    if (!hydrated) return;

    const slugs = recentSlugs.filter((s) => s !== product.slug).slice(0, 8);
    if (!slugs.length) return;

    getProductsBySlugs(slugs).then(setRecentProducts);
  }, [hydrated, recentSlugs, product.slug]);

  const handleQuantityChange = (q: number) => {
    setQuantity(clampQuantity(q, 1, maxQty));
  };

  return (
    <div className="pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <ProductBreadcrumb items={product.breadcrumbs} />

        {/* ── Main product section ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-10">
          <ProductGallery
            images={product.images}
            title={product.title}
            videoUrl={product.videoUrl}
          />

          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                {product.brandSlug && (
                  <Link
                    href={`/products?brand=${product.brandSlug}`}
                    className="text-sm font-bold text-brand hover:underline"
                  >
                    {product.brand}
                  </Link>
                )}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
                  {product.title}
                </h1>
              </div>
              <ProductActionsBar slug={product.slug} title={product.title} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ProductAvailabilityBadge
                status={product.availabilityStatus}
                label={product.availabilityLabel}
              />
              {product.sku && (
                <span className="text-xs text-gray-400 font-mono" dir="ltr">
                  کد: {product.sku}
                </span>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-800">{formatRating(product.rating)}</span>
                <span>({toPersianDigits(product.reviewsCount)} نظر)</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block">فروشنده کالا</span>
                  {product.seller ? (
                    <Link
                      href={`/seller/${product.seller.slug}`}
                      className="font-bold text-gray-900 hover:text-amber-800 transition-colors inline-flex items-center gap-1"
                    >
                      {product.seller.storeName}
                      <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">فروشنده رسمی</span>
                    </Link>
                  ) : (
                    <span className="font-bold text-gray-900">فروشگاه مرکزی آراد ابزار</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ضمانت اصالت</span>
              </div>
            </div>

            <PricingSection
              basePrice={product.price}
              oldPrice={product.oldPrice}
              discountPercent={product.discountPercent}
              pricing={pricing}
              tiers={product.quantityDiscounts}
            />

            {canPurchase ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">تعداد:</span>
                  <QuantitySelector
                    quantity={quantity}
                    onChange={handleQuantityChange}
                    max={maxQty}
                  />
                </div>
                <AddToCartSection
                  product={product}
                  quantity={quantity}
                  finalPrice={pricing.total}
                />
              </div>
            ) : (
              <StockNotifyForm slug={product.slug} />
            )}

            <TrustIndicators />
          </div>
        </div>

        {/* ── Content sections ─────────────────────────────────────────── */}
        <div className="space-y-6 mb-10">
          <KeyFeatures features={product.keyFeatures} />
          <ProductSpecifications specs={product.labeledSpecifications} />
          <ProductDescription html={product.description} />
          <ProductReviews
            slug={product.slug}
            rating={product.rating}
            reviewsCount={product.reviewsCount}
            initialReviews={product.reviews ?? []}
          />
          <ProductFAQ faqs={product.faqs} />
        </div>

        <ProductCarousel title="محصولات پیشنهادی" products={product.relatedProducts} />

        {recentProducts.length > 0 && (
          <div className="mt-8">
            <ProductCarousel title="محصولاتی که اخیراً مشاهده کرده‌اید" products={recentProducts} />
          </div>
        )}
      </div>

      <MobileStickyBar
        product={product}
        quantity={quantity}
        onQuantityChange={handleQuantityChange}
        finalTotal={pricing.total}
        maxQuantity={maxQty}
        canPurchase={canPurchase}
      />
    </div>
  );
}
