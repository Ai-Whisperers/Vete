'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Syringe, AlertTriangle, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { NotificationBanner } from '@/components/ui/notification-banner'

interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat'
  birth_date: string | null
}

interface VaccineRecommendation {
  vaccine_name: string
  vaccine_code: string
  protocol_type: 'core' | 'non-core' | 'lifestyle'
  status: 'missing' | 'due' | 'overdue'
  reason: string
}

interface VaccineData {
  core_vaccines: VaccineRecommendation[]
  recommended_vaccines: VaccineRecommendation[]
  lifestyle_vaccines: VaccineRecommendation[]
}

interface PetAlert {
  pet: Pet
  overdueVaccines: VaccineRecommendation[]
  dueVaccines: VaccineRecommendation[]
}

interface MandatoryVaccinesAlertProps {
  clinic: string
  pets: Pet[]
}

function calculateAgeWeeks(birthDate: string | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const now = new Date()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  return Math.floor((now.getTime() - birth.getTime()) / msPerWeek)
}

export function MandatoryVaccinesAlert({
  clinic,
  pets,
}: MandatoryVaccinesAlertProps): React.ReactElement | null {
  const [alerts, setAlerts] = useState<PetAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function fetchVaccineRecommendations(): Promise<void> {
      if (!pets || pets.length === 0) {
        setLoading(false)
        return
      }

      const petAlerts: PetAlert[] = []

      for (const pet of pets) {
        if (pet.species !== 'dog' && pet.species !== 'cat') continue

        const ageWeeks = calculateAgeWeeks(pet.birth_date)
        const params = new URLSearchParams({
          species: pet.species,
          ...(ageWeeks !== null && { age_weeks: ageWeeks.toString() }),
        })

        try {
          const response = await fetch(`/api/vaccines/recommendations?${params}`)
          if (!response.ok) continue

          const data: VaccineData = await response.json()

          // Filter for core vaccines that are overdue or due
          const overdueVaccines = data.core_vaccines.filter((v) => v.status === 'overdue')
          const dueVaccines = data.core_vaccines.filter((v) => v.status === 'due')

          if (overdueVaccines.length > 0 || dueVaccines.length > 0) {
            petAlerts.push({ pet, overdueVaccines, dueVaccines })
          }
        } catch (error) {
          console.error(`Error fetching vaccines for ${pet.name}:`, error)
        }
      }

      setAlerts(petAlerts)
      setLoading(false)
    }

    fetchVaccineRecommendations()
  }, [pets])

  if (loading || alerts.length === 0 || dismissed) {
    return null
  }

  // Calculate totals
  const totalOverdue = alerts.reduce((sum, a) => sum + a.overdueVaccines.length, 0)
  const totalDue = alerts.reduce((sum, a) => sum + a.dueVaccines.length, 0)
  const hasOverdue = totalOverdue > 0

  // Build summary message
  const petNames = alerts.map((a) => a.pet.name)
  const petNamesStr =
    petNames.length <= 2 ? petNames.join(' y ') : `${petNames.slice(0, 2).join(', ')} y más`

  const overdueMessage = totalOverdue > 0 ? `${totalOverdue} vencida${totalOverdue > 1 ? 's' : ''}` : ''
  const dueMessage = totalDue > 0 ? `${totalDue} próxima${totalDue > 1 ? 's' : ''}` : ''
  const vaccineCountStr = [overdueMessage, dueMessage].filter(Boolean).join(' y ')

  return (
    <div className="space-y-2">
      {/* Main Alert Banner */}
      <NotificationBanner
        variant={hasOverdue ? 'urgent' : 'warning'}
        icon="Syringe"
        title={
          hasOverdue
            ? `¡Vacunas Obligatorias Vencidas!`
            : 'Vacunas Obligatorias Próximas a Vencer'
        }
        message={`${petNamesStr} tiene${alerts.length > 1 ? 'n' : ''} ${vaccineCountStr} vacuna${totalOverdue + totalDue > 1 ? 's' : ''} obligatoria${totalOverdue + totalDue > 1 ? 's' : ''}.`}
        action={{
          label: 'Agendar Vacunación',
          href: `/${clinic}/book?service=vacunacion`,
        }}
        dismissible={!hasOverdue}
        onDismiss={() => setDismissed(true)}
        animate={hasOverdue}
      />

      {/* Expandable Details */}
      {alerts.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          {expanded ? 'Ocultar detalles' : 'Ver detalles'}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}

      {/* Detailed List */}
      {expanded && (
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-4">
          {alerts.map((alert) => (
            <div
              key={alert.pet.id}
              className="flex flex-col gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold text-[var(--text-primary)]">{alert.pet.name}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {alert.overdueVaccines.map((v) => (
                    <span
                      key={v.vaccine_code}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {v.vaccine_name}
                    </span>
                  ))}
                  {alert.dueVaccines.map((v) => (
                    <span
                      key={v.vaccine_code}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                    >
                      <Calendar className="h-3 w-3" />
                      {v.vaccine_name}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={`/${clinic}/book?pet=${alert.pet.id}&service=vacunacion`}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                <Syringe className="h-4 w-4" />
                Agendar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
