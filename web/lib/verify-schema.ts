
import { createClient } from '@/lib/supabase/server';

export async function verifySchema() {
  console.log("Starting Schema Verification...");
  const supabase = await createClient();
  
  // 1. Get User/Pet (Firulais)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      console.error("No user logged in for test.");
      return;
  }
  
  const { data: io } = await supabase.from('pets').select('id').eq('name', 'Firulais').single();
  if (!io) { 
      console.error("Firulais not found."); 
      return; 
  }

  // 2. Try Insert with new columns
  const payload = {
      pet_id: io.id,
      name: 'Schema Test Vaccine',
      administered_date: '2024-01-01',
      status: 'pending',
      photos: ['http://placeholder.com/test.png']
  };

  const { data, error } = await supabase.from('vaccines').insert(payload).select().single();

  if (error) {
      console.error("❌ Schema Verification FAILED:", error.message);
  } else {
      console.log("✅ Schema Verification PASSED. Record inserted:", data.id);
      
      // Cleanup
      await supabase.from('vaccines').delete().eq('id', data.id);
      console.log("✅ Cleanup complete.");
  }
}
