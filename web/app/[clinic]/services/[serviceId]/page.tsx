import { getClinicData, ClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ServiceDetailClient } from '@/components/services/service-detail-client';
import type { Service } from '@/lib/types/services';

// Helper to find service by slug/id
async function getService(clinicSlug: string, serviceId: string): Promise<{ service: Service; data: ClinicData } | null> {
  const data = await getClinicData(clinicSlug);
  if (!data) return null;

  const services = data.services?.services as Service[] | undefined;
  const service = services?.find((s) => s.id === serviceId);
  if (!service) return null;

  return { service, data };
}

export async function generateMetadata({ params }: { params: Promise<{ clinic: string; serviceId: string }> }): Promise<Metadata> {
  const { clinic, serviceId } = await params;
  const result = await getService(clinic, serviceId);
  
  if (!result || !result.service) return {};

  return {
    title: `${result.service.title} - ${result.data.config.name}`,
    description: result.service.summary
  };
}

// Note: generateStaticParams removed to allow dynamic rendering

export default async function ServiceDetailPage({ params }: { params: Promise<{ clinic: string; serviceId: string }> }) {
  const { clinic, serviceId } = await params;
  const result = await getService(clinic, serviceId);

  if (!result || !result.service) notFound();

  const { service, data } = result;
  const { config } = data;

  // Check if user is logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <ServiceDetailClient
      service={service}
      config={{
        name: config.name,
        contact: {
          whatsapp_number: config.contact?.whatsapp_number
        },
        ui_labels: config.ui_labels
      }}
      clinic={clinic}
      isLoggedIn={isLoggedIn}
    />
  );
}
