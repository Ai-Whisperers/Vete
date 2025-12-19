-- =============================================================================
-- 99_RLS_FIXES.SQL
-- =============================================================================
-- Critical database fixes for missing RLS policies, foreign key cascades, and indexes.
-- Addresses DB-001, DB-002, and DB-003 from database audit.
-- =============================================================================

-- =============================================================================
-- DB-001: MISSING RLS POLICIES
-- =============================================================================
-- Add RLS policies for tables that are missing them

-- -----------------------------------------------------------------------------
-- 1. LAB ORDERS & LAB ORDER ITEMS
-- -----------------------------------------------------------------------------
-- RLS is already ENABLED in 24_schema_lab_results.sql (lines 567-572)
-- Policies are already defined (lines 610-636)
-- No action needed

-- -----------------------------------------------------------------------------
-- 2. LAB PANEL TESTS & LAB TEST CATALOG
-- -----------------------------------------------------------------------------
-- RLS is already ENABLED in 24_schema_lab_results.sql (lines 563-566)
-- Policies are already defined (lines 574-608)
-- No action needed

-- -----------------------------------------------------------------------------
-- 3. HOSPITALIZATIONS & KENNELS
-- -----------------------------------------------------------------------------
-- RLS is already ENABLED in 23_schema_hospitalization.sql (lines 532-539)
-- Policies are already defined (lines 541-692)
-- No action needed

-- -----------------------------------------------------------------------------
-- 4. CONSENT TABLES
-- -----------------------------------------------------------------------------
-- RLS is already ENABLED in 25_schema_consent.sql (lines 487-492)
-- Policies are already defined (lines 494-564)
-- No action needed

-- -----------------------------------------------------------------------------
-- 5. MESSAGING TABLES (CONVERSATIONS & MESSAGES)
-- -----------------------------------------------------------------------------
-- RLS is already ENABLED in 27_schema_messaging.sql (lines 621-629)
-- Policies are already defined (lines 631-718)
-- No action needed

-- -----------------------------------------------------------------------------
-- 6. INSURANCE TABLES
-- -----------------------------------------------------------------------------
-- RLS is already ENABLED in 28_schema_insurance.sql (lines 624-632)
-- Policies are already defined (lines 634-705)
-- No action needed

-- -----------------------------------------------------------------------------
-- 7. SCHEDULED_JOB_LOG
-- -----------------------------------------------------------------------------
-- Enable RLS if not already enabled
ALTER TABLE scheduled_job_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "scheduled_job_log_select" ON scheduled_job_log;
DROP POLICY IF EXISTS "scheduled_job_log_insert" ON scheduled_job_log;

-- Staff can view job logs
CREATE POLICY "scheduled_job_log_select" ON scheduled_job_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('vet', 'admin')
        )
    );

-- System can insert job logs (no user restriction)
CREATE POLICY "scheduled_job_log_insert" ON scheduled_job_log
    FOR INSERT TO authenticated
    WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- 8. MATERIALIZED_VIEW_REFRESH_LOG (if it exists)
-- -----------------------------------------------------------------------------
-- Note: This table is referenced in the audit but may not exist yet.
-- We'll create it if needed and add RLS.

CREATE TABLE IF NOT EXISTS materialized_view_refresh_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    view_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    rows_affected INTEGER,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_mv_refresh_log_view ON materialized_view_refresh_log(view_name);
CREATE INDEX IF NOT EXISTS idx_mv_refresh_log_time ON materialized_view_refresh_log(started_at DESC);

-- Enable RLS
ALTER TABLE materialized_view_refresh_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "mv_refresh_log_select" ON materialized_view_refresh_log;
DROP POLICY IF EXISTS "mv_refresh_log_insert" ON materialized_view_refresh_log;

-- Staff can view refresh logs
CREATE POLICY "mv_refresh_log_select" ON materialized_view_refresh_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('vet', 'admin')
        )
    );

-- System can insert refresh logs
CREATE POLICY "mv_refresh_log_insert" ON materialized_view_refresh_log
    FOR INSERT TO authenticated
    WITH CHECK (TRUE);

-- =============================================================================
-- DB-002: MISSING FOREIGN KEY CASCADES
-- =============================================================================
-- Add ON DELETE CASCADE to lab_order_items and SET NULL for staff references

-- -----------------------------------------------------------------------------
-- 1. LAB_ORDER_ITEMS.LAB_ORDER_ID → LAB_ORDERS (CASCADE)
-- -----------------------------------------------------------------------------
-- Note: This is already correct in 24_schema_lab_results.sql (line 188)
-- Verify and ensure it has ON DELETE CASCADE

DO $$
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'lab_order_items_lab_order_id_fkey'
        AND table_name = 'lab_order_items'
    ) THEN
        ALTER TABLE lab_order_items DROP CONSTRAINT lab_order_items_lab_order_id_fkey;
    END IF;

    -- Add the constraint with CASCADE
    ALTER TABLE lab_order_items
        ADD CONSTRAINT lab_order_items_lab_order_id_fkey
        FOREIGN KEY (lab_order_id)
        REFERENCES lab_orders(id)
        ON DELETE CASCADE;
