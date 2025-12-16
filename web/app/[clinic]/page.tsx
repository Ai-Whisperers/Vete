
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import * as Icons from 'lucide-react';

// Dynamic Icon Component
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  // @ts-ignore - Dynamic access to Lucide icons
  const Icon = Icons[name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || Icons.HelpCircle;
  return <Icon className={className} />;
};

export default async function ClinicHomePage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) notFound();

  const { home, config } = data;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-[var(--bg-default)]">
         {/* Background Elements */}
        {config.branding?.hero_image_url ? (
            <>
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url('${config.branding.hero_image_url}')` }}
                />
                <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px]" /> {/* Overlay for readability */}
            </>
        ) : (
             <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-hero)' }} />
        )}
        {/* CSS Pattern Replacement for missing pattern.png */}
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
        />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center text-white">
            <div className="inline-block px-6 py-2 mb-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-bold tracking-widest uppercase shadow-sm">
                {home.hero.badge_text || 'Urgencias 24hs'}
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tight mb-8 leading-tight drop-shadow-xl text-balance">
              {home.hero.headline}
            </h1>
            <p className="mx-auto max-w-[800px] text-lg md:text-2xl text-white/95 mb-12 leading-relaxed font-medium drop-shadow-md text-balance">
              {home.hero.subhead}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a 
                  href={`https://wa.me/${config.contact.whatsapp_number}`} 
                  target="_blank"
                  className="inline-flex h-16 items-center justify-center rounded-[var(--radius)] px-10 text-lg font-bold shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:scale-105 active:scale-95 duration-200 bg-[var(--primary)] text-white border-2 border-transparent"
                >
                  {home.hero.cta_primary}
                </a>
                <Link 
                  href={`/${clinic}/services`}
                  className="inline-flex h-16 items-center justify-center rounded-[var(--radius)] border-2 border-white/40 bg-white/10 backdrop-blur-md px-10 text-lg font-bold text-white shadow-lg transition-all hover:bg-white/20 hover:border-white/60 hover:-translate-y-1 active:scale-95 duration-200"
                >
                  {home.hero.cta_secondary}
                </Link>
            </div>
          </div>
      </section>

      {/* PROMO BANNER */}
      {home.promo_banner?.enabled && (
        <div className="bg-[var(--accent)] text-[var(--secondary-contrast)] py-3 text-center font-bold px-4 tracking-wide shadow-md relative z-20">
          {home.promo_banner.text}
        </div>
      )}

      {/* FEATURES GRID */}
      <section className="py-24 bg-[var(--bg-subtle)]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-heading font-black text-[var(--text-primary)] mb-4">¿Por qué elegirnos?</h2>
                 <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">Compromiso, tecnología y amor por los animales.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {home.features.map((feature: any, idx: number) => (
                    <div key={idx} className="group relative overflow-hidden rounded-[var(--radius)] bg-white p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-200 text-center">
                         <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-[var(--bg-subtle)] p-4 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300 mx-auto">
                            <DynamicIcon name={feature.icon} className="h-8 w-8" />
                         </div>
                         <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{feature.title}</h3>
                         <p className="text-[var(--text-secondary)] leading-relaxed">
                            {feature.text}
                         </p>
                    </div>
                ))}
            </div>
          </div>
      </section>
      
      {/* INTERACTIVE TOOLS */}
      {home.interactive_tools_section && (
          <section className="py-20 bg-[var(--bg-default)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
              <div className="container mx-auto px-4 text-center relative z-10">
                  <span className="text-[var(--accent)] font-bold uppercase tracking-widest text-sm mb-2 block">Herramientas</span>
                  <h2 className="text-3xl md:text-4xl font-heading font-black mb-6 text-[var(--text-primary)]">{home.interactive_tools_section.title}</h2>
                  <p className="mb-10 text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">{home.interactive_tools_section.subtitle}</p>
                  
                  <div className="flex justify-center">
                       <Link href={`/${clinic}/tools/toxic-food`} className="group flex items-center gap-3 px-8 py-4 bg-red-600 rounded-[var(--radius)] font-bold text-white shadow-lg hover:shadow-xl hover:bg-red-700 transition-all border-2 border-transparent transform hover:-translate-y-1">
                           <Icons.AlertTriangle className="w-6 h-6 group-hover:scale-110 transition-transform text-white" />
                           {home.interactive_tools_section.toxic_food_cta}
                       </Link>
                  </div>
              </div>
          </section>
      )}

      {/* TESTIMONIALS */}
      {home.testimonials_section?.enabled && data.testimonials && (
        <section className="py-24 bg-[var(--primary)] relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16 text-white">
              <h2 className="text-3xl md:text-4xl font-heading font-black mb-4">{home.testimonials_section.title}</h2>
              <p className="text-white/80 max-w-2xl mx-auto">{home.testimonials_section.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {data.testimonials.map((t: any) => (
                <div key={t.id} className="bg-white p-8 rounded-[var(--radius)] shadow-xl relative border-[1px] border-gray-100">
                   <div className="absolute -top-4 left-8 bg-[var(--accent)] p-2 rounded-lg shadow-lg">
                        <Icons.Quote className="w-6 h-6 text-white" />
                   </div>
                  <div className="flex gap-1 mb-6 mt-2 text-[var(--accent)]">
                    {[...Array(5)].map((_, i) => (
                      <Icons.Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 font-medium mb-6 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex justify-between items-center mt-auto border-t pt-4">
                    <span className="font-bold text-[var(--text-primary)]">{t.author}</span>
                    <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{t.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LOCATION / CONTACT */}
       <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col justify-center h-full">
                <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[var(--bg-subtle)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider w-fit">
                    Contacto
                </div>
                <h2 className="text-4xl font-heading font-black mb-8 text-[var(--text-primary)]">{config.ui_labels?.home.visit_us || 'Visítanos'}</h2>
                <div className="space-y-6 text-lg text-[var(--text-secondary)]">
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors border border-transparent hover:border-gray-100">
                        <div className="mt-1 p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                             <Icons.MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="font-bold block text-[var(--text-primary)] mb-1">Dirección</span>
                            {config.contact.address}
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors border border-transparent hover:border-gray-100">
                        <div className="mt-1 p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                            <Icons.Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="font-bold block text-[var(--text-primary)] mb-1">Teléfono & WhatsApp</span>
                            {config.contact.phone_display}
                        </div>
                    </div>
                     <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors border border-transparent hover:border-gray-100">
                         <div className="mt-1 p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                            <Icons.Mail className="w-6 h-6" />
                         </div>
                        <div>
                            <span className="font-bold block text-[var(--text-primary)] mb-1">Email</span>
                            {config.contact.email}
                        </div>
                    </div>
                </div>
            </div>
            {/* Styled Static Map with CTA */}
            <div className="h-[400px] w-full rounded-[var(--radius)] shadow-2xl overflow-hidden border border-gray-200 relative group">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('/branding/${clinic}/static-map.jpg')` }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <a 
                        href={`https://www.google.com/maps/place/?q=place_id:${config.contact.google_maps_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/90 backdrop-blur-md text-[var(--text-primary)] px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group/btn"
                    >
                        <Icons.MapPin className="w-5 h-5 text-[var(--primary)] group-hover/btn:animate-bounce" />
                        <span>Ver ubicación en Google Maps</span>
                    </a>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}
