'use client'

import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const t = useTranslations('hero')

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-[90svh] overflow-hidden bg-gradient-to-br from-[#1B3A6B] to-[#0f2447] pt-28 md:pt-0">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#C9A84C]/10 blur-3xl" />
        <div className="absolute -left-40 -bottom-40 h-96 w-96 rounded-full bg-[#C9A84C]/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto flex min-h-[90svh] items-center px-4 md:px-6">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 transition-all duration-700 md:mb-8 ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-[#C9A84C]" />
              <span className="text-sm font-semibold text-[#C9A84C]">{t('badge')}</span>
            </div>

            {/* Headline */}
            <h1
              className={`mb-6 text-4xl font-bold leading-tight text-white transition-all delay-100 duration-700 md:text-5xl lg:text-6xl ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t('title')}
            </h1>

            {/* Subheadline */}
            <p
              className={`mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-200 transition-all delay-200 duration-700 lg:mx-0 md:text-xl ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              {t('subtitle')}
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col justify-center gap-4 transition-all delay-300 duration-700 sm:flex-row lg:justify-start ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <Link
                href="/lealtis/contacto"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 text-base font-bold text-[#1B3A6B] shadow-lg shadow-[#C9A84C]/25 transition-all hover:-translate-y-1 hover:bg-[#dfc07a] hover:shadow-[#C9A84C]/40"
              >
                {t('cta')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="#programs"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-8 py-4 text-base font-bold text-white shadow-sm ring-1 ring-white/20 transition-all hover:-translate-y-1 hover:bg-white/20 hover:shadow-md"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Right Column - Key Points */}
          <div
            className={`hidden space-y-6 lg:block transition-all delay-400 duration-700 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
          >
            <div className="space-y-4">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">One Trip</h3>
                    <p className="text-sm text-slate-300">All procedures in one morning</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">One Team</h3>
                    <p className="text-sm text-slate-300">No coordination between providers</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">One Price</h3>
                    <p className="text-sm text-slate-300">Transparent, no hidden costs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
