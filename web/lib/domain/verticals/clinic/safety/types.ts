import { z } from 'zod';

export const LostPetStatus = z.enum(['lost', 'found', 'reunited']);
export const MatchStatus = z.enum(['pending', 'confirmed', 'rejected']);
export const DiseaseOutcome = z.enum(['recovered', 'deceased', 'unknown']);
export const DiseaseSeverity = z.enum(['mild', 'moderate', 'severe']);

export interface LostPet {
  id: string;
  pet_id: string;
  owner_id: string;
  status: LostPetStatus;
  location: string;
  description: string;
  created_at: Date;
}

export interface PetSighting {
  id: string;
  lost_pet_id: string;
  location: string;
  photo_url: string | null;
  description: string;
  created_at: Date;
}

export interface MatchReason {
  id: string;
  lost_pet_id: string;
  pet_sighting_id: string;
  reason: string;
  created_at: Date;
}

export interface PetMatchSuggestion {
  id: string;
  lost_pet_id: string;
  pet_sighting_id: string;
  confidence: number;
  created_at: Date;
}

export interface DiseaseReport {
  id: string;
  pet_id: string;
  disease: string;
  outcome: DiseaseOutcome;
  severity: DiseaseSeverity;
  created_at: Date;
}

export interface DiseaseAlert {
  id: string;
  disease: string;
  location: string;
  created_at: Date;
}

export interface ReportLostPetInput {
  pet_id: string;
  location: string;
  description: string;
}

export interface UpdateLostPetInput {
  id: string;
  status: LostPetStatus;
  location: string;
  description: string;
}

export interface ReportSightingInput {
  lost_pet_id: string;
  location: string;
  photo_url: string | null;
  description: string;
}

export interface ReviewMatchInput {
  match_id: string;
  decision: MatchStatus;
}

export interface CreateDiseaseReportInput {
  pet_id: string;
  disease: string;
  outcome: DiseaseOutcome;
  severity: DiseaseSeverity;
}

export interface LostPetFilters {
  status?: LostPetStatus;
  location?: string;
}

export interface DiseaseReportFilters {
  disease?: string;
  outcome?: DiseaseOutcome;
  severity?: DiseaseSeverity;
}

export interface ZoneStats {
  lost_pets: number;
  found_pets: number;
  disease_reports: number;
}

#### Repository