"use server";

import { withActionAuth } from "@/lib/actions/with-action-auth";
import { actionSuccess, actionError } from "@/lib/actions/result";
import { revalidatePath } from "next/cache";
<<<<<<< HEAD
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
=======
import { z } from "zod";

// Validation schema
const assignTagSchema = z.object({
  tagCode: z.string().min(1, 'El código de la etiqueta es obligatorio'),
  petId: z.string().uuid('El ID de la mascota debe ser un UUID válido'),
});

export const assignTag = withActionAuth<void, [string, string]>(
  async (context, tagCode: string, petId: string) => {
    // Validate input
    const validation = assignTagSchema.safeParse({ tagCode, petId });
    if (!validation.success) {
      const fieldErrors = Object.fromEntries(
        Object.entries(validation.error.flatten().fieldErrors).map(([key, value]) => [
          key,
          value?.[0] || 'Error de validación',
        ])
      );
      return actionError('Por favor corrige los errores', fieldErrors);
    }

    const { supabase } = context;

    // Call the RPC defined in 10_network_rpc.sql
    const { data, error } = await supabase.rpc('assign_tag_to_pet', {
      tag_code: tagCode,
      target_pet_id: petId
    });

    if (error) {
      return actionError(error.message);
    }

    // The RPC returns { error: '...' } or { success: true }
    if (data && data.error) {
      return actionError(data.error);
    }

    revalidatePath(`/tag/${tagCode}`);
    return actionSuccess();
  },
  { requireStaff: false } // Pet owners should be able to assign tags to their own pets
);
>>>>>>> cc104e4 (feat: Introduce command palette, refactor calendar and pets-by-owner components, add new pages, server actions, and extensive database schema updates with security fixes and testing documentation.)
