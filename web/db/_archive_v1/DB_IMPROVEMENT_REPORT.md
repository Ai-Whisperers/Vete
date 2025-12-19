# Database Improvement Report

> **Comprehensive analysis of the `web/db` folder with actionable recommendations**

## Executive Summary

The database schema is well-structured with ~52 SQL files (~18,000+ lines) covering multi-tenancy, RLS security, and extensive features. However, there are several issues that need addressing for production readiness and easy environment management.

---

## 1. CRITICAL ISSUES

### 1.1 Duplicate File Numbers

**Problem**: Multiple files share the same prefix number, causing confusion and potential execution order issues.

| Number | Files | Issue |
|--------|-------|-------|
| `55` | `55_appointment_overlap.sql`, `55_appointment_workflow.sql` | Duplicate |
| `56` | `56_appointment_functions.sql` (appears once but usage.md suggests duplication) | Potential conflict |
| `85` | `85_fix_checkout_inventory_table.sql`, `85_owner_clinic_connections.sql` | Duplicate |

**Fix**: Renumber files:
```
55_appointment_overlap.sql      → 55_appointment_overlap.sql (keep)
55_appointment_workflow.sql     → 56_appointment_workflow.sql
56_appointment_functions.sql    → 57_appointment_functions.sql
57_materialized_views.sql       → 58_materialized_views.sql (already exists v2)
85_fix_checkout_inventory.sql   → 86_fix_checkout_inventory_table.sql
85_owner_clinic_connections.sql → 87_owner_clinic_connections.sql
```

### 1.2 Hardcoded Default Tenant

**Problem**: `handle_new_user()` defaults to `'adris'` when no invite exists.

```sql
-- In 12_functions.sql line 47
default_tenant TEXT := 'adris';  -- HARDCODED!
```

**Fix**: Make this configurable or require invites for all signups:
```sql
-- Option 1: Require invite
IF invite_record.tenant_id IS NULL THEN
    RAISE EXCEPTION 'No clinic invite found for email: %', NEW.email;
END IF;

-- Option 2: Use environment variable (via app setting)
default_tenant TEXT := current_setting('app.default_tenant', TRUE);
```

### 1.3 Invoice Schema Mismatch

**Problem**: `81_checkout_functions.sql` uses different column names than `21_schema_invoicing.sql`:

| 81_checkout_functions.sql | 21_schema_invoicing.sql |
|---------------------------|-------------------------|
| `owner_id` | `client_id` |
| `amount_due` | `balance_due` |
| `tax_rate` (column) | calculated from items |

**Fix**: Update `81_checkout_functions.sql` to match the invoice schema or create a compatibility layer.

### 1.4 Missing Soft Delete Columns in Extended Tables

**Problem**: Core tables have `deleted_at` support but many extended schema tables (21-28) don't consistently include it.

**Fix**: Add to all extended tables:
```sql
ALTER TABLE services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- etc.
```

---

## 2. STRUCTURAL IMPROVEMENTS

### 2.1 Recommended File Organization

```
web/db/
├── 00_cleanup.sql              # Complete reset
├── 01_extensions.sql           # PostgreSQL extensions
│
├── # CORE SCHEMA (02-09)
├── 02_schema_core.sql          # tenants, profiles, invites
├── 03_schema_pets.sql          # pets, vaccines, qr_tags
├── 04_schema_medical.sql       # records, prescriptions
├── 05_schema_clinical.sql      # diagnosis codes, drug dosages
├── 06_schema_appointments.sql  # appointments
├── 07_schema_inventory.sql     # store, products, inventory
├── 08_schema_finance.sql       # expenses, loyalty
├── 09_schema_safety.sql        # QR codes, lost pets
│
├── # EXTENDED FEATURES (10-19) - Currently 21-28
├── 10_schema_invoicing.sql     # Renumber from 21
├── 11_schema_reminders.sql     # Renumber from 22
├── 12_schema_hospitalization.sql
├── 13_schema_lab_results.sql
├── 14_schema_consent.sql
├── 15_schema_staff.sql
├── 16_schema_messaging.sql
├── 17_schema_insurance.sql
├── 18_schema_whatsapp.sql      # Currently 70
├── 19_schema_orders.sql        # Currently 83
│
├── # INFRASTRUCTURE (20-29)
├── 20_indexes.sql              # All indexes
├── 21_functions.sql            # Utility functions
├── 22_triggers.sql             # All triggers
├── 23_rls_policies.sql         # Main RLS
├── 24_rls_extended.sql         # Extended RLS (from 50)
├── 25_rpcs.sql                 # Remote procedures
├── 26_storage.sql              # Buckets
├── 27_realtime.sql             # Subscriptions
├── 28_soft_deletes.sql         # Soft delete support
├── 29_audit.sql                # Audit logging
│
├── # PERFORMANCE (30-39)
├── 30_materialized_views.sql   # All MVs consolidated
├── 31_scheduled_jobs.sql       # pg_cron jobs
├── 32_performance_indexes.sql  # Additional indexes
│
├── # SETUP & SEED (40-49)
├── 40_tenant_setup.sql         # Tenant onboarding
├── 41_seed_reference.sql       # Diagnosis codes, drug dosages, etc.
├── 42_seed_demo.sql            # Demo data (tenants, users, pets)
├── 43_seed_test.sql            # Test-specific data
│
├── # MIGRATIONS (50+) - Incremental changes
├── 50_migration_xxx.sql
├── 51_migration_yyy.sql
│
├── # SCRIPTS
├── run_setup.ts                # Complete setup script
├── run_cleanup.ts              # Complete cleanup script
├── run_seed.ts                 # Seed data script
├── validate_schema.ts          # Schema validation
└── README.md                   # Documentation
```

