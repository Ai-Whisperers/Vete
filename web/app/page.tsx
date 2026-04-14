import { Metadata } from 'next'
import Link from 'next/link'
import { getClinicData, getAllClinics } from '@/lib/clinics'

export const metadata: Metadata = {
  title: 'Paragu AI — Multi-Brand Platform',
  description: 'Paragu-ai.com — Your gateway to services in Paraguay',
}

export default async function PlatformHome() {
  const tenants = await getAllClinics()

  const tenantCards: Record<string, { name: string; desc: string; color: string }> = {
    lealtis: { name: 'LEALTIS', desc: 'Relocation & establishment services for Europeans moving to Paraguay', color: '#1B3A6B' },
    arasy: { name: 'Barrio Arasy', desc: 'Gated community in Areguá — security, nature, quality of life', color: '#2D5A27' },
    dayah: { name: 'Dayah LitWorks', desc: 'Professional book cover design for independent authors', color: '#6B21A8' },
    cavillpet: { name: 'CavillPet', desc: 'Veterinary clinic — care for your pets', color: '#0891B2' },
    terrapet: { name: 'TerraPet', desc: 'Veterinary clinic and pet care services', color: '#059669' },
    petlife: { name: 'PetLife', desc: 'Complete pet wellness and veterinary care', color: '#D97706' },
    fun4me: { name: 'Fun4Me', desc: 'Retail store for fun products', color: '#E11D48' },
    'stroopwafel-huis': { name: 'Stroopwafel Huis', desc: 'Dutch café — authentic stroopwafels in Paraguay', color: '#B45309' },
    'granja-cabral': { name: 'Granja Cabral', desc: 'Avian farm and agricultural products', color: '#65A30D' },
    'clinica-duerksen': { name: 'Clínica Duerksen', desc: 'Medical clinic — healthcare services', color: '#1D4ED8' },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            paragu<span className="text-amber-400">.ai</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Your gateway to services and brands in Paraguay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(tenantCards).map(([slug, card]) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-xl"
            >
              <div
                className="absolute top-0 left-0 w-full h-1 transition-all group-hover:h-1.5"
                style={{ background: card.color }}
              />
              <h2 className="text-xl font-bold text-white mb-2">{card.name}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
              <div className="mt-4 flex items-center text-sm font-medium transition-colors" style={{ color: card.color }}>
                Visit
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 text-center text-slate-600 text-sm">
          <p>&copy; {new Date().getFullYear()} paragu.ai — All rights reserved</p>
        </footer>
      </div>
    </main>
  )
}
