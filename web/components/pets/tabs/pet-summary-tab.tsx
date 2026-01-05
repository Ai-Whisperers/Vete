'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Info,
  Bone,
  Syringe,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Weight,
  Heart,
  Phone,
  User,
} from 'lucide-react'
import { GrowthChart } from '@/components/clinical/growth-chart'
import { LoyaltyCard } from '@/components/loyalty/loyalty-card'

interface Vaccine {
  id: string
  name: string
  administered_date?: string | null
  next_due_date?: string | null
  status: string
}

interface WeightRecord {
  date: string
  weight_kg: number
  age_weeks?: number
}

interface PetSummaryTabProps {
  pet: {
    id: string
    name: string
    species: string
    breed?: string | null
    sex?: string | null
    birth_date?: string | null
    weight_kg?: number | null
    temperament?: string | null
    allergies?: string[] | string | null
    chronic_conditions?: string[] | null
    existing_conditions?: string | null
    diet_category?: string | null
    diet_notes?: string | null
    vaccines?: Vaccine[]
    primary_vet_name?: string | null
    emergency_contact_name?: string | null
    emergency_contact_phone?: string | null
  }
  weightHistory: WeightRecord[]
  clinic: string
  clinicName?: string
}

interface MissingVaccine {
  vaccine_name: string
  vaccine_code: string
  status: 'missing' | 'due' | 'overdue'
}

