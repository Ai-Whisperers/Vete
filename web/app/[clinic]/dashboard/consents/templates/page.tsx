"use client";

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FileText, Plus, Edit, Eye, Globe, Building, CheckCircle, XCircle, Save, X, Trash2 } from 'lucide-react';

interface TemplateField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  is_required: boolean;
  field_options: string[] | null;
  display_order: number;
}

interface ConsentTemplate {
  id: string;
  tenant_id: string | null;
  name: string;
  category: string;
  content: string;
  requires_witness: boolean;
  requires_id_verification: boolean;
  can_be_revoked: boolean;
  default_expiry_days: number | null;
  is_active: boolean;
  fields: TemplateField[];
}

export default function TemplatesPage(): JSX.Element {
  const [templates, setTemplates] = useState<ConsentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ConsentTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ConsentTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/consents/templates');
      if (!response.ok) {
        throw new Error('Error al cargar plantillas');
      }

      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching templates:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      surgery: 'Cirugía',
      anesthesia: 'Anestesia',
      euthanasia: 'Eutanasia',
      boarding: 'Hospedaje',
      treatment: 'Tratamiento',
      vaccination: 'Vacunación',
      diagnostic: 'Diagnóstico',
      other: 'Otro'
    };
    return labels[category] || category;
  };

  const handleSaveTemplate = async (templateData: ConsentTemplate): Promise<void> => {
    setSaving(true);
    setFeedback(null);

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
          fields: templateData.fields
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar la plantilla');
      }

      setFeedback({ type: 'success', message: 'Plantilla actualizada correctamente' });
      setEditingTemplate(null);
      await fetchTemplates();

      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving template:', error);
      }
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al guardar la plantilla'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = (templateData: ConsentTemplate, fieldIndex: number): ConsentTemplate => {
    return {
      ...templateData,
      fields: templateData.fields.filter((_, index) => index !== fieldIndex)
    };
  };

  const handleAddField = (templateData: ConsentTemplate): ConsentTemplate => {
    const newField: TemplateField = {
      id: `new-${Date.now()}`,
      field_name: '',
      field_type: 'text',
      field_label: '',
      is_required: false,
      field_options: null,
      display_order: templateData.fields.length
    };

    return {
      ...templateData,
      fields: [...templateData.fields, newField]
    };
  };

  const EditTemplateModal = ({ template }: { template: ConsentTemplate }): JSX.Element => {
    const [editedTemplate, setEditedTemplate] = useState<ConsentTemplate>(template);

    const categories = [
      { value: 'surgery', label: 'Cirugía' },
      { value: 'anesthesia', label: 'Anestesia' },
      { value: 'euthanasia', label: 'Eutanasia' },
      { value: 'boarding', label: 'Hospedaje' },
      { value: 'treatment', label: 'Tratamiento' },
      { value: 'vaccination', label: 'Vacunación' },
      { value: 'diagnostic', label: 'Diagnóstico' },
      { value: 'other', label: 'Otro' }
    ];

    const fieldTypes = [
      { value: 'text', label: 'Texto' },
      { value: 'textarea', label: 'Texto largo' },
      { value: 'number', label: 'Número' },
      { value: 'date', label: 'Fecha' },
      { value: 'select', label: 'Selección' },
      { value: 'checkbox', label: 'Casilla' }
    ];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-[var(--bg-paper)] rounded-lg max-w-5xl w-full my-8">
          {/* Header */}
          <div className="sticky top-0 bg-[var(--bg-paper)] border-b border-[var(--primary)]/20 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Editar Plantilla</h2>
              <button
                onClick={() => setEditingTemplate(null)}
                disabled={saving}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Información Básica</h3>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  value={editedTemplate.name}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-default)] border border-[var(--primary)]/20 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Consentimiento de Cirugía General"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Categoría *
                </label>
                <select
                  value={editedTemplate.category}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, category: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-default)] border border-[var(--primary)]/20 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Contenido de la plantilla *
                </label>
                <textarea
                  value={editedTemplate.content}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 bg-[var(--bg-default)] border border-[var(--primary)]/20 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
                  placeholder="Contenido HTML del consentimiento..."
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Usa etiquetas HTML y variables como {`{{field_name}}`} para campos personalizados
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Configuración</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedTemplate.requires_witness}
                    onChange={(e) => setEditedTemplate({ ...editedTemplate, requires_witness: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Requiere testigo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedTemplate.requires_id_verification}
                    onChange={(e) => setEditedTemplate({ ...editedTemplate, requires_id_verification: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Requiere verificación de ID</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedTemplate.can_be_revoked}
                    onChange={(e) => setEditedTemplate({ ...editedTemplate, can_be_revoked: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Puede ser revocado</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Días de expiración
                  </label>
                  <input
                    type="number"
                    value={editedTemplate.default_expiry_days || ''}
                    onChange={(e) => setEditedTemplate({
                      ...editedTemplate,
                      default_expiry_days: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="w-full px-4 py-2 bg-[var(--bg-default)] border border-[var(--primary)]/20 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Dejar vacío para sin expiración"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Campos Personalizados</h3>
                <button
                  onClick={() => setEditedTemplate(handleAddField(editedTemplate))}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Campo
                </button>
              </div>

              {editedTemplate.fields && editedTemplate.fields.length > 0 ? (
                <div className="space-y-3">
                  {editedTemplate.fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-[var(--bg-default)] rounded-lg border border-[var(--primary)]/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Nombre del campo (variable)
                          </label>
                          <input
                            type="text"
                            value={field.field_name}
                            onChange={(e) => {
                              const newFields = [...editedTemplate.fields];
                              newFields[index] = { ...field, field_name: e.target.value };
                              setEditedTemplate({ ...editedTemplate, fields: newFields });
                            }}
                            className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--primary)]/20 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            placeholder="nombre_campo"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Etiqueta
                          </label>
                          <input
                            type="text"
                            value={field.field_label}
                            onChange={(e) => {
                              const newFields = [...editedTemplate.fields];
                              newFields[index] = { ...field, field_label: e.target.value };
                              setEditedTemplate({ ...editedTemplate, fields: newFields });
                            }}
                            className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--primary)]/20 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            placeholder="Etiqueta visible"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Tipo de campo
                          </label>
                          <select
                            value={field.field_type}
                            onChange={(e) => {
                              const newFields = [...editedTemplate.fields];
                              newFields[index] = { ...field, field_type: e.target.value };
                              setEditedTemplate({ ...editedTemplate, fields: newFields });
                            }}
                            className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--primary)]/20 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          >
                            {fieldTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.is_required}
                              onChange={(e) => {
                                const newFields = [...editedTemplate.fields];
                                newFields[index] = { ...field, is_required: e.target.checked };
                                setEditedTemplate({ ...editedTemplate, fields: newFields });
                              }}
                              className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                            />
                            <span className="text-xs text-[var(--text-primary)]">Requerido</span>
                          </label>

                          <button
                            onClick={() => setEditedTemplate(handleDeleteField(editedTemplate, index))}
                            className="ml-auto p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar campo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                  No hay campos personalizados. Haz clic en "Agregar Campo" para crear uno.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[var(--bg-paper)] border-t border-[var(--primary)]/20 p-6 rounded-b-lg">
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEditingTemplate(null)}
                disabled={saving}
                className="px-6 py-2 bg-[var(--bg-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveTemplate(editedTemplate)}
                disabled={saving || !editedTemplate.name || !editedTemplate.category || !editedTemplate.content}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreateTemplateModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }): JSX.Element => {
    const [newTemplate, setNewTemplate] = useState({
      name: '',
      category: 'treatment',
      content: '',
      requires_witness: false,
      requires_id_verification: false,
      can_be_revoked: true,
      default_expiry_days: null as number | null,
      fields: [] as TemplateField[]
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories = [
      { value: 'surgery', label: 'Cirugía' },
      { value: 'anesthesia', label: 'Anestesia' },
      { value: 'euthanasia', label: 'Eutanasia' },
      { value: 'boarding', label: 'Hospedaje' },
      { value: 'treatment', label: 'Tratamiento' },
      { value: 'vaccination', label: 'Vacunación' },
      { value: 'diagnostic', label: 'Diagnóstico' },
      { value: 'other', label: 'Otro' }
    ];

    const fieldTypes = [
      { value: 'text', label: 'Texto' },
      { value: 'textarea', label: 'Texto largo' },
      { value: 'number', label: 'Número' },
      { value: 'date', label: 'Fecha' },
      { value: 'select', label: 'Selección' },
      { value: 'checkbox', label: 'Casilla' }
    ];

    const handleAddField = () => {
      const newField: TemplateField = {
        id: `new-${Date.now()}`,
        field_name: '',
        field_type: 'text',
        field_label: '',
        is_required: false,
        field_options: null,
        display_order: newTemplate.fields.length
      };
      setNewTemplate({ ...newTemplate, fields: [...newTemplate.fields, newField] });
    };

    const handleDeleteField = (index: number) => {
      setNewTemplate({
        ...newTemplate,
        fields: newTemplate.fields.filter((_, i) => i !== index)
      });
    };

    const handleCreate = async () => {
      if (!newTemplate.name || !newTemplate.category || !newTemplate.content) {
        setError('Nombre, categoría y contenido son requeridos');
        return;
      }

      setCreating(true);
      setError(null);

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
            fields: newTemplate.fields.filter(f => f.field_name && f.field_label)
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al crear plantilla');
        }

        setFeedback({ type: 'success', message: 'Plantilla creada correctamente' });
        setTimeout(() => setFeedback(null), 3000);
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear plantilla');
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-[var(--bg-paper)] rounded-lg max-w-5xl w-full my-8">
          {/* Header */}
          <div className="sticky top-0 bg-[var(--bg-paper)] border-b border-[var(--primary)]/20 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Nueva Plantilla</h2>
              <button
                onClick={onClose}
                disabled={creating}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Información Básica</h3>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-default)] border border-[var(--primary)]/20 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Consentimiento de Cirugía General"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Categoría *
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-default)] border border-[var(--primary)]/20 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Contenido de la plantilla *
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 bg-[var(--bg-default)] border border-[var(--primary)]/20 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
                  placeholder="Contenido HTML del consentimiento..."
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Usa etiquetas HTML y variables como {`{{field_name}}`} para campos personalizados
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Configuración</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTemplate.requires_witness}
                    onChange={(e) => setNewTemplate({ ...newTemplate, requires_witness: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Requiere testigo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTemplate.requires_id_verification}
                    onChange={(e) => setNewTemplate({ ...newTemplate, requires_id_verification: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Requiere verificación de ID</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTemplate.can_be_revoked}
                    onChange={(e) => setNewTemplate({ ...newTemplate, can_be_revoked: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Puede ser revocado</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Días de expiración
                  </label>
                  <input
                    type="number"
                    value={newTemplate.default_expiry_days || ''}
                    onChange={(e) => setNewTemplate({
                      ...newTemplate,
                      default_expiry_days: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="w-full px-4 py-2 bg-[var(--bg-default)] border border-[var(--primary)]/20 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Dejar vacío para sin expiración"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Campos Personalizados</h3>
                <button
                  onClick={handleAddField}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Campo
                </button>
              </div>

              {newTemplate.fields.length > 0 ? (
                <div className="space-y-3">
                  {newTemplate.fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-[var(--bg-default)] rounded-lg border border-[var(--primary)]/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Nombre del campo (variable)
                          </label>
                          <input
                            type="text"
                            value={field.field_name}
                            onChange={(e) => {
                              const newFields = [...newTemplate.fields];
                              newFields[index] = { ...field, field_name: e.target.value };
                              setNewTemplate({ ...newTemplate, fields: newFields });
                            }}
                            className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--primary)]/20 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            placeholder="nombre_campo"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Etiqueta
                          </label>
                          <input
                            type="text"
                            value={field.field_label}
                            onChange={(e) => {
                              const newFields = [...newTemplate.fields];
                              newFields[index] = { ...field, field_label: e.target.value };
                              setNewTemplate({ ...newTemplate, fields: newFields });
                            }}
                            className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--primary)]/20 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            placeholder="Etiqueta visible"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Tipo de campo
                          </label>
                          <select
                            value={field.field_type}
                            onChange={(e) => {
                              const newFields = [...newTemplate.fields];
                              newFields[index] = { ...field, field_type: e.target.value };
                              setNewTemplate({ ...newTemplate, fields: newFields });
                            }}
                            className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--primary)]/20 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          >
                            {fieldTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.is_required}
                              onChange={(e) => {
                                const newFields = [...newTemplate.fields];
                                newFields[index] = { ...field, is_required: e.target.checked };
                                setNewTemplate({ ...newTemplate, fields: newFields });
                              }}
                              className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                            />
                            <span className="text-xs text-[var(--text-primary)]">Requerido</span>
                          </label>

                          <button
                            onClick={() => handleDeleteField(index)}
                            className="ml-auto p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar campo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                  No hay campos personalizados. Haz clic en &quot;Agregar Campo&quot; para crear uno.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[var(--bg-paper)] border-t border-[var(--primary)]/20 p-6 rounded-b-lg">
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={creating}
                className="px-6 py-2 bg-[var(--bg-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newTemplate.name || !newTemplate.category || !newTemplate.content}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear Plantilla
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TemplatePreviewModal = ({ template }: { template: ConsentTemplate }): JSX.Element => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--bg-paper)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-[var(--bg-paper)] border-b border-[var(--primary)]/20 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{template.name}</h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-[var(--text-secondary)]">
                Categoría: {getCategoryLabel(template.category)}
              </span>
              {template.tenant_id ? (
                <span className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <Building className="w-4 h-4" />
                  Plantilla de clínica
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <Globe className="w-4 h-4" />
                  Plantilla global
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Template Properties */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--bg-default)] rounded-lg">
              <div className="flex items-center gap-2">
                {template.requires_witness ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-[var(--text-primary)]">Requiere testigo</span>
              </div>
              <div className="flex items-center gap-2">
                {template.requires_id_verification ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-[var(--text-primary)]">Requiere verificación ID</span>
              </div>
              <div className="flex items-center gap-2">
                {template.can_be_revoked ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
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
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                  Campos personalizados
                </h3>
                <div className="space-y-2">
                  {template.fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 bg-[var(--bg-default)] rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-[var(--text-primary)]">{field.field_label}</span>
                        <span className="ml-2 text-xs text-[var(--text-secondary)]">
                          ({field.field_type})
                        </span>
                        {field.is_required && (
                          <span className="ml-2 text-xs text-red-600">*requerido</span>
                        )}
                      </div>
                      <code className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded">
                        {`{{${field.field_name}}}`}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                Contenido de la plantilla
              </h3>
              <div
                className="prose max-w-none p-4 bg-[var(--bg-default)] rounded-lg text-[var(--text-primary)]"
                dangerouslySetInnerHTML={{ __html: template.content }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Cargando plantillas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Feedback Notification */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-2 hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Plantillas de Consentimiento
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Administra plantillas de consentimientos informados
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nueva Plantilla
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">{template.name}</h3>
              </div>
              {template.tenant_id ? (
                <Building className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Globe className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="inline-block px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-xs font-medium">
                {getCategoryLabel(template.category)}
              </div>

              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                {template.requires_witness && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Requiere testigo</span>
                  </div>
                )}
                {template.requires_id_verification && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Requiere ID</span>
                  </div>
                )}
                {template.default_expiry_days && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Expira en {template.default_expiry_days} días</span>
                  </div>
                )}
              </div>

              {template.fields && template.fields.length > 0 && (
                <div className="text-xs text-[var(--text-secondary)]">
                  {template.fields.length} campo{template.fields.length !== 1 ? 's' : ''} personalizado
                  {template.fields.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPreviewTemplate(template)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--bg-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors border border-[var(--primary)]/20"
              >
                <Eye className="w-4 h-4" />
                Vista previa
              </button>
              {template.tenant_id && (
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-12 text-center">
          <FileText className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">No hay plantillas disponibles</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Crear primera plantilla
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && <EditTemplateModal template={editingTemplate} />}

      {/* Preview Modal */}
      {previewTemplate && <TemplatePreviewModal template={previewTemplate} />}

      {/* Create Modal */}
      {showCreateModal && <CreateTemplateModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchTemplates(); }} />}
    </div>
  );
}
