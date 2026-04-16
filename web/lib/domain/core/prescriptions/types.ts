import { z } from 'zod';

export enum RefillStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const CreateRefillRequestData = z.object({
  prescriptionId: z.string(),
  petId: z.string(),
  quantity: z.number(),
  notes: z.string().optional(),
});

export const RefillRequest = z.object({
  id: z.string(),
  prescriptionId: z.string(),
  petId: z.string(),
  quantity: z.number(),
  status: z.nativeEnum(RefillStatus),
  requestedAt: z.date(),
  approvedAt: z.date().optional(),
  rejectedAt: z.date().optional(),
  notes: z.string().optional(),
});