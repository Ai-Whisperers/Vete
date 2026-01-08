'use server'

import { withActionAuth, actionError, actionSuccess } from '@/lib/actions'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import type {
  CalendarActionResult,
  StaffScheduleWithProfile,
  StaffScheduleEntry,
  StaffScheduleFormData,
  StaffScheduleEntryFormData,
} from '@/lib/types/calendar'

/**
 * REF-005: Migrated to withActionAuth
 */

// =============================================================================
// STAFF SCHEDULES
// =============================================================================

/**
 * Get all staff schedules for a clinic
 * Staff only
 */
export const getStaffSchedules = withActionAuth(
  async (
    { profile, supabase },
    clinicSlug: string
  ): Promise<{
    schedules: StaffScheduleWithProfile[]
    error?: string
  }> => {
    if (profile.tenant_id !== clinicSlug) {
      return { schedules: [], error: 'Solo el personal puede ver horarios' }
    }

    // Get schedules with staff profiles
    const { data: schedules, error } = await supabase
      .from('staff_schedules')
      .select(
        `
        id,
        staff_profile_id,
        tenant_id,
        name,
        is_active,
        effective_from,
        effective_to,
        timezone,
        notes,
        created_at,
        updated_at,
        staff_profile:staff_profiles!inner(
          id,
          user_id,
          job_title,
          color_code,
          can_be_booked
        ),
        entries:staff_schedule_entries(
          id,
          schedule_id,
          day_of_week,
          start_time,
          end_time,
          break_start,
          break_end,
          location
        )
      `
      )
      .eq('tenant_id', clinicSlug)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Get staff schedules error', {
        tenantId: clinicSlug,
        error: error instanceof Error ? error.message : String(error),
      })
      return { schedules: [], error: 'Error al obtener horarios' }
    }

    // Get profile names for each staff
    const staffProfileIds =
      schedules?.map((s) => {
        const sp = s.staff_profile as unknown as { user_id: string }
        return sp.user_id
      }) || []

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', staffProfileIds)

    // Merge profile data
    const schedulesWithProfiles =
      schedules?.map((schedule) => {
        const staffProfile = schedule.staff_profile as unknown as {
          id: string
          user_id: string
          job_title: string
          color_code: string
          can_be_booked: boolean
        }
        const userProfile = profiles?.find((p) => p.id === staffProfile.user_id)
        return {
          ...schedule,
          staff_profile: staffProfile,
          profile: userProfile
            ? {
                full_name: userProfile.full_name,
                avatar_url: userProfile.avatar_url,
              }
            : undefined,
          entries: (schedule.entries || []) as StaffScheduleEntry[],
        }
      }) || []

    return { schedules: schedulesWithProfiles as StaffScheduleWithProfile[] }
  },
  { requireStaff: true }
)

/**
 * Get a single staff schedule by ID
 */
export const getStaffSchedule = withActionAuth(
  async (
    { profile, supabase },
    scheduleId: string
  ): Promise<{
    schedule: StaffScheduleWithProfile | null
    error?: string
  }> => {
    const { data: schedule, error } = await supabase
      .from('staff_schedules')
      .select(
        `
        id,
        staff_profile_id,
        tenant_id,
        name,
        is_active,
        effective_from,
        effective_to,
        timezone,
        notes,
        created_at,
        updated_at,
        staff_profile:staff_profiles!inner(
          id,
          user_id,
          job_title,
          color_code,
          can_be_booked
        ),
        entries:staff_schedule_entries(
          id,
          schedule_id,
          day_of_week,
          start_time,
          end_time,
          break_start,
          break_end,
          location
        )
      `
      )
      .eq('id', scheduleId)
      .single()

    if (error || !schedule) {
      return { schedule: null, error: 'Horario no encontrado' }
    }

    // Check permission
    if (profile.tenant_id !== schedule.tenant_id) {
      return { schedule: null, error: 'No tienes permiso para ver este horario' }
    }

    // Get staff profile name
    const staffProfile = schedule.staff_profile as unknown as { user_id: string }
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', staffProfile.user_id)
      .single()

    return {
      schedule: {
        ...schedule,
        staff_profile: staffProfile,
        profile: userProfile || undefined,
        entries: (schedule.entries || []) as StaffScheduleEntry[],
      } as unknown as StaffScheduleWithProfile,
    }
  },
  { requireStaff: true }
)

