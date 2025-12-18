"use client";

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FileText, Plus, Edit, Eye, Globe, Building, CheckCircle, XCircle } from 'lucide-react';

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
      console.error('Error fetching templates:', error);
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
                  onClick={() => {
                    /* TODO: Implement edit */
                  }}
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

      {/* Preview Modal */}
      {previewTemplate && <TemplatePreviewModal template={previewTemplate} />}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-paper)] rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Nueva Plantilla</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Esta funcionalidad estará disponible próximamente.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
