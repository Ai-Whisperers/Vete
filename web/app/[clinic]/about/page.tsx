
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';

export default async function AboutPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) notFound();

  const { about } = data;

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Intro Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[var(--bg-subtle)]" />
          <div className="absolute inset-0 z-0 opacity-5" style={{ background: 'var(--gradient-hero)' }} /> {/* Subtle tint */}
          
          <div className="container relative z-10 max-w-4xl mx-auto">
              <span className="text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-4 block animate-fade-in">Nuestra Historia</span>
              <h1 className="text-4xl md:text-5xl font-black font-heading mb-8 text-[var(--text-primary)] leading-tight">{about.intro.title}</h1>
              <div className="prose prose-lg mx-auto text-[var(--text-secondary)] leading-relaxed">
                  <p>{about.intro.text}</p>
              </div>
          </div>
      </section>

      {/* Team Grid */}
      <section className="py-24 bg-white relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          
          <div className="container px-4 md:px-6">
              <div className="text-center mb-16">
                   <h2 className="text-3xl font-black font-heading text-[var(--text-primary)] mb-4">{data.config.ui_labels?.about.team_title || 'Nuestro Equipo'}</h2>
                   <div className="h-1 w-20 bg-[var(--accent)] mx-auto rounded-full" />
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {about.team.map((member: any, index: number) => (
                      <div key={index} className="group bg-[var(--bg-paper)] rounded-[var(--radius)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden text-center">
                          <div className="h-48 bg-[var(--bg-subtle)] w-full relative overflow-hidden group-hover:bg-[var(--primary)]/5 transition-colors">
                              {/* Avatar placeholder - would use next/image in real app */}
                              <div className="absolute inset-0 flex items-center justify-center text-[var(--primary)] opacity-20">
                                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                              </div>
                          </div>
                          <div className="p-8 relative">
                              <div className="w-20 h-20 mx-auto -mt-16 bg-white rounded-full p-1 shadow-md mb-4 flex items-center justify-center border-2 border-[var(--primary)]">
                                   <span className="font-heading font-bold text-xl text-[var(--primary)]">{member.name.charAt(0)}</span>
                              </div>
                              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{member.name}</h3>
                              <div className="text-[var(--accent)] font-bold text-sm uppercase tracking-wider mb-6">{member.role}</div>
                              <p className="text-[var(--text-secondary)] leading-relaxed italic border-t pt-6 border-gray-100">"{member.bio}"</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>
    </div>
  );
}
