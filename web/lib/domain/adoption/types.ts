import { z } from 'zod'

export const AdoptionStatus = z.enum(['pending', 'approved', 'rejected'])

export const AdoptionApplication = z.object({
  id: z.string(),
  tenantId: z.string(),
  petId: z.string(),
  ownerId: z.string(),
  applicantName: z.string(),
  applicantEmail: z.string(),
  applicantPhone: z.string(),
  applicationStatus: AdoptionStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type AdoptionApplication = z.infer<typeof AdoptionApplication>

export const CreateAdoptionApplicationData = z.object({
  petId: z.string(),
  applicantName: z.string(),
  applicantEmail: z.string(),
  applicantPhone: z.string(),
})

export type CreateAdoptionApplicationData = z.infer<typeof CreateAdoptionApplicationData>

#### Repository