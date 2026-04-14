import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { TaxCalculator } from '@/components/landing/tax-calculator'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Calculadora de Ahorro Fiscal | LEALTIS',
  description: 'Calculate your potential tax savings by relocating to Paraguay. Compare your current tax burden with Paraguay\'s territorial tax system.',
  keywords: ['tax savings calculator', 'Paraguay tax calculator', 'how much save Paraguay', 'tax comparison calculator', 'relocation savings'],
  alternates: { canonical: '/calculadora' },
}

export default function CalculadoraPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Tax Savings Calculator
            </h1>
            <p className="text-xl text-slate-600">
              See how much you could save by establishing tax residency in Paraguay. Enter your details below.
            </p>
          </div>

          <TaxCalculator />

          <div className="max-w-2xl mx-auto mt-16 p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Want a personalized analysis?</h2>
            <p className="text-slate-300 mb-8">This calculator gives you a rough estimate. For a detailed analysis of your specific situation, book a free consultation.</p>
            <Link href="/contacto" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 font-bold text-white shadow-lg hover:bg-[#a67c2e] transition-all">
              Book Free Consultation
              <ArrowRight className="h-5 w-5" />
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
