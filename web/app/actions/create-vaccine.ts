"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface ActionState {
  error?: string;
  success?: boolean;
}

export async function createVaccine(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const petId = formData.get("petId") as string;
  const clinic = formData.get("clinic") as string;
  const name = formData.get("name") as string;
  const date = formData.get("date") as string;
  const nextDate = formData.get("nextDate") as string;
  const batch = formData.get("batch") as string;

  // TICKET-SEC-008: Verify pet ownership/tenant access
  const { data: pet } = await supabase
    .from('pets')
    .select('owner_id, tenant_id')
    .eq('id', petId)
    .single();

  if (!pet) {
    return { error: "Mascota no encontrada." };
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  // Owner can only add vaccines for their own pets
  const isOwner = pet.owner_id === user.id;
  const isStaff = profile && ['vet', 'admin'].includes(profile.role) && profile.tenant_id === pet.tenant_id;

  if (!isOwner && !isStaff) {
    return { error: "No tienes acceso a esta mascota." };
  }

  // TICKET-BIZ-009: Validate next_due_date is after administered_date
  if (nextDate && new Date(nextDate) <= new Date(date)) {
    return { error: "La fecha de próxima dosis debe ser posterior a la fecha de administración." };
  }
  
  // Handle Multiple Photos
  const photos: string[] = [];
  const files = formData.getAll("photos") as File[]; // Requires client to send same name 'photos'

  for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${petId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('vaccines')
            .upload(fileName, file);

        if (!uploadError) {
             const { data: { publicUrl } } = supabase.storage
                .from('vaccines')
                .getPublicUrl(fileName);
             photos.push(publicUrl);
        }
      }
  }


  // TICKET-BIZ-008: Set status based on creator's role
  // Owner-created vaccines need verification; staff-created are auto-verified
  const status = isStaff ? 'verified' : 'pending';

  const { error } = await supabase.from("vaccines").insert({
    pet_id: petId,
    name,
    administered_date: date,
    next_due_date: nextDate || null,
    batch_number: batch,
    status,
    photos: photos,
    // Record verification info if staff-created
    verified_by: isStaff ? user.id : null,
    verified_at: isStaff ? new Date().toISOString() : null
  });

  if (error) {
    console.error("Db Error:", error);
    return { error: `Error: ${error.message} (${error.code})` };
  }

  revalidatePath(`/${clinic}/portal/dashboard`);
  redirect(`/${clinic}/portal/dashboard`);
}
