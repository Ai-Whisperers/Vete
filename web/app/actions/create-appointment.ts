'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ActionResult, FieldErrors } from '@/lib/types/action-result'
import { sendConfirmationEmail } from '@/web/lib/notification-service'
import { generateAppointmentConfirmationEmail } from '@/web/lib/email-templates'
import { ERROR_MESSAGES } from '@/web/lib/constants'

// Schema
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
      // Allow booking if it's at least 15 mins in the future
      now.setMinutes(now.getMinutes() + 15); 
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
    .nullable()
    .transform(val => val?.trim() || null),
});

type AppointmentInput = z.infer<typeof createAppointmentSchema>;

/**
 * Core logic for creating an appointment
 * Returns a result object, does NOT redirect
 */
async function validateAndCreateAppointment(input: unknown): Promise<ActionResult> {
  const supabase = await createClient()

  // Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return {
      success: false,
      error: ERROR_MESSAGES.LOGIN_REQUIRED
    }
  }

  // Validate Input
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

  // ---------------------------------------------------------------------------
  // ROBUST OVERLAP CHECK (Using Database Function)
  // ---------------------------------------------------------------------------
  const dateStr = start.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const startTimeStr = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM
  const endTimeStr = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM

  const { data: hasOverlap, error: overlapError } = await supabase.rpc('check_appointment_overlap', {
    p_tenant_id: pet.tenant_id,
    p_date: dateStr,
    p_start_time: startTimeStr,
    p_end_time: endTimeStr,
    p_vet_id: null, // Check global availability for now
    p_exclude_id: null
  });

  if (overlapError) {
    console.error('Overlap Check Error:', overlapError);
    return {
        success: false,
        error: ERROR_MESSAGES.GENERIC_APPOINTMENT_ERROR
    };
  }

  if (hasOverlap) {
    return {
      success: false,
      error: ERROR_MESSAGES.SLOT_ALREADY_TAKEN,
      fieldErrors: {
        start_time: ERROR_MESSAGES.SLOT_ALREADY_TAKEN
      }
    }
  }

  // ---------------------------------------------------------------------------
  // SAME DAY CHECK (Business Rule)
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // INSERT APPOINTMENT
  // ---------------------------------------------------------------------------
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
    console.error('Appointment Insert Error:', insertError)
    return {
      success: false,
      error: ERROR_MESSAGES.GENERIC_APPOINTMENT_ERROR
    }
  }

  // ---------------------------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------------------------
  try {
    const userEmail = user.email || 'correo_desconocido@example.com'; 
    const userName = user.user_metadata?.full_name || user.email;

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
    console.error('Error sending confirmation email:', emailError);
    // Non-blocking
  }

  revalidatePath(`/${clinic}/portal/dashboard`)
  revalidatePath(`/${clinic}/portal/appointments`)
  
  return { success: true }
}

/**
 * Action for useActionState (FormData)
 */
export async function createAppointment(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const input = {
    clinic: formData.get('clinic') as string,
    pet_id: formData.get('pet_id') as string,
    start_time: formData.get('start_time') as string,
    reason: formData.get('reason') as string,
    notes: formData.get('notes') as string,
  }

  const result = await validateAndCreateAppointment(input);

  if (result.success) {
    // Redirect pattern for Form submissions
    redirect(`/${input.clinic}/portal/dashboard?success=appointment_created`)
  }

  return result;
}

/**
 * Action for Client Components (JSON/Object)
 */
export async function createAppointmentJson(input: unknown): Promise<ActionResult> {
  // Directly return the result (success or failure)
  // Client component handles the UI transition
  return await validateAndCreateAppointment(input);
}
