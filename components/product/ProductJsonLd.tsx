import type { ProductDetail } from '@/lib/types';

interface Props {
  product: ProductDetail;
  pageUrl: string;
}

export default function ProductJsonLd({ product, pageUrl }: Props) {
  const availability = product.availabilityStatus === 'in_stock'
    ? 'https://schema.org/InStock'
    : product.availabilityStatus === 'restocking'
      ? 'https://schema.org/BackOrder'
      : 'https://schema.org/OutOfStock';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.metaDescription || product.title,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'IRR',
      price: product.price,
      availability,
    },
    aggregateRating: product.reviewsCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    } : undefined,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: product.breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `${pageUrl.split('/product')[0]}${item.href}`,
    })),
  };

  const reviewSchema = product.reviews?.length ? {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: product.title,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: product.reviews[0].rating,
    },
    author: {
      '@type': 'Person',
      name: product.reviews[0].authorName,
    },
    reviewBody: product.reviews[0].body,
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      )}
    </>
  );
}
