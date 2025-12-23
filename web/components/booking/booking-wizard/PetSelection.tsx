"use client";

import React from 'react';
import { ArrowLeft, ChevronRight, Dog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store/booking-store';

/**
 * Step 2: Pet selection component
 */
export function PetSelection() {
    const router = useRouter();
    const { pets, clinicId, updateSelection, setStep } = useBookingStore();

    const handlePetSelect = (petId: string) => {
        updateSelection({ petId });
        setStep('datetime');
    };

    return (
        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => setStep('service')}
                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-black text-gray-900">¿Para quién es la cita?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.length > 0 ? (
                    pets.map(p => (
                        <button
                            key={p.id}
                            onClick={() => handlePetSelect(p.id)}
                            className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all text-left group flex items-center gap-5"
                        >
                            <div className="w-16 h-16 bg-[var(--primary)] text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-[var(--primary)]/20">
                                {p.name[0]}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-gray-900 text-xl mb-1">{p.name}</h3>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                                    {p.species} • {p.breed}
                                </p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                        </button>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                        <Dog className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <p className="text-gray-500 mb-8 font-bold text-lg">
                            No tienes mascotas registradas.
                        </p>
                        <button
                            onClick={() => router.push(`/${clinicId}/portal/pets/new`)}
                            className="px-8 py-4 bg-[var(--primary)] text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                        >
                            + Registrar Mascota
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
