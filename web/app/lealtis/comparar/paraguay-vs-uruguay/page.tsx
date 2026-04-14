import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, Minus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Paraguay vs Uruguay: Two South American Options Compared',
  description: 'Detailed comparison of Paraguay and Uruguay residency for Europeans. Tax systems, cost of living, safety, infrastructure, and citizenship timelines.',
  keywords: ['Paraguay vs Uruguay', 'Uruguay residency', 'South America residency', 'territorial tax South America', 'Uruguay tax holiday', 'best residency South America'],
  alternates: { canonical: '/comparar/paraguay-vs-uruguay' },
}

export default function ParaguayVsUruguayPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Paraguay vs Uruguay: Two South American Options Compared
            </h1>
            <p className="text-xl text-slate-600">
              Both offer territorial taxation. Both are safe. But the differences matter.
            </p>
          </div>

          {/* Quick comparison table */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-slate-50 text-slate-600 font-bold">Category</th>
                    <th className="p-4 text-center bg-[#1B3A6B]/10 text-[#1B3A6B] font-bold">🇺🇾 Uruguay</th>
                    <th className="p-4 text-center bg-[#1B3A6B] text-white font-bold">🇵🇾 Paraguay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { cat: 'Foreign income tax', uy: '12% (during 10yr holiday) → 12-36% after', py: '0% permanent', w: 'py' },
                    { cat: 'Tax benefit duration', uy: '10-year holiday, then standard rates', py: 'Permanent — no expiration', w: 'py' },
                    { cat: 'Residency cost', uy: '$200-400 government fee', py: '~$435 government fee', w: 'tie' },
                    { cat: 'Processing time', uy: '6-12 months', py: '3-6 months (SUACE)', w: 'py' },
                    { cat: 'Stay requirement', uy: '183 days/year', py: 'Flexible (once/year entry)', w: 'py' },
                    { cat: 'Path to citizenship', uy: '3-5 years (legal residency)', py: '3 years (basic Spanish)', w: 'tie' },
                    { cat: 'Corruption Perception (CPI)', uy: '#13 globally (score 73)', py: '#CPI 24 in region (score ~29)', w: 'uy' },
                    { cat: 'Safety index', uy: 'Very high — safest in South America', py: 'Moderate — safer than perceived', w: 'uy' },
                    { cat: 'Banking access', uy: 'Easy — reputable international banks', py: 'Challenging — LEALTIS solves this', w: 'uy' },
                    { cat: 'Infrastructure', uy: 'Good — roads, internet, healthcare', py: 'Developing — improving rapidly', w: 'uy' },
                    { cat: 'Rent (1BR city center)', uy: '€600-900 (Montevideo)', py: '€300-500 (Asunción)', w: 'py' },
                    { cat: 'Monthly cost of living', uy: '€1,000-1,500', py: '€500-800', w: 'py' },
                    { cat: 'CRS participation', uy: 'Yes — full CRS reporting', py: 'No (projected 2027-2030)', w: 'py' },
                    { cat: 'MERCOSUR access', uy: 'Full member', py: 'Full member', w: 'tie' },
                    { cat: 'Language', uy: 'Spanish (Rioplatense)', py: 'Spanish (Guaraní also official)', w: 'tie' },
                  ].map((row, i) => (
                    <tr key={row.cat} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{row.cat}</td>
                      <td className={`p-4 text-center text-sm ${row.w === 'uy' ? 'text-green-700 font-semibold' : 'text-slate-500'}`}>{row.uy}</td>
                      <td className={`p-4 text-center text-sm bg-[#1B3A6B]/5 ${row.w === 'py' ? 'text-[#C9A84C] font-semibold' : 'text-slate-500'}`}>{row.py}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Uruguay's tax holiday explained */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              The Critical Difference: Uruguay&apos;s Tax Holiday Has an Expiration Date
            </h2>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Uruguay offers a generous 10-year tax holiday on foreign income for new tax residents. During this period, foreign-sourced income is taxed at a reduced rate of 12%. However, after the 10-year period expires, standard Uruguayan rates apply, which range from 12% to 36% depending on income type and amount.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <h3 className="font-bold text-amber-800 mb-3">Uruguay after 10 years</h3>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex gap-2"><span className="font-bold">•</span>Foreign investment income: up to 12%</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>Foreign work income: up to 36%</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>You must either accept higher taxes or move again</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>After 10 years, you have roots — moving is costly</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <h3 className="font-bold text-green-800 mb-3">Paraguay: no expiration</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Foreign income: 0% permanently</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />No need to plan another move</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Build your life without a ticking clock</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Year 11 is the same as Year 1</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Where each wins */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Paraguay wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Permanent 0% tax on foreign income', desc: 'No 10-year limit. No rate increase. Ever.' },
                    { title: '40-50% lower cost of living', desc: 'Asunción is significantly cheaper than Montevideo across all categories.' },
                    { title: 'Flexible stay requirement', desc: 'Enter once per year vs. Uruguay\'s 183-day requirement.' },
                    { title: 'No CRS reporting', desc: 'Uruguay participates in CRS; Paraguay does not (yet).' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#1B3A6B] text-sm">{item.title}</div>
                        <p className="text-xs text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Uruguay wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Safety and stability', desc: 'Uruguay is consistently ranked the safest country in South America with the lowest corruption.' },
                    { title: 'Banking infrastructure', desc: 'Well-regulated banks with international relationships. Easy for foreigners.' },
                    { title: 'Infrastructure quality', desc: 'Better roads, internet, healthcare, and public services.' },
                    { title: 'Established expat community', desc: 'Large international community in Montevideo and Punta del Este.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <Minus className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-700 text-sm">{item.title}</div>
                        <p className="text-xs text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-2xl mx-auto p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Need help deciding?</h2>
            <p className="text-slate-300 mb-8">Both are legitimate options. We&apos;ll help you figure out which one fits your situation — or if a hybrid approach makes sense.</p>
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
