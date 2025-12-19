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

export default async function StorePage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) notFound();

  // Get store hero image from images manifest
  const storeHeroImage = getClinicImageUrl(data.images, 'hero', 'store');

  return <StorePageClient config={data.config} heroImage={storeHeroImage} />;
}
