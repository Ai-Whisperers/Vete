"use client";

import { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Tag,
  AlertCircle
} from 'lucide-react';

interface DiagnosisCode {
  id?: string;
  code: string;
  term?: string;
  description: string;
  category?: string;
}

type SortField = 'code' | 'description' | 'category';
type SortDirection = 'asc' | 'desc';

export default function DiagnosisCodesClient() {
  const [codes, setCodes] = useState<DiagnosisCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiagnosisCode | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    term: '',
    description: '',
    category: ''
  });

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagnosis_codes');
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(codes.map(c => c.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [codes]);

  // Filter and sort codes
  const filteredCodes = useMemo(() => {
    let result = [...codes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.code.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.term?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(c => c.category === categoryFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [codes, searchTerm, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetForm = () => {
    setFormData({ code: '', term: '', description: '', category: '' });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/diagnosis_codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      resetForm();
      setIsAddModalOpen(false);
      fetchCodes();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;

    const res = await fetch('/api/diagnosis_codes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingCode.code, ...formData }),
    });
    if (res.ok) {
      resetForm();
      setIsEditModalOpen(false);
      setEditingCode(null);
      fetchCodes();
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('¿Estás seguro de eliminar este código?')) return;

    await fetch('/api/diagnosis_codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: code }),
    });
    fetchCodes();
  };

  const openEditModal = (item: DiagnosisCode) => {
    setEditingCode(item);
    setFormData({
      code: item.code,
      term: item.term || '',
      description: item.description,
      category: item.category || ''
    });
    setIsEditModalOpen(true);
  };

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
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Herramienta Clínica</p>
              <h1 className="text-3xl md:text-4xl font-black">Códigos de Diagnóstico</h1>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl text-lg">
            Base de datos de códigos VeNom/SNOMED para diagnósticos veterinarios estandarizados.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código, término o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Agregar Código
            </button>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] mb-4">
          {filteredCodes.length} código{filteredCodes.length !== 1 ? 's' : ''} encontrado{filteredCodes.length !== 1 ? 's' : ''}
        </p>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">Cargando códigos...</p>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-[var(--text-muted)] font-medium">No se encontraron códigos</p>
              <p className="text-sm text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th
                      className="text-left p-4 font-bold text-[var(--text-primary)] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('code')}
                    >
                      Código <SortIcon field="code" />
                    </th>
                    <th
                      className="text-left p-4 font-bold text-[var(--text-primary)] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('description')}
                    >
                      Descripción <SortIcon field="description" />
                    </th>
                    <th
                      className="text-left p-4 font-bold text-[var(--text-primary)] cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('category')}
                    >
                      Categoría <SortIcon field="category" />
                    </th>
                    <th className="text-right p-4 font-bold text-[var(--text-primary)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((item) => (
                    <tr key={item.code} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-[var(--primary)]">{item.code}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[var(--text-primary)]">{item.term || item.description}</p>
                        {item.term && item.description !== item.term && (
                          <p className="text-sm text-[var(--text-muted)] mt-1">{item.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        {item.category && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium rounded-full">
                            <Tag className="w-3 h-3" />
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label={`Editar código ${item.code}`}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.code)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Eliminar código ${item.code}`}
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

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-800">Nomenclatura Estandarizada</p>
            <p className="text-sm text-blue-700">
              Utilice códigos VeNom (Veterinary Nomenclature) o SNOMED-CT para mantener consistencia en los registros médicos.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {isEditModalOpen ? 'Editar Código' : 'Agregar Código de Diagnóstico'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingCode(null);
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
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: VN-1234"
                  required
                  disabled={isEditModalOpen}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Término
                </label>
                <input
                  type="text"
                  value={formData.term}
                  onChange={(e) => setFormData({...formData, term: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Dermatitis alérgica"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] h-24 resize-none"
                  placeholder="Descripción detallada del diagnóstico"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Dermatología, Cardiología, etc."
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingCode(null);
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
                  {isEditModalOpen ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
