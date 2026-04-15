import { z } from 'zod'

export const DrugInteractionSeverity = z.enum(['low', 'moderate', 'high', 'critical'])

export const DrugInteractionType = z.enum(['contraindicated', 'caution', 'monitor'])

export interface DrugInteraction {
  id: string
  drug1_id: string
  drug2_id: string
  severity: z.infer<typeof DrugInteractionSeverity>
  type: z.infer<typeof DrugInteractionType>
  description: string
  created_at: Date
  updated_at: Date
}

export interface CreateDrugInteractionData {
  drug1_id: string
  drug2_id: string
  severity: z.infer<typeof DrugInteractionSeverity>
  type: z.infer<typeof DrugInteractionType>
  description: string
}

export interface UpdateDrugInteractionData {
  severity?: z.infer<typeof DrugInteractionSeverity>
  type?: z.infer<typeof DrugInteractionType>
  description?: string
}

export interface DrugInteractionFilters {
  severity?: z.infer<typeof DrugInteractionSeverity>
  type?: z.infer<typeof DrugInteractionType>
}