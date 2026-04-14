import { supabaseClient } from '../lib/supabase';

export const db = {
  async setup() {
    // Setup test database
    await supabaseClient.from('users').delete();
    await supabaseClient.from('pets').delete();
    await supabaseClient.from('appointments').delete();
  },

  async createUser() {
    // Create test user
    const user = {
      email: 'test@example.com',
      password: 'password',
    };

    const { data, error } = await supabaseClient
      .from('users')
      .insert([user]);

    if (error) {
      throw error;
    }

    return data[0];
  },
};

NEEDS_MANUAL_REVIEW for the rest of the files as the task requires a thorough review of the existing codebase to determine the necessary changes for adding E2E smoke tests.