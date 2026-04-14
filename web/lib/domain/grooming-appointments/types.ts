import { z } from 'zod';

export type GroomingAppointmentStatus = 'scheduled' | 'checked-in' | 'completed' | 'cancelled';

export interface GroomingAppointment {
  id: string;
  petId: string;
  groomingServiceId: string;
  startTime: Date;
  endTime: Date;
  status: GroomingAppointmentStatus;
  groomerId: string | null;
  notes: string | null;
}

export interface CreateGroomingAppointmentData {
  petId: string;
  groomingServiceId: string;
  startTime: Date;
  endTime: Date;
  groomerId: string | null;
  notes: string | null;
}

export interface UpdateGroomingAppointmentData {
  status: GroomingAppointmentStatus;
  notes: string | null;
}

export interface GroomingAppointmentFilters {
  petId: string | null;
  groomingServiceId: string | null;
  status: GroomingAppointmentStatus | null;
}

export interface GroomingService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface Groomer {
  id: string;
  name: string;
  phoneNumber: string;
}

#### Repository