'use client';

import { ArrowRight, Play, Sparkles, Building2, CheckCircle2, Star, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const valueProps = [
  'Sitio web profesional',
  'Citas online 24/7',
  'Historial digital',
];

const floatingStats = [
  { value: '3-7', label: 'dias para estar online', icon: Clock },
  { value: '200K', label: 'Gs/mes todo incluido', icon: Star },
  { value: '2+', label: 'clinicas en la red', icon: Building2 },
];

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-[#0F172A]">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient orbs with subtle animation */}
        <div className="absolute top-1/4 left-1/4 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-[#2DCEA3]/25 rounded-full blur-[100px] md:blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-[#5C6BFF]/25 rounded-full blur-[80px] md:blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-[#00C9FF]/15 rounded-full blur-[80px] md:blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20 md:pt-28 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - Animated entrance */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 md:mb-8 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-white/80 text-xs md:text-sm font-medium">
              Primera red veterinaria digital de Paraguay
            </span>
          </div>

          {/* Headline - Simplified and punchy */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 md:mb-6 leading-[1.1] transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Tu veterinaria,{' '}
            <span className="bg-gradient-to-r from-[#2DCEA3] via-[#00C9FF] to-[#5C6BFF] bg-clip-text text-transparent">
              digital
            </span>
          </h1>

          {/* Subheadline - Direct pain point address */}
          <p
            className={`text-base md:text-lg lg:text-xl text-white/70 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Sitio web profesional + sistema de citas + historial medico.
            <span className="block mt-2 text-white/50 text-sm md:text-base">
              Sin programadores. Sin complicaciones. Listo en dias.
            </span>
          </p>

          {/* Quick value props - Simplified to 3 */}
          <div
            className={`flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-10 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {valueProps.map((prop, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DCEA3]" />
                <span className="text-white/70 text-xs md:text-sm">{prop}</span>
              </div>
            ))}
          </div>

          {/* Dual CTAs - Clear hierarchy */}
          <div
            className={`flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-16 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Primary CTA - More prominent */}
            <a
              href="https://wa.me/595981324569?text=Hola!%20Quiero%20saber%20mas%20sobre%20VetePy%20para%20mi%20veterinaria"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full shadow-xl shadow-[#2DCEA3]/20 hover:shadow-2xl hover:shadow-[#2DCEA3]/30 transition-all hover:-translate-y-1 text-sm md:text-base"
            >
              <Building2 className="w-4 h-4 md:w-5 md:h-5" />
              Quiero mi Sitio Web
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Secondary CTA - Less prominent */}
            <Link
              href="/adris"
              className="group inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/30 transition-all hover:-translate-y-1 text-sm md:text-base"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5" />
              Ver Demo en Vivo
            </Link>
          </div>

          {/* Trust Stats - Cleaner, 3 items */}
          <div
            className={`grid grid-cols-3 gap-3 md:gap-6 max-w-xl mx-auto transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {floatingStats.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={idx}
                  className="text-center p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <IconComponent className="w-4 h-4 text-[#2DCEA3] hidden md:block" />
                    <span className="text-xl md:text-2xl lg:text-3xl font-black text-white">{stat.value}</span>
                  </div>
                  <span className="text-white/50 text-[10px] md:text-xs leading-tight block">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll indicator - Now visible on mobile too */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5 md:p-2">
            <div className="w-1 h-2 md:w-1.5 md:h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
