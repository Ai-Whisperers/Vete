/**
 * Integration Test Setup Helper
 *
 * Provides infrastructure for real database integration tests:
 * - Direct Supabase client (bypasses Next.js cookies)
 * - Test data creation helpers
 * - Cleanup coordination
 *
 * @example
 * ```typescript
 * describe('API (Integration)', () => {
 *   let supabase: SupabaseClient
 *
 *   beforeAll(async () => {
 *     supabase = await setupIntegrationTest()
 *   })
 *
 *   afterAll(async () => {
 *     await cleanupIntegrationTest()
 *   })
 *
 *   afterEach(async () => {
 *     await cleanupManager.cleanupWithRetry()
 *   })
 *
 *   it('should work with real data', async () => {
 *     const profile = await createTestProfile(supabase, 'vet', TEST_TENANT_ID)
 *     // ...
 *   })
 * })
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { cleanupManager } from './cleanup-manager';

const TEST_TENANT_ID = 'test-tenant-id';

let supabase: SupabaseClient;

export async function setupIntegrationTest() {
  supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  await supabase.auth.signIn({
    email: 'test@example.com',
    password: 'password',
  });
  return supabase;
}

export async function cleanupIntegrationTest() {
  await supabase.auth.signOut();
}

export async function createTestProfile(supabase: SupabaseClient, role: string, tenantId: string) {
  const { data, error } = await supabase.from('profiles').insert([
    {
      role,
      tenant_id: tenantId,
    },
  ]);
  if (error) {
    throw error;
  }
  return data[0];
}