"use client";

import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { useBookingStore, formatPrice } from '@/lib/store/booking-store';

/**
 * Step 1: Service selection component
 */
export function ServiceSelection() {
    const { services, updateSelection, setStep } = useBookingStore();

    const handleServiceSelect = (serviceId: string) => {
        updateSelection({ serviceId });
        setStep('pet');
    };

    return (
        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">¿Qué servicio necesitas?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.length > 0 ? (
                    services.map(s => (
                        <button
                            key={s.id}
                            onClick={() => handleServiceSelect(s.id)}
                            className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all text-left group flex items-start gap-4"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${s.color} transition-transform group-hover:scale-110`}>
                                <s.icon className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-gray-900 text-lg mb-1">{s.name}</h3>
                                <p className="text-sm text-gray-500 font-medium mb-2 opacity-60">
                                    Duración: {s.duration} min
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--primary)] font-black">
                                        Desde ₲{formatPrice(s.price)}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 group-hover:text-[var(--primary)] transition-all" />
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                        <Layers className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <p className="text-gray-500 mb-4 font-bold text-lg">
                            No hay servicios disponibles para reservar online.
                        </p>
                        <p className="text-gray-400 text-sm">
                            Comunícate directamente con la clínica para agendar tu cita.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
