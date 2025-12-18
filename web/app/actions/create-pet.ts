"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types/action-result";

export async function createPet(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión." };
  }

  // Get clinic from form (this comes from the URL parameter - where the pet is being registered)
  const clinic = formData.get("clinic") as string;

  if (!clinic) {
    return { success: false, error: "No se especificó la clínica." };
  }

  const name = formData.get("name") as string;
  const species = formData.get("species") as string;
  const breed = formData.get("breed") as string;
  const weight = formData.get("weight") as number | null;
  const microchip_id = formData.get("microchip_id") as string | null;
  const diet_category = formData.get("diet_category") as string | null;
  const diet_notes = formData.get("diet_notes") as string | null;
  // New Fields
  const sex = formData.get("sex") as string | null;
  const is_neutered = formData.get("is_neutered") === 'on';
  const color = formData.get("color") as string | null;
  const temperament = formData.get("temperament") as string | null;
  const allergies = formData.get("allergies") as string | null;
  const existing_conditions = formData.get("existing_conditions") as string | null;

  const photo = formData.get("photo") as File;

  let photoUrl = null;

  // Handle Photo Upload if present
  if (photo && photo.size > 0) {
     const fileExt = photo.name.split('.').pop();
     const fileName = `${user.id}/${Date.now()}.${fileExt}`;
     
     const { error: uploadError } = await supabase.storage
        .from('pets') // Requires bucket 'pets' to exist
        .upload(fileName, photo);

     if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, error: "No se pudo subir la foto. Por favor intente de nuevo." };
     } else {
        const { data: { publicUrl } } = supabase.storage
            .from('pets')
            .getPublicUrl(fileName);
        photoUrl = publicUrl;
     }
  }

  const { error } = await supabase.from("pets").insert({
    owner_id: user.id,
    tenant_id: clinic, // Pet is registered at the clinic from the URL
    name,
    species,
    breed,
    weight_kg: weight,
    microchip_id: microchip_id || null,
    diet_category: diet_category || null,
    diet_notes: diet_notes || null,
    photo_url: photoUrl,
    // V3 New Fields
    sex,
    is_neutered,
    color,
    temperament,
    allergies,
    existing_conditions,
    notes: existing_conditions // Using 'notes' as generic or keeping 'existing_conditions' 
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${clinic}/portal/dashboard`);
  redirect(`/${clinic}/portal/dashboard`);
}