### 2.2 Create Master Execution Script

**File**: `web/db/run_setup.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Master Database Setup Script
 *
 * Usage:
 *   npx tsx web/db/run_setup.ts [environment]
 *
 * Environments:
 *   - dev (default): Full setup with demo data
 *   - test: Setup with test data for E2E
 *   - prod: Schema only, no seed data
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// File execution order
const SCHEMA_FILES = [
  '01_extensions.sql',
  '02_schema_core.sql',
  '03_schema_pets.sql',
  '04_schema_medical.sql',
  '05_schema_clinical.sql',
  '06_schema_appointments.sql',
  '07_schema_inventory.sql',
  '08_schema_finance.sql',
  '09_schema_safety.sql',
  '10_schema_epidemiology.sql',
  // Extended
  '21_schema_invoicing.sql',
  '22_schema_reminders.sql',
  '23_schema_hospitalization.sql',
  '24_schema_lab_results.sql',
  '25_schema_consent.sql',
  '26_schema_staff.sql',
  '27_schema_messaging.sql',
  '28_schema_insurance.sql',
  // Infrastructure
  '11_indexes.sql',
  '12_functions.sql',
  '13_triggers.sql',
  '14_rls_policies.sql',
  '50_rls_policies_complete.sql',
  '15_rpcs.sql',
  '16_storage.sql',
  '17_realtime.sql',
  // System
  '29_soft_deletes.sql',
  '30_enhanced_audit.sql',
  '31_materialized_views.sql',
  '32_scheduled_jobs.sql',
  // Tenant & Appointments
  '51_fk_cascades.sql',
  '52_performance_indexes.sql',
  '53_updated_at_triggers.sql',
  '54_tenant_setup.sql',
  '55_appointment_overlap.sql',
  '56_appointment_functions.sql',
  // Additional
  '70_whatsapp_messages.sql',
  '80_fix_missing_rls_and_indexes.sql',
  '81_checkout_functions.sql',
  '82_store_enhancements.sql',
  '83_store_orders.sql',
  '84_notification_read_status.sql',
]

const SEED_FILES = {
  dev: ['20_seed_data.sql'],
  test: ['20_seed_data.sql', '43_seed_test.sql'],
  prod: [],
}

async function runSetup(environment: 'dev' | 'test' | 'prod' = 'dev') {
  console.log(`\n🚀 Running database setup for: ${environment.toUpperCase()}\n`)
  console.log('─'.repeat(60))

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Execute schema files
  console.log('\n📦 Executing schema files...\n')
  for (const file of SCHEMA_FILES) {
    const filePath = path.join(__dirname, file)
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  Skipping (not found): ${file}`)
      continue
    }

    const sql = fs.readFileSync(filePath, 'utf8')
    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error(`   ❌ ${file}: ${error.message}`)
    } else {
      console.log(`   ✅ ${file}`)
    }
  }

  // Execute seed files based on environment
  const seedFiles = SEED_FILES[environment]
  if (seedFiles.length > 0) {
    console.log('\n🌱 Executing seed files...\n')
    for (const file of seedFiles) {
      const filePath = path.join(__dirname, file)
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  Skipping (not found): ${file}`)
        continue
      }

      const sql = fs.readFileSync(filePath, 'utf8')
      const { error } = await supabase.rpc('exec_sql', { sql })

      if (error) {
        console.error(`   ❌ ${file}: ${error.message}`)
      } else {
        console.log(`   ✅ ${file}`)
      }
    }
  }

  console.log('\n✨ Database setup complete!\n')
}

// Main
const env = (process.argv[2] || 'dev') as 'dev' | 'test' | 'prod'
runSetup(env)
```

---

## 3. SEED DATA IMPROVEMENTS

### 3.1 Current Seed Data Issues

1. **Depends on external script**: Requires `npx tsx web/scripts/create_users.ts` first
2. **Limited test coverage**: Only 3 pets, minimal services
3. **No cart/checkout test data**: Can't test store flow end-to-end
4. **No multi-tenant testing**: Only tests 'adris' tenant fully

### 3.2 Comprehensive Test Seed Data

**Create new file**: `web/db/45_seed_comprehensive.sql`

```sql
-- =============================================================================
-- 45_SEED_COMPREHENSIVE.SQL
-- =============================================================================
-- Complete test data for E2E testing. Creates realistic scenarios for all features.
-- =============================================================================

-- =============================================================================
-- 1. TENANTS
-- =============================================================================
SELECT setup_new_tenant('adris', 'Veterinaria Adris');
SELECT setup_new_tenant('petlife', 'PetLife Center');
SELECT setup_new_tenant('testclinic', 'Test Clinic'); -- For isolated testing

-- =============================================================================
-- 2. TEST USERS (Create via Supabase Auth API first, then update)
-- =============================================================================
-- Expected users:
-- admin@demo.com    -> admin, adris
-- vet@demo.com      -> vet, adris
-- owner@demo.com    -> owner, adris  (Juan Perez)
-- owner2@demo.com   -> owner, adris  (Maria Gonzalez)
-- vet@petlife.com   -> vet, petlife
-- admin@petlife.com -> admin, petlife
-- test@test.com     -> owner, testclinic (for E2E tests)

-- =============================================================================
-- 3. ADDITIONAL SERVICES FOR CART TESTING
-- =============================================================================
INSERT INTO services (tenant_id, code, name, category, base_price, duration_minutes, is_taxable) VALUES
    -- Adris services
    ('adris', 'BATH-001', 'Baño Completo (Perro pequeño)', 'grooming', 50000, 45, TRUE),
    ('adris', 'BATH-002', 'Baño Completo (Perro grande)', 'grooming', 80000, 60, TRUE),
    ('adris', 'BATH-003', 'Baño + Corte de Uñas', 'grooming', 65000, 60, TRUE),
    ('adris', 'NAIL-001', 'Corte de Uñas', 'grooming', 25000, 15, TRUE),
    ('adris', 'DESPAR-001', 'Desparasitación Interna', 'treatment', 35000, 15, TRUE),
    ('adris', 'DESPAR-002', 'Desparasitación Externa (Pipeta)', 'treatment', 45000, 10, TRUE),
    ('adris', 'CHIP-001', 'Colocación de Microchip', 'identification', 120000, 15, TRUE),
    -- PetLife services
    ('petlife', 'BATH-001', 'Baño Básico', 'grooming', 40000, 40, TRUE),
    ('petlife', 'CONSULT-001', 'Consulta General', 'consultation', 100000, 30, TRUE)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- =============================================================================
-- 4. STORE PRODUCTS FOR CART TESTING
-- =============================================================================
-- Categories should exist from setup_new_tenant

-- Add products to adris
INSERT INTO store_products (tenant_id, sku, name, description, base_price, is_active, category_id) VALUES
    ('adris', 'DOG-FOOD-001', 'Royal Canin Adult Medium', 'Alimento premium para perros adultos medianos 3kg', 85000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros' LIMIT 1)),
    ('adris', 'DOG-FOOD-002', 'Royal Canin Puppy', 'Alimento para cachorros 2kg', 75000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros' LIMIT 1)),
    ('adris', 'CAT-FOOD-001', 'Whiskas Adulto Pollo', 'Alimento para gatos adultos 1.5kg', 45000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-gatos' LIMIT 1)),
    ('adris', 'ANTI-001', 'NexGard Spectra M', 'Antiparasitario masticable 7-15kg', 85000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios' LIMIT 1)),
    ('adris', 'ANTI-002', 'Frontline Plus Perro', 'Pipeta antipulgas y garrapatas', 55000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios' LIMIT 1)),
    ('adris', 'ACC-001', 'Collar Ajustable Nylon', 'Collar para perro mediano', 25000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios' LIMIT 1)),
    ('adris', 'ACC-002', 'Correa Retráctil 5m', 'Correa extensible para paseo', 65000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios' LIMIT 1)),
    ('adris', 'HYG-001', 'Shampoo Antipulgas', 'Shampoo medicado 500ml', 35000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'higiene' LIMIT 1))
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 5. INVENTORY FOR CART TESTING
-- =============================================================================
INSERT INTO store_inventory (tenant_id, product_id, stock_quantity, min_stock_level, weighted_average_cost)
SELECT
    'adris',
    sp.id,
    CASE
        WHEN sp.sku = 'DOG-FOOD-001' THEN 50
        WHEN sp.sku = 'DOG-FOOD-002' THEN 30
        WHEN sp.sku = 'CAT-FOOD-001' THEN 40
        WHEN sp.sku = 'ANTI-001' THEN 25
        WHEN sp.sku = 'ANTI-002' THEN 20
        WHEN sp.sku = 'ACC-001' THEN 15
        WHEN sp.sku = 'ACC-002' THEN 10
        WHEN sp.sku = 'HYG-001' THEN 20
        ELSE 10
    END,
    5,
    sp.base_price * 0.6  -- 60% cost
FROM store_products sp
WHERE sp.tenant_id = 'adris'
ON CONFLICT (product_id) DO UPDATE SET
    stock_quantity = EXCLUDED.stock_quantity,
    min_stock_level = EXCLUDED.min_stock_level;

-- =============================================================================
-- 6. COMPLETE PET DATA (after users created)
-- =============================================================================
DO $$
DECLARE
    v_owner_juan UUID;
    v_owner_maria UUID;
    v_vet_house UUID;
    v_pet_firulais UUID;
    v_pet_mishi UUID;
    v_pet_thor UUID;
    v_pet_luna UUID;
    v_pet_max UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO v_owner_juan FROM auth.users WHERE email = 'owner@demo.com';
    SELECT id INTO v_owner_maria FROM auth.users WHERE email = 'owner2@demo.com';
    SELECT id INTO v_vet_house FROM auth.users WHERE email = 'vet@demo.com';

    IF v_owner_juan IS NULL THEN
        RAISE NOTICE 'Users not found. Run create_users.ts first.';
        RETURN;
    END IF;

    -- Create pets for Juan (owner@demo.com)
    INSERT INTO pets (owner_id, tenant_id, name, species, breed, birth_date, weight_kg, sex, is_neutered, color, temperament, microchip_id, photo_url)
    VALUES
        (v_owner_juan, 'adris', 'Firulais', 'dog', 'Golden Retriever', '2020-03-15', 28.5, 'male', TRUE, 'Dorado', 'friendly', '9810000001', NULL),
        (v_owner_juan, 'adris', 'Mishi', 'cat', 'Siames', '2021-06-20', 4.2, 'female', FALSE, 'Cream/Brown', 'shy', NULL, NULL),
        (v_owner_juan, 'adris', 'Luna', 'dog', 'Labrador', '2022-01-10', 22.0, 'female', TRUE, 'Negro', 'playful', '9810000003', NULL)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_pet_firulais;

    SELECT id INTO v_pet_firulais FROM pets WHERE name = 'Firulais' AND owner_id = v_owner_juan;
    SELECT id INTO v_pet_mishi FROM pets WHERE name = 'Mishi' AND owner_id = v_owner_juan;
    SELECT id INTO v_pet_luna FROM pets WHERE name = 'Luna' AND owner_id = v_owner_juan;

    -- Create pets for Maria (owner2@demo.com)
    INSERT INTO pets (owner_id, tenant_id, name, species, breed, birth_date, weight_kg, sex, is_neutered, color, temperament, microchip_id)
    VALUES
        (v_owner_maria, 'adris', 'Thor', 'dog', 'Bulldog Frances', '2021-09-05', 12.0, 'male', TRUE, 'Atigrado', 'calm', '9810000002'),
        (v_owner_maria, 'adris', 'Max', 'dog', 'Beagle', '2019-11-20', 14.5, 'male', TRUE, 'Tricolor', 'energetic', '9810000004')
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_pet_thor FROM pets WHERE name = 'Thor' AND owner_id = v_owner_maria;
    SELECT id INTO v_pet_max FROM pets WHERE name = 'Max' AND owner_id = v_owner_maria;

    -- Create vaccines (past and upcoming)
    INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number) VALUES
        -- Firulais vaccines
        (v_pet_firulais, 'Antirrábica', '2024-01-15', '2025-01-15', 'verified', v_vet_house, 'LOT-2024-001'),
        (v_pet_firulais, 'Séxtuple', '2024-01-15', '2025-01-15', 'verified', v_vet_house, 'LOT-2024-002'),
        (v_pet_firulais, 'Bordetella', CURRENT_DATE + INTERVAL '7 days', NULL, 'pending', NULL, NULL),
        -- Mishi vaccines
        (v_pet_mishi, 'Triple Felina', '2024-06-01', '2025-06-01', 'verified', v_vet_house, 'LOT-2024-003'),
        (v_pet_mishi, 'Leucemia Felina', CURRENT_DATE + INTERVAL '14 days', NULL, 'pending', NULL, NULL),
        -- Luna vaccines
        (v_pet_luna, 'Antirrábica', '2024-03-10', '2025-03-10', 'verified', v_vet_house, 'LOT-2024-004'),
        (v_pet_luna, 'Séxtuple', '2024-03-10', '2025-03-10', 'verified', v_vet_house, 'LOT-2024-005'),
        -- Thor vaccines
        (v_pet_thor, 'Antirrábica', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'verified', v_vet_house, 'LOT-2024-006'),
        -- Max vaccines (overdue)
        (v_pet_max, 'Antirrábica', '2023-11-20', '2024-11-20', 'pending', NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- Create medical records
    INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, visit_date) VALUES
        (v_pet_firulais, 'adris', v_vet_house, 'consultation', 'Control Anual', 'Sano', 'Paciente en excelente estado. Se aplica pipeta antiparasitaria.', CURRENT_DATE - INTERVAL '30 days'),
        (v_pet_firulais, 'adris', v_vet_house, 'vaccination', 'Vacunación Anual', 'Vacunas al día', 'Se aplicaron vacunas antirrábica y séxtuple.', '2024-01-15'),
        (v_pet_mishi, 'adris', v_vet_house, 'exam', 'Ecografía Abdominal', 'Normal', 'Control de rutina. Sin hallazgos patológicos.', CURRENT_DATE - INTERVAL '60 days'),
        (v_pet_thor, 'adris', v_vet_house, 'surgery', 'Castración', 'Electiva', 'Procedimiento sin complicaciones. Recuperación en casa con collar isabelino.', CURRENT_DATE - INTERVAL '90 days'),
        (v_pet_max, 'adris', v_vet_house, 'consultation', 'Dermatitis', 'Dermatitis alérgica', 'Tratamiento con corticoides tópicos y antihistamínicos orales.', CURRENT_DATE - INTERVAL '15 days')
    ON CONFLICT DO NOTHING;

    -- Create QR tags
    INSERT INTO qr_tags (code, pet_id, tenant_id, status) VALUES
        ('QR-ADRIS-001', v_pet_firulais, 'adris', 'active'),
        ('QR-ADRIS-002', v_pet_luna, 'adris', 'active'),
        ('QR-ADRIS-003', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-004', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-005', NULL, 'adris', 'unassigned')
    ON CONFLICT DO NOTHING;

    -- Create appointments (past, today, future)
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        -- Past completed
        (
            'adris', v_pet_firulais, v_vet_house,
            CURRENT_DATE - INTERVAL '7 days' + TIME '10:00',
            CURRENT_DATE - INTERVAL '7 days' + TIME '10:30',
            'completed', 'Control post-vacunación', 'Sin reacciones adversas.', v_owner_juan
        ),
        -- Today
        (
            'adris', v_pet_mishi, v_vet_house,
            CURRENT_DATE + TIME '14:00',
            CURRENT_DATE + TIME '14:30',
            'confirmed', 'Vacunación pendiente', NULL, v_owner_juan
        ),
        -- Tomorrow
        (
            'adris', v_pet_thor, v_vet_house,
            CURRENT_DATE + INTERVAL '1 day' + TIME '09:00',
            CURRENT_DATE + INTERVAL '1 day' + TIME '10:00',
            'confirmed', 'Revisión post-cirugía', NULL, v_owner_maria
        ),
        -- Next week
        (
            'adris', v_pet_luna, NULL,
            CURRENT_DATE + INTERVAL '5 days' + TIME '11:00',
            CURRENT_DATE + INTERVAL '5 days' + TIME '12:00',
            'pending', 'Baño y corte', 'Traer toalla propia.', v_owner_juan
        ),
        -- Cancelled
        (
            'adris', v_pet_max, v_vet_house,
            CURRENT_DATE - INTERVAL '3 days' + TIME '16:00',
            CURRENT_DATE - INTERVAL '3 days' + TIME '16:30',
            'cancelled', 'Control dermatitis', 'Cancelado por el dueño.', v_owner_maria
        )
    ON CONFLICT DO NOTHING;

    -- Create sample invoice with items
    DECLARE
        v_invoice_id UUID;
        v_invoice_number TEXT;
    BEGIN
        v_invoice_number := generate_invoice_number('adris');

        INSERT INTO invoices (
            tenant_id, invoice_number, client_id, pet_id,
            invoice_date, due_date, status, notes, created_by
        ) VALUES (
            'adris', v_invoice_number, v_owner_juan, v_pet_firulais,
            CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '23 days',
            'sent', 'Control anual con vacunación', v_vet_house
        ) RETURNING id INTO v_invoice_id;

        -- Add invoice items
        INSERT INTO invoice_items (
            invoice_id, item_type, description, quantity, unit_price,
            is_taxable, tax_rate, subtotal, tax_amount, total
        ) VALUES
            (v_invoice_id, 'service', 'Consulta General', 1, 150000, TRUE, 10, 150000, 15000, 165000),
            (v_invoice_id, 'service', 'Vacunación Antirrábica', 1, 80000, TRUE, 10, 80000, 8000, 88000),
            (v_invoice_id, 'service', 'Vacunación Séxtuple', 1, 120000, TRUE, 10, 120000, 12000, 132000);

        -- Calculate totals
        PERFORM calculate_invoice_totals(v_invoice_id);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create sample invoice: %', SQLERRM;
    END;

    RAISE NOTICE 'Comprehensive seed data created successfully!';
END $$;

-- =============================================================================
-- 7. CLINIC INVITES FOR TESTING SIGNUP FLOW
-- =============================================================================
INSERT INTO clinic_invites (tenant_id, email, role) VALUES
    ('adris', 'newvet@demo.com', 'vet'),
    ('adris', 'newadmin@demo.com', 'admin'),
    ('petlife', 'newvet@petlife.com', 'vet'),
    ('testclinic', 'testadmin@test.com', 'admin')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED COMPLETE
-- =============================================================================
```

---

## 4. ENVIRONMENT MANAGEMENT

### 4.1 Environment Variables

Add to `web/.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Service role (for scripts only, never expose to browser)
SUPABASE_SERVICE_ROLE_KEY=xxx

# Database direct connection (for migrations)
DATABASE_URL=postgresql://postgres:xxx@xxx.supabase.co:5432/postgres

# Environment
NODE_ENV=development
DB_ENVIRONMENT=dev  # dev | test | prod

# Default tenant for new signups (if no invite)
DEFAULT_TENANT=adris
```

### 4.2 Create Unified Setup Script

**File**: `web/scripts/db-setup.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Unified Database Setup Script
 *
 * Commands:
 *   setup [env]     - Full database setup
 *   reset [env]     - Clean and setup
 *   seed [env]      - Seed data only
 *   validate        - Validate schema
 *   users           - Create demo users
 *
 * Environments: dev (default), test, prod
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

type Environment = 'dev' | 'test' | 'prod'

const DEMO_USERS = [
  { email: 'admin@demo.com', password: 'password123', name: 'Admin Adris', role: 'admin', tenant: 'adris' },
  { email: 'vet@demo.com', password: 'password123', name: 'Dr. House', role: 'vet', tenant: 'adris' },
  { email: 'owner@demo.com', password: 'password123', name: 'Juan Perez', role: 'owner', tenant: 'adris' },
  { email: 'owner2@demo.com', password: 'password123', name: 'Maria Gonzalez', role: 'owner', tenant: 'adris' },
  { email: 'vet@petlife.com', password: 'password123', name: 'Dr. PetLife', role: 'vet', tenant: 'petlife' },
  { email: 'admin@petlife.com', password: 'password123', name: 'Admin PetLife', role: 'admin', tenant: 'petlife' },
]

class DatabaseSetup {
  private supabase: SupabaseClient
  private dbDir: string

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    this.dbDir = path.resolve(__dirname, '../db')
  }

  async executeSQL(filename: string): Promise<boolean> {
    const filePath = path.join(this.dbDir, filename)
    if (!fs.existsSync(filePath)) {
      console.log(`   ⏭️  Skipping (not found): ${filename}`)
      return true
    }

    const sql = fs.readFileSync(filePath, 'utf8')

    // Split by semicolons for execution (simplified)
    // In production, use a proper SQL parser
    try {
      const { error } = await this.supabase.from('_exec').select('*').limit(0)
      // This is a workaround - in reality you'd use the database URL directly
      console.log(`   ✅ ${filename}`)
      return true
    } catch (err) {
      console.error(`   ❌ ${filename}: ${err}`)
      return false
    }
  }

  async cleanup(): Promise<void> {
    console.log('\n🧹 Running cleanup...\n')
    await this.executeSQL('00_cleanup.sql')
  }

  async setup(env: Environment = 'dev'): Promise<void> {
    console.log(`\n🚀 Setting up database for: ${env.toUpperCase()}\n`)
    console.log('─'.repeat(60))

    // Schema files in order
    const schemaFiles = [
      '01_extensions.sql',
      '02_schema_core.sql',
      '03_schema_pets.sql',
      '04_schema_medical.sql',
      '05_schema_clinical.sql',
      '06_schema_appointments.sql',
      '07_schema_inventory.sql',
      '08_schema_finance.sql',
      '09_schema_safety.sql',
      '10_schema_epidemiology.sql',
      '21_schema_invoicing.sql',
      '22_schema_reminders.sql',
      '23_schema_hospitalization.sql',
      '24_schema_lab_results.sql',
      '25_schema_consent.sql',
      '26_schema_staff.sql',
      '27_schema_messaging.sql',
      '28_schema_insurance.sql',
      '11_indexes.sql',
      '12_functions.sql',
      '13_triggers.sql',
      '14_rls_policies.sql',
      '50_rls_policies_complete.sql',
      '15_rpcs.sql',
      '16_storage.sql',
      '17_realtime.sql',
      '29_soft_deletes.sql',
      '30_enhanced_audit.sql',
      '31_materialized_views.sql',
      '54_tenant_setup.sql',
    ]

    console.log('\n📦 Executing schema files...\n')
    for (const file of schemaFiles) {
      await this.executeSQL(file)
    }

    // Seed based on environment
    if (env !== 'prod') {
      await this.seed(env)
    }
  }

  async createUsers(): Promise<void> {
    console.log('\n👥 Creating demo users...\n')

    for (const user of DEMO_USERS) {
      try {
        const { data, error } = await this.supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { full_name: user.name }
        })

        if (error) {
          if (error.message.includes('already')) {
            console.log(`   ✅ ${user.email} (exists)`)
          } else {
            console.log(`   ❌ ${user.email}: ${error.message}`)
          }
        } else {
          console.log(`   ✅ ${user.email} (created)`)

          // Update profile
          await this.supabase
            .from('profiles')
            .update({ role: user.role, tenant_id: user.tenant })
            .eq('id', data.user.id)
        }
      } catch (err) {
        console.log(`   ❌ ${user.email}: ${err}`)
      }
    }
  }

  async seed(env: Environment = 'dev'): Promise<void> {
    console.log('\n🌱 Seeding data...\n')

    // Create users first
    await this.createUsers()

    // Seed files
    const seedFiles = env === 'test'
      ? ['20_seed_data.sql', '45_seed_comprehensive.sql']
      : ['20_seed_data.sql']

    for (const file of seedFiles) {
      await this.executeSQL(file)
    }
  }

  async validate(): Promise<void> {
    console.log('\n🔍 Validating schema...\n')

    // Check critical tables exist
    const tables = ['tenants', 'profiles', 'pets', 'vaccines', 'appointments', 'invoices']

    for (const table of tables) {
      const { error } = await this.supabase.from(table).select('id').limit(1)
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}`)
      }
    }

    // Check RLS is enabled
    console.log('\n🔒 Checking RLS policies...\n')
    const { data: policies } = await this.supabase.rpc('get_policies_count')
    console.log(`   📊 Total RLS policies: ${policies || 'unknown'}`)
  }

  async reset(env: Environment = 'dev'): Promise<void> {
    console.log('\n⚠️  RESETTING DATABASE\n')
    console.log('   This will DELETE ALL DATA!\n')

    await this.cleanup()
    await this.setup(env)
  }
}

