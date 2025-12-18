/**
 * SEO Structured Data Components
 * JSON-LD schemas for improved search engine visibility
 */

const BASE_URL = 'https://vetepy.vercel.app';

// Service Schema for veterinary services
export interface ServiceSchemaProps {
  clinic: string;
  clinicName: string;
  service: {
    id: string;
    title: string;
    summary?: string;
    description?: string;
    base_price?: number;
    duration_minutes?: number;
    category?: string;
    image_url?: string;
  };
}

export function ServiceSchema({ clinic, clinicName, service }: ServiceSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${BASE_URL}/${clinic}/services/${service.id}#service`,
    name: service.title,
    description: service.summary || service.description,
    provider: {
      '@type': 'VeterinaryCare',
      '@id': `${BASE_URL}/${clinic}#organization`,
      name: clinicName,
    },
    serviceType: 'Veterinary Service',
    category: service.category || 'Veterinary Medicine',
    areaServed: {
      '@type': 'City',
      name: 'Asunción',
    },
    ...(service.base_price && {
      offers: {
        '@type': 'Offer',
        price: service.base_price,
        priceCurrency: 'PYG',
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(service.duration_minutes && {
      estimatedDuration: `PT${service.duration_minutes}M`,
    }),
    ...(service.image_url && {
      image: service.image_url.startsWith('/') ? `${BASE_URL}${service.image_url}` : service.image_url,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Product Schema for store products
export interface ProductSchemaProps {
  clinic: string;
  clinicName: string;
  product: {
    id: string;
    name: string;
    description?: string;
    short_description?: string;
    base_price: number;
    image_url?: string;
    sku?: string;
    brand?: string;
    category?: string;
    stock_quantity?: number;
    rating?: number;
    review_count?: number;
  };
}

export function ProductSchema({ clinic, clinicName, product }: ProductSchemaProps) {
  const availability = product.stock_quantity && product.stock_quantity > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/${clinic}/store/product/${product.id}#product`,
    name: product.name,
    description: product.description || product.short_description,
    sku: product.sku || product.id,
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    ...(product.category && { category: product.category }),
    ...(product.image_url && {
      image: product.image_url.startsWith('/') ? `${BASE_URL}${product.image_url}` : product.image_url,
    }),
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/${clinic}/store/product/${product.id}`,
      price: product.base_price,
      priceCurrency: 'PYG',
      availability,
      seller: {
        '@type': 'VeterinaryCare',
        '@id': `${BASE_URL}/${clinic}#organization`,
        name: clinicName,
      },
    },
    ...(product.rating && product.review_count && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.review_count,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Breadcrumb Schema for navigation
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('/') ? `${BASE_URL}${item.url}` : item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// FAQ Schema for FAQ pages
export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSchemaProps {
  items: FaqItem[];
}

export function FaqSchema({ items }: FaqSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Organization Schema (for root pages)
export interface OrganizationSchemaProps {
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

export function OrganizationSchema({ name, description, url, logo, sameAs }: OrganizationSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url,
    ...(logo && { logo: logo.startsWith('/') ? `${BASE_URL}${logo}` : logo }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
