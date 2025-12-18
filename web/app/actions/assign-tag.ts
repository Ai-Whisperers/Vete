"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignTag(tagCode: string, petId: string) {
  const supabase = await createClient();
  
  // Call the RPC defined in 10_network_rpc.sql
  const { data, error } = await supabase.rpc('assign_tag_to_pet', {
    tag_code: tagCode,
    target_pet_id: petId
  });

  if (error) {
      return { error: error.message };
  }

  // The RPC returns { error: '...' } or { success: true }
  if (data && data.error) {
    return { error: data.error };
  }

  revalidatePath(`/tag/${tagCode}`);
  return { success: true };
}
