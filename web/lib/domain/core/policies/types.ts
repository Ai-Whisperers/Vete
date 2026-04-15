import { z } from 'zod';

export const PolicyStatus = z.enum(['active', 'inactive', 'expired']);
export const PolicyType = z.enum(['health', 'liability', 'property']);

export type Policy = {
  id: string;
  tenantId: string;
  clientId: string;
  policyNumber: string;
  policyType: PolicyType;
  status: PolicyStatus;
  coverageDetails: string;
  renewalDate: Date | null;
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePolicyData = {
  clientId: string;
  policyNumber: string;
  policyType: PolicyType;
  coverageDetails: string;
  renewalDate: Date | null;
  documentUrl: string | null;
};

export type UpdatePolicyData = {
  policyNumber?: string;
  policyType?: PolicyType;
  coverageDetails?: string;
  renewalDate?: Date | null;
  documentUrl?: string | null;
};