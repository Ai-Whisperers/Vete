'use client'

import { PawPrint, Calendar, Syringe } from 'lucide-react'

interface PortalWelcomeHeroProps {
  userName?: string // Deprecated - no longer displayed
  petCount: number
  upcomingAppointments: number
  pendingVaccines: number
  clinicName: string
}

interface StatBoxProps {
  icon: React.ReactNode
  value: number
  label: string
  variant?: 'default' | 'warning'
}

function StatBox({ icon, value, label, variant = 'default' }: StatBoxProps): React.ReactElement {
  const bgClass = variant === 'warning' ? 'bg-[var(--status-warning)]/20' : 'bg-white/20'
  const iconBgClass = variant === 'warning' ? 'bg-[var(--status-warning)]/30' : 'bg-white/30'

  return (
    <div className={`flex items-center gap-3 rounded-xl ${bgClass} p-3 backdrop-blur-sm`}>
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs font-medium text-white/80">{label}</p>
      </div>
    </div>
  )
}

export function PortalWelcomeHero({
  petCount,
  upcomingAppointments,
  pendingVaccines,
  clinicName,
}: PortalWelcomeHeroProps): React.ReactElement {
  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] py-8 text-white md:py-10">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-black/10 blur-3xl" />

      {/* Paw print pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M11 14c-.5 2.5-2 4.5-4 6-2-1.5-3.5-3.5-4-6 1-1 2.5-1 3.5 0 .5.5.5 1.5.5 2.5.5-1 1-2 2-2.5 1 0 2 1 2 2.5 0-1 0-2 .5-2.5 1-1 2.5-1 3.5 0'/%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='13' cy='5' r='2'/%3E%3Ccircle cx='17' cy='9' r='2'/%3E%3Ccircle cx='5' cy='12' r='2'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">{greeting}</h1>
          <p className="mt-1 text-white/80">
            Bienvenido a tu portal de{' '}
            <span className="font-semibold text-white">{clinicName}</span>
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
          <StatBox
            icon={<PawPrint className="h-5 w-5 text-white" />}
            value={petCount}
            label="Mascotas"
          />
          <StatBox
            icon={<Calendar className="h-5 w-5 text-white" />}
            value={upcomingAppointments}
            label="Citas"
          />
          <StatBox
            icon={<Syringe className="h-5 w-5 text-white" />}
            value={pendingVaccines}
            label="Vacunas"
            variant={pendingVaccines > 0 ? 'warning' : 'default'}
          />
        </div>
      </div>
    </section>
  )
}
