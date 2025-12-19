"use client";

import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  Globe,
} from 'lucide-react';

interface TimeOffType {
  id: string;
  tenant_id: string | null;
  code: string;
  name: string;
  description: string | null;
  is_paid: boolean;
  requires_approval: boolean;
  max_days_per_year: number | null;
  min_notice_days: number;
  color_code: string;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  is_paid: boolean;
  requires_approval: boolean;
  max_days_per_year: string;
  min_notice_days: string;
  color_code: string;
}

const DEFAULT_FORM: FormData = {
  code: '',
  name: '',
  description: '',
  is_paid: true,
  requires_approval: true,
  max_days_per_year: '',
  min_notice_days: '1',
  color_code: '#3B82F6',
};

const COLOR_OPTIONS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6B7280', // Gray
];

export default function TimeOffTypesPage(): JSX.Element {
  const params = useParams();
  const clinic = params?.clinic as string;

  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTypes();
  }, [clinic]);

  const fetchTypes = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/staff/time-off/types?clinic=${clinic}&include_inactive=true`);
      if (!response.ok) throw new Error('Error al cargar');
      const result = await response.json();
      setTypes(result.data || []);
    } catch (e) {
      console.error('Error fetching types:', e);
      setError('Error al cargar tipos de ausencia');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.code.trim() || !formData.name.trim()) {
      setError('Código y nombre son requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        max_days_per_year: formData.max_days_per_year ? parseInt(formData.max_days_per_year) : null,
        min_notice_days: parseInt(formData.min_notice_days) || 1,
      };

      if (editingId) {
        // Update
        const response = await fetch('/api/staff/time-off/types', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al actualizar');
        }
      } else {
        // Create
        const response = await fetch('/api/staff/time-off/types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al crear');
        }
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(DEFAULT_FORM);
      fetchTypes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (type: TimeOffType): void => {
    if (type.tenant_id === null) {
      setError('No puedes editar tipos globales del sistema');
      return;
    }
    setEditingId(type.id);
    setFormData({
      code: type.code,
      name: type.name,
      description: type.description || '',
      is_paid: type.is_paid,
      requires_approval: type.requires_approval,
      max_days_per_year: type.max_days_per_year?.toString() || '',
      min_notice_days: type.min_notice_days.toString(),
      color_code: type.color_code,
    });
    setShowForm(true);
  };

  const handleDelete = async (type: TimeOffType): Promise<void> => {
    if (type.tenant_id === null) {
      setError('No puedes eliminar tipos globales del sistema');
      return;
    }

    if (!confirm(`¿Eliminar el tipo "${type.name}"?`)) return;

    try {
      const response = await fetch(`/api/staff/time-off/types?id=${type.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar');
      }

      const result = await response.json();
      alert(result.message);
      fetchTypes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  const handleToggleActive = async (type: TimeOffType): Promise<void> => {
    if (type.tenant_id === null) return;

    try {
      const response = await fetch('/api/staff/time-off/types', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: type.id, is_active: !type.is_active }),
      });

      if (!response.ok) throw new Error('Error al actualizar');
      fetchTypes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar');
    }
  };

  const globalTypes = types.filter(t => t.tenant_id === null);
  const customTypes = types.filter(t => t.tenant_id !== null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Tipos de Ausencia
          </h1>
          <p className="text-[var(--text-secondary)]">
            Administrar tipos de ausencias y permisos del personal
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData(DEFAULT_FORM);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Nuevo Tipo
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {editingId ? 'Editar Tipo de Ausencia' : 'Nuevo Tipo de Ausencia'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="EJ: COMP_OFF"
                    disabled={!!editingId}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Compensatorio"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción opcional del tipo de ausencia..."
                  rows={2}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Máximo días/año
                  </label>
                  <input
                    type="number"
                    value={formData.max_days_per_year}
                    onChange={(e) => setFormData({ ...formData, max_days_per_year: e.target.value })}
                    placeholder="Sin límite"
                    min="1"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Aviso previo (días)
                  </label>
                  <input
                    type="number"
                    value={formData.min_notice_days}
                    onChange={(e) => setFormData({ ...formData, min_notice_days: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color_code: color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color_code === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_paid}
                    onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Con goce de sueldo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_approval}
                    onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Requiere aprobación</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(DEFAULT_FORM);
                  setError(null);
                }}
                className="px-4 py-2 text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Tipo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Cargando...</p>
        </div>
      ) : (
        <>
          {/* Global Types */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--text-secondary)]" />
              Tipos del Sistema
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Estos tipos están disponibles para todas las clínicas y no se pueden modificar.
            </p>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {globalTypes.map((type) => (
                  <div
                    key={type.id}
                    className="p-4 flex items-center gap-4"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: type.color_code }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">{type.name}</span>
                        <span className="text-xs text-[var(--text-tertiary)] bg-gray-100 px-2 py-0.5 rounded">
                          {type.code}
                        </span>
                      </div>
                      {type.description && (
                        <p className="text-sm text-[var(--text-secondary)] truncate">{type.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                      {type.is_paid && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Pagado
                        </span>
                      )}
                      {type.max_days_per_year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {type.max_days_per_year} días/año
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Types */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Tipos Personalizados
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Tipos de ausencia específicos para tu clínica.
            </p>

            {customTypes.length === 0 ? (
              <div className="bg-[var(--bg-secondary)] rounded-xl p-8 text-center">
                <Clock className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">
                  No has creado tipos personalizados aún
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-[var(--primary)] font-medium hover:underline"
                >
                  Crear el primero
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {customTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 flex items-center gap-4 ${!type.is_active ? 'opacity-50' : ''}`}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: type.color_code }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--text-primary)]">{type.name}</span>
                          <span className="text-xs text-[var(--text-tertiary)] bg-gray-100 px-2 py-0.5 rounded">
                            {type.code}
                          </span>
                          {!type.is_active && (
                            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              Inactivo
                            </span>
                          )}
                        </div>
                        {type.description && (
                          <p className="text-sm text-[var(--text-secondary)] truncate">{type.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        {type.is_paid && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Pagado
                          </span>
                        )}
                        {type.max_days_per_year && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {type.max_days_per_year} días/año
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(type)}
                          className={`p-2 rounded-lg transition-colors ${
                            type.is_active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={type.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {type.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2 text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(type)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
