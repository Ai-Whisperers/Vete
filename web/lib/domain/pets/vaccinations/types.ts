import { z } from 'zod';

export const VaccinationStatus = z.enum(['due', 'overdue', 'completed']);
export const VaccinationType = z.enum(['rabies', 'distemper', 'parvovirus']);

export type Vaccination = {
  id: string;
  pet_id: string;
  type: VaccinationType;
  due_date: Date;
  status: VaccinationStatus;
  completed_at: Date | null;
};

export type CreateVaccinationData = {
  pet_id: string;
  type: VaccinationType;
  due_date: Date;
};

export type UpdateVaccinationData = {
  status: VaccinationStatus;
  completed_at: Date | null;
};

export type VaccinationFilters = {
  pet_id?: string;
  status?: VaccinationStatus;
};

#### Repository