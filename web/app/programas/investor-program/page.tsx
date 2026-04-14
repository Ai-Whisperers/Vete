import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { CheckCircle2, ArrowLeft, Star } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Paraguay Investor Program - LEALTIS',
  description: 'USD 6,900 complete program with 12 months of ongoing support for accounting, legal, tax, and investment advisory.',
}

export default async function InvestorProgramPage() {
  const t = await getTranslations('programInvestor')

  const features = t.raw('includes') as string[]

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <Link href="/#programs" className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-[#dfc07a] mb-8 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            {t('cta')}
          </Link>

          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full px-4 py-1 mb-4">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">Most Complete</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t('name')}
              </h1>
              <p className="text-2xl text-[#C9A84C] font-semibold mb-6">
                {t('tagline')}
              </p>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                {t('description')}
              </p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-900">{t('price')}</span>
              </div>

              <Link
                href="/contacto"
                className="inline-block rounded-full bg-[#1B3A6B] text-white font-bold px-8 py-4 transition-all hover:bg-[#0f2447] hover:-translate-y-1 shadow-lg"
              >
                {t('cta')}
              </Link>
            </div>

            <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5a9e] rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">What&apos;s Included</h2>
              <ul className="space-y-4">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-[#C9A84C] mt-0.5" />
                    <span className="text-slate-100">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center py-20 bg-gradient-to-br from-[#1B3A6B] to-[#0f2447] rounded-2xl text-white">
            <Link
              href="/contacto"
              className="inline-block rounded-full bg-[#C9A84C] text-[#1B3A6B] font-bold px-8 py-4 transition-all hover:bg-[#dfc07a] hover:-translate-y-1 shadow-lg"
            >
              {t('cta')}
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
