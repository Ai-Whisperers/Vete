import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter } from '@/components/landing'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Paraguay Business Program - LEALTIS',
  description: 'USD 4,400 all-inclusive program for European entrepreneurs to establish residency and company in Paraguay in one trip.',
}

export default function ParaguayBusinessPage() {
  const features = [
    'Paraguayan Residency',
    'Paraguayan National ID',
    'Company Formation + Tax Registration (RUC)',
    'Business Bank Account Opening',
    'Full document validation upfront',
    'Operative day (everything in one morning)',
    'Exclusive driver + transfers',
    'Strategic real estate tour',
    'Integral technical advisory',
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
              <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                Paraguay Business
              </h1>
              <p className="text-2xl text-[#C9A84C] font-semibold mb-6">
                Operationally established from day one
              </p>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                For the European entrepreneur or professional who wants to operate in Paraguay: residency, established company and business bank account. Everything you need to start, all in one program and one trip.
              </p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-900">USD 4,400</span>
                <p className="text-slate-600 mt-2">One-time investment, comprehensive service</p>
              </div>

              <Link
                href="/contacto"
                className="inline-block rounded-full bg-[#1B3A6B] text-white font-bold px-8 py-4 transition-all hover:bg-[#0f2447] hover:-translate-y-1 shadow-lg"
              >
                Get Started Today
              </Link>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">What's Included</h2>
              <ul className="space-y-4">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-[#C9A84C] mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-3 mb-20">
            <div className="rounded-xl bg-blue-50 border-l-4 border-[#1B3A6B] p-6">
              <h3 className="font-bold text-[#1B3A6B] mb-2">Timeline</h3>
              <p className="text-slate-700">8-12 weeks total. Operative day is just one morning in Paraguay.</p>
            </div>
            <div className="rounded-xl bg-blue-50 border-l-4 border-[#1B3A6B] p-6">
              <h3 className="font-bold text-[#1B3A6B] mb-2">Trips Required</h3>
              <p className="text-slate-700">Only one trip needed. All procedures in a single day.</p>
            </div>
            <div className="rounded-xl bg-blue-50 border-l-4 border-[#1B3A6B] p-6">
              <h3 className="font-bold text-[#1B3A6B] mb-2">Language</h3>
              <p className="text-slate-700">No Spanish required. We communicate in your language.</p>
            </div>
          </div>

          <div className="text-center py-20 bg-slate-50 rounded-2xl">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-4">Ready to Get Started?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Book a free 30-minute consultation to discuss your situation with our team.
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
