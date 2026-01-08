'use client'

import { useEffect, useState, useMemo } from 'react'
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
  AlertCircle,
} from 'lucide-react'

interface DiagnosisCode {
  id?: string
  code: string
  term?: string
  description: string
  category?: string
}

type SortField = 'code' | 'description' | 'category'
type SortDirection = 'asc' | 'desc'

export default function DiagnosisCodesClient() {
  const [codes, setCodes] = useState<DiagnosisCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<DiagnosisCode | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    term: '',
    description: '',
    category: '',
  })

  const fetchCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/diagnosis_codes')
      if (res.ok) {
        const data = await res.json()
        setCodes(data)
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching codes:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(codes.map((c) => c.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [codes])

  // Filter and sort codes
  const filteredCodes = useMemo(() => {
    let result = [...codes]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.term?.toLowerCase().includes(term)
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter((c) => c.category === categoryFilter)
    }

    result.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''

      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [codes, searchTerm, categoryFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const resetForm = () => {
    setFormData({ code: '', term: '', description: '', category: '' })
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/diagnosis_codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (res.ok) {
      resetForm()
      setIsAddModalOpen(false)
      fetchCodes()
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCode) return

    const res = await fetch('/api/diagnosis_codes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingCode.code, ...formData }),
    })
    if (res.ok) {
      resetForm()
      setIsEditModalOpen(false)
      setEditingCode(null)
      fetchCodes()
    }
  }

  const handleDelete = async (code: string) => {
    if (!confirm('¿Estás seguro de eliminar este código?')) return

    await fetch('/api/diagnosis_codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: code }),
    })
    fetchCodes()
  }

  const openEditModal = (item: DiagnosisCode) => {
    setEditingCode(item)
    setFormData({
      code: item.code,
      term: item.term || '',
      description: item.description,
      category: item.category || '',
    })
    setIsEditModalOpen(true)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 inline h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 inline h-4 w-4" />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] py-16 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-32 w-32 rounded-full border-4 border-white" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full border-4 border-white" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-white/80">
                Herramienta Clínica
              </p>
              <h1 className="text-3xl font-black md:text-4xl">Códigos de Diagnóstico</h1>
            </div>
          </div>
          <p className="max-w-2xl text-lg text-white/80">
            Base de datos de códigos VeNom/SNOMED para diagnósticos veterinarios estandarizados.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código, término o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                resetForm()
                setIsAddModalOpen(true)
              }}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              Agregar Código
            </button>
          </div>
        </div>

        <p className="mb-4 text-sm text-[var(--text-muted)]">
          {filteredCodes.length} código{filteredCodes.length !== 1 ? 's' : ''} encontrado
          {filteredCodes.length !== 1 ? 's' : ''}
        </p>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
              <p className="text-[var(--text-muted)]">Cargando códigos...</p>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-200" />
              <p className="font-medium text-[var(--text-muted)]">No se encontraron códigos</p>
              <p className="mt-1 text-sm text-gray-400">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-[var(--text-primary)] transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('code')}
                    >
                      Código <SortIcon field="code" />
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-[var(--text-primary)] transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('description')}
                    >
                      Descripción <SortIcon field="description" />
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-[var(--text-primary)] transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('category')}
                    >
                      Categoría <SortIcon field="category" />
                    </th>
                    <th className="p-4 text-right font-bold text-[var(--text-primary)]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((item) => (
                    <tr
                      key={item.code}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <span className="font-mono font-bold text-[var(--primary)]">
                          {item.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[var(--text-primary)]">
                          {item.term || item.description}
                        </p>
                        {item.term && item.description !== item.term && (
                          <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        {item.category && (
                          <span className="bg-[var(--primary)]/10 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-[var(--primary)]">
                            <Tag className="h-3 w-3" />
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            aria-label={`Editar código ${item.code}`}
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.code)}
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            aria-label={`Eliminar código ${item.code}`}
                          >
                            <Trash2 className="h-5 w-5" />
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
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="font-bold text-blue-800">Nomenclatura Estandarizada</p>
            <p className="text-sm text-blue-700">
              Utilice códigos VeNom (Veterinary Nomenclature) o SNOMED-CT para mantener consistencia
              en los registros médicos.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {isEditModalOpen ? 'Editar Código' : 'Agregar Código de Diagnóstico'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                  setEditingCode(null)
                  resetForm()
                }}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEdit : handleAdd} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: VN-1234"
                  required
                  disabled={isEditModalOpen}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Término
                </label>
                <input
                  type="text"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Dermatitis alérgica"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-24 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Descripción detallada del diagnóstico"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Dermatología, Cardiología, etc."
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setIsEditModalOpen(false)
                    setEditingCode(null)
                    resetForm()
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-[var(--text-secondary)] transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  <Check className="h-5 w-5" />
                  {isEditModalOpen ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
