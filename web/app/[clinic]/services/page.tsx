
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import * as Icons from 'lucide-react';
import { ServicesGrid } from '@/components/services/services-grid';

export async function generateMetadata({ params }: { params: Promise<{ clinic: string }> }): Promise<Metadata> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);
  if (!data) return {};
  return {
    title: `${data.services.meta?.title || 'Servicios'} - ${data.config.name}`,
    description: data.services.meta?.subtitle
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
      <div className="relative pt-32 pb-40 text-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-primary)' }} />
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 z-0 mix-blend-overlay" />
        
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
        <ServicesGrid services={services.services} config={config} />
      </div>

       {/* Floating CTA */}
       <div className="fixed bottom-8 right-8 z-50 animate-bounce-in">
            <a 
                href={`https://wa.me/${config.contact.whatsapp_number}`}
                target="_blank"
                className="flex items-center gap-3 bg-[var(--status-success)] hover:brightness-110 text-white font-bold py-4 px-8 rounded-full shadow-[var(--shadow-lg)] transition-all hover:-translate-y-1 hover:shadow-xl ring-4 ring-white/30 backdrop-blur-sm"
                style={{ backgroundColor: '#25D366' }} // WhatsApp Brand Color Override
            >
                <Icons.MessageCircle className="w-6 h-6" />
                {config.ui_labels?.services.book_floating_btn || 'Agendar Turno'}
            </a>
       </div>

    </div>
  );
}
