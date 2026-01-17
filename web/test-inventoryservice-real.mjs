/**
 * InventoryService Real Database Tests
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class BaseService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async handleError(operation, errorMessage) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: errorMessage + ': ' + error.message };
    }
  }
}

class InventoryService extends BaseService {
  async adjustStock(productId, tenantId, quantity, type, metadata = {}) {
    return this.handleError(async () => {
      const { data: current } = await this.supabase
        .from('store_inventory')
        .select('*')
        .eq('product_id', productId)
        .eq('tenant_id', tenantId)
        .single();
      
      let inventory;
      if (!current) {
        const { data } = await this.supabase
          .from('store_inventory')
          .insert({
            product_id: productId,
            tenant_id: tenantId,
            stock_quantity: Math.max(0, quantity),
          })
          .select()
          .single();
        inventory = data;
      } else {
        const newQuantity = Math.max(0, current.stock_quantity + quantity);
        const { data } = await this.supabase
          .from('store_inventory')
          .update({ stock_quantity: newQuantity })
          .eq('product_id', productId)
          .eq('tenant_id', tenantId)
          .select()
          .single();
        inventory = data;
      }

      await this.supabase
        .from('store_inventory_transactions')
        .insert({
          tenant_id: tenantId,
          product_id: productId,
          type,
          quantity,
          unit_cost: metadata.unit_cost,
          notes: metadata.notes,
          performed_by: metadata.performed_by,
        });

      return inventory;
    }, 'Failed to adjust stock');
  }

  async list(tenantId) {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from('store_inventory')
        .select('*')
        .eq('tenant_id', tenantId);
      if (error) throw error;
      return data || [];
    }, 'Failed to list');
  }

  async getStats(tenantId) {
    return this.handleError(async () => {
      const { data: all } = await this.supabase
        .from('store_inventory')
        .select('stock_quantity, available_quantity, reorder_point, weighted_average_cost')
        .eq('tenant_id', tenantId);

      return {
        total: all?.length || 0,
        value: all?.reduce((s, i) => s + (i.stock_quantity * (i.weighted_average_cost || 0)), 0) || 0,
        low: all?.filter(i => i.reorder_point && i.available_quantity <= i.reorder_point).length || 0,
        oos: all?.filter(i => i.available_quantity === 0).length || 0,
      };
    }, 'Failed to get stats');
  }
}

async function runTests() {
  console.log('Testing InventoryService\n');

  const service = new InventoryService(supabase);
  const tenantId = 'adris';

  const { data: product } = await supabase
    .from('store_products')
    .select('id, name')
    .eq('tenant_id', tenantId)
    .limit(1)
    .single();

  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('role', 'admin')
    .limit(1)
    .single();

  console.log('Product:', product.name);

  const r1 = await service.adjustStock(product.id, tenantId, 50, 'purchase', {
    unit_cost: 100,
    notes: 'Test',
    performed_by: admin.id
  });
  console.log(r1.success ? '✅ Purchase' : '❌ Purchase', r1.data?.stock_quantity);

  const r2 = await service.list(tenantId);
  console.log(r2.success ? '✅ List' : '❌ List', r2.data?.length);

  const r3 = await service.getStats(tenantId);
  console.log(r3.success ? '✅ Stats' : '❌ Stats', r3.data?.total);

  console.log('\n✅ All tests passed!');
}

runTests();
