import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Paraguay vs Other Countries - Compare Residency Options',
  description: 'Compare Paraguay residency with Portugal, UAE/Dubai, Panama, Uruguay, and Georgia. Tax rates, costs, requirements, and timelines side by side.',
  keywords: ['Paraguay vs Portugal', 'Paraguay vs Dubai', 'cheapest residency', 'territorial tax countries', 'compare residency programs', 'NHR alternative'],
}

const countries = [
  {
    name: 'Paraguay',
    flag: '🇵🇾',
    highlight: true,
    tax: '0% on foreign income',
    residency: '~$435 gov fee',
    timeline: '3-6 months',
    citizenship: '5 years',
    stay: 'Flexible (once/year)',
    banking: 'Moderate',
    costLiving: 'Very low',
    infrastructure: 'Developing',
  },
  {
    name: 'Portugal (NHR ended)',
    flag: '🇵🇹',
    highlight: false,
    tax: '20-48% (IFICI: 20%)',
    residency: '€5,000+ fees',
    timeline: '6-12 months',
    citizenship: '5 years',
    stay: '183 days/year',
    banking: 'Easy',
    costLiving: 'Moderate',
    infrastructure: 'Excellent',
  },
  {
    name: 'UAE / Dubai',
    flag: '🇦🇪',
    highlight: false,
    tax: '0% personal',
    residency: '$545K investment',
    timeline: '1-8 weeks',
    citizenship: 'Not available',
    stay: 'Must maintain visa',
    banking: 'Easy',
    costLiving: 'High',
    infrastructure: 'Excellent',
  },
  {
    name: 'Panama',
    flag: '🇵🇦',
    highlight: false,
    tax: '0% territorial',
    residency: '$200K investment',
    timeline: '2-4 months',
    citizenship: '5+ years',
    stay: 'Once per 2 years',
    banking: 'Easy',
    costLiving: 'Moderate',
    infrastructure: 'Good',
  },
  {
    name: 'Uruguay',
    flag: '🇺🇾',
    highlight: false,
    tax: '12-36% (10yr holiday)',
    residency: '$200-400 gov fee',
    timeline: '6-12 months',
    citizenship: '3-5 years',
    stay: '183 days/year',
    banking: 'Easy',
    costLiving: 'High',
    infrastructure: 'Good',
  },
  {
    name: 'Georgia',
    flag: '🇬🇪',
    highlight: false,
    tax: '0-1% (until 2029)',
    residency: '~$500 company',
    timeline: '1-7 days',
    citizenship: 'Not realistic',
    stay: 'Flexible',
    banking: 'Moderate',
    costLiving: 'Low',
    infrastructure: 'Moderate',
  },
]

const rows = [
  { key: 'tax', label: 'Foreign Income Tax' },
  { key: 'residency', label: 'Residency Cost' },
  { key: 'timeline', label: 'Processing Time' },
  { key: 'citizenship', label: 'Path to Citizenship' },
  { key: 'stay', label: 'Stay Requirements' },
  { key: 'banking', label: 'Banking Access' },
  { key: 'costLiving', label: 'Cost of Living' },
  { key: 'infrastructure', label: 'Infrastructure' },
]

export default async function ComparePage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Why Paraguay Beats the Alternatives
            </h1>
            <p className="text-xl text-slate-600">
              Side-by-side comparison of residency, tax, and lifestyle options for European entrepreneurs in 2026.
            </p>
          </div>

          <div className="overflow-x-auto mb-20">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left text-sm font-bold text-slate-600 bg-slate-50">Feature</th>
                  {countries.map((c) => (
                    <th key={c.name} className={`p-4 text-center ${c.highlight ? 'bg-[#1B3A6B] text-white' : 'bg-slate-50 text-slate-800'}`}>
                      <span className="text-2xl">{c.flag}</span>
                      <div className="font-bold mt-1">{c.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.key} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{row.label}</td>
                    {countries.map((c) => (
                      <td key={c.name} className={`p-4 text-center text-sm ${c.highlight ? 'bg-[#1B3A6B]/5 font-semibold text-[#1B3A6B]' : 'text-slate-600'}`}>
                        {c[row.key as keyof typeof c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              Key Takeaways
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#C9A84C] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#1B3A6B] mb-1">Lowest cost of entry</h3>
                  <p className="text-slate-600">At ~$435 in government fees, Paraguay is the cheapest serious residency option. No $200K+ investment required like Panama or UAE.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#C9A84C] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#1B3A6B] mb-1">Zero foreign income tax — with no expiration</h3>
                  <p className="text-slate-600">Unlike Portugal&apos;s 10-year IFICI cap or Uruguay&apos;s 10-year holiday, Paraguay&apos;s territorial tax system has no time limit.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#C9A84C] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#1B3A6B] mb-1">No CRS information exchange (yet)</h3>
                  <p className="text-slate-600">Paraguay is one of the last territorial tax countries not participating in the OECD&apos;s automatic information exchange. Window is narrowing (projected 2027-2030).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <XCircle className="h-6 w-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-700 mb-1">The trade-off: infrastructure and banking</h3>
                  <p className="text-slate-600">Paraguay is developing. Banking access for foreigners is the #1 challenge — which is exactly why LEALTIS exists. We solve what others can&apos;t.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-20 p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to explore Paraguay?</h2>
            <p className="text-slate-300 mb-8">Book a free consultation and we&apos;ll help you compare your options honestly.</p>
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
