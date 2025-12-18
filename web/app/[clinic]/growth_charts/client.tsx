"use client";
import { useEffect, useState, useMemo } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { TrendingUp, Plus, Search, Edit2, Trash2, X, ChevronUp, ChevronDown, LineChart, Dog, Cat, Scale, Calendar } from 'lucide-react';

interface GrowthChart {
  id: string;
  breed: string;
  species?: string;
  age_months: number;
  weight_kg: number;
  percentile?: number;
  notes?: string;
}

type SortField = 'breed' | 'species' | 'age_months' | 'weight_kg';
type SortDirection = 'asc' | 'desc';

export default function GrowthChartsClient() {
  const { user, loading } = useAuthRedirect();
  const [charts, setCharts] = useState<GrowthChart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('breed');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChart, setEditingChart] = useState<GrowthChart | null>(null);

  // Form states
  const [formBreed, setFormBreed] = useState('');
  const [formSpecies, setFormSpecies] = useState('perro');
  const [formAge, setFormAge] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const fetchCharts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/growth_charts');
      if (res.ok) {
        const data = await res.json();
        setCharts(data);
      }
    } catch (error) {
      console.error('Error fetching growth charts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchCharts();
    }
  }, [loading, user]);

  // Filter and sort charts
  const filteredCharts = useMemo(() => {
    let result = [...charts];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.breed.toLowerCase().includes(term) ||
        c.notes?.toLowerCase().includes(term)
      );
    }

    // Species filter
    if (speciesFilter !== 'all') {
      result = result.filter(c => c.species === speciesFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'breed') {
        comparison = a.breed.localeCompare(b.breed);
      } else if (sortField === 'species') {
        comparison = (a.species || '').localeCompare(b.species || '');
      } else if (sortField === 'age_months') {
        comparison = a.age_months - b.age_months;
      } else if (sortField === 'weight_kg') {
        comparison = a.weight_kg - b.weight_kg;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [charts, searchTerm, speciesFilter, sortField, sortDirection]);

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
    setFormBreed('');
    setFormSpecies('perro');
    setFormAge('');
    setFormWeight('');
    setFormNotes('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (chart: GrowthChart) => {
    setEditingChart(chart);
    setFormBreed(chart.breed);
    setFormSpecies(chart.species || 'perro');
    setFormAge(chart.age_months.toString());
    setFormWeight(chart.weight_kg.toString());
    setFormNotes(chart.notes || '');
    setShowEditModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      breed: formBreed,
      species: formSpecies,
      age_months: Number(formAge),
      weight_kg: Number(formWeight),
      notes: formNotes || null
    };
    const res = await fetch('/api/growth_charts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowAddModal(false);
      resetForm();
      fetchCharts();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChart) return;

    const payload = {
      id: editingChart.id,
      breed: formBreed,
      species: formSpecies,
      age_months: Number(formAge),
      weight_kg: Number(formWeight),
      notes: formNotes || null
    };
    const res = await fetch('/api/growth_charts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditingChart(null);
      resetForm();
      fetchCharts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    await fetch('/api/growth_charts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchCharts();
  };

  const getSpeciesIcon = (species?: string) => {
    if (species === 'gato') return <Cat className="w-4 h-4" />;
    return <Dog className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)]">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] h-64 animate-pulse" />
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
      <section className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8" />
            </div>
            <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              Herramienta Clínica
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Curvas de Crecimiento
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Registra y monitorea el crecimiento de tus pacientes. Compara pesos por edad y raza para detectar anomalías tempranas.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <LineChart className="w-5 h-5" />
              <span>{charts.length} registros</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Dog className="w-5 h-5" />
              <span>Perros y Gatos</span>
            </div>
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
                placeholder="Buscar por raza o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Species Filter */}
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                aria-label="Filtrar por especie"
              >
                <option value="all">Todas las especies</option>
                <option value="perro">🐕 Perros</option>
                <option value="gato">🐱 Gatos</option>
              </select>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                aria-label="Agregar nuevo registro de crecimiento"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Agregar Registro</span>
              </button>
            </div>
          </div>

          {/* Active filters info */}
          {(searchTerm || speciesFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrando {filteredCharts.length} de {charts.length} registros</span>
              <button
                onClick={() => { setSearchTerm(''); setSpeciesFilter('all'); }}
                className="text-[var(--primary)] hover:underline"
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
        ) : filteredCharts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {searchTerm || speciesFilter !== 'all' ? 'No se encontraron registros' : 'Sin registros de crecimiento'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || speciesFilter !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros.'
                : 'Comienza agregando registros de peso y edad de tus pacientes.'}
            </p>
            {!searchTerm && speciesFilter === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Agregar Primer Registro
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
                      onClick={() => handleSort('species')}
                    >
                      <span className="flex items-center gap-2">
                        Especie
                        <SortIcon field="species" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('breed')}
                    >
                      <span className="flex items-center gap-2">
                        Raza
                        <SortIcon field="breed" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('age_months')}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Edad (meses)
                        <SortIcon field="age_months" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('weight_kg')}
                    >
                      <span className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Peso (kg)
                        <SortIcon field="weight_kg" />
                      </span>
                    </th>
                    <th className="text-left p-4 font-bold text-gray-700">Notas</th>
                    <th className="text-right p-4 font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharts.map((chart, index) => (
                    <tr
                      key={chart.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-lg ${
                            chart.species === 'gato' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {getSpeciesIcon(chart.species)}
                          </span>
                          <span className="capitalize">{chart.species || 'perro'}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-900">{chart.breed}</td>
                      <td className="p-4 text-gray-600">{chart.age_months}</td>
                      <td className="p-4">
                        <span className="font-bold text-[var(--primary)]">{chart.weight_kg} kg</span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm max-w-xs truncate">
                        {chart.notes || '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(chart)}
                            className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={`Editar registro de ${chart.breed}`}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(chart.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Eliminar registro de ${chart.breed}`}
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
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-[var(--primary)]" />
            Sobre las Curvas de Crecimiento
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="mb-2">
                <strong>¿Para qué sirven?</strong> Las curvas de crecimiento permiten monitorear el desarrollo de cachorros y gatitos, comparando su peso con valores de referencia por raza y edad.
              </p>
              <p>
                <strong>Frecuencia recomendada:</strong> Registrar peso semanalmente durante los primeros 6 meses, luego mensualmente hasta el año de edad.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Señales de alerta:</strong> Pérdida de peso, estancamiento prolongado, o crecimiento excesivamente rápido pueden indicar problemas de salud.
              </p>
              <p>
                <strong>Tip:</strong> Pesar siempre a la misma hora del día, preferiblemente antes de alimentar al paciente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Agregar Registro</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Especie *</label>
                <select
                  value={formSpecies}
                  onChange={(e) => setFormSpecies(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  required
                >
                  <option value="perro">🐕 Perro</option>
                  <option value="gato">🐱 Gato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Raza *</label>
                <input
                  type="text"
                  value={formBreed}
                  onChange={(e) => setFormBreed(e.target.value)}
                  placeholder="Ej: Golden Retriever, Siamés"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Edad (meses) *</label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="240"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Notas (opcional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
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
                  className="flex-1 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Editar Registro</h2>
                <button
                  onClick={() => { setShowEditModal(false); setEditingChart(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Especie *</label>
                <select
                  value={formSpecies}
                  onChange={(e) => setFormSpecies(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  required
                >
                  <option value="perro">🐕 Perro</option>
                  <option value="gato">🐱 Gato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Raza *</label>
                <input
                  type="text"
                  value={formBreed}
                  onChange={(e) => setFormBreed(e.target.value)}
                  placeholder="Ej: Golden Retriever, Siamés"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Edad (meses) *</label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="240"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Notas (opcional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingChart(null); }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
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
