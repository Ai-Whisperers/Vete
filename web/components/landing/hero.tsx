'use client'

import {
  ArrowRight,
  Play,
  Sparkles,
  Building2,
  CheckCircle2,
  Star,
  Users,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const valueProps = ['Sitio web profesional', 'Citas online 24/7', 'Historial digital']

const floatingStats = [
  { value: '3-7', label: 'dias para estar online', icon: Clock },
  { value: '200K', label: 'Gs/mes todo incluido', icon: Star },
  { value: '2+', label: 'clinicas en la red', icon: Building2 },
]

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#0F172A]">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient orbs with subtle animation */}
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-[#2DCEA3]/25 blur-[100px] md:h-[500px] md:w-[500px] md:blur-[120px]" />
        <div
          className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] animate-pulse rounded-full bg-[#5C6BFF]/25 blur-[80px] md:h-[400px] md:w-[400px] md:blur-[120px]"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute right-1/3 top-1/2 h-[200px] w-[200px] animate-pulse rounded-full bg-[#00C9FF]/15 blur-[80px] md:h-[300px] md:w-[300px] md:blur-[100px]"
          style={{ animationDelay: '2s' }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pb-12 pt-20 md:px-6 md:pb-16 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge - Animated entrance */}
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-all duration-700 md:mb-8 ${
              isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#2DCEA3]" />
            <span className="text-xs font-medium text-white/80 md:text-sm">
              Primera red veterinaria digital de Paraguay
            </span>
          </div>

          {/* Headline - Simplified and punchy */}
          <h1
            className={`mb-4 text-3xl font-black leading-[1.1] text-white transition-all delay-100 duration-700 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl xl:text-7xl ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Tu veterinaria, digital
          </h1>

          {/* Subheadline - Direct pain point address */}
          <p
            className={`mx-auto mb-6 max-w-2xl text-base leading-relaxed text-white/70 transition-all delay-200 duration-700 md:mb-8 md:text-lg lg:text-xl ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Sitio web profesional + sistema de citas + historial medico.
            <span className="mt-2 block text-sm text-white/50 md:text-base">
              Sin programadores. Sin complicaciones. Listo en dias.
            </span>
          </p>

          {/* Quick value props - Simplified to 3 */}
          <div
            className={`mb-8 flex flex-wrap justify-center gap-3 transition-all delay-300 duration-700 md:mb-10 md:gap-4 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {valueProps.map((prop, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2DCEA3]" />
                <span className="text-xs text-white/70 md:text-sm">{prop}</span>
              </div>
            ))}
          </div>

          {/* Dual CTAs - Clear hierarchy */}
          <div
            className={`delay-400 mb-12 flex flex-col justify-center gap-3 transition-all duration-700 sm:flex-row md:mb-16 md:gap-4 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {/* Primary CTA - More prominent */}
            <a
              href="https://wa.me/595981324569?text=Hola!%20Quiero%20saber%20mas%20sobre%20VetePy%20para%20mi%20veterinaria"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] px-6 py-3.5 text-sm font-bold text-[#0F172A] shadow-xl shadow-[#2DCEA3]/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#2DCEA3]/30 md:gap-3 md:px-8 md:py-4 md:text-base"
            >
              <Building2 className="h-4 w-4 md:h-5 md:w-5" />
              Quiero mi Sitio Web
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 md:h-5 md:w-5" />
            </a>

            {/* Secondary CTA - Less prominent */}
            <Link
              href="/adris"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 md:gap-3 md:px-8 md:py-4 md:text-base"
            >
              <Play className="h-4 w-4 md:h-5 md:w-5" />
              Ver Demo en Vivo
            </Link>
          </div>

          {/* Trust Stats - Cleaner, 3 items */}
          <div
            className={`mx-auto grid max-w-xl grid-cols-3 gap-3 transition-all delay-500 duration-700 md:gap-6 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {floatingStats.map((stat, idx) => {
              const IconComponent = stat.icon
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm md:p-4"
                >
                  <div className="mb-1 flex items-center justify-center gap-1.5">
                    <IconComponent className="hidden h-4 w-4 text-[#2DCEA3] md:block" />
                    <span className="text-xl font-black text-white md:text-2xl lg:text-3xl">
                      {stat.value}
                    </span>
                  </div>
                  <span className="block text-[10px] leading-tight text-white/50 md:text-xs">
                    {stat.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scroll indicator - Now visible on mobile too */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce md:bottom-8">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/20 p-1.5 md:h-10 md:w-6 md:p-2">
            <div className="h-2 w-1 animate-pulse rounded-full bg-white/40 md:h-3 md:w-1.5" />
          </div>
        </div>
      </div>
    </section>
  )
}