/**
 * Create a new staff schedule
 * Admin only
 */
export const createStaffSchedule = withActionAuth<
  CalendarActionResult & { scheduleId?: string },
  [string, StaffScheduleFormData]
>(async ({ profile, supabase }, clinicSlug, data) => {
    if (profile.tenant_id !== clinicSlug) {
      return { error: 'Solo administradores pueden crear horarios' }
    }

    // Validate staff profile exists and belongs to this tenant
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id, tenant_id')
      .eq('id', data.staffProfileId)
      .single()

    if (!staffProfile || staffProfile.tenant_id !== clinicSlug) {
      return { error: 'Personal no encontrado' }
    }

    // Create schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('staff_schedules')
      .insert({
        staff_profile_id: data.staffProfileId,
        tenant_id: clinicSlug,
        name: data.name,
        effective_from: data.effectiveFrom,
        effective_to: data.effectiveTo || null,
        timezone: data.timezone || 'America/Asuncion',
        notes: data.notes || null,
        is_active: true,
      })
      .select('id')
      .single()

    if (scheduleError || !schedule) {
      logger.error('Create schedule error', {
        tenantId: clinicSlug,
        staffProfileId: data.staffProfileId,
        error: scheduleError instanceof Error ? scheduleError.message : String(scheduleError),
      })
      return { error: 'Error al crear horario' }
    }

    // Create entries
    if (data.entries && data.entries.length > 0) {
      const entries = data.entries.map((entry) => ({
        schedule_id: schedule.id,
        day_of_week: entry.dayOfWeek,
        start_time: entry.startTime,
        end_time: entry.endTime,
        break_start: entry.breakStart || null,
        break_end: entry.breakEnd || null,
        location: entry.location || null,
      }))

      const { error: entriesError } = await supabase.from('staff_schedule_entries').insert(entries)

      if (entriesError) {
        logger.error('Create schedule entries error', {
          tenantId: clinicSlug,
          scheduleId: schedule.id,
          error: entriesError instanceof Error ? entriesError.message : String(entriesError),
        })
        // Clean up the schedule if entries fail
        await supabase.from('staff_schedules').delete().eq('id', schedule.id)
        return { error: 'Error al crear entradas del horario' }
      }
    }

    revalidatePath('/[clinic]/dashboard/schedules')
    revalidatePath('/[clinic]/dashboard/calendar')

    return { success: true, scheduleId: schedule.id }
  },
  { requireAdmin: true }
)

/**
 * Update a staff schedule
 * Admin only
 */
export const updateStaffSchedule = withActionAuth<
  CalendarActionResult,
  [string, Partial<StaffScheduleFormData>]
>(async ({ profile, supabase }, scheduleId, data) => {
    // Get schedule
    const { data: schedule } = await supabase
      .from('staff_schedules')
      .select('id, tenant_id')
      .eq('id', scheduleId)
      .single()

    if (!schedule) {
      return { error: 'Horario no encontrado' }
    }

    if (profile.tenant_id !== schedule.tenant_id) {
      return { error: 'Solo administradores pueden editar horarios' }
    }

    // Update schedule
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.effectiveFrom !== undefined) updateData.effective_from = data.effectiveFrom
    if (data.effectiveTo !== undefined) updateData.effective_to = data.effectiveTo || null
    if (data.timezone !== undefined) updateData.timezone = data.timezone
    if (data.notes !== undefined) updateData.notes = data.notes || null

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('staff_schedules')
        .update(updateData)
        .eq('id', scheduleId)

      if (updateError) {
        logger.error('Update schedule error', {
          scheduleId,
          tenantId: schedule.tenant_id,
          error: updateError instanceof Error ? updateError.message : String(updateError),
        })
        return { error: 'Error al actualizar horario' }
      }
    }

    // Update entries if provided
    if (data.entries !== undefined) {
      // Delete existing entries
      const { error: deleteError } = await supabase
        .from('staff_schedule_entries')
        .delete()
        .eq('schedule_id', scheduleId)

      if (deleteError) {
        logger.error('Delete entries error', {
          scheduleId,
          error: deleteError instanceof Error ? deleteError.message : String(deleteError),
        })
        return { error: 'Error al actualizar entradas' }
      }

      // Insert new entries
      if (data.entries.length > 0) {
        const entries = data.entries.map((entry) => ({
          schedule_id: scheduleId,
          day_of_week: entry.dayOfWeek,
          start_time: entry.startTime,
          end_time: entry.endTime,
          break_start: entry.breakStart || null,
          break_end: entry.breakEnd || null,
          location: entry.location || null,
        }))

        const { error: insertError } = await supabase.from('staff_schedule_entries').insert(entries)

        if (insertError) {
          logger.error('Insert entries error', {
            scheduleId,
            error: insertError instanceof Error ? insertError.message : String(insertError),
          })
          return { error: 'Error al guardar entradas del horario' }
        }
      }
    }

    revalidatePath('/[clinic]/dashboard/schedules')
    revalidatePath('/[clinic]/dashboard/calendar')

    return { success: true }
  },
  { requireAdmin: true }
)

