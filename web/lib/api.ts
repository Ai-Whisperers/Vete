import { supabaseClient } from '../supabase';

const getSightings = async (supabaseClient: any, session: any) => {
  const { data, error } = await supabaseClient
    .from('sightings')
    .select('id, latitude, longitude, timestamp')
    .eq('user_id', session.user.id);

  if (error) {
    throw error;
  }

  return data;
};

export { getSightings };