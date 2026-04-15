import { z } from 'zod';

export const LostPetStatus = z.enum(['lost', 'found']);
export const LostPetReportType = z.enum(['owner', 'finder']);

export type LostPetReport = {
  id: string;
  pet_id: string;
  tenant_id: string;
  status: LostPetStatus;
  last_seen_location: string;
  last_seen_date: Date;
  finder_contact: string | null;
  finder_notes: string | null;
  notes: string;
  created_at: Date;
  resolved_at: Date | null;
  reported_by_user: {
    full_name: string;
  };
  resolved_by_user: {
    full_name: string;
  } | null;
};

export type CreateLostPetReportData = {
  pet_id: string;
  status: LostPetStatus;
  last_seen_location: string;
  last_seen_date: Date;
  finder_contact: string | null;
  finder_notes: string | null;
  notes: string;
};

export type UpdateLostPetReportData = {
  status: LostPetStatus;
  last_seen_location: string;
  last_seen_date: Date;
  finder_contact: string | null;
  finder_notes: string | null;
  notes: string;
};

#### Repository