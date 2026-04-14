import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, Minus, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Paraguay vs Georgia: Budget Options for Entrepreneurs',
  description: 'Both Paraguay and Georgia offer low-cost residency. Compare tax systems, geopolitical risk, citizenship paths, and long-term stability.',
  keywords: ['Paraguay vs Georgia', 'Georgia residency', 'Georgia tax reform', 'cheap residency Europe', 'best budget residency', 'Georgia company formation'],
  alternates: { canonical: '/comparar/paraguay-vs-georgia' },
}

export default function ParaguayVsGeorgiaPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Paraguay vs Georgia: Budget Options for Entrepreneurs
            </h1>
            <p className="text-xl text-slate-600">
              Both are cheap. But only one is a long-term solution.
            </p>
          </div>

          {/* Comparison table */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-slate-50 text-slate-600 font-bold">Category</th>
                    <th className="p-4 text-center bg-slate-100 text-slate-800 font-bold">🇬🇪 Georgia</th>
                    <th className="p-4 text-center bg-[#1B3A6B] text-white font-bold">🇵🇾 Paraguay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { cat: 'Foreign income tax', ge: '0-1% (Small Business Status)', py: '0% (territorial)', w: 'tie' },
                    { cat: 'Tax advantage expiration', ge: '2029 (tax reform in progress)', py: 'Permanent — no expiration', w: 'py' },
                    { cat: 'Residency cost', ge: '~$500 (company formation)', py: '~$435 (government fee)', w: 'tie' },
                    { cat: 'Processing time', ge: '1-7 days', py: '3-6 months', w: 'ge' },
                    { cat: 'Path to citizenship', ge: '10 years (rarely granted)', py: '3 years (basic Spanish)', w: 'py' },
                    { cat: 'Stay requirement', ge: 'Flexible', py: 'Once/year entry', w: 'tie' },
                    { cat: 'Geopolitical risk', ge: 'HIGH — Russia border, 2008 war, ongoing tension', py: 'LOW — stable democracy, no conflicts', w: 'py' },
                    { cat: 'Rent (1BR city center)', ge: '€400-700 (Tbilisi)', py: '€300-500 (Asunción)', w: 'tie' },
                    { cat: 'Monthly cost of living', ge: '€600-900', py: '€500-800', w: 'tie' },
                    { cat: 'Banking access', ge: 'Moderate — but sanctions compliance tight', py: 'Challenging — LEALTIS solves this', w: 'ge' },
                    { cat: 'Regional access', ge: 'CAFTA, no EU access', py: 'MERCOSUR (260M+ market)', w: 'py' },
                    { cat: 'CRS participation', ge: 'No (committed but delayed)', py: 'No (projected 2027-2030)', w: 'tie' },
                    { cat: 'Internet speed', ge: '30-100 Mbps', py: '50-100 Mbps', w: 'tie' },
                    { cat: 'Safety', ge: 'Generally safe', py: 'Moderate', w: 'tie' },
                    { cat: 'Language barrier', ge: 'Georgian script (unique alphabet)', py: 'Spanish (Latin alphabet)', w: 'py' },
                  ].map((row, i) => (
                    <tr key={row.cat} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{row.cat}</td>
                      <td className={`p-4 text-center text-sm ${row.w === 'ge' ? 'text-green-700 font-semibold' : 'text-slate-500'}`}>{row.ge}</td>
                      <td className={`p-4 text-center text-sm bg-[#1B3A6B]/5 ${row.w === 'py' ? 'text-[#C9A84C] font-semibold' : 'text-slate-500'}`}>{row.py}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Georgia's 2029 problem */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Georgia&apos;s Tax Advantage Expires in 2029
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Georgia&apos;s current tax advantages — including the 1% Small Business Status for freelancers and the Virtual Zone IT company benefits — are under active reform. The Georgian government has committed to OECD compliance and EU candidacy requirements, which means:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <h3 className="font-bold text-red-800 mb-3">Georgia&apos;s approaching changes</h3>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex gap-2"><span className="font-bold">•</span>Small Business Status rate likely to increase from 1% to 3-5%</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>Virtual Zone IT benefits under review — may be eliminated</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>Global income taxation possible as part of EU alignment</li>
                    <li className="flex gap-2"><span className="font-bold">•</span>CRS commitment signed — implementation expected 2026-2029</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <h3 className="font-bold text-green-800 mb-3">Paraguay&apos;s permanent advantage</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Territorial tax is in the constitution — not a temporary incentive</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />No OECD membership pressure (Paraguay is not seeking EU candidacy)</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />10% flat corporate rate is stable and widely supported politically</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Year 10, Year 20, Year 30 — the system remains the same</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Geopolitical risk */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              The Geopolitical Risk Factor
            </h2>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <p className="text-slate-700 leading-relaxed mb-4">
                Georgia shares a border with Russia and has recent experience with military conflict (2008 Russo-Georgian War). While Tbilisi is generally safe today, the geopolitical situation remains unpredictable:
              </p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-1" /><span>Russia occupies ~20% of Georgian territory (Abkhazia, South Ossetia)</span></li>
                <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-1" /><span>Ongoing political tensions between pro-EU and pro-Russia factions</span></li>
                <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-1" /><span>Banking sanctions compliance can freeze accounts unexpectedly</span></li>
                <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-1" /><span>EU candidacy process could bring both benefits and regulatory tightening</span></li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Paraguay, by contrast, has no border conflicts, no sanctions risk, and stable relations with all neighbors (Brazil, Argentina, Bolivia). It&apos;s a peaceful, neutral country focused on economic development.
              </p>
            </div>
          </div>

          {/* Where each wins */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Paraguay wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Permanent tax system', desc: 'No 2029 expiration date. Territorial tax is constitutional, not a temporary incentive.' },
                    { title: 'Citizenship in 3 years', desc: 'Georgia takes 10+ years and rarely grants citizenship to foreigners.' },
                    { title: 'Lower geopolitical risk', desc: 'No border conflicts, no sanctions risk, no superpower tensions.' },
                    { title: 'MERCOSUR market access', desc: '260M+ consumers across South America vs Georgia\'s limited market.' },
                    { title: 'Latin alphabet', desc: 'Spanish uses the Latin alphabet. Georgian uses a unique 33-letter script.' },
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
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Georgia wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Speed of setup', desc: 'Company formation in 1 day, residency in 1 week. Paraguay takes months.' },
                    { title: 'Lowest cost entry', desc: 'At ~$500, slightly cheaper than Paraguay and much faster.' },
                    { title: 'Digital nomad friendly', desc: 'Established digital nomad infrastructure in Tbilisi and Batumi.' },
                    { title: 'European proximity', desc: 'Easy flights to Europe. Visa-free to EU/Schengen for Georgian passport holders.' },
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
            <h2 className="text-3xl font-bold text-white mb-4">Short-term fix or long-term home?</h2>
            <p className="text-slate-300 mb-8">Georgia is great for speed. Paraguay is better for permanence. Let&apos;s discuss which fits your timeline.</p>
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
