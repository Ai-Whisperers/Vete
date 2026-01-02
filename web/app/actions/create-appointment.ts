'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ActionResult, FieldErrors } from '@/lib/types/action-result'
import { sendConfirmationEmail } from '@/lib/notification-service'
import { generateAppointmentConfirmationEmail } from '@/lib/email-templates'
import { ERROR_MESSAGES } from '@/lib/constants'
import { logger } from '@/lib/logger'

const createAppointmentSchema = z.object({
  clinic: z
    .string()
    .min(1, ERROR_MESSAGES.CLINIC_IDENTIFICATION_FAILED),
  pet_id: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_PET_SELECTION)
    .uuid(ERROR_MESSAGES.INVALID_PET_ID),

  start_time: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_DATETIME)
    .refine(val => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, { message: ERROR_MESSAGES.INVALID_DATETIME })
    .refine(val => {
      const date = new Date(val);
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15); // At least 15 minutes in the future
      return date >= now;
    }, { message: ERROR_MESSAGES.APPOINTMENT_TOO_SOON }),

  reason: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_REASON)
    .min(3, ERROR_MESSAGES.SHORT_REASON)
    .max(200, ERROR_MESSAGES.LONG_REASON),

  notes: z
    .string()
    .max(1000, ERROR_MESSAGES.LONG_NOTES)
    .optional()
    .transform(val => val?.trim() || null),
});

