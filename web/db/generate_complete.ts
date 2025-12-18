
import * as fs from 'node:fs';
import * as path from 'node:path';

const DB_DIR = path.join(process.cwd(), 'web/db');
const OUTPUT_FILE = path.join(DB_DIR, 'complete.sql');

// Defined order matters for dependencies
// Defined order for STRUCTURE
const STRUCTURE_FILES = [
    '00_cleanup.sql',
    '01_schema.sql',
    '02_policies.sql',
    // '03_seed.sql' -> EXCLUDED from Structure. See seed_data.sql
    '04_indexes.sql',
    '06_rpcs.sql',
    '07_triggers.sql',
    '10_vaccine_templates.sql',
    '11_appointments.sql'
];

async function generate() {
    console.log(`📦 Generating ${OUTPUT_FILE} (Structure Only)...`);
    let fullContent = '';

    for (const filename of STRUCTURE_FILES) {
        const filePath = path.join(DB_DIR, filename);
        try {
            if (fs.existsSync(filePath)) {
                console.log(`   + Linking ${filename}`);
                const content = fs.readFileSync(filePath, 'utf-8');
                fullContent += `\n-- =========================================================================================\n`;
                fullContent += `-- CONTENT FROM: ${filename.toUpperCase()}\n`;
                fullContent += `-- =========================================================================================\n\n`;
                fullContent += content + '\n';
            } else {
                console.error(`⚠️  MISSING FILE: ${filename} (Skipping)`);
            }
        } catch (error) {
            console.error(`❌ Error reading ${filename}:`, error);
        }
    }

    // Write output
    fs.writeFileSync(OUTPUT_FILE, fullContent);
    console.log(`✅ Success! Wrote structure to complete.sql`);
}

// Execute
generate().catch(console.error);
