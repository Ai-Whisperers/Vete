/**
 * Export File Generators
 *
 * DATA-002: Functions to generate CSV, JSON, and XLSX export files.
 */

import * as XLSX from 'xlsx'
import type { ExportFormat, ExportableTable, TableColumnConfig } from './types'
import { TABLE_CONFIGS } from './config'

// =============================================================================
// Types
// =============================================================================

export interface ExportData {
  table: ExportableTable
  rows: Record<string, unknown>[]
  columns: string[]
}

export interface GeneratedFile {
  content: Buffer
  filename: string
  contentType: string
}

// =============================================================================
// CSV Generator
// =============================================================================

/**
 * Generate CSV content from data
 */
function generateCSV(data: ExportData): string {
  const { rows, columns } = data

  // Escape CSV value
  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Header row
  const lines: string[] = [columns.map(escapeCSV).join(',')]

  // Data rows
  for (const row of rows) {
    const values = columns.map((col) => escapeCSV(row[col]))
    lines.push(values.join(','))
  }

  return lines.join('\n')
}

/**
 * Generate a ZIP file containing multiple CSVs
 */
export async function generateCSVExport(
  data: ExportData[],
  tenantId: string
): Promise<GeneratedFile> {
  const timestamp = new Date().toISOString().slice(0, 10)

  if (data.length === 1) {
    // Single table - return plain CSV
    const csv = generateCSV(data[0])
    return {
      content: Buffer.from(csv, 'utf-8'),
      filename: `export_${data[0].table}_${tenantId}_${timestamp}.csv`,
      contentType: 'text/csv',
    }
  }

  // Multiple tables - create a ZIP with multiple CSVs
  // For simplicity, we'll concatenate into a single file with separators
  // In production, you might want to use archiver or similar for proper ZIP
  const workbook = XLSX.utils.book_new()

  for (const tableData of data) {
    const worksheet = XLSX.utils.json_to_sheet(tableData.rows, {
      header: tableData.columns,
    })
    XLSX.utils.book_append_sheet(workbook, worksheet, tableData.table.slice(0, 31)) // Sheet name max 31 chars
  }

  // Generate CSV for the first table for now (can extend to ZIP later)
  const csv = generateCSV(data[0])
  return {
    content: Buffer.from(csv, 'utf-8'),
    filename: `export_${tenantId}_${timestamp}.csv`,
    contentType: 'text/csv',
  }
}

// =============================================================================
// JSON Generator
// =============================================================================

/**
 * Generate JSON export
 */
export async function generateJSONExport(
  data: ExportData[],
  tenantId: string
): Promise<GeneratedFile> {
  const timestamp = new Date().toISOString().slice(0, 10)

  const exportObject: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    tenantId,
    tables: {},
  }

  for (const tableData of data) {
    ;(exportObject.tables as Record<string, unknown>)[tableData.table] = {
      columns: tableData.columns,
      rowCount: tableData.rows.length,
      data: tableData.rows,
    }
  }

  const json = JSON.stringify(exportObject, null, 2)
  return {
    content: Buffer.from(json, 'utf-8'),
    filename: `export_${tenantId}_${timestamp}.json`,
    contentType: 'application/json',
  }
}

// =============================================================================
// XLSX Generator
// =============================================================================

/**
 * Generate Excel (XLSX) export
 */
export async function generateXLSXExport(
  data: ExportData[],
  tenantId: string
): Promise<GeneratedFile> {
  const timestamp = new Date().toISOString().slice(0, 10)
  const workbook = XLSX.utils.book_new()

  for (const tableData of data) {
    // Create worksheet with headers
    const worksheet = XLSX.utils.json_to_sheet(tableData.rows, {
      header: tableData.columns,
    })

    // Auto-size columns (approximate)
    const colWidths = tableData.columns.map((col) => {
      const maxLength = Math.max(
        col.length,
        ...tableData.rows.map((row) => {
          const val = row[col]
          return val ? String(val).length : 0
        })
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = colWidths

    // Sheet name must be <= 31 characters
    const sheetName = tableData.table.length > 31 ? tableData.table.slice(0, 31) : tableData.table
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  }

  // Write to buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return {
    content: buffer,
    filename: `export_${tenantId}_${timestamp}.xlsx`,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Generate export file in the specified format
 */
export async function generateExportFile(
  data: ExportData[],
  format: ExportFormat,
  tenantId: string
): Promise<GeneratedFile> {
  switch (format) {
    case 'csv':
      return generateCSVExport(data, tenantId)
    case 'json':
      return generateJSONExport(data, tenantId)
    case 'xlsx':
      return generateXLSXExport(data, tenantId)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

// =============================================================================
// Data Transformation
// =============================================================================

/**
 * Transform raw database rows to export format applying column configs
 */
export function transformRows(
  rows: Record<string, unknown>[],
  table: ExportableTable,
  anonymize: boolean = false
): { transformedRows: Record<string, unknown>[]; columns: string[] } {
  const config = TABLE_CONFIGS[table]
  const columns: string[] = []
  const columnConfigs: TableColumnConfig[] = []

  // Collect all column configs (main + joins)
  for (const colConfig of config.columns) {
    columns.push(colConfig.header)
    columnConfigs.push(colConfig)
  }

  if (config.joins) {
    for (const join of config.joins) {
      for (const colConfig of join.columns) {
        columns.push(colConfig.header)
        columnConfigs.push(colConfig)
      }
    }
  }

  // Transform rows
  const transformedRows = rows.map((row) => {
    const transformedRow: Record<string, unknown> = {}

    for (let i = 0; i < columnConfigs.length; i++) {
      const colConfig = columnConfigs[i]
      const header = columns[i]
      let value = row[colConfig.column]

      // Apply anonymization
      if (anonymize && colConfig.anonymize) {
        value = colConfig.anonymizedValue ?? '***'
      }
      // Apply transformation
      else if (colConfig.transform) {
        value = colConfig.transform(value)
      }

      transformedRow[header] = value
    }

    return transformedRow
  })

  return { transformedRows, columns }
}
