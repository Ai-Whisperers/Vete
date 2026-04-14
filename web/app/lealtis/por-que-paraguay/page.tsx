import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Why Paraguay - LEALTIS',
  description: 'Discover why Paraguay is the ideal destination for European relocation and business establishment.',
}

export default async function WhyParaguayPage() {
  const t = await getTranslations()

  const economyItems = t.raw('whyParaguay.economy.items') as string[]
  const investmentItems = t.raw('whyParaguay.investment.items') as string[]
  const lifestyleItems = t.raw('whyParaguay.lifestyle.items') as string[]
  const honestItems = t.raw('whyParaguay.honest.items') as string[]

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('whyParaguay.title')}
          </h1>
          <p className="text-xl text-slate-600 mb-20 max-w-3xl">{t('whyParaguay.subtitle')}</p>

          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">{t('whyParaguay.economy.title')}</h2>
              <ul className="space-y-4">
                {economyItems.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-[#C9A84C] font-bold">•</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">{t('whyParaguay.investment.title')}</h2>
              <ul className="space-y-3">
                {investmentItems.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-[#C9A84C]">✓</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">{t('whyParaguay.lifestyle.title')}</h2>
              <ul className="space-y-4">
                {lifestyleItems.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-[#C9A84C] font-bold">•</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">{t('whyParaguay.honest.title')}</h2>
              <ul className="space-y-4">
                {honestItems.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-[#C9A84C] font-bold">•</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="py-20 bg-slate-50 rounded-2xl px-8 text-center">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-4">{t('whyParaguay.cta')}</h2>
            <Link
              href="/lealtis/contacto"
              className="inline-block rounded-full bg-[#1B3A6B] text-white font-bold px-8 py-4 transition-all hover:bg-[#0f2447] hover:-translate-y-1 shadow-lg"
            >
              {t('nav.bookConsultation')}
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}
