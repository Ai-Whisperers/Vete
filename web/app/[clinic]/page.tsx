
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { AppointmentForm } from '@/components/forms/appointment-form';

// Dynamic Icon Component - safely handles icon name lookup
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  if (!name || typeof name !== 'string') {
    return <Icons.HelpCircle className={className} />;
  }

  // Convert kebab-case to PascalCase for Lucide icon lookup
  const iconName = name
    .charAt(0).toUpperCase() +
    name.slice(1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

  const Icon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || Icons.HelpCircle;
  return <Icon className={className} />;
};

export default async function ClinicHomePage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) notFound();

  const { home, config } = data;

  return (
    <div className="flex flex-col min-h-screen">

      {/* HERO SECTION - Improved overlay and visual hierarchy */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image with improved overlay */}
        {config.branding?.hero_image_url ? (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{ backgroundImage: `url('${config.branding.hero_image_url}')` }}
            />
            {/* Gradient overlay - softer, more professional */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-hero)' }} />
        )}

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03]"
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />

        {/* Emergency Badge - Positioned as corner ribbon */}
        <div className="absolute top-24 md:top-28 right-0 z-20">
          <div className="bg-[var(--accent)] text-[var(--secondary-contrast)] px-6 py-2 pr-8 rounded-l-full font-bold text-sm tracking-wide shadow-lg flex items-center gap-2">
            <Icons.Zap className="w-4 h-4" />
            {home.hero.badge_text || 'Urgencias 24hs'}
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight mb-6 leading-[1.1] text-white drop-shadow-2xl text-balance animate-fade-in">
              {home.hero.headline}
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-white/90 mb-10 leading-relaxed font-medium drop-shadow-md text-balance animate-fade-in stagger-1">
              {home.hero.subhead}
            </p>

            {/* CTAs - Improved visual hierarchy */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-2">
              <a
                href={`https://wa.me/${config.contact.whatsapp_number}`}
                target="_blank"
                className="group inline-flex h-14 md:h-16 items-center justify-center rounded-full px-8 md:px-10 text-base md:text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95 bg-[var(--accent)] text-[var(--secondary-contrast)] gap-3"
              >
                <Icons.MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {home.hero.cta_primary}
              </a>
              <Link
                href={`/${clinic}/services`}
                className="inline-flex h-14 md:h-16 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-md px-8 md:px-10 text-base md:text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-white/20 hover:border-white hover:-translate-y-1 active:scale-95 gap-2"
              >
                {home.hero.cta_secondary}
                <Icons.ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden md:block">
          <Icons.ChevronDown className="w-8 h-8 text-white/60" />
        </div>
      </section>

      {/* PROMO BANNER - Improved as floating card */}
      {home.promo_banner?.enabled && (
        <div className="relative z-20 -mt-6 mx-4 md:mx-auto md:max-w-4xl">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--secondary-light)] text-[var(--secondary-contrast)] py-4 px-6 md:px-8 rounded-2xl font-bold text-center shadow-xl flex items-center justify-center gap-3 text-sm md:text-base">
            <Icons.Sparkles className="w-5 h-5 flex-shrink-0" />
            <span>{home.promo_banner.text}</span>
          </div>
        </div>
      )}

      {/* FEATURES GRID - Improved cards and layout */}
      <section className="section-padding bg-[var(--bg-subtle)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-3">
              Nuestros Servicios
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-[var(--text-primary)] mb-4">
              {config.ui_labels?.home?.features_title}
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
              {config.ui_labels?.home?.features_subtitle}
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(home.features ?? []).map((feature: { icon: string; title: string; text: string }, idx: number) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 md:p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                {/* Icon with gradient background */}
                <div className="mb-5 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DynamicIcon name={feature.icon} className="w-7 h-7 md:w-8 md:h-8" />
                </div>

                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.text}
                </p>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[var(--primary)]/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE TOOLS */}
      {home.interactive_tools_section && (
        <section className="section-padding bg-white relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[var(--accent)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-block bg-[var(--accent)]/10 text-[var(--secondary-dark)] font-bold uppercase tracking-widest text-sm px-4 py-2 rounded-full mb-4">
              {config.ui_labels?.home?.tools_badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-black mb-4 text-[var(--text-primary)]">
              {home.interactive_tools_section.title}
            </h2>
            <p className="mb-10 text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
              {home.interactive_tools_section.subtitle}
            </p>

            <Link
              href={`/${clinic}/tools/toxic-food`}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-full font-bold text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Icons.AlertTriangle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {home.interactive_tools_section.toxic_food_cta}
              <Icons.ArrowRight className="w-5 h-5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
          </div>
        </section>
      )}

      {/* TESTIMONIALS - Completely redesigned */}
      {home.testimonials_section?.enabled && data.testimonials && (
        <section className="section-padding bg-gradient-to-b from-[var(--bg-subtle)] to-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />

          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-3">
                Testimonios
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black mb-4 text-[var(--text-primary)]">
                {home.testimonials_section.title}
              </h2>
              <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
                {home.testimonials_section.subtitle}
              </p>
            </div>

            {/* Testimonials Grid - Show 3 max on desktop */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {(data.testimonials ?? []).slice(0, 6).map((t: { id: string; rating: number; text: string; author: string; source: string }, idx: number) => (
                <div
                  key={t.id}
                  className="group bg-white p-6 md:p-8 rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative"
                >
                  {/* Quote icon */}
                  <div className="absolute -top-3 left-6 bg-[var(--primary)] p-2.5 rounded-xl shadow-lg">
                    <Icons.Quote className="w-4 h-4 text-white" />
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Icons.Star
                        key={i}
                        className={`w-5 h-5 ${i < t.rating ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-[var(--text-secondary)] mb-6 leading-relaxed line-clamp-4">
                    "{t.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-white font-bold text-sm">
                        {t.author.charAt(0)}
                      </div>
                      <span className="font-bold text-[var(--text-primary)] text-sm">
                        {t.author}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-full">
                      {t.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LOCATION / CONTACT - Improved layout */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Contact Form Side */}
            <div>
              <span className="inline-block text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-3">
                {config.ui_labels?.home?.contact_badge}
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black mb-8 text-[var(--text-primary)]">
                {config.ui_labels?.home?.visit_us || 'Visítanos'}
              </h2>

              {/* Contact Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-subtle)] rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Icons.MapPin className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">Dirección</p>
                    <p className="text-[var(--text-secondary)] text-sm">{config.contact.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-subtle)] rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Icons.Phone className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">Teléfono</p>
                    <p className="text-[var(--text-secondary)] text-sm">{config.contact.phone_display}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-subtle)] rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Icons.Clock className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">Horarios</p>
                    <p className="text-[var(--text-secondary)] text-sm">Lun-Vie: {config.hours.weekdays}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                    <Icons.Zap className="w-6 h-6 text-[var(--secondary-dark)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">Urgencias</p>
                    <p className="text-[var(--secondary-dark)] text-sm font-medium">24 horas, 365 días</p>
                  </div>
                </div>
              </div>

              <AppointmentForm />
            </div>

            {/* Map Side */}
            <div className="h-[300px] sm:h-[400px] lg:h-full lg:min-h-[600px] w-full rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative group">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('/branding/${clinic}/static-map.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="absolute inset-0 flex items-end justify-center p-8">
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${config.contact.google_maps_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[var(--text-primary)] px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3"
                >
                  <Icons.MapPin className="w-5 h-5 text-[var(--primary)]" />
                  {config.ui_labels?.home?.map_button}
                  <Icons.ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
