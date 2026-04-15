import { z } from 'zod';

export enum SurgeryType {
  ELECTIVE = 'elective',
  EMERGENCY = 'emergency',
}

export enum SurgeryStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export interface Surgery {
  id: string;
  tenantId: string;
  type: SurgeryType;
  status: SurgeryStatus;
  surgeonId: string;
  roomId: string;
  equipmentNeeds: string[];
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  actualStartTime: Date | null;
  actualEndTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSurgeryData {
  type: SurgeryType;
  surgeonId: string;
  roomId: string;
  equipmentNeeds: string[];
  scheduledStartTime: Date;
  scheduledEndTime: Date;
}

export interface UpdateSurgeryData {
  type?: SurgeryType;
  surgeonId?: string;
  roomId?: string;
  equipmentNeeds?: string[];
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
}

export const surgerySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: z.nativeEnum(SurgeryType),
  status: z.nativeEnum(SurgeryStatus),
  surgeonId: z.string(),
  roomId: z.string(),
  equipmentNeeds: z.array(z.string()),
  scheduledStartTime: z.date(),
  scheduledEndTime: z.date(),
  actualStartTime: z.date().nullish(),
  actualEndTime: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createSurgerySchema = z.object({
  type: z.nativeEnum(SurgeryType),
  surgeonId: z.string(),
  roomId: z.string(),
  equipmentNeeds: z.array(z.string()),
  scheduledStartTime: z.date(),
  scheduledEndTime: z.date(),
});

export const updateSurgerySchema = z.object({
  type: z.nativeEnum(SurgeryType).optional(),
  surgeonId: z.string().optional(),
  roomId: z.string().optional(),
  equipmentNeeds: z.array(z.string()).optional(),
  scheduledStartTime: z.date().optional(),
  scheduledEndTime: z.date().optional(),
});