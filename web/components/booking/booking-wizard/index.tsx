"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stethoscope, PawPrint, Calendar, CheckCircle } from 'lucide-react';
import { useBookingStore } from '@/lib/store/booking-store';
import { ServiceSelection } from './ServiceSelection';
import { PetSelection } from './PetSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { Confirmation } from './Confirmation';
import { SuccessScreen } from './SuccessScreen';
import { BookingSummary } from './BookingSummary';
import { ProgressStepper, type Step } from '@/components/ui/progress-stepper';
import type { ClinicConfig, User, Pet } from './types';

const STEP_ORDER = ['service', 'pet', 'datetime', 'confirm'] as const;

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
    const [queryClient] = useState(() => new QueryClient());
    
    const {
        step,
        setStep,
        selection,
        updateSelection,
        services,
        isSubmitting,
        submitError,
        submitBooking,
        initialize
    } = useBookingStore();

    // Initialize store with props on mount
    useEffect(() => {
        initialize(clinic, userPets, initialService);
    }, [clinic, userPets, initialService, initialize]);

    // Derived values from store
    const currentService = useMemo(() => 
        services.find(s => s.id === selection.serviceId),
        [services, selection.serviceId]
    );

    const currentPet = useMemo(() => 
        userPets.find(p => p.id === selection.petId),
        [userPets, selection.petId]
    );

    // Generate step configuration with labels from config
    const BOOKING_STEPS: Step[] = useMemo(() => [
        {
            id: 'service',
            label: 'Servicio',
            description: clinic.config.ui_labels?.booking?.select_service || 'Elige el servicio',
            icon: <Stethoscope className="w-4 h-4" />
        },
        {
            id: 'pet',
            label: 'Paciente',
            description: clinic.config.ui_labels?.booking?.select_pet || 'Selecciona tu mascota',
            icon: <PawPrint className="w-4 h-4" />
        },
        {
            id: 'datetime',
            label: 'Fecha',
            description: clinic.config.ui_labels?.booking?.select_date || 'Elige horario',
            icon: <Calendar className="w-4 h-4" />
        },
        {
            id: 'confirm',
            label: clinic.config.ui_labels?.common?.actions?.confirm || 'Confirmar',
            description: 'Revisa y confirma',
            icon: <CheckCircle className="w-4 h-4" />
        },
    ], [clinic.config.ui_labels]);

    // Calculate current step index for progress stepper
    const currentStepIndex = useMemo(() => {
        return STEP_ORDER.indexOf(step as typeof STEP_ORDER[number]);
    }, [step]);

    // Handle step navigation from progress stepper clicks
    const handleStepClick = (stepIndex: number): void => {
        const targetStep = STEP_ORDER[stepIndex];
        if (targetStep) {
            setStep(targetStep);
        }
    };

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
        <QueryClientProvider client={queryClient}>
            <div className="max-w-6xl mx-auto py-12 px-4">
                {/* Progress Stepper */}
                <div className="mb-8 sm:mb-12 max-w-3xl mx-auto">
                    <ProgressStepper
                        steps={BOOKING_STEPS}
                        currentStep={currentStepIndex}
                        variant="default"
                        onStepClick={handleStepClick}
                        className="px-4"
                    />
                </div>

                <div className="grid lg:grid-cols-[1fr_350px] gap-12 items-start">
                    {/* Main Content Area */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-white/50 overflow-hidden min-h-[500px] p-8 md:p-12 relative">
                        {/* Background Decorations */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>

                        {/* Step 1: Service Selection */}
                        {step === 'service' && (
                            <ServiceSelection />
                        )}

                        {/* Step 2: Pet Selection */}
                        {step === 'pet' && (
                            <PetSelection />
                        )}

                        {/* Step 3: Date & Time Selection */}
                        {step === 'datetime' && (
                            <DateTimeSelection
                                clinicName={clinic.config.name}
                            />
                        )}

                        {/* Step 4: Confirmation */}
                        {step === 'confirm' && (
                            <Confirmation />
                        )}
                    </div>

                    {/* Sidebar Summary */}
                    <BookingSummary
                        labels={{
                            summary: 'Resumen',
                            service: 'Servicio',
                            patient: 'Paciente',
                            schedule: 'Horario',
                            notSelected: 'Sin seleccionar',
                            toDefine: 'Por definir',
                            estimatedTotal: 'Total Estimado',
                        }}
                    />
                </div>
            </div>
        </QueryClientProvider>
    );
}
