'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ScheduleEditor } from '@/components/calendar'
import { createStaffSchedule, updateStaffSchedule, deleteStaffSchedule } from '@/app/actions/schedules'
import type { StaffScheduleEntry, ScheduleEntryFormData } from '@/lib/types/calendar'

// =============================================================================
// TYPES
// =============================================================================

interface StaffData {
  id: string
  full_name: string
  job_title: string
  color_code: string
  can_be_booked: boolean
}

interface ScheduleData {
  id: string
  name: string
  effectiveFrom: string
  effectiveTo?: string
  timezone: string
  notes?: string
  entries: StaffScheduleEntry[]
}

interface ScheduleEditorClientProps {
  clinicSlug: string
  staffId: string
  staffData: StaffData
  existingSchedule: ScheduleData | null
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ScheduleEditorClient({
  clinicSlug,
  staffId,
  staffData,
  existingSchedule,
}: ScheduleEditorClientProps) {
  const router = useRouter()
  const isEditing = existingSchedule !== null

  // Form state
  const [name, setName] = useState(existingSchedule?.name || 'Horario Regular')
  const [effectiveFrom, setEffectiveFrom] = useState(
    existingSchedule?.effectiveFrom || new Date().toISOString().split('T')[0]
  )
  const [effectiveTo, setEffectiveTo] = useState(existingSchedule?.effectiveTo || '')
  const [notes, setNotes] = useState(existingSchedule?.notes || '')
  const [entries, setEntries] = useState<ScheduleEntryFormData[]>(() => {
    if (!existingSchedule?.entries) return []
    // Transform from DB snake_case to form camelCase
    return existingSchedule.entries.map(entry => ({
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
      breakStart: entry.break_start || undefined,
      breakEnd: entry.break_end || undefined,
      location: entry.location || undefined,
    }))
  })

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Handle entries change from ScheduleEditor
  const handleEntriesChange = useCallback((newEntries: ScheduleEntryFormData[]) => {
    setEntries(newEntries)
  }, [])

  // Handle save
  const handleSave = async () => {
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('El nombre del horario es requerido')
      return
    }

    if (!effectiveFrom) {
      setError('La fecha de inicio es requerida')
      return
    }

    if (entries.length === 0) {
      setError('Debes definir al menos un día de trabajo')
      return
    }

    setIsSaving(true)

    try {
      if (isEditing && existingSchedule) {
        // Update existing schedule
        const result = await updateStaffSchedule(existingSchedule.id, {
          name,
          effectiveFrom,
          effectiveTo: effectiveTo || undefined,
          notes: notes || undefined,
          entries,
        })

        if (result.error) {
          setError(result.error)
        } else {
          setSuccess('Horario actualizado correctamente')
          setTimeout(() => {
            router.push(`/${clinicSlug}/dashboard/schedules`)
          }, 1500)
        }
      } else {
        // Create new schedule
        const result = await createStaffSchedule(clinicSlug, {
          staffProfileId: staffId,
          name,
          effectiveFrom,
          effectiveTo: effectiveTo || undefined,
          timezone: 'America/Asuncion',
          notes: notes || undefined,
          entries,
        })

        if (result.error) {
          setError(result.error)
        } else {
          setSuccess('Horario creado correctamente')
          setTimeout(() => {
            router.push(`/${clinicSlug}/dashboard/schedules`)
          }, 1500)
        }
      }
    } catch (err) {
      setError('Error al guardar el horario')
      console.error('Save schedule error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!existingSchedule) return

    if (!confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const result = await deleteStaffSchedule(existingSchedule.id)

      if (result.error) {
        setError(result.error)
      } else {
        router.push(`/${clinicSlug}/dashboard/schedules`)
      }
    } catch (err) {
      setError('Error al eliminar el horario')
      console.error('Delete schedule error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Schedule metadata */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Información del Horario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del horario *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Horario Regular, Turno Mañana"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio *
            </label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={e => setEffectiveFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin (opcional)
            </label>
            <input
              type="date"
              value={effectiveTo}
              onChange={e => setEffectiveTo(e.target.value)}
              min={effectiveFrom}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dejar vacío para horario permanente
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre el horario"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Schedule entries */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Días y Horarios de Trabajo
        </h2>

        <ScheduleEditor
          entries={existingSchedule?.entries || []}
          onChange={handleEntriesChange}
          disabled={isSaving || isDeleting}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Horario'}
          </button>
        )}

        <div className={`flex gap-3 ${!isEditing ? 'ml-auto' : ''}`}>
          <button
            type="button"
            onClick={() => router.push(`/${clinicSlug}/dashboard/schedules`)}
            disabled={isSaving || isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="px-6 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary, #3B82F6)' }}
          >
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Horario'}
          </button>
        </div>
      </div>
    </div>
  )
}
