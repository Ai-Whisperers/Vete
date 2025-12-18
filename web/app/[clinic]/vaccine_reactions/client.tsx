"use client";
import { useEffect, useState, useMemo } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { AlertTriangle, Plus, Search, Edit2, Trash2, X, ChevronUp, ChevronDown, Syringe, Calendar, AlertCircle, FileText, Clock } from 'lucide-react';

interface VaccineReaction {
  id: string;
  vaccine_id: string;
  vaccine_name?: string;
  pet_name?: string;
  reaction_type?: string;
  reaction_detail: string;
  severity?: 'leve' | 'moderada' | 'severa';
  occurred_at: string;
  resolved_at?: string;
  treatment?: string;
}

type SortField = 'vaccine_name' | 'reaction_type' | 'severity' | 'occurred_at';
type SortDirection = 'asc' | 'desc';

const REACTION_TYPES = [
  { value: 'local', label: 'Reacción Local', desc: 'Hinchazón, dolor o enrojecimiento en el sitio de inyección' },
  { value: 'sistemica', label: 'Reacción Sistémica', desc: 'Fiebre, letargia, pérdida de apetito' },
  { value: 'alergica', label: 'Reacción Alérgica', desc: 'Urticaria, edema facial, dificultad respiratoria' },
  { value: 'anafilactica', label: 'Anafilaxia', desc: 'Reacción severa que requiere atención inmediata' },
  { value: 'digestiva', label: 'Alteración Digestiva', desc: 'Vómitos, diarrea' },
  { value: 'neurologica', label: 'Alteración Neurológica', desc: 'Convulsiones, ataxia, cambios de comportamiento' },
  { value: 'otra', label: 'Otra', desc: 'Otra reacción no especificada' },
];

const SEVERITY_OPTIONS = [
  { value: 'leve', label: 'Leve', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'moderada', label: 'Moderada', color: 'bg-orange-100 text-orange-700' },
  { value: 'severa', label: 'Severa', color: 'bg-red-100 text-red-700' },
];

