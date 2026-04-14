'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function CTASection() {
  const t = useTranslations('finalCta')

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-[#1B3A6B] to-[#0f2447]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="mb-4 text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('title')}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-200">
            {t('subtitle')}
          </p>

          <Link
            href="/lealtis/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 text-lg font-bold text-[#1B3A6B] shadow-lg shadow-[#C9A84C]/25 transition-all hover:-translate-y-1 hover:bg-[#dfc07a] hover:shadow-[#C9A84C]/40"
          >
            {t('cta')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
