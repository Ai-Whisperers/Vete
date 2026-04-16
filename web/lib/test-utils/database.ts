import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Test Database Helper
 * 
 * Provides utilities for interacting with the test database.
 */

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get a test database client
 */
export function getTestDatabaseClient() {
  return supabase;
}

/**
 * Seed the test database with initial data
 */
export async function seedTestDatabase() {
  // Seed data here
  // For example:
  // const { data, error } = await supabase.from('table').insert([
  //   { column1: 'value1', column2: 'value2' },
  // ]);
  // if (error) throw error;
}

/**
 * Clean up the test database after tests
 */
export async function cleanupTestDatabase() {
  // Clean up data here
  // For example:
  // const { data, error } = await supabase.from('table').delete();
  // if (error) throw error;
}