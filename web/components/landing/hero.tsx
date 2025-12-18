import { ArrowRight, Play, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const valueProps = [
  'Sitio web profesional',
  'Sistema de citas',
  'Historial médico digital',
  'Soporte técnico'
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0F172A]">
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2DCEA3]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#5C6BFF]/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-[#00C9FF]/20 rounded-full blur-[100px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-24 md:pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-white/80 text-sm font-medium">
              La primera red veterinaria digital de Paraguay
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] animate-fade-in stagger-1">
            Tu clínica veterinaria,{' '}
            <span className="bg-gradient-to-r from-[#2DCEA3] via-[#00C9FF] to-[#5C6BFF] bg-clip-text text-transparent">
              online y profesional
            </span>
          </h1>

          {/* Subheadline - More specific value prop */}
          <p className="text-lg md:text-xl text-white/70 mb-6 max-w-3xl mx-auto leading-relaxed animate-fade-in stagger-2">
            Dejá de perder clientes por no tener presencia digital. VetePy te da un sitio web
            profesional con sistema de citas, historial médico y todas las herramientas que necesitás
            para competir con las grandes cadenas veterinarias.
          </p>

          {/* Quick value props */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in stagger-2">
            {valueProps.map((prop, idx) => (
              <div key={idx} className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#2DCEA3]" />
                <span>{prop}</span>
              </div>
            ))}
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in stagger-3">
            <a
              href="https://wa.me/595981324569?text=Hola!%20Soy%20veterinario%20y%20me%20interesa%20VetePy%20para%20mi%20cl%C3%ADnica"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full shadow-xl shadow-[#2DCEA3]/20 hover:shadow-2xl hover:shadow-[#2DCEA3]/30 transition-all hover:-translate-y-1"
            >
              <Building2 className="w-5 h-5" />
              Quiero mi Sitio Web
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              href="/adris"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 hover:border-white/30 transition-all hover:-translate-y-1"
            >
              <Play className="w-5 h-5" />
              Ver Demo en Vivo
            </Link>
          </div>

          {/* Trust Stats - More meaningful */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 animate-fade-in stagger-4">
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">3-7</div>
              <div className="text-white/50 text-xs md:text-sm">Días para estar online</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">200K</div>
              <div className="text-white/50 text-xs md:text-sm">Gs/mes todo incluido</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">100+</div>
              <div className="text-white/50 text-xs md:text-sm">Funcionalidades</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">24/7</div>
              <div className="text-white/50 text-xs md:text-sm">Tu sitio siempre activo</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
