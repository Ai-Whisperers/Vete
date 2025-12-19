import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Award,
  Heart,
  Users,
  Stethoscope,
  Building2,
  Target,
  Eye,
  ShieldCheck,
  HeartPulse,
  Microscope,
  ImageIcon,
  BedDouble,
  Scissors,
  Calendar,
  BadgeCheck,
  ArrowRight,
  Phone,
  Clock
} from 'lucide-react';
import { TeamMemberCard } from '@/components/about/team-member-card';
import { FacilitiesGallery } from '@/components/about/facilities-gallery';
import { CertificationBadge } from '@/components/about/certification-badge';
import { TeamSchema, BreadcrumbSchema } from '@/components/seo/structured-data';

const BASE_URL = 'https://vetepy.vercel.app';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ clinic: string }> }): Promise<Metadata> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);
  if (!data) return { title: 'Página no encontrada' };

  const { about, config } = data;
  const title = `Conoce a ${config.name} | Equipo y Historia`;
  const description = about?.intro?.text?.substring(0, 160) ||
    `Conoce al equipo de profesionales de ${config.name}. Años de experiencia en medicina veterinaria.`;
  const canonicalUrl = `${BASE_URL}/${clinic}/about`;
  const ogImage = config.branding?.og_image_url || '/branding/default-og.jpg';

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
      siteName: config.name,
      images: [
        {
          url: ogImage.startsWith('/') ? `${BASE_URL}${ogImage}` : ogImage,
          width: 1200,
          height: 630,
          alt: `Equipo de ${config.name}`,
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

// Icon mapping for dynamic facility icons
const FACILITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'stethoscope': Stethoscope,
  'heart-pulse': HeartPulse,
  'microscope': Microscope,
  'image': ImageIcon,
  'bed': BedDouble,
  'scissors': Scissors,
};

// Icon mapping for values
const VALUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'heart': Heart,
  'award': Award,
  'users': Users,
  'shield-check': ShieldCheck,
};

