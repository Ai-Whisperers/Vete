'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Download } from 'lucide-react'

interface CSVImportProps {
  clinicId: string
  onImportComplete?: (result: ImportResult) => void
}

interface ImportResult {
  success: boolean
  summary?: {
    total: number
    valid: number
    inserted: number
    failed: number
  }
  errors?: Array<{ patient: string; error: string }>
  message?: string
}

export function CSVImport({ clinicId, onImportComplete }: CSVImportProps): React.ReactElement {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null) // Clear previous results
    }
  }

  const handleImport = async () => {
    if (!file || !clinicId) return

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clinicId', clinicId)

      const response = await fetch('/api/patients/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          summary: data.summary,
          errors: data.errors,
          message: data.message,
        })
        if (onImportComplete) {
          onImportComplete(data)
        }
      } else {
        setResult({
          success: false,
          errors: data.errors,
          message: data.error || 'Import failed',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/patients/import')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla-pacientes-vete.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download template:', error)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Importar Pacientes desde CSV</h3>
        <p className="text-sm text-gray-500">
          Importa tu lista de pacientes existente desde un archivo CSV
        </p>
      </div>

      {/* Template Download */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">¿Primera vez importando?</h4>
            <p className="text-sm text-blue-700">
              Descarga nuestra plantilla CSV con el formato correcto y ejemplos.
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
          >
            <Download className="h-4 w-4" />
            Descargar Plantilla
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Seleccionar archivo CSV
        </label>
        <div className="flex items-center gap-4">
          <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100">
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {file ? file.name : 'Haz clic para seleccionar archivo'}
            </span>
            <span className="text-xs text-gray-500">CSV hasta 10MB</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          <button
            onClick={handleImport}
            disabled={!file || isUploading}
            className="rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isUploading ? 'Importando...' : 'Importar'}
          </button>
        </div>
        {file && (
          <p className="mt-2 text-sm text-gray-500">
            Archivo seleccionado: <span className="font-medium">{file.name}</span> (
            {(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div
          className={`rounded-lg p-4 ${
            result.success ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div className="flex-1">
              <h4
                className={`font-medium ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? '¡Importación exitosa!' : 'Error en la importación'}
              </h4>
              <p
                className={`text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.message}
              </p>

              {result.summary && (
                <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded bg-white p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {result.summary.total}
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="rounded bg-white p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.summary.valid}
                    </div>
                    <div className="text-xs text-gray-500">Válidos</div>
                  </div>
                  <div className="rounded bg-white p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.summary.inserted}
                    </div>
                    <div className="text-xs text-gray-500">Insertados</div>
                  </div>
                  <div className="rounded bg-white p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {result.summary.failed}
                    </div>
                    <div className="text-xs text-gray-500">Fallidos</div>
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <h5 className="mb-2 text-sm font-medium text-amber-800">Errores encontrados:</h5>
                  <div className="max-h-40 overflow-y-auto rounded border border-amber-200 bg-amber-50 p-2">
                    {result.errors.map((error, index) => (
                      <div key={index} className="mb-1 text-sm text-amber-700">
                        <span className="font-medium">{error.patient}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h4 className="mb-3 font-medium text-gray-900">Instrucciones:</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-gray-300" />
            <span>Descarga la plantilla para ver el formato correcto</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-gray-300" />
            <span>Mantén los encabezados en la primera fila</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-gray-300" />
            <span>Usa "perro" o "gato" para la especie (o "other" para otros)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-gray-300" />
            <span>Usa "macho", "hembra", o "desconocido" para el género</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-gray-300" />
            <span>Formato de fecha: YYYY-MM-DD (ej: 2023-05-15)</span>
          </li>
        </ul>
      </div>
    </div>
  )
}