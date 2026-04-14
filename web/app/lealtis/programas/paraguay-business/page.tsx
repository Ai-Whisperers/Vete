import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Paraguay Business Program - LEALTIS',
  description: 'USD 4,400 all-inclusive program for European entrepreneurs to establish residency and company in Paraguay in one trip.',
}

export default async function ParaguayBusinessPage() {
  const t = await getTranslations('programBusiness')

  const features = t.raw('includes') as string[]

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <Link href="/lealtis/#programs" className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-[#dfc07a] mb-8 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            {t('cta')}
          </Link>

          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <div>
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
                href="/lealtis/contacto"
                className="inline-block rounded-full bg-[#1B3A6B] text-white font-bold px-8 py-4 transition-all hover:bg-[#0f2447] hover:-translate-y-1 shadow-lg"
              >
                {t('cta')}
              </Link>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">What&apos;s Included</h2>
              <ul className="space-y-4">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-[#C9A84C] mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center py-20 bg-slate-50 rounded-2xl">
            <Link
              href="/lealtis/contacto"
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
