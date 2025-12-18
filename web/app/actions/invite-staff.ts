"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult, FieldErrors } from "@/lib/types/action-result";
import { z } from "zod";

// Validation schema for staff invite
const inviteStaffSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido (ej: veterinario@clinica.com)")
    .max(100, "El correo no puede exceder 100 caracteres")
    .transform(val => val.toLowerCase().trim()),

  role: z
    .enum(["vet", "admin"], {
      errorMap: () => ({ message: "Selecciona un cargo válido (Veterinario o Administrador)" })
    }),
});

export async function inviteStaff(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para invitar personal."
    };
  }

  // Verify Admin Role and get tenant_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return {
      success: false,
      error: "Solo los administradores pueden invitar nuevo personal. Contacta al administrador de tu clínica."
    };
  }

  if (!profile?.tenant_id) {
    return {
      success: false,
      error: "No se encontró tu perfil de clínica. Contacta a soporte técnico."
    };
  }

  const clinic = formData.get("clinic") as string;

  // Extract form data
  const rawData = {
    email: formData.get("email") as string,
    role: formData.get("role") as string,
  };

  // Validate
  const validation = inviteStaffSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of validation.error.issues) {
      const fieldName = issue.path[0] as string;
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message;
      }
    }

    return {
      success: false,
      error: "Por favor, revisa los campos marcados en rojo.",
      fieldErrors
    };
  }

  const validData = validation.data;

  // Check if email already exists in profiles for this clinic
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('email', validData.email)
    .single();

  if (existingProfile) {
    const roleText = existingProfile.role === 'vet' ? 'veterinario' :
                     existingProfile.role === 'admin' ? 'administrador' : 'propietario';
    return {
      success: false,
      error: "Este correo ya está registrado.",
      fieldErrors: {
        email: `"${existingProfile.full_name}" ya tiene una cuenta como ${roleText}. No es necesario invitarlo de nuevo.`
      }
    };
  }

  // Check if already invited
  const { data: existingInvite } = await supabase
    .from('clinic_invites')
    .select('id, role, created_at')
    .eq('email', validData.email)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (existingInvite) {
    const inviteDate = new Date(existingInvite.created_at).toLocaleDateString();
    const roleText = existingInvite.role === 'vet' ? 'veterinario' : 'administrador';
    return {
      success: false,
      error: "Este correo ya tiene una invitación pendiente.",
      fieldErrors: {
        email: `Ya se invitó a este correo como ${roleText} el ${inviteDate}. Puedes reenviar la invitación desde la lista de pendientes.`
      }
    };
  }

  // Create invite
  const { error: insertError } = await supabase.from("clinic_invites").insert({
    tenant_id: profile.tenant_id,
    email: validData.email,
    role: validData.role,
    invited_by: user.id
  });

  if (insertError) {
    console.error("Invite staff error:", insertError);

    if (insertError.code === '23505') {
      return {
        success: false,
        error: "Este correo ya tiene una invitación pendiente.",
        fieldErrors: {
          email: "Ya existe una invitación para este correo electrónico."
        }
      };
    }

    return {
      success: false,
      error: "No se pudo crear la invitación. Por favor, intenta de nuevo."
    };
  }

  revalidatePath(`/${clinic}/portal/team`);
  return { success: true };
}

export async function removeInvite(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = formData.get('id') as string;
  const clinic = formData.get('clinic') as string;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Debes iniciar sesion para eliminar invitaciones.");
  }

  // Verify user is admin of the target clinic
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new Error("Solo los administradores pueden eliminar invitaciones.");
  }

  if (profile.tenant_id !== clinic) {
    throw new Error("No tienes acceso a esta clinica.");
  }

  // Delete invite by ID with tenant filter for extra safety
  const { error: deleteError } = await supabase
    .from("clinic_invites")
    .delete()
    .eq('id', id)
    .eq('tenant_id', clinic);

  if (deleteError) {
    console.error("Delete invite error:", deleteError);
    throw new Error("No se pudo eliminar la invitacion. Por favor, intenta de nuevo.");
  }

  revalidatePath(`/${clinic}/dashboard/team`);
  revalidatePath(`/${clinic}/portal/team`);
}
