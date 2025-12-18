'use client';

import { ArrowRight, MessageCircle, Play, Sparkles, Gift, Shield, Clock, Check } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#2DCEA3]/20 via-[#00C9FF]/10 to-[#5C6BFF]/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge with urgency */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DCEA3]/10 border border-[#2DCEA3]/20 mb-6">
            <Gift className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-[#2DCEA3] text-sm font-bold">
              3 meses de prueba gratis
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
            ¿Listo para digitalizar{' '}
            <span className="bg-gradient-to-r from-[#2DCEA3] via-[#00C9FF] to-[#5C6BFF] bg-clip-text text-transparent">
              tu veterinaria
            </span>
            ?
          </h2>

          {/* Subtext */}
          <p className="text-white/60 text-sm md:text-base lg:text-lg mb-8 max-w-xl mx-auto">
            Unite a la red de veterinarias mas moderna de Paraguay.
            Probalo 3 meses gratis y decidi despues.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8">
            <a
              href="https://wa.me/595981324569?text=Hola!%20Quiero%20la%20prueba%20gratis%20de%20VetePy"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full shadow-xl shadow-[#2DCEA3]/20 hover:shadow-2xl hover:shadow-[#2DCEA3]/30 transition-all hover:-translate-y-1 text-sm md:text-base"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              Empezar Prueba Gratis
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              href="/adris"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/30 transition-all hover:-translate-y-1 text-sm md:text-base"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5" />
              Ver Demo
            </Link>
          </div>

          {/* Trust elements */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <span className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
              <Check className="w-4 h-4 text-[#2DCEA3]" />
              Sin tarjeta de credito
            </span>
            <span className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
              <Check className="w-4 h-4 text-[#2DCEA3]" />
              Cancela cuando quieras
            </span>
            <span className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
              <Check className="w-4 h-4 text-[#2DCEA3]" />
              Listo en 3-7 dias
            </span>
          </div>

          {/* Additional trust */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-white/40 text-xs mb-4">Garantias incluidas</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                <Shield className="w-4 h-4 text-[#2DCEA3]" />
                <span className="text-white/60 text-xs">Datos seguros</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                <Clock className="w-4 h-4 text-[#2DCEA3]" />
                <span className="text-white/60 text-xs">Soporte incluido</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                <Sparkles className="w-4 h-4 text-[#2DCEA3]" />
                <span className="text-white/60 text-xs">Actualizaciones gratis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
