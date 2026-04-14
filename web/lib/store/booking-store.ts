import { create } from 'zustand';
import { GroomingService, Groomer } from '@/lib/domain/grooming-appointments/types';

interface BookingState {
  // ...
  services: GroomingService[];
  groomers: Groomer[];
  // ...
}

const useBookingStore = create<BookingState>((set, get) => ({
  // ...
  services: [],
  groomers: [],
  // ...
  initialize: (
    clinic: ClinicData,
    userPets: Pet[],
    initialServiceIds?: string[],
    initialPetId?: string,
  ) => {
    // ...
    set({ services: clinic.groomingServices, groomers: clinic.groomers });
  },
  // ...
}));

### API Routes