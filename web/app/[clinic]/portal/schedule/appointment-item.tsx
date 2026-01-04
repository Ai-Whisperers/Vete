'use client'

import * as Icons from 'lucide-react'
import { updateAppointmentStatus } from '@/app/actions/update-appointment'
import { useState } from 'react'
import type { AppointmentStatus } from '@/lib/types/status'

interface AppointmentOwner {
  full_name?: string
  phone?: string
}

interface AppointmentPet {
  name: string
  species: string
  owner?: AppointmentOwner
}

interface Appointment {
  id: string
  pet: AppointmentPet
  start_time: string
  status: AppointmentStatus
  reason: string
  notes?: string
}

export default function AppointmentItem({
  appointment,
  clinic,
}: {
  appointment: Appointment
  clinic: string
}) {
  const [loading, setLoading] = useState(false)
  const { pet, start_time, status, reason, notes } = appointment
  const date = new Date(start_time)

  const handleStatus = async (newStatus: string) => {
    if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return
    setLoading(true)
    await updateAppointmentStatus(appointment.id, newStatus, clinic)
    setLoading(false)
  }

  const statusColors: Record<AppointmentStatus, string> = {
    scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    checked_in: 'bg-purple-100 text-purple-700 border-purple-200',
    in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    no_show: 'bg-red-100 text-red-700 border-red-200',
  }

  const badgeClass = statusColors[status] || 'bg-gray-100 text-gray-500'

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row">
      {/* Time Column */}
      <div className="flex flex-shrink-0 flex-col items-center justify-center border-b border-gray-100 pb-4 md:w-32 md:border-b-0 md:border-r md:pb-0 md:pr-6">
        <span className="text-2xl font-black text-[var(--text-primary)]">
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          {date.toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
        </span>
        <div
          className={`mt-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${badgeClass}`}
        >
          {status}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{pet.name}</h3>
              <span className="text-sm text-gray-400">({pet.species})</span>
            </div>
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <Icons.User className="h-3 w-3" /> {pet.owner?.full_name || 'Desconocido'}
              <span className="text-gray-300">|</span>
              <Icons.Phone className="h-3 w-3" /> {pet.owner?.phone || '-'}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <Icons.Info className="mt-1 h-4 w-4 shrink-0 text-blue-400" />
            <div>
              <span className="mb-0.5 block text-xs font-bold uppercase text-gray-400">Motivo</span>
              <p className="text-sm font-medium text-gray-700">{reason}</p>
              {notes && <p className="mt-1 text-xs italic text-gray-500">"{notes}"</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-2 border-t border-gray-100 pt-4 md:flex-col md:border-l md:border-t-0 md:pl-6 md:pt-0">
        {status === 'scheduled' && (
          <>
            <button
              onClick={() => handleStatus('confirmed')}
              disabled={loading}
              className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
              title="Confirmar"
            >
              <Icons.Check className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleStatus('cancelled')}
              disabled={loading}
              className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
              title="Cancelar"
            >
              <Icons.X className="h-5 w-5" />
            </button>
          </>
        )}
        {status === 'confirmed' && (
          <button
            onClick={() => handleStatus('completed')}
            disabled={loading}
            className="rounded-lg bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
            title="Completar"
          >
            <Icons.CheckCircle2 className="h-5 w-5" />
          </button>
        )}
        {status !== 'cancelled' && status !== 'completed' && status !== 'no_show' && (
          <button
            onClick={() => handleStatus('cancelled')}
            disabled={loading}
            className="rounded-lg bg-gray-50 p-2 text-gray-400 transition-colors hover:bg-gray-100"
            title="Cancelar"
          >
            <Icons.Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
