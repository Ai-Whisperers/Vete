import { supabaseClient } from './supabase';

const invalidateCache = async (cacheKey: string) => {
  await supabaseClient.from('cache').delete().eq('key', cacheKey);
};

export { invalidateCache };