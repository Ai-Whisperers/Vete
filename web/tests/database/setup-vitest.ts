import { setupTestDatabase } from './setup';

export async function setupVitest() {
  const testDatabase = await setupTestDatabase();

  // Set environment variables for Vitest
  process.env.TEST_DATABASE_URL = testDatabase.url;
  process.env.TEST_DATABASE_USER = testDatabase.username;
  process.env.TEST_DATABASE_PASSWORD = testDatabase.password;

  // Start the test database
  await startTestDatabase(testDatabase);
}

async function startTestDatabase(testDatabase: any) {
  // Start the test database using the Supabase client
  const supabase = createClient(testDatabase.url, testDatabase.username, testDatabase.password);
  await supabase.from('databases').select('id');
}