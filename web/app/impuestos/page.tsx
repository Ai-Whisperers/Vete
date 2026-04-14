import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, AlertTriangle, Scale } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Paraguay Tax System & CRS Compliance Guide',
  description: 'Understand Paraguay\'s territorial tax system, CRS status, and what it means for European entrepreneurs. Honest, professional guidance from LEALTIS.',
  keywords: ['Paraguay tax residency', 'territorial tax system', 'CRS Paraguay', 'Paraguay income tax', 'tax optimization Paraguay'],
}

export default function TaxPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Paraguay&apos;s Tax System: The Honest Guide
            </h1>
            <p className="text-xl text-slate-600">
              We believe you deserve the truth — not marketing spin. Here&apos;s exactly how Paraguay&apos;s tax system works, what it means for you, and what to watch out for.
            </p>
          </div>

          {/* Tax Overview */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8">How Paraguay Taxes Work</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1B3A6B] text-white">
                    <th className="p-4 text-left">Tax</th>
                    <th className="p-4 text-left">Rate</th>
                    <th className="p-4 text-left">What It Covers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="p-4 font-semibold text-[#1B3A6B]">IRE (Business Income)</td><td className="p-4">10% flat</td><td className="p-4 text-slate-600">Paraguayan-source business income only</td></tr>
                  <tr className="bg-slate-50"><td className="p-4 font-semibold text-[#1B3A6B]">IRP (Personal Income)</td><td className="p-4">8-10%</td><td className="p-4 text-slate-600">Services rendered in Paraguay, capital gains from Paraguayan assets</td></tr>
                  <tr><td className="p-4 font-semibold text-[#1B3A6B]">IVA (VAT)</td><td className="p-4">10%</td><td className="p-4 text-slate-600">Goods and services in Paraguay</td></tr>
                  <tr className="bg-slate-50"><td className="p-4 font-semibold text-[#C9A84C]">Foreign Income Tax</td><td className="p-4 font-bold text-[#C9A84C]">0%</td><td className="p-4 text-slate-600">Remote work, foreign dividends, foreign capital gains, foreign rental income — all tax-free</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-[#C9A84C]/10 rounded-lg border border-[#C9A84C]/20">
              <p className="text-sm text-[#1B3A6B]"><strong>Key fact:</strong> No wealth tax. No inheritance tax on foreign assets. No worldwide income taxation.</p>
            </div>
          </div>

          {/* CRS Status */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]">CRS & Information Exchange: What You Need to Know</h2>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-700 mb-2" />
                <h3 className="font-bold text-green-800 mb-1">Current Status: No CRS Participation</h3>
                <p className="text-green-700 text-sm">Paraguay does not currently participate in the OECD&apos;s Common Reporting Standard (CRS). Bank information is not automatically shared with European tax authorities.</p>
              </div>
              <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-700 mb-2" />
                <h3 className="font-bold text-amber-800 mb-1">Projected Change: CRS Likely 2027-2030</h3>
                <p className="text-amber-700 text-sm">Paraguay is moving toward OECD compliance and CRS implementation is expected within the next few years. This window of non-participation is narrowing. The territorial tax system itself may remain, but banking privacy will change.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <Scale className="h-5 w-5 text-slate-700 mb-2" />
                <h3 className="font-bold text-slate-800 mb-1">Important Disclaimer</h3>
                <p className="text-slate-600 text-sm">LEALTIS provides advisory on Paraguayan tax and legal matters only. We do not provide tax advice for your home country. We strongly recommend consulting a local tax professional in your country of residence before making any decisions. Tax evasion is illegal; tax optimization within the law is your right.</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Get honest tax guidance</h2>
            <p className="text-slate-300 mb-8">We explain the real picture — advantages and limitations — so you can make an informed decision.</p>
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
