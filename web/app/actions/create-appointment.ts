'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ActionResult, FieldErrors } from '@/lib/types/action-result'
import { sendConfirmationEmail } from '@/web/lib/email-service'
import { generateAppointmentConfirmationEmail } from '@/web/lib/email-templates'

const createAppointmentSchema = z.object({
  pet_id: z
    .string()
    .min(1, "Debes seleccionar una mascota")
    .uuid("ID de mascota inválido"),

  start_time: z
    .string()
    .min(1, "La fecha y hora son obligatorias")
    .refine(val => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, { message: "Fecha y hora inválidas" })
    .refine(val => {
      const date = new Date(val);
      const now = new Date();
      // Allow appointments at least 15 minutes in the future
      now.setMinutes(now.getMinutes() + 15);
      return date >= now;
    }, { message: "La cita debe ser al menos 15 minutos en el futuro" }),

  reason: z
    .string()
    .min(1, "El motivo de la consulta es obligatorio")
    .min(3, "Describe brevemente el motivo (mínimo 3 caracteres)")
    .max(200, "El motivo no puede exceder 200 caracteres"),

  notes: z
    .string()
    .max(1000, "Las notas no pueden exceder 1000 caracteres")
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
      error: 'Debes iniciar sesión para agendar una cita. Por favor, inicia sesión y vuelve a intentarlo.'
    }
  }

  const clinic = formData.get('clinic') as string

  if (!clinic) {
    return {
      success: false,
      error: 'No se pudo identificar la clínica. Por favor, recarga la página.'
    }
  }

  // Extract form data
  const rawData = {
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
      error: 'Por favor, revisa los campos marcados en rojo.',
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
      error: 'Mascota no encontrada.',
      fieldErrors: {
        pet_id: 'La mascota seleccionada no existe o fue eliminada. Selecciona otra mascota.'
      }
    }
  }

  if (pet.owner_id !== user.id) {
    return {
      success: false,
      error: 'No tienes permiso para agendar citas para esta mascota.',
      fieldErrors: {
        pet_id: 'Solo puedes agendar citas para tus propias mascotas.'
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
      error: 'Este horario ya está ocupado.',
      fieldErrors: {
        start_time: 'El horario seleccionado no está disponible. Por favor elige otro.'
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
        error: `${pet.name} ya tiene una cita para este día.`,
        fieldErrors: {
          start_time: `Ya existe una cita a las ${existingTime}.`
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
    console.error('Appointment Error:', insertError)

    if (insertError.code === '23505') {
      return {
        success: false,
        error: 'Ya existe una cita en este horario.',
        fieldErrors: {
          start_time: 'Este horario ya está ocupado. Por favor, elige otro.'
        }
      }
    }

    return {
      success: false,
      error: 'No se pudo agendar la cita. Por favor, intenta de nuevo en unos minutos.'
    }
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
    console.error('Error sending confirmation email:', emailError);
    // Continue with the appointment process even if email sending fails
  }

  revalidatePath(`/${clinic}/portal/dashboard`)
  redirect(`/${clinic}/portal/dashboard?success=appointment_created`)
}
