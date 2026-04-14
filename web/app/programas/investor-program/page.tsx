import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter } from '@/components/landing'
import { CheckCircle2, ArrowLeft, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Paraguay Investor Program - LEALTIS',
  description: 'USD 6,900 complete program with 12 months of ongoing support for accounting, legal, tax, and investment advisory.',
}

export default function InvestorProgramPage() {
  const features = [
    'Everything in Paraguay Business',
    '12 months company accounting',
    '12 months legal + tax advisory',
    '12 months investment analysis',
    'Direct access to the LEALTIS team',
  ]

  const additionalBenefits = [
    'Ongoing compliance monitoring',
    'Quarterly business review',
    'Investment opportunity screening',
    'Tax optimization strategy',
    'Priority support via video calls',
  ]

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <Link href="/#programs" className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-[#dfc07a] mb-8 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Programs
          </Link>

          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full px-4 py-1 mb-4">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">Most Complete</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                Paraguay Investor Program
              </h1>
              <p className="text-2xl text-[#C9A84C] font-semibold mb-6">
                Your strategic partner for 12 months
              </p>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Everything in Paraguay Business plus comprehensive support for accounting, legal advice and investment analysis for one year. Perfect for entrepreneurs serious about building in Paraguay.
              </p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-900">USD 6,900</span>
                <p className="text-slate-600 mt-2">One-time investment, 12 months of ongoing support</p>
              </div>

              <Link
                href="/contacto"
                className="inline-block rounded-full bg-[#1B3A6B] text-white font-bold px-8 py-4 transition-all hover:bg-[#0f2447] hover:-translate-y-1 shadow-lg"
              >
                Get Started Today
              </Link>
            </div>

            <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5a9e] rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">What's Included</h2>
              <ul className="space-y-4 mb-8">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-[#C9A84C] mt-0.5" />
                    <span className="text-slate-100">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/20 pt-6">
                <h3 className="font-bold text-[#C9A84C] mb-4">Additional Benefits</h3>
                <ul className="space-y-3">
                  {additionalBenefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-slate-200">• {benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-3 mb-20">
            <div className="rounded-xl bg-amber-50 border-l-4 border-[#C9A84C] p-6">
              <h3 className="font-bold text-[#1B3A6B] mb-2">Ongoing Support</h3>
              <p className="text-slate-700">Full accounting, legal, and tax support throughout the first year of operations.</p>
            </div>
            <div className="rounded-xl bg-amber-50 border-l-4 border-[#C9A84C] p-6">
              <h3 className="font-bold text-[#1B3A6B] mb-2">Investment Focus</h3>
              <p className="text-slate-700">We help you identify and evaluate opportunities aligned with your goals.</p>
            </div>
            <div className="rounded-xl bg-amber-50 border-l-4 border-[#C9A84C] p-6">
              <h3 className="font-bold text-[#1B3A6B] mb-2">Direct Access</h3>
              <p className="text-slate-700">Priority communication with your dedicated LEALTIS team member.</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-12 mb-20">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-6 text-center">Why Choose the Investor Program?</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-bold text-[#1B3A6B] mb-3">Comprehensive Coverage</h3>
                <p className="text-slate-700">Don't worry about compliance, taxes, or legal requirements. We handle it all while you focus on building.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#1B3A6B] mb-3">Strategic Guidance</h3>
                <p className="text-slate-700">Investment analysis and quarterly reviews ensure your business stays on track and grows profitably.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#1B3A6B] mb-3">Peace of Mind</h3>
                <p className="text-slate-700">One year of uncertainty becomes predictability. You know exactly what to expect and what's expected of you.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#1B3A6B] mb-3">Foundation for Growth</h3>
                <p className="text-slate-700">We build the foundation for sustainable growth, whether you stay in Paraguay long-term or exit strategically.</p>
              </div>
            </div>
          </div>

          <div className="text-center py-20 bg-gradient-to-br from-[#1B3A6B] to-[#0f2447] rounded-2xl text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Future in Paraguay?</h2>
            <p className="text-slate-200 mb-8 max-w-2xl mx-auto">
              Book a free 30-minute consultation to explore whether the Investor Program is right for your situation.
            </p>
            <Link
              href="/contacto"
              className="inline-block rounded-full bg-[#C9A84C] text-[#1B3A6B] font-bold px-8 py-4 transition-all hover:bg-[#dfc07a] hover:-translate-y-1 shadow-lg"
            >
              Book Free Consultation
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  )
}