export async function createAppointment(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  // Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return {
      success: false,
      error: ERROR_MESSAGES.LOGIN_REQUIRED
    }
  }

  const clinic = formData.get('clinic') as string

  // Extract form data
  const rawData = {
    clinic: clinic,
    pet_id: formData.get('pet_id') as string,
    start_time: formData.get('start_time') as string,
    reason: formData.get('reason') as string,
    notes: formData.get('notes') as string,
  }

  // Validate
  const validation = createAppointmentSchema.safeParse(rawData)

  if (!validation.success) {
    const fieldErrors: FieldErrors = {}
    for (const issue of validation.error.issues) {
      const fieldName = issue.path[0] as string
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message
      }
    }

    return {
      success: false,
      error: ERROR_MESSAGES.REVIEW_FIELDS,
      fieldErrors
    }
  }

  const { pet_id, start_time, reason, notes } = validation.data

  // Verify Pet Ownership
  const { data: pet } = await supabase
    .from('pets')
    .select('id, name, owner_id, tenant_id')
    .eq('id', pet_id)
    .single()

  if (!pet) {
    return {
      success: false,
      error: ERROR_MESSAGES.PET_NOT_FOUND,
      fieldErrors: {
        pet_id: ERROR_MESSAGES.PET_NOT_FOUND
      }
    }
  }

  if (pet.owner_id !== user.id) {
    return {
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED_PET_ACCESS,
      fieldErrors: {
        pet_id: ERROR_MESSAGES.UNAUTHORIZED_PET_ACCESS
      }
    }
  }

  // Calculate End Time (Default 30 mins)
  const start = new Date(start_time)
  const end = new Date(start.getTime() + 30 * 60000)

  // Check for overlapping appointments (Global Clinic check)
  // Prevent double booking the same slot
  const { data: busySlot } = await supabase
    .from('appointments')
    .select('id')
    .eq('tenant_id', pet.tenant_id)
    .not('status', 'in', '("cancelled")') // Ignore cancelled
    .lt('start_time', end.toISOString())
    .gt('end_time', start.toISOString())
    .maybeSingle()

  if (busySlot) {
    return {
      success: false,
      error: ERROR_MESSAGES.SLOT_ALREADY_TAKEN,
      fieldErrors: {
        start_time: ERROR_MESSAGES.SLOT_ALREADY_TAKEN
      }
    }
  }

  // Check for Same Pet multiple appointments (Business Rule: 1 per day?)
  // Existing logic kept but optimized
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id, start_time')
    .eq('pet_id', pet_id)
    .neq('status', 'cancelled') // Fix: explicitly exclude cancelled instead of just "pending"
    .gte('start_time', new Date().toISOString())

  if (existingAppointments && existingAppointments.length > 0) {
    const sameDay = existingAppointments.find(apt => {
      const aptDate = new Date(apt.start_time)
      return aptDate.toDateString() === start.toDateString()
    })

    if (sameDay) {
      const existingTime = new Date(sameDay.start_time).toLocaleTimeString('es-PY', {
        hour: '2-digit',
        minute: '2-digit'
      })
      return {
        success: false,
        error: ERROR_MESSAGES.APPOINTMENT_ON_SAME_DAY(pet.name, existingTime),
        fieldErrors: {
          start_time: ERROR_MESSAGES.APPOINTMENT_ON_SAME_DAY(pet.name, existingTime).split('. ')[1] // Extracting just the second sentence
        }
      }
    }
  }

  // Insert Appointment
  const { error: insertError } = await supabase.from('appointments').insert({
    tenant_id: pet.tenant_id,
    pet_id: pet_id,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    status: 'pending',
    reason: reason,
    notes: notes,
    created_by: user.id
  })

  if (insertError) {
    logger.error('Failed to create appointment', {
      error: insertError,
      userId: user.id,
      tenantId: pet.tenant_id,
      petId: pet_id,
      errorCode: insertError.code
    })

    if (insertError.code === '23505') {
      return {
        success: false,
        error: ERROR_MESSAGES.SLOT_ALREADY_TAKEN, // Re-using for unique constraint, which implies slot taken
        fieldErrors: {
          start_time: ERROR_MESSAGES.SLOT_ALREADY_TAKEN
        }
      }
    }

    return {
      success: false,
      error: ERROR_MESSAGES.GENERIC_APPOINTMENT_ERROR
    }
  }

  // Send Confirmation Email
  try {
    const userEmail = user.email || 'correo_desconocido@example.com'; // Fallback if email is not available
    const userName = user.user_metadata?.full_name || user.email; // Fallback for name

    await sendConfirmationEmail({
      to: userEmail,
      subject: `Confirmación de Cita para ${pet.name} en ${clinic}`,
      body: generateAppointmentConfirmationEmail({
        userName: userName,
        petName: pet.name,
        reason: reason,
        dateTime: new Date(start.toISOString()).toLocaleString('es-PY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        clinicName: clinic,
      }),
    });
  } catch (emailError) {
    logger.error('Failed to send appointment confirmation email', {
      error: emailError instanceof Error ? emailError : undefined,
      userId: user.id,
      tenantId: pet.tenant_id,
      petId: pet_id
    })
    // Continue with the appointment process even if email sending fails
  }

  revalidatePath(`/${clinic}/portal/dashboard`)
  redirect(`/${clinic}/portal/dashboard?success=appointment_created`)
}

/**
 * Create appointment from JSON input (used by booking store)
 * Returns ActionResult without redirecting
 */
