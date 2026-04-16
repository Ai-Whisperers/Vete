import { createClient } from '@/lib/supabase/server'
import { TABLE_CONFIGS } from '@/lib/export/config'
import { generateExportFile, type ExportData } from '@/lib/export/generators'
import type {
  ExportFormat,
  ExportableTable,
  ExportConfig,
  ExportJob,
  CreateExportJobInput,
  ExportJobResponse,
  ExportResult,
} from '@/lib/export/types'

export class ExportService {
  private supabase: Awaited<ReturnType<typeof createClient>>

  constructor() {
    this.supabase = createClient()
  }

  /**
   * Create a new export job
   */
  async createExportJob(
    userId: string,
    tenantId: string,
    input: CreateExportJobInput
  ): Promise<ExportJobResponse> {
    const config: ExportConfig = {
      tables: input.tables,
      format: input.format,
      dateRange: input.dateRange
        ? {
            from: new Date(input.dateRange.from),
            to: new Date(input.dateRange.to),
          }
        : undefined,
      includeRelations: input.includeRelations ?? true,
      anonymize: input.anonymize ?? false,
    }

    const { data, error } = await this.supabase
      .from('export_jobs')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        config,
        status: 'pending',
        progress: 0,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error('Failed to create export job')
    }

    return { id: data.id, status: 'pending' }
  }

  /**
   * Process an export job
   */
  async processExportJob(jobId: string): Promise<ExportResult> {
    const { data, error } = await this.supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error || !data) {
      throw new Error('Export job not found')
    }

    const config: ExportConfig = data.config
    const tables: ExportableTable[] = config.tables

    const exportData: ExportData[] = []

    for (const table of tables) {
      const tableConfig = TABLE_CONFIGS[table]
      const data = await this.supabase
        .from(tableConfig.dbTable)
        .select(tableConfig.columns.map((c) => c.column))
        .eq('tenant_id', data.tenant_id)

      exportData.push({
        table,
        rows: data.data,
        columns: tableConfig.columns.map((c) => c.header),
      })
    }

    const file = await generateExportFile(exportData, config.format)

    return {
      file,
      format: config.format,
      size: file.content.length,
    }
  }
}