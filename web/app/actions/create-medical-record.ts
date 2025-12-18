"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMedicalRecord(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debe iniciar sesión" };

  const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
      return { error: "Acceso denegado. Solo personal médico." };
  }

  const clinic = formData.get("clinic") as string;
  const petId = formData.get("petId") as string;
  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const notes = formData.get("notes") as string;

  if (!title || !type) {
      return { error: "Título y Tipo son obligatorios" };
  }

  try {
      const { error } = await supabase.from('medical_records').insert({
          tenant_id: profile.tenant_id,
          pet_id: petId,
          performed_by: user.id,
          type,
          title,
          diagnosis,
          notes,
          attachments: [] // Todo: Handle file uploads
      });

      if (error) throw error;

  } catch (error: any) {
      console.error("Create Record Error:", error);
      return { error: error.message || "Error al guardar registro" };
  }

  revalidatePath(`/${clinic}/portal/pets/${petId}`);
  redirect(`/${clinic}/portal/pets/${petId}`);
}
