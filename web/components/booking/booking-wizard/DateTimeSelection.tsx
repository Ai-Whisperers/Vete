"use client";

import React from 'react';
import { ArrowLeft, Info, AlertCircle } from 'lucide-react';
import type { BookingSelection } from './types';
import { TIME_SLOTS } from './types';
import { getLocalDateString } from './useBookingState';

interface DateTimeSelectionProps {
    selection: BookingSelection;
    clinicName: string;
    onUpdate: (updates: Partial<BookingSelection>) => void;
    onBack: () => void;
    onContinue: () => void;
}

/**
 * Step 3: Date and time selection component
 */
export function DateTimeSelection({
    selection,
    clinicName,
    onUpdate,
    onBack,
    onContinue
}: DateTimeSelectionProps) {
    const isFormValid = selection.date && selection.time_slot;

    return (
        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={onBack}
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
                        onChange={(e) => onUpdate({ date: e.target.value })}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {TIME_SLOTS.map(t => (
                            <button
                                key={t}
                                disabled={!selection.date}
                                onClick={() => onUpdate({ time_slot: t })}
                                className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                                    selection.time_slot === t
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200'
                                        : 'bg-white text-gray-700 border-gray-50 hover:border-gray-200 disabled:opacity-30'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
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
                    onClick={onContinue}
                    className="px-10 py-5 bg-gray-900 text-white font-black rounded-[1.5rem] shadow-2xl shadow-gray-200 hover:bg-[var(--primary)] hover:shadow-[var(--primary)]/30 hover:-translate-y-1 transition-all disabled:opacity-20"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}