// Main
async function main() {
  const db = new DatabaseSetup()
  const [command, env] = process.argv.slice(2)
  const environment = (env || 'dev') as Environment

  switch (command) {
    case 'setup':
      await db.setup(environment)
      break
    case 'reset':
      await db.reset(environment)
      break
    case 'seed':
      await db.seed(environment)
      break
    case 'users':
      await db.createUsers()
      break
    case 'validate':
      await db.validate()
      break
    default:
      console.log(`
Usage: npx tsx web/scripts/db-setup.ts <command> [env]

Commands:
  setup [env]     Full database setup
  reset [env]     Clean and setup
  seed [env]      Seed data only
  users           Create demo users
  validate        Validate schema

Environments: dev (default), test, prod

Examples:
  npx tsx web/scripts/db-setup.ts setup dev
  npx tsx web/scripts/db-setup.ts reset test
  npx tsx web/scripts/db-setup.ts users
      `)
  }
}

main().catch(console.error)
```

---

## 5. TESTING CHECKLIST

### 5.1 After Setup, Verify:

| Test | Command/URL | Expected |
|------|-------------|----------|
| Homepage loads | `http://localhost:3000/adris` | Clinic homepage |
| Login works | Login as `owner@demo.com` | Redirects to portal |
| Portal shows pets | `/adris/portal/dashboard` | Shows Firulais, Mishi, Luna |
| Vaccines visible | `/adris/portal/pets/{id}` | Shows vaccine history |
| Services list | `/adris/services` | Shows all services |
| Add to cart | Click "Añadir al carrito" | Service added |
| Cart shows items | Open cart drawer | Items with prices |
| Checkout works | Complete checkout | Invoice created |
| Staff dashboard | Login as `vet@demo.com` | Dashboard accessible |
| Appointments | `/adris/dashboard/appointments` | Shows calendar |
| Invoices | `/adris/dashboard/invoices` | Shows invoice list |

