import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { CostCalculator } from '@/components/landing/cost-calculator'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cost of Living Calculator: Your City vs Asunción | LEALTIS',
  description: 'Compare your current city\'s cost of living with Asunción, Paraguay. See real savings on rent, food, transport, and more.',
  keywords: ['cost of living Paraguay', 'Asunción cost of living', 'living cost calculator', 'move to Paraguay cost', 'Europe vs Paraguay cost'],
  alternates: { canonical: '/costo-de-vida' },
}

export default function CostoDeVidaPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Cost of Living Calculator
            </h1>
            <p className="text-xl text-slate-600">
              Compare your current city with Asunción. See how much you could save on everyday expenses.
            </p>
          </div>

          <CostCalculator />

          <div className="max-w-2xl mx-auto mt-16 p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Combine savings with tax benefits</h2>
            <p className="text-slate-300 mb-8">Lower living costs PLUS zero foreign income tax. The total benefit is extraordinary. Let us show you the full picture.</p>
            <Link href="/lealtis/contacto" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 font-bold text-white shadow-lg hover:bg-[#a67c2e] transition-all">
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
