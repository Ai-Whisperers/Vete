'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as Icons from 'lucide-react'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
}

interface TestCatalog {
  id: string
  code: string
  name: string
  category: string
  specimen_type: string
  typical_turnaround_hours: number
}

interface Panel {
  id: string
  name: string
  category: string
  tests: { test_id: string }[]
}

interface LabOrderFormProps {
  onSuccess?: (orderId: string) => void
  onCancel?: () => void
}

const categories = [
  { value: 'hematology', label: 'Hematología' },
  { value: 'chemistry', label: 'Química Sanguínea' },
  { value: 'urinalysis', label: 'Urianálisis' },
  { value: 'microbiology', label: 'Microbiología' },
  { value: 'parasitology', label: 'Parasitología' },
  { value: 'serology', label: 'Serología' },
  { value: 'endocrinology', label: 'Endocrinología' },
  { value: 'other', label: 'Otros' }
]

export function LabOrderForm({ onSuccess, onCancel }: LabOrderFormProps) {
  const [pets, setPets] = useState<Pet[]>([])
  const [tests, setTests] = useState<TestCatalog[]>([])
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedPetId, setSelectedPetId] = useState('')
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set())
  const [selectedPanels, setSelectedPanels] = useState<Set<string>>(new Set())
  const [priority, setPriority] = useState('routine')
  const [labType, setLabType] = useState('in_house')
  const [fasting, setFasting] = useState(false)
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pets
      const { data: petsData } = await supabase
        .from('pets')
        .select('id, name, species, breed')
        .order('name')

      // Fetch test catalog
      const { data: testsData } = await supabase
        .from('lab_test_catalog')
        .select('id, code, name, category, specimen_type, typical_turnaround_hours')
        .eq('active', true)
        .order('name')

      // Fetch panels
      const { data: panelsData } = await supabase
        .from('lab_test_panels')
        .select(`
          id,
          name,
          category,
          lab_test_panel_items!inner(test_id)
        `)
        .eq('active', true)
        .order('name')

      setPets(petsData || [])
      setTests(testsData || [])
      setPanels(panelsData?.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        tests: p.lab_test_panel_items as { test_id: string }[]
      })) || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTest = (testId: string) => {
    const newSelected = new Set(selectedTests)
    if (newSelected.has(testId)) {
      newSelected.delete(testId)
    } else {
      newSelected.add(testId)
    }
    setSelectedTests(newSelected)
  }

  const togglePanel = (panelId: string) => {
    const panel = panels.find(p => p.id === panelId)
    if (!panel) return

    const newSelectedPanels = new Set(selectedPanels)
    const newSelectedTests = new Set(selectedTests)

    if (newSelectedPanels.has(panelId)) {
      // Remove panel and its tests
      newSelectedPanels.delete(panelId)
      panel.tests.forEach(t => newSelectedTests.delete(t.test_id))
    } else {
      // Add panel and its tests
      newSelectedPanels.add(panelId)
      panel.tests.forEach(t => newSelectedTests.add(t.test_id))
    }

    setSelectedPanels(newSelectedPanels)
    setSelectedTests(newSelectedTests)
  }

  const filteredTests = tests.filter(test => {
    const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          test.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredPanels = panels.filter(panel => {
    const matchesCategory = categoryFilter === 'all' || panel.category === categoryFilter
    const matchesSearch = panel.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPetId || selectedTests.size === 0) {
      alert('Selecciona una mascota y al menos una prueba')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/lab-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet_id: selectedPetId,
          test_ids: Array.from(selectedTests),
          panel_ids: Array.from(selectedPanels),
          priority,
          lab_type: labType,
          fasting_status: fasting,
          clinical_notes: clinicalNotes || null
        })
      })

      if (!response.ok) throw new Error('Error al crear orden')

      const data = await response.json()
      onSuccess?.(data.id)
    } catch (error) {
      console.error('Error creating lab order:', error)
      alert('Error al crear la orden de laboratorio')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pet Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Mascota <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        >
          <option value="">Seleccionar mascota...</option>
          {pets.map(pet => (
            <option key={pet.id} value={pet.id}>
              {pet.name} - {pet.species} ({pet.breed})
            </option>
          ))}
        </select>
      </div>

      {/* Priority and Lab Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Prioridad
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          >
            <option value="routine">Rutina</option>
            <option value="urgent">Urgente</option>
            <option value="stat">STAT</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Tipo de Laboratorio
          </label>
          <select
            value={labType}
            onChange={(e) => setLabType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          >
            <option value="in_house">Interno</option>
            <option value="external">Externo</option>
          </select>
        </div>
      </div>

      {/* Fasting Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="fasting"
          checked={fasting}
          onChange={(e) => setFasting(e.target.checked)}
          className="w-5 h-5 text-[var(--primary)] rounded focus:ring-2 focus:ring-[var(--primary)]"
        />
        <label htmlFor="fasting" className="text-sm font-medium text-[var(--text-primary)]">
          Paciente en ayunas
        </label>
      </div>

      {/* Test Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Pruebas y Paneles <span className="text-red-500">*</span>
        </label>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar pruebas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        {/* Panels */}
        {filteredPanels.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Paneles de Pruebas
            </h4>
            <div className="space-y-2">
              {filteredPanels.map(panel => (
                <div
                  key={panel.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPanels.has(panel.id)
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => togglePanel(panel.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-[var(--text-primary)]">{panel.name}</h5>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {panel.tests.length} pruebas incluidas
                      </p>
                    </div>
                    {selectedPanels.has(panel.id) && (
                      <Icons.CheckCircle className="w-6 h-6 text-[var(--primary)]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Tests */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Pruebas Individuales
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-4">
            {filteredTests.map(test => (
              <label
                key={test.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedTests.has(test.id)
                    ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTests.has(test.id)}
                  onChange={() => toggleTest(test.id)}
                  className="w-5 h-5 text-[var(--primary)] rounded focus:ring-2 focus:ring-[var(--primary)]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[var(--text-primary)]">{test.name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {test.code} • {test.specimen_type}
                  </div>
                </div>
              </label>
            ))}
            {filteredTests.length === 0 && (
              <p className="text-center text-[var(--text-secondary)] py-8">
                No se encontraron pruebas
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mt-2">
          {selectedTests.size} prueba{selectedTests.size !== 1 ? 's' : ''} seleccionada{selectedTests.size !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Notas Clínicas
        </label>
        <textarea
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          rows={4}
          placeholder="Información clínica relevante, síntomas, diagnóstico presuntivo..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 border border-gray-300 text-[var(--text-primary)] rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !selectedPetId || selectedTests.size === 0}
          className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Icons.Loader2 className="w-5 h-5 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Icons.CheckCircle className="w-5 h-5" />
              Crear Orden
            </>
          )}
        </button>
      </div>
    </form>
  )
}
