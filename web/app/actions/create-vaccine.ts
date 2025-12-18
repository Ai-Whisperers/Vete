"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVaccine(prevState: any, formData: FormData) {
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


  const { error } = await supabase.from("vaccines").insert({
    pet_id: petId,
    name,
    administered_date: date,
    next_due_date: nextDate || null,
    batch_number: batch,
    status: 'pending', // Always pending for user uploads
    photos: photos
  });

  if (error) {
    console.error("Db Error:", error);
    return { error: `Error: ${error.message} (${error.code})` };
  }

  revalidatePath(`/${clinic}/portal/dashboard`);
  redirect(`/${clinic}/portal/dashboard`);
}
