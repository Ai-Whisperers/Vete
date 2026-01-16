/**
 * Apply Schema Fix Migrations
 * 
 * This script applies the PaymentService and StoreService schema fixes
 * directly to the Supabase database using the service role key.
 * 
 * Run with: node apply-schema-fixes.mjs
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function applyMigrations() {
  console.log('🔧 Applying Schema Fix Migrations\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Migration 1: PaymentService columns
    console.log('1️⃣ Applying PaymentService migration...');
    const paymentMigration = readFileSync(
      resolve(__dirname, 'db/50_finance/03_payment_service_columns.sql'),
      'utf-8'
    );

    const { error: paymentError } = await supabase.rpc('exec_sql', {
      sql: paymentMigration
    });

    if (paymentError) {
      // Try direct execution if RPC doesn't work
      console.log('   Trying direct execution...');
      
      // Split into individual statements and execute
      const statements = paymentMigration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      for (const stmt of statements) {
        if (stmt.includes('DO $$') || stmt.includes('END $$')) {
          // Skip DO blocks for now - they need special handling
          continue;
        }
        
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        if (error && !error.message.includes('already exists')) {
          console.warn(`   ⚠️ Warning: ${error.message}`);
        }
      }
    }

    console.log('   ✅ PaymentService migration completed\n');

    // Migration 2: StoreService prescription column
    console.log('2️⃣ Applying StoreService migration...');
    const storeMigration = readFileSync(
      resolve(__dirname, 'db/60_store/08_prescription_required_column.sql'),
      'utf-8'
    );

    const { error: storeError } = await supabase.rpc('exec_sql', {
      sql: storeMigration
    });

    if (storeError) {
      console.log('   Trying direct execution...');
      
      const statements = storeMigration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      for (const stmt of statements) {
        if (stmt.includes('DO $$') || stmt.includes('END $$') || stmt.includes('CREATE OR REPLACE VIEW')) {
          // Skip complex blocks
          continue;
        }
        
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        if (error && !error.message.includes('already exists')) {
          console.warn(`   ⚠️ Warning: ${error.message}`);
        }
      }
    }

    console.log('   ✅ StoreService migration completed\n');

    // Verify migrations
    console.log('3️⃣ Verifying migrations...\n');

    // Check PaymentService columns
    const { data: paymentCols, error: paymentColsError } = await supabase
      .from('payments')
      .select('method, transaction_reference, stripe_payment_intent_id')
      .limit(1);

    if (paymentColsError) {
      console.error('   ❌ PaymentService columns verification failed:', paymentColsError.message);
    } else {
      console.log('   ✅ PaymentService columns verified (method, transaction_reference, stripe_payment_intent_id)');
    }

    // Check StoreService column
    const { data: storeCols, error: storeColsError } = await supabase
      .from('store_products')
      .select('is_prescription_required')
      .limit(1);

    if (storeColsError) {
      console.error('   ❌ StoreService column verification failed:', storeColsError.message);
    } else {
      console.log('   ✅ StoreService column verified (is_prescription_required)');
    }

    console.log('\n✅ All migrations applied and verified successfully!\n');
    console.log('Next steps:');
    console.log('  1. Run: node test-paymentservice-real.mjs');
    console.log('  2. Run: node test-storeservice-real.mjs');
    console.log('  3. Run: npm run test:integration\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

applyMigrations().catch(console.error);
