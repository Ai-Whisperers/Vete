import { create } from 'zustand';
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
} from '@/components/booking/booking-wizard/types';

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

function parsePrice(priceStr: string | undefined): number {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/\./g, ''), 10) || 0;
}

function extractServices(servicesData: any): ServiceFromJSON[] {
    if (!servicesData) return [];
    if (Array.isArray(servicesData)) return servicesData;
    if (servicesData.categories && Array.isArray(servicesData.categories)) {
        return servicesData.categories.flatMap((cat: any) => cat.services || []);
    }
    return [];
}

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

interface BookingState {
    // State
    clinicId: string;
    pets: Pet[];
    step: Step;
    selection: BookingSelection;
    isSubmitting: boolean;
    submitError: string | null;
    
    // Computed/Derived (cached in store for convenience)
    services: BookableService[];
    
    // Actions
    setStep: (step: Step) => void;
    updateSelection: (updates: Partial<BookingSelection>) => void;
    initialize: (clinic: ClinicConfig, userPets: Pet[], initialService?: string) => void;
    submitBooking: (currentServiceName?: string) => Promise<boolean>;
    reset: () => void;
}

const initialSelection: BookingSelection = {
    serviceId: null,
    petId: null,
    date: '',
    time_slot: '',
    notes: ''
};

export const useBookingStore = create<BookingState>((set, get) => ({
    clinicId: '',
    pets: [],
    step: 'service',
    selection: initialSelection,
    isSubmitting: false,
    submitError: null,
    services: [],

    setStep: (step) => set({ step }),
    
    updateSelection: (updates) => set((state) => ({
        selection: { ...state.selection, ...updates }
    })),

    initialize: (clinic, userPets, initialService) => {
        const servicesList = extractServices(clinic.services);
        const transformed = transformServices(servicesList);
        
        set({
            clinicId: clinic.config.id,
            pets: userPets,
            services: transformed,
            step: initialService ? 'pet' : 'service',
            selection: {
                ...initialSelection,
                serviceId: initialService || null,
                petId: userPets.length === 1 ? userPets[0].id : null,
            }
        });
    },

    submitBooking: async (currentServiceName) => {
        const { isSubmitting, selection, clinicId } = get();
        if (isSubmitting) return false;

        set({ isSubmitting: true, submitError: null });

        try {
            const startDateTime = new Date(`${selection.date}T${selection.time_slot}`);
            const input = {
                clinic: clinicId,
                pet_id: selection.petId,
                start_time: startDateTime.toISOString(),
                reason: currentServiceName || 'Consulta General',
                notes: selection.notes || null
            };

            const { createAppointmentJson } = await import('@/app/actions/create-appointment');
            const result = await createAppointmentJson(input);

            if (result.success) {
                set({ step: 'success' });
                return true;
            } else {
                set({ submitError: result.error || 'No se pudo procesar la reserva' });
                return false;
            }
        } catch (e) {
            console.error(e);
            set({ submitError: 'Error de conexión con el servidor. Por favor intenta de nuevo.' });
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },

    reset: () => set({
        clinicId: '',
        pets: [],
        step: 'service',
        selection: initialSelection,
        isSubmitting: false,
        submitError: null,
        services: []
    })
}));

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
