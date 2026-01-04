'use client'

import { ArrowRight, MessageCircle, Play, Sparkles, Gift, Shield, Clock, Check } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#0F172A] py-16 md:py-24">
      {/* Gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#2DCEA3]/20 via-[#00C9FF]/10 to-[#5C6BFF]/20 blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge with urgency */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2DCEA3]/20 bg-[#2DCEA3]/10 px-4 py-2">
            <Gift className="h-4 w-4 text-[#2DCEA3]" />
            <span className="text-sm font-bold text-[#2DCEA3]">3 meses de prueba gratis</span>
          </div>

          {/* Headline */}
          <h2 className="mb-4 text-2xl font-black leading-tight text-white sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl">
            ¿Listo para digitalizar{' '}
            <span className="bg-gradient-to-r from-[#2DCEA3] via-[#00C9FF] to-[#5C6BFF] bg-clip-text text-transparent">
              tu veterinaria
            </span>
            ?
          </h2>

          {/* Subtext */}
          <p className="mx-auto mb-8 max-w-xl text-sm text-white/60 md:text-base lg:text-lg">
            Unite a la red de veterinarias mas moderna de Paraguay. Probalo 3 meses gratis y decidi
            despues.
          </p>

          {/* CTAs */}
          <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row md:gap-4">
            <a
              href="https://wa.me/595981324569?text=Hola!%20Quiero%20la%20prueba%20gratis%20de%20VetePy"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] px-6 py-3.5 text-sm font-bold text-[#0F172A] shadow-xl shadow-[#2DCEA3]/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#2DCEA3]/30 md:px-8 md:py-4 md:text-base"
            >
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
              Empezar Prueba Gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 md:h-5 md:w-5" />
            </a>
            <Link
              href="/adris"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 md:px-8 md:py-4 md:text-base"
            >
              <Play className="h-4 w-4 md:h-5 md:w-5" />
              Ver Demo
            </Link>
          </div>

          {/* Trust elements */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <span className="flex items-center gap-2 text-xs text-white/50 md:text-sm">
              <Check className="h-4 w-4 text-[#2DCEA3]" />
              Sin tarjeta de credito
            </span>
            <span className="flex items-center gap-2 text-xs text-white/50 md:text-sm">
              <Check className="h-4 w-4 text-[#2DCEA3]" />
              Cancela cuando quieras
            </span>
            <span className="flex items-center gap-2 text-xs text-white/50 md:text-sm">
              <Check className="h-4 w-4 text-[#2DCEA3]" />
              Listo en 3-7 dias
            </span>
          </div>

          {/* Additional trust */}
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="mb-4 text-xs text-white/40">Garantias incluidas</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <Shield className="h-4 w-4 text-[#2DCEA3]" />
                <span className="text-xs text-white/60">Datos seguros</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <Clock className="h-4 w-4 text-[#2DCEA3]" />
                <span className="text-xs text-white/60">Soporte incluido</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <Sparkles className="h-4 w-4 text-[#2DCEA3]" />
                <span className="text-xs text-white/60">Actualizaciones gratis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
