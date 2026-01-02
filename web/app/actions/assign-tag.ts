"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server Action to assign a QR tag to a pet
 * Called directly from form action
 */
export async function assignTag(formData: FormData): Promise<void> {
  const tagCode = formData.get("tagCode") as string;
  const petId = formData.get("petId") as string;

  if (!tagCode || !petId) {
    throw new Error("Código de etiqueta y mascota son requeridos");
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("No autorizado");
  }

  // Verify the pet belongs to the user
  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("id, owner_id")
    .eq("id", petId)
    .single();

  if (petError || !pet) {
    throw new Error("Mascota no encontrada");
  }

  if (pet.owner_id !== user.id) {
    throw new Error("Esta mascota no te pertenece");
  }

  // Call the RPC to assign the tag
  const { data, error } = await supabase.rpc("assign_tag_to_pet", {
    tag_code: tagCode,
    target_pet_id: petId,
  });

  if (error) {
    throw new Error(error.message);
  }

  // The RPC returns { error: '...' } or { success: true }
  if (data && data.error) {
    throw new Error(data.error);
  }

  revalidatePath(`/tag/${tagCode}`);
  redirect(`/tag/${tagCode}`);
}
