// Existing file, adding new types for lab test catalog
export type LabTestCategory = 'hematology' | 'chemistry' | 'urinalysis' | 'serology' | 'microbiology' | 'cytology' | 'histopathology' | 'parasitology' | 'endocrinology' | 'coagulation' | 'immunology' | 'toxicology' | 'genetics' | 'other'

export interface LabTest {
  id: string
  tenant_id?: string | null
  code: string
  name: string
  category: LabTestCategory
  description?: string | null
  base_price: number
  reference_ranges?: Record<string, unknown> | null
  turnaround_days: number
  requires_fasting: boolean
  sample_type?: SampleType | null
  sample_volume_ml?: number | null
  special_instructions?: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface TestFilters {
  category?: LabTestCategory
  sample_type?: SampleType
  is_active?: boolean
  search?: string
}