import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'paragu.ai — Your gateway to services and brands in Paraguay',
    template: '%s | paragu.ai',
  },
  description: 'Your gateway to services and brands in Paraguay',
}

const tenants = [
  { slug: 'lealtis', name: 'LEALTIS', description: 'Relocation & establishment services for Europeans moving to Paraguay', color: 'rgb(27, 58, 107)' },
  { slug: 'arasy', name: 'Barrio Arasy', description: 'Gated community in Areguá — security, nature, quality of life', color: 'rgb(45, 90, 39)' },
  { slug: 'dayah', name: 'Dayah LitWorks', description: 'Professional book cover design for independent authors', color: 'rgb(107, 33, 168)' },
  { slug: 'cavillpet', name: 'CavillPet', description: 'Veterinary clinic — care for your pets', color: 'rgb(8, 145, 178)' },
  { slug: 'terrapet', name: 'TerraPet', description: 'Veterinary clinic and pet care services', color: 'rgb(5, 150, 105)' },
  { slug: 'petlife', name: 'PetLife', description: 'Complete pet wellness and veterinary care', color: 'rgb(217, 119, 6)' },
  { slug: 'fun4me', name: 'Fun4Me', description: 'Retail store for fun products', color: 'rgb(225, 29, 72)' },
  { slug: 'stroopwafel-huis', name: 'Stroopwafel Huis', description: 'Dutch café — authentic stroopwafels in Paraguay', color: 'rgb(180, 83, 9)' },
  { slug: 'granja-cabral', name: 'Granja Cabral', description: 'Avian farm and agricultural products', color: 'rgb(101, 163, 13)' },
  { slug: 'clinica-duerksen', name: 'Clínica Duerksen', description: 'Medical clinic — healthcare services', color: 'rgb(29, 78, 216)' },
]

function TenantCard({ tenant }: { tenant: typeof tenants[0] }) {
  return (
    <Link
      href={`/${tenant.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-xl"
    >
      <div
        className="absolute top-0 left-0 w-full h-1 transition-all group-hover:h-1.5"
        style={{ background: tenant.color }}
      />
      <h2 className="text-xl font-bold text-white mb-2">{tenant.name}</h2>
      <p className="text-slate-400 text-sm leading-relaxed">{tenant.description}</p>
      <div
        className="mt-4 flex items-center text-sm font-medium transition-colors"
        style={{ color: tenant.color }}
      >
        Visit
        <svg
          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

export default function PlatformHome() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          paragu<span className="text-amber-400">.ai</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Your gateway to services and brands in Paraguay
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <TenantCard key={tenant.slug} tenant={tenant} />
        ))}
      </div>

      <footer className="mt-20 text-center text-slate-600 text-sm">
        <p>© 2026 paragu.ai — All rights reserved</p>
      </footer>
    </main>
  )
}