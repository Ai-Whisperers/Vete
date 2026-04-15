import { z } from 'zod';

export const QualityOfLifeCategory = z.enum([
  'hurt',
  'hunger',
  'hydration',
  'hygiene',
  'happiness',
  'mobility',
  'moreGoodDays',
]);

export type QualityOfLifeCategory = z.infer<typeof QualityOfLifeCategory>;

export const QualityOfLifeScore = z.object({
  hurt: z.number().min(0).max(10),
  hunger: z.number().min(0).max(10),
  hydration: z.number().min(0).max(10),
  hygiene: z.number().min(0).max(10),
  happiness: z.number().min(0).max(10),
  mobility: z.number().min(0).max(10),
  moreGoodDays: z.number().min(0).max(10),
});

export type QualityOfLifeScore = z.infer<typeof QualityOfLifeScore>;

export const QualityOfLifeAssessment = z.object({
  id: z.string().uuid(),
  petId: z.string().uuid(),
  tenantId: z.string().uuid(),
  performedBy: z.string().uuid(),
  score: QualityOfLifeScore,
  trend: z.array(QualityOfLifeScore),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QualityOfLifeAssessment = z.infer<typeof QualityOfLifeAssessment>;

#### Repository