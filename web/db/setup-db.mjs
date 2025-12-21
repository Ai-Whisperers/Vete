#!/usr/bin/env node
/**
 * =============================================================================
 * SETUP-DB.MJS
 * =============================================================================
 * Database setup script for complete Supabase schema.
 *
 * Runs all SQL files in the correct dependency order using pg library.
 *
 * USAGE:
 *   node db/setup-db.mjs full          # Drop all, recreate schema + seeds
 *   node db/setup-db.mjs schema        # Schema only (no seeds)
 *   node db/setup-db.mjs seeds         # Seeds only
 *   node db/setup-db.mjs clean         # Drop all tables
 *   node db/setup-db.mjs --dry-run     # Show what would be run
 *
 * ENVIRONMENT:
 *   DATABASE_URL must be set (Supabase connection string)
 * =============================================================================
 */

import pg from 'pg';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// CONFIGURATION
// =============================================================================

const SCHEMA_ORDER = [
  // Phase 1: Extensions (must be first)
  '00_setup/01_extensions.sql',

  // Phase 2: Base functions (NO table dependencies)
  '00_setup/02_core_functions.sql',

  // Phase 3: Standardized Types (ENUMs and DOMAINs)
  '01_types/01_enums_and_domains.sql',

  // Phase 4: Core Entities (tenants must be first for FK references)
  '10_core/01_tenants.sql',
  '10_core/02_profiles.sql',
  '10_core/03_invites.sql',

  // Phase 5: Pet Management
  '20_pets/01_pets.sql',
  '20_pets/02_vaccines.sql',

  // Phase 6: Reference Data (diagnosis codes, drugs, etc.)
  '30_clinical/01_reference_data.sql',
  '30_clinical/02_medical_records.sql',

  // Phase 7: Scheduling
  '40_scheduling/01_services.sql',
  '40_scheduling/02_appointments.sql',

  // Phase 8: Store (must be before finance - invoice_items references products)
  '60_store/01_inventory.sql',
  '60_store/02_import_rpc.sql',

  // Phase 9: Finance (needs store_products)
  '50_finance/01_invoicing.sql',
  '50_finance/02_expenses.sql',

  // Phase 10: Hospitalization (needs invoices for billing FK)
  '30_clinical/03_hospitalization.sql',

  // Phase 11: Lab
  '30_clinical/04_lab.sql',

  // Phase 12: Insurance (needs invoices)
  '80_insurance/01_insurance.sql',

  // Phase 13: Communications
  '70_communications/01_messaging.sql',

  // Phase 14: System
  '85_system/01_staff.sql',
  '85_system/02_audit.sql',

  // Phase 15: Infrastructure
  '90_infrastructure/01_storage.sql',
  '90_infrastructure/02_realtime.sql',
  '90_infrastructure/03_views.sql',

  // Phase 16: Table-dependent functions (MUST run after all tables exist)
  '02_functions/02_core_functions.sql',
  '02_functions/03_helper_functions.sql',
];

// Seeds are now generated from JSON files in seeds/data/
// See seeds/seed-from-json.ts for the generator

// Tables to drop (in reverse dependency order)
const TABLES_TO_DROP = [
  // Seeds & Reference
  'growth_standards', 'vaccine_schedules', 'drug_dosages', 'diagnosis_codes',
  // Infrastructure
  'notifications', 'audit_logs',
  // System
  'staff_time_off', 'time_off_types', 'staff_schedule_entries', 'staff_schedules', 'staff_profiles',
  // Insurance
  'insurance_claim_items', 'insurance_claims', 'insurance_policies', 'insurance_providers',
  // Communications
  'whatsapp_messages', 'message_templates', 'message_attachments', 'messages', 'conversations',
  'reminder_templates', 'reminders',
  // Store & Inventory
  'procurement_leads', 'store_product_images', 'store_inventory_movements', 'store_inventory',
  'store_order_items', 'store_orders', 'store_coupons', 'store_campaigns',
  'store_review_likes', 'store_reviews', 'store_wishlist', 'store_cart_items', 'store_carts',
  'store_products', 'store_brands', 'store_categories', 'suppliers',
  // Finance
  'loyalty_transactions', 'loyalty_points', 'refunds', 'payments', 'invoice_items', 'invoices',
  'payment_methods', 'expense_categories', 'expenses',
  // Scheduling
  'appointments', 'services', 'service_categories',
  // Clinical
  'lab_result_comments', 'lab_result_attachments', 'lab_results', 'lab_order_items', 'lab_orders',
  'lab_panels', 'lab_test_catalog',
  'hospitalization_feedings', 'hospitalization_medications', 'hospitalization_vitals',
  'hospitalization_treatments', 'hospitalizations', 'kennels',
  'consent_documents', 'consent_template_versions', 'consent_templates',
  'prescription_items', 'prescriptions', 'medical_records',
  'euthanasia_assessments', 'reproductive_cycles', 'disease_reports',
  // Pets
  'lost_pets', 'vaccine_reactions', 'vaccines', 'qr_tags', 'pet_photos', 'pets',
  // Core
  'clinic_invites', 'profiles', 'tenants',
];

