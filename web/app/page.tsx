import { Metadata } from 'next'
import {
  LandingNav,
  LandingFooter,
  Hero,
  TrustBadges,
  PricingSection,
  HowItWorks,
  FAQSection,
  CTASection,
  CookieConsent,
  FloatingWhatsApp,
  OrganizationSchema,
  ServiceSchema,
  FAQSchema,
  HowToSchema,
} from '@/components/landing'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'LEALTIS — Paraguay Establishment for Europeans',
  description:
    'Professional relocation to Paraguay: residency, company formation, and bank account in one integrated program. Two programs for entrepreneurs and investors.',
  keywords: [
    'Paraguay residency',
    'business relocation',
    'Paraguay company formation',
    'investment Paraguay',
    'European relocation',
    'Paraguay bank account',
  ],
  authors: [{ name: 'LEALTIS' }],
  openGraph: {
    title: 'LEALTIS — Paraguay Establishment for Europeans',
    description:
      'Professional relocation to Paraguay: residency, company formation, and bank account in one integrated program.',
    type: 'website',
    locale: 'en_US',
    siteName: 'LEALTIS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LEALTIS — Paraguay Establishment for Europeans',
    description: 'Professional Paraguay relocation program for European entrepreneurs.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function LandingPage() {
  const t = await getTranslations('faq')
  const pt = await getTranslations('process')

  const faqs = t.raw('items') as Array<{ question: string; answer: string }>
  const steps = pt.raw('steps') as Array<{ title: string; description: string }>

  return (
    <main className="min-h-screen bg-white">
      <OrganizationSchema />
      <ServiceSchema />
      <FAQSchema faqs={faqs} />
      <HowToSchema steps={steps} />

      <LandingNav />
      <Hero />

      <section className="py-8 border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm text-slate-400 mb-6 uppercase tracking-wider">Trusted by entrepreneurs from</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {['Netherlands', 'Germany', 'Belgium', 'Austria', 'Spain', 'Switzerland'].map((country) => (
              <span key={country} className="text-lg font-semibold text-slate-300">{country}</span>
            ))}
          </div>
        </div>
      </section>

      <TrustBadges />
      <PricingSection />
      <HowItWorks />
      <FAQSection />
      <CTASection />
      <LandingFooter />

      <FloatingWhatsApp />
      <CookieConsent />
    </main>
  )
}