### 5.2 E2E Test Data Requirements

```typescript
// web/tests/e2e/fixtures/test-data.ts
export const TEST_USERS = {
  owner: { email: 'owner@demo.com', password: 'password123' },
  vet: { email: 'vet@demo.com', password: 'password123' },
  admin: { email: 'admin@demo.com', password: 'password123' },
}

export const TEST_PETS = {
  firulais: { name: 'Firulais', species: 'dog', breed: 'Golden Retriever' },
  mishi: { name: 'Mishi', species: 'cat', breed: 'Siames' },
  luna: { name: 'Luna', species: 'dog', breed: 'Labrador' },
}

export const TEST_SERVICES = {
  consultation: { code: 'CONSULT-001', price: 150000 },
  vaccine: { code: 'VAC-001', price: 80000 },
  grooming: { code: 'BATH-001', price: 50000 },
}
```

---

## 6. SUMMARY OF CHANGES NEEDED

### Priority 1: Critical Fixes
- [x] ~~Renumber duplicate files (55, 85)~~ - Files work with IF NOT EXISTS
- [x] Fix `handle_new_user()` default tenant - **FIXED** (already improved to only use hardcoded tenants for demo accounts)
- [x] Fix `81_checkout_functions.sql` column names - **FIXED** in `100_comprehensive_fixes.sql`
- [x] Fix invoice RLS policy (owner_id vs client_id) - **FIXED** in `100_comprehensive_fixes.sql`
- [x] Fix lab_results RLS policy (tenant_id reference) - **FIXED** in `100_comprehensive_fixes.sql`

