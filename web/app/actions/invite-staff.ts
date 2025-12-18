"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ActionState {
  error?: string;
  success?: boolean;
}

export async function inviteStaff(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  // Verify Admin Role and get tenant_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
      return { error: "No tienes permisos de administrador." };
  }

  if (!profile?.tenant_id) {
      return { error: "No se encontró tu perfil de clínica." };
  }

  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const clinic = formData.get("clinic") as string;

  if (!email || !role) {
      return { error: "Email y Cargo son requeridos." };
  }

  const { error } = await supabase.from("clinic_invites").insert({
    tenant_id: profile.tenant_id,
    email: email.toLowerCase().trim(),
    role: role
  });

  if (error) {
    console.error(error);
    if (error.code === '23505') return { error: "Este correo ya está invitado." };
    return { error: "Error al invitar." };
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
