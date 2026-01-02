"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult, FieldErrors } from "@/lib/types/action-result";
import { z } from "zod";
import { logger } from '@/lib/logger';

// Validation schema for client invite
const inviteClientSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido (ej: cliente@email.com)")
    .max(100, "El correo no puede exceder 100 caracteres")
    .transform(val => val.toLowerCase().trim()),

  fullName: z
    .string()
    .min(1, "El nombre del cliente es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .transform(val => val.trim()),

  phone: z
    .string()
    .optional()
    .transform(val => val?.trim() || null)
    .refine(val => {
      if (!val) return true;
      const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
      return /^\+?[0-9]{6,15}$/.test(cleaned);
    }, { message: "Ingresa un número de teléfono válido" }),

  // Pet fields (optional)
  petName: z
    .string()
    .max(50, "El nombre de la mascota no puede exceder 50 caracteres")
    .optional()
    .transform(val => val?.trim() || null),

  petSpecies: z
    .enum(["dog", "cat", ""])
    .optional()
    .transform(val => val || null),

  petBreed: z
    .string()
    .max(100, "La raza no puede exceder 100 caracteres")
    .optional()
    .transform(val => val?.trim() || null),

  petSex: z
    .enum(["male", "female", ""])
    .optional()
    .transform(val => val || null),

  petWeight: z
    .string()
    .optional()
    .transform(val => {
      if (!val || val === "") return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    }),

  petNotes: z
    .string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .transform(val => val?.trim() || null),
});

/**
 * Invite a new client (pet owner) from the dashboard.
 */
export async function inviteClient(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para invitar clientes."
    };
  }

  // Verify Staff Role and get tenant_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return {
      success: false,
      error: "Solo veterinarios y administradores pueden invitar clientes."
    };
  }

  if (!profile.tenant_id) {
    return {
      success: false,
      error: "No se encontró tu perfil de clínica. Contacta a soporte."
    };
  }

  const clinic = formData.get("clinic") as string;

  // Extract form data
  const rawData = {
    email: formData.get("email") as string,
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    petName: formData.get("petName") as string,
    petSpecies: formData.get("petSpecies") as string,
    petBreed: formData.get("petBreed") as string,
    petSex: formData.get("petSex") as string,
    petWeight: formData.get("petWeight") as string,
    petNotes: formData.get("petNotes") as string,
  };

  // Validate
  const validation = inviteClientSchema.safeParse(rawData);

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
      error: "Por favor, revisa los campos marcados en rojo.",
      fieldErrors
    };
  }

  const validData = validation.data;

  // Check if email already exists in profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('email', validData.email)
    .single();

  if (existingProfile) {
    return {
      success: false,
      error: "Este correo ya está registrado en el sistema.",
      fieldErrors: {
        email: `Este correo pertenece a "${existingProfile.full_name}". Busca al cliente en el directorio en lugar de crear una nueva invitación.`
      }
    };
  }

  // Check if already invited
  const { data: existingInvite } = await supabase
    .from('clinic_invites')
    .select('id, created_at')
    .eq('email', validData.email)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (existingInvite) {
    const inviteDate = new Date(existingInvite.created_at).toLocaleDateString();
    return {
      success: false,
      error: "Este correo ya tiene una invitación pendiente.",
      fieldErrors: {
        email: `Ya se envió una invitación a este correo el ${inviteDate}. Puedes reenviarla desde la lista de invitaciones pendientes.`
      }
    };
  }

  try {
    // Create invite
    const { error: inviteError } = await supabase
      .from('clinic_invites')
      .insert({
        tenant_id: profile.tenant_id,
        email: validData.email,
        role: 'owner',
        invited_by: user.id,
        full_name: validData.fullName,
        phone: validData.phone,
        metadata: validData.petName ? {
          pending_pet: {
            name: validData.petName,
            species: validData.petSpecies,
            breed: validData.petBreed,
            sex: validData.petSex,
            weight: validData.petWeight,
            notes: validData.petNotes
          }
        } : null
      });

    if (inviteError) {
      logger.error('Failed to create client invite', {
        error: inviteError,
        userId: user.id,
        tenant: profile.tenant_id,
        errorCode: inviteError.code
      });

      if (inviteError.code === "23505") {
        return {
          success: false,
          error: "Este correo ya tiene una invitación pendiente.",
          fieldErrors: {
            email: "Ya existe una invitación para este correo electrónico."
          }
        };
      }

      return {
        success: false,
        error: "No se pudo crear la invitación. Por favor, intenta de nuevo."
      };
    }

    revalidatePath(`/${clinic}/dashboard/clients`);
    return { success: true };

  } catch (e) {
    logger.error('Unexpected error in inviteClient', {
      error: e instanceof Error ? e : undefined,
      userId: user.id,
      tenant: profile.tenant_id
    });
    return {
      success: false,
      error: "Ocurrió un error inesperado. Por favor, intenta de nuevo."
    };
  }
}

