
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import { ServicesGrid } from '@/components/services/services-grid';
import { VaccineSchedule } from '@/components/services/vaccine-schedule';

const BASE_URL = 'https://vetepy.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ clinic: string }> }): Promise<Metadata> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);
  if (!data) return {};

  const title = `${data.services.meta?.title || 'Servicios'} | ${data.config.name}`;
  const description = data.services.meta?.subtitle || `Servicios veterinarios de ${data.config.name}`;
  const canonicalUrl = `${BASE_URL}/${clinic}/services`;
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
          alt: `Servicios de ${data.config.name}`,
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

export default async function ServicesPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) notFound();

  const { services, config } = data;

  return (
    <div className="bg-[var(--bg-default)] min-h-screen pb-24">
      
      {/* HEADER */}
      <div className="relative pt-20 sm:pt-28 md:pt-32 pb-24 sm:pb-32 md:pb-40 text-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-primary)' }} />
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
        />
        
        <div className="container relative z-10 px-4">
            <h1 className="text-4xl md:text-6xl font-black font-heading text-white mb-6 drop-shadow-md">
                {services.meta?.title || "Nuestros Servicios"}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
                {services.meta?.subtitle}
            </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 -mt-10 relative z-20 mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <ServicesGrid services={services.services} config={config} />
            </div>
            <div>
                 <VaccineSchedule config={config.ui_labels?.services.vaccine_schedule} />
            </div>
        </div>
      </div>

       {/* Floating CTA */}
       <div className="fixed bottom-8 sm:bottom-10 md:bottom-12 right-4 sm:right-6 md:right-8 z-50 animate-bounce-in pb-[env(safe-area-inset-bottom)]">
            <a
                href={`https://wa.me/${config.contact.whatsapp_number}`}
                target="_blank"
                className="flex items-center gap-2 sm:gap-3 bg-[var(--status-success)] hover:brightness-110 text-white font-bold py-3 sm:py-4 px-5 sm:px-8 min-h-[48px] rounded-full shadow-[var(--shadow-lg)] transition-all hover:-translate-y-1 hover:shadow-xl ring-4 ring-white/30 backdrop-blur-sm text-sm sm:text-base"
                style={{ backgroundColor: '#25D366' }} // WhatsApp Brand Color Override
            >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{config.ui_labels?.services?.book_floating_btn || 'Agendar Turno'}</span>
                <span className="sm:hidden">WhatsApp</span>
            </a>
       </div>

    </div>
  );
}
