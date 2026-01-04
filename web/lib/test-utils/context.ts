/**
 * Test Context - Manages mode and cleanup tracking
 *
 * Modes:
 * - 'test': Data is tracked and cleaned up after tests
 * - 'seed': Data persists for demo/development purposes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type Mode = 'test' | 'seed';

interface CreatedResource {
  table: string;
  id: string;
  tenant_id?: string;
}

class TestContext {
  private mode: Mode = 'test';
  private createdResources: CreatedResource[] = [];
  private supabaseClient: SupabaseClient | null = null;

  /**
   * Set the operating mode
   * - 'test': Resources are tracked for cleanup
   * - 'seed': Resources persist (no cleanup)
   */
  setMode(mode: Mode): void {
    this.mode = mode;
  }

  getMode(): Mode {
    return this.mode;
  }

  isTestMode(): boolean {
    return this.mode === 'test';
  }

  isSeedMode(): boolean {
    return this.mode === 'seed';
  }

  /**
   * Get Supabase client (creates if needed)
   */
  getClient(): SupabaseClient {
    if (!this.supabaseClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
      }

      this.supabaseClient = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
    return this.supabaseClient;
  }

  /**
   * Track a created resource for cleanup
   */
  track(table: string, id: string, tenant_id?: string): void {
    if (this.mode === 'test') {
      this.createdResources.push({ table, id, tenant_id });
    }
  }

  /**
   * Get all tracked resources
   */
  getTracked(): CreatedResource[] {
    return [...this.createdResources];
  }

  /**
   * Clean up all tracked resources (in reverse order)
   */
  async cleanup(): Promise<void> {
    if (this.mode === 'seed') {
      console.log('Seed mode: skipping cleanup');
      return;
    }

    const client = this.getClient();
    const resources = [...this.createdResources].reverse();

    // Group by table for batch deletes
    const byTable = new Map<string, string[]>();
    for (const r of resources) {
      const ids = byTable.get(r.table) || [];
      ids.push(r.id);
      byTable.set(r.table, ids);
    }

    // Delete in order (respecting FK constraints)
    const deleteOrder = [
      'invoice_items',
      'payments',
      'invoices',
      'store_order_items',
      'store_orders',
      'store_carts',
      'loyalty_transactions',
      'loyalty_points',
      'vaccine_reactions',
      'vaccines',
      'medical_records',
      'prescriptions',
      'appointments',
      'hospitalization_vitals',
      'hospitalization_medications',
      'hospitalization_feedings',
      'hospitalizations',
      'lab_results',
      'lab_order_items',
      'lab_orders',
      'pets',
      'staff_profiles',
      'profiles',
    ];

    for (const table of deleteOrder) {
      const ids = byTable.get(table);
      if (ids && ids.length > 0) {
        const { error } = await client.from(table).delete().in('id', ids);
        if (error) {
          console.warn(`Failed to cleanup ${table}:`, error.message);
        }
      }
    }

    this.createdResources = [];
  }

  /**
   * Reset context (for test isolation)
   */
  reset(): void {
    this.createdResources = [];
  }
}

// Singleton instance
export const testContext = new TestContext();

// Convenience exports
export const setMode = (mode: Mode) => testContext.setMode(mode);
export const getMode = () => testContext.getMode();
export const isTestMode = () => testContext.isTestMode();
export const isSeedMode = () => testContext.isSeedMode();
export const trackResource = (table: string, id: string, tenant_id?: string) =>
  testContext.track(table, id, tenant_id);
export const cleanup = () => testContext.cleanup();
export const resetContext = () => testContext.reset();
export const getClient = () => testContext.getClient();
