'use client'

import React from 'react'
import { Layers, ArrowRight } from 'lucide-react'
import { useBookingStore, formatPrice } from '@/lib/store/booking-store'

/**
 * Step 1: Service selection component
 */
export function ServiceSelection() {
  const { services, updateSelection, setStep } = useBookingStore()

  const handleServiceSelect = (serviceId: string) => {
    updateSelection({ serviceId })
    setStep('pet')
  }

  return (
    <div className="animate-in slide-in-from-right-8 relative z-10 duration-500">
      <div className="mb-10 flex items-center gap-4">
        <div className="bg-[var(--primary)]/10 flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--primary)]">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">¿Qué servicio necesitas?</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {services.length > 0 ? (
          services.map((s) => (
            <button
              key={s.id}
              onClick={() => handleServiceSelect(s.id)}
              className="group flex items-start gap-4 rounded-[2rem] border border-gray-100 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-xl"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${s.color} transition-transform group-hover:scale-110`}
              >
                <s.icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-black text-gray-900">{s.name}</h3>
                <p className="mb-2 text-sm font-medium text-gray-500 opacity-60">
                  Duración: {s.duration} min
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-[var(--primary)]">
                    Desde ₲{formatPrice(s.price)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[var(--primary)]" />
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-2 rounded-[2.5rem] border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
            <Layers className="mx-auto mb-6 h-16 w-16 text-gray-200" />
            <p className="mb-4 text-lg font-bold text-gray-500">
              No hay servicios disponibles para reservar online.
            </p>
            <p className="text-sm text-gray-400">
              Comunícate directamente con la clínica para agendar tu cita.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