// =============================================================================
// HELPERS
// =============================================================================

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m',
  };

  const prefix = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗',
  };

  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
}

function loadEnv() {
  const envPaths = [
    join(__dirname, '..', '.env.local'),
    join(__dirname, '..', '.env'),
  ];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([^#][^=]*)=(.*)$/);
        if (match && !process.env[match[1].trim()]) {
          let value = match[2].trim();
          // Remove surrounding quotes
          value = value.replace(/^["']|["']$/g, '');
          process.env[match[1].trim()] = value;
        }
      }
    }
  }
}

async function getClient() {
  loadEnv();

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    throw new Error(
      'Missing DATABASE_URL or SUPABASE_DB_URL environment variable.\n' +
      'Get it from Supabase Dashboard > Settings > Database > Connection string'
    );
  }

  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

async function runSQLFile(client, filePath, filename, dryRun = false) {
  if (!existsSync(filePath)) {
    log(`File not found: ${filename}`, 'warning');
    return { success: false, skipped: true };
  }

  if (dryRun) {
    log(`Would run: ${filename}`, 'info');
    return { success: true };
  }

  const sql = readFileSync(filePath, 'utf-8');

  try {
    // Run each file in its own transaction to prevent cascading failures
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    log(`${filename}`, 'success');
    return { success: true };
  } catch (err) {
    // Rollback failed transaction and continue with next file
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors
    }
    log(`${filename}: ${err.message}`, 'error');
    return { success: false, error: err.message };
  }
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

async function cleanDatabase(client, dryRun = false) {
  log('Cleaning database (dropping all tables)...', 'warning');

  if (dryRun) {
    log('Would drop all tables', 'info');
    return;
  }

  // Disable triggers temporarily
  await client.query('SET session_replication_role = replica;');

  // Drop all tables
  for (const table of TABLES_TO_DROP) {
    try {
      await client.query(`DROP TABLE IF EXISTS public.${table} CASCADE;`);
    } catch {
      // Ignore errors for non-existent tables
    }
  }

  // Drop ALL public functions dynamically (except system functions)
  try {
    const functionResult = await client.query(`
      SELECT proname, pg_get_function_identity_arguments(oid) as args
      FROM pg_proc
      WHERE pronamespace = 'public'::regnamespace
      AND proname NOT LIKE 'pg_%'
      AND proname NOT LIKE 'plpgsql_%';
    `);

    for (const row of functionResult.rows) {
      const funcSignature = row.args ? `${row.proname}(${row.args})` : row.proname;
      try {
        await client.query(`DROP FUNCTION IF EXISTS public.${row.proname}(${row.args}) CASCADE;`);
      } catch {
        // Ignore individual function drop errors
      }
    }
  } catch {
    // Fallback to static list if dynamic query fails
    const dropFunctions = `
      DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
      DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
      DROP FUNCTION IF EXISTS public.is_staff_of(text) CASCADE;
      DROP FUNCTION IF EXISTS public.generate_invoice_number(text) CASCADE;
      DROP FUNCTION IF EXISTS public.soft_delete(text, uuid, uuid) CASCADE;
      DROP FUNCTION IF EXISTS public.restore_deleted(text, uuid) CASCADE;
      DROP FUNCTION IF EXISTS public.create_clinic_invite(text, text, text, text, text) CASCADE;
    `;
    try {
      await client.query(dropFunctions);
    } catch {
      // Ignore errors
    }
  }

  // Re-enable triggers
  await client.query('SET session_replication_role = DEFAULT;');

  log('Database cleaned', 'success');
}

async function runSchema(client, dryRun = false) {
  console.log('\n--- Running Schema ---\n');

  let successCount = 0;
  let errorCount = 0;

  for (const file of SCHEMA_ORDER) {
    const filePath = join(__dirname, file);
    const result = await runSQLFile(client, filePath, file, dryRun);

    if (result.success) {
      successCount++;
    } else if (!result.skipped) {
      errorCount++;
    }
  }

  return { successCount, errorCount };
}


/**
 * Generate SQL from JSON seed files using TypeScript generator
 */
function generateSeedsFromJSON(dryRun = false) {
  console.log('\n--- Generating Seeds from JSON ---\n');

  const generatorPath = join(__dirname, 'seeds', 'seed-from-json.ts');
  const outputPath = join(__dirname, 'seeds', 'generated-seed.sql');

  if (!existsSync(generatorPath)) {
    log(`Generator not found: ${generatorPath}`, 'error');
    return null;
  }

  if (dryRun) {
    log('Would generate SQL from JSON files', 'info');
    return outputPath;
  }

  try {
    log('Running seed-from-json.ts generator...', 'info');

    // Run the TypeScript generator and capture output
    const sql = execSync(`npx tsx "${generatorPath}"`, {
      cwd: join(__dirname, '..'),
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large output
    });

    // Write generated SQL to file
    writeFileSync(outputPath, sql, 'utf-8');
    log(`Generated SQL saved to: seeds/generated-seed.sql`, 'success');

    return outputPath;
  } catch (err) {
    log(`Generation failed: ${err.message}`, 'error');
    if (err.stderr) log(err.stderr, 'error');
    return null;
  }
}

/**
 * Run seeds from generated JSON-based SQL
 */
async function runJSONSeeds(client, dryRun = false) {
  console.log('\n--- Running JSON-Generated Seeds ---\n');

  // First, generate the SQL from JSON
  const generatedPath = generateSeedsFromJSON(dryRun);

  if (!generatedPath) {
    log('Seed generation failed, aborting', 'error');
    return { successCount: 0, errorCount: 1 };
  }

  if (dryRun) {
    log('Would execute generated-seed.sql', 'info');
    return { successCount: 1, errorCount: 0 };
  }

  // Execute the generated SQL
  const result = await runSQLFile(client, generatedPath, 'generated-seed.sql', dryRun);

  return {
    successCount: result.success ? 1 : 0,
    errorCount: result.success ? 0 : 1,
  };
}

// =============================================================================
// CLI
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  const dryRun = args.includes('--dry-run');

  console.log('\n==============================================');
  console.log('   Vete Database Setup Script');
  console.log('==============================================\n');

  if (dryRun) {
    log('DRY RUN MODE - No changes will be made', 'warning');
  }

  let client;

  if (!dryRun) {
    try {
      client = await getClient();
      log('Connected to database', 'success');
    } catch (err) {
      log(`Connection failed: ${err.message}`, 'error');
      process.exit(1);
    }
  }

  try {
    switch (command) {
      case 'full':
        log('Running FULL setup (clean + schema + seeds)', 'info');
        if (client) await cleanDatabase(client, dryRun);
        await runSchema(client, dryRun);
        await runJSONSeeds(client, dryRun);
        break;

      case 'schema':
        log('Running SCHEMA only', 'info');
        await runSchema(client, dryRun);
        break;

      case 'seeds':
        log('Running SEEDS only', 'info');
        await runJSONSeeds(client, dryRun);
        break;

      case 'generate':
        log('Generating SQL from JSON (no execution)', 'info');
        generateSeedsFromJSON(dryRun);
        break;

      case 'clean':
        log('Running CLEAN (drop all tables)', 'info');
        if (client) await cleanDatabase(client, dryRun);
        break;

      default:
        console.log(`
Usage: node db/setup-db.mjs <command> [options]

Commands:
  full       Drop all, recreate schema + seeds (default)
  schema     Run schema files only
  seeds      Run seed data only (from JSON)
  generate   Generate SQL from JSON (no execution)
  clean      Drop all tables

Options:
  --dry-run  Show what would be run without executing

Seed Data:
  All seed data is in db/seeds/data/ as JSON files.
  Run 'generate' to see the SQL without executing.

Environment:
  DATABASE_URL  PostgreSQL connection string from Supabase
`);
        process.exit(0);
    }

    console.log('\n--- Complete ---\n');
    log('Database setup finished successfully!', 'success');

  } catch (err) {
    log(`Error: ${err.message}`, 'error');
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

main();