// Validation schema for creating a pet for existing client
const createPetForClientSchema = z.object({
  clientId: z
    .string()
    .uuid("ID de cliente inválido"),

  petName: z
    .string()
    .min(1, "El nombre de la mascota es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .transform(val => val.trim()),

  petSpecies: z
    .enum(["dog", "cat"], {
      message: "Selecciona perro o gato"
    }),

  petBreed: z
    .string()
    .max(100, "La raza no puede exceder 100 caracteres")
    .optional()
    .transform(val => val?.trim() || null),

  petSex: z
    .enum(["male", "female", ""])
    .optional()
    .transform(val => val || null),

  petWeight: z
    .string()
    .optional()
    .transform(val => {
      if (!val || val === "") return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    })
    .refine(val => val === null || (val > 0 && val <= 500), {
      message: "El peso debe estar entre 0.1 y 500 kg"
    }),

  petBirthdate: z
    .string()
    .optional()
    .transform(val => val || null),

  petColor: z
    .string()
    .max(100, "El color no puede exceder 100 caracteres")
    .optional()
    .transform(val => val?.trim() || null),

  petNotes: z
    .string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .transform(val => val?.trim() || null),
});

/**
 * Create a pet for an existing client (staff action).
 */
export async function createPetForClient(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para crear mascotas."
    };
  }

  // Verify Staff Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return {
      success: false,
      error: "Solo veterinarios y administradores pueden crear mascotas para clientes."
    };
  }

  const clinic = formData.get("clinic") as string;

  // Extract form data
  const rawData = {
    clientId: formData.get("clientId") as string,
    petName: formData.get("petName") as string,
    petSpecies: formData.get("petSpecies") as string,
    petBreed: formData.get("petBreed") as string,
    petSex: formData.get("petSex") as string,
    petWeight: formData.get("petWeight") as string,
    petBirthdate: formData.get("petBirthdate") as string,
    petColor: formData.get("petColor") as string,
    petNotes: formData.get("petNotes") as string,
  };

  // Validate
  const validation = createPetForClientSchema.safeParse(rawData);

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
      error: "Por favor, revisa los campos marcados en rojo.",
      fieldErrors
    };
  }

  const validData = validation.data;

  // Verify client belongs to same tenant
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('tenant_id, role, full_name')
    .eq('id', validData.clientId)
    .single();

  if (!clientProfile) {
    return {
      success: false,
      error: "Cliente no encontrado. Es posible que haya sido eliminado.",
      fieldErrors: {
        clientId: "No se encontró el cliente seleccionado."
      }
    };
  }

  if (clientProfile.tenant_id !== profile.tenant_id) {
    return {
      success: false,
      error: "Este cliente no pertenece a tu clínica."
    };
  }

  if (clientProfile.role !== 'owner') {
    return {
      success: false,
      error: "Solo puedes agregar mascotas a cuentas de propietarios, no a personal de la clínica."
    };
  }

  try {
    // Create pet
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .insert({
        owner_id: validData.clientId,
        tenant_id: profile.tenant_id,
        name: validData.petName,
        species: validData.petSpecies,
        breed: validData.petBreed,
        sex: validData.petSex,
        weight_kg: validData.petWeight,
        date_of_birth: validData.petBirthdate,
        color: validData.petColor,
        notes: validData.petNotes,
        created_by: user.id
      })
      .select('id')
      .single();

    if (petError) {
      logger.error('Failed to create pet for client', {
        error: petError,
        userId: user.id,
        tenant: profile.tenant_id,
        clientId: validData.clientId,
        errorCode: petError.code
      });

      if (petError.code === "23505") {
        return {
          success: false,
          error: "Ya existe una mascota con estos datos para este cliente."
        };
      }

      return {
        success: false,
        error: "No se pudo crear la mascota. Por favor, intenta de nuevo."
      };
    }

    revalidatePath(`/${clinic}/dashboard/clients/${validData.clientId}`);
    return { success: true };

  } catch (e) {
    logger.error('Unexpected error in createPetForClient', {
      error: e instanceof Error ? e : undefined,
      userId: user.id,
      tenant: profile.tenant_id
    });
    return {
      success: false,
      error: "Ocurrió un error inesperado. Por favor, intenta de nuevo."
    };
  }
}
