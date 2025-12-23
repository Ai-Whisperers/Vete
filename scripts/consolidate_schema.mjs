
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// EXTRACTED FROM db/setup-db.mjs
const SCHEMA_ORDER = [
  "00_setup/01_extensions.sql",
  "00_setup/02_core_functions.sql",
  "01_types/01_enums_and_domains.sql",
  "10_core/01_tenants.sql",
  "10_core/02_profiles.sql",
  "10_core/03_invites.sql",
  "20_pets/01_pets.sql",
  "20_pets/02_vaccines.sql",
  "30_clinical/01_reference_data.sql",
  "30_clinical/02_medical_records.sql",
  "40_scheduling/01_services.sql",
  "40_scheduling/02_appointments.sql",
  "60_store/suppliers/01_suppliers.sql",
  "60_store/categories/01_categories.sql",
  "60_store/brands/01_brands.sql",
  "60_store/products/01_products.sql",
  "60_store/inventory/01_inventory.sql",
  "60_store/orders/01_orders.sql",
  "60_store/reviews/01_reviews.sql",
  "60_store/procurement/01_procurement.sql",
  "60_store/02_import_rpc.sql",
  "60_store/03_checkout_rpc.sql",
  "50_finance/01_invoicing.sql",
  "50_finance/02_expenses.sql",
  "30_clinical/03_hospitalization.sql",
  "30_clinical/04_lab.sql",
  "80_insurance/01_insurance.sql",
  "70_communications/01_messaging.sql",
  "85_system/01_staff.sql",
  "90_infrastructure/01_storage.sql",
  "02_functions/02_core_functions.sql",
  "02_functions/03_helper_functions.sql",
];

function consolidate() {
  console.log('Starting schema consolidation...');
  
  const migrationDir = join(PROJECT_ROOT, 'supabase', 'migrations');
  if (!existsSync(migrationDir)) {
    mkdirSync(migrationDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const outputFile = join(migrationDir, `${timestamp}_baseline.sql`);
  
  let fullSql = '-- BASELINE MIGRATION \n-- Auto-generated from legacy setup-db.mjs\n\n';

  for (const file of SCHEMA_ORDER) {
    const filePath = join(PROJECT_ROOT, 'web', 'db', file);
    try {
      const content = readFileSync(filePath, 'utf-8');
      fullSql += `\n\n-- ==========================================\n-- FILE: ${file}\n-- ==========================================\n\n`;
      fullSql += content;
      console.log(`Processed: ${file}`);
    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
  }

  writeFileSync(outputFile, fullSql);
  console.log(`\nSUCCESS! Baseline migration created at:\n${outputFile}`);
}

consolidate();
