import { Metadata } from 'next';
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
  CTASection
} from '@/components/landing';

export const metadata: Metadata = {
  title: 'VetePy - La Red Veterinaria Digital de Paraguay',
  description: 'Sitios web profesionales para veterinarias paraguayas. Una plataforma, múltiples clínicas. Diseño de primer mundo, precio local. Sistema completo de gestión veterinaria.',
  keywords: ['veterinaria', 'paraguay', 'sitio web veterinario', 'gestión veterinaria', 'citas online', 'mascotas'],
  authors: [{ name: 'VetePy' }],
  openGraph: {
    title: 'VetePy - La Red Veterinaria Digital de Paraguay',
    description: 'Sitios web profesionales para veterinarias paraguayas. Una plataforma, múltiples clínicas.',
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
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0F172A]">
      <LandingNav />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <FeaturesShowcase />
      <BenefitsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
