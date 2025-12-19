// Server component wrapper for Loyalty Points page
import LoyaltyPointsClient from '@/app/[clinic]/loyalty_points/client';
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/seo/structured-data';

const BASE_URL = 'https://vetepy.vercel.app';

interface Props {
  params: Promise<{ clinic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);
  if (!data) return { title: 'Página no encontrada' };

  const title = `Programa de Fidelidad | ${data.config.name}`;
  const description = `Acumula puntos con cada compra en ${data.config.name}. Canjea por descuentos, productos y servicios exclusivos para tu mascota.`;
  const canonicalUrl = `${BASE_URL}/${clinic}/loyalty_points`;
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
          alt: `Programa de Fidelidad de ${data.config.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LoyaltyPointsPage({ params }: Props) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) {
    notFound();
  }

  // Check if loyalty program is enabled
  if (data.config.settings?.modules?.loyalty_program === false) {
    notFound();
  }

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: 'Inicio', url: `/${clinic}` },
    { name: 'Programa de Fidelidad', url: `/${clinic}/loyalty_points` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <LoyaltyPointsClient />
    </>
  );
}
