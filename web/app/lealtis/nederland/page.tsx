import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, AlertTriangle, TrendingDown, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vestigen in Paraguay voor Nederlandse Ondernemers | LEALTIS',
  description: 'Box 3, de 30%-regeling en je opties: eerlijk uitgelegd. Vestigen in Paraguay als Nederlandse ondernemer met het territoriale belastingstelsel.',
  keywords: ['Paraguay vestigen Nederlander', 'Box 3 belasting', '30 procent regeling', 'belasting Paraguay', 'residency Paraguay Netherlands', 'territoriaal belastingstelsel', 'emigratie Nederland Paraguay'],
  alternates: {
    canonical: '/nederland',
  },
}

export default function NederlandPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Vestigen in Paraguay voor Nederlandse Ondernemers
            </h1>
            <p className="text-xl text-slate-600">
              Box 3, de 30%-regeling en je opties: eerlijk uitgelegd
            </p>
          </div>

          {/* Why Dutch are considering Paraguay */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <TrendingDown className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Waarom meer Nederlanders Paraguay overwegen
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                The Netherlands has long been one of the highest-taxed countries in the EU. Recent policy changes have made the situation even more challenging for entrepreneurs and investors.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <h3 className="font-bold text-red-800 mb-2">Box 3 Changes</h3>
                  <p className="text-sm text-red-700">
                    The 2025 Box 3 reform introduces a &quot;worst of both worlds&quot; system — notional returns are taxed at 36.97% on savings above the exemption (€57,000 per person). With the government&apos;s assumed notional return of 6.17%, you pay tax on income you never actually earned.
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <h3 className="font-bold text-red-800 mb-2">30% Ruling Cut</h3>
                  <p className="text-sm text-red-700">
                    The 30% ruling (30%-regeling) for expatriate workers was drastically reduced. The maximum benefit period was shortened from 8 to 5 years, and the tax-free allowance dropped from 30% to 27% (phased out further for higher earners). The partial non-resident status was also removed.
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <h3 className="font-bold text-red-800 mb-2">Housing Crisis + Tax</h3>
                  <p className="text-sm text-red-700">
                    Average Amsterdam rent: €1,500-2,000/month for a 1-bedroom apartment. Transfer tax (overdrachtsbelasting) on investment properties: 10.4%. Property tax (onroerendezaakbelasting) continues to rise annually.
                  </p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">
                For Dutch entrepreneurs earning €100,000+ annually, the combined effective tax rate (income tax at 37.07-49.50%, plus Box 2 at 24.5-33% on substantial interest, plus Box 3 wealth tax) can exceed 45-50% of total income. Paraguay offers a fundamentally different model.
              </p>
            </div>
          </div>

          {/* Territorial tax for Dutch residents */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle2 className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Hoe het territoriale belastingstelsel werkt
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                The Netherlands uses a worldwide tax system — you pay tax on all income regardless of where it&apos;s earned. Paraguay uses a territorial system — you only pay tax on income earned within Paraguay. This fundamental difference is what makes Paraguay attractive.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1B3A6B] text-white">
                      <th className="p-4 text-left">Income Type</th>
                      <th className="p-4 text-left">Netherlands</th>
                      <th className="p-4 text-left">Paraguay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Remote work income</td>
                      <td className="p-4 text-slate-600">37.07-49.50% (Box 1)</td>
                      <td className="p-4 font-semibold text-[#C9A84C]">0%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">Dividends (foreign)</td>
                      <td className="p-4 text-slate-600">15% withholding + Box 2 (24.5-33%)</td>
                      <td className="p-4 font-semibold text-[#C9A84C]">0%</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Capital gains (foreign)</td>
                      <td className="p-4 text-slate-600">Box 3 notional return tax (36.97%)</td>
                      <td className="p-4 font-semibold text-[#C9A84C]">0%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">Crypto gains</td>
                      <td className="p-4 text-slate-600">Box 3 (assumed return)</td>
                      <td className="p-4 font-semibold text-[#C9A84C]">0%</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Rental income (foreign)</td>
                      <td className="p-4 text-slate-600">Box 3 (wealth tax on value)</td>
                      <td className="p-4 font-semibold text-[#C9A84C]">0%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">Local business income</td>
                      <td className="p-4 text-slate-600">25.8% VPB (corporate)</td>
                      <td className="p-4 text-slate-600">10% IRE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-[#C9A84C]/10 rounded-lg border border-[#C9A84C]/20">
                <p className="text-sm text-[#1B3A6B]"><strong>Key point:</strong> Paraguay has no Box 1, Box 2, or Box 3 equivalent. There is no wealth tax, no inheritance tax on foreign assets, and no deemed income taxation. Foreign income is simply not in scope.</p>
              </div>
            </div>
          </div>

          {/* 183-day rule and Dutch exit */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                De 183-dagen regel en vertrek uit het Nederlandse belastingstelsel
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                The Netherlands applies both the 183-day rule and the &quot;center of vital interests&quot; test. To properly exit Dutch tax residency, you need to satisfy both criteria.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-[#1B3A6B] mb-4">Steps to exit Dutch tax residency</h3>
                  <ol className="space-y-3 text-sm text-slate-700">
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">1.</span>
                      <span>Register at your new address with the Belastingdienst (tax authority) via form &quot;Verhuizing naar het buitenland&quot;</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">2.</span>
                      <span>Deregister from your Dutch municipality (Gemeente) — this is the formal step</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">3.</span>
                      <span>File your final M-form (M-biljet) for the partial year you were still a resident</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">4.</span>
                      <span>Apply for your Paraguayan tax residency certificate from the SET</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">5.</span>
                      <span>Keep evidence of actual relocation — flight records, rental contracts, utility bills in Paraguay</span>
                    </li>
                  </ol>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-[#1B3A6B] mb-4">Exit tax considerations</h3>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span><strong>Box 2 exit tax:</strong> If you hold a &quot;substantial interest&quot; (5%+) in a Dutch BV, emigration triggers a deemed disposition at market value. Tax is due on the paper gain (24.5-33%).</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span><strong>Deferral possible:</strong> You can request to defer the exit tax payment, but you&apos;ll need to provide security (bank guarantee or mortgage).</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span><strong>Pension:</strong> Dutch pension rights generally stay in the Netherlands and are taxed when paid out.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span><strong>No bilateral tax treaty yet:</strong> The Netherlands and Paraguay do not currently have a double taxation treaty. You&apos;ll rely on the unilateral credit method in Dutch law.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Banking and company formation */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <Building2 className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Bankieren, bedrijfsoprichting en het LEALTIS proces
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Banking access is the single biggest challenge for foreigners in Paraguay. Dutch banks (ING, Rabobank, ABN AMRO) may flag or close your account if you relocate to a non-CRS jurisdiction. Meanwhile, Paraguayan banks have strict compliance requirements for new foreign clients. This is exactly where LEALTIS provides the most value.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-[#1B3A6B] mb-3">The LEALTIS process for Dutch clients</h3>
                  <ol className="space-y-3 text-sm text-slate-700">
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">1.</span>
                      <span>Free consultation — we assess your situation, income sources, and goals</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">2.</span>
                      <span>Residency application — we handle the entire SUACE process (government fee: ~$435)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">3.</span>
                      <span>Company formation (EAS regime) — simplified corporation in 2-3 weeks</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">4.</span>
                      <span>Bank account opening — our core expertise; we have relationships with compliance officers at multiple banks</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#C9A84C] font-bold shrink-0">5.</span>
                      <span>Ongoing support — tax filings, accounting, legal compliance</span>
                    </li>
                  </ol>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-[#1B3A6B] mb-3">Dutch-specific considerations</h3>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span><strong>Dutch BV migration:</strong> If you have a Dutch BV, we coordinate with Dutch notaries on potential re-domiciliation or restructuring</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span><strong>ING/Rabobank accounts:</strong> We advise on maintaining European banking relationships while transitioning</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span><strong>Proof of funds:</strong> Paraguayan banks require clear source of funds documentation — we prepare this</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span><strong>30% ruling coordination:</strong> If you&apos;re still on the ruling, we plan the optimal exit timing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Cost comparison */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              Kostenvergelijking: Nederland vs Paraguay
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1B3A6B] text-white">
                    <th className="p-4 text-left">Expense</th>
                    <th className="p-4 text-right">Netherlands (Amsterdam)</th>
                    <th className="p-4 text-right">Paraguay (Asunción)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-4 font-semibold text-[#1B3A6B]">Rent (1BR city center)</td>
                    <td className="p-4 text-right text-slate-600">€1,500-2,000</td>
                    <td className="p-4 text-right text-[#C9A84C]">€300-500</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-4 font-semibold text-[#1B3A6B]">Groceries (monthly)</td>
                    <td className="p-4 text-right text-slate-600">€350</td>
                    <td className="p-4 text-right text-[#C9A84C]">€150</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#1B3A6B]">Restaurant meal</td>
                    <td className="p-4 text-right text-slate-600">€20</td>
                    <td className="p-4 text-right text-[#C9A84C]">€6</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-4 font-semibold text-[#1B3A6B]">Transportation (monthly)</td>
                    <td className="p-4 text-right text-slate-600">€90</td>
                    <td className="p-4 text-right text-[#C9A84C]">€20</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#1B3A6B]">Internet</td>
                    <td className="p-4 text-right text-slate-600">€40</td>
                    <td className="p-4 text-right text-[#C9A84C]">€25</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-4 font-semibold text-[#1B3A6B]">Gym membership</td>
                    <td className="p-4 text-right text-slate-600">€45</td>
                    <td className="p-4 text-right text-[#C9A84C]">€25</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#1B3A6B]">Health insurance (mandatory)</td>
                    <td className="p-4 text-right text-slate-600">€130-180/mo (basisverzekering)</td>
                    <td className="p-4 text-right text-[#C9A84C]">€30-60/mo (private)</td>
                  </tr>
                  <tr className="bg-[#1B3A6B]/5">
                    <td className="p-4 font-bold text-[#1B3A6B]">Estimated monthly total</td>
                    <td className="p-4 text-right font-bold text-slate-700">€2,275-2,745</td>
                    <td className="p-4 text-right font-bold text-[#C9A84C]">€560-770</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-[#C9A84C]/10 rounded-lg border border-[#C9A84C]/20">
              <p className="text-sm text-[#1B3A6B]"><strong>Monthly savings:</strong> €1,500-2,000 on living costs alone. Add the tax savings (potentially €2,000-4,000+/month for high earners) and the total monthly benefit can reach €3,500-6,000.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-2xl mx-auto p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Klaar om je opties te bespreken?</h2>
            <p className="text-slate-300 mb-8">Book a free consultation with our team. We speak Dutch, English, and Spanish — and we understand the specific situation of Dutch entrepreneurs.</p>
            <Link href="/lealtis/contacto" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 font-bold text-white shadow-lg hover:bg-[#a67c2e] transition-all">
              Gratis Consult Aanvragen
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