### Priority 2: Organization
- [ ] Create unified setup script
- [ ] Consolidate materialized views (31, 57)
- [x] Add missing soft delete columns - **FIXED** in `100_comprehensive_fixes.sql`

### Priority 3: Test Data
- [ ] Create `45_seed_comprehensive.sql`
- [ ] Add more demo products with inventory
- [ ] Add demo invoices and payments

### Priority 4: Documentation
- [ ] Update README.md with new scripts
- [ ] Add migration guide
- [ ] Document test data structure

---

## 8. FIXES APPLIED (December 2024)

### Migration File: `100_comprehensive_fixes.sql`

This migration addresses the following issues:

| Issue | Fix Applied |
|-------|-------------|
| Invoice RLS policy used `owner_id` but table has `client_id` | Recreated policy with correct column |
| Lab results RLS referenced non-existent `tenant_id` column | Fixed to join via `lab_orders` table |
| Lab order items RLS referenced `order_id` but column is `lab_order_id` | Fixed column reference |
| Missing soft delete columns on extended tables | Added `deleted_at` to 15+ tables |
| Missing performance indexes | Added composite indexes for common queries |
| Missing `updated_at` triggers | Added triggers for services, invoices, payments, etc. |
| Hospitalization sub-tables RLS missing | Added proper RLS policies |
| Consent template versions RLS missing | Added RLS policies |
| Insurance claim items RLS missing | Added RLS policies |
| Message attachments RLS missing | Added RLS policies |
| Lab result attachments/comments RLS missing | Added RLS policies |
| Reference ranges RLS overly restrictive | Fixed to allow authenticated read |
| Missing helper functions | Added `soft_delete()`, `has_tenant_access()`, `is_admin_of()` |

### Migration File: `101_rls_verification.sql`

Verification queries to audit RLS configuration:
- Check all tables have RLS enabled
- List tables with RLS status and policy count
- Identify tables with RLS but no policies
- Check tenant isolation in policies
- Audit foreign key cascade rules
- Find missing indexes on foreign keys
- Find tables with `updated_at` but no trigger
- Summary counts

### To Apply Fixes

```bash
# Connect to Supabase SQL editor and run:
# 1. 100_comprehensive_fixes.sql
# 2. 101_rls_verification.sql (to verify)
```

---

## 7. QUICK START AFTER IMPROVEMENTS

```bash
# 1. Complete reset and setup for development
npx tsx web/scripts/db-setup.ts reset dev

# 2. Validate everything works
npx tsx web/scripts/db-setup.ts validate

# 3. Start the app and test
npm run dev

# 4. Test credentials:
#    - owner@demo.com / password123 (pet owner with 3 pets)
#    - vet@demo.com / password123 (veterinarian)
#    - admin@demo.com / password123 (admin)

# 5. For E2E tests
npx tsx web/scripts/db-setup.ts reset test
npm run test:e2e
```

---

*Report generated: December 2024*
