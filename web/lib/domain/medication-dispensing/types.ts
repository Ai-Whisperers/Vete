import { z } from 'zod';

export const DispenseStatus = z.enum(['pending', 'dispensed', 'cancelled']);
export const DispenseType = z.enum(['initial', 'refill']);

export interface Dispense {
  id: string;
  prescription_id: string;
  medication_id: string;
  quantity: number;
  status: DispenseStatus;
  type: DispenseType;
  dispensed_at: Date | null;
  dispensed_by: string | null;
}

export interface CreateDispenseData {
  prescription_id: string;
  medication_id: string;
  quantity: number;
}

export interface UpdateDispenseData {
  status: DispenseStatus;
  dispensed_at: Date | null;
  dispensed_by: string | null;
}