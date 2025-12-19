"use server";

import { withActionAuth } from "@/lib/actions/with-action-auth";
import { actionSuccess, actionError } from "@/lib/actions/result";
import { revalidatePath } from "next/cache";
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
