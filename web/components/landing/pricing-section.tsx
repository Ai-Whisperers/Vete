'use client'

import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function PricingSection() {
  const t = useTranslations()

  return (
    <section id="programs" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl md:text-5xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('programs.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            {t('programs.subtitle')}
          </p>
        </div>

        {/* Two Program Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Paraguay Business Card */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 md:p-10 hover:border-[#C9A84C] transition-all duration-300">
            <div className="mb-6">
              <h3 className="mb-2 text-3xl font-bold text-[#1B3A6B]">
                {t('programBusiness.name')}
              </h3>
              <p className="text-lg text-[#C9A84C] font-semibold mb-4">
                {t('programBusiness.tagline')}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">{t('programBusiness.price')}</span>
                <p className="text-slate-600 text-sm mt-2">One-time investment</p>
              </div>
            </div>

            <p className="mb-8 text-slate-600 leading-relaxed">
              {t('programBusiness.description')}
            </p>

            {/* Features List */}
            <div className="mb-8 space-y-4">
              {(t.raw('programBusiness.includes') as string[]).map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#C9A84C] mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href="/lealtis/contacto"
              className="block w-full rounded-full bg-[#1B3A6B] text-white font-bold py-4 text-center transition-all hover:bg-[#0f2447] hover:-translate-y-1 shadow-lg"
            >
              {t('programBusiness.cta')}
            </Link>
          </div>

          {/* Paraguay Investor Program Card - Highlighted */}
          <div className="rounded-2xl border-2 border-[#C9A84C] bg-gradient-to-br from-[#1B3A6B] to-[#2d5a9e] p-8 md:p-10 relative overflow-hidden group">
            {/* Badge */}
            <div className="absolute top-0 right-0 bg-[#C9A84C] text-[#1B3A6B] px-4 py-1 rounded-bl-lg font-bold text-sm">
              MOST COMPLETE
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-3xl font-bold text-white">
                {t('programInvestor.name')}
              </h3>
              <p className="text-lg text-[#C9A84C] font-semibold mb-4">
                {t('programInvestor.tagline')}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{t('programInvestor.price')}</span>
                <p className="text-slate-300 text-sm mt-2">One-time investment</p>
              </div>
            </div>

            <p className="mb-8 text-slate-200 leading-relaxed">
              {t('programInvestor.description')}
            </p>

            {/* Features List */}
            <div className="mb-8 space-y-4">
              {(t.raw('programInvestor.includes') as string[]).map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#C9A84C] mt-0.5" />
                  <span className="text-slate-100">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href="/lealtis/contacto"
              className="block w-full rounded-full bg-[#C9A84C] text-[#1B3A6B] font-bold py-4 text-center transition-all hover:bg-[#dfc07a] hover:-translate-y-1 shadow-lg"
            >
              {t('programInvestor.cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