export default function VaccineReactionsClient() {
  const { user, loading } = useAuthRedirect();
  const [reactions, setReactions] = useState<VaccineReaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('occurred_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReaction, setEditingReaction] = useState<VaccineReaction | null>(null);

  // Form states
  const [formVaccineId, setFormVaccineId] = useState('');
  const [formVaccineName, setFormVaccineName] = useState('');
  const [formReactionType, setFormReactionType] = useState('');
  const [formDetail, setFormDetail] = useState('');
  const [formSeverity, setFormSeverity] = useState<'leve' | 'moderada' | 'severa'>('leve');
  const [formDate, setFormDate] = useState('');
  const [formTreatment, setFormTreatment] = useState('');

  const fetchReactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vaccine_reactions');
      if (res.ok) {
        const data = await res.json();
        setReactions(data);
      }
    } catch (error) {
      console.error('Error fetching vaccine reactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchReactions();
    }
  }, [loading, user]);

  // Filter and sort
  const filteredReactions = useMemo(() => {
    let result = [...reactions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.vaccine_name?.toLowerCase().includes(term) ||
        r.reaction_detail.toLowerCase().includes(term) ||
        r.pet_name?.toLowerCase().includes(term)
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter(r => r.severity === severityFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'vaccine_name') {
        comparison = (a.vaccine_name || '').localeCompare(b.vaccine_name || '');
      } else if (sortField === 'reaction_type') {
        comparison = (a.reaction_type || '').localeCompare(b.reaction_type || '');
      } else if (sortField === 'severity') {
        const severityOrder = { leve: 1, moderada: 2, severa: 3 };
        comparison = (severityOrder[a.severity || 'leve'] || 0) - (severityOrder[b.severity || 'leve'] || 0);
      } else if (sortField === 'occurred_at') {
        comparison = new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [reactions, searchTerm, severityFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 inline ml-1" /> :
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const resetForm = () => {
    setFormVaccineId('');
    setFormVaccineName('');
    setFormReactionType('');
    setFormDetail('');
    setFormSeverity('leve');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTreatment('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (reaction: VaccineReaction) => {
    setEditingReaction(reaction);
    setFormVaccineId(reaction.vaccine_id);
    setFormVaccineName(reaction.vaccine_name || '');
    setFormReactionType(reaction.reaction_type || '');
    setFormDetail(reaction.reaction_detail);
    setFormSeverity(reaction.severity || 'leve');
    setFormDate(reaction.occurred_at?.split('T')[0] || '');
    setFormTreatment(reaction.treatment || '');
    setShowEditModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      vaccine_id: formVaccineId,
      vaccine_name: formVaccineName,
      reaction_type: formReactionType,
      reaction_detail: formDetail,
      severity: formSeverity,
      occurred_at: formDate,
      treatment: formTreatment || null
    };
    const res = await fetch('/api/vaccine_reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowAddModal(false);
      resetForm();
      fetchReactions();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReaction) return;

    const payload = {
      id: editingReaction.id,
      vaccine_id: formVaccineId,
      vaccine_name: formVaccineName,
      reaction_type: formReactionType,
      reaction_detail: formDetail,
      severity: formSeverity,
      occurred_at: formDate,
      treatment: formTreatment || null
    };
    const res = await fetch('/api/vaccine_reactions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditingReaction(null);
      resetForm();
      fetchReactions();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro de reacción?')) return;

    await fetch('/api/vaccine_reactions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchReactions();
  };

  const getSeverityBadge = (severity?: string) => {
    const option = SEVERITY_OPTIONS.find(s => s.value === severity);
    if (!option) return null;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${option.color}`}>
        {option.label}
      </span>
    );
  };

  const getReactionTypeLabel = (type?: string) => {
    const option = REACTION_TYPES.find(r => r.value === type);
    return option?.label || type || 'No especificado';
  };

  // Stats
  const stats = useMemo(() => {
    const total = reactions.length;
    const severas = reactions.filter(r => r.severity === 'severa').length;
    const moderadas = reactions.filter(r => r.severity === 'moderada').length;
    const leves = reactions.filter(r => r.severity === 'leve').length;
    return { total, severas, moderadas, leves };
  }, [reactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)]">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 h-64 animate-pulse" />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-500 to-orange-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              Farmacovigilancia
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Reacciones Adversas a Vacunas
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Registra y monitorea eventos adversos post-vacunación. Sistema de farmacovigilancia para mejorar la seguridad de tus pacientes.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <FileText className="w-5 h-5" />
              <span>{stats.total} registros</span>
            </div>
            {stats.severas > 0 && (
              <div className="flex items-center gap-2 bg-red-600/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <AlertCircle className="w-5 h-5" />
                <span>{stats.severas} severas</span>
              </div>
            )}
            {stats.moderadas > 0 && (
              <div className="flex items-center gap-2 bg-orange-600/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span>{stats.moderadas} moderadas</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por vacuna, mascota o detalle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                aria-label="Filtrar por severidad"
              >
                <option value="all">Todas las severidades</option>
                <option value="leve">Leves</option>
                <option value="moderada">Moderadas</option>
                <option value="severa">Severas</option>
              </select>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                aria-label="Registrar nueva reacción adversa"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Registrar Reacción</span>
              </button>
            </div>
          </div>

          {/* Active filters info */}
          {(searchTerm || severityFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrando {filteredReactions.length} de {reactions.length} registros</span>
              <button
                onClick={() => { setSearchTerm(''); setSeverityFilter('all'); }}
                className="text-red-500 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredReactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {searchTerm || severityFilter !== 'all' ? 'No se encontraron registros' : 'Sin reacciones registradas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || severityFilter !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros.'
                : 'Esto es bueno - significa que no hay eventos adversos reportados.'}
            </p>
            {!searchTerm && severityFilter === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Registrar Primera Reacción
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('occurred_at')}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha
                        <SortIcon field="occurred_at" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('vaccine_name')}
                    >
                      <span className="flex items-center gap-2">
                        <Syringe className="w-4 h-4" />
                        Vacuna
                        <SortIcon field="vaccine_name" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('reaction_type')}
                    >
                      <span className="flex items-center gap-2">
                        Tipo
                        <SortIcon field="reaction_type" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('severity')}
                    >
                      <span className="flex items-center gap-2">
                        Severidad
                        <SortIcon field="severity" />
                      </span>
                    </th>
                    <th className="text-left p-4 font-bold text-gray-700">Detalle</th>
                    <th className="text-right p-4 font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReactions.map((reaction, index) => (
                    <tr
                      key={reaction.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {new Date(reaction.occurred_at).toLocaleDateString('es-PY', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{reaction.vaccine_name || reaction.vaccine_id}</div>
                        {reaction.pet_name && (
                          <div className="text-xs text-gray-500">{reaction.pet_name}</div>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">
                        {getReactionTypeLabel(reaction.reaction_type)}
                      </td>
                      <td className="p-4">
                        {getSeverityBadge(reaction.severity)}
                      </td>
                      <td className="p-4 text-gray-500 text-sm max-w-xs truncate">
                        {reaction.reaction_detail || '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(reaction)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={`Editar reacción de ${reaction.vaccine_name || 'vacuna'}`}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(reaction.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Eliminar reacción de ${reaction.vaccine_name || 'vacuna'}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Guía de Farmacovigilancia
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="mb-2">
                <strong>¿Cuándo reportar?</strong> Cualquier evento adverso que ocurra después de la vacunación, incluso si no está seguro de la relación causal.
              </p>
              <p>
                <strong>Tiempo de observación:</strong> Las reacciones pueden ocurrir desde minutos hasta 3-4 semanas post-vacunación.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Reacciones comunes:</strong> Dolor local, letargia leve y fiebre baja son normales y suelen resolverse en 24-48 horas.
              </p>
              <p>
                <strong>Urgencia:</strong> Edema facial, dificultad respiratoria o colapso requieren atención veterinaria inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 bg-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Registrar Reacción Adversa</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ID Vacuna *</label>
                  <input
                    type="text"
                    value={formVaccineId}
                    onChange={(e) => setFormVaccineId(e.target.value)}
                    placeholder="ID o lote"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Vacuna</label>
                  <input
                    type="text"
                    value={formVaccineName}
                    onChange={(e) => setFormVaccineName(e.target.value)}
                    placeholder="Ej: Rabia, Séxtuple"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Reacción *</label>
                <select
                  value={formReactionType}
                  onChange={(e) => setFormReactionType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  {REACTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Severidad *</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as 'leve' | 'moderada' | 'severa')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    {SEVERITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fecha *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Detallada *</label>
                <textarea
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="Describa los síntomas observados, tiempo de aparición, evolución..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tratamiento Aplicado</label>
                <textarea
                  value={formTreatment}
                  onChange={(e) => setFormTreatment(e.target.value)}
                  placeholder="Medicamentos administrados, medidas de soporte..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingReaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 bg-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Edit2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Editar Reacción</h2>
                </div>
                <button
                  onClick={() => { setShowEditModal(false); setEditingReaction(null); }}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ID Vacuna *</label>
                  <input
                    type="text"
                    value={formVaccineId}
                    onChange={(e) => setFormVaccineId(e.target.value)}
                    placeholder="ID o lote"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Vacuna</label>
                  <input
                    type="text"
                    value={formVaccineName}
                    onChange={(e) => setFormVaccineName(e.target.value)}
                    placeholder="Ej: Rabia, Séxtuple"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Reacción *</label>
                <select
                  value={formReactionType}
                  onChange={(e) => setFormReactionType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  {REACTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Severidad *</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as 'leve' | 'moderada' | 'severa')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    {SEVERITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fecha *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Detallada *</label>
                <textarea
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="Describa los síntomas observados, tiempo de aparición, evolución..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tratamiento Aplicado</label>
                <textarea
                  value={formTreatment}
                  onChange={(e) => setFormTreatment(e.target.value)}
                  placeholder="Medicamentos administrados, medidas de soporte..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingReaction(null); }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
