import { z } from 'zod'

export const Trace = z.object({
  id: z.string(),
  name: z.string(),
  resource: z.string(),
  startTime: z.date(),
  duration: z.number(),
  endTime: z.date(),
  status: z.enum(['OK', 'ERROR']),
  spans: z.array(z.any()),
})

export type Trace = z.infer<typeof Trace>