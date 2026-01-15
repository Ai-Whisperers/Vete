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
  Plus,
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { GrowthChart } from '@/components/clinical/growth-chart'
import { WeightRecordingModal } from '@/components/pets/weight-recording-modal'

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
  onWeightUpdated?: () => void
}

interface MissingVaccine {
  vaccine_name: string
  vaccine_code: string
  status: 'missing' | 'due' | 'overdue'
}

export function PetSummaryTab({ pet, weightHistory, clinic, clinicName, onWeightUpdated }: PetSummaryTabProps) {
  const t = useTranslations('pets.tabs.summary')
  const locale = useLocale()
  const localeStr = locale === 'es' ? 'es-PY' : 'en-US'

  const [missingMandatoryVaccines, setMissingMandatoryVaccines] = useState<MissingVaccine[]>([])
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(true)
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false)
  const [displayedWeight, setDisplayedWeight] = useState<number | null>(pet.weight_kg ?? null)

  // Fetch missing mandatory vaccines
  useEffect(() => {
    async function fetchMissingVaccines(): Promise<void> {
      setIsLoadingVaccines(true)

      if (pet.species !== 'dog' && pet.species !== 'cat') {
        setIsLoadingVaccines(false)
        return
      }

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
        if (!response.ok) {
          setIsLoadingVaccines(false)
          return
        }

        const data = await response.json()
        // Get ALL core vaccines that are missing (overdue, due, or just missing)
        const allMissingCoreVaccines = (data.core_vaccines || []).filter(
          (v: MissingVaccine) => v.status === 'overdue' || v.status === 'due' || v.status === 'missing'
        )
        setMissingMandatoryVaccines(allMissingCoreVaccines)
      } catch (error) {
        console.error('Error fetching missing vaccines:', error)
      } finally {
        setIsLoadingVaccines(false)
      }
    }

    fetchMissingVaccines()
  }, [pet.species, pet.birth_date, pet.vaccines])

  // Calculate age - reuse pets.card translations for age display
  const tCard = useTranslations('pets.card')
  const calculateAge = (): string => {
    if (!pet.birth_date) return t('unknownAge')
    const birth = new Date(pet.birth_date)
    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    if (months < 0) {
      years--
      months += 12
    }
    if (years > 0) {
      if (months > 0) {
        return `${years} ${years === 1 ? tCard('year') : tCard('years')}, ${months} ${months === 1 ? tCard('month') : tCard('months')}`
      }
      return `${years} ${years === 1 ? tCard('year') : tCard('years')}`
    }
    return months > 0 ? `${months} ${months === 1 ? tCard('month') : tCard('months')}` : tCard('baby')
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
    friendly: t('temperamentFriendly'),
    shy: t('temperamentShy'),
    aggressive: t('temperamentAggressive'),
    calm: t('temperamentCalm'),
    unknown: t('temperamentUnknown'),
  }

  const dietLabels: Record<string, string> = {
    balanced: t('dietBalanced'),
    wet: t('dietWet'),
    raw: t('dietRaw'),
    mixed: t('dietMixed'),
    prescription: t('dietPrescription'),
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
              <span className="text-xs font-medium">{t('age')}</span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">{calculateAge()}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsWeightModalOpen(true)}
            className="group rounded-xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-[var(--primary)] hover:shadow-md"
          >
            <div className="mb-1 flex items-center justify-between text-gray-500">
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                <span className="text-xs font-medium">{t('weight')}</span>
              </div>
              <Plus className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="font-bold text-[var(--text-primary)]">
              {displayedWeight ? `${displayedWeight} kg` : t('notRecorded')}
            </p>
          </button>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-gray-500">
              <Heart className="h-4 w-4" />
              <span className="text-xs font-medium">{t('temperament')}</span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">
              {pet.temperament
                ? temperamentLabels[pet.temperament] || pet.temperament
                : t('notDefined')}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-gray-500">
              <Syringe className="h-4 w-4" />
              <span className="text-xs font-medium">{t('vaccines')}</span>
            </div>
            {(() => {
              if (isLoadingVaccines) {
                return <p className="font-bold text-gray-400">{t('checking')}</p>
              }

              // Count overdue from existing vaccines + missing mandatory vaccines
              const overdueCount = overdueVaccines.length
              const missingOverdueCount = missingMandatoryVaccines.filter((v) => v.status === 'overdue').length
              const missingDueCount = missingMandatoryVaccines.filter((v) => v.status === 'due').length
              const missingCount = missingMandatoryVaccines.filter((v) => v.status === 'missing').length
              const totalOverdue = overdueCount + missingOverdueCount
              const totalMissing = missingMandatoryVaccines.length

              // Show overdue count (most urgent)
              if (totalOverdue > 0) {
                return (
                  <p className="font-bold text-[var(--status-error)]">
                    {totalOverdue > 1 ? t('overdueCountPlural', { count: totalOverdue }) : t('overdueCount', { count: totalOverdue })}
                  </p>
                )
              }
              // Show pending/due count
              if (missingDueCount > 0) {
                return (
                  <p className="font-bold text-[var(--status-warning)]">
                    {missingDueCount > 1 ? t('pendingCountPlural', { count: missingDueCount }) : t('pendingCount', { count: missingDueCount })}
                  </p>
                )
              }
              // Show total missing count (not yet due based on age)
              if (missingCount > 0) {
                return (
                  <p className="font-bold text-[var(--status-info)]">
                    {t('toApply', { count: missingCount })}
                  </p>
                )
              }
              // All good - show applied count if any
              const appliedCount = pet.vaccines?.filter((v) => v.status === 'verified').length || 0
              if (appliedCount > 0) {
                return (
                  <p className="font-bold text-[var(--status-success)]">
                    {appliedCount > 1 ? t('appliedCountPlural', { count: appliedCount }) : t('appliedCount', { count: appliedCount })}
                  </p>
                )
              }
              return <p className="font-bold text-[var(--status-success)]">{t('upToDate')}</p>
            })()}
          </div>
        </div>

        {/* Health Alerts */}
        {(allergies.length > 0 || conditions.length > 0 || overdueVaccines.length > 0 || missingMandatoryVaccines.length > 0) && (
          <div className="rounded-xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-4">
            <div className="mb-3 flex items-center gap-2 font-bold text-[var(--status-warning-text)]">
              <AlertTriangle className="h-5 w-5" />
              {t('healthAlerts')}
            </div>
            <div className="space-y-2">
              {allergies.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="rounded bg-[var(--status-error-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-error-text)]">
                    {t('allergiesLabel')}
                  </span>
                  <span className="text-sm text-[var(--status-warning-text)]">{allergies.join(', ')}</span>
                </div>
              )}
              {conditions.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="rounded bg-[var(--status-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-warning-text)]">
                    {t('conditionsLabel')}
                  </span>
                  <span className="text-sm text-[var(--status-warning-text)]">{conditions.join(', ')}</span>
                </div>
              )}
              {overdueVaccines.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="rounded bg-[var(--status-error-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-error-text)]">
                    {t('overdueVaccines')}
                  </span>
                  <span className="text-sm text-[var(--status-warning-text)]">
                    {overdueVaccines.map((v) => v.name).join(', ')}
                  </span>
                </div>
              )}
              {missingMandatoryVaccines.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="rounded bg-[var(--status-error-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-error-text)]">
                    {t('missingMandatory')}
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
          <h3 className="mb-4 font-bold text-[var(--text-primary)]">{t('growthChart')}</h3>
          <GrowthChart
            breed={pet.breed || t('mixedBreed')}
            gender={(pet.sex === 'male' || pet.sex === 'female' ? pet.sex : 'male') as 'male' | 'female'}
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
              {t('upcomingVaccines')}
            </h3>
            <Link
              href={`/${clinic}/portal/pets/${pet.id}?tab=vaccines`}
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              {t('viewAll')}
            </Link>
          </div>

          {/* Missing Mandatory Vaccines (overdue first, then due) */}
          {missingMandatoryVaccines.length > 0 && (
            <div className="mb-3 space-y-2">
              {missingMandatoryVaccines
                .sort((a, b) => {
                  // Overdue first, then due
                  if (a.status === 'overdue' && b.status !== 'overdue') return -1
                  if (a.status !== 'overdue' && b.status === 'overdue') return 1
                  return 0
                })
                .slice(0, 5)
                .map((vaccine) => (
                  <div
                    key={vaccine.vaccine_code}
                    className={`flex items-center justify-between rounded-lg p-2 ${
                      vaccine.status === 'overdue'
                        ? 'bg-[var(--status-error-bg)]'
                        : 'bg-[var(--status-warning-bg)]'
                    }`}
                  >
                    <span className="text-sm font-medium">{vaccine.vaccine_name}</span>
                    <span
                      className={`text-xs font-medium ${
                        vaccine.status === 'overdue'
                          ? 'text-[var(--status-error)]'
                          : 'text-[var(--status-warning)]'
                      }`}
                    >
                      {vaccine.status === 'overdue' ? t('overdue') : t('pending')}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Scheduled Vaccines (already recorded with next_due_date) */}
          {upcomingVaccines.length > 0 && (
            <div className="space-y-2">
              {upcomingVaccines.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                >
                  <span className="text-sm font-medium">{vaccine.name}</span>
                  <span className="text-xs text-gray-500">
                    {vaccine.next_due_date &&
                      new Date(vaccine.next_due_date).toLocaleDateString(localeStr, {
                        day: 'numeric',
                        month: 'short',
                      })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Empty state only if no missing vaccines AND no upcoming vaccines */}
          {missingMandatoryVaccines.length === 0 && upcomingVaccines.length === 0 && (
            <p className="text-sm text-gray-400">{t('noScheduledVaccines')}</p>
          )}

          {/* Add vaccine CTA */}
          {missingMandatoryVaccines.length > 0 && (
            <Link
              href={`/${clinic}/portal/pets/${pet.id}/vaccines/new`}
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)]"
            >
              <Syringe className="h-4 w-4" />
              {t('registerVaccine')}
            </Link>
          )}
        </div>

        {/* Diet Info */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Bone className="h-4 w-4 text-orange-500" />
            {t('diet')}
          </h3>
          {pet.diet_category ? (
            <div>
              <span className="mb-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-700">
                {dietLabels[pet.diet_category] || pet.diet_category}
              </span>
              {pet.diet_notes && <p className="text-sm text-gray-600">{pet.diet_notes}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t('notSpecified')}</p>
          )}
        </div>

        {/* Emergency Contact */}
        {(pet.emergency_contact_name || pet.primary_vet_name) && (
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <Phone className="h-4 w-4 text-blue-500" />
              {t('contacts')}
            </h3>
            <div className="space-y-3">
              {pet.primary_vet_name && (
                <div>
                  <span className="text-xs text-gray-500">{t('primaryVet')}</span>
                  <p className="text-sm font-medium">{pet.primary_vet_name}</p>
                </div>
              )}
              {pet.emergency_contact_name && (
                <div>
                  <span className="text-xs text-gray-500">{t('emergencyContact')}</span>
                  <p className="text-sm font-medium">{pet.emergency_contact_name}</p>
                  {pet.emergency_contact_phone && (
                    <p className="text-sm text-gray-600">{pet.emergency_contact_phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Weight Recording Modal */}
      <WeightRecordingModal
        petId={pet.id}
        petName={pet.name}
        currentWeight={displayedWeight}
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        onSuccess={(newWeight) => {
          setDisplayedWeight(newWeight)
          onWeightUpdated?.()
        }}
      />
    </div>
  )
}
