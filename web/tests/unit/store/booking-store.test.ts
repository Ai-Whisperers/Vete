import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBookingStore } from '@/lib/store/booking-store';

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
    Syringe: () => null,
    Stethoscope: () => null,
    Scissors: () => null,
    UserCircle: () => null,
    Activity: () => null,
    Heart: () => null,
    Microscope: () => null,
    Sparkles: () => null,
    FileText: () => null,
    Building2: () => null,
    Leaf: () => null,
    PawPrint: () => null,
}));

// Mock the server action
vi.mock('@/app/actions/create-appointment', () => ({
    createAppointmentJson: vi.fn(),
}));

const mockClinic: any = {
    config: {
        id: 'adris',
        name: 'Adris Vet',
    },
    services: [
        {
            id: 'service-1',
            title: 'Consultation',
            booking: { online_enabled: true, duration_minutes: 30, price_from: '50000' },
        }
    ]
};

const mockPets: any[] = [
    { id: 'pet-1', name: 'Rex', species: 'dog', breed: 'German Shepherd' }
];

describe('useBookingStore', () => {
    beforeEach(() => {
        useBookingStore.getState().reset();
        vi.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const state = useBookingStore.getState();
        expect(state.step).toBe('service');
        expect(state.selection.serviceId).toBeNull();
        expect(state.isSubmitting).toBe(false);
    });

    it('should initialize with provided data', () => {
        useBookingStore.getState().initialize(mockClinic, mockPets);

        const state = useBookingStore.getState();
        expect(state.clinicId).toBe('adris');
        expect(state.pets).toHaveLength(1);
        expect(state.services).toHaveLength(1);
        // Since there is only 1 pet, it should be auto-selected
        expect(state.selection.petId).toBe('pet-1');
    });

    it('should update step', () => {
        useBookingStore.getState().setStep('pet');

        expect(useBookingStore.getState().step).toBe('pet');
    });

    it('should update selection', () => {
        useBookingStore.getState().updateSelection({ date: '2024-12-25' });

        expect(useBookingStore.getState().selection.date).toBe('2024-12-25');
    });

    it('should reset state', () => {
        useBookingStore.getState().setStep('confirm');
        useBookingStore.getState().reset();

        expect(useBookingStore.getState().step).toBe('service');
    });
});
