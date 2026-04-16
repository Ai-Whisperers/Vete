import { supabase } from './setup';

export const cleanupTestData = async () => {
  // Clean up test data here
  await supabase.from('appointments').delete().eq('id', 'appointment-1');
  await supabase.from('pets').delete().eq('id', 'pet-1');
};