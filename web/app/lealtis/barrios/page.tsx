import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, MapPin, DollarSign, Users, Star } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Asunción Neighborhood Guide for Expats | LEALTIS',
  description: 'Explore the best neighborhoods in Asunción for expats. Villa Morra, Carmelitas, Centro, Encarnación, and Ciudad del Este — prices, amenities, and lifestyle.',
  keywords: ['Asunción neighborhoods', 'Villa Morra', 'Carmelitas', 'Paraguay expat living', 'best areas Asunción'],
}

const neighborhoods = [
  {
    name: 'Villa Morra',
    tagline: 'The premium expat area',
    color: '#C9A84C',
    prices: '$1,500–2,500/m² apartments, $600–1,200/mo rent',
    highlights: ['Paseo La Galería mall, Shopping del Sol', 'International restaurants, coworking spaces', '15 min from airport'],
    bestFor: 'Professionals, investors',
  },
  {
    name: 'Carmelitas',
    tagline: 'Modern and growing',
    color: '#1B3A6B',
    prices: '$1,200–2,000/m², more new construction',
    highlights: ['Trendy cafes, boutique shops', 'Good connectivity', 'Growing expat community'],
    bestFor: 'Young entrepreneurs, digital nomads',
  },
  {
    name: 'Asunción Center (Centro)',
    tagline: 'Budget-friendly',
    color: '#6B7280',
    prices: '$800–1,500/m², older buildings',
    highlights: ['Government offices, historic architecture', 'Walking distance to many services', 'Authentic local atmosphere'],
    bestFor: 'Budget-conscious, short stays',
  },
  {
    name: 'Encarnación',
    tagline: 'Alternative city (Southern Paraguay)',
    color: '#059669',
    prices: 'Lower cost than Asunción',
    highlights: ['Smaller, quieter, border with Argentina', 'German community, beaches on Paraná river', 'Relaxed pace of life'],
    bestFor: 'Lifestyle-focused, retirees',
  },
  {
    name: 'Ciudad del Este',
    tagline: 'Commercial hub',
    color: '#DC2626',
    prices: 'Much cheaper than Asunción',
    highlights: ['Border with Brazil and Argentina', 'Trade-focused, busy commercial center', 'Gateway to Iguaçu Falls'],
    bestFor: 'Import/export businesses',
  },
]

export default function BarriosPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Asunción Neighborhood Guide for Expats
            </h1>
            <p className="text-xl text-slate-600">
              Find the right area to live, work, and invest. A practical guide to Paraguay&apos;s main expat neighborhoods.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 mb-20">
            {neighborhoods.map((nb) => (
              <div key={nb.name} className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden hover:border-slate-200 transition-colors">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {nb.name}
                      </h2>
                      <p className="text-[#C9A84C] font-semibold">{nb.tagline}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-[#C9A84C]" />
                        <span className="text-sm font-bold text-slate-700">Prices</span>
                      </div>
                      <p className="text-sm text-slate-600">{nb.prices}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-[#C9A84C]" />
                        <span className="text-sm font-bold text-slate-700">Highlights</span>
                      </div>
                      <ul className="space-y-1">
                        {nb.highlights.map((h) => (
                          <li key={h} className="text-sm text-slate-600">{h}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-[#C9A84C]" />
                        <span className="text-sm font-bold text-slate-700">Best For</span>
                      </div>
                      <p className="text-sm text-slate-600">{nb.bestFor}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-8 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
              Which Neighborhood Is Right for You?
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1B3A6B] text-white">
                    <th className="p-4 text-left">Neighborhood</th>
                    <th className="p-4 text-left">Budget</th>
                    <th className="p-4 text-left">Lifestyle</th>
                    <th className="p-4 text-left">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="p-4 font-semibold text-[#1B3A6B]">Villa Morra</td><td className="p-4 text-slate-600">Premium</td><td className="p-4 text-slate-600">Upscale urban</td><td className="p-4 text-slate-600">Professionals</td></tr>
                  <tr className="bg-slate-50"><td className="p-4 font-semibold text-[#1B3A6B]">Carmelitas</td><td className="p-4 text-slate-600">Mid–High</td><td className="p-4 text-slate-600">Modern, vibrant</td><td className="p-4 text-slate-600">Entrepreneurs</td></tr>
                  <tr><td className="p-4 font-semibold text-[#1B3A6B]">Centro</td><td className="p-4 text-slate-600">Budget</td><td className="p-4 text-slate-600">Authentic, central</td><td className="p-4 text-slate-600">Short stays</td></tr>
                  <tr className="bg-slate-50"><td className="p-4 font-semibold text-[#1B3A6B]">Encarnación</td><td className="p-4 text-slate-600">Low</td><td className="p-4 text-slate-600">Relaxed, riverside</td><td className="p-4 text-slate-600">Retirees</td></tr>
                  <tr><td className="p-4 font-semibold text-[#1B3A6B]">Ciudad del Este</td><td className="p-4 text-slate-600">Very Low</td><td className="p-4 text-slate-600">Commercial, busy</td><td className="p-4 text-slate-600">Trade business</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Planning your move?</h2>
            <p className="text-slate-300 mb-8">We help you choose the right neighborhood and arrange everything for a smooth relocation.</p>
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
