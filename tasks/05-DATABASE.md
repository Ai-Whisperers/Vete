# Database & Migration Tasks

> **Priority:** MEDIUM
> **Total Tasks:** 16
> **Estimated Effort:** 8-12 hours

---

## CRITICAL: File Organization Issues

### DB-001: Rename Duplicate Migration Numbers
**Files:**
- `web/db/55_appointment_overlap.sql`
- `web/db/55_appointment_workflow.sql` (duplicate)
- `web/db/85_fix_checkout_inventory_table.sql`
- `web/db/85_owner_clinic_connections.sql` (duplicate)

**Action:**
```bash
# Rename to resolve conflicts
mv web/db/55_appointment_workflow.sql web/db/56_appointment_workflow.sql
mv web/db/85_owner_clinic_connections.sql web/db/86_owner_clinic_connections.sql
```

**Update any references in:**
- `web/db/v2/run-migrations.sql` (if exists)
- Documentation files

**Effort:** 15 minutes

---

### DB-002: Fix Overly Permissive RLS Policies
**File:** `web/db/50_rls_policies_complete.sql`
**Lines:** 15-17, 54-55

**Current (Security Risk):**
```sql
CREATE POLICY "Public can read lab test catalog" ON lab_test_catalog
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can read reference ranges" ON lab_reference_ranges
    FOR SELECT USING (TRUE);
```

**Create migration to fix:**
```sql
-- web/db/103_fix_public_rls_policies.sql

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Public can read lab test catalog" ON lab_test_catalog;
DROP POLICY IF EXISTS "Public can read reference ranges" ON lab_reference_ranges;

-- Create authenticated-only policies
CREATE POLICY "Authenticated can read lab test catalog" ON lab_test_catalog
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated can read reference ranges" ON lab_reference_ranges
    FOR SELECT TO authenticated
    USING (TRUE);

-- Add comment explaining the change
COMMENT ON POLICY "Authenticated can read lab test catalog" ON lab_test_catalog IS
    'Reference data accessible to all authenticated users regardless of tenant';
```

**Effort:** 30 minutes

---

## HIGH: Schema Consolidation

### DB-003: Document Migration Execution Order
**Problem:** No clear documentation of which v1 files are active

**Create:** `web/db/MIGRATION_ORDER.md`
```markdown
# Migration Execution Order

## Active Migrations (v1)

Execute in this order for fresh database setup:

1. `01_extensions.sql` - Enable required extensions
2. `02_schema_core.sql` - Core tables (tenants, profiles, pets)
3. `03_schema_medical.sql` - Medical records, vaccines
4. ...
10. `12_functions.sql` - Database functions
11. `14_rls_policies.sql` - Base RLS policies
12. `15_rpcs.sql` - RPC functions
...

## Fix Migrations (Apply after base schema)

These fix issues discovered post-deployment:
- `80_fix_missing_rls_and_indexes.sql`
- `85_fix_checkout_inventory_table.sql`
- `88_fix_checkout_schema_mismatch.sql`
- `100_comprehensive_fixes.sql`
- `101_rls_verification.sql`
- `102_comprehensive_db_fixes.sql`

## Unused/Historical Files

These are superseded or unused:
- (List any deprecated files)

## v2 Migration System

The `web/db/v2/` directory contains a reorganized modular system.
See `web/db/v2/README.md` for details.
```

**Effort:** 1 hour

---

### DB-004: Consolidate RLS Policy Files
**Problem:** Policies scattered across multiple files

**Files:**
- `14_rls_policies.sql` - Base policies
- `50_rls_policies_complete.sql` - Extended policies
- `80_fix_missing_rls_and_indexes.sql` - Additional fixes

**Create consolidated view for v2:**
```
web/db/v2/
  30_rls/
    00_functions.sql      -- is_staff_of, is_owner_of
    10_core.sql           -- profiles, tenants, pets
    20_medical.sql        -- vaccines, records, prescriptions
    30_appointments.sql   -- appointments, services
    40_invoicing.sql      -- invoices, payments
    50_store.sql          -- products, orders
    60_hospital.sql       -- kennels, hospitalizations
    70_lab.sql            -- lab orders, results
    80_consents.sql       -- consent templates, documents
    90_messaging.sql      -- conversations, messages
```

