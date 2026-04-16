export type ExportFormat = 'csv' | 'json' | 'xlsx'

export type ExportableTable =
  | 'pets'
  | 'appointments'
  | 'medical_records'
  | 'prescriptions'
  | 'invoices'
  | 'payments'

export interface ExportConfig {
  tables: ExportableTable[]
  format: ExportFormat
  dateRange?: {
    from: Date
    to: Date
  }
  includeRelations?: boolean
  anonymize?: boolean
}

export interface CreateExportJobInput {
  tables: ExportableTable[]
  format: ExportFormat
  dateRange?: {
    from: string
    to: string
  }
  includeRelations?: boolean
  anonymize?: boolean
}

export interface ExportJob {
  id: string
  tenant_id: string
  user_id: string
  config: ExportConfig
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  file_url?: string
  created_at: string
  updated_at: string
}

export interface ExportJobResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface ExportResult {
  file: {
    content: Buffer
    filename: string
    contentType: string
  }
  format: ExportFormat
  size: number
}