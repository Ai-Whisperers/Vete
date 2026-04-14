import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, XCircle, Minus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Paraguay vs Portugal: Which Is Better After NHR Ended?',
  description: 'Detailed comparison of Paraguay and Portugal residency for European entrepreneurs. Tax rates, costs, requirements, and timelines. Portugal IFICI vs Paraguay territorial tax.',
  keywords: ['Paraguay vs Portugal', 'NHR alternative', 'Portugal IFICI', 'Paraguay residency vs Portugal', 'best tax residency Europe', 'Portugal tax residency 2025'],
  alternates: { canonical: '/comparar/paraguay-vs-portugal' },
}

const comparisonData = [
  { category: 'Foreign income tax', portugal: '20% (IFICI regime)', paraguay: '0% (territorial)', winner: 'paraguay' },
  { category: 'Tax benefit duration', portugal: '10 years maximum', paraguay: 'Permanent (no expiration)', winner: 'paraguay' },
  { category: 'IFICI eligibility', portugal: 'PhD or 3yr experience in high-value field', paraguay: 'N/A — automatic for all residents', winner: 'paraguay' },
  { category: 'Residency cost (government)', portugal: '€5,000+ in fees', paraguay: '~$435 government fee', winner: 'paraguay' },
  { category: 'Processing time', portugal: '6-12 months at AIMA', paraguay: '3-6 months via SUACE', winner: 'paraguay' },
  { category: 'Stay requirement', portugal: '183 days/year minimum', paraguay: 'Flexible (once/year entry sufficient)', winner: 'paraguay' },
  { category: 'Path to citizenship', portugal: '5 years (A2 Portuguese test)', paraguay: '3 years (basic Spanish)', winner: 'tie' },
  { category: 'EU membership', portugal: 'Yes — full EU/Schengen access', paraguay: 'No — MERCOSUR access', winner: 'portugal' },
  { category: 'Banking access', portugal: 'Easy — SEPA, EU-regulated', paraguay: 'Challenging — LEALTIS solves this', winner: 'portugal' },
  { category: 'Infrastructure', portugal: 'Excellent — roads, healthcare, internet', paraguay: 'Developing — improving rapidly', winner: 'portugal' },
  { category: 'Healthcare quality', portugal: 'High (SNS + private options)', paraguay: 'Adequate (private recommended)', winner: 'portugal' },
  { category: 'Cost of living (monthly)', portugal: '€1,500-2,000 (Lisbon)', paraguay: '€500-800 (Asunción)', winner: 'paraguay' },
  { category: 'Rent (1BR city center)', portugal: '€1,000-1,400', paraguay: '€300-500', winner: 'paraguay' },
  { category: 'CRS participation', portugal: 'Yes — full CRS reporting', paraguay: 'No (projected 2027-2030)', winner: 'paraguay' },
  { category: 'Wealth tax', portugal: 'AIMI (property tax on high-value)', paraguay: 'None', winner: 'paraguay' },
  { category: 'Inheritance tax', portugal: '0% (spouse/descendants)', paraguay: '0% on foreign assets', winner: 'tie' },
  { category: 'Language requirement', portugal: 'A2 Portuguese for citizenship', paraguay: 'Basic Spanish for citizenship', winner: 'tie' },
  { category: 'Digital nomad visa', portugal: 'Yes (D7/D8 visa)', paraguay: 'Not needed — standard residency', winner: 'tie' },
]

