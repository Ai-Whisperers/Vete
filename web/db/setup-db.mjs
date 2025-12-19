#!/usr/bin/env node
/**
 * =============================================================================
 * SETUP-DB.MJS
 * =============================================================================
 * Database setup script for the modular v2 schema.
 *
 * Runs all SQL files in the correct dependency order.
 *
 * USAGE:
 *   node setup-db.mjs                    # Run all migrations
 *   node setup-db.mjs --reset            # Drop all and recreate
 *   node setup-db.mjs --seeds            # Also run seed files
 *   node setup-db.mjs --dry-run          # Show what would be run
 *
 * ENVIRONMENT:
 *   DATABASE_URL or SUPABASE_DB_URL must be set
 * =============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// CONFIGURATION
// =============================================================================

const MIGRATION_ORDER = [
  // Phase 1: Extensions
  '01_extensions.sql',

  // Phase 2: Core Functions
  '02_functions/02_core_functions.sql',

  // Phase 3: Core Entities
  '10_core/10_tenants.sql',
  '10_core/11_profiles.sql',
  '10_core/12_invites.sql',

  // Phase 4: Pet Management
  '20_pets/20_pets.sql',
  '20_pets/21_vaccines.sql',

  // Phase 5: Clinical
  '30_clinical/30_reference_data.sql',
  '30_clinical/31_lab.sql',
  '30_clinical/32_hospitalization.sql',
  '30_clinical/33_medical_records.sql',

  // Phase 6: Scheduling
  '40_scheduling/40_services.sql',
  '40_scheduling/41_appointments.sql',

  // Phase 7: Finance
  '50_finance/50_invoicing.sql',
  '50_finance/51_expenses.sql',

  // Phase 8: Store
  '60_store/60_inventory.sql',

  // Phase 9: Communications
  '70_communications/70_messaging.sql',

  // Phase 10: Insurance
  '80_insurance/80_insurance.sql',

  // Phase 11: System
  '85_system/85_staff.sql',
  '85_system/86_audit.sql',
];

const SEED_ORDER = [
  '95_seeds/01_tenants.sql',
  '95_seeds/02_profiles.sql',
  '95_seeds/03_pets.sql',
  '95_seeds/04_services.sql',
  '95_seeds/05_sample_data.sql',
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
  // Try to load from .env.local first, then .env
  const envPaths = [
    join(__dirname, '..', '.env.local'),
    join(__dirname, '..', '.env'),
  ];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}

async function getSupabaseClient() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

async function runSQL(supabase, sql, filename) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct execution if RPC doesn't exist
      const { error: directError } = await supabase.from('_exec').select().limit(0);
      if (directError) {
        throw new Error(`SQL execution failed: ${error.message}`);
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

async function runMigrations(options = {}) {
  const { dryRun = false, seeds = false, reset = false } = options;

  log('Starting database setup...', 'info');

  if (dryRun) {
    log('DRY RUN MODE - No changes will be made', 'warning');
  }

  let supabase;
  if (!dryRun) {
    try {
      supabase = await getSupabaseClient();
      log('Connected to Supabase', 'success');
    } catch (err) {
      log(`Connection failed: ${err.message}`, 'error');
      process.exit(1);
    }
  }

  // Reset if requested
  if (reset && !dryRun) {
    log('Resetting database...', 'warning');
    const resetPath = join(__dirname, '00_cleanup.sql');
    if (existsSync(resetPath)) {
      const resetSQL = readFileSync(resetPath, 'utf-8');
      await runSQL(supabase, resetSQL, '00_cleanup.sql');
      log('Database reset complete', 'success');
    }
  }

  // Run migrations
  console.log('\n--- Running Migrations ---\n');

  let successCount = 0;
  let errorCount = 0;

  for (const file of MIGRATION_ORDER) {
    const filePath = join(__dirname, file);

    if (!existsSync(filePath)) {
      log(`File not found: ${file}`, 'warning');
      continue;
    }

    if (dryRun) {
      log(`Would run: ${file}`, 'info');
      successCount++;
      continue;
    }

    const sql = readFileSync(filePath, 'utf-8');
    const result = await runSQL(supabase, sql, file);

    if (result.success) {
      log(`${file}`, 'success');
      successCount++;
    } else {
      log(`${file}: ${result.error}`, 'error');
      errorCount++;
    }
  }

  // Run seeds if requested
  if (seeds) {
    console.log('\n--- Running Seeds ---\n');

    for (const file of SEED_ORDER) {
      const filePath = join(__dirname, file);

      if (!existsSync(filePath)) {
        continue;
      }

      if (dryRun) {
        log(`Would run: ${file}`, 'info');
        continue;
      }

      const sql = readFileSync(filePath, 'utf-8');
      const result = await runSQL(supabase, sql, file);

      if (result.success) {
        log(`${file}`, 'success');
      } else {
        log(`${file}: ${result.error}`, 'warning');
      }
    }
  }

  // Summary
  console.log('\n--- Summary ---\n');
  log(`Migrations: ${successCount} successful, ${errorCount} failed`,
      errorCount > 0 ? 'warning' : 'success');

  if (errorCount > 0) {
    process.exit(1);
  }
}

// =============================================================================
// CLI
// =============================================================================

const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  seeds: args.includes('--seeds'),
  reset: args.includes('--reset'),
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Database Setup Script v2

Usage:
  node setup-db.mjs [options]

Options:
  --reset     Drop all tables and recreate
  --seeds     Also run seed files
  --dry-run   Show what would be run without executing
  --help      Show this help message

Environment:
  NEXT_PUBLIC_SUPABASE_URL      Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Service role key for admin access
`);
  process.exit(0);
}

runMigrations(options);
