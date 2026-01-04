'use client'

import Link from 'next/link'
import {
  Syringe,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { MissingVaccinesCard } from '../missing-vaccines-card'

interface Vaccine {
  id: string
  name: string
  vaccine_code?: string | null
  administered_date?: string | null
  next_due_date?: string | null
  status: string
  lot_number?: string | null
  manufacturer?: string | null
  notes?: string | null
}

interface VaccineReaction {
  id: string
  vaccine_id: string
  reaction_type: string
  severity: string
  onset_hours?: number
  notes?: string
}

interface PetVaccinesTabProps {
  petId: string
  petName: string
  petSpecies: string
  petBirthDate?: string | null
  vaccines: Vaccine[]
  reactions?: VaccineReaction[]
  clinic: string
  isStaff?: boolean
}

export function PetVaccinesTab({
  petId,
  petName,
  petSpecies,
  petBirthDate,
  vaccines,
  reactions = [],
  clinic,
  isStaff = false,
}: PetVaccinesTabProps) {
  // Extract vaccine codes and names from existing vaccines for the recommendation API
  const existingVaccineCodes = vaccines
    .map((v) => v.vaccine_code)
    .filter((code): code is string => !!code)

  const existingVaccineNames = vaccines.map((v) => v.name).filter((name): name is string => !!name)
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Categorize vaccines
  const overdueVaccines = vaccines.filter(
    (v) => v.next_due_date && new Date(v.next_due_date) < today
  )
  const upcomingVaccines = vaccines.filter(
    (v) =>
      v.next_due_date &&
      new Date(v.next_due_date) >= today &&
      new Date(v.next_due_date) <= thirtyDaysFromNow
  )
  const upToDateVaccines = vaccines.filter(
    (v) => !v.next_due_date || new Date(v.next_due_date) > thirtyDaysFromNow
  )

  // Get reactions for a vaccine
  const getReactions = (vaccineId: string): VaccineReaction[] => {
    return reactions.filter((r) => r.vaccine_id === vaccineId)
  }

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Sin fecha'
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getDaysUntil = (dateStr: string): number => {
    const date = new Date(dateStr)
    const diffTime = date.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const VaccineCard = ({
    vaccine,
    status,
  }: {
    vaccine: Vaccine
    status: 'overdue' | 'upcoming' | 'ok'
  }) => {
    const vaccineReactions = getReactions(vaccine.id)
    const hasReactions = vaccineReactions.length > 0

    return (
      <div
        className={`rounded-xl border p-4 transition-all ${
          status === 'overdue'
            ? 'border-red-200 bg-red-50'
            : status === 'upcoming'
              ? 'border-amber-200 bg-amber-50'
              : 'border-gray-100 bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="font-bold text-[var(--text-primary)]">{vaccine.name}</h4>
              {hasReactions && (
                <span className="flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  <AlertTriangle className="h-3 w-3" />
                  Reacción
                </span>
              )}
            </div>

            <div className="space-y-1 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Aplicada: {formatDate(vaccine.administered_date)}
              </p>
              {vaccine.next_due_date && (
                <p
                  className={`flex items-center gap-2 ${
                    status === 'overdue'
                      ? 'font-medium text-red-600'
                      : status === 'upcoming'
                        ? 'font-medium text-amber-600'
                        : ''
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {status === 'overdue' ? (
                    <>Vencida hace {Math.abs(getDaysUntil(vaccine.next_due_date))} días</>
                  ) : status === 'upcoming' ? (
                    <>Próxima en {getDaysUntil(vaccine.next_due_date)} días</>
                  ) : (
                    <>Próxima: {formatDate(vaccine.next_due_date)}</>
                  )}
                </p>
              )}
              {vaccine.manufacturer && (
                <p className="text-xs text-gray-400">
                  {vaccine.manufacturer} {vaccine.lot_number && `• Lote: ${vaccine.lot_number}`}
                </p>
              )}
            </div>

            {vaccine.notes && (
              <p className="mt-2 rounded bg-gray-50 p-2 text-xs italic text-gray-500">
                {vaccine.notes}
              </p>
            )}

            {hasReactions && (
              <div className="mt-2 text-xs">
                {vaccineReactions.map((reaction) => (
                  <div
                    key={reaction.id}
                    className="mt-1 rounded bg-orange-100/50 p-2 text-orange-800"
                  >
                    <span className="font-medium">{reaction.reaction_type}</span>
                    {reaction.severity && ` (${reaction.severity})`}
                    {reaction.onset_hours && ` - ${reaction.onset_hours}h después`}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {status === 'overdue' ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            ) : status === 'upcoming' ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Vacunas de {petName}</h2>
          <p className="text-sm text-gray-500">
            {vaccines.length} vacuna{vaccines.length !== 1 ? 's' : ''} registrada
            {vaccines.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${clinic}/portal/pets/${petId}/vaccines/certificate`}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <FileText className="h-4 w-4" />
            Certificado
          </Link>
          {isStaff && (
            <Link
              href={`/${clinic}/portal/pets/${petId}/vaccines/new`}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nueva Vacuna
            </Link>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className={`rounded-xl p-4 text-center ${overdueVaccines.length > 0 ? 'bg-red-50' : 'bg-gray-50'}`}
        >
          <div
            className={`text-2xl font-black ${overdueVaccines.length > 0 ? 'text-red-600' : 'text-gray-400'}`}
          >
            {overdueVaccines.length}
          </div>
          <div className="text-xs font-medium text-gray-500">Vencidas</div>
        </div>
        <div
          className={`rounded-xl p-4 text-center ${upcomingVaccines.length > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}
        >
          <div
            className={`text-2xl font-black ${upcomingVaccines.length > 0 ? 'text-amber-600' : 'text-gray-400'}`}
          >
            {upcomingVaccines.length}
          </div>
          <div className="text-xs font-medium text-gray-500">Próximas</div>
        </div>
        <div className="rounded-xl bg-green-50 p-4 text-center">
          <div className="text-2xl font-black text-green-600">{upToDateVaccines.length}</div>
          <div className="text-xs font-medium text-gray-500">Al día</div>
        </div>
      </div>

      {/* Overdue Vaccines Alert */}
      {overdueVaccines.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="mb-3 flex items-center gap-2 font-bold text-red-700">
            <AlertCircle className="h-5 w-5" />
            Vacunas Vencidas - Requieren Atención
          </div>
          <div className="space-y-3">
            {overdueVaccines.map((vaccine) => (
              <VaccineCard key={vaccine.id} vaccine={vaccine} status="overdue" />
            ))}
          </div>
          <Link
            href={`/${clinic}/book?pet=${petId}&service=vacunacion`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-700"
          >
            <Calendar className="h-4 w-4" />
            Agendar Vacunación
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Upcoming Vaccines */}
      {upcomingVaccines.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Clock className="h-4 w-4 text-amber-500" />
            Próximas (30 días)
          </h3>
          <div className="space-y-3">
            {upcomingVaccines.map((vaccine) => (
              <VaccineCard key={vaccine.id} vaccine={vaccine} status="upcoming" />
            ))}
          </div>
        </div>
      )}

      {/* Up to Date Vaccines */}
      {upToDateVaccines.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Al Día
          </h3>
          <div className="space-y-3">
            {upToDateVaccines.map((vaccine) => (
              <VaccineCard key={vaccine.id} vaccine={vaccine} status="ok" />
            ))}
          </div>
        </div>
      )}

      {/* Missing Vaccines Card - Shows when pet has no vaccines or is missing core vaccines */}
      {vaccines.length === 0 && (
        <div className="space-y-6">
          {/* Show missing vaccines recommendations */}
          <MissingVaccinesCard
            petId={petId}
            petName={petName}
            species={petSpecies}
            birthDate={petBirthDate}
            existingVaccineCodes={existingVaccineCodes}
            existingVaccineNames={existingVaccineNames}
            clinic={clinic}
          />

          {/* Empty state message */}
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Syringe className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-1 font-bold text-gray-900">Sin vacunas registradas</h3>
            <p className="mx-auto max-w-xs text-sm text-gray-500">
              No hay registros de vacunación para {petName}
            </p>
          </div>
        </div>
      )}

      {/* Show missing vaccines card even when pet has some vaccines (to show missing core vaccines) */}
      {vaccines.length > 0 && (
        <MissingVaccinesCard
          petId={petId}
          petName={petName}
          species={petSpecies}
          birthDate={petBirthDate}
          existingVaccineCodes={existingVaccineCodes}
          existingVaccineNames={existingVaccineNames}
          clinic={clinic}
        />
      )}
    </div>
  )
}
