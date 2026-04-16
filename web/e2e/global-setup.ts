import { seedTestDatabase } from '@/lib/test-utils/database-seed';
import { cleanupTestDatabase } from '@/lib/test-utils/database-cleanup';

/**
 * Global setup for E2E tests
 */
export async function globalSetup() {
  await seedTestDatabase();
}

/**
 * Global teardown for E2E tests
 */
export async function globalTeardown() {
  await cleanupTestDatabase();
}
Note: The above code is just a starting point and you will need to modify it to fit your specific use case. You will also need to create the necessary tables and seed data in your test database.