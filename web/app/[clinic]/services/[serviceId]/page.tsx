import { getClinicData, ClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

interface ServiceVariant {
  name: string;
  description?: string;
  price_display: string;
}

interface ServiceDetails {
  description: string;
  includes?: string[];
}

interface Service {
  id: string;
  title: string;
  summary: string;
  icon: string;
  image?: string;
  details: ServiceDetails;
  variants?: ServiceVariant[];
  booking?: {
    online_enabled?: boolean;
  };
}

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

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-20">

      {/* HERO HEADER */}
      <div className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background - Image or Gradient */}
        {service.image ? (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${service.image}')` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-primary)' }} />
            <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay"
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
            />
          </>
        )}

        <div className="container relative z-10 px-4 md:px-6">
            <Link
                href={`/${clinic}/services`}
                className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-wider"
            >
                <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Servicios
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                    <DynamicIcon name={service.icon} className="w-12 h-12" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-6xl font-black font-heading text-white mb-4 drop-shadow-md text-balance">
                        {service.title}
                    </h1>
                     <p className="text-xl text-white/90 font-medium max-w-2xl leading-relaxed">
                        {service.summary}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container px-4 md:px-6 -mt-8 relative z-20 mx-auto grid lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Description Card */}
            <div className="bg-white rounded-[var(--radius)] shadow-[var(--shadow-sm)] p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 font-heading">
                    {config.ui_labels?.services.description_label || 'Descripción del Servicio'}
                </h2>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                    {service.details.description}
                </p>

                {service.details.includes && service.details.includes.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                            {config.ui_labels?.services.includes_label || '¿Qué incluye?'}
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {service.details.includes.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-subtle)]">
                                    <Icons.CheckCircle2 className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                                    <span className="text-[var(--text-secondary)] font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Pricing Table */}
            <div className="bg-white rounded-[var(--radius)] shadow-[var(--shadow-sm)] border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] font-heading">Precios y Variantes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider">
                             <tr>
                                 <th className="px-6 py-4">{config.ui_labels?.services.table_variant || 'Variante'}</th>
                                 <th className="px-6 py-4 text-right">{config.ui_labels?.services.table_price || 'Precio'}</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {service.variants?.map((variant, idx) => (
                                 <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-6 py-4">
                                         <div className="font-bold text-[var(--text-primary)] text-lg">{variant.name}</div>
                                         {variant.description && (
                                             <div className="text-sm text-[var(--text-muted)] mt-1">{variant.description}</div>
                                         )}
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <span className="inline-block bg-[var(--bg-subtle)] px-3 py-1 rounded-full text-[var(--primary)] font-black">
                                            {variant.price_display}
                                         </span>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN: Sidebar (Booking) */}
        <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-heading">
                    Agendar Cita
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                    Reserva tu turno para <span className="font-bold">{service.title}</span> vía WhatsApp.
                </p>

                {service.booking?.online_enabled && (
                     <Link 
                        href={`/${clinic}/book?service=${service.id}`}
                        className="flex w-full items-center justify-center gap-2 bg-[var(--primary)] hover:brightness-110 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 mb-4"
                     >
                        <Icons.Calendar className="w-5 h-5" />
                        Reservar Online
                     </Link>
                )}

                <a 
                    href={`https://wa.me/${config.contact.whatsapp_number}?text=Hola, quisiera agendar un turno para: ${service.title}`}
                    target="_blank"
                    className={`flex w-full items-center justify-center gap-2 font-bold py-4 px-6 rounded-xl transition-transform hover:-translate-y-1 mb-4 ${
                        service.booking?.online_enabled 
                        ? 'bg-white border-2 border-[#25D366] text-[#25D366] hover:bg-green-50'
                        : 'bg-[#25D366] text-white hover:brightness-110 shadow-lg'
                    }`}
                >
                    <Icons.MessageCircle className="w-5 h-5" />
                    Consultar por WhatsApp
                </a>
            </div>

        </div>

      </div>

    </div>
  );
}
