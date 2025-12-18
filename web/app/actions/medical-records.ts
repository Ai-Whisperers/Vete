'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMedicalRecord(formData: FormData) {
  const supabase = await createClient();

  const clinic = formData.get('clinic') as string;
  const petId = formData.get('pet_id') as string;
  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const diagnosis = formData.get('diagnosis') as string;
  const notes = formData.get('notes') as string;

  // Get Vitals
  const vitals = {
      weight: formData.get('weight') ? Number(formData.get('weight')) : null,
      temp: formData.get('temp') ? Number(formData.get('temp')) : null,
      hr: formData.get('hr') ? Number(formData.get('hr')) : null,
      rr: formData.get('rr') ? Number(formData.get('rr')) : null,
  };

  // Get Files
  const files = formData.getAll('attachments') as File[];
  const uploadedUrls: string[] = [];

  for (const file of files) {
      if (file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${petId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('records')
            .upload(fileName, file);

          if (uploadError) {
              console.error('Upload Error:', uploadError);
              continue; // Skip failed uploads but continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('records')
            .getPublicUrl(fileName);
          
          uploadedUrls.push(publicUrl);
      }
  }

  // Get Current User (Vet)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get user's tenant_id from their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) {
    throw new Error('No se encontró tu perfil de clínica.');
  }

  // Only staff can create medical records
  if (!['vet', 'admin'].includes(profile.role)) {
    throw new Error('Solo el personal veterinario puede crear registros médicos.');
  }

  // Insert Record
  const { error } = await supabase.from('medical_records').insert({
    pet_id: petId,
    tenant_id: profile.tenant_id,
    performed_by: user.id,
    type,
    title,
    diagnosis,
    notes,
    vitals: vitals, // Save JSONB
    attachments: uploadedUrls, // Save URLs
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('Create Record Error:', error);
    throw new Error('Failed to create record');
  }

  revalidatePath(`/${clinic}/portal/pets/${petId}`);
  redirect(`/${clinic}/portal/pets/${petId}`);
}
