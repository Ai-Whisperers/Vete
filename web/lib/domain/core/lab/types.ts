import { z } from 'zod'

export const LabResultFlag = z.enum(['normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal'])
export type LabResultFlag = z.infer<typeof LabResultFlag>

export const LabTestCategory = z.enum([
  'hematology',
  'chemistry',
  'urinalysis',
  'serology',
  'microbiology',
  'cytology',
  'histopathology',
  'parasitology',
  'endocrinology',
  'coagulation',
  'immunology',
  'toxicology',
  'genetics',
  'other',
])
export type LabTestCategory = z.infer<typeof LabTestCategory>

export const LabTestSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  code: z.string(),
  name: z.string(),
  category: LabTestCategory,
  description: z.string().optional(),
  specimen_type: z.string(),
  specimen_requirements: z.string().optional(),
  turnaround_hours: z.number(),
  is_in_house: z.boolean(),
  base_price: z.number(),
  external_lab_cost: z.number().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type LabTest = z.infer<typeof LabTestSchema>

export const LabOrderSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  pet_id: z.string(),
  order_number: z.string(),
  ordered_at: z.string(),
  ordered_by: z.string(),
  medical_record_id: z.string().optional(),
  hospitalization_id: z.string().optional(),
  clinical_notes: z.string().optional(),
  fasting_status: z.string().optional(),
  specimen_collected_at: z.string().optional(),
  specimen_collected_by: z.string().optional(),
  specimen_type: z.string().optional(),
  specimen_quality: z.string().optional(),
  lab_type: z.string().optional(),
  external_lab_name: z.string().optional(),
  external_lab_accession: z.string().optional(),
  sent_to_lab_at: z.string().optional(),
  status: z.enum(['ordered', 'specimen_collected', 'in_progress', 'completed', 'partial', 'cancelled']),
  priority: z.string().optional(),
  results_received_at: z.string().optional(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.string().optional(),
  has_critical_values: z.boolean().optional(),
  critical_values_acknowledged: z.boolean().optional(),
  invoice_id: z.string().optional(),
  total_cost: z.number().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type LabOrder = z.infer<typeof LabOrderSchema>

export const LabResultSchema = z.object({
  id: z.string(),
  lab_order_id: z.string(),
  lab_order_item_id: z.string(),
  test_id: z.string(),
  component_name: z.string(),
  result_type: z.string(),
  numeric_value: z.number().optional(),
  text_value: z.string().optional(),
  unit: z.string().optional(),
  reference_range_id: z.string().optional(),
  range_low: z.number().optional(),
  range_high: z.number().optional(),
  flag: LabResultFlag,
  is_critical: z.boolean().optional(),
  method: z.string().optional(),
  instrument: z.string().optional(),
  entered_by: z.string().optional(),
  entered_at: z.string().optional(),
  verified_by: z.string().optional(),
  verified_at: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type LabResult = z.infer<typeof LabResultSchema>