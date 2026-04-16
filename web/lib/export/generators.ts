import * as ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'

export async function generateExportFile(
  data: ExportData[],
  format: ExportFormat
): Promise<{
  content: Buffer
  filename: string
  contentType: string
}> {
  if (format === 'csv') {
    const csv = data.map((table) => {
      const rows = table.rows.map((row) => {
        return table.columns.map((column) => row[column])
      })

      return rows.join('\n')
    }).join('\n')

    return {
      content: Buffer.from(csv, 'utf-8'),
      filename: 'export.csv',
      contentType: 'text/csv',
    }
  } else if (format === 'json') {
    const json = JSON.stringify(data, null, 2)

    return {
      content: Buffer.from(json, 'utf-8'),
      filename: 'export.json',
      contentType: 'application/json',
    }
  } else if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Export')

    data.forEach((table, index) => {
      const headerRow = worksheet.addRow(table.columns)
      table.rows.forEach((row) => {
        worksheet.addRow(row)
      })

      if (index < data.length - 1) {
        worksheet.addRow([])
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return {
      content: buffer,
      filename: 'export.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  }

  throw new Error('Unsupported format')
}