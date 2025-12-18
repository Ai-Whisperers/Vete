"use client";

import React from 'react';
import { Check, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BookableService, Pet, BookingSelection } from './types';

interface SuccessScreenProps {
    selection: BookingSelection;
    currentService?: BookableService;
    currentPet?: Pet;
    clinicId: string;
}

/**
 * Success screen component shown after successful booking
 */
export function SuccessScreen({
    selection,
    currentService,
    currentPet,
    clinicId
}: SuccessScreenProps) {
    const router = useRouter();

    return (
        <div className="max-w-2xl mx-auto mt-8 sm:mt-20 p-6 sm:p-12 bg-white rounded-2xl sm:rounded-[3rem] shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-500">
            {/* Success Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 text-green-600 relative">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 relative z-10" />
                <div className="absolute inset-0 bg-green-400 opacity-20 rounded-full animate-ping"></div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4">¡Todo listo!</h2>

            {/* Message */}
            <p className="text-gray-500 mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed">
                Tu cita para{' '}
                <span className="text-gray-900 font-bold">{currentPet?.name}</span> (
                {currentService?.name}) ha sido confirmada para el{' '}
                <span className="text-gray-900 font-bold">{selection.date}</span> a las{' '}
                <span className="text-gray-900 font-bold">{selection.time_slot}</span>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                    onClick={() => router.push(`/${clinicId}/portal/dashboard`)}
                    className="px-8 sm:px-10 py-4 sm:py-5 min-h-[48px] bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Volver al Inicio
                </button>
                <button className="px-8 sm:px-10 py-4 sm:py-5 min-h-[48px] bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Descargar Ticket
                </button>
            </div>
        </div>
    );
}
