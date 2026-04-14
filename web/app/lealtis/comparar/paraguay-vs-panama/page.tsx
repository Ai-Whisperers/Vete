import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, Minus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Paraguay vs Panama: Two Territorial Tax Systems Compared',
  description: 'Both Panama and Paraguay offer territorial taxation. Compare costs, residency requirements, citizenship paths, and banking access side by side.',
  keywords: ['Paraguay vs Panama', 'Panama Friendly Nations Visa', 'territorial tax comparison', 'Panama residency cost', 'best territorial tax country'],
  alternates: { canonical: '/comparar/paraguay-vs-panama' },
}

export default function ParaguayVsPanamaPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Paraguay vs Panama: Two Territorial Tax Systems Compared
            </h1>
            <p className="text-xl text-slate-600">
              Both are territorial. Both are in Latin America. But the details diverge significantly.
            </p>
          </div>

          {/* Comparison table */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-slate-50 text-slate-600 font-bold">Category</th>
                    <th className="p-4 text-center bg-slate-100 text-slate-800 font-bold">🇵🇦 Panama</th>
                    <th className="p-4 text-center bg-[#1B3A6B] text-white font-bold">🇵🇾 Paraguay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { cat: 'Foreign income tax', pa: '0% (territorial)', py: '0% (territorial)', w: 'tie' },
                    { cat: 'Residency investment required', pa: '$200,000 (Friendly Nations Visa)', py: 'None — $435 gov fee', w: 'py' },
                    { cat: 'Processing time', pa: '2-4 months', py: '3-6 months (SUACE)', w: 'pa' },
                    { cat: 'Path to citizenship', pa: '5+ years', py: '3 years (basic Spanish)', w: 'py' },
                    { cat: 'Stay requirement', pa: 'Once per 2 years', py: 'Once per year', w: 'pa' },
                    { cat: 'Banking access', pa: 'Established — many international banks', py: 'Challenging — LEALTIS solves this', w: 'pa' },
                    { cat: 'Expat infrastructure', pa: 'Mature — large international community', py: 'Growing — early stage', w: 'pa' },
                    { cat: 'Rent (1BR city center)', pa: '€700-1,200 (Panama City)', py: '€300-500 (Asunción)', w: 'py' },
                    { cat: 'Monthly cost of living', pa: '€1,200-1,800', py: '€500-800', w: 'py' },
                    { cat: 'Internet speed', pa: '100-200 Mbps', py: '50-100 Mbps', w: 'pa' },
                    { cat: 'USD as currency', pa: 'Yes — USD is official currency', py: 'No — Guaraní (PYG)', w: 'pa' },
                    { cat: 'Regional access', pa: 'Central America / CAFTA-DR', py: 'MERCOSUR (Brazil, Argentina, Uruguay)', w: 'tie' },
                    { cat: 'CRS participation', pa: 'Yes — full CRS reporting', py: 'No (projected 2027-2030)', w: 'py' },
                    { cat: 'Company formation', pa: 'Fast — offshore corps in days', py: 'EAS regime — 2-3 weeks', w: 'pa' },
                    { cat: 'Wealth tax', pa: 'None', py: 'None', w: 'tie' },
                    { cat: 'Corporate tax (local)', pa: '25%', py: '10%', w: 'py' },
                    { cat: 'Language', pa: 'Spanish', py: 'Spanish + Guaraní', w: 'tie' },
                  ].map((row, i) => (
                    <tr key={row.cat} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{row.cat}</td>
                      <td className={`p-4 text-center text-sm ${row.w === 'pa' ? 'text-green-700 font-semibold' : 'text-slate-500'}`}>{row.pa}</td>
                      <td className={`p-4 text-center text-sm bg-[#1B3A6B]/5 ${row.w === 'py' ? 'text-[#C9A84C] font-semibold' : 'text-slate-500'}`}>{row.py}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Investment comparison */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              The $199,565 Difference
            </h2>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Panama&apos;s Friendly Nations Visa requires a minimum $200,000 investment in real estate or a fixed-term deposit. Paraguay requires no investment at all — just a $435 government processing fee. This $199,565 difference isn&apos;t just a number — it&apos;s capital you could keep invested and earning returns.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#1B3A6B] rounded-xl p-6 text-white">
                  <h3 className="font-bold text-[#C9A84C] mb-3">Invest that $200K instead</h3>
                  <p className="text-sm text-slate-200">
                    If you invest $200,000 in a diversified portfolio earning 7% annually, that&apos;s $14,000/year in investment returns. Over 10 years with compounding, your $200K grows to ~$393,000. Choosing Paraguay over Panama doesn&apos;t just save you the investment — it earns you money.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-[#1B3A6B] mb-3">Panama&apos;s investment argument</h3>
                  <p className="text-sm text-slate-600">
                    Panama argues the $200K investment buys you a more stable, mature system with better banking and infrastructure. This is partly true — but the question is whether those advantages are worth $200K to you.
                  </p>
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
                    { title: 'No investment required', desc: '$435 total vs $200,000 locked in Panamanian real estate or deposits.' },
                    { title: 'Faster citizenship', desc: '3 years vs 5+ years. And Paraguayan citizenship gives MERCOSUR access.' },
                    { title: 'Lower corporate tax', desc: '10% vs Panama\'s 25% on local business income.' },
                    { title: 'No CRS', desc: 'Panama participates in CRS. Paraguay does not (yet).' },
                    { title: 'Lower cost of living', desc: 'Asunción is 40-50% cheaper than Panama City.' },
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
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Panama wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'USD as official currency', desc: 'No exchange rate risk. Financial planning is simpler.' },
                    { title: 'Established banking sector', desc: 'International banks, easier account opening, sophisticated financial services.' },
                    { title: 'Mature expat community', desc: 'Decades of international residents. Services, networking, and community already exist.' },
                    { title: 'Faster processing', desc: '2-4 months vs 3-6 months. More predictable timeline.' },
                    { title: 'Offshore company expertise', desc: 'Panama is a global leader in offshore corporate structures.' },
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
            <h2 className="text-3xl font-bold text-white mb-4">Both are good options. Let&apos;s find the right one.</h2>
            <p className="text-slate-300 mb-8">We have experience with both markets. In a 30-minute call, we can tell you which one fits your situation better.</p>
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
