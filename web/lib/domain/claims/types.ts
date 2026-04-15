import { z } from 'zod';

export const ClaimStatus = z.enum(['pending', 'approved', 'rejected']);
export const ClaimType = z.enum(['treatment', 'surgery', 'preventive', 'emergency']);

export interface Claim {
  id: string;
  tenantId: string;
  policyId: string;
  petId: string;
  claimNumber: string;
  claimType: ClaimType;
  dateOfService: Date;
  diagnosis: string;
  diagnosisCode: string;
  treatmentDescription: string;
  status: ClaimStatus;
}

export interface CreateClaimData {
  policyId: string;
  petId: string;
  claimType: ClaimType;
  dateOfService: Date;
  diagnosis: string;
  diagnosisCode: string;
  treatmentDescription: string;
}

export interface UpdateClaimData {
  status: ClaimStatus;
}