# Database Refactoring Plan

## ✅ STATUS: COMPLETE

The refactoring has been completed. All new modular files are in `db/v2/`.

### Files Created:
- `v2/00_cleanup.sql` - Complete database reset script
- `v2/01_extensions.sql` - PostgreSQL extensions
- `v2/02_functions/02_core_functions.sql` - Core utility functions
- `v2/10_core/10_tenants.sql` - Tenant table with RLS
- `v2/10_core/11_profiles.sql` - User profiles with RLS
- `v2/10_core/12_invites.sql` - Clinic invitations with RLS
- `v2/20_pets/20_pets.sql` - Pet profiles with RLS
- `v2/20_pets/21_vaccines.sql` - Vaccination system with RLS
- `v2/30_clinical/30_reference_data.sql` - Diagnosis, drugs, growth standards
- `v2/30_clinical/31_lab.sql` - Laboratory module with RLS
- `v2/30_clinical/32_hospitalization.sql` - Hospitalization module with RLS
- `v2/30_clinical/33_medical_records.sql` - Medical records, prescriptions, consent
- `v2/40_scheduling/40_services.sql` - Service catalog with RLS
- `v2/40_scheduling/41_appointments.sql` - Appointments with overlap detection
- `v2/50_finance/50_invoicing.sql` - Invoices, payments, refunds with RLS
- `v2/50_finance/51_expenses.sql` - Expenses, loyalty points with RLS
- `v2/60_store/60_inventory.sql` - Store/inventory with RLS
- `v2/70_communications/70_messaging.sql` - Messaging, reminders with RLS
- `v2/80_insurance/80_insurance.sql` - Insurance module with RLS
- `v2/85_system/85_staff.sql` - Staff management with RLS
- `v2/85_system/86_audit.sql` - Audit logs, QR tags, notifications
- `v2/run-migrations.sql` - psql runner script
- `v2/setup-db.mjs` - Node.js runner script
- `v2/README.md` - Complete documentation

### To Use:
```bash
cd web/db/v2
node setup-db.mjs          # Run all migrations
node setup-db.mjs --reset  # Reset and run (DELETES DATA!)
```

---

## Current Problems (v1)

### 1. **"Fix" Files Scattered Throughout (Anti-pattern)**
- `80_fix_missing_rls_and_indexes.sql` - Adds RLS that should have been in original files
- `85_fix_checkout_inventory_table.sql` - Patches schema mistakes
- `88_fix_checkout_schema_mismatch.sql` - More patches
- `100_comprehensive_fixes.sql` - Fixes wrong column references in policies
- `101_rls_verification.sql` - Verification that shouldn't be needed

### 2. **Separation of Concerns Broken**
- Tables defined in one file (02-10, 21-28)
- RLS policies in separate files (14, 50, 80, 100)
- Indexes in separate files (11, 52)
- Triggers in separate files (13, 53)
- This makes maintenance difficult and causes bugs

### 3. **Duplicate Files**
- `31_materialized_views.sql` and `57_materialized_views.sql` - same purpose
- Multiple RLS files with overlapping policies

### 4. **Inconsistent Numbering**
- Gaps: 18-20, 33-49, 59-69, 71-79, 87
- Numbers don't reflect actual dependencies

### 5. **Missing Soft Deletes**
- Added via `100_comprehensive_fixes.sql` instead of in original tables

---

## New Architecture

### Design Principles

1. **Self-Contained Modules**: Each domain module contains:
   - Table definitions with all columns (including soft delete)
   - CHECK constraints inline
   - RLS enabled and policies defined immediately
   - Indexes defined immediately
   - Triggers defined immediately
   - Related functions

2. **No Fix Files**: Everything correct from the start

3. **Clear Dependencies**: Numbers reflect actual execution order

4. **Single Source of Truth**: One file per concept

---

## New Directory Structure

