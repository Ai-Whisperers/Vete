"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ActionResult, FieldErrors } from "@/lib/types/action-result";
import { z } from "zod";

// Validation schema with detailed Spanish error messages
const createVaccineSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la vacuna es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  date: z
    .string()
    .min(1, "La fecha de aplicación es obligatoria")
    .refine(val => {
      const date = new Date(val);
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return date <= now;
    }, { message: "La fecha de aplicación no puede ser en el futuro" }),

  nextDate: z
    .string()
    .optional()
    .transform(val => val || null),

  batch: z
    .string()
    .max(50, "El número de lote no puede exceder 50 caracteres")
    .optional()
    .transform(val => val || null),
});

export async function createVaccine(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para registrar una vacuna. Por favor, inicia sesión y vuelve a intentarlo."
    };
  }

  const petId = formData.get("petId") as string;
  const clinic = formData.get("clinic") as string;

  if (!petId) {
    return {
      success: false,
      error: "No se pudo identificar la mascota. Por favor, vuelve al perfil de la mascota e intenta de nuevo."
    };
  }

  if (!clinic) {
    return {
      success: false,
      error: "No se pudo identificar la clínica. Por favor, recarga la página e intenta de nuevo."
    };
  }

  // Verify pet ownership/tenant access
  const { data: pet } = await supabase
    .from('pets')
    .select('owner_id, tenant_id, name')
    .eq('id', petId)
    .single();

  if (!pet) {
    return {
      success: false,
      error: "Mascota no encontrada. Es posible que haya sido eliminada o que no tengas acceso a ella."
    };
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
    return {
      success: false,
      error: "No tienes permiso para agregar vacunas a esta mascota. Solo el dueño o el personal de la clínica pueden hacerlo."
    };
  }

  // Extract and validate form data
  const rawData = {
    name: formData.get("name") as string,
    date: formData.get("date") as string,
    nextDate: formData.get("nextDate") as string,
    batch: formData.get("batch") as string,
  };

  const validation = createVaccineSchema.safeParse(rawData);

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
      error: "Por favor, revisa los campos marcados en rojo y corrige los errores.",
      fieldErrors
    };
  }

  const { name, date, nextDate, batch } = validation.data;

  // Validate next_due_date is after administered_date
  if (nextDate && new Date(nextDate) <= new Date(date)) {
    return {
      success: false,
      error: "La fecha de próxima dosis debe ser posterior a la fecha de aplicación.",
      fieldErrors: {
        nextDate: "Esta fecha debe ser posterior a la fecha de aplicación. Revisa ambas fechas."
      }
    };
  }

  // Handle Multiple Photos
  const photos: string[] = [];
  const files = formData.getAll("photos") as File[];

  for (const file of files) {
    if (file.size > 0) {
      // Validate file size (5MB max per photo)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: "Una de las fotos es demasiado grande.",
          fieldErrors: {
            photos: `Cada foto debe pesar menos de 5MB. El archivo "${file.name}" pesa ${(file.size / 1024 / 1024).toFixed(1)}MB.`
          }
        };
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: "Formato de imagen no soportado.",
          fieldErrors: {
            photos: `Solo se permiten imágenes JPG, PNG, GIF o WebP. El archivo "${file.name}" tiene un formato no válido.`
          }
        };
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${petId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vaccines')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Continue with other photos, don't fail the entire operation
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('vaccines')
          .getPublicUrl(fileName);
        photos.push(publicUrl);
      }
    }
  }

  // Handle Certificate Upload
  let certificateUrl = null;
  const certificate = formData.get("certificate") as File;

  if (certificate && certificate.size > 0) {
    // Validate certificate size (10MB max)
    if (certificate.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "El certificado es demasiado grande.",
        fieldErrors: {
          certificate: `El certificado debe pesar menos de 10MB. Tu archivo pesa ${(certificate.size / 1024 / 1024).toFixed(1)}MB.`
        }
      };
    }

    const allowedCertTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedCertTypes.includes(certificate.type)) {
      return {
        success: false,
        error: "Formato de certificado no válido.",
        fieldErrors: {
          certificate: "Solo se permiten archivos PDF, JPG, PNG o WebP para el certificado."
        }
      };
    }

    const certExt = certificate.name.split('.').pop()?.toLowerCase() || 'pdf';
    const certFileName = `certificates/${user.id}/${petId}/${Date.now()}.${certExt}`;

    const { error: certUploadError } = await supabase.storage
      .from('vaccines')
      .upload(certFileName, certificate);

    if (!certUploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('vaccines')
        .getPublicUrl(certFileName);
      certificateUrl = publicUrl;
    }
  }

  // Set status based on creator's role
  const status = isStaff ? 'verified' : 'pending';

  const { error: insertError } = await supabase.from("vaccines").insert({
    pet_id: petId,
    name,
    administered_date: date,
    next_due_date: nextDate,
    batch_number: batch,
    status,
    photos: photos.length > 0 ? photos : null,
    certificate_url: certificateUrl,
    verified_by: isStaff ? user.id : null,
    verified_at: isStaff ? new Date().toISOString() : null
  });

  if (insertError) {
    console.error("Insert error:", insertError);

    let userMessage = "No se pudo guardar la vacuna. ";

    if (insertError.code === "23505") {
      userMessage = "Ya existe un registro de esta vacuna para esta fecha. Verifica si ya fue registrada.";
    } else if (insertError.code === "23503") {
      userMessage += "La mascota ya no existe en el sistema.";
    } else if (insertError.code === "42501") {
      userMessage += "No tienes permiso para agregar vacunas. Contacta a la clínica.";
    } else {
      userMessage += "Por favor, intenta de nuevo. Si el problema persiste, contacta a soporte.";
    }

    return { success: false, error: userMessage };
  }

  revalidatePath(`/${clinic}/portal/dashboard`);
  revalidatePath(`/${clinic}/portal/pets/${petId}`);
  redirect(`/${clinic}/portal/pets/${petId}?tab=vaccines&success=vaccine_added`);
}
