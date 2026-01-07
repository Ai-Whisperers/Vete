'use client'

import React, { useMemo } from 'react'
import { ArrowLeft, ArrowRight, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useBookingStore, formatPrice } from '@/lib/store/booking-store'

/**
 * Step 4: Confirmation component - supports multiple services
 */
export function Confirmation() {
  const {
    selection,
    pets,
    isSubmitting,
    submitError,
    updateSelection,
    setStep,
    submitBooking,
    getSelectedServices,
    getTotalDuration,
    getTotalPrice,
    getEndTime,
  } = useBookingStore()

  const selectedServices = getSelectedServices()
  const totalDuration = getTotalDuration()
  const totalPrice = getTotalPrice()
  const endTime = getEndTime()

  const currentPet = useMemo(
    () => pets.find((p) => p.id === selection.petId),
    [pets, selection.petId]
  )

  const handleSubmit = async () => {
    await submitBooking()
  }

  return (
    <div className="animate-in slide-in-from-right-8 relative z-10 duration-500">
      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={() => setStep('datetime')}
          className="rounded-2xl bg-gray-50 p-3 text-gray-400 transition-all hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-3xl font-black text-gray-900">Confirmación Final</h2>
      </div>

      {/* Summary Card */}
      <div className="mb-8 rounded-[3rem] border border-gray-100 bg-gray-50/50 p-10 backdrop-blur-sm">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Left Column - Services */}
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                {selectedServices.length > 1 ? 'Servicios' : 'Servicio'}
              </p>
              <div className="space-y-3">
                {selectedServices.map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
                        {index + 1}
                      </span>
                      <p className="font-bold text-gray-900">{service.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{service.duration} min</p>
                      <p className="text-sm font-bold text-[var(--primary)]">
                        ₲{formatPrice(service.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedServices.length > 1 && (
                <div className="mt-4 border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-gray-700">Total</span>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{totalDuration} min</p>
                      <p className="text-lg text-[var(--primary)]">₲{formatPrice(totalPrice)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patient */}
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Paciente
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
                  {currentPet?.name[0]}
                </div>
                <p className="text-xl font-black text-gray-900">{currentPet?.name}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Date/Time */}
          <div className="space-y-6">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Fecha y Hora
              </p>
              <div className="flex items-center gap-2 text-xl font-black text-gray-900">
                <Calendar className="h-5 w-5 text-[var(--primary)]" />
                {selection.date}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xl font-black text-gray-900">
                <Clock className="h-5 w-5 text-[var(--primary)]" />
                {selection.time_slot}
                {endTime && <span className="text-gray-400">- {endTime}</span>}
              </div>
              <p className="mt-2 text-sm text-gray-500">Duración total: {totalDuration} minutos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mb-10">
        <label className="mb-3 block text-xs font-black uppercase tracking-widest text-gray-400">
          ¿Algún comentario adicional?
        </label>
        <textarea
          className="focus:ring-[var(--primary)]/10 h-32 w-full rounded-[2rem] border border-gray-100 bg-white p-6 font-medium text-gray-700 outline-none transition-all focus:ring-4"
          placeholder="Ej: Mi mascota está un poco nerviosa..."
          value={selection.notes}
          onChange={(e) => updateSelection({ notes: e.target.value })}
        ></textarea>
      </div>

      {/* Error Display */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 rounded-2xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-4"
        >
          <div className="flex items-center gap-3 text-[var(--status-error-text)]">
            <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <p className="font-medium">{submitError}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="shadow-[var(--primary)]/40 flex items-center gap-4 rounded-[2rem] bg-[var(--primary)] px-12 py-6 text-xl font-black text-white shadow-2xl transition-all hover:scale-105 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Confirmar {selectedServices.length > 1 ? 'Citas' : 'Cita'}{' '}
              <ArrowRight className="h-6 w-6" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