```
db/
├── 00_cleanup.sql                    # Complete reset (auto-generated from modules)
├── 01_extensions.sql                 # PostgreSQL extensions
│
├── 02_functions/
│   └── 02_core_functions.sql         # handle_updated_at, is_staff_of, protect_columns
│
├── 10_core/
│   ├── 10_tenants.sql                # tenants + RLS
│   ├── 11_profiles.sql               # profiles + trigger + RLS
│   └── 12_invites.sql                # clinic_invites + RLS
│
├── 20_pets/
│   ├── 20_pets.sql                   # pets + soft_delete + RLS + indexes
│   ├── 21_vaccines.sql               # vaccines, templates, reactions + RLS
│   ├── 22_qr_tags.sql                # qr_tags, lost_pets + RLS
│   └── 23_medical_records.sql        # medical_records, prescriptions + RLS
│
├── 30_clinical/
│   ├── 30_reference_data.sql         # diagnosis_codes, drug_dosages, growth_standards
│   ├── 31_lab.sql                    # lab catalog, orders, items, results + RLS
│   ├── 32_hospitalization.sql        # kennels, hospitalizations, vitals + RLS
│   └── 33_consent.sql                # consent templates, documents + RLS
│
├── 40_scheduling/
│   ├── 40_services.sql               # services + RLS
│   ├── 41_appointments.sql           # appointments + overlap detection + RLS
│   └── 42_staff.sql                  # staff_profiles, schedules, time_off + RLS
│
├── 50_finance/
│   ├── 50_payment_methods.sql        # payment_methods + RLS
│   ├── 51_invoicing.sql              # invoices, items, payments, refunds + RLS
│   ├── 52_expenses.sql               # expenses + RLS
│   └── 53_loyalty.sql                # loyalty_points, transactions + RLS
│
├── 60_store/
│   ├── 60_catalog.sql                # categories, products, brands + RLS
│   ├── 61_inventory.sql              # inventory, transactions + RLS
│   └── 62_campaigns.sql              # campaigns, items + RLS
│
├── 70_communications/
│   ├── 70_messaging.sql              # conversations, messages, templates + RLS
│   ├── 71_reminders.sql              # notification system + RLS
│   └── 72_whatsapp.sql               # whatsapp messages + RLS
│
├── 80_insurance/
│   └── 80_insurance.sql              # providers, policies, claims + RLS
│
├── 85_system/
│   ├── 85_audit.sql                  # audit_logs, security_events, epidemiology
│   ├── 86_soft_delete_archive.sql    # archived tables, restore functions
│   ├── 87_materialized_views.sql     # ALL materialized views consolidated
│   └── 88_scheduled_jobs.sql         # pg_cron jobs
│
├── 90_infrastructure/
│   ├── 90_storage.sql                # Storage buckets and policies
│   ├── 91_realtime.sql               # Realtime publication
│   └── 92_tenant_setup.sql           # setup_new_tenant() function
│
├── 95_seeds/
│   ├── 95_seed_tenants.sql           # Tenant records
│   ├── 96_seed_users.sql             # Demo users
│   ├── 97_seed_reference_data.sql    # Services, diagnosis codes, templates
│   ├── 98_seed_demo_data.sql         # Pets, appointments, inventory
│   └── 99_finalize.sql               # Refresh views, validate
│
├── setup-db.mjs                      # Updated runner with directory support
├── generate-cleanup.mjs              # Generates 00_cleanup.sql from modules
└── README.md                         # Updated documentation
```

---

## Module Template

Each module file follows this structure:

```sql
-- =============================================================================
-- [NUMBER]_[NAME].SQL
-- =============================================================================
-- Description: What this module contains
-- Dependencies: List of required modules
-- =============================================================================

-- =============================================================================
-- A. TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Domain columns
    name TEXT NOT NULL,
    ...

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT table_name_check CHECK (...)
);

-- =============================================================================
-- B. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff full access" ON table_name
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Owners view own" ON table_name
    FOR SELECT TO authenticated
    USING (owner_id = auth.uid() AND deleted_at IS NULL);

-- =============================================================================
-- C. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_table_tenant ON table_name(tenant_id);
CREATE INDEX IF NOT EXISTS idx_table_deleted ON table_name(deleted_at)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- D. TRIGGERS
-- =============================================================================

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON table_name
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- E. FUNCTIONS (module-specific)
-- =============================================================================

CREATE OR REPLACE FUNCTION some_function()
...
```

---

## Migration Strategy

### Phase 1: Create New Structure (Non-destructive)
1. Create new directory structure
2. Write refactored module files
3. Test on fresh database

### Phase 2: Validate
1. Compare table structures
2. Compare RLS policies
3. Run integration tests

### Phase 3: Deploy
1. Backup existing database
2. Run cleanup
3. Run new setup
4. Seed data

---

## Files to Delete After Refactoring

These files will be consolidated into the new modules:
- All `*_fix_*.sql` files (80, 85, 88, 100, 101)
- Duplicate files (31 vs 57 materialized views)
- Separate index files (11, 52)
- Separate trigger files (13, 53)
- Separate RLS files (14, 50)

---

## Benefits

1. **Maintainability**: Each module is self-contained
2. **No Regressions**: RLS/indexes/triggers defined with tables
3. **Clear Dependencies**: Numbering reflects reality
4. **Easier Onboarding**: Developers understand structure quickly
5. **Safer Changes**: Can't forget RLS when modifying tables
6. **Single Source of Truth**: No hunting through multiple files
