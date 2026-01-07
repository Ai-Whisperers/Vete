'use client'

import React from 'react'
import { ArrowLeft, Info, AlertCircle, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { checkAvailableSlots } from '@/app/actions/appointments'
import { useBookingStore, getLocalDateString } from '@/lib/store/booking-store'

interface DateTimeSelectionProps {
  clinicName: string
}

/**
 * Step 3: Date and time selection component
 * Now considers total duration of all selected services
 */
export function DateTimeSelection({ clinicName }: DateTimeSelectionProps) {
  const { selection, clinicId, updateSelection, setStep, getTotalDuration, getEndTime } =
    useBookingStore()
  const totalDuration = getTotalDuration()
  const endTime = getEndTime()
  const isFormValid = selection.date && selection.time_slot

  // Fetch available slots when date is selected
  // Pass total duration to get slots that fit the entire block
  const {
    data: slots = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['slots', clinicId, selection.date, totalDuration],
    queryFn: async () => {
      if (!selection.date) return []
      const result = await checkAvailableSlots({
        clinicSlug: clinicId,
        date: selection.date,
        slotDurationMinutes: totalDuration || 30,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data || []
    },
    enabled: !!selection.date && !!clinicId,
  })

  return (
    <div className="animate-in slide-in-from-right-8 relative z-10 duration-500">
      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={() => setStep('pet')}
          className="rounded-2xl bg-gray-50 p-3 text-gray-400 transition-all hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-3xl font-black text-gray-900">Agenda tu visita</h2>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Date Selection */}
        <div>
          <label className="mb-4 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">
            Selecciona el día
          </label>
          <input
            type="date"
            className="focus:ring-[var(--primary)]/20 w-full rounded-3xl border-none bg-gray-50 p-5 text-lg font-black text-gray-700 outline-none transition-all focus:ring-4"
            min={getLocalDateString(new Date())}
            value={selection.date}
            onChange={(e) => {
              updateSelection({ date: e.target.value, time_slot: '' }) // Reset time when date changes
            }}
          />
          <div className="bg-[var(--primary)]/5 border-[var(--primary)]/10 mt-6 space-y-3 rounded-3xl border p-6">
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
              <Info className="h-4 w-4" />
              Reservando en {clinicName}
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Duración total: {totalDuration} minutos
            </p>
            {selection.time_slot && endTime && (
              <p className="text-sm font-medium text-gray-700">
                Horario: {selection.time_slot} - {endTime}
              </p>
            )}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="mb-4 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">
            Horarios disponibles
          </label>

          {!selection.date ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="font-medium text-gray-400">Selecciona una fecha para ver horarios</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-2xl bg-[var(--status-error-bg)] p-4 text-sm font-medium text-[var(--status-error)]">
              <AlertCircle className="h-4 w-4" />
              Error al cargar horarios. Intenta con otra fecha.
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="font-medium text-gray-400">
                No hay horarios disponibles para esta fecha.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => updateSelection({ time_slot: slot.time })}
                  className={`rounded-2xl border-2 py-4 text-sm font-black transition-all ${
                    selection.time_slot === slot.time
                      ? 'border-gray-900 bg-gray-900 text-white shadow-xl shadow-gray-200'
                      : !slot.available
                        ? 'cursor-not-allowed border-gray-50 bg-gray-50 decoration-slice text-gray-300'
                        : 'border-gray-50 bg-white text-gray-700 hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 flex justify-between">
        <div className="flex max-w-xs items-center gap-2 text-xs font-bold italic text-gray-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Sujeto a confirmación por parte de la clínica.
        </div>
        <button
          disabled={!isFormValid}
          onClick={() => setStep('confirm')}
          className="hover:shadow-[var(--primary)]/30 rounded-[1.5rem] bg-gray-900 px-10 py-5 font-black text-white shadow-2xl shadow-gray-200 transition-all hover:-translate-y-1 hover:bg-[var(--primary)] disabled:opacity-20"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
