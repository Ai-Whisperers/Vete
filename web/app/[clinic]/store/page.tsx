import { getClinicData, getClinicImageUrl } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import StorePageClient from '@/app/[clinic]/store/client';

const BASE_URL = 'https://vetepy.vercel.app';

export const generateMetadata = async ({ params }: { params: Promise<{ clinic: string }> }): Promise<Metadata> => {
  const { clinic } = await params;
  const data = await getClinicData(clinic);
  if (!data) return { title: 'Tienda no encontrada' };

  const title = `${data.config.ui_labels?.store?.title || 'Tienda'} | ${data.config.name}`;
  const description = data.config.ui_labels?.store?.hero_subtitle || `Productos y accesorios para mascotas en ${data.config.name}`;
  const canonicalUrl = `${BASE_URL}/${clinic}/store`;
  const ogImage = data.config.branding?.og_image_url || '/branding/default-og.jpg';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'es_PY',
      url: canonicalUrl,
      title,
      description,
      siteName: data.config.name,
      images: [
        {
          url: ogImage.startsWith('/') ? `${BASE_URL}${ogImage}` : ogImage,
          width: 1200,
          height: 630,
          alt: `Tienda de ${data.config.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
};

import { getClinicData, getClinicImageUrl } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import StorePageClient from '@/app/[clinic]/store/client';
import { ProductListResponse } from '@/lib/types/store';

async function getInitialProducts(clinic: string): Promise<ProductListResponse> {
  const url = new URL(`http://localhost:3000/api/store/products`);
  url.searchParams.set('clinic', clinic);
  url.searchParams.set('page', '1');
  url.searchParams.set('limit', '12');

  const res = await fetch(url.toString(), {
    next: { tags: ['products'] },
  });

  if (!res.ok) {
    console.error('Failed to fetch initial products:', await res.text());
    // Return a default empty state
    return {
      products: [],
      pagination: { page: 1, pages: 1, total: 0 },
      filters: { applied: {}, available: { categories: [], subcategories: [], brands: [], species: [], life_stages: [], breed_sizes: [], health_conditions: [], price_range: {min: 0, max: 0} } },
    };
  }

  return res.json();
}

export default async function StorePage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) notFound();

  const storeHeroImage = getClinicImageUrl(data.images, 'hero', 'store');
  const initialProductData = await getInitialProducts(clinic);

  return <StorePageClient config={data.config} heroImage={storeHeroImage} initialProductData={initialProductData} />;
}
