import { getTestDatabaseClient } from './database';

/**
 * Seed the test database with initial data
 */
export async function seedTestDatabase() {
  const supabase = getTestDatabaseClient();

  // Seed data here
  // For example:
  // const { data, error } = await supabase.from('table').insert([
  //   { column1: 'value1', column2: 'value2' },
  // ]);
  // if (error) throw error;
}