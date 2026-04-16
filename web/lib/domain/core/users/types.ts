import { z } from 'zod'

export const DeleteUserData = z.object({
  userId: z.string(),
  tenantId: z.string(),
})

export const DeletionRequest = z.object({
  id: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  requestedAt: z.date(),
  confirmedAt: z.date().nullish(),
  gracePeriodExpiresAt: z.date().nullish(),
})

export const DeletionStatus = z.enum(['pending', 'confirmed', 'cancelled', 'completed'])

#### Repository