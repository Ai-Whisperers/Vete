import { getClinicData } from '@/lib/clinics'
import { notFound } from 'next/navigation'
import { requireStaff } from '@/lib/auth'
import Link from 'next/link'
import { Users, FileText, Plus, CalendarClock } from 'lucide-react'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TodayScheduleWidget } from '@/components/dashboard/today-schedule-widget'
import { UpcomingVaccines } from '@/components/dashboard/upcoming-vaccines'
import { LostFoundWidget } from '@/components/safety/lost-found-widget'
import { WaitingRoomWrapper as WaitingRoom } from '@/components/dashboard/waiting-room'
import { TodayFocus } from '@/components/dashboard/today-focus'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { RevenueWidget } from '@/components/dashboard/revenue-widget'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { QuickSearch } from '@/components/dashboard/quick-search'
import { getTodayAppointmentsForClinic } from '@/lib/appointments'

interface Props {
  params: Promise<{ clinic: string }>
}

export async function generateStaticParams(): Promise<Array<{ clinic: string }>> {
  return [{ clinic: 'adris' }, { clinic: 'petlife' }]
}

export default async function ClinicalDashboardPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { clinic } = await params

  // SEC-006: Require staff authentication with tenant verification
  const { profile, isAdmin } = await requireStaff(clinic)

  const clinicData = await getClinicData(clinic)

  if (!clinicData) {
    notFound()
  }

  const todayAppointments = await getTodayAppointmentsForClinic(clinic)

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos d\u00edas' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = profile.full_name?.split(' ')[0] || 'Doctor'

  return (
    <div className="section-gap pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Top Row: Greeting + Quick Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              {greeting}, {firstName}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-[var(--text-secondary)]">
              <CalendarClock className="h-4 w-4" />
              {new Date().toLocaleDateString('es-PY', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${clinic}/dashboard/appointments?action=new`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Nueva Cita
            </Link>
            <Link
              href={`/${clinic}/dashboard/invoices?action=new`}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-[var(--bg-subtle)]"
            >
              <FileText className="h-4 w-4" />
              Facturar
            </Link>
            <Link
              href={`/${clinic}/dashboard/clients?action=new-client`}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-[var(--bg-subtle)]"
            >
              <Users className="h-4 w-4" />
              Cliente
            </Link>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="max-w-2xl">
          <QuickSearch clinic={clinic} />
        </div>
      </div>

      {/* Stats Cards - Enhanced with gradients and click navigation */}
      <StatsCards clinic={clinic} />

      {/* Main Content Grid - Redesigned Layout */}
      <div className="content-grid">
        {/* Left Column - Primary Content (8 cols on lg) */}
        <div className="content-main">
          {/* Today's Focus - Urgent items requiring attention */}
          <TodayFocus clinic={clinic} />

          {/* Waiting Room - Interactive Queue */}
          <WaitingRoom clinic={clinic} />

          {/* Today's Full Schedule */}
          <TodayScheduleWidget appointments={todayAppointments} clinic={clinic} />
        </div>

        {/* Right Column - Secondary Content (4 cols on lg) */}
        <div className="content-sidebar">
          {/* Admin-only: Revenue Widget */}
          {isAdmin && <RevenueWidget clinic={clinic} />}

          {/* Alerts Panel - Consolidated alerts */}
          <AlertsPanel clinic={clinic} />

          {/* Activity Feed - Recent activities */}
          <ActivityFeed clinic={clinic} maxItems={6} />

          {/* Upcoming Vaccines */}
          <UpcomingVaccines clinic={clinic} />

          {/* Lost & Found Widget */}
          <LostFoundWidget />
        </div>
      </div>
    </div>
  )
}
