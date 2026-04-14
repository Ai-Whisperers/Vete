import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, Minus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Paraguay vs Dubai: $5K vs $500K Residency | LEALTIS',
  description: 'Compare Paraguay residency (~$435) with UAE/Dubai ($545K minimum investment). Tax systems, cost of living, and lifestyle differences explained.',
  keywords: ['Paraguay vs Dubai', 'UAE residency cost', 'cheap residency alternative', 'Dubai golden visa', 'Paraguay residency cost', 'tax free countries'],
  alternates: { canonical: '/comparar/paraguay-vs-dubai' },
}

export default function ParaguayVsDubaiPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Paraguay vs Dubai: $435 vs $545,000 Residency
            </h1>
            <p className="text-xl text-slate-600">
              Both offer zero income tax. The price difference is 1,000x. Here&apos;s what you get for each.
            </p>
          </div>

          {/* Price comparison hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#1B3A6B] rounded-2xl p-8 text-white text-center">
                <div className="text-sm uppercase tracking-wider text-slate-300 mb-2">Paraguay</div>
                <div className="text-5xl font-bold text-[#C9A84C] mb-2">$435</div>
                <p className="text-slate-300">Total government fee for residency. No investment required.</p>
              </div>
              <div className="bg-slate-100 rounded-2xl p-8 text-center">
                <div className="text-sm uppercase tracking-wider text-slate-500 mb-2">UAE / Dubai</div>
                <div className="text-5xl font-bold text-slate-800 mb-2">$545K+</div>
                <p className="text-slate-500">Minimum real estate investment for Golden Visa. Plus setup fees.</p>
              </div>
            </div>
          </div>

          {/* Full comparison */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              Detailed Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-slate-50 text-slate-600 font-bold">Category</th>
                    <th className="p-4 text-center bg-slate-100 text-slate-800 font-bold">🇦🇪 Dubai / UAE</th>
                    <th className="p-4 text-center bg-[#1B3A6B] text-white font-bold">🇵🇾 Paraguay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { cat: 'Income tax', uae: '0% personal', py: '0% on foreign income', w: 'tie' },
                    { cat: 'Corporate tax', uae: '9% (above AED 375K profit)', py: '10% IRE (local business only)', w: 'uae' },
                    { cat: 'Minimum investment', uae: 'AED 2M ($545K) real estate', py: 'None — $435 gov fee only', w: 'py' },
                    { cat: 'Processing time', uae: '1-8 weeks', py: '3-6 months', w: 'uae' },
                    { cat: 'Path to citizenship', uae: 'Not realistically available', py: '3 years (basic Spanish)', w: 'py' },
                    { cat: 'Stay requirement', uae: 'Must maintain visa (renewal)', py: 'Once/year entry sufficient', w: 'tie' },
                    { cat: 'Rent (1BR city center)', uae: '€2,000-3,500', py: '€300-500', w: 'py' },
                    { cat: 'Monthly cost of living', uae: '€3,000-5,000', py: '€500-800', w: 'py' },
                    { cat: 'Restaurant meal', uae: '€15-40', py: '€5-8', w: 'py' },
                    { cat: 'International airport connectivity', uae: 'DXB — one of world\'s busiest', py: 'ASU — limited routes', w: 'uae' },
                    { cat: 'Internet speed', uae: '300+ Mbps fiber', py: '50-100 Mbps fiber', w: 'uae' },
                    { cat: 'Healthcare', uae: 'World-class private hospitals', py: 'Adequate private options', w: 'uae' },
                    { cat: 'Banking access', uae: 'Easy but expensive', py: 'Challenging — LEALTIS solves this', w: 'uae' },
                    { cat: 'Safety', uae: 'Extremely safe', py: 'Moderate', w: 'uae' },
                    { cat: 'Climate', uae: 'Extreme heat (45°C+ summer)', py: 'Subtropical (mild winters, hot summers)', w: 'py' },
                    { cat: 'CRS participation', uae: 'Yes — full CRS', py: 'No (projected 2027-2030)', w: 'py' },
                    { cat: 'Capital gains tax', uae: '0%', py: '0% on foreign assets', w: 'tie' },
                    { cat: 'Wealth/inheritance tax', uae: 'None', py: 'None on foreign assets', w: 'tie' },
                  ].map((row, i) => (
                    <tr key={row.cat} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{row.cat}</td>
                      <td className={`p-4 text-center text-sm ${row.w === 'uae' ? 'text-green-700 font-semibold' : 'text-slate-500'}`}>{row.uae}</td>
                      <td className={`p-4 text-center text-sm bg-[#1B3A6B]/5 ${row.w === 'py' ? 'text-[#C9A84C] font-semibold' : 'text-slate-500'}`}>{row.py}</td>
                    </tr>
                  ))}
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
                    { title: '1,000x cheaper entry', desc: '$435 vs $545,000. Keep your capital invested and earning, not locked in UAE real estate.' },
                    { title: 'Realistic citizenship path', desc: 'UAE citizenship is virtually impossible for foreigners. Paraguay offers citizenship in 3 years.' },
                    { title: 'MERCOSUR access', desc: 'Residency gives you access to live and work in Brazil, Argentina, Uruguay — 260M+ market.' },
                    { title: 'No extreme heat', desc: 'Dubai summers reach 50°C. Paraguay has a mild subtropical climate with actual seasons.' },
                    { title: 'No CRS', desc: 'UAE fully participates in CRS. Banking data is shared automatically.' },
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
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-4">Where Dubai wins</h3>
                <div className="space-y-4">
                  {[
                    { title: 'World-class infrastructure', desc: 'From airports to hospitals to roads — Dubai has some of the best infrastructure on Earth.' },
                    { title: 'Global connectivity', desc: 'DXB connects to 250+ destinations. Major business hub with direct flights everywhere.' },
                    { title: 'Established financial center', desc: 'DIFC provides a common-law jurisdiction with world-class financial services.' },
                    { title: 'Speed of setup', desc: 'Golden Visa processed in weeks. Company formation in days through free zones.' },
                    { title: 'Zero corporate tax (under threshold)', desc: '9% corporate tax only applies above AED 375K profit. Below that: 0%.' },
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
            <h2 className="text-3xl font-bold text-white mb-4">The $544K question</h2>
            <p className="text-slate-300 mb-8">Is Dubai worth 1,000x more than Paraguay? For most entrepreneurs, the answer is no. Let us show you why.</p>
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
