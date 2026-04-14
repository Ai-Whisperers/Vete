import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, CheckCircle2, AlertTriangle, Landmark, FileText, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Niederlassung in Paraguay für Deutsche Unternehmer | LEALTIS',
  description: 'Wegzugssteuer, Exit-Tax und das territoriale Steuersystem: Was Sie wissen müssen. Ehrliche Beratung für deutsche Unternehmer zur Niederlassung in Paraguay.',
  keywords: ['Paraguay Niederlassung Deutsch', 'Wegzugssteuer Paraguay', 'Exit-Tax Deutschland', 'territoriales Steuersystem', 'Auswanderung Paraguay Deutschland', 'Steuer Paraguay Deutsch', 'Residenz Paraguay'],
  alternates: {
    canonical: '/deutschland',
  },
}

export default function DeutschlandPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Niederlassung in Paraguay für Deutsche Unternehmer
            </h1>
            <p className="text-xl text-slate-600">
              Wegzugssteuer, Exit-Tax und das territoriale Steuersystem: Was Sie wissen müssen
            </p>
          </div>

          {/* Why Germans are looking at Paraguay */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle2 className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Warum immer mehr Deutsche nach Paraguay schauen
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Germany&apos;s combined tax and social security burden is among the highest in the OECD. For entrepreneurs and high earners, the effective rate including solidarity surcharge (Solidaritätszuschlag), church tax (Kirchensteuer), and health insurance contributions can exceed 50% of gross income.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <div className="text-3xl font-bold text-red-700 mb-2">47%+</div>
                  <h3 className="font-bold text-red-800 mb-2">Top income tax rate</h3>
                  <p className="text-sm text-red-700">The German income tax rate (Einkommensteuer) reaches 45% at €277,826 (2025), plus 5.5% solidarity surcharge. Combined with Kirchensteuer (8-9%), the top rate exceeds 47%.</p>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <div className="text-3xl font-bold text-red-700 mb-2">2025</div>
                  <h3 className="font-bold text-red-800 mb-2">Wealth tax debates</h3>
                  <p className="text-sm text-red-700">Political parties continue to push for reintroduction of Vermögensteuer (wealth tax) on net assets above €1-2 million. While not yet enacted, the risk is real and growing.</p>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <div className="text-3xl font-bold text-red-700 mb-2">20%</div>
                  <h3 className="font-bold text-red-800 mb-2">Abgeltungsteuer on capital gains</h3>
                  <p className="text-sm text-red-700">Flat 25% tax (plus solidarity and church tax = ~28%) on all investment income: dividends, capital gains, crypto profits. No exemption for long-term holdings of non-substantial shares.</p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">
                For a German entrepreneur earning €150,000 in combined income (salary + dividends + capital gains), the total tax and social contribution burden typically exceeds €55,000-65,000 per year. In Paraguay, the same income structure would result in near-zero taxation on foreign-sourced components.
              </p>
            </div>
          </div>

          {/* Wegzugssteuer / Exit Tax */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Die Wegzugssteuer (Exit-Tax): Wann sie gilt, wann nicht
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Germany&apos;s exit tax (§ 6 AStG — Außensteuergesetz, and § 17 EStG for substantial shareholdings) is one of the most important considerations for any German entrepreneur planning to relocate. Understanding when it applies — and when it doesn&apos;t — is critical.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1B3A6B] text-white">
                      <th className="p-4 text-left">Scenario</th>
                      <th className="p-4 text-left">Exit Tax Applies?</th>
                      <th className="p-4 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">1% shareholding in a GmbH</td>
                      <td className="p-4 text-red-600 font-semibold">No</td>
                      <td className="p-4 text-slate-600">Below the 1% threshold — no deemed disposition applies under § 6 AStG</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">5%+ shareholding in a GmbH</td>
                      <td className="p-4 text-red-600 font-semibold">Yes</td>
                      <td className="p-4 text-slate-600">Deemed disposition at market value. Tax on unrealized gains deferred for 5 years (payment security required)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Sole proprietorship (Einzelunternehmen)</td>
                      <td className="p-4 text-green-600 font-semibold">No exit tax</td>
                      <td className="p-4 text-slate-600">No deemed disposition for sole proprietorships. But: business assets may be subject to regular taxation on relocation</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-semibold text-[#1B3A6B]">Crypto / stock portfolio</td>
                      <td className="p-4 text-green-600 font-semibold">No exit tax</td>
                      <td className="p-4 text-slate-600">No deemed disposition for personal investment portfolios. Only § 17 EStG shares (1%+) trigger exit tax</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-[#1B3A6B]">Real estate in Germany</td>
                      <td className="p-4 text-slate-600 font-semibold">N/A</td>
                      <td className="p-4 text-slate-600">German property is always taxable in Germany regardless of your residency (limited tax liability)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                <h3 className="font-bold text-amber-800 mb-2">Important: Deferral options</h3>
                <p className="text-sm text-amber-700">
                  Under § 6 AStG, exit tax on substantial shareholdings can be deferred for up to 5 years. You must provide security (Sicherheitsleistung) to the Finanzamt. If you relocate to an EU/EEA country, the deferral is automatic. For Paraguay (non-EU), you must actively apply and provide collateral. We coordinate with German Steuerberater to manage this process.
                </p>
              </div>
            </div>
          </div>

          {/* Territorial tax for Germans */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <Landmark className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Wie Paraguays territoriales Steuersystem für Deutsche funktioniert
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Germany taxes worldwide income for residents (Welteinkommensprinzip). Paraguay taxes only Paraguayan-source income (Territorialitätsprinzip). Once you establish tax residency in Paraguay and properly exit the German system, the following income becomes tax-free:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <h3 className="font-bold text-green-800 mb-3">0% tax in Paraguay on:</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Remote work for non-Paraguayan clients</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Dividends from foreign companies</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Capital gains from foreign stocks/crypto</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Rental income from foreign properties</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Pension income from German sources</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />Freelance income from non-Paraguayan clients</li>
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-[#1B3A6B] mb-3">10% tax in Paraguay on:</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex gap-2"><span className="text-[#C9A84C]">•</span>Business income from Paraguayan clients</li>
                    <li className="flex gap-2"><span className="text-[#C9A84C]">•</span>Services rendered physically in Paraguay</li>
                    <li className="flex gap-2"><span className="text-[#C9A84C]">•</span>Rental income from Paraguayan properties</li>
                    <li className="flex gap-2"><span className="text-[#C9A84C]">•</span>Capital gains from Paraguayan assets</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="font-bold text-[#1B3A6B] mb-2">Still taxed in Germany:</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2"><span className="text-red-500">•</span>Income from German real estate</li>
                      <li className="flex gap-2"><span className="text-red-500">•</span>German-source dividends (withholding tax)</li>
                      <li className="flex gap-2"><span className="text-red-500">•</span>German pension (limited tax liability)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* German banking considerations */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Deutsche Banken und BaFin-Compliance
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                German banks (Deutsche Bank, Commerzbank, Sparkassen, Volksbanken) operate under strict BaFin (Bundesanstalt für Finanzdienstleistungsaufsicht) regulations. When you relocate to a non-CRS jurisdiction like Paraguay, your German bank will likely take action.
              </p>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-[#1B3A6B] mb-4">What typically happens with German bank accounts</h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Account restrictions:</strong> Most German banks restrict or close accounts for non-residents. Sparkassen and Volksbanken are particularly strict — they typically require German residency to maintain an account.</span>
                  </li>
                  <li className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>BaFin reporting:</strong> Any account movement above €10,000 is reported. Moving large sums to Paraguay may trigger a BaFin compliance review.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                    <span><strong>Deutsche Bank / Commerzbank:</strong> International divisions may allow you to maintain an account with non-resident status, but fees increase significantly.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                    <span><strong>N26 / Wise:</strong> Digital banks are more flexible with residency changes but have their own restrictions for certain countries. N26 does not support Paraguayan residency.</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-[#C9A84C]/10 rounded-lg border border-[#C9A84C]/20">
                <p className="text-sm text-[#1B3A6B]"><strong>LEALTIS advantage:</strong> We help you open accounts at Paraguayan banks with full compliance documentation. We also coordinate with European banking partners to maintain necessary financial infrastructure for your business operations.</p>
              </div>
            </div>
          </div>

          {/* Process timeline */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              Zeitplan für deutsche Staatsbürger
            </h2>
            <div className="space-y-4">
              {[
                { phase: 'Phase 1: Vorbereitung', time: 'Woche 1-4', desc: 'Kostenlose Beratung, Dokumentensammlung, Besprechung mit deutschem Steuerberater bzgl. Exit-Tax und Abmeldung' },
                { phase: 'Phase 2: Residenzantrag', time: 'Woche 4-12', desc: 'SUACE-Antrag über LEALTIS, Polizeiliches Führungszeugnis (apostilliert), Geburtsurkunde (apostilliert), Passkopie' },
                { phase: 'Phase 3: Ankunft in Paraguay', time: 'Woche 12-14', desc: 'Carnet de Extranjería abholen, Wohnung mieten, Bankkonto eröffnen (LEALTIS begleitet Sie)' },
                { phase: 'Phase 4: Steuerlicher Umzug', time: 'Monat 4-12', desc: 'Abmeldung beim Einwohnermeldeamt in Deutschland, letzte Steuererklärung, Bescheinigung der SET über steuerliche Ansässigkeit' },
                { phase: 'Phase 5: Erstes volles Jahr', time: 'Jahr 2', desc: 'Erstes vollständiges Steuerjahr als Nicht-Resident in Deutschland. Steuererklärung in Paraguay (LEALTIS übernimmt)' },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-sm font-bold text-[#C9A84C] shrink-0 w-24">{step.time}</div>
                  <div>
                    <h3 className="font-bold text-[#1B3A6B] mb-1">{step.phase}</h3>
                    <p className="text-sm text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Scale className="h-5 w-5 text-slate-600" />
                <h3 className="font-bold text-slate-800">Rechtlicher Hinweis</h3>
              </div>
              <p className="text-sm text-slate-600">
                Diese Seite dient ausschließlich Informationszwecken und stellt keine Steuer- oder Rechtsberatung dar. Die deutsche Steuergesetzgebung ist komplex, insbesondere die Wegzugsbesteuerung (§ 6 AStG) und die beschränkte Steuerpflicht. LEALTIS empfiehlt dringend, vor Entscheidungen einen qualifizierten deutschen Steuerberater (Steuerberaterkammer) hinzuzuziehen.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-2xl mx-auto p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Bereit für ein unverbindliches Gespräch?</h2>
            <p className="text-slate-300 mb-8">Wir verstehen die spezifische Situation deutscher Unternehmer. Buchen Sie eine kostenlose Beratung — auf Deutsch, Englisch oder Spanisch.</p>
            <Link href="/lealtis/contacto" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 font-bold text-white shadow-lg hover:bg-[#a67c2e] transition-all">
              Kostenlose Beratung Buchen
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
