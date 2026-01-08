'use client'

import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Globe,
  Building,
  CheckCircle,
  XCircle,
  Save,
  X,
  Trash2,
} from 'lucide-react'
import { createSanitizedHtml } from '@/lib/utils'

interface TemplateField {
  id: string
  field_name: string
  field_type: string
  field_label: string
  is_required: boolean
  field_options: string[] | null
  display_order: number
}

interface ConsentTemplate {
  id: string
  tenant_id: string | null
  name: string
  category: string
  content: string
  requires_witness: boolean
  requires_id_verification: boolean
  can_be_revoked: boolean
  default_expiry_days: number | null
  is_active: boolean
  fields: TemplateField[]
}

export default function TemplatesPage(): JSX.Element {
  const [templates, setTemplates] = useState<ConsentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<ConsentTemplate | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<ConsentTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async (): Promise<void> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/')
        return
      }

      const response = await fetch('/api/consents/templates')
      if (!response.ok) {
        throw new Error('Error al cargar plantillas')
      }

      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching templates:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      surgery: 'Cirugía',
      anesthesia: 'Anestesia',
      euthanasia: 'Eutanasia',
      boarding: 'Hospedaje',
      treatment: 'Tratamiento',
      vaccination: 'Vacunación',
      diagnostic: 'Diagnóstico',
      other: 'Otro',
    }
    return labels[category] || category
  }

  const handleSaveTemplate = async (templateData: ConsentTemplate): Promise<void> => {
    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/consents/templates/${templateData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateData.name,
          category: templateData.category,
          content: templateData.content,
          requires_witness: templateData.requires_witness,
          requires_id_verification: templateData.requires_id_verification,
          can_be_revoked: templateData.can_be_revoked,
          default_expiry_days: templateData.default_expiry_days,
          fields: templateData.fields,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar la plantilla')
      }

      setFeedback({ type: 'success', message: 'Plantilla actualizada correctamente' })
      setEditingTemplate(null)
      await fetchTemplates()

      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000)
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving template:', error)
      }
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al guardar la plantilla',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteField = (
    templateData: ConsentTemplate,
    fieldIndex: number
  ): ConsentTemplate => {
    return {
      ...templateData,
      fields: templateData.fields.filter((_, index) => index !== fieldIndex),
    }
  }

  const handleAddField = (templateData: ConsentTemplate): ConsentTemplate => {
    const newField: TemplateField = {
      id: `new-${Date.now()}`,
      field_name: '',
      field_type: 'text',
      field_label: '',
      is_required: false,
      field_options: null,
      display_order: templateData.fields.length,
    }

    return {
      ...templateData,
      fields: [...templateData.fields, newField],
    }
  }

  const EditTemplateModal = ({ template }: { template: ConsentTemplate }): JSX.Element => {
    const [editedTemplate, setEditedTemplate] = useState<ConsentTemplate>(template)

    const categories = [
      { value: 'surgery', label: 'Cirugía' },
      { value: 'anesthesia', label: 'Anestesia' },
      { value: 'euthanasia', label: 'Eutanasia' },
      { value: 'boarding', label: 'Hospedaje' },
      { value: 'treatment', label: 'Tratamiento' },
      { value: 'vaccination', label: 'Vacunación' },
      { value: 'diagnostic', label: 'Diagnóstico' },
      { value: 'other', label: 'Otro' },
    ]

    const fieldTypes = [
      { value: 'text', label: 'Texto' },
      { value: 'textarea', label: 'Texto largo' },
      { value: 'number', label: 'Número' },
      { value: 'date', label: 'Fecha' },
      { value: 'select', label: 'Selección' },
      { value: 'checkbox', label: 'Casilla' },
    ]

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
        <div className="my-8 w-full max-w-5xl rounded-lg bg-[var(--bg-paper)]">
          {/* Header */}
          <div className="border-[var(--primary)]/20 sticky top-0 rounded-t-lg border-b bg-[var(--bg-paper)] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Editar Plantilla</h2>
              <button
                onClick={() => setEditingTemplate(null)}
                disabled={saving}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="max-h-[calc(90vh-200px)] space-y-6 overflow-y-auto p-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Información Básica
              </h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  value={editedTemplate.name}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                  className="border-[var(--primary)]/20 w-full rounded-lg border bg-[var(--bg-default)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Consentimiento de Cirugía General"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Categoría *
                </label>
                <select
                  value={editedTemplate.category}
                  onChange={(e) =>
                    setEditedTemplate({ ...editedTemplate, category: e.target.value })
                  }
                  className="border-[var(--primary)]/20 w-full rounded-lg border bg-[var(--bg-default)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Contenido de la plantilla *
                </label>
                <textarea
                  value={editedTemplate.content}
                  onChange={(e) =>
                    setEditedTemplate({ ...editedTemplate, content: e.target.value })
                  }
                  rows={10}
                  className="border-[var(--primary)]/20 w-full rounded-lg border bg-[var(--bg-default)] px-4 py-2 font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Contenido HTML del consentimiento..."
                />
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Usa etiquetas HTML y variables como {`{{field_name}}`} para campos personalizados
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Configuración</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedTemplate.requires_witness}
                    onChange={(e) =>
                      setEditedTemplate({ ...editedTemplate, requires_witness: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Requiere testigo</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedTemplate.requires_id_verification}
                    onChange={(e) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        requires_id_verification: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    Requiere verificación de ID
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedTemplate.can_be_revoked}
                    onChange={(e) =>
                      setEditedTemplate({ ...editedTemplate, can_be_revoked: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Puede ser revocado</span>
                </label>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Días de expiración
                  </label>
                  <input
                    type="number"
                    value={editedTemplate.default_expiry_days || ''}
                    onChange={(e) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        default_expiry_days: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="border-[var(--primary)]/20 w-full rounded-lg border bg-[var(--bg-default)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Dejar vacío para sin expiración"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Campos Personalizados
                </h3>
                <button
                  onClick={() => setEditedTemplate(handleAddField(editedTemplate))}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1 text-sm text-white transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Campo
                </button>
              </div>

              {editedTemplate.fields && editedTemplate.fields.length > 0 ? (
                <div className="space-y-3">
                  {editedTemplate.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border-[var(--primary)]/20 rounded-lg border bg-[var(--bg-default)] p-4"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                            Nombre del campo (variable)
                          </label>
                          <input
                            type="text"
                            value={field.field_name}
                            onChange={(e) => {
                              const newFields = [...editedTemplate.fields]
                              newFields[index] = { ...field, field_name: e.target.value }
                              setEditedTemplate({ ...editedTemplate, fields: newFields })
                            }}
                            className="border-[var(--primary)]/20 w-full rounded border bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            placeholder="nombre_campo"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                            Etiqueta
                          </label>
                          <input
                            type="text"
                            value={field.field_label}
                            onChange={(e) => {
                              const newFields = [...editedTemplate.fields]
                              newFields[index] = { ...field, field_label: e.target.value }
                              setEditedTemplate({ ...editedTemplate, fields: newFields })
                            }}
                            className="border-[var(--primary)]/20 w-full rounded border bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            placeholder="Etiqueta visible"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                            Tipo de campo
                          </label>
                          <select
                            value={field.field_type}
                            onChange={(e) => {
                              const newFields = [...editedTemplate.fields]
                              newFields[index] = { ...field, field_type: e.target.value }
                              setEditedTemplate({ ...editedTemplate, fields: newFields })
                            }}
                            className="border-[var(--primary)]/20 w-full rounded border bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          >
                            {fieldTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end gap-2">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.is_required}
                              onChange={(e) => {
                                const newFields = [...editedTemplate.fields]
                                newFields[index] = { ...field, is_required: e.target.checked }
                                setEditedTemplate({ ...editedTemplate, fields: newFields })
                              }}
                              className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-xs text-[var(--text-primary)]">Requerido</span>
                          </label>

                          <button
                            onClick={() =>
                              setEditedTemplate(handleDeleteField(editedTemplate, index))
                            }
                            className="ml-auto rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Eliminar campo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-[var(--text-secondary)]">
                  No hay campos personalizados. Haz clic en "Agregar Campo" para crear uno.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-[var(--primary)]/20 sticky bottom-0 rounded-b-lg border-t bg-[var(--bg-paper)] p-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingTemplate(null)}
                disabled={saving}
                className="hover:bg-[var(--primary)]/10 rounded-lg bg-[var(--bg-default)] px-6 py-2 text-[var(--text-primary)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveTemplate(editedTemplate)}
                disabled={
                  saving ||
                  !editedTemplate.name ||
                  !editedTemplate.category ||
                  !editedTemplate.content
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const CreateTemplateModal = ({
    onClose,
    onSuccess,
  }: {
    onClose: () => void
    onSuccess: () => void
  }): JSX.Element => {
    const [newTemplate, setNewTemplate] = useState({
      name: '',
      category: 'treatment',
      content: '',
      requires_witness: false,
      requires_id_verification: false,
      can_be_revoked: true,
      default_expiry_days: null as number | null,
      fields: [] as TemplateField[],
    })
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const categories = [
      { value: 'surgery', label: 'Cirugía' },
      { value: 'anesthesia', label: 'Anestesia' },
      { value: 'euthanasia', label: 'Eutanasia' },
      { value: 'boarding', label: 'Hospedaje' },
      { value: 'treatment', label: 'Tratamiento' },
      { value: 'vaccination', label: 'Vacunación' },
      { value: 'diagnostic', label: 'Diagnóstico' },
      { value: 'other', label: 'Otro' },
    ]

    const fieldTypes = [
      { value: 'text', label: 'Texto' },
      { value: 'textarea', label: 'Texto largo' },
      { value: 'number', label: 'Número' },
      { value: 'date', label: 'Fecha' },
      { value: 'select', label: 'Selección' },
      { value: 'checkbox', label: 'Casilla' },
    ]

    const handleAddField = () => {
      const newField: TemplateField = {
        id: `new-${Date.now()}`,
        field_name: '',
        field_type: 'text',
        field_label: '',
        is_required: false,
        field_options: null,
        display_order: newTemplate.fields.length,
      }
      setNewTemplate({ ...newTemplate, fields: [...newTemplate.fields, newField] })
    }

    const handleDeleteField = (index: number) => {
      setNewTemplate({
        ...newTemplate,
        fields: newTemplate.fields.filter((_, i) => i !== index),
      })
    }

    const handleCreate = async () => {
      if (!newTemplate.name || !newTemplate.category || !newTemplate.content) {
        setError('Nombre, categoría y contenido son requeridos')
        return
      }

      setCreating(true)
      setError(null)

      try {
        const response = await fetch('/api/consents/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newTemplate.name,
            category: newTemplate.category,
            content: newTemplate.content,
            requires_witness: newTemplate.requires_witness,
            requires_id_verification: newTemplate.requires_id_verification,
            can_be_revoked: newTemplate.can_be_revoked,
            default_expiry_days: newTemplate.default_expiry_days,
            fields: newTemplate.fields.filter((f) => f.field_name && f.field_label),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Error al crear plantilla')
        }

        setFeedback({ type: 'success', message: 'Plantilla creada correctamente' })
        setTimeout(() => setFeedback(null), 3000)
        onSuccess()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear plantilla')
      } finally {
        setCreating(false)
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
        <div className="my-8 w-full max-w-5xl rounded-lg bg-[var(--bg-paper)]">
          {/* Header */}
          <div className="border-[var(--primary)]/20 sticky top-0 rounded-t-lg border-b bg-[var(--bg-paper)] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Nueva Plantilla</h2>
              <button
                onClick={onClose}
                disabled={creating}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="max-h-[calc(90vh-200px)] space-y-6 overflow-y-auto p-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Información Básica
              </h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="border-[var(--primary)]/20 w-full rounded-lg border bg-[var(--bg-default)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Consentimiento de Cirugía General"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Categoría *
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="border-[var(--primary)]/20 w-full rounded-lg border bg-[var(--bg-default)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Contenido de la plantilla *
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  rows={10}
                  className="border-[var(--primary)]/20 w-full rounded-lg border bg-[var(--bg-default)] px-4 py-2 font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Contenido HTML del consentimiento..."
                />
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Usa etiquetas HTML y variables como {`{{field_name}}`} para campos personalizados
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Configuración</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTemplate.requires_witness}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, requires_witness: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Requiere testigo</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTemplate.requires_id_verification}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, requires_id_verification: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    Requiere verificación de ID
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTemplate.can_be_revoked}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, can_be_revoked: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Puede ser revocado</span>
                </label>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Días de expiración
                  </label>
                  <input
                    type="number"
                    value={newTemplate.default_expiry_days || ''}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        default_expiry_days: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="border-[var(--primary)]/20 w-full rounded-lg border bg-[var(--bg-default)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Dejar vacío para sin expiración"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Campos Personalizados
                </h3>
                <button
                  onClick={handleAddField}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1 text-sm text-white transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Campo
                </button>
              </div>

              {newTemplate.fields.length > 0 ? (
                <div className="space-y-3">
                  {newTemplate.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border-[var(--primary)]/20 rounded-lg border bg-[var(--bg-default)] p-4"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                            Nombre del campo (variable)
                          </label>
                          <input
                            type="text"
                            value={field.field_name}
                            onChange={(e) => {
                              const newFields = [...newTemplate.fields]
                              newFields[index] = { ...field, field_name: e.target.value }
                              setNewTemplate({ ...newTemplate, fields: newFields })
                            }}
                            className="border-[var(--primary)]/20 w-full rounded border bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            placeholder="nombre_campo"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                            Etiqueta
                          </label>
                          <input
                            type="text"
                            value={field.field_label}
                            onChange={(e) => {
                              const newFields = [...newTemplate.fields]
                              newFields[index] = { ...field, field_label: e.target.value }
                              setNewTemplate({ ...newTemplate, fields: newFields })
                            }}
                            className="border-[var(--primary)]/20 w-full rounded border bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            placeholder="Etiqueta visible"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                            Tipo de campo
                          </label>
                          <select
                            value={field.field_type}
                            onChange={(e) => {
                              const newFields = [...newTemplate.fields]
                              newFields[index] = { ...field, field_type: e.target.value }
                              setNewTemplate({ ...newTemplate, fields: newFields })
                            }}
                            className="border-[var(--primary)]/20 w-full rounded border bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          >
                            {fieldTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end gap-2">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.is_required}
                              onChange={(e) => {
                                const newFields = [...newTemplate.fields]
                                newFields[index] = { ...field, is_required: e.target.checked }
                                setNewTemplate({ ...newTemplate, fields: newFields })
                              }}
                              className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-xs text-[var(--text-primary)]">Requerido</span>
                          </label>

                          <button
                            onClick={() => handleDeleteField(index)}
                            className="ml-auto rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Eliminar campo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-[var(--text-secondary)]">
                  No hay campos personalizados. Haz clic en &quot;Agregar Campo&quot; para crear
                  uno.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-[var(--primary)]/20 sticky bottom-0 rounded-b-lg border-t bg-[var(--bg-paper)] p-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={creating}
                className="hover:bg-[var(--primary)]/10 rounded-lg bg-[var(--bg-default)] px-6 py-2 text-[var(--text-primary)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  creating || !newTemplate.name || !newTemplate.category || !newTemplate.content
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Crear Plantilla
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const TemplatePreviewModal = ({ template }: { template: ConsentTemplate }): JSX.Element => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-[var(--bg-paper)]">
          <div className="border-[var(--primary)]/20 sticky top-0 border-b bg-[var(--bg-paper)] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{template.name}</h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <span className="text-sm text-[var(--text-secondary)]">
                Categoría: {getCategoryLabel(template.category)}
              </span>
              {template.tenant_id ? (
                <span className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <Building className="h-4 w-4" />
                  Plantilla de clínica
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <Globe className="h-4 w-4" />
                  Plantilla global
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Template Properties */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-[var(--bg-default)] p-4">
              <div className="flex items-center gap-2">
                {template.requires_witness ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm text-[var(--text-primary)]">Requiere testigo</span>
              </div>
              <div className="flex items-center gap-2">
                {template.requires_id_verification ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm text-[var(--text-primary)]">Requiere verificación ID</span>
              </div>
              <div className="flex items-center gap-2">
                {template.can_be_revoked ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm text-[var(--text-primary)]">Puede ser revocado</span>
              </div>
              <div className="text-sm text-[var(--text-primary)]">
                Expiración:{' '}
                {template.default_expiry_days
                  ? `${template.default_expiry_days} días`
                  : 'Sin expiración'}
              </div>
            </div>

            {/* Custom Fields */}
            {template.fields && template.fields.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">
                  Campos personalizados
                </h3>
                <div className="space-y-2">
                  {template.fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between rounded-lg bg-[var(--bg-default)] p-3"
                    >
                      <div>
                        <span className="font-medium text-[var(--text-primary)]">
                          {field.field_label}
                        </span>
                        <span className="ml-2 text-xs text-[var(--text-secondary)]">
                          ({field.field_type})
                        </span>
                        {field.is_required && (
                          <span className="ml-2 text-xs text-red-600">*requerido</span>
                        )}
                      </div>
                      <code className="bg-[var(--primary)]/10 rounded px-2 py-1 text-xs text-[var(--primary)]">
                        {`{{${field.field_name}}}`}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div>
              <h3 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">
                Contenido de la plantilla
              </h3>
              <div
                className="prose max-w-none rounded-lg bg-[var(--bg-default)] p-4 text-[var(--text-primary)]"
                dangerouslySetInnerHTML={createSanitizedHtml(template.content, 'consent')}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Cargando plantillas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Feedback Notification */}
      {feedback && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg p-4 shadow-lg ${
            feedback.type === 'success'
              ? 'border border-green-300 bg-green-100 text-green-800'
              : 'border border-red-300 bg-red-100 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              Plantillas de Consentimiento
            </h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              Administra plantillas de consentimientos informados
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nueva Plantilla
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border-[var(--primary)]/20 rounded-lg border bg-[var(--bg-paper)] p-6 transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">{template.name}</h3>
              </div>
              {template.tenant_id ? (
                <Building className="h-4 w-4 text-[var(--text-secondary)]" />
              ) : (
                <Globe className="h-4 w-4 text-[var(--text-secondary)]" />
              )}
            </div>

            <div className="mb-4 space-y-2">
              <div className="bg-[var(--primary)]/10 inline-block rounded px-2 py-1 text-xs font-medium text-[var(--primary)]">
                {getCategoryLabel(template.category)}
              </div>

              <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                {template.requires_witness && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Requiere testigo</span>
                  </div>
                )}
                {template.requires_id_verification && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Requiere ID</span>
                  </div>
                )}
                {template.default_expiry_days && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Expira en {template.default_expiry_days} días</span>
                  </div>
                )}
              </div>

              {template.fields && template.fields.length > 0 && (
                <div className="text-xs text-[var(--text-secondary)]">
                  {template.fields.length} campo{template.fields.length !== 1 ? 's' : ''}{' '}
                  personalizado
                  {template.fields.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPreviewTemplate(template)}
                className="hover:bg-[var(--primary)]/10 border-[var(--primary)]/20 inline-flex flex-1 items-center justify-center gap-2 rounded-lg border bg-[var(--bg-default)] px-3 py-2 text-[var(--text-primary)] transition-colors"
              >
                <Eye className="h-4 w-4" />
                Vista previa
              </button>
              {template.tenant_id && (
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-white transition-opacity hover:opacity-90"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="border-[var(--primary)]/20 rounded-lg border bg-[var(--bg-paper)] p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">No hay plantillas disponibles</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Crear primera plantilla
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && <EditTemplateModal template={editingTemplate} />}

      {/* Preview Modal */}
      {previewTemplate && <TemplatePreviewModal template={previewTemplate} />}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchTemplates()
          }}
        />
      )}
    </div>
  )
}
