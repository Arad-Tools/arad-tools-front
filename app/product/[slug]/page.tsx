import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ShopShell from '@/components/layout/ShopShell';
import ProductDetailView from '@/components/product/ProductDetailView';
import ProductJsonLd from '@/components/product/ProductJsonLd';
import { getProduct } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'محصول یافت نشد' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aradtoolsco.ir';
  const rawImage = product.images?.[0] || product.image;
  const ogImage = rawImage
    ? rawImage.startsWith('http')
      ? rawImage
      : `${siteUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
    : undefined;

  return {
    title: product.metaTitle || product.title,
    description: product.metaDescription || `${product.title} — خرید از ابزار آراد`,
    openGraph: {
      title: product.metaTitle || product.title,
      description: product.metaDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
      locale: 'fa_IR',
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aradtoolsco.ir';
  const pageUrl = `${siteUrl}/product/${slug}`;

  return (
    <ShopShell>
      <ProductJsonLd product={product} pageUrl={pageUrl} />
      <ProductDetailView product={product} />
    </ShopShell>
  );
}
