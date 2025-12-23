'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { AppointmentCard } from './appointment-card'

type TabType = 'upcoming' | 'past'

interface AppointmentListProps {
  upcoming: Array<{
    id: string
    tenant_id: string
    start_time: string
    end_time: string
    status: string
    reason: string
    notes?: string | null
    pets: {
      id: string
      name: string
      species: string
      photo_url?: string | null
    }
  }>
  past: Array<{
    id: string
    tenant_id: string
    start_time: string
    end_time: string
    status: string
    reason: string
    notes?: string | null
    pets: {
      id: string
      name: string
      species: string
      photo_url?: string | null
    }
  }>
  clinic: string
}

export function AppointmentList({ upcoming, past, clinic }: AppointmentListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')

  const tabs: { id: TabType; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'upcoming', label: 'Próximas', count: upcoming.length, icon: Icons.CalendarCheck },
    { id: 'past', label: 'Anteriores', count: past.length, icon: Icons.History }
  ]

  const appointments = activeTab === 'upcoming' ? upcoming : past

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl" role="tablist" aria-label="Filtros de citas">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-[var(--text-primary)] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'bg-gray-200 text-gray-500'
              }`} aria-label={`${tab.count} citas`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Appointment List */}
      <div
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
      >
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                clinic={clinic}
                showActions={activeTab === 'upcoming'}
              />
            ))}
          </div>
        ) : (
          <EmptyState tab={activeTab} clinic={clinic} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab, clinic }: { tab: TabType; clinic: string }) {
  if (tab === 'upcoming') {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl">
        <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icons.CalendarPlus className="w-10 h-10 text-[var(--primary)]" />
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          No tienes citas programadas
        </h3>
        <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
          Agenda una cita para tu mascota y la verás aquí.
        </p>
        <Link
          href={`/${clinic}/book`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Icons.Plus className="w-5 h-5" />
          Agendar Cita
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center py-16 bg-gray-50 rounded-2xl">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icons.History className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        Sin historial de citas
      </h3>
      <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
        Aquí aparecerán tus citas pasadas y canceladas.
      </p>
    </div>
  )
}
