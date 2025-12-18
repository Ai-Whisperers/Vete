"use client";

import React from 'react';
import { ShoppingBag, Zap, Calendar } from 'lucide-react';
import { formatPrice } from './useBookingState';
import type { BookingSelection, BookableService, Pet } from './types';

interface BookingSummaryProps {
    selection: BookingSelection;
    currentService: BookableService | undefined;
    currentPet: Pet | undefined;
    labels?: {
        summary?: string;
        service?: string;
        patient?: string;
        schedule?: string;
        notSelected?: string;
        toDefine?: string;
        estimatedTotal?: string;
    };
}

/**
 * Sidebar summary component showing current booking selections
 * Displays selected service, pet, date/time, and total price
 */
export function BookingSummary({
    selection,
    currentService,
    currentPet,
    labels = {}
}: BookingSummaryProps) {
    return (
        <aside className="lg:sticky lg:top-12 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
                <h4 className="font-black text-gray-900 mb-6 flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-[var(--primary)]" /> {labels.summary || 'Resumen'}
                </h4>

                <div className="space-y-6">
                    {/* Service Summary */}
                    <div
                        className={`p-4 rounded-2xl border transition-all ${
                            selection.serviceId
                                ? 'bg-[var(--primary)]/5 border-[var(--primary)]/20'
                                : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            {labels.service || 'Servicio'}
                        </p>
                        {selection.serviceId ? (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg">
                                    <Zap className="w-4 h-4 text-[var(--primary)]" />
                                </div>
                                <span className="font-bold text-gray-700">
                                    {currentService?.name}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm italic text-gray-400 font-bold">
                                {labels.notSelected || 'Sin seleccionar'}
                            </span>
                        )}
                    </div>

                    {/* Pet Summary */}
                    <div
                        className={`p-4 rounded-2xl border transition-all ${
                            selection.petId
                                ? 'bg-gray-900 text-white border-gray-800'
                                : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                        <p
                            className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                                selection.petId ? 'text-gray-500' : 'text-gray-400'
                            }`}
                        >
                            {labels.patient || 'Paciente'}
                        </p>
                        {selection.petId ? (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-xs">
                                    {currentPet?.name[0]}
                                </div>
                                <span className="font-bold">{currentPet?.name}</span>
                            </div>
                        ) : (
                            <span className="text-sm italic text-gray-400 font-bold">
                                {labels.notSelected || 'Sin seleccionar'}
                            </span>
                        )}
                    </div>

                    {/* Date/Time Summary */}
                    <div
                        className={`p-4 rounded-2xl border transition-all ${
                            selection.date
                                ? 'bg-green-50 border-green-100'
                                : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            {labels.schedule || 'Horario'}
                        </p>
                        {selection.date && selection.time_slot ? (
                            <div className="font-bold text-green-700 flex flex-col">
                                <span>{selection.date}</span>
                                <span className="text-xs opacity-70 underline">
                                    {selection.time_slot}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm italic text-gray-400 font-bold">
                                {labels.toDefine || 'Por definir'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Total Price */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {labels.estimatedTotal || 'Total Estimado'}
                        </span>
                        <span className="text-2xl font-black text-gray-900">
                            ₲{formatPrice(currentService?.price || 0)}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
