import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClinicData } from '@/lib/clinics';
import ProductDetailClient from './client';
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/structured-data';

const BASE_URL = 'https://vetepy.vercel.app';

interface Props {
  params: Promise<{ clinic: string; id: string }>;
}

// Fetch product data on server for SEO
async function getProduct(clinic: string, id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/store/products/${id}?clinic=${clinic}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      return data.product;
    }
  } catch {
    return null;
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinic, id } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    return { title: 'Producto no encontrado' };
  }

  const canonicalUrl = `${BASE_URL}/${clinic}/store/product/${id}`;
  const product = await getProduct(clinic, id);

  if (product) {
    const ogImage = product.image_url || clinicData.config.branding?.og_image_url || '/branding/default-og.jpg';

    return {
      title: product.meta_title || `${product.name} | ${clinicData.config.name}`,
      description: product.meta_description || product.short_description || product.description?.substring(0, 160),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'website',
        locale: 'es_PY',
        url: canonicalUrl,
        title: product.name,
        description: product.short_description || product.description?.substring(0, 160),
        siteName: clinicData.config.name,
        images: [
          {
            url: ogImage.startsWith('/') ? `${BASE_URL}${ogImage}` : ogImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.short_description || product.description?.substring(0, 160),
      },
    };
  }

  return {
    title: `Producto | ${clinicData.config.name}`,
    description: `Tienda de ${clinicData.config.name}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { clinic, id } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  // Fetch product data for structured data
  const product = await getProduct(clinic, id);

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: 'Inicio', url: `/${clinic}` },
    { name: 'Tienda', url: `/${clinic}/store` },
    { name: product?.name || 'Producto', url: `/${clinic}/store/product/${id}` },
  ];

  return (
    <>
      {/* Structured Data for SEO */}
      {product && (
        <ProductSchema
          clinic={clinic}
          clinicName={clinicData.config.name}
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            short_description: product.short_description,
            base_price: product.base_price || product.price,
            image_url: product.image_url,
            sku: product.sku,
            brand: product.brand,
            category: product.category_name,
            stock_quantity: product.stock_quantity,
            rating: product.average_rating,
            review_count: product.review_count,
          }}
        />
      )}
      <BreadcrumbSchema items={breadcrumbItems} />

      <ProductDetailClient
        clinic={clinic}
        productId={id}
        clinicConfig={clinicData.config}
      />
    </>
  );
}
