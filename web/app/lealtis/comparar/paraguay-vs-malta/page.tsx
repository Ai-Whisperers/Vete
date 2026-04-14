import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, Minus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Paraguay vs Malta: EU Access vs Territorial Tax | LEALTIS',
  description: 'Compare Malta\'s non-dom tax system with Paraguay\'s territorial tax. Costs, EU citizenship access, minimum tax requirements, and real savings.',
  keywords: ['Paraguay vs Malta', 'Malta non-dom tax', 'Malta residency cost', 'EU citizenship alternative', 'territorial tax vs non-dom', 'Malta tax residency'],
  alternates: { canonical: '/comparar/paraguay-vs-malta' },
}

export default function ParaguayVsMaltaPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Paraguay vs Malta: EU Access vs Territorial Tax
            </h1>
            <p className="text-xl text-slate-600">
              Malta gives you Europe. Paraguay gives you zero tax. The trade-off is real — here are the numbers.
            </p>
          </div>

          {/* Comparison table */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-slate-50 text-slate-600 font-bold">Category</th>
                    <th className="p-4 text-center bg-slate-100 text-slate-800 font-bold">🇲🇹 Malta</th>
                    <th className="p-4 text-center bg-[#1B3A6B] text-white font-bold">🇵🇾 Paraguay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { cat: 'Tax system type', mt: 'Non-dom (remittance basis)', py: 'Territorial', w: 'tie' },
                    { cat: 'Foreign income tax', mt: '0% IF not remitted to Malta', py: '0% regardless of remittance', w: 'py' },
                    { cat: 'Minimum annual tax', mt: '€5,000 (non-dom minimum)', py: '€0 (no minimum)', w: 'py' },
                    { cat: 'Property purchase/rent required', mt: '€275K purchase or €9,600/yr rent (South)', py: 'None', w: 'py' },
                    { cat: 'Residency setup cost', mt: '€6,000-15,000 in fees', py: '~$435 government fee', w: 'py' },
                    { cat: 'Processing time', mt: '2-4 months', py: '3-6 months', w: 'mt' },
                    { cat: 'EU citizenship', mt: 'Yes — after 5-7 years', py: 'No — South American only', w: 'mt' },
                    { cat: 'Schengen access', mt: 'Full Schengen member', py: 'Visa required for Schengen', w: 'mt' },
                    { cat: 'Path to citizenship', mt: '5-7 years (naturalization)', py: '3 years (basic Spanish)', w: 'py' },
                    { cat: 'Rent (1BR city center)', mt: '€900-1,300 (Valletta area)', py: '€300-500 (Asunción)', w: 'py' },
                    { cat: 'Monthly cost of living', mt: '€1,200-1,600', py: '€500-800', w: 'py' },
                    { cat: 'Banking access', mt: 'Good — EU-regulated banks', py: 'Challenging — LEALTIS solves this', w: 'mt' },
                    { cat: 'Healthcare', mt: 'Good — public + private', py: 'Adequate — private recommended', w: 'mt' },
                    { cat: 'Climate', mt: 'Mediterranean (hot summers)', py: 'Subtropical (mild winters)', w: 'tie' },
                    { cat: 'CRS participation', mt: 'Yes — full CRS', py: 'No (projected 2027-2030)', w: 'py' },
                    { cat: 'Corporate tax', mt: '35% (effective 5% with refund)', py: '10% flat', w: 'tie' },
                    { cat: 'Wealth tax', mt: 'None', py: 'None', w: 'tie' },
                    { cat: 'Language', mt: 'English + Maltese', py: 'Spanish + Guaraní', w: 'mt' },
                  ].map((row, i) => (
                    <tr key={row.cat} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{row.cat}</td>
                      <td className={`p-4 text-center text-sm ${row.w === 'mt' ? 'text-green-700 font-semibold' : 'text-slate-500'}`}>{row.mt}</td>
                      <td className={`p-4 text-center text-sm bg-[#1B3A6B]/5 ${row.w === 'py' ? 'text-[#C9A84C] font-semibold' : 'text-slate-500'}`}>{row.py}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Malta's non-dom system explained */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              Understanding Malta&apos;s Non-Dom System
            </h2>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Malta&apos;s non-dom (non-domiciled) tax system allows foreign residents to avoid tax on foreign income — but only if that income is NOT remitted to Malta. This creates a critical limitation:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <h3 className="font-bold text-amber-800 mb-3">Malta&apos;s remittance trap</h3>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex gap-2"><span className="font-bold">•</span>You earn €100K from remote work — 0% tax in Malta</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>You transfer €50K to your Maltese bank to pay rent — <strong>taxable</strong></li>
                    <li className="flex gap-2"><span className="font-bold">•</span>Minimum tax of €5,000/year regardless</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>Property requirement: €275K purchase or €9,600+/yr rent</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>Complex compliance — annual tax returns, proof of non-remittance</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <h3 className="font-bold text-green-800 mb-3">Paraguay&apos;s simpler approach</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />You earn €100K from remote work — 0% tax</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Transfer it anywhere — <strong>still 0%</strong></li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />No minimum tax — €0 if all income is foreign</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />No property purchase or rent requirement</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Simple annual tax filing (LEALTIS handles it)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 5-year cost comparison */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              5-Year Cost Comparison (€100K Annual Income)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1B3A6B] text-white">
                    <th className="p-4 text-left">Cost Category</th>
                    <th className="p-4 text-right">Malta (5 years)</th>
                    <th className="p-4 text-right">Paraguay (5 years)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-4 font-semibold text-slate-700">Setup fees</td>
                    <td className="p-4 text-right text-slate-600">€6,000-15,000</td>
                    <td className="p-4 text-right text-[#C9A84C]">~$435 (€400)</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-4 font-semibold text-slate-700">Property requirement (rent)</td>
                    <td className="p-4 text-right text-slate-600">€48,000</td>
                    <td className="p-4 text-right text-[#C9A84C]">€0</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-700">Minimum tax</td>
                    <td className="p-4 text-right text-slate-600">€25,000</td>
                    <td className="p-4 text-right text-[#C9A84C]">€0</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-4 font-semibold text-slate-700">Living costs (5 years)</td>
                    <td className="p-4 text-right text-slate-600">€72,000-96,000</td>
                    <td className="p-4 text-right text-[#C9A84C]">€30,000-48,000</td>
                  </tr>
                  <tr className="bg-[#1B3A6B]/5">
                    <td className="p-4 font-bold text-[#1B3A6B]">Total 5-year cost</td>
                    <td className="p-4 text-right font-bold text-slate-700">€151,000-184,000</td>
                    <td className="p-4 text-right font-bold text-[#C9A84C]">€30,400-48,400</td>
                  </tr>
                  <tr className="bg-[#1B3A6B]/10">
                    <td className="p-4 font-bold text-[#1B3A6B]">5-year savings with Paraguay</td>
                    <td className="p-4 text-right" colSpan={2}>
                      <span className="text-2xl font-bold text-[#C9A84C]">€102,600-153,600</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Where each wins */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Paraguay wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'True 0% tax', desc: 'No remittance rules, no minimum tax, no property requirement. Foreign income is simply not taxed.' },
                    { title: '€100K+ cheaper over 5 years', desc: 'Setup + minimum tax + property + living costs — Paraguay saves six figures.' },
                    { title: 'No CRS', desc: 'Malta shares all banking data. Paraguay doesn\'t (yet).' },
                    { title: 'Faster citizenship', desc: '3 years vs 5-7 years. Paraguayan passport has visa-free to 140+ countries.' },
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
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Malta wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'EU citizenship', desc: 'A Maltese passport is one of the world\'s most powerful — full EU/EEA/Schengen live/work rights.' },
                    { title: 'English-speaking', desc: 'Malta was a British colony. Everything works in English — government, banking, courts.' },
                    { title: 'EU-regulated banking', desc: 'SEPA access, IBAN, EU consumer protections, deposit insurance.' },
                    { title: 'European lifestyle', desc: 'Mediterranean climate, EU culture, easy travel to 27 EU countries.' },
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
            <h2 className="text-3xl font-bold text-white mb-4">EU passport or maximum savings?</h2>
            <p className="text-slate-300 mb-8">Some clients even do both — Malta for EU access, Paraguay for tax. Let&apos;s discuss the strategy that works for you.</p>
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
