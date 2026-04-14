import { Metadata } from 'next'
import { LandingNav, LandingFooter } from '@/components/landing'

export const metadata: Metadata = {
  title: 'About LEALTIS - Who We Are',
  description: 'Meet the team behind LEALTIS and learn our mission to make Paraguay relocation simple and professional.',
}

export default function AboutPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
            About LEALTIS
          </h1>

          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">Our Mission</h2>
              <p className="text-slate-700 mb-6 leading-relaxed">
                To make professional relocation to Paraguay seamless, transparent, and genuinely integrated. We believe that moving to a new country shouldn't require coordinating with five different providers or crossing your fingers that everything will work out.
              </p>
              <p className="text-slate-700 leading-relaxed">
                We handle everything: residency, company formation, banking, legal compliance, and ongoing advisory. One program. One team. One price. No surprises.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5a9e] rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Our Team</h2>
              <p className="text-slate-200 mb-6">
                LEALTIS is staffed by lawyers, accountants, and business professionals with deep experience in Paraguay.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-[#C9A84C]">✓</span>
                  <span>Licensed attorneys in Paraguay</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#C9A84C]">✓</span>
                  <span>Certified accountants</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#C9A84C]">✓</span>
                  <span>Multilingual professionals</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#C9A84C]">✓</span>
                  <span>Years of experience in relocation</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="py-20 bg-slate-50 rounded-2xl px-8">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-8 text-center">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-3">Transparency</h3>
                <p className="text-slate-700">No hidden fees, no surprises. You know exactly what you're getting and what it costs.</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-3">Professionalism</h3>
                <p className="text-slate-700">Every detail handled with expertise. Your success is our success.</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-3">Integrity</h3>
                <p className="text-slate-700">Full compliance with Paraguayan law. We only do business the right way.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  )
}
