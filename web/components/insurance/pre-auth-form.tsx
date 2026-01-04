'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

interface PreAuthFormProps {
  petId?: string
  policyId?: string
  onSuccess?: (preAuthId: string) => void
}

interface Policy {
  id: string
  policy_number: string
  plan_name: string
  insurance_providers: {
    name: string
  }
}

interface Pet {
  id: string
  name: string
  species: string
}

export default function PreAuthForm({ petId, policyId, onSuccess }: PreAuthFormProps) {
  const supabase = createClient()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [pets, setPets] = useState<Pet[]>([])

  const [selectedPolicyId, setSelectedPolicyId] = useState(policyId || '')
  const [selectedPetId, setSelectedPetId] = useState(petId || '')

  const [procedureDescription, setProcedureDescription] = useState('')
  const [procedureCode, setProcedureCode] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const [clinicalJustification, setClinicalJustification] = useState('')
  const [submitNow, setSubmitNow] = useState(false)

  useEffect(() => {
    loadPets()
  }, [])

  useEffect(() => {
    if (selectedPetId) {
      loadPolicies(selectedPetId)
    }
  }, [selectedPetId])

  const loadPets = async () => {
    const { data } = await supabase.from('pets').select('id, name, species').order('name')
    if (data) setPets(data)
  }

  const loadPolicies = async (petId: string) => {
    const { data } = await supabase
      .from('pet_insurance_policies')
      .select(
        `
        id, policy_number, plan_name,
        insurance_providers(name)
      `
      )
      .eq('pet_id', petId)
      .eq('status', 'active')
    if (data) setPolicies(data as unknown as Policy[])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !selectedPolicyId ||
      !selectedPetId ||
      !procedureDescription ||
      !diagnosis ||
      !estimatedCost ||
      !clinicalJustification
    ) {
      showToast('Complete todos los campos requeridos')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/insurance/pre-authorizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: selectedPolicyId,
          pet_id: selectedPetId,
          procedure_description: procedureDescription,
          procedure_code: procedureCode,
          diagnosis,
          estimated_cost: parseFloat(estimatedCost),
          planned_date: plannedDate || null,
          clinical_justification: clinicalJustification,
          status: submitNow ? 'submitted' : 'draft',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear pre-autorización')
      }

      const preAuth = await response.json()
      showToast(submitNow ? 'Pre-autorización enviada' : 'Pre-autorización guardada como borrador')

      if (onSuccess) {
        onSuccess(preAuth.id)
      }
    } catch (error) {
      // TICKET-TYPE-004: Proper error handling without any
      showToast(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pet and Policy Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
            Mascota *
          </label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="">Seleccionar mascota</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
            Póliza de Seguro *
          </label>
          <select
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={!selectedPetId}
          >
            <option value="">Seleccionar póliza</option>
            {policies.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.insurance_providers.name} - {policy.policy_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Procedure Details */}
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
          Descripción del Procedimiento *
        </label>
        <input
          type="text"
          value={procedureDescription}
          onChange={(e) => setProcedureDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Ej: Cirugía de rodilla - Reparación de ligamento cruzado"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
            Código del Procedimiento
          </label>
          <input
            type="text"
            value={procedureCode}
            onChange={(e) => setProcedureCode(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="CPT/código (opcional)"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
            Fecha Planificada
          </label>
          <input
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
          Diagnóstico *
        </label>
        <input
          type="text"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Ej: Ruptura de ligamento cruzado anterior"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
          Costo Estimado (Gs.) *
        </label>
        <input
          type="number"
          value={estimatedCost}
          onChange={(e) => setEstimatedCost(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="0"
          min="0"
          step="1"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
          Justificación Clínica *
        </label>
        <textarea
          value={clinicalJustification}
          onChange={(e) => setClinicalJustification(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          rows={5}
          placeholder="Explique por qué este procedimiento es médicamente necesario para el paciente..."
          required
        />
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Incluya hallazgos clínicos, resultados de exámenes, y por qué el procedimiento es
          necesario.
        </p>
      </div>

      {/* Submit Actions */}
      <div className="flex items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="submitNow"
            checked={submitNow}
            onChange={(e) => setSubmitNow(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="submitNow" className="text-sm text-[var(--text-secondary)]">
            Enviar ahora
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[var(--primary)] px-6 py-2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : submitNow ? 'Enviar Pre-autorización' : 'Guardar Borrador'}
          </button>
        </div>
      </div>
    </form>
  )
}