**Effort:** 3 hours

---

### DB-005: Add Missing Soft Delete Columns
**Tables missing `deleted_at`:**
- `services`
- `invoices`
- `payments`
- `lab_test_catalog`
- `kennels`
- `consent_templates`
- `conversations`
- Plus 8+ more tables

**Create migration:**
```sql
-- web/db/104_add_soft_delete_columns.sql

-- Add deleted_at to tables missing it
ALTER TABLE services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE lab_test_catalog ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE kennels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE consent_templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON services(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices(deleted_at) WHERE deleted_at IS NULL;
-- ... etc
```

**Effort:** 1 hour

---

### DB-006: Add Missing updated_at Triggers
**File:** `web/db/102_comprehensive_db_fixes.sql` (partially addresses)

**Tables needing triggers:**
- `services`
- `invoices`
- `lab_test_catalog`
- `lab_orders`
- `kennels`
- `hospitalizations`
- `consent_templates`
- `conversations`

**Verify/create migration:**
```sql
-- Ensure trigger function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers where missing
DO $$
DECLARE
    tables TEXT[] := ARRAY['services', 'invoices', 'lab_test_catalog', 'lab_orders',
                           'kennels', 'hospitalizations', 'consent_templates', 'conversations'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at_%I ON %I;
            CREATE TRIGGER set_updated_at_%I
                BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
        ', t, t, t, t);
    END LOOP;
END;
$$;
```

**Effort:** 45 minutes

---

## HIGH: Performance Issues

### DB-007: Add Missing Performance Indexes
**File:** `web/db/52_performance_indexes.sql` (existing, may need updates)

**Missing indexes identified:**
```sql
-- Appointments by date (used in slot queries)
CREATE INDEX IF NOT EXISTS idx_appointments_date
    ON appointments(appointment_date);

-- Invoices by client and status (payment processing)
CREATE INDEX IF NOT EXISTS idx_invoices_client_status
    ON invoices(client_id, status);

-- Lab orders by pet (frequent lookup)
CREATE INDEX IF NOT EXISTS idx_lab_orders_pet
    ON lab_orders(pet_id);

-- Hospitalizations by status (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status
    ON hospitalizations(status) WHERE status = 'active';
```

**Effort:** 30 minutes

---

### DB-008: Schedule Materialized View Refreshes
**File:** `web/db/32_scheduled_jobs.sql` (create or update)

**Problem:** Materialized views may become stale

**Solution using pg_cron:**
```sql
-- Ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Refresh dashboard stats every 15 minutes
SELECT cron.schedule('refresh_dashboard_stats', '*/15 * * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats');

-- Refresh client summary every hour
SELECT cron.schedule('refresh_client_summary', '0 * * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_summary');

-- Refresh analytics daily at 3 AM
SELECT cron.schedule('refresh_analytics', '0 3 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_appointment_analytics');

SELECT cron.schedule('refresh_revenue', '0 3 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_analytics');
```

**Note:** Requires pg_cron extension. Alternative: Use external scheduler (cron job, Supabase scheduled functions).

**Effort:** 1 hour

---

## MEDIUM: Code Quality

### DB-009: Remove Hardcoded Demo Tenant
**File:** `web/db/12_functions.sql`
**Lines:** 74-86

**Current:**
```sql
ELSIF NEW.email IN ('admin@demo.com', 'vet@demo.com', 'owner@demo.com', 'owner2@demo.com') THEN
    v_tenant_id := 'adris';  -- Hardcoded!
```

**Options:**
1. Remove demo handling entirely (production)
2. Use environment variable or database setting
3. Keep but document clearly

**Recommended (Option 3):**
```sql
-- For demo purposes only - remove in production or use:
-- SELECT current_setting('app.demo_tenant', true) as demo_tenant
ELSIF NEW.email IN ('admin@demo.com', 'vet@demo.com', 'owner@demo.com', 'owner2@demo.com') THEN
    -- Demo accounts default to 'adris' tenant
    -- This should be removed or configured via environment in production
    v_tenant_id := COALESCE(current_setting('app.demo_tenant', true), 'adris');
```

**Effort:** 30 minutes

---

### DB-010: Document RLS Policies
**Problem:** Policies lack comments explaining purpose

