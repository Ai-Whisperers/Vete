'use client'

import React, { useMemo } from 'react'
import { ShoppingBag, Zap } from 'lucide-react'
import { useBookingStore, formatPrice } from '@/lib/store/booking-store'

interface BookingSummaryProps {
  labels?: {
    summary?: string
    service?: string
    patient?: string
    schedule?: string
    notSelected?: string
    toDefine?: string
    estimatedTotal?: string
  }
}

/**
 * Sidebar summary component showing current booking selections
 * Displays selected service, pet, date/time, and total price
 */
export function BookingSummary({ labels = {} }: BookingSummaryProps) {
  const { selection, services, pets } = useBookingStore()

  const currentService = useMemo(
    () => services.find((s) => s.id === selection.serviceId),
    [services, selection.serviceId]
  )

  const currentPet = useMemo(
    () => pets.find((p) => p.id === selection.petId),
    [pets, selection.petId]
  )

  return (
    <aside className="animate-in slide-in-from-bottom-8 space-y-6 duration-700 lg:sticky lg:top-12">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-2xl">
        <h4 className="mb-6 flex items-center gap-3 font-black text-gray-900">
          <ShoppingBag className="h-5 w-5 text-[var(--primary)]" /> {labels.summary || 'Resumen'}
        </h4>

        <div className="space-y-6">
          {/* Service Summary */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              selection.serviceId
                ? 'bg-[var(--primary)]/5 border-[var(--primary)]/20'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              {labels.service || 'Servicio'}
            </p>
            {selection.serviceId ? (
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2">
                  <Zap className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <span className="font-bold text-gray-700">{currentService?.name}</span>
              </div>
            ) : (
              <span className="text-sm font-bold italic text-gray-400">
                {labels.notSelected || 'Sin seleccionar'}
              </span>
            )}
          </div>

          {/* Pet Summary */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              selection.petId
                ? 'border-gray-800 bg-gray-900 text-white'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <p
              className={`mb-2 text-[10px] font-black uppercase tracking-widest ${
                selection.petId ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              {labels.patient || 'Paciente'}
            </p>
            {selection.petId ? (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                  {currentPet?.name[0]}
                </div>
                <span className="font-bold">{currentPet?.name}</span>
              </div>
            ) : (
              <span className="text-sm font-bold italic text-gray-400">
                {labels.notSelected || 'Sin seleccionar'}
              </span>
            )}
          </div>

          {/* Date/Time Summary */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              selection.date ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              {labels.schedule || 'Horario'}
            </p>
            {selection.date && selection.time_slot ? (
              <div className="flex flex-col font-bold text-green-700">
                <span>{selection.date}</span>
                <span className="text-xs underline opacity-70">{selection.time_slot}</span>
              </div>
            ) : (
              <span className="text-sm font-bold italic text-gray-400">
                {labels.toDefine || 'Por definir'}
              </span>
            )}
          </div>
        </div>

        {/* Total Price */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="flex items-end justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
              {labels.estimatedTotal || 'Total Estimado'}
            </span>
            <span className="text-2xl font-black text-gray-900">
              ₲{formatPrice(currentService?.price || 0)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
