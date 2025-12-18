"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ActionState {
  error?: string;
  success?: boolean;
  clientId?: string;
  petId?: string;
}

/**
 * Invite a new client (pet owner) from the dashboard.
 * This is used when a client contacts via WhatsApp and the vet wants to
 * create their account and pets for them.
 */
export async function inviteClient(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  // Verify Staff Role and get tenant_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: "No tienes permisos para realizar esta acción." };
  }

  if (!profile.tenant_id) {
    return { error: "No se encontró tu perfil de clínica." };
  }

  // Get form data
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const clinic = formData.get("clinic") as string;

  // Pet data (optional)
  const petName = (formData.get("petName") as string)?.trim();
  const petSpecies = formData.get("petSpecies") as string;
  const petBreed = (formData.get("petBreed") as string)?.trim() || null;
  const petSex = formData.get("petSex") as string || null;
  const petWeight = formData.get("petWeight") ? parseFloat(formData.get("petWeight") as string) : null;
  const petNotes = (formData.get("petNotes") as string)?.trim() || null;

  // Validation
  if (!email || !fullName) {
    return { error: "Email y nombre del cliente son requeridos." };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Email inválido." };
  }

  // Check if email already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existingProfile) {
    return { error: "Este correo ya está registrado. Busca al cliente en el directorio." };
  }

  // Check if already invited
  const { data: existingInvite } = await supabase
    .from('clinic_invites')
    .select('id')
    .eq('email', email)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (existingInvite) {
    return { error: "Este correo ya tiene una invitación pendiente." };
  }

  try {
    // Create invite
    const { data: invite, error: inviteError } = await supabase
      .from('clinic_invites')
      .insert({
        tenant_id: profile.tenant_id,
        email,
        role: 'owner',
        invited_by: user.id,
        full_name: fullName,
        phone,
        metadata: petName ? {
          pending_pet: {
            name: petName,
            species: petSpecies,
            breed: petBreed,
            sex: petSex,
            weight: petWeight,
            notes: petNotes
          }
        } : null
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return { error: "Error al crear la invitación." };
    }

    // TODO: Send email to client with invite link
    // For now, we just create the invite and it will be processed
    // when the client signs up with this email

    revalidatePath(`/${clinic}/dashboard/clients`);
    return { success: true };

  } catch (e) {
    console.error('Error in inviteClient:', e);
    return { error: "Error inesperado al invitar cliente." };
  }
}

/**
 * Create a pet for an existing client (staff action).
 * This allows vets to add pets for clients who contacted via WhatsApp.
 */
export async function createPetForClient(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  // Verify Staff Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: "No tienes permisos para realizar esta acción." };
  }

  // Get form data
  const clientId = formData.get("clientId") as string;
  const petName = (formData.get("petName") as string)?.trim();
  const petSpecies = formData.get("petSpecies") as string;
  const petBreed = (formData.get("petBreed") as string)?.trim() || null;
  const petSex = formData.get("petSex") as string || null;
  const petWeight = formData.get("petWeight") ? parseFloat(formData.get("petWeight") as string) : null;
  const petBirthdate = formData.get("petBirthdate") as string || null;
  const petColor = (formData.get("petColor") as string)?.trim() || null;
  const petNotes = (formData.get("petNotes") as string)?.trim() || null;
  const clinic = formData.get("clinic") as string;

  // Validation
  if (!clientId || !petName || !petSpecies) {
    return { error: "Cliente, nombre y especie de mascota son requeridos." };
  }

  // Verify client belongs to same tenant
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', clientId)
    .single();

  if (!clientProfile || clientProfile.tenant_id !== profile.tenant_id) {
    return { error: "Cliente no encontrado." };
  }

  if (clientProfile.role !== 'owner') {
    return { error: "Solo puedes agregar mascotas a propietarios." };
  }

  try {
    // Create pet
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .insert({
        owner_id: clientId,
        tenant_id: profile.tenant_id,
        name: petName,
        species: petSpecies,
        breed: petBreed,
        sex: petSex,
        weight_kg: petWeight,
        date_of_birth: petBirthdate,
        color_markings: petColor,
        notes: petNotes,
        created_by: user.id // Track who created the pet
      })
      .select()
      .single();

    if (petError) {
      console.error('Error creating pet:', petError);
      return { error: "Error al crear la mascota." };
    }

    revalidatePath(`/${clinic}/dashboard/clients/${clientId}`);
    return { success: true, petId: pet.id };

  } catch (e) {
    console.error('Error in createPetForClient:', e);
    return { error: "Error inesperado al crear mascota." };
  }
}
