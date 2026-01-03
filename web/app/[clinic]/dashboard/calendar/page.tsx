import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarContainer } from '@/components/calendar'
import { appointmentToCalendarEvent, timeOffToCalendarEvent, shiftToCalendarEvent } from '@/lib/types/calendar'
import type { CalendarEvent, TimeOffRequest } from '@/lib/types/calendar'
import Link from 'next/link'

interface Props {
  params: Promise<{ clinic: string }>
  searchParams: Promise<{ view?: string; date?: string }>
}

export default async function CalendarPage({ params, searchParams }: Props) {
  const { clinic } = await params
  const { view, date } = await searchParams
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login`)
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    redirect(`/${clinic}/portal/dashboard`)
  }

  const isAdmin = profile.role === 'admin'

  // Calculate date range for fetching
  const baseDate = date ? new Date(date) : new Date()
  const startDate = new Date(baseDate)
  startDate.setDate(startDate.getDate() - 31) // Fetch a month before
  const endDate = new Date(baseDate)
  endDate.setDate(endDate.getDate() + 31) // Fetch a month ahead

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Fetch appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select(`
      id,
      tenant_id,
      start_time,
      end_time,
      status,
      reason,
      notes,
      vet_id,
      pets (
        id,
        name,
        species,
        owner:profiles!pets_owner_id_fkey (
          id,
          full_name
        )
      )
    `)
    .eq('tenant_id', clinic)
    .gte('start_time', `${startDateStr}T00:00:00`)
    .lte('start_time', `${endDateStr}T23:59:59`)
    .order('start_time', { ascending: true })

  if (appointmentsError) {
    console.error('Error fetching appointments:', appointmentsError)
  }

  // Fetch staff profiles with schedules
  const { data: staffProfiles } = await supabase
    .from('staff_profiles')
    .select(`
      id,
      user_id,
      job_title,
      color_code,
      can_be_booked
    `)
    .eq('tenant_id', clinic)
    .eq('can_be_booked', true)
    .eq('employment_status', 'active')

  // Get user profiles for staff
  const staffUserIds = staffProfiles?.map(sp => sp.user_id) || []
  const { data: staffUserProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', staffUserIds)

  // Merge staff data
  const staff = staffProfiles?.map(sp => {
    const userProfile = staffUserProfiles?.find(up => up.id === sp.user_id)
    return {
      id: sp.id,
      user_id: sp.user_id,
      full_name: userProfile?.full_name || 'Sin nombre',
      job_title: sp.job_title,
      color_code: sp.color_code,
      avatar_url: userProfile?.avatar_url
    }
  }) || []

  // Fetch shifts for staff
  const staffProfileIds = staffProfiles?.map(sp => sp.id) || []
  const { data: shifts } = await supabase
    .from('staff_shifts')
    .select('*')
    .in('staff_profile_id', staffProfileIds)
    .gte('scheduled_start', `${startDateStr}T00:00:00`)
    .lte('scheduled_start', `${endDateStr}T23:59:59`)

  // Fetch approved time off requests
  const { data: timeOffRequests } = await supabase
    .from('time_off_requests')
    .select(`
      *,
      time_off_type:time_off_types (
        id,
        code,
        name,
        color_code
      )
    `)
    .eq('tenant_id', clinic)
    .in('status', ['approved', 'pending'])
    .or(`and(start_date.lte.${endDateStr},end_date.gte.${startDateStr})`)

  // Fetch pets for quick add
  const { data: pets } = await supabase
    .from('pets')
    .select(`
      id,
      name,
      species,
      owner:profiles!pets_owner_id_fkey (
        full_name
      )
    `)
    .eq('tenant_id', clinic)
    .order('name')
    .limit(100)

  // Fetch services for quick add
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes')
    .eq('tenant_id', clinic)
    .eq('is_active', true)
    .order('name')

  // Transform data to calendar events
  const events: CalendarEvent[] = []

  // Transform appointments
  if (appointments) {
    for (const apt of appointments) {
      const pet = Array.isArray(apt.pets) ? apt.pets[0] : apt.pets
      const owner = pet?.owner ? (Array.isArray(pet.owner) ? pet.owner[0] : pet.owner) : undefined

      const event = appointmentToCalendarEvent({
        id: apt.id,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        reason: apt.reason,
        pet: pet ? { name: pet.name } : null,
        service: null
      })

      // Enrich with resource data
      event.resource = {
        type: 'appointment',
        appointmentId: apt.id,
        petId: pet?.id,
        petName: pet?.name,
        species: pet?.species,
        ownerId: owner?.id,
        ownerName: owner?.full_name,
        reason: apt.reason || undefined,
        notes: apt.notes || undefined,
        status: apt.status,
        staffId: apt.vet_id || undefined
      }

      // Find staff color
      const vetStaff = staff.find(s => s.user_id === apt.vet_id)
      if (vetStaff) {
        event.resource.staffId = vetStaff.id
        event.resource.staffName = vetStaff.full_name
        event.resource.staffColor = vetStaff.color_code
        event.color = vetStaff.color_code
      }

      events.push(event)
    }
  }

  // Transform shifts
  if (shifts) {
    for (const shift of shifts) {
      const staffMember = staff.find(s => s.id === shift.staff_profile_id)
      if (!staffMember) continue

      const event = shiftToCalendarEvent({
        ...shift,
        staff: {
          id: staffMember.id,
          user_id: staffMember.user_id,
          full_name: staffMember.full_name,
          job_title: staffMember.job_title,
          color_code: staffMember.color_code,
          can_be_booked: true
        }
      })
      events.push(event)
    }
  }

  // Transform time off requests
  if (timeOffRequests) {
    for (const request of timeOffRequests) {
      const staffMember = staff.find(s => s.id === request.staff_profile_id)
      const staffName = staffMember?.full_name || 'Personal'

      const event = timeOffToCalendarEvent(request as TimeOffRequest, staffName)
      if (staffMember) {
        event.color = request.time_off_type?.color_code || 'var(--accent-pink)'
        event.resource!.staffId = staffMember.id
        event.resource!.staffColor = staffMember.color_code
      }
      events.push(event)
    }
  }

  // Prepare pets for quick add (with owner name)
  const petsForQuickAdd = pets?.map(p => {
    const owner = Array.isArray(p.owner) ? p.owner[0] : p.owner
    return {
      id: p.id,
      name: p.name,
      species: p.species,
      owner_name: owner?.full_name
    }
  }) || []

  // Parse view and date from search params
  const initialView = (view === 'day' || view === 'week' || view === 'month' || view === 'agenda')
    ? view
    : 'week'
  const initialDate = date ? new Date(date) : new Date()

  return (
    <div className="p-6 max-w-full mx-auto h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Calendario
          </h1>
          <p className="text-[var(--text-secondary)]">
            Vista general de citas, turnos y ausencias
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${clinic}/dashboard/appointments`}
            className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border)] rounded-lg hover:bg-[var(--bg-subtle)] inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Lista
          </Link>
          {isAdmin && (
            <Link
              href={`/${clinic}/dashboard/schedules`}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 inline-flex items-center gap-2"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gestionar Horarios
            </Link>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-[var(--border-light)] p-4 h-[calc(100%-80px)]">
        <CalendarContainer
          initialEvents={events}
          initialDate={initialDate}
          initialView={initialView}
          pets={petsForQuickAdd}
          services={services || []}
          staff={staff}
          clinicSlug={clinic}
        />
      </div>
    </div>
  )
}