export default async function AboutPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) notFound();

  const { about, config } = data;
  const heroImage = about.intro?.image;

  // Default stats that can be overridden by config
  const stats = {
    pets_served: config.stats?.pets_served || '+15K',
    years_experience: config.stats?.years_experience || '9+',
    emergency_hours: config.stats?.emergency_hours || '24/7',
    rating: config.stats?.rating || '4.9'
  };

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: 'Inicio', url: `/${clinic}` },
    { name: 'Nosotros', url: `/${clinic}/about` },
  ];

  // Team members for Person schema
  const teamMembers = about.team?.map((member: { name: string; role: string; bio?: string; photo_url?: string; specialties?: string[] }) => ({
    name: member.name,
    role: member.role,
    bio: member.bio,
    photo_url: member.photo_url,
    specialties: member.specialties,
  })) || [];

  // Role to gradient/color mapping for visual variety
  const getRoleStyle = (role: string) => {
    const roleLC = role.toLowerCase();
    if (roleLC.includes('director') || roleLC.includes('fundador')) {
      return {
        gradient: 'from-[var(--primary)] to-[var(--primary-dark)]',
        badge: 'bg-[var(--primary)]/10 text-[var(--primary)]',
        icon: 'Award'
      };
    }
    if (roleLC.includes('cirugía') || roleLC.includes('cirujano')) {
      return {
        gradient: 'from-blue-600 to-blue-700',
        badge: 'bg-blue-50 text-blue-700',
        icon: 'Stethoscope'
      };
    }
    if (roleLC.includes('diagnóstico') || roleLC.includes('imagen')) {
      return {
        gradient: 'from-purple-600 to-purple-700',
        badge: 'bg-purple-50 text-purple-700',
        icon: 'Stethoscope'
      };
    }
    return {
      gradient: 'from-[var(--accent)] to-[var(--secondary-dark)]',
      badge: 'bg-[var(--accent)]/10 text-[var(--secondary-dark)]',
      icon: 'Heart'
    };
  };

  // Get facility icon component
  const getFacilityIcon = (iconName: string) => {
    return FACILITY_ICONS[iconName] || Stethoscope;
  };

  // Get value icon component
  const getValueIcon = (iconName: string) => {
    return VALUE_ICONS[iconName] || Heart;
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <BreadcrumbSchema items={breadcrumbItems} />
      {teamMembers.length > 0 && (
        <TeamSchema
          clinic={clinic}
          clinicName={config.name}
          members={teamMembers}
        />
      )}

      <div className="min-h-screen bg-[var(--bg-default)]">

        {/* Hero Section - With visual interest */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background - Image or Pattern */}
        {heroImage ? (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImage}')` }}
            />
            {/* Reduced opacity overlay for better image visibility */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/70 via-white/60 to-white/90" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--bg-subtle)] via-white to-[var(--bg-subtle)]" />
            <div
              className="absolute inset-0 z-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '32px 32px' }}
            />
          </>
        )}

        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-[200px] sm:w-[350px] lg:w-[500px] h-[200px] sm:h-[350px] lg:h-[500px] bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[150px] sm:w-[280px] lg:w-[400px] h-[150px] sm:h-[280px] lg:h-[400px] bg-[var(--accent)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-6 backdrop-blur-sm">
            <Heart className="w-4 h-4" />
            {data.config.ui_labels?.about?.intro_badge || 'Nuestra Historia'}
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading mb-8 text-[var(--text-primary)] leading-tight">
            {about.intro.title}
          </h1>

          {/* Story text with better formatting - split into paragraphs */}
          <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <div className="absolute -left-2 md:-left-4 top-6 w-1 h-[calc(100%-3rem)] bg-gradient-to-b from-[var(--primary)] via-[var(--accent)] to-transparent rounded-full" />
            <div className="space-y-4 md:pl-6 text-left">
              {about.intro.text.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Stats row - configurable from config.stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 pt-12 border-t border-gray-200">
            <div className="text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--primary)] mb-1">{stats.pets_served}</p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">Mascotas Atendidas</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--primary)] mb-1">{stats.years_experience}</p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">Años de Experiencia</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--primary)] mb-1">{stats.emergency_hours}</p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">Atención Urgencias</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--primary)] mb-1">{stats.rating}</p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">Calificación Google</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      {(about.mission || about.vision) && (
        <section className="section-padding bg-white relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Mission */}
              {about.mission && (
                <div className="relative p-8 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10 rounded-3xl border border-[var(--primary)]/10">
                  <div className="absolute -top-4 left-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="pt-6">
                    <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] mb-4">
                      {about.mission.title}
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {about.mission.text}
                    </p>
                  </div>
                </div>
              )}

              {/* Vision */}
              {about.vision && (
                <div className="relative p-8 bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 rounded-3xl border border-[var(--accent)]/10">
                  <div className="absolute -top-4 left-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--secondary-dark)] flex items-center justify-center shadow-lg">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="pt-6">
                    <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] mb-4">
                      {about.vision.title}
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {about.vision.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {about.timeline && about.timeline.length > 0 && (
        <section className="section-padding bg-[var(--bg-subtle)]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-4">
                <Calendar className="w-4 h-4" />
                Historia
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-heading text-[var(--text-primary)] mb-4">
                Nuestra Trayectoria
              </h2>
            </div>

            {/* Timeline - Horizontal scroll on mobile */}
            <div className="relative max-w-4xl mx-auto">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)] via-[var(--accent)] to-[var(--primary)]/30 md:-translate-x-1/2" />
              
              <div className="space-y-8">
                {about.timeline.map((item: { year: string; event: string }, idx: number) => (
                  <div key={idx} className={`relative flex items-center gap-4 md:gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Year bubble */}
                    <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-[var(--primary)] ring-4 ring-white shadow-md z-10" />
                    
                    {/* Content card */}
                    <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${idx % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <span className="inline-block px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] font-black rounded-full text-sm mb-2">
                          {item.year}
                        </span>
                        <p className="text-[var(--text-secondary)]">{item.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Grid */}
      <section className="section-padding bg-white relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-4">
              <Users className="w-4 h-4" />
              Equipo
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-heading text-[var(--text-primary)] mb-4">
              {data.config.ui_labels?.about?.team_title || 'Nuestro Equipo'}
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Profesionales apasionados dedicados al bienestar de tu mascota
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {about.team.map((member: { name: string; role: string; bio: string; photo_url?: string; image?: string; specialties?: string[] }, index: number) => {
              const style = getRoleStyle(member.role);

              return (
                <TeamMemberCard
                  key={index}
                  member={member}
                  gradient={style.gradient}
                  badgeClass={style.badge}
                  iconName={style.icon}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section - Using JSON data */}
      <section className="section-padding bg-[var(--bg-subtle)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-4">
              <Heart className="w-4 h-4" />
              Valores
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-heading text-[var(--text-primary)] mb-4">
              Nuestros Valores
            </h2>
          </div>

          <div className={`grid gap-8 max-w-5xl mx-auto ${
            about.values && about.values.length === 4 
              ? 'md:grid-cols-2 lg:grid-cols-4' 
              : 'md:grid-cols-3'
          }`}>
            {about.values && about.values.length > 0 ? (
              // Use values from JSON
              about.values.map((value: { icon: string; title: string; text: string }, idx: number) => {
                const IconComponent = getValueIcon(value.icon);
                return (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">{value.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">{value.text}</p>
                  </div>
                );
              })
            ) : (
              // Fallback hardcoded values
              <>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">Amor por los Animales</h3>
                  <p className="text-[var(--text-secondary)] text-sm">Tratamos a cada paciente como si fuera nuestro propio compañero.</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">Excelencia Profesional</h3>
                  <p className="text-[var(--text-secondary)] text-sm">Formación continua y tecnología de punta para el mejor diagnóstico.</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">Compromiso Familiar</h3>
                  <p className="text-[var(--text-secondary)] text-sm">Acompañamos a las familias en cada etapa de la vida de sus mascotas.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      {about.facilities && (
        <section className="section-padding bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-4">
                <Building2 className="w-4 h-4" />
                Instalaciones
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-heading text-[var(--text-primary)] mb-4">
                {about.facilities.title || 'Nuestras Instalaciones'}
              </h2>
              <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                {about.facilities.description}
              </p>
            </div>

            {/* Facilities Gallery */}
            {about.facilities.images && about.facilities.images.length > 0 && (
              <FacilitiesGallery images={about.facilities.images} />
            )}

            {/* Features Grid - With dynamic icons */}
            {about.facilities.features && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {about.facilities.features.map((feature: { icon: string; title: string; text: string }, idx: number) => {
                  const IconComponent = getFacilityIcon(feature.icon);
                  return (
                    <div key={idx} className="flex items-start gap-4 p-6 bg-[var(--bg-subtle)] rounded-2xl hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-1">{feature.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{feature.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {about.certifications && about.certifications.length > 0 && (
        <section className="section-padding bg-[var(--bg-subtle)]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-4">
                <BadgeCheck className="w-4 h-4" />
                Certificaciones
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-heading text-[var(--text-primary)] mb-4">
                Avales y Certificaciones
              </h2>
              <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                Cumplimos con los más altos estándares de calidad y regulaciones sanitarias
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-4xl mx-auto">
              {about.certifications.map((cert: { name: string; description: string; logo?: string }, idx: number) => (
                <CertificationBadge
                  key={idx}
                  name={cert.name}
                  description={cert.description}
                  logo={cert.logo}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 sm:w-56 lg:w-72 h-36 sm:h-56 lg:h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black font-heading text-white mb-4">
              ¿Listo para Conocernos?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Agenda tu primera consulta y descubre por qué miles de familias confían en nosotros para el cuidado de sus mascotas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${clinic}/book`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--primary)] font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                Agendar Cita
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href={`tel:${config.contact?.phone_display?.replace(/\s/g, '') || ''}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors border border-white/30"
              >
                <Phone className="w-5 h-5" />
                Llamar Ahora
              </a>
            </div>

            {/* Quick info */}
            <div className="mt-10 pt-8 border-t border-white/20 flex flex-wrap justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Urgencias 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>{config.contact?.phone_display || '+595 981 123 456'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