export default function ParaguayVsPortugalPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Paraguay vs Portugal: Which Is Better After NHR Ended?
            </h1>
            <p className="text-xl text-slate-600">
              A detailed side-by-side comparison for European entrepreneurs in 2026.
            </p>
          </div>

          {/* Context */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                The Context: Portugal&apos;s NHR Is Gone
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Portugal&apos;s Non-Habitual Resident (NHR) regime was abolished on January 1, 2024. Its replacement, the IFICI (Tax Incentive for Scientific Research and Innovation), is far more restrictive:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex gap-2"><XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />Requires a PhD <strong>or</strong> at least 3 years of proven experience in a &quot;high-value&quot; field (tech, science, healthcare)</li>
                <li className="flex gap-2"><XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />Only provides a 20% flat rate on eligible professional income — not zero tax</li>
                <li className="flex gap-2"><XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />Still capped at 10 years, same as the old NHR</li>
                <li className="flex gap-2"><XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />Most entrepreneurs, freelancers, and investors do <strong>not</strong> qualify</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                For the majority of European entrepreneurs who relied on or planned for NHR, Paraguay now offers a more accessible and more generous alternative.
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              Full Comparison Table
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-slate-50 text-slate-600 font-bold">Category</th>
                    <th className="p-4 text-center bg-[#1B3A6B]/10 text-[#1B3A6B] font-bold">🇵🇹 Portugal</th>
                    <th className="p-4 text-center bg-[#1B3A6B] text-white font-bold">🇵🇾 Paraguay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonData.map((row, i) => (
                    <tr key={row.category} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{row.category}</td>
                      <td className={`p-4 text-center text-sm ${row.winner === 'portugal' ? 'text-green-700 font-semibold' : row.winner === 'paraguay' ? 'text-slate-500' : 'text-slate-500'}`}>
                        {row.portugal}
                      </td>
                      <td className={`p-4 text-center text-sm bg-[#1B3A6B]/5 ${row.winner === 'paraguay' ? 'text-[#C9A84C] font-semibold' : row.winner === 'portugal' ? 'text-slate-500' : 'text-slate-500'}`}>
                        {row.paraguay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key advantages */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Paraguay wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Zero foreign income tax — forever', desc: 'No 10-year cap like IFICI. No PhD required. Every resident gets the territorial tax benefit automatically.' },
                    { title: '75% lower cost of living', desc: 'Rent, food, services — everything costs a fraction of Lisbon or Porto prices.' },
                    { title: 'No stay requirement', desc: 'Enter once a year to maintain residency. No need to spend 183 days (unlike Portugal\'s strict requirement).' },
                    { title: 'No CRS reporting (yet)', desc: 'Paraguay doesn\'t automatically share banking information with EU tax authorities. Window is narrowing.' },
                    { title: '~$435 total cost', desc: 'Compare to €5,000+ in Portuguese legal and government fees.' },
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
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Portugal wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'EU citizenship in 5 years', desc: 'A Portuguese passport gives you full access to live and work in all 27 EU member states plus Schengen Area.' },
                    { title: 'World-class infrastructure', desc: 'Excellent healthcare, roads, public transport, high-speed internet, and EU consumer protections.' },
                    { title: 'Easy banking (SEPA)', desc: 'Open accounts easily. Full IBAN access. No compliance hurdles for EU residents.' },
                    { title: 'Established expat community', desc: 'Lisbon and Porto have massive digital nomad and expat scenes with coworking spaces and networking.' },
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

          {/* Verdict */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-[#1B3A6B] rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>The Verdict</h2>
              <p className="text-slate-200 leading-relaxed mb-4">
                <strong>Choose Paraguay if:</strong> You want maximum tax savings with no time limit, you work remotely, and you don&apos;t need EU citizenship. The cost savings are dramatic — both on taxes and living expenses.
              </p>
              <p className="text-slate-200 leading-relaxed">
                <strong>Choose Portugal if:</strong> EU citizenship is a must-have, you value infrastructure and convenience over tax optimization, or you have a PhD and qualify for IFICI. Portugal remains an excellent lifestyle choice even without NHR.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-2xl mx-auto p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Not sure which is right for you?</h2>
            <p className="text-slate-300 mb-8">We&apos;ve helped hundreds of Europeans make this exact decision. Book a free consultation and we&apos;ll give you an honest comparison based on your specific situation.</p>
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
