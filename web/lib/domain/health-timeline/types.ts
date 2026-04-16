import { z } from 'zod'

export const HealthTimelineEvent = z.object({
  id: z.string(),
  pet_id: z.string(),
  event_type: z.enum(['vaccination', 'medical_record', 'prescription']),
  event_date: z.date(),
  description: z.string().optional(),
})

export type HealthTimelineEvent = z.infer<typeof HealthTimelineEvent>

export const HealthTimelineFilter = z.object({
  pet_id: z.string(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
})

export type HealthTimelineFilter = z.infer<typeof HealthTimelineFilter>