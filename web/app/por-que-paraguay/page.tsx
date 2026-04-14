import { Metadata } from 'next'
import { LandingNav, LandingFooter } from '@/components/landing'

export const metadata: Metadata = {
  title: 'Why Paraguay - LEALTIS',
  description: 'Discover why Paraguay is the ideal destination for European relocation and business establishment.',
}

export default function WhyParaguayPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
            Why Paraguay?
          </h1>
          
          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">Strategic Advantages</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-[#C9A84C] font-bold">•</span>
                  <span className="text-slate-700">No currency restrictions — freely transfer and invest funds</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#C9A84C] font-bold">•</span>
                  <span className="text-slate-700">Low cost of living with high quality of life</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#C9A84C] font-bold">•</span>
                  <span className="text-slate-700">Straightforward residency process</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#C9A84C] font-bold">•</span>
                  <span className="text-slate-700">Growing economy with investment opportunities</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#C9A84C] font-bold">•</span>
                  <span className="text-slate-700">Central location in South America</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">For Entrepreneurs</h2>
              <p className="text-slate-700 mb-6">Paraguay offers a unique combination of:</p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-[#C9A84C]">✓</span>
                  <span className="text-slate-700">Easy business registration</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#C9A84C]">✓</span>
                  <span className="text-slate-700">Competitive tax environment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#C9A84C]">✓</span>
                  <span className="text-slate-700">Emerging market opportunities</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#C9A84C]">✓</span>
                  <span className="text-slate-700">Gateway to regional markets</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="py-20 bg-slate-50 rounded-2xl px-8 text-center">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-4">Ready to Explore?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Book a consultation to discuss how Paraguay aligns with your goals.
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  )
}