export async function createAppointmentJson(input: {
  clinic: string
  pet_id: string
  start_time: string
  reason: string
  notes?: string | null
}): Promise<ActionResult> {
  const supabase = await createClient()

  // Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return {
      success: false,
      error: ERROR_MESSAGES.LOGIN_REQUIRED
    }
  }

  // Validate
  const validation = createAppointmentSchema.safeParse(input)

  if (!validation.success) {
    const fieldErrors: FieldErrors = {}
    for (const issue of validation.error.issues) {
      const fieldName = issue.path[0] as string
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message
      }
    }

    return {
      success: false,
      error: ERROR_MESSAGES.REVIEW_FIELDS,
      fieldErrors
    }
  }

  const { clinic, pet_id, start_time, reason, notes } = validation.data

  // Verify Pet Ownership
  const { data: pet } = await supabase
    .from('pets')
    .select('id, name, owner_id, tenant_id')
    .eq('id', pet_id)
    .single()

  if (!pet) {
    return {
      success: false,
      error: ERROR_MESSAGES.PET_NOT_FOUND,
      fieldErrors: {
        pet_id: ERROR_MESSAGES.PET_NOT_FOUND
      }
    }
  }

  if (pet.owner_id !== user.id) {
    return {
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED_PET_ACCESS,
      fieldErrors: {
        pet_id: ERROR_MESSAGES.UNAUTHORIZED_PET_ACCESS
      }
    }
  }

  // Calculate End Time (Default 30 mins)
  const start = new Date(start_time)
  const end = new Date(start.getTime() + 30 * 60000)

  // Check for overlapping appointments
  const { data: busySlot } = await supabase
    .from('appointments')
    .select('id')
    .eq('tenant_id', pet.tenant_id)
    .not('status', 'in', '("cancelled")')
    .lt('start_time', end.toISOString())
    .gt('end_time', start.toISOString())
    .maybeSingle()

  if (busySlot) {
    return {
      success: false,
      error: ERROR_MESSAGES.SLOT_ALREADY_TAKEN,
      fieldErrors: {
        start_time: ERROR_MESSAGES.SLOT_ALREADY_TAKEN
      }
    }
  }

  // Check for Same Pet multiple appointments on same day
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id, start_time')
    .eq('pet_id', pet_id)
    .neq('status', 'cancelled')
    .gte('start_time', new Date().toISOString())

  if (existingAppointments && existingAppointments.length > 0) {
    const sameDay = existingAppointments.find(apt => {
      const aptDate = new Date(apt.start_time)
      return aptDate.toDateString() === start.toDateString()
    })

    if (sameDay) {
      const existingTime = new Date(sameDay.start_time).toLocaleTimeString('es-PY', {
        hour: '2-digit',
        minute: '2-digit'
      })
      return {
        success: false,
        error: ERROR_MESSAGES.APPOINTMENT_ON_SAME_DAY(pet.name, existingTime),
        fieldErrors: {
          start_time: ERROR_MESSAGES.APPOINTMENT_ON_SAME_DAY(pet.name, existingTime).split('. ')[1]
        }
      }
    }
  }

  // Insert Appointment
  const { error: insertError } = await supabase.from('appointments').insert({
    tenant_id: pet.tenant_id,
    pet_id: pet_id,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    status: 'pending',
    reason: reason,
    notes: notes,
    created_by: user.id
  })

  if (insertError) {
    logger.error('Failed to create appointment (JSON)', {
      error: insertError,
      userId: user.id,
      tenantId: pet.tenant_id,
      petId: pet_id,
      errorCode: insertError.code
    })

    if (insertError.code === '23505') {
      return {
        success: false,
        error: ERROR_MESSAGES.SLOT_ALREADY_TAKEN,
        fieldErrors: {
          start_time: ERROR_MESSAGES.SLOT_ALREADY_TAKEN
        }
      }
    }

    return {
      success: false,
      error: ERROR_MESSAGES.GENERIC_APPOINTMENT_ERROR
    }
  }

  // Send Confirmation Email
  try {
    const userEmail = user.email || 'correo_desconocido@example.com'
    const userName = user.user_metadata?.full_name || user.email

    await sendConfirmationEmail({
      to: userEmail,
      subject: `Confirmación de Cita para ${pet.name} en ${clinic}`,
      body: generateAppointmentConfirmationEmail({
        userName: userName,
        petName: pet.name,
        reason: reason,
        dateTime: new Date(start.toISOString()).toLocaleString('es-PY', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        clinicName: clinic,
      }),
    })
  } catch (emailError) {
    logger.error('Failed to send appointment confirmation email (JSON)', {
      error: emailError instanceof Error ? emailError : undefined,
      userId: user.id,
      tenantId: pet.tenant_id,
      petId: pet_id
    })
  }

  revalidatePath(`/${clinic}/portal/dashboard`)

  return {
    success: true,
    message: 'Cita creada exitosamente'
  }
}
