import { z } from 'zod'

export const CompletionTracking = z.object({
  id: z.string(),
  treatment_sheet_id: z.string(),
  task_id: z.string(),
  completed_at: z.date(),
})

export type CompletionTracking = z.infer<typeof CompletionTracking>

### Repository Layer