END $$;

-- -----------------------------------------------------------------------------
-- 2. LAB_ORDERS STAFF REFERENCES (SET NULL)
-- -----------------------------------------------------------------------------
-- When staff is deleted, preserve historical data but set staff IDs to NULL

DO $$
BEGIN
    -- lab_orders.ordered_by
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'lab_orders_ordered_by_fkey'
        AND table_name = 'lab_orders'
    ) THEN
        ALTER TABLE lab_orders DROP CONSTRAINT lab_orders_ordered_by_fkey;
    END IF;
    ALTER TABLE lab_orders
        ADD CONSTRAINT lab_orders_ordered_by_fkey
        FOREIGN KEY (ordered_by)
        REFERENCES auth.users(id)
        ON DELETE SET NULL;

    -- lab_orders.specimen_collected_by
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'lab_orders_specimen_collected_by_fkey'
        AND table_name = 'lab_orders'
    ) THEN
        ALTER TABLE lab_orders DROP CONSTRAINT lab_orders_specimen_collected_by_fkey;
    END IF;
    ALTER TABLE lab_orders
        ADD CONSTRAINT lab_orders_specimen_collected_by_fkey
        FOREIGN KEY (specimen_collected_by)
        REFERENCES auth.users(id)
        ON DELETE SET NULL;

    -- lab_orders.reviewed_by
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'lab_orders_reviewed_by_fkey'
        AND table_name = 'lab_orders'
    ) THEN
        ALTER TABLE lab_orders DROP CONSTRAINT lab_orders_reviewed_by_fkey;
    END IF;
    ALTER TABLE lab_orders
        ADD CONSTRAINT lab_orders_reviewed_by_fkey
        FOREIGN KEY (reviewed_by)
        REFERENCES auth.users(id)
        ON DELETE SET NULL;

    -- lab_orders.critical_values_acknowledged_by
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'lab_orders_critical_values_acknowledged_by_fkey'
        AND table_name = 'lab_orders'
    ) THEN
        ALTER TABLE lab_orders DROP CONSTRAINT lab_orders_critical_values_acknowledged_by_fkey;
    END IF;
    ALTER TABLE lab_orders
        ADD CONSTRAINT lab_orders_critical_values_acknowledged_by_fkey
        FOREIGN KEY (critical_values_acknowledged_by)
        REFERENCES auth.users(id)
        ON DELETE SET NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 3. HOSPITALIZATION STAFF REFERENCES (SET NULL)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    -- hospitalizations.admitted_by
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'hospitalizations_admitted_by_fkey'
        AND table_name = 'hospitalizations'
    ) THEN
        ALTER TABLE hospitalizations DROP CONSTRAINT hospitalizations_admitted_by_fkey;
    END IF;
    ALTER TABLE hospitalizations
        ADD CONSTRAINT hospitalizations_admitted_by_fkey
        FOREIGN KEY (admitted_by)
        REFERENCES auth.users(id)
        ON DELETE SET NULL;

    -- hospitalizations.discharged_by
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'hospitalizations_discharged_by_fkey'
        AND table_name = 'hospitalizations'
    ) THEN
        ALTER TABLE hospitalizations DROP CONSTRAINT hospitalizations_discharged_by_fkey;
    END IF;
    ALTER TABLE hospitalizations
        ADD CONSTRAINT hospitalizations_discharged_by_fkey
        FOREIGN KEY (discharged_by)
        REFERENCES auth.users(id)
        ON DELETE SET NULL;

    -- hospitalizations.primary_vet_id
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'hospitalizations_primary_vet_id_fkey'
        AND table_name = 'hospitalizations'
    ) THEN
        ALTER TABLE hospitalizations DROP CONSTRAINT hospitalizations_primary_vet_id_fkey;
    END IF;
    ALTER TABLE hospitalizations
        ADD CONSTRAINT hospitalizations_primary_vet_id_fkey
        FOREIGN KEY (primary_vet_id)
        REFERENCES auth.users(id)
        ON DELETE SET NULL;
END $$;

-- =============================================================================
-- DB-003: MISSING INDEXES
-- =============================================================================
-- Add indexes for frequently queried foreign keys and status columns

-- -----------------------------------------------------------------------------
-- 1. APPOINTMENTS TABLE
-- -----------------------------------------------------------------------------
-- Note: Most indexes are already in place from 11_indexes.sql
-- Adding missing service_id index

CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);

-- -----------------------------------------------------------------------------
-- 2. LAB_ORDERS TABLE
-- -----------------------------------------------------------------------------
-- Note: Most indexes exist in 24_schema_lab_results.sql (lines 358-363)
-- Adding missing indexes

