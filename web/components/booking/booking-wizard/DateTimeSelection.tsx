"use client";

import React from 'react';
import { ArrowLeft, Info, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { checkAvailableSlots } from '@/app/actions/appointments';
import { useBookingStore, getLocalDateString } from '@/lib/store/booking-store';

interface DateTimeSelectionProps {
    clinicName: string;
}

/**
 * Step 3: Date and time selection component
 */
export function DateTimeSelection({
    clinicName
}: DateTimeSelectionProps) {
    const { selection, clinicId, updateSelection, setStep } = useBookingStore();
    const isFormValid = selection.date && selection.time_slot;

    // Fetch available slots when date is selected
    const { data: slots = [], isLoading, error } = useQuery({
        queryKey: ['slots', clinicId, selection.date],
        queryFn: async () => {
            if (!selection.date) return [];
            const result = await checkAvailableSlots({
                clinicSlug: clinicId,
                date: selection.date,
            });
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            return result.data || [];
        },
        enabled: !!selection.date && !!clinicId
    });

    return (
        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => setStep('pet')}
                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-black text-gray-900">Agenda tu visita</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Date Selection */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                        Selecciona el día
                    </label>
                    <input
                        type="date"
                        className="w-full p-5 bg-gray-50 border-none rounded-3xl font-black text-gray-700 focus:ring-4 focus:ring-[var(--primary)]/20 transition-all outline-none text-lg"
                        min={getLocalDateString(new Date())}
                        value={selection.date}
                        onChange={(e) => {
                            updateSelection({ date: e.target.value, time_slot: '' }); // Reset time when date changes
                        }}
                    />
                    <div className="mt-6 p-6 bg-[var(--primary)]/5 rounded-3xl border border-[var(--primary)]/10">
                        <p className="text-sm text-[var(--primary)] font-bold flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Reservando en {clinicName}
                        </p>
                    </div>
                </div>

                {/* Time Selection */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                        Horarios disponibles
                    </label>
                    
                    {!selection.date ? (
                        <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">Selecciona una fecha para ver horarios</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Error al cargar horarios. Intenta con otra fecha.
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No hay horarios disponibles para esta fecha.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {slots.map(slot => (
                                <button
                                    key={slot.time}
                                    disabled={!slot.available}
                                    onClick={() => updateSelection({ time_slot: slot.time })}
                                    className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                                        selection.time_slot === slot.time
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200'
                                            : !slot.available
                                                ? 'bg-gray-50 text-gray-300 border-gray-50 cursor-not-allowed decoration-slice'
                                                : 'bg-white text-gray-700 border-gray-50 hover:border-gray-200 hover:shadow-md'
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
                <div className="text-xs text-gray-400 font-bold max-w-xs flex items-center gap-2 italic">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Sujeto a confirmación por parte de la clínica.
                </div>
                <button
                    disabled={!isFormValid}
                    onClick={() => setStep('confirm')}
                    className="px-10 py-5 bg-gray-900 text-white font-black rounded-[1.5rem] shadow-2xl shadow-gray-200 hover:bg-[var(--primary)] hover:shadow-[var(--primary)]/30 hover:-translate-y-1 transition-all disabled:opacity-20"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}
