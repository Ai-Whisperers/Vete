
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { Award, Heart, Users, Stethoscope } from 'lucide-react';

export default async function AboutPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) notFound();

  const { about, config } = data;

  // Role to gradient/color mapping for visual variety
  const getRoleStyle = (role: string) => {
    const roleLC = role.toLowerCase();
    if (roleLC.includes('director') || roleLC.includes('fundador')) {
      return {
        gradient: 'from-[var(--primary)] to-[var(--primary-dark)]',
        badge: 'bg-[var(--primary)]/10 text-[var(--primary)]',
        icon: Award
      };
    }
    if (roleLC.includes('cirugía') || roleLC.includes('cirujano')) {
      return {
        gradient: 'from-blue-600 to-blue-700',
        badge: 'bg-blue-50 text-blue-700',
        icon: Stethoscope
      };
    }
    if (roleLC.includes('diagnóstico') || roleLC.includes('imagen')) {
      return {
        gradient: 'from-purple-600 to-purple-700',
        badge: 'bg-purple-50 text-purple-700',
        icon: Stethoscope
      };
    }
    return {
      gradient: 'from-[var(--accent)] to-[var(--secondary-dark)]',
      badge: 'bg-[var(--accent)]/10 text-[var(--secondary-dark)]',
      icon: Heart
    };
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">

      {/* Hero Section - With visual interest */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background pattern and gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--bg-subtle)] via-white to-[var(--bg-subtle)]" />
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--accent)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-6">
            <Heart className="w-4 h-4" />
            {data.config.ui_labels?.about?.intro_badge || 'Nuestra Historia'}
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading mb-8 text-[var(--text-primary)] leading-tight">
            {about.intro.title}
          </h1>

          {/* Story text with better formatting */}
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[var(--primary)] via-[var(--accent)] to-transparent rounded-full hidden md:block" />
            <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed md:pl-8 text-left md:text-justify">
              {about.intro.text}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-gray-200">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-1">+15K</p>
              <p className="text-sm text-[var(--text-muted)] font-medium">Mascotas Atendidas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-1">9+</p>
              <p className="text-sm text-[var(--text-muted)] font-medium">Años de Experiencia</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-1">24/7</p>
              <p className="text-sm text-[var(--text-muted)] font-medium">Atención Urgencias</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-1">4.9</p>
              <p className="text-sm text-[var(--text-muted)] font-medium">Calificación Google</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Grid - Redesigned */}
      <section className="section-padding bg-white relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="container px-4 md:px-6">
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
            {about.team.map((member: any, index: number) => {
              const style = getRoleStyle(member.role);
              const IconComponent = style.icon;

              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
                >
                  {/* Photo area with gradient placeholder */}
                  <div className={`h-48 bg-gradient-to-br ${style.gradient} w-full relative overflow-hidden`}>
                    {/* If member has photo URL, show it */}
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Decorative placeholder */
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-4xl font-black text-white/80">
                            {member.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Role badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${style.badge}`}>
                      <IconComponent className="w-3 h-3" />
                      {member.role.split(' ').slice(0, 2).join(' ')}
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--primary)] transition-colors">
                      {member.name}
                    </h3>

                    {/* Bio - Truncated with hover expansion */}
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                      {member.bio}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-[var(--bg-subtle)]">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black font-heading text-[var(--text-primary)] mb-4">
              Nuestros Valores
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
          </div>
        </div>
      </section>

    </div>
  );
}
