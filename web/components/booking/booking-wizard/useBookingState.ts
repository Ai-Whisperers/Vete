"use client";

import { useState, useMemo } from 'react';
import {
    Syringe,
    Stethoscope,
    Scissors,
    UserCircle,
    Activity,
    Heart,
    Microscope,
    Sparkles,
    FileText,
    Building2,
    Leaf,
    PawPrint,
    type LucideIcon
} from 'lucide-react';
import type {
    Step,
    BookingSelection,
    ServiceFromJSON,
    BookableService,
    Pet,
    ClinicConfig
} from './types';

// Icon mapping from string names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
    Syringe,
    Stethoscope,
    Scissors,
    UserCircle,
    Activity,
    Heart,
    Microscope,
    Sparkles,
    FileText,
    Building2,
    Leaf,
    PawPrint,
};

// Color mapping by service category
const CATEGORY_COLORS: Record<string, string> = {
    clinical: 'bg-green-50 text-green-600',
    preventive: 'bg-blue-50 text-blue-600',
    specialty: 'bg-amber-50 text-amber-600',
    diagnostics: 'bg-purple-50 text-purple-600',
    surgery: 'bg-rose-50 text-rose-600',
    hospital: 'bg-red-50 text-red-600',
    holistic: 'bg-emerald-50 text-emerald-600',
    grooming: 'bg-pink-50 text-pink-600',
    luxury: 'bg-yellow-50 text-yellow-600',
    documents: 'bg-slate-50 text-slate-600',
};

/**
 * Parse price string (e.g., "50.000" or "50000") to number
 */
function parsePrice(priceStr: string | undefined): number {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/\./g, ''), 10) || 0;
}

/**
 * Extract services array from clinic data structure
 */
function extractServices(servicesData: any): ServiceFromJSON[] {
    if (!servicesData) return [];

    // If it's already an array, return it
    if (Array.isArray(servicesData)) return servicesData;

    // If it's the ServicesData structure with categories
    if (servicesData.categories && Array.isArray(servicesData.categories)) {
        return servicesData.categories.flatMap((cat: any) => cat.services || []);
    }

    return [];
}

/**
 * Transform JSON services to bookable services format
 */
function transformServices(jsonServices: ServiceFromJSON[]): BookableService[] {
    return jsonServices
        .filter(s => s.booking?.online_enabled === true)
        .map(s => ({
            id: s.id,
            name: s.title,
            icon: ICON_MAP[s.icon || ''] || PawPrint,
            duration: s.booking?.duration_minutes || 30,
            price: parsePrice(s.booking?.price_from),
            color: CATEGORY_COLORS[s.category || ''] || 'bg-gray-50 text-gray-600',
        }));
}

/**
 * Custom hook for managing booking wizard state
 */
export function useBookingState(
    clinic: ClinicConfig,
    userPets: Pet[],
    initialService?: string
) {
    const [step, setStep] = useState<Step>(initialService ? 'pet' : 'service');
    const [selection, setSelection] = useState<BookingSelection>({
        serviceId: initialService || null,
        petId: userPets.length === 1 ? userPets[0].id : null,
        date: '',
        time_slot: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Transform services once
    const services = useMemo<BookableService[]>(() => {
        const servicesList = extractServices(clinic.services);
        return transformServices(servicesList);
    }, [clinic.services]);

    // Get current service
    const currentService = useMemo(() =>
        services.find(s => s.id === selection.serviceId),
        [services, selection.serviceId]
    );

    // Get current pet
    const currentPet = useMemo(() =>
        userPets.find(p => p.id === selection.petId),
        [userPets, selection.petId]
    );

    // Update selection
    const updateSelection = (updates: Partial<BookingSelection>): void => {
        setSelection(prev => ({ ...prev, ...updates }));
    };

    // Submit booking
    const submitBooking = async (): Promise<boolean> => {
        // FORM-004: Prevent double-submit
        if (isSubmitting) return false;

        setIsSubmitting(true);
        setSubmitError(null);

        // FORM-004: Create AbortController for cancellation
        const controller = new AbortController();

        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clinic_slug: clinic.config.id,
                    ...selection
                }),
                signal: controller.signal
            });

            if (res.ok) {
                setStep('success');
                return true;
            } else {
                const err = await res.json();
                setSubmitError(err.error || 'No se pudo procesar la reserva');
                return false;
            }
        } catch (e) {
            // FORM-001: Proper error handling with user-friendly messages
            if (e instanceof Error && e.name === 'AbortError') {
                setSubmitError('Solicitud cancelada');
            } else {
                setSubmitError('Error de conexión con el servidor. Por favor intenta de nuevo.');
            }
            return false;
        } finally {
            // FORM-001: Always reset isSubmitting in finally block
            setIsSubmitting(false);
        }
    };

    return {
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
    };
}

/**
 * Format price number for display (e.g., 50000 -> "50.000")
 */
export function formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined) return '0';
    return price.toLocaleString('es-PY');
}

/**
 * Format date for input value (YYYY-MM-DD) using local timezone
 */
export function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
