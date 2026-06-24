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

  return {
    title: product.metaTitle || product.title,
    description: product.metaDescription || `${product.title} — خرید از ابزار آراد`,
    openGraph: {
      title: product.metaTitle || product.title,
      description: product.metaDescription,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://abzarsara.com';
  const pageUrl = `${siteUrl}/product/${slug}`;

  return (
    <ShopShell>
      <ProductJsonLd product={product} pageUrl={pageUrl} />
      <ProductDetailView product={product} />
    </ShopShell>
  );
}
