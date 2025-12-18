#!/usr/bin/env node
/**
 * Database Setup Runner
 * Executes _FULL_SETUP.sql against Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// IMPORTANT: Set DATABASE_URL environment variable before running
// Example: DATABASE_URL=postgresql://user:pass@host:port/db node run-setup.js
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Set it in your .env.local file or pass it directly:');
  console.error('   DATABASE_URL=postgresql://... node run-setup.js');
  process.exit(1);
}

async function run() {
  const sqlPath = path.join(__dirname, '_FULL_SETUP.sql');

  console.log('📖 Reading SQL file...');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`   Loaded ${(sql.length / 1024).toFixed(1)} KB`);

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase...');
    await client.connect();
    console.log('   Connected!');

    console.log('🚀 Executing SQL (this may take a minute)...');
    const start = Date.now();

    await client.query(sql);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`✅ Complete! (${elapsed}s)`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.position) {
      // Find the line with the error
      const lines = sql.substring(0, parseInt(err.position)).split('\n');
      console.error(`   Near line ${lines.length}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