/**
 * Delete (deactivate) a staff schedule
 * Admin only
 */
export const deleteStaffSchedule = withActionAuth<CalendarActionResult, [string]>(
  async ({ profile, supabase }, scheduleId) => {
    // Get schedule
    const { data: schedule } = await supabase
      .from('staff_schedules')
      .select('id, tenant_id')
      .eq('id', scheduleId)
      .single()

    if (!schedule) {
      return { error: 'Horario no encontrado' }
    }

    if (profile.tenant_id !== schedule.tenant_id) {
      return { error: 'Solo administradores pueden eliminar horarios' }
    }

    // Soft delete by deactivating
    const { error: updateError } = await supabase
      .from('staff_schedules')
      .update({ is_active: false })
      .eq('id', scheduleId)

    if (updateError) {
      logger.error('Delete schedule error', {
        scheduleId,
        tenantId: schedule.tenant_id,
        error: updateError instanceof Error ? updateError.message : String(updateError),
      })
      return { error: 'Error al eliminar horario' }
    }

    revalidatePath('/[clinic]/dashboard/schedules')
    revalidatePath('/[clinic]/dashboard/calendar')

    return { success: true }
  },
  { requireAdmin: true }
)

/**
 * Add a single entry to a schedule
 */
export const addScheduleEntry = withActionAuth(
  async (
    { profile, supabase },
    scheduleId: string,
    entry: StaffScheduleEntryFormData
  ): Promise<CalendarActionResult & { entryId?: string }> => {
    // Get schedule
    const { data: schedule } = await supabase
      .from('staff_schedules')
      .select('id, tenant_id')
      .eq('id', scheduleId)
      .single()

    if (!schedule) {
      return { error: 'Horario no encontrado' }
    }

    if (profile.tenant_id !== schedule.tenant_id) {
      return { error: 'Solo administradores pueden editar horarios' }
    }

    // Check if entry for this day already exists
    const { data: existingEntry } = await supabase
      .from('staff_schedule_entries')
      .select('id')
      .eq('schedule_id', scheduleId)
      .eq('day_of_week', entry.dayOfWeek)
      .single()

    if (existingEntry) {
      return { error: 'Ya existe una entrada para este día' }
    }

    // Create entry
    const { data: newEntry, error } = await supabase
      .from('staff_schedule_entries')
      .insert({
        schedule_id: scheduleId,
        day_of_week: entry.dayOfWeek,
        start_time: entry.startTime,
        end_time: entry.endTime,
        break_start: entry.breakStart || null,
        break_end: entry.breakEnd || null,
        location: entry.location || null,
      })
      .select('id')
      .single()

    if (error || !newEntry) {
      logger.error('Add entry error', {
        scheduleId,
        dayOfWeek: entry.dayOfWeek,
        error: error instanceof Error ? error.message : String(error),
      })
      return { error: 'Error al agregar entrada' }
    }

    revalidatePath('/[clinic]/dashboard/schedules')
    revalidatePath('/[clinic]/dashboard/calendar')

    return { success: true, entryId: newEntry.id }
  },
  { requireAdmin: true }
)

/**
 * Update a schedule entry
 */
