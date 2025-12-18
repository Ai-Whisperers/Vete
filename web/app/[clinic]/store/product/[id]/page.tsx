import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClinicData } from '@/lib/clinics';
import ProductDetailClient from './client';

interface Props {
  params: Promise<{ clinic: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinic, id } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    return { title: 'Producto no encontrado' };
  }

  // Fetch product data for meta
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/store/products/${id}?clinic=${clinic}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      const product = data.product;

      return {
        title: product.meta_title || `${product.name} | ${clinicData.config.name}`,
        description: product.meta_description || product.short_description || product.description?.substring(0, 160),
        openGraph: {
          title: product.name,
          description: product.short_description || product.description?.substring(0, 160),
          images: product.image_url ? [{ url: product.image_url }] : [],
        },
      };
    }
  } catch {
    // Fallback metadata
  }

  return {
    title: `Producto | ${clinicData.config.name}`,
    description: `Tienda de ${clinicData.config.name}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { clinic, id } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  return (
    <ProductDetailClient
      clinic={clinic}
      productId={id}
      clinicConfig={clinicData.config}
    />
  );
}