export function PetSummaryTab({ pet, weightHistory, clinic, clinicName }: PetSummaryTabProps) {
  const [missingMandatoryVaccines, setMissingMandatoryVaccines] = useState<MissingVaccine[]>([])

  // Fetch missing mandatory vaccines
  useEffect(() => {
    async function fetchMissingVaccines(): Promise<void> {
      if (pet.species !== 'dog' && pet.species !== 'cat') return

      // Calculate age in weeks
      let ageWeeks: number | null = null
      if (pet.birth_date) {
        const birth = new Date(pet.birth_date)
        const now = new Date()
        const msPerWeek = 7 * 24 * 60 * 60 * 1000
        ageWeeks = Math.floor((now.getTime() - birth.getTime()) / msPerWeek)
      }

      // Get existing vaccine names
      const existingVaccineNames = (pet.vaccines || []).map((v) => v.name).join(',')

      const params = new URLSearchParams({
        species: pet.species,
        ...(ageWeeks !== null && { age_weeks: ageWeeks.toString() }),
        ...(existingVaccineNames && { existing_vaccine_names: existingVaccineNames }),
      })

      try {
        const response = await fetch(`/api/vaccines/recommendations?${params}`)
        if (!response.ok) return

        const data = await response.json()
        // Filter core vaccines that are overdue or due (actionable)
        const actionableCoreVaccines = (data.core_vaccines || []).filter(
          (v: MissingVaccine) => v.status === 'overdue' || v.status === 'due'
        )
        setMissingMandatoryVaccines(actionableCoreVaccines)
      } catch (error) {
        console.error('Error fetching missing vaccines:', error)
      }
    }

    fetchMissingVaccines()
  }, [pet.species, pet.birth_date, pet.vaccines])

  // Calculate age
  const calculateAge = (): string => {
    if (!pet.birth_date) return 'Edad desconocida'
    const birth = new Date(pet.birth_date)
    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    if (months < 0) {
      years--
      months += 12
    }
    if (years > 0) {
      return months > 0 ? `${years} años, ${months} meses` : `${years} años`
    }
    return months > 0 ? `${months} meses` : 'Menos de 1 mes'
  }

  // Get allergies as array
  const getAllergies = (): string[] => {
    if (!pet.allergies) return []
    if (Array.isArray(pet.allergies)) return pet.allergies
    return [pet.allergies]
  }

  // Get conditions
  const getConditions = (): string[] => {
    if (pet.chronic_conditions && pet.chronic_conditions.length > 0) {
      return pet.chronic_conditions
    }
    if (pet.existing_conditions) {
      return [pet.existing_conditions]
    }
    return []
  }

  // Get upcoming vaccines
  const getUpcomingVaccines = (): Vaccine[] => {
    if (!pet.vaccines) return []
    const today = new Date()
    return pet.vaccines
      .filter((v) => v.next_due_date && new Date(v.next_due_date) >= today)
      .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime())
      .slice(0, 3)
  }

  // Get overdue vaccines
  const getOverdueVaccines = (): Vaccine[] => {
    if (!pet.vaccines) return []
    const today = new Date()
    return pet.vaccines.filter((v) => v.next_due_date && new Date(v.next_due_date) < today)
  }

  const allergies = getAllergies()
  const conditions = getConditions()
  const upcomingVaccines = getUpcomingVaccines()
  const overdueVaccines = getOverdueVaccines()

  const temperamentLabels: Record<string, string> = {
    friendly: 'Amigable',
    shy: 'Tímido',
    aggressive: 'Agresivo',
    calm: 'Tranquilo',
    unknown: 'Desconocido',
  }

  const dietLabels: Record<string, string> = {
    balanced: 'Balanceado Seco',
    wet: 'Alimento Húmedo',
    raw: 'Dieta BARF/Natural',
    mixed: 'Mixta',
    prescription: 'Prescripción Médica',
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content - Left Column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Edad</span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">{calculateAge()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-gray-500">
              <Weight className="h-4 w-4" />
              <span className="text-xs font-medium">Peso</span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">
              {pet.weight_kg ? `${pet.weight_kg} kg` : 'Sin registrar'}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-gray-500">
              <Heart className="h-4 w-4" />
              <span className="text-xs font-medium">Temperamento</span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">
              {pet.temperament
                ? temperamentLabels[pet.temperament] || pet.temperament
                : 'Sin definir'}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-gray-500">
              <Syringe className="h-4 w-4" />
              <span className="text-xs font-medium">Vacunas</span>
            </div>
            {(() => {
              // Count overdue from existing vaccines + missing mandatory vaccines
              const overdueCount = overdueVaccines.length
              const missingOverdueCount = missingMandatoryVaccines.filter((v) => v.status === 'overdue').length
              const missingDueCount = missingMandatoryVaccines.filter((v) => v.status === 'due').length
              const totalOverdue = overdueCount + missingOverdueCount
              const totalMissing = missingMandatoryVaccines.length

              if (totalOverdue > 0) {
                return (
                  <p className="font-bold text-[var(--status-error)]">
                    {totalOverdue} vencida{totalOverdue > 1 ? 's' : ''}
                  </p>
                )
              }
              if (missingDueCount > 0) {
                return (
                  <p className="font-bold text-[var(--status-warning)]">
                    {missingDueCount} pendiente{missingDueCount > 1 ? 's' : ''}
                  </p>
                )
              }
              if (totalMissing > 0) {
                return (
                  <p className="font-bold text-[var(--status-warning)]">
                    {totalMissing} faltante{totalMissing > 1 ? 's' : ''}
                  </p>
                )
              }
              return <p className="font-bold text-[var(--status-success)]">Al día</p>
            })()}
          </div>
        </div>

        {/* Health Alerts */}
        {(allergies.length > 0 || conditions.length > 0 || overdueVaccines.length > 0 || missingMandatoryVaccines.length > 0) && (
          <div className="rounded-xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-4">
            <div className="mb-3 flex items-center gap-2 font-bold text-[var(--status-warning-text)]">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Salud
            </div>
            <div className="space-y-2">
              {allergies.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="rounded bg-[var(--status-error-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-error-text)]">
                    Alergias
                  </span>
                  <span className="text-sm text-[var(--status-warning-text)]">{allergies.join(', ')}</span>
                </div>
              )}
              {conditions.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="rounded bg-[var(--status-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-warning-text)]">
                    Condiciones
                  </span>
                  <span className="text-sm text-[var(--status-warning-text)]">{conditions.join(', ')}</span>
                </div>
              )}
              {overdueVaccines.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="rounded bg-[var(--status-error-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-error-text)]">
                    Vacunas Vencidas
                  </span>
                  <span className="text-sm text-[var(--status-warning-text)]">
                    {overdueVaccines.map((v) => v.name).join(', ')}
                  </span>
                </div>
              )}
              {missingMandatoryVaccines.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="rounded bg-[var(--status-error-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-error-text)]">
                    Vacunas Obligatorias Faltantes
                  </span>
                  <span className="text-sm text-[var(--status-warning-text)]">
                    {missingMandatoryVaccines.map((v) => v.vaccine_name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Growth Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <h3 className="mb-4 font-bold text-[var(--text-primary)]">Curva de Crecimiento</h3>
          <GrowthChart
            breed={pet.breed || 'Mestizo'}
            gender={pet.sex as any}
            patientRecords={weightHistory}
          />
        </div>
      </div>

      {/* Sidebar - Right Column */}
      <div className="space-y-6">
        {/* Upcoming Vaccines */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <Syringe className="h-4 w-4 text-purple-500" />
              Próximas Vacunas
            </h3>
            <Link
              href={`/${clinic}/portal/pets/${pet.id}?tab=vaccines`}
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              Ver todas
            </Link>
          </div>
          {upcomingVaccines.length > 0 ? (
            <div className="space-y-2">
              {upcomingVaccines.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                >
                  <span className="text-sm font-medium">{vaccine.name}</span>
                  <span className="text-xs text-gray-500">
                    {vaccine.next_due_date &&
                      new Date(vaccine.next_due_date).toLocaleDateString('es-PY', {
                        day: 'numeric',
                        month: 'short',
                      })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No hay vacunas programadas</p>
          )}
        </div>

        {/* Diet Info */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Bone className="h-4 w-4 text-orange-500" />
            Alimentación
          </h3>
          {pet.diet_category ? (
            <div>
              <span className="mb-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-700">
                {dietLabels[pet.diet_category] || pet.diet_category}
              </span>
              {pet.diet_notes && <p className="text-sm text-gray-600">{pet.diet_notes}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No especificada</p>
          )}
        </div>

        {/* Emergency Contact */}
        {(pet.emergency_contact_name || pet.primary_vet_name) && (
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <Phone className="h-4 w-4 text-blue-500" />
              Contactos
            </h3>
            <div className="space-y-3">
              {pet.primary_vet_name && (
                <div>
                  <span className="text-xs text-gray-500">Veterinario de cabecera</span>
                  <p className="text-sm font-medium">{pet.primary_vet_name}</p>
                </div>
              )}
              {pet.emergency_contact_name && (
                <div>
                  <span className="text-xs text-gray-500">Contacto de emergencia</span>
                  <p className="text-sm font-medium">{pet.emergency_contact_name}</p>
                  {pet.emergency_contact_phone && (
                    <p className="text-sm text-gray-600">{pet.emergency_contact_phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loyalty Card */}
        {clinicName && (
          <LoyaltyCard
            petId={pet.id}
            petName={pet.name}
            clinicConfig={{ config: { name: clinicName } }}
          />
        )}
      </div>
    </div>
  )
}
