import { Metadata } from 'next'
import {
  LandingNav,
  LandingFooter,
  Hero,
  ProblemSection,
  SolutionSection,
  HowItWorks,
  FeaturesShowcase,
  BenefitsSection,
  PricingSection,
  FAQSection,
  CTASection,
  ClientShowcase,
  NetworkMap,
  OwnerJourney,
  ContactForm,
  ComparisonTable,
  TrustBadges,
  ROICalculator,
  FloatingWhatsApp,
  PricingQuiz,
  TrialOffer,
} from '@/components/landing'

export const metadata: Metadata = {
  title: 'VetePy - La Red Veterinaria Digital de Paraguay',
  description:
    'Sitios web profesionales para veterinarias paraguayas. Una plataforma, multiples clinicas. Diseno de primer mundo, precio local. Sistema completo de gestion veterinaria con citas online, historial medico digital y mas.',
  keywords: [
    'veterinaria',
    'paraguay',
    'sitio web veterinario',
    'gestion veterinaria',
    'citas online',
    'mascotas',
    'veterinaria asuncion',
    'software veterinario',
  ],
  authors: [{ name: 'VetePy' }],
  openGraph: {
    title: 'VetePy - La Red Veterinaria Digital de Paraguay',
    description:
      'Sitios web profesionales para veterinarias paraguayas. Una plataforma, multiples clinicas. Sistema completo de gestion veterinaria.',
    type: 'website',
    locale: 'es_PY',
    siteName: 'VetePy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VetePy - La Red Veterinaria Digital de Paraguay',
    description: 'Sitios web profesionales para veterinarias paraguayas.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <Hero />

      {/* Problem: Why vets need digital presence */}
      <ProblemSection />

      {/* Solution: How VetePy works */}
      <SolutionSection />

      {/* How It Works: 3 simple steps */}
      <HowItWorks />

      {/* Client Showcase: Real clinics using VetePy */}
      <ClientShowcase />

      {/* Network Map: Find clinics near you */}
      <NetworkMap />

      {/* Features: Everything included */}
      <FeaturesShowcase />

      {/* Comparison: VetePy vs alternatives */}
      <ComparisonTable />

      {/* Benefits: For clinics and pet owners */}
      <BenefitsSection />

      {/* Pet Owner Journey: How it works for B2C */}
      <OwnerJourney />

      {/* Pricing Quiz: Find the right plan */}
      <PricingQuiz />

      {/* Pricing: Tiered plans for every clinic */}
      <PricingSection />

      {/* Trial Offer: 3 months free */}
      <TrialOffer />

      {/* ROI Calculator: Is it worth it? */}
      <ROICalculator />

      {/* Trust Badges: Security and tech */}
      <TrustBadges />

      {/* FAQ: Common questions */}
      <FAQSection />

      {/* Contact Form: Lead capture */}
      <ContactForm />

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <LandingFooter />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </main>
  )
}
