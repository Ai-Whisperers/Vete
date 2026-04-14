import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing - Transparent Program Costs',
  description: 'Complete breakdown of LEALTIS program costs. Paraguay Business USD 4,400, Investor Program USD 6,900. No hidden fees.',
  keywords: ['Paraguay residency cost', 'Paraguay relocation price', 'company formation Paraguay cost'],
}

const businessIncludes = [
  { item: 'Paraguayan Residency Application', gov: '~$435' },
  { item: 'Paraguayan National ID (Cédula)', gov: 'Included' },
  { item: 'Company Formation (EAS/S.A.)', gov: '~$200' },
  { item: 'Tax Registration (RUC)', gov: 'Free' },
  { item: 'Business Bank Account Coordination', gov: 'Free' },
  { item: 'Full Document Pre-Validation', gov: '—' },
  { item: 'Operative Day (all procedures in one morning)', gov: '—' },
  { item: 'Exclusive Driver + Transfers', gov: '~$150' },
  { item: 'Strategic Real Estate Tour', gov: '—' },
  { item: 'Integral Technical Advisory', gov: '—' },
  { item: 'Professional Fees, IVA, Admin Costs', gov: '~$3,615' },
]

const investorExtras = [
  { item: '12 months Company Accounting', value: '$1,800 value' },
  { item: '12 months Legal + Tax Advisory', value: '$1,500 value' },
  { item: '12 months Investment Analysis', value: '$1,200 value' },
  { item: 'Direct access to LEALTIS team', value: 'Priceless' },
]

const exclusions = [
  'International flights',
  'Accommodation in Asunción (we can recommend options $40-80/night)',
  'Personal expenses',
  'Sworn translations in your home country',
  'Apostilles/legalizations in your home country',
  'Additional legal services beyond program scope',
  'Post-program service renewals',
]

export default function PricingPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Transparent Pricing. No Surprises.
            </h1>
            <p className="text-xl text-slate-600">
              Everything included in one price. See exactly what you pay and what you get.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {/* Business */}
            <div className="border-2 border-slate-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-2">Paraguay Business</h2>
              <p className="text-slate-600 mb-6">Residency + Company + Bank Account</p>
              <div className="text-5xl font-bold text-[#1B3A6B] mb-1">USD 4,400</div>
              <p className="text-sm text-slate-500 mb-8">One-time payment. All-inclusive.</p>
              <ul className="space-y-3">
                {businessIncludes.map((b) => (
                  <li key={b.item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-700">{b.item}</span>
                      {b.gov !== '—' && b.gov !== 'Free' && (
                        <span className="text-xs text-slate-400 ml-2">({b.gov})</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/contacto" className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 py-3 font-bold text-white hover:bg-[#a67c2e] transition-all">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Investor */}
            <div className="border-2 border-[#C9A84C] rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C9A84C] text-white text-sm font-bold px-4 py-1 rounded-full">
                Most Popular
              </div>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-2">Paraguay Investor Program</h2>
              <p className="text-slate-600 mb-6">Everything above + 12 months support</p>
              <div className="text-5xl font-bold text-[#1B3A6B] mb-1">USD 6,900</div>
              <p className="text-sm text-slate-500 mb-2">One-time payment. All-inclusive.</p>
              <p className="text-sm text-[#C9A84C] font-semibold mb-8">Just $575/month for ongoing accounting + legal + advisory</p>
              <p className="font-semibold text-[#1B3A6B] mb-4">Everything in Paraguay Business, plus:</p>
              <ul className="space-y-3">
                {investorExtras.map((e) => (
                  <li key={e.item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-700">{e.item}</span>
                      <span className="text-xs text-[#C9A84C] ml-2">({e.value})</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/contacto" className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1B3A6B] px-6 py-3 font-bold text-white hover:bg-[#0f2447] transition-all">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Exclusions */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">What&apos;s Not Included</h2>
            <ul className="space-y-3">
              {exclusions.map((e) => (
                <li key={e} className="flex items-center gap-3 text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}
