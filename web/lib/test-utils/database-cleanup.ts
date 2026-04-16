import { getTestDatabaseClient } from './database';

/**
 * Clean up the test database after tests
 */
export async function cleanupTestDatabase() {
  const supabase = getTestDatabaseClient();

  // Clean up data here
  // For example:
  // const { data, error } = await supabase.from('table').delete();
  // if (error) throw error;
}