CREATE INDEX IF NOT EXISTS idx_lab_orders_pet ON lab_orders(pet_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_ordered_by ON lab_orders(ordered_by);

-- -----------------------------------------------------------------------------
-- 3. LAB_ORDER_ITEMS TABLE
-- -----------------------------------------------------------------------------
-- Note: idx_lab_order_items_order already exists (line 365)
-- Verify and add if missing

CREATE INDEX IF NOT EXISTS idx_lab_order_items_order ON lab_order_items(lab_order_id);

-- -----------------------------------------------------------------------------
-- 4. HOSPITALIZATION_VISITS TABLE
-- -----------------------------------------------------------------------------
-- Note: idx_hosp_visits_hospitalization already exists (line 379)
-- Verify and add if missing

CREATE INDEX IF NOT EXISTS idx_hosp_visits_hospitalization ON hospitalization_visits(hospitalization_id);

-- -----------------------------------------------------------------------------
-- 5. MESSAGES TABLE
-- -----------------------------------------------------------------------------
-- Note: idx_messages_conversation already exists (line 382)
-- Verify and add if missing

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- -----------------------------------------------------------------------------
-- 6. CONSENT_DOCUMENTS TABLE
-- -----------------------------------------------------------------------------
-- Note: idx_consent_documents_template already exists in 25_schema_consent.sql
-- Verify specific indexes exist

CREATE INDEX IF NOT EXISTS idx_consent_documents_template ON consent_documents(template_id);

-- -----------------------------------------------------------------------------
-- 7. INSURANCE_CLAIMS TABLE
-- -----------------------------------------------------------------------------
-- Note: Most indexes exist in 28_schema_insurance.sql (lines 436-441)
-- Adding missing status and pet_id composite index for performance

CREATE INDEX IF NOT EXISTS idx_insurance_claims_pet ON insurance_claims(pet_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_pet_status ON insurance_claims(pet_id, status)
    WHERE status NOT IN ('closed', 'paid');

-- -----------------------------------------------------------------------------
-- 8. ADDITIONAL PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------

-- Composite index for active hospitalizations by tenant
CREATE INDEX IF NOT EXISTS idx_hospitalizations_tenant_status
    ON hospitalizations(tenant_id, status)
    WHERE status = 'active' AND deleted_at IS NULL;

-- Composite index for pending lab orders by tenant
CREATE INDEX IF NOT EXISTS idx_lab_orders_tenant_status
    ON lab_orders(tenant_id, status)
    WHERE status IN ('ordered', 'specimen_collected', 'in_progress') AND deleted_at IS NULL;

-- Index for conversation unread counts
CREATE INDEX IF NOT EXISTS idx_conversations_unread_staff
    ON conversations(tenant_id, unread_staff_count)
    WHERE unread_staff_count > 0 AND status IN ('open', 'pending');

-- Index for consent document expiration
CREATE INDEX IF NOT EXISTS idx_consent_documents_expiration
    ON consent_documents(expires_at, status)
    WHERE status = 'active' AND expires_at IS NOT NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify the fixes

-- Check RLS is enabled on all critical tables
/*
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'lab_orders', 'lab_order_items', 'lab_panel_tests', 'lab_test_catalog',
    'hospitalizations', 'kennels', 'consent_documents', 'consent_templates',
    'conversations', 'messages', 'insurance_claims', 'insurance_providers',
    'scheduled_job_log', 'materialized_view_refresh_log'
)
ORDER BY tablename;
*/

-- Check foreign key cascade rules
/*
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('lab_orders', 'lab_order_items', 'hospitalizations')
    AND kcu.column_name IN (
        'lab_order_id', 'ordered_by', 'specimen_collected_by', 'reviewed_by',
        'admitted_by', 'discharged_by', 'primary_vet_id'
    )
ORDER BY tc.table_name, kcu.column_name;
*/

-- Check indexes exist
/*
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'appointments', 'lab_orders', 'lab_order_items',
    'hospitalization_visits', 'messages', 'consent_documents',
    'insurance_claims', 'conversations'
)
AND indexname LIKE '%service%'
   OR indexname LIKE '%pet%'
   OR indexname LIKE '%conversation%'
   OR indexname LIKE '%template%'
   OR indexname LIKE '%status%'
ORDER BY tablename, indexname;
*/

-- Count policies on each table
/*
SELECT
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    array_agg(policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'lab_orders', 'lab_order_items', 'hospitalizations', 'kennels',
    'consent_documents', 'conversations', 'messages',
    'insurance_claims', 'scheduled_job_log'
)
GROUP BY schemaname, tablename
ORDER BY tablename;
*/

-- =============================================================================
-- RLS FIXES COMPLETE
-- =============================================================================
-- Summary:
-- ✓ DB-001: Verified all tables have RLS enabled and policies defined
-- ✓ DB-002: Added missing ON DELETE CASCADE and SET NULL constraints
-- ✓ DB-003: Added missing indexes for performance optimization
-- =============================================================================
