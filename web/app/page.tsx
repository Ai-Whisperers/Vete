import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Sparkles, Users, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'paragu.ai — Your gateway to services and brands in Paraguay',
  description: 'Discover premium services and brands in Paraguay. From veterinary care to relocation services, find everything you need.',
}

const tenants = [
  { 
    slug: 'lealtis', 
    name: 'LEALTIS', 
    description: 'Relocation & establishment services for Europeans moving to Paraguay', 
    color: '#1b3a6b',
    icon: '🏢',
    category: 'Services'
  },
  { 
    slug: 'arasy', 
    name: 'Barrio Arasy', 
    description: 'Gated community in Areguá — security, nature, quality of life', 
    color: '#2d5a27',
    icon: '🏡',
    category: 'Real Estate'
  },
  { 
    slug: 'dayah', 
    name: 'Dayah LitWorks', 
    description: 'Professional book cover design for independent authors', 
    color: '#6b21a8',
    icon: '📚',
    category: 'Design'
  },
  { 
    slug: 'cavillpet', 
    name: 'CavillPet', 
    description: 'Veterinary clinic — care for your pets', 
    color: '#0891b2',
    icon: '🐾',
    category: 'Veterinary'
  },
  { 
    slug: 'terrapet', 
    name: 'TerraPet', 
    description: 'Veterinary clinic and pet care services', 
    color: '#059669',
    icon: '🐕',
    category: 'Veterinary'
  },
  { 
    slug: 'petlife', 
    name: 'PetLife', 
    description: 'Complete pet wellness and veterinary care', 
    color: '#d97706',
    icon: '🐈',
    category: 'Veterinary'
  },
  { 
    slug: 'fun4me', 
    name: 'Fun4Me', 
    description: 'Retail store for fun products', 
    color: '#e11d48',
    icon: '🛍️',
    category: 'Retail'
  },
  { 
    slug: 'stroopwafel-huis', 
    name: 'Stroopwafel Huis', 
    description: 'Dutch café — authentic stroopwafels in Paraguay', 
    color: '#b45309',
    icon: '🥐',
    category: 'Food & Beverage'
  },
  { 
    slug: 'granja-cabral', 
    name: 'Granja Cabral', 
    description: 'Avian farm and agricultural products', 
    color: '#65a30d',
    icon: '🥚',
    category: 'Agriculture'
  },
  { 
    slug: 'clinica-duerksen', 
    name: 'Clínica Duerksen', 
    description: 'Medical clinic — healthcare services', 
    color: '#1d4ed8',
    icon: '🏥',
    category: 'Healthcare'
  },
]

function TenantCard({ tenant }: { tenant: typeof tenants[0] }) {
  return (
    <Link
      href={`/${tenant.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:from-white/10 hover:to-white/05 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1"
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${tenant.color}15 0%, transparent 50%)`
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{tenant.icon}</span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 text-white/70">
            {tenant.category}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
          {tenant.name}
        </h2>
        <p className="text-white/50 text-sm leading-relaxed mb-4">
          {tenant.description}
        </p>
        <div className="flex items-center text-sm font-medium transition-all duration-300 group-hover:gap-2" style={{ color: tenant.color }}>
          <span>Visit website</span>
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
      <div 
        className="absolute top-0 left-0 w-full h-0.5 opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ background: tenant.color }}
      />
    </Link>
  )
}

function GradientOrb({ className }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-30 ${className}`} />
  )
}

function FloatingShape({ className }: { className?: string }) {
  return (
    <div className={`absolute border border-white/10 rounded-2xl rotate-12 ${className}`} />
  )
}

export default function PlatformHome() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <GradientOrb className="w-[600px] h-[600px] bg-violet-600 -top-40 -left-40" />
      <GradientOrb className="w-[500px] h-[500px] bg-amber-600/50 -bottom-20 -right-20" />
      <GradientOrb className="w-[400px] h-[400px] bg-cyan-600/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <FloatingShape className="w-20 h-20 top-20 left-[15%] opacity-20" />
      <FloatingShape className="w-16 h-16 bottom-32 right-[20%] opacity-10 rotate-45" />
      <FloatingShape className="w-12 h-12 top-1/3 right-[10%] opacity-15 rotate-6" />

      <main className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Premium Services in Paraguay</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400">paragu</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">.ai</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed">
            Your gateway to premium services and brands in Paraguay. 
            From healthcare to hospitality, find quality you can trust.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Asunción, Paraguay</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>10+ Trusted Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Premium Quality</span>
            </div>
          </div>
        </header>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                Explore Our Services
              </h2>
              <p className="text-white/40">
                Click on any business to learn more
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tenants.map((tenant) => (
              <TenantCard key={tenant.slug} tenant={tenant} />
            ))}
          </div>
        </section>

        <footer className="mt-16 md:mt-24 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
            <p>© 2026 paragu.ai — All rights reserved</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-white/50 transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-white/50 transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-white/50 transition-colors cursor-pointer">Contact</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}