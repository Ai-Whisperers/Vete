import { cleanupData } from '../../lib/data-retention';
import { supabaseClient } from '../../lib/supabase';

describe('Data retention', () => {
  it('should clean up appointments', async () => {
    // Create test appointments
    const { data, error } = await supabaseClient
      .from('appointments')
      .insert([{ created_at: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000) }]);

    if (error) {
      throw error;
    }

    // Run cleanup
    await cleanupData('appointments');

    // Check if appointment was deleted
    const { data: remainingAppointments, error: error2 } = await supabaseClient
      .from('appointments')
      .select('id');

    if (error2) {
      throw error2;
    }

    expect(remainingAppointments).toHaveLength(0);
  });
});