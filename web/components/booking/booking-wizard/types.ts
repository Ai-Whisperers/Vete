import { type LucideIcon } from 'lucide-react';

/**
 * Service data from JSON configuration
 */
export interface ServiceFromJSON {
    id: string;
    title: string;
    category?: string;
    icon?: string;
    description?: string;
    booking?: {
        online_enabled?: boolean;
        duration_minutes?: number;
        price_from?: string;
    };
    variants?: Array<{
        name: string;
        price: string;
        duration?: string;
    }>;
}

/**
 * Transformed service ready for booking
 */
export interface BookableService {
    id: string;
    name: string;
    icon: LucideIcon;
    duration: number;
    price: number;
    color: string;
}

/**
 * Pet entity
 */
export interface Pet {
    id: string;
    name: string;
    species: string;
    breed: string;
}

/**
 * Clinic configuration (flexible to accept ClinicData)
 */
export interface ClinicConfig {
    config: {
        id: string;
        name: string;
    };
    services?: ServiceFromJSON[] | {
        hero?: any;
        categories?: Array<{
            services?: ServiceFromJSON[];
        }>;
        pricing?: any;
    };
}

/**
 * User entity
 */
export interface User {
    id: string;
    email: string;
}

/**
 * Booking wizard step
 */
export type Step = 'service' | 'pet' | 'datetime' | 'confirm' | 'success';

/**
 * Booking selection state
 */
export interface BookingSelection {
    serviceId: string | null;
    petId: string | null;
    date: string;
    time_slot: string;
    notes: string;
}

/**
 * Progress percentage by step
 */
export const PROGRESS: Record<Step, number> = {
    'service': 25,
    'pet': 50,
    'datetime': 75,
    'confirm': 90,
    'success': 100
};

/**
 * Available time slots
 */
export const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
] as const;
