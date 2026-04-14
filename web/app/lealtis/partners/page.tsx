import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, Users, DollarSign, Handshake, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'LEALTIS Partner Program — Earn Referral Commissions',
  description: 'Join the LEALTIS partner program. Earn USD 300–690 per referral by introducing clients to Paraguay residency and investment programs.',
  keywords: ['LEALTIS partner program', 'Paraguay referral commission', 'residency referral program', 'earn money referring clients'],
}

const steps = [
  { num: '1', text: 'Register as a partner (contact form below)' },
  { num: '2', text: 'Receive your unique referral code' },
  { num: '3', text: 'Share with your network' },
  { num: '4', text: 'Track referrals in real-time' },
  { num: '5', text: 'Get paid monthly' },
]

export default function PartnersPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              LEALTIS Partner Program
            </h1>
            <p className="text-xl text-slate-600">
              Earn commissions by referring clients to Paraguay&apos;s top relocation and investment programs. No limits, no hassle.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                  For Clients
                </h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">Refer a client to <strong>Paraguay Business</strong> → earn <strong>USD 300</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">Refer a client to <strong>Investor Program</strong> → earn <strong>USD 500</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">No limit on referrals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">Paid after the referred client completes their operative day</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#1B3A6B] rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]">
                  <Handshake className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                  For Partners
                </h2>
              </div>
              <p className="text-slate-300 text-sm mb-4">Lawyers, Tax Advisors, Wealth Managers</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-200"><strong>5–10% commission</strong> (USD 220–690 per client)</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-200">Co-branded materials provided</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-200">Dedicated partner support</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-200">Quarterly reporting</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-8 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step) => (
                <div key={step.num} className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A84C] text-white font-bold text-lg mx-auto mb-3">
                    {step.num}
                  </div>
                  <p className="text-sm text-slate-700">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-slate-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-2 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
              Register Your Interest
            </h2>
            <p className="text-slate-600 mb-6 text-center">Fill in your details and we&apos;ll set up your partner account within 48 hours.</p>
            <form action="/api/contact" method="POST" className="space-y-4">
              <input type="hidden" name="country" value="partner" />
              <input type="hidden" name="program_interest" value="partner-program" />
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  required
                  className="rounded-lg border border-slate-200 px-4 py-3 text-slate-700 focus:outline-none focus:border-[#C9A84C]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  className="rounded-lg border border-slate-200 px-4 py-3 text-slate-700 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
              <input
                type="text"
                name="profession"
                placeholder="Profession (e.g., Tax Advisor, Lawyer, Wealth Manager)"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-700 focus:outline-none focus:border-[#C9A84C]"
              />
              <textarea
                name="message"
                placeholder="Tell us about your network and how you'd like to partner..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-700 focus:outline-none focus:border-[#C9A84C] resize-none"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-[#C9A84C] px-8 py-3 font-bold text-white shadow-lg hover:bg-[#a67c2e] transition-all"
              >
                Apply as Partner
              </button>
            </form>
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}