**Add comments to key policies:**
```sql
COMMENT ON POLICY "Staff manage pets" ON pets IS
    'Staff members (vet, admin) can perform all operations on pets within their tenant';

COMMENT ON POLICY "Owners view own pets" ON pets IS
    'Pet owners can view pets where they are the registered owner';

COMMENT ON POLICY "Public can read services" ON services IS
    'Service catalog is publicly readable for booking UI - no auth required';
```

**Effort:** 1 hour

---

### DB-011: Create RLS Verification Script
**Purpose:** Regular verification of RLS coverage

**Create:** `web/db/scripts/verify-rls.sql`
```sql
-- List tables without RLS enabled
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT tablename FROM pg_policies
    WHERE schemaname = 'public'
)
ORDER BY tablename;

-- List tables with RLS enabled but no policies
SELECT relname as table_name
FROM pg_class
WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND relkind = 'r'
AND relrowsecurity = true
AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = relname
);

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;
```

**Effort:** 30 minutes

---

## MEDIUM: Data Integrity

### DB-012: Verify Foreign Key Cascades
**Review all FKs for appropriate cascade rules:**

```sql
-- List all foreign keys and their actions
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

**Expected cascade rules:**
- `pets.owner_id` → `profiles.id`: CASCADE (delete pets when owner deleted)
- `vaccines.pet_id` → `pets.id`: CASCADE
- `appointments.pet_id` → `pets.id`: SET NULL or CASCADE
- `invoices.client_id` → `profiles.id`: RESTRICT (can't delete with open invoices)

**Effort:** 1 hour

---

### DB-013: Add Check Constraints
**Tables missing validation constraints:**

```sql
-- Add phone validation
ALTER TABLE profiles ADD CONSTRAINT profiles_phone_length
    CHECK (phone IS NULL OR length(phone) >= 6);

-- Add email validation (already exists, verify)
ALTER TABLE profiles ADD CONSTRAINT profiles_email_format
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add price validation
ALTER TABLE services ADD CONSTRAINT services_price_positive
    CHECK (base_price >= 0);

ALTER TABLE store_products ADD CONSTRAINT products_price_positive
    CHECK (base_price >= 0);

-- Add quantity validation
ALTER TABLE store_inventory ADD CONSTRAINT inventory_quantity_nonnegative
    CHECK (stock_quantity >= 0);
```

**Effort:** 45 minutes

---

## LOW: Documentation & Cleanup

### DB-014: Create Schema Diagram
**Generate ERD for documentation:**

**Option A:** Use Supabase Dashboard schema viewer
**Option B:** Generate with pgAdmin
**Option C:** Use dbdiagram.io with exported DDL

**Output:** `documentation/database/schema-diagram.png`

**Effort:** 1 hour

---

### DB-015: Clean Up Unused Migrations
**Review and mark/remove:**

Check if these are still needed:
- `90_seed_demo_data.sql` - Demo data seeding
- `91_seed_growth_standards.sql` - Growth chart data
- `92_seed_diagnosis_codes.sql` - Diagnosis codes

**Document or remove if superseded.**

**Effort:** 30 minutes

---

### DB-016: Create v2 Migration Guide
**File:** `web/db/v2/MIGRATION_GUIDE.md`

**Contents:**
1. Why v2 exists
2. Differences from v1
3. How to run v2 migrations
4. How to contribute new migrations
5. Testing migrations locally

**Effort:** 1 hour

---

## Checklist

```
CRITICAL:
[ ] DB-001: Rename duplicate migration numbers
[ ] DB-002: Fix overly permissive RLS policies

HIGH:
[ ] DB-003: Document migration execution order
[ ] DB-004: Consolidate RLS policy files
[ ] DB-005: Add missing soft delete columns
[ ] DB-006: Add missing updated_at triggers
[ ] DB-007: Add missing performance indexes
[ ] DB-008: Schedule MV refreshes

MEDIUM:
[ ] DB-009: Remove hardcoded demo tenant
[ ] DB-010: Document RLS policies
[ ] DB-011: Create RLS verification script
[ ] DB-012: Verify FK cascades
[ ] DB-013: Add check constraints

LOW:
[ ] DB-014: Create schema diagram
[ ] DB-015: Clean up unused migrations
[ ] DB-016: Create v2 migration guide
```
