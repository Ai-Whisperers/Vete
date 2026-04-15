import { z } from 'zod';

export const DiagnosisCode = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
});

export type DiagnosisCode = z.infer<typeof DiagnosisCode>;