'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/store/booking-store'
import { PDFDownloadButton } from './PDFDownloadButton'

interface SuccessScreenProps {
  clinicId: string
  clinicName?: string
}

/**
 * Success screen component shown after successful booking
 * Supports multiple services with PDF ticket download
 */
export function SuccessScreen({ clinicId, clinicName }: SuccessScreenProps) {
  const router = useRouter()
  const { selection, pets, getSelectedServices, getEndTime, getTotalDuration, getTotalPrice } = useBookingStore()

  const selectedServices = getSelectedServices()
  const currentPet = pets.find((p) => p.id === selection.petId)
  const endTime = getEndTime()
  const totalDuration = getTotalDuration()
  const totalPrice = getTotalPrice()

  return (
    <div className="animate-in zoom-in-95 mx-auto mt-8 max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-2xl duration-500 sm:mt-20 sm:rounded-[3rem] sm:p-12">
      {/* Success Icon */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--status-success-bg)] text-[var(--status-success)] sm:mb-8 sm:h-24 sm:w-24">
        <Check className="relative z-10 h-10 w-10 sm:h-12 sm:w-12" />
        <div className="absolute inset-0 animate-ping rounded-full bg-[var(--status-success)] opacity-20"></div>
      </div>

      {/* Title */}
      <h2 className="mb-4 text-2xl font-black text-gray-900 sm:text-4xl">¡Todo listo!</h2>

      {/* Message */}
      <div className="mb-8 text-base leading-relaxed text-gray-500 sm:mb-10 sm:text-lg">
        <p>
          Tu {selectedServices.length > 1 ? 'citas' : 'cita'} para{' '}
          <span className="font-bold text-gray-900">{currentPet?.name}</span>{' '}
          {selectedServices.length > 1 ? 'han sido confirmadas' : 'ha sido confirmada'} para el{' '}
          <span className="font-bold text-gray-900">{selection.date}</span>.
        </p>

        {/* Time range */}
        <p className="mt-2">
          Horario:{' '}
          <span className="font-bold text-gray-900">
            {selection.time_slot}
            {endTime && ` - ${endTime}`}
          </span>
        </p>

        {/* Services list */}
        {selectedServices.length > 1 && (
          <div className="mx-auto mt-4 max-w-md rounded-2xl bg-gray-50 p-4 text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              Servicios reservados:
            </p>
            <ul className="space-y-1">
              {selectedServices.map((service, index) => (
                <li key={service.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  {service.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
        <button
          onClick={() => router.push(`/${clinicId}/portal/dashboard`)}
          className="min-h-[48px] rounded-2xl bg-gray-900 px-8 py-4 font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl sm:px-10 sm:py-5"
        >
          Volver al Inicio
        </button>
        <PDFDownloadButton
          clinicName={clinicName || clinicId}
          petName={currentPet?.name || 'Mascota'}
          date={selection.date}
          startTime={selection.time_slot}
          endTime={endTime || undefined}
          services={selectedServices.map((s) => ({
            name: s.name,
            duration: s.duration,
            price: s.price,
          }))}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          notes={selection.notes || undefined}
        />
      </div>
    </div>
  )
}
