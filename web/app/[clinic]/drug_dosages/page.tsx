"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Pill,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  X,
  AlertCircle,
  Check,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DrugDosage {
  id: string;
  drug_name: string;
  species?: string;
  dosage_per_kg: number;
  unit: string;
  route?: string;
  frequency?: string;
  notes?: string;
}

type SortField = 'drug_name' | 'dosage_per_kg' | 'species';
type SortDirection = 'asc' | 'desc';

export default function DrugDosagesPage() {
  const params = useParams();
  const clinic = params.clinic as string;

  const [dosages, setDosages] = useState<DrugDosage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('drug_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<DrugDosage | null>(null);
  const [calculatorDrug, setCalculatorDrug] = useState<DrugDosage | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    drug_name: '',
    species: 'perro',
    dosage_per_kg: '',
    unit: 'mg',
    route: 'oral',
    frequency: '',
    notes: ''
  });

  // Calculator state
  const [petWeight, setPetWeight] = useState('');

  const fetchDosages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drug_dosages');
      if (res.ok) {
        const data = await res.json();
        setDosages(data);
      }
    } catch (error) {
      console.error('Error fetching dosages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDosages();
  }, []);

  // Filter and sort dosages
  const filteredDosages = useMemo(() => {
    let result = [...dosages];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.drug_name.toLowerCase().includes(term) ||
        d.notes?.toLowerCase().includes(term)
      );
    }

    // Species filter
    if (speciesFilter !== 'all') {
      result = result.filter(d => d.species === speciesFilter || !d.species);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [dosages, searchTerm, speciesFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetForm = () => {
    setFormData({
      drug_name: '',
      species: 'perro',
      dosage_per_kg: '',
      unit: 'mg',
      route: 'oral',
      frequency: '',
      notes: ''
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      drug_name: formData.drug_name,
      species: formData.species,
      dosage_per_kg: Number(formData.dosage_per_kg),
      unit: formData.unit,
      route: formData.route,
      frequency: formData.frequency,
      notes: formData.notes
    };

    const res = await fetch('/api/drug_dosages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      setIsAddModalOpen(false);
      fetchDosages();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDrug) return;

    const payload = {
      id: editingDrug.id,
      drug_name: formData.drug_name,
      species: formData.species,
      dosage_per_kg: Number(formData.dosage_per_kg),
      unit: formData.unit,
      route: formData.route,
      frequency: formData.frequency,
      notes: formData.notes
    };

    const res = await fetch('/api/drug_dosages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      setIsEditModalOpen(false);
      setEditingDrug(null);
      fetchDosages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este medicamento?')) return;

    await fetch('/api/drug_dosages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchDosages();
  };

  const openEditModal = (drug: DrugDosage) => {
    setEditingDrug(drug);
    setFormData({
      drug_name: drug.drug_name,
      species: drug.species || 'perro',
      dosage_per_kg: String(drug.dosage_per_kg),
      unit: drug.unit,
      route: drug.route || 'oral',
      frequency: drug.frequency || '',
      notes: drug.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const openCalculator = (drug: DrugDosage) => {
    setCalculatorDrug(drug);
    setPetWeight('');
    setIsCalculatorOpen(true);
  };

  const calculatedDose = useMemo(() => {
    if (!calculatorDrug || !petWeight) return null;
    const weight = parseFloat(petWeight);
    if (isNaN(weight) || weight <= 0) return null;
    return (weight * calculatorDrug.dosage_per_kg).toFixed(2);
  }, [calculatorDrug, petWeight]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-white rounded-full" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Pill className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Herramienta Clínica</p>
              <h1 className="text-3xl md:text-4xl font-black">Dosificación de Medicamentos</h1>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl text-lg">
            Consulta y calcula dosis de medicamentos según el peso del paciente.
            Base de datos actualizable para uso veterinario.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>

            {/* Species Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="all">Todas las especies</option>
                <option value="perro">Perros</option>
                <option value="gato">Gatos</option>
                <option value="ave">Aves</option>
                <option value="exotico">Exóticos</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Agregar Medicamento
            </button>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {filteredDosages.length} medicamento{filteredDosages.length !== 1 ? 's' : ''} encontrado{filteredDosages.length !== 1 ? 's' : ''}
        </p>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">Cargando medicamentos...</p>
            </div>
          ) : filteredDosages.length === 0 ? (
            <div className="p-12 text-center">
              <Pill className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-[var(--text-muted)] font-medium">No se encontraron medicamentos</p>
              <p className="text-sm text-gray-400 mt-1">Intenta con otro término de búsqueda o agrega uno nuevo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th
                      className="text-left p-4 font-bold text-[var(--text-primary)] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('drug_name')}
                    >
                      Medicamento <SortIcon field="drug_name" />
                    </th>
                    <th
                      className="text-left p-4 font-bold text-[var(--text-primary)] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('species')}
                    >
                      Especie <SortIcon field="species" />
                    </th>
                    <th
                      className="text-left p-4 font-bold text-[var(--text-primary)] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('dosage_per_kg')}
                    >
                      Dosis/kg <SortIcon field="dosage_per_kg" />
                    </th>
                    <th className="text-left p-4 font-bold text-[var(--text-primary)]">Vía</th>
                    <th className="text-left p-4 font-bold text-[var(--text-primary)]">Frecuencia</th>
                    <th className="text-right p-4 font-bold text-[var(--text-primary)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDosages.map((drug) => (
                    <tr key={drug.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-[var(--text-primary)]">{drug.drug_name}</p>
                        {drug.notes && (
                          <p className="text-xs text-[var(--text-muted)] mt-1">{drug.notes}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium rounded-full capitalize">
                          {drug.species || 'General'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {drug.dosage_per_kg} {drug.unit}
                        </span>
                      </td>
                      <td className="p-4 text-[var(--text-secondary)] capitalize">
                        {drug.route || '-'}
                      </td>
                      <td className="p-4 text-[var(--text-secondary)]">
                        {drug.frequency || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openCalculator(drug)}
                            className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                            title="Calcular dosis"
                            aria-label={`Calcular dosis de ${drug.drug_name}`}
                          >
                            <Calculator className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(drug)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                            aria-label={`Editar ${drug.drug_name}`}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(drug.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                            aria-label={`Eliminar ${drug.drug_name}`}
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
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">Aviso Importante</p>
            <p className="text-sm text-amber-700">
              Esta herramienta es de referencia. Siempre consulte la literatura actualizada y ajuste las dosis según el estado clínico del paciente,
              función renal/hepática y otras consideraciones individuales.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {isEditModalOpen ? 'Editar Medicamento' : 'Agregar Medicamento'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingDrug(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEdit : handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Nombre del Medicamento *
                </label>
                <input
                  type="text"
                  value={formData.drug_name}
                  onChange={(e) => setFormData({...formData, drug_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Amoxicilina"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                    Especie
                  </label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({...formData, species: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="ave">Ave</option>
                    <option value="exotico">Exótico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                    Vía de Administración
                  </label>
                  <select
                    value={formData.route}
                    onChange={(e) => setFormData({...formData, route: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="oral">Oral</option>
                    <option value="iv">Intravenosa (IV)</option>
                    <option value="im">Intramuscular (IM)</option>
                    <option value="sc">Subcutánea (SC)</option>
                    <option value="topica">Tópica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                    Dosis por kg *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dosage_per_kg}
                    onChange={(e) => setFormData({...formData, dosage_per_kg: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                    Unidad *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="UI">UI</option>
                    <option value="mcg">mcg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Frecuencia
                </label>
                <input
                  type="text"
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Cada 12 horas"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] h-24 resize-none"
                  placeholder="Contraindicaciones, precauciones, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingDrug(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-[var(--text-secondary)] font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isEditModalOpen ? 'Guardar Cambios' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {isCalculatorOpen && calculatorDrug && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Calculadora de Dosis
              </h2>
              <button
                onClick={() => {
                  setIsCalculatorOpen(false);
                  setCalculatorDrug(null);
                  setPetWeight('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-[var(--primary)]/5 rounded-xl p-4 mb-6">
                <p className="text-sm text-[var(--text-muted)] mb-1">Medicamento</p>
                <p className="font-bold text-[var(--text-primary)] text-lg">{calculatorDrug.drug_name}</p>
                <p className="text-sm text-[var(--primary)] mt-1">
                  {calculatorDrug.dosage_per_kg} {calculatorDrug.unit}/kg
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Peso del paciente (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={petWeight}
                  onChange={(e) => setPetWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg"
                  placeholder="Ej: 10"
                  autoFocus
                />
              </div>

              {calculatedDose && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <p className="text-sm text-green-700 mb-2">Dosis Calculada</p>
                  <p className="text-4xl font-black text-green-700">
                    {calculatedDose} {calculatorDrug.unit}
                  </p>
                  {calculatorDrug.frequency && (
                    <p className="text-sm text-green-600 mt-2">
                      {calculatorDrug.frequency}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setIsCalculatorOpen(false);
                  setCalculatorDrug(null);
                  setPetWeight('');
                }}
                className="w-full mt-6 px-6 py-3 bg-gray-100 text-[var(--text-secondary)] font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
