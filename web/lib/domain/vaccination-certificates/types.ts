import { z } from 'zod';

export const VaccinationCertificate = z.object({
  id: z.string(),
  petId: z.string(),
  vaccineId: z.string(),
  issuedAt: z.date(),
  expiresAt: z.date().nullish(),
  certificateNumber: z.string(),
  qrCode: z.string(),
});

export type VaccinationCertificate = z.infer<typeof VaccinationCertificate>;

export const CreateVaccinationCertificateData = z.object({
  petId: z.string(),
  vaccineId: z.string(),
  issuedAt: z.date(),
  expiresAt: z.date().nullish(),
  certificateNumber: z.string(),
});

export type CreateVaccinationCertificateData = z.infer<typeof CreateVaccinationCertificateData>;

#### Repository