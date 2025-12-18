"use client";

import React from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { useBookingState, formatPrice } from './useBookingState';
import { ServiceSelection } from './ServiceSelection';
import { PetSelection } from './PetSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { Confirmation } from './Confirmation';
import { SuccessScreen } from './SuccessScreen';
import type { ClinicConfig, User, Pet } from './types';
import { PROGRESS } from './types';

interface BookingWizardProps {
    clinic: ClinicConfig | any; // Allow ClinicData from getClinicData
    user: User | any; // Allow Supabase User
    userPets: Pet[];
    initialService?: string;
}

/**
 * Main booking wizard orchestrator component
 * Manages the multi-step booking flow
 */
export default function BookingWizard({
    clinic,
    user,
    userPets,
    initialService
}: BookingWizardProps) {
    const {
        step,
        setStep,
        selection,
        updateSelection,
        services,
        currentService,
        currentPet,
        isSubmitting,
        submitError,
        submitBooking,
    } = useBookingState(clinic, userPets, initialService);

    // Show success screen after booking
    if (step === 'success') {
        return (
            <SuccessScreen
                selection={selection}
                currentService={currentService}
                currentPet={currentPet}
                clinicId={clinic.config.id}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            {/* Progress Bar */}
            <div className="mb-8 sm:mb-12 max-w-2xl mx-auto">
                <div className="flex justify-between text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 px-1">
                    <span>Servicio</span>
                    <span>Paciente</span>
                    <span>Fecha</span>
                    <span>Confirmar</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-700 ease-out"
                        style={{ width: `${PROGRESS[step]}%` }}
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-12 items-start">
                {/* Main Content Area */}
                <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-white/50 overflow-hidden min-h-[500px] p-8 md:p-12 relative">
                    {/* Background Decorations */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>

                    {/* Step 1: Service Selection */}
                    {step === 'service' && (
                        <ServiceSelection
                            services={services}
                            selection={selection}
                            onServiceSelect={(serviceId) => {
                                updateSelection({ serviceId });
                                setStep('pet');
                            }}
                        />
                    )}

                    {/* Step 2: Pet Selection */}
                    {step === 'pet' && (
                        <PetSelection
                            pets={userPets}
                            selection={selection}
                            clinicId={clinic.config.id}
                            onPetSelect={(petId) => {
                                updateSelection({ petId });
                                setStep('datetime');
                            }}
                            onBack={() => setStep('service')}
                        />
                    )}

                    {/* Step 3: Date & Time Selection */}
                    {step === 'datetime' && (
                        <DateTimeSelection
                            selection={selection}
                            clinicName={clinic.config.name}
                            onUpdate={updateSelection}
                            onBack={() => setStep('pet')}
                            onContinue={() => setStep('confirm')}
                        />
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 'confirm' && (
                        <Confirmation
                            selection={selection}
                            currentService={currentService}
                            currentPet={currentPet}
                            isSubmitting={isSubmitting}
                            submitError={submitError}
                            onUpdate={updateSelection}
                            onBack={() => setStep('datetime')}
                            onSubmit={submitBooking}
                        />
                    )}
                </div>

                {/* Sidebar Summary */}
                <aside className="lg:sticky lg:top-12 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
                        <h4 className="font-black text-gray-900 mb-6 flex items-center gap-3">
                            <ShoppingBag className="w-5 h-5 text-[var(--primary)]" /> Resumen
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
                                    Servicio
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
                                        Sin seleccionar
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
                                    Paciente
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
                                        Sin seleccionar
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
                                    Horario
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
                                        Por definir
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Total Price */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Total Estimado
                                </span>
                                <span className="text-2xl font-black text-gray-900">
                                    ₲{formatPrice(currentService?.price || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
