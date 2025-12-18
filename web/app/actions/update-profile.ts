'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
      throw new Error('Not authenticated');
  }

  const full_name = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;
  const secondary_phone = formData.get('secondary_phone') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const clinic = formData.get('clinic') as string;

  const { error } = await supabase
    .from('profiles')
    .update({
        full_name,
        phone,
        secondary_phone,
        address,
        city,
        updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
      console.error("Update Profile Error:", error);
      throw new Error('Failed to update profile');
  }

  revalidatePath(`/${clinic}/portal/profile`);
  redirect(`/${clinic}/portal/profile?success=true`);
}
