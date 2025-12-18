
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL');
    process.exit(1);
}

async function runMigration() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('✅ Connected to Database');

        console.log('📄 Running db/33_finance.sql...');
        const schemaPath = path.resolve(__dirname, '../db/33_finance.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('   Done.');

    } catch (err) {
        console.error('❌ Error during migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();
