/**
 * Booking API Routes
 * Refactored with auth middleware and Zod validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAuth, type AuthContext } from '@/lib/api/with-auth';
import { apiError, apiSuccess, API_ERRORS } from '@/lib/api/errors';
import { createAppointmentSchema, updateAppointmentSchema, appointmentQuerySchema } from '@/lib/schemas/appointment';
import { rateLimit } from '@/lib/rate-limit';

// GET /api/booking - List appointments
export const GET = withAuth(async (ctx: AuthContext) => {
  // Apply rate limiting for search endpoints (30 requests per minute)
  const rateLimitResult = await rateLimit(ctx.request, 'search', ctx.user.id);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }
  const { user, profile, supabase, request } = ctx;

  const searchParams = new URL(request.url).searchParams;

  // Validate query params
  const queryResult = appointmentQuerySchema.safeParse({
    clinic: searchParams.get('clinic'),
    status: searchParams.get('status'),
    date_from: searchParams.get('date_from'),
    date_to: searchParams.get('date_to'),
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });

  if (!queryResult.success) {
    return apiError('VALIDATION_ERROR', 400, { field_errors: queryResult.error.flatten().fieldErrors });
  }

  const { status, date_from, date_to, page, limit } = queryResult.data;
  const clinic = profile.tenant_id; // Use user's tenant

  // Build query based on role
  let query = supabase
    .from('appointments')
    .select(`
      *,
      pet:pets(id, name, species, owner_id),
      service:services(id, name, price)
    `, { count: 'exact' });

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff sees all clinic appointments
    if (clinic) {
      query = query.eq('tenant_id', clinic);
    }
  } else {
    // Owners see only their pets' appointments
    query = query.eq('pet.owner_id', user.id);
  }

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  if (date_from) {
    query = query.gte('appointment_date', date_from);
  }
  if (date_to) {
    query = query.lte('appointment_date', date_to);
  }

  // Pagination
  const from = page * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order('appointment_date', { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    return apiError('DATABASE_ERROR', 500);
  }

  return apiSuccess({
    items: data,
    total: count ?? 0,
    page,
    limit,
  });
});

// POST /api/booking - Create appointment
export const POST = withAuth(async (ctx: AuthContext) => {
  // Apply rate limiting for write endpoints (20 requests per minute)
  const rateLimitResult = await rateLimit(ctx.request, 'write', ctx.user.id);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  const { user, profile, supabase, request } = ctx;

  // Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_FORMAT', 400);
  }

  const result = createAppointmentSchema.safeParse(body);
  if (!result.success) {
    return apiError('VALIDATION_ERROR', 400, { field_errors: result.error.flatten().fieldErrors });
  }

  const { clinic_slug, pet_id, service_id, appointment_date, time_slot, vet_id, notes } = result.data;

  // Verify pet ownership or staff access
  const { data: pet } = await supabase
    .from('pets')
    .select('id, owner_id, tenant_id')
    .eq('id', pet_id)
    .single();

  if (!pet) {
    return NextResponse.json({ ...API_ERRORS.NOT_FOUND, message: 'Mascota no encontrada' }, { status: 404 });
  }

  const isOwner = pet.owner_id === user.id;
  const isStaff = ['vet', 'admin'].includes(profile.role);

  if (!isOwner && !isStaff) {
    return apiError('FORBIDDEN', 403);
  }

  // Use clinic from pet's tenant if not provided
  const effectiveClinic = clinic_slug || pet.tenant_id;

  // Validate date is not in the past
  const appointmentDateObj = new Date(appointment_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDateObj < today) {
    return NextResponse.json(
      { error: 'No se puede agendar citas en fechas pasadas', code: 'PAST_DATE' },
      { status: 400 }
    );
  }

  // Fetch service duration for end_time calculation
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', service_id)
    .single();

  const durationMinutes = service?.duration_minutes || 30;

  // Calculate end_time based on service duration
  const [hours, minutes] = time_slot.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + durationMinutes;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

  // Create full timestamp strings for overlap checking
  const newStartTimestamp = `${appointment_date}T${time_slot}:00`;
  const newEndTimestamp = `${appointment_date}T${endTime}:00`;

  // Check for overlapping appointments
  // An overlap occurs when: existing.start_time < new.end_time AND existing.end_time > new.start_time
  let overlapQuery = supabase
    .from('appointments')
    .select('id, start_time, end_time, vet_id')
    .eq('tenant_id', effectiveClinic)
    .eq('appointment_date', appointment_date)
    .not('status', 'in', '("cancelled","no_show")')
    .lt('start_time', newEndTimestamp)
    .gt('end_time', newStartTimestamp);

  // If a specific vet is assigned, check for that vet's availability
  if (vet_id) {
    overlapQuery = overlapQuery.eq('vet_id', vet_id);
  }

  const { data: existingAppointments } = await overlapQuery;

  if (existingAppointments && existingAppointments.length > 0) {
    return NextResponse.json(
      { error: 'Este horario ya está ocupado', code: 'TIME_CONFLICT' },
      { status: 409 }
    );
  }

  // Insert appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      tenant_id: effectiveClinic,
      pet_id,
      service_id,
      appointment_date,
      start_time: time_slot,
      end_time: endTime,
      vet_id: vet_id || null,
      notes: notes || null,
      status: 'scheduled',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return apiError('DATABASE_ERROR', 500);
  }

  return apiSuccess(data, 'Cita creada exitosamente', 201);
});

// PUT /api/booking - Update appointment
export const PUT = withAuth(async (ctx: AuthContext) => {
  // Apply rate limiting for write endpoints (20 requests per minute)
  const rateLimitResult = await rateLimit(ctx.request, 'write', ctx.user.id);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  const { user, profile, supabase, request } = ctx;

  // Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_FORMAT', 400);
  }

  const result = updateAppointmentSchema.safeParse(body);
  if (!result.success) {
    return apiError('VALIDATION_ERROR', 400, { field_errors: result.error.flatten().fieldErrors });
  }

  const { id, status, appointment_date, time_slot, vet_id, notes } = result.data;

  // Get existing appointment
  const { data: existing } = await supabase
    .from('appointments')
    .select('*, pet:pets(owner_id, tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ ...API_ERRORS.NOT_FOUND, message: 'Cita no encontrada' }, { status: 404 });
  }

  // Verify access
  const pet = existing.pet as { owner_id: string; tenant_id: string };
  const isOwner = pet.owner_id === user.id;
  const isStaff = ['vet', 'admin'].includes(profile.role);

  if (!isOwner && !isStaff) {
    return apiError('FORBIDDEN', 403);
  }

  // Owners can only cancel, staff can update anything
  if (!isStaff && status && status !== 'cancelled') {
    return NextResponse.json(
      { error: 'Solo puedes cancelar tu cita', code: 'OWNER_CANCEL_ONLY' },
      { status: 403 }
    );
  }

  // Validate status transitions
  if (status && existing.status !== status) {
    const VALID_TRANSITIONS: Record<string, string[]> = {
      'scheduled': ['confirmed', 'cancelled'],
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['checked_in', 'cancelled', 'no_show'],
      'checked_in': ['in_progress', 'no_show'],
      'in_progress': ['completed', 'no_show'],
      'completed': [],
      'cancelled': [],
      'no_show': []
    };

    const allowed = VALID_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `No se puede cambiar de "${existing.status}" a "${status}"`, code: 'INVALID_TRANSITION' },
        { status: 400 }
      );
    }
  }

  // Build update object
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (appointment_date) updates.appointment_date = appointment_date;
  if (vet_id !== undefined) updates.vet_id = vet_id;

  // Calculate proper end_time when rescheduling
  if (time_slot) {
    updates.start_time = time_slot;

    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', existing.service_id)
      .single();

    const duration = service?.duration_minutes || 30;
    const [hours, minutes] = time_slot.split(':').map(Number);
    const startMins = hours * 60 + minutes;
    const endMins = startMins + duration;
    const endHours = Math.floor(endMins / 60);
    const endMinutes = endMins % 60;
    updates.end_time = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

    // Check for overlapping appointments when rescheduling
    const rescheduleDate = appointment_date || existing.appointment_date;
    const newStartTimestamp = `${rescheduleDate}T${time_slot}:00`;
    const newEndTimestamp = `${rescheduleDate}T${updates.end_time}:00`;
    const checkVetId = vet_id !== undefined ? vet_id : existing.vet_id;

    let overlapQuery = supabase
      .from('appointments')
      .select('id, start_time, end_time, vet_id')
      .eq('tenant_id', pet.tenant_id)
      .eq('appointment_date', rescheduleDate)
      .neq('id', id) // Exclude the current appointment
      .not('status', 'in', '("cancelled","no_show")')
      .lt('start_time', newEndTimestamp)
      .gt('end_time', newStartTimestamp);

    // If a specific vet is assigned, check for that vet's availability
    if (checkVetId) {
      overlapQuery = overlapQuery.eq('vet_id', checkVetId);
    }

    const { data: existingAppointments } = await overlapQuery;

    if (existingAppointments && existingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'Este horario ya está ocupado', code: 'TIME_CONFLICT' },
        { status: 409 }
      );
    }
  }
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return apiError('DATABASE_ERROR', 500);
  }

  return apiSuccess(data, 'Cita actualizada');
});

// DELETE /api/booking - Delete appointment (admin only)
export const DELETE = withAuth(async (ctx: AuthContext) => {
  const { supabase, request } = ctx;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID de cita es requerido', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    return apiError('DATABASE_ERROR', 500);
  }

  return new NextResponse(null, { status: 204 });
}, { roles: ['admin'] }); // Only admins can delete
