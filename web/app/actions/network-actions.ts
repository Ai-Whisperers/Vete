'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function requestAccess(petId: string, clinicId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc('grant_clinic_access', {
            target_pet_id: petId,
            target_clinic_id: clinicId
        });

        if (error) {
            console.error('RPC Error:', error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/${clinicId}/portal/dashboard/patients`);
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Internal Server Error' };
    }
}
