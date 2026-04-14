import { z } from 'zod';

export const FeatureName = z.enum([
  'APPOINTMENTS',
  'MEDICAL_RECORDS',
  'VACCINE_TRACKING',
  'CLINICAL_TOOLS',
  'ECOMMERCE',
  // Add more features as needed
]);

export type FeatureName = z.infer<typeof FeatureName>;

export interface FeatureFlag {
  feature: FeatureName;
  enabled: boolean;
}

export interface TenantFeatureFlags {
  tenantId: string;
  featureFlags: FeatureFlag[];
}