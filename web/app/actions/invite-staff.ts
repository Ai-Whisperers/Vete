"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types/action-result";

export async function inviteStaff(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión." };
  }

  // Verify Admin Role and get tenant_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
      return { success: false, error: "No tienes permisos de administrador." };
  }

  if (!profile?.tenant_id) {
      return { success: false, error: "No se encontró tu perfil de clínica." };
  }

  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const clinic = formData.get("clinic") as string;

  if (!email || !role) {
      return { success: false, error: "Email y Cargo son requeridos." };
  }

  const { error } = await supabase.from("clinic_invites").insert({
    tenant_id: profile.tenant_id,
    email: email.toLowerCase().trim(),
    role: role
  });

  if (error) {
    console.error(error);
    if (error.code === '23505') return { success: false, error: "Este correo ya está invitado." };
    return { success: false, error: "Error al invitar." };
  }

  revalidatePath(`/${clinic}/portal/team`);
  return { success: true };
}

export async function removeInvite(email: string, clinic: string) {
    const supabase = await createClient();

    // TICKET-SEC-006: Add proper authorization checks
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('No autorizado');
    }

    // Verify user is admin of the target clinic
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        throw new Error('Solo administradores pueden eliminar invitaciones');
    }

    if (profile.tenant_id !== clinic) {
        throw new Error('No tienes acceso a esta clínica');
    }

    // Delete invite with tenant filter for extra safety
    await supabase
        .from("clinic_invites")
        .delete()
        .eq('email', email)
        .eq('tenant_id', clinic);

    revalidatePath(`/${clinic}/portal/team`);
}
