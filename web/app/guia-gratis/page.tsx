import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { FreeGuideForm } from '@/components/landing/free-guide-form'

export const metadata: Metadata = {
  title: 'Free Guide: Complete Paraguay Residency Guide for Europeans',
  description: 'Download our free guide covering everything you need to know about establishing residency in Paraguay as a European entrepreneur.',
  keywords: ['Paraguay residency guide', 'free Paraguay guide', 'Paraguay relocation ebook'],
}

export default function FreeGuidePage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 text-[#C9A84C] px-4 py-2 rounded-full font-semibold text-sm mb-6">
                <BookOpen className="h-4 w-4" />
                Free Download
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                The Complete Guide to Paraguay Residency for Europeans
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                30+ pages covering everything: residency process, tax system, banking, costs, timelines, and honest answers to the questions other providers avoid.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">Step-by-step residency process with actual timelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">Paraguay vs Portugal, UAE, Panama, Uruguay — honest comparison</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">Banking reality: why it&apos;s hard and how to succeed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">Tax system explained: territorial, CRS status, and what&apos;s changing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-slate-700">Cost breakdown with real government fees</span>
                </li>
              </ul>
            </div>
            <div>
              <FreeGuideForm />
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}
