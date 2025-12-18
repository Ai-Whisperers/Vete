#!/usr/bin/env node

/**
 * Database Setup Script for Vete
 *
 * Usage:
 *   node setup-db.mjs [mode] [options]
 *
 * Modes:
 *   full    - Run cleanup + all schema + all seeds (default)
 *   schema  - Run cleanup + schema files only (00-89)
 *   seeds   - Run seed files only (90-99)
 *   clean   - Run only 00_cleanup.sql
 *   fixes   - Run only fix files (100+)
 *   file    - Run a single SQL file (specify with --file)
 *
 * Options:
 *   --file <name>  - Specify file for 'file' mode
 *   --dry-run      - Show what would be executed without running
 *   --continue     - Continue on error instead of stopping
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = dirname(__dirname);

// Load environment
dotenv.config({ path: join(webDir, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Colors for console
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

const log = {
  step: (msg) => console.log(`${colors.cyan}▶ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
};

// Parse arguments
const args = process.argv.slice(2);
const mode = args.find(a => !a.startsWith('--')) || 'full';
const dryRun = args.includes('--dry-run');
const continueOnError = args.includes('--continue');
const fileArg = args.find((a, i) => args[i - 1] === '--file');

// Validate environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  log.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  log.info('Note: This script requires the service role key for admin access.');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// Get SQL files sorted by number
function getSqlFiles() {
  const files = readdirSync(__dirname)
    .filter(f => /^\d+.*\.sql$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/^(\d+)/)[1]);
      const numB = parseInt(b.match(/^(\d+)/)[1]);
      return numA - numB;
    });

  return {
    all: files,
    schema: files.filter(f => parseInt(f.match(/^(\d+)/)[1]) < 90),
    seeds: files.filter(f => {
      const num = parseInt(f.match(/^(\d+)/)[1]);
      return num >= 90 && num < 100;
    }),
    fixes: files.filter(f => parseInt(f.match(/^(\d+)/)[1]) >= 100),
  };
}

// Execute SQL file
async function executeSqlFile(filename) {
  const filePath = join(__dirname, filename);

  if (!existsSync(filePath)) {
    log.warn(`File not found: ${filename}`);
    return false;
  }

  if (dryRun) {
    log.info(`[DRY] Would run: ${filename}`);
    return true;
  }

  process.stdout.write(`${colors.gray}  Running: ${filename}${colors.reset}`);

  try {
    const sql = readFileSync(filePath, 'utf-8');

    // Split into statements (basic split on semicolons, respecting strings)
    // For complex scripts, we execute as a single transaction
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct query (limited)
      if (error.message.includes('exec_sql')) {
        console.log(`${colors.yellow} (exec_sql not available)${colors.reset}`);
        log.warn('Install the exec_sql helper function or use psql directly');
        return false;
      }
      throw error;
    }

    console.log(`${colors.green} ✓${colors.reset}`);
    return true;
  } catch (err) {
    console.log(`${colors.red} ✗${colors.reset}`);
    log.error(`  Error: ${err.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log();
  console.log(`${colors.magenta}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}       Vete Database Setup Script (Node.js)${colors.reset}`);
  console.log(`${colors.magenta}═══════════════════════════════════════════════════${colors.reset}`);
  console.log();

  log.step(`Mode: ${mode}`);
  if (dryRun) log.warn('DRY RUN - No SQL will be executed');
  console.log();

  const files = getSqlFiles();
  let filesToRun = [];
  let success = true;

  switch (mode) {
    case 'full':
      filesToRun = [...files.schema, ...files.seeds, ...files.fixes];
      break;
    case 'schema':
      filesToRun = files.schema;
      break;
    case 'seeds':
      filesToRun = files.seeds;
      break;
    case 'clean':
      filesToRun = ['00_cleanup.sql'];
      break;
    case 'fixes':
      filesToRun = files.fixes;
      break;
    case 'file':
      if (!fileArg) {
        log.error('Please specify a file with --file <filename>');
        process.exit(1);
      }
      filesToRun = [fileArg];
      break;
    default:
      log.error(`Unknown mode: ${mode}`);
      process.exit(1);
  }

  log.step(`Running ${filesToRun.length} file(s)`);
  console.log();

  for (const file of filesToRun) {
    const result = await executeSqlFile(file);
    if (!result) {
      success = false;
      if (!continueOnError && !dryRun) {
        log.error('Stopping due to error. Use --continue to skip errors.');
        break;
      }
    }
  }

  console.log();
  console.log(`${colors.magenta}═══════════════════════════════════════════════════${colors.reset}`);

  if (success) {
    log.success('Database setup completed successfully!');
  } else {
    log.error('Database setup completed with errors');
    process.exit(1);
  }

  console.log();
}

main().catch(err => {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
