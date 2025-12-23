"use client";

import React, { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useBookingStore, formatPrice } from '@/lib/store/booking-store';

/**
 * Step 4: Confirmation component
 */
export function Confirmation() {
    const { 
        selection, 
        services, 
        pets, 
        isSubmitting, 
        submitError, 
        updateSelection, 
        setStep, 
        submitBooking,
        clinicId
    } = useBookingStore();

    const currentService = useMemo(() => 
        services.find(s => s.id === selection.serviceId),
        [services, selection.serviceId]
    );

    const currentPet = useMemo(() => 
        pets.find(p => p.id === selection.petId),
        [pets, selection.petId]
    );

    const handleSubmit = async () => {
        await submitBooking(currentService?.name);
    };

    return (
        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => setStep('datetime')}
                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-black text-gray-900">Confirmación Final</h2>
            </div>

            {/* Summary Card */}
            <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 mb-8 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-10">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                Servicio
                            </p>
                            <p className="text-xl font-black text-gray-900">{currentService?.name}</p>
                            <p className="text-sm text-[var(--primary)] font-bold italic">
                                ₲{formatPrice(currentService?.price || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                Paciente
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                                    {currentPet?.name[0]}
                                </div>
                                <p className="text-xl font-black text-gray-900">{currentPet?.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                Fecha y Hora
                            </p>
                            <div className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[var(--primary)]" />
                                {selection.date}
                            </div>
                            <div className="text-xl font-black text-gray-900 flex items-center gap-2 mt-1">
                                <Clock className="w-5 h-5 text-[var(--primary)]" />
                                {selection.time_slot}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="mb-10">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    ¿Algún comentario adicional?
                </label>
                <textarea
                    className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] font-medium text-gray-700 focus:ring-4 focus:ring-[var(--primary)]/10 transition-all outline-none h-32"
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
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
                >
                    <div className="flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <p className="font-medium">{submitError}</p>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-12 py-6 bg-[var(--primary)] text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-[var(--primary)]/40 hover:scale-105 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                        <>
                            Confirmar Cita <ArrowRight className="w-6 h-6" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
