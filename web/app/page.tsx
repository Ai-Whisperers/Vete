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
} from '@/components/landing'

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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation - Sticky */}
      <LandingNav />

      {/* Hero Section */}
      <Hero />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Pricing Section */}
      <PricingSection />

      {/* How It Works */}
      <HowItWorks />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <LandingFooter />
    </main>
  )
}