export const updateScheduleEntry = withActionAuth(
  async (
    { profile, supabase },
    entryId: string,
    data: Partial<StaffScheduleEntryFormData>
  ): Promise<CalendarActionResult> => {
    // Get entry with schedule
    const { data: entry } = await supabase
      .from('staff_schedule_entries')
      .select(
        `
        id,
        schedule:staff_schedules!inner(tenant_id)
      `
      )
      .eq('id', entryId)
      .single()

    if (!entry) {
      return { error: 'Entrada no encontrada' }
    }

    const schedule = entry.schedule as unknown as { tenant_id: string }

    if (profile.tenant_id !== schedule.tenant_id) {
      return { error: 'Solo administradores pueden editar horarios' }
    }

    // Update entry
    const updateData: Record<string, unknown> = {}
    if (data.startTime !== undefined) updateData.start_time = data.startTime
    if (data.endTime !== undefined) updateData.end_time = data.endTime
    if (data.breakStart !== undefined) updateData.break_start = data.breakStart || null
    if (data.breakEnd !== undefined) updateData.break_end = data.breakEnd || null
    if (data.location !== undefined) updateData.location = data.location || null

    const { error: updateError } = await supabase
      .from('staff_schedule_entries')
      .update(updateData)
      .eq('id', entryId)

    if (updateError) {
      logger.error('Update entry error', {
        entryId,
        error: updateError instanceof Error ? updateError.message : String(updateError),
      })
      return { error: 'Error al actualizar entrada' }
    }

    revalidatePath('/[clinic]/dashboard/schedules')
    revalidatePath('/[clinic]/dashboard/calendar')

    return { success: true }
  },
  { requireAdmin: true }
)

/**
 * Delete a schedule entry
 */
export const deleteScheduleEntry = withActionAuth(
  async ({ profile, supabase }, entryId: string): Promise<CalendarActionResult> => {
    // Get entry with schedule
    const { data: entry } = await supabase
      .from('staff_schedule_entries')
      .select(
        `
        id,
        schedule:staff_schedules!inner(tenant_id)
      `
      )
      .eq('id', entryId)
      .single()

    if (!entry) {
      return { error: 'Entrada no encontrada' }
    }

    const schedule = entry.schedule as unknown as { tenant_id: string }

    if (profile.tenant_id !== schedule.tenant_id) {
      return { error: 'Solo administradores pueden editar horarios' }
    }

    const { error: deleteError } = await supabase
      .from('staff_schedule_entries')
      .delete()
      .eq('id', entryId)

    if (deleteError) {
      logger.error('Delete entry error', {
        entryId,
        error: deleteError instanceof Error ? deleteError.message : String(deleteError),
      })
      return { error: 'Error al eliminar entrada' }
    }

    revalidatePath('/[clinic]/dashboard/schedules')
    revalidatePath('/[clinic]/dashboard/calendar')

    return { success: true }
  },
  { requireAdmin: true }
)

// =============================================================================
// STAFF LIST FOR CALENDAR
// =============================================================================

/**
 * Get bookable staff members for calendar display
 */
export const getBookableStaff = withActionAuth(
  async (
    { profile, supabase },
    clinicSlug: string
  ): Promise<{
    staff: Array<{
      id: string
      user_id: string
      full_name: string
      job_title: string
      color_code: string
      avatar_url?: string | null
    }>
    error?: string
  }> => {
    if (profile.tenant_id !== clinicSlug) {
      return { staff: [], error: 'Solo el personal puede ver esta información' }
    }

    // Get bookable staff profiles
    const { data: staffProfiles, error } = await supabase
      .from('staff_profiles')
      .select(
        `
        id,
        user_id,
        job_title,
        color_code,
        can_be_booked
      `
      )
      .eq('tenant_id', clinicSlug)
      .eq('can_be_booked', true)
      .eq('employment_status', 'active')

    if (error) {
      logger.error('Get bookable staff error', {
        tenantId: clinicSlug,
        error: error instanceof Error ? error.message : String(error),
      })
      return { staff: [], error: 'Error al obtener personal' }
    }

    if (!staffProfiles || staffProfiles.length === 0) {
      return { staff: [] }
    }

    // Get profile names
    const userIds = staffProfiles.map((sp) => sp.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const staff = staffProfiles.map((sp) => {
      const userProfile = profiles?.find((p) => p.id === sp.user_id)
      return {
        id: sp.id,
        user_id: sp.user_id,
        full_name: userProfile?.full_name || 'Sin nombre',
        job_title: sp.job_title,
        color_code: sp.color_code,
        avatar_url: userProfile?.avatar_url,
      }
    })

    return { staff }
  },
  { requireStaff: true }
)
