-- =============================================================================
-- 102_COMPREHENSIVE_DB_FIXES.SQL
-- =============================================================================
-- Comprehensive fixes for database issues identified in TICKETS.md
-- This migration addresses:
--   - DB-005: Missing updated_at triggers (verification and additions)
--   - DB-006: Hardcoded tenant IDs (already fixed in 54_tenant_setup.sql)
--   - DB-007: Appointment overlap validation (already fixed in 55_appointment_overlap.sql)
--   - DB-008: Materialized views (already exist in 31 and 57)
--
-- This file focuses on verification and any remaining gaps.
-- =============================================================================

-- =============================================================================
-- SECTION 1: VERIFY EXISTING FUNCTIONS
-- =============================================================================

-- Verify critical functions exist before proceeding
DO $$
BEGIN
    -- Check handle_updated_at() function
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at'
    ) THEN
        RAISE EXCEPTION 'handle_updated_at() function missing. Run 12_functions.sql first.';
    END IF;

    -- Check setup_new_tenant() function
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'setup_new_tenant'
    ) THEN
        RAISE EXCEPTION 'setup_new_tenant() function missing. Run 54_tenant_setup.sql first.';
    END IF;

    -- Check check_appointment_overlap() function
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'check_appointment_overlap'
    ) THEN
        RAISE EXCEPTION 'check_appointment_overlap() function missing. Run 55_appointment_overlap.sql first.';
    END IF;

    -- Check materialized views exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_clinic_dashboard_stats'
    ) THEN
        RAISE EXCEPTION 'mv_clinic_dashboard_stats missing. Run 31_materialized_views.sql first.';
    END IF;

    RAISE NOTICE 'All prerequisite functions and views verified successfully.';
END $$;

-- =============================================================================
-- SECTION 2: ADD MISSING UPDATED_AT TRIGGERS
-- =============================================================================
-- Add updated_at triggers to tables that have the column but no trigger.
-- Many tables intentionally do NOT have updated_at (immutable audit logs, etc.)

-- -----------------------------------------------------------------------------
-- A. INVOICING TABLES
-- -----------------------------------------------------------------------------

-- Services - Already added in 53_updated_at_triggers.sql but verify
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_services'
    ) THEN
        CREATE TRIGGER set_updated_at_services
            BEFORE UPDATE ON services
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
        RAISE NOTICE 'Created trigger: set_updated_at_services';
    ELSE
        RAISE NOTICE 'Trigger already exists: set_updated_at_services';
    END IF;
END $$;

-- Payment methods - Verify (no updated_at column, only created_at)
-- This table is insert-only, so no trigger needed

-- Invoices - Verify trigger exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_invoices'
    ) THEN
        -- Check if invoices table has updated_at column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'invoices' AND column_name = 'updated_at'
        ) THEN
            CREATE TRIGGER set_updated_at_invoices
                BEFORE UPDATE ON invoices
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_invoices';
        ELSE
            RAISE NOTICE 'Table invoices does not have updated_at column (by design)';
        END IF;
    ELSE
        RAISE NOTICE 'Trigger already exists: set_updated_at_invoices';
    END IF;
END $$;

-- Invoice items - Intentionally NO updated_at (immutable records)
-- Payments - Intentionally NO updated_at (immutable records)
-- Refunds - Intentionally NO updated_at (immutable records)

-- -----------------------------------------------------------------------------
-- B. LAB TABLES
-- -----------------------------------------------------------------------------
-- These already have triggers in 24_schema_lab_results.sql, but verify

DO $$
BEGIN
    -- lab_test_catalog
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_lab_test_catalog') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_test_catalog' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_lab_test_catalog
                BEFORE UPDATE ON lab_test_catalog
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_lab_test_catalog';
        END IF;
    END IF;

    -- lab_test_panels
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_lab_test_panels') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_test_panels' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_lab_test_panels
                BEFORE UPDATE ON lab_test_panels
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_lab_test_panels';
        END IF;
    END IF;

    -- lab_reference_ranges
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_lab_reference_ranges') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_reference_ranges' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_lab_reference_ranges
                BEFORE UPDATE ON lab_reference_ranges
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_lab_reference_ranges';
        END IF;
    END IF;

    -- lab_orders
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_lab_orders') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_orders' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_lab_orders
                BEFORE UPDATE ON lab_orders
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_lab_orders';
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- C. HOSPITALIZATION TABLES
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    -- kennels
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_kennels') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kennels' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_kennels
                BEFORE UPDATE ON kennels
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_kennels';
        END IF;
    END IF;

    -- hospitalizations
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_hospitalizations') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitalizations' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_hospitalizations
                BEFORE UPDATE ON hospitalizations
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_hospitalizations';
        END IF;
    END IF;

    -- hospitalization_vitals
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_hospitalization_vitals') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitalization_vitals' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_hospitalization_vitals
                BEFORE UPDATE ON hospitalization_vitals
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_hospitalization_vitals';
        END IF;
    END IF;

    -- hospitalization_treatments
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_hospitalization_treatments') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitalization_treatments' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_hospitalization_treatments
                BEFORE UPDATE ON hospitalization_treatments
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_hospitalization_treatments';
        END IF;
    END IF;

    -- hospitalization_feedings
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_hospitalization_feedings') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitalization_feedings' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_hospitalization_feedings
                BEFORE UPDATE ON hospitalization_feedings
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_hospitalization_feedings';
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- D. CONSENT TABLES
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    -- consent_templates
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_consent_templates') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consent_templates' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_consent_templates
                BEFORE UPDATE ON consent_templates
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_consent_templates';
        END IF;
    END IF;

    -- consent_documents
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_consent_documents') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consent_documents' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_consent_documents
                BEFORE UPDATE ON consent_documents
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_consent_documents';
        END IF;
    END IF;

    -- blanket_consents
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_blanket_consents') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blanket_consents' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_blanket_consents
                BEFORE UPDATE ON blanket_consents
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_blanket_consents';
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- E. MESSAGING TABLES
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    -- conversations
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_conversations') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_conversations
                BEFORE UPDATE ON conversations
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_conversations';
        END IF;
    END IF;

    -- messages (immutable - no updated_at needed)

    -- message_templates
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_message_templates') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_message_templates
                BEFORE UPDATE ON message_templates
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_message_templates';
        END IF;
    END IF;

    -- broadcast_campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_broadcast_campaigns') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broadcast_campaigns' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_broadcast_campaigns
                BEFORE UPDATE ON broadcast_campaigns
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_broadcast_campaigns';
        END IF;
    END IF;

    -- communication_preferences
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_communication_preferences') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communication_preferences' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_communication_preferences
                BEFORE UPDATE ON communication_preferences
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_communication_preferences';
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- F. INSURANCE TABLES
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    -- insurance_providers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_insurance_providers') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_providers' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_insurance_providers
                BEFORE UPDATE ON insurance_providers
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_insurance_providers';
        END IF;
    END IF;

    -- pet_insurance_policies
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_pet_insurance_policies') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pet_insurance_policies' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_pet_insurance_policies
                BEFORE UPDATE ON pet_insurance_policies
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_pet_insurance_policies';
        END IF;
    END IF;

    -- insurance_claims
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_insurance_claims') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_claims' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_insurance_claims
                BEFORE UPDATE ON insurance_claims
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_insurance_claims';
        END IF;
    END IF;

    -- insurance_pre_authorizations
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_insurance_pre_auth') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insurance_pre_authorizations' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_insurance_pre_auth
                BEFORE UPDATE ON insurance_pre_authorizations
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_insurance_pre_auth';
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- G. STORE TABLES
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    -- store_orders
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_store_orders') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_orders' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_store_orders
                BEFORE UPDATE ON store_orders
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_store_orders';
        END IF;
    END IF;

    -- store_coupons
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_store_coupons') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_coupons' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_store_coupons
                BEFORE UPDATE ON store_coupons
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_store_coupons';
        END IF;
    END IF;

    -- store_reviews
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_store_reviews') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_reviews' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_store_reviews
                BEFORE UPDATE ON store_reviews
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_store_reviews';
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- H. STAFF TABLES
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    -- staff_profiles
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_staff_profiles') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_staff_profiles
                BEFORE UPDATE ON staff_profiles
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_staff_profiles';
        END IF;
    END IF;

    -- staff_schedules
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_staff_schedules') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_schedules' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_staff_schedules
                BEFORE UPDATE ON staff_schedules
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_staff_schedules';
        END IF;
    END IF;

    -- time_off_types
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_time_off_types') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_off_types' AND column_name = 'updated_at') THEN
            CREATE TRIGGER set_updated_at_time_off_types
                BEFORE UPDATE ON time_off_types
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
            RAISE NOTICE 'Created trigger: set_updated_at_time_off_types';
        END IF;
    END IF;
END $$;

-- =============================================================================
-- SECTION 3: UTILITY FUNCTION - LIST TABLES MISSING TRIGGERS
-- =============================================================================
-- Diagnostic function to identify tables with updated_at but no trigger

CREATE OR REPLACE FUNCTION find_tables_missing_updated_at_triggers()
RETURNS TABLE (
    schema_name TEXT,
    table_name TEXT,
    has_updated_at BOOLEAN,
    has_trigger BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.table_schema::TEXT,
        c.table_name::TEXT,
        TRUE AS has_updated_at,
        EXISTS (
            SELECT 1
            FROM pg_trigger t
            JOIN pg_class cl ON t.tgrelid = cl.oid
            JOIN pg_namespace n ON cl.relnamespace = n.oid
            WHERE n.nspname = c.table_schema
            AND cl.relname = c.table_name
            AND t.tgname LIKE '%updated_at%'
        ) AS has_trigger
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.column_name = 'updated_at'
    AND c.table_name NOT LIKE 'pg_%'
    ORDER BY c.table_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SECTION 4: VERIFICATION QUERIES
-- =============================================================================

-- Run this to see which tables still need triggers:
-- SELECT * FROM find_tables_missing_updated_at_triggers() WHERE NOT has_trigger;

-- Count of tables with updated_at column:
-- SELECT COUNT(*) FROM find_tables_missing_updated_at_triggers();

-- Count of tables missing triggers:
-- SELECT COUNT(*) FROM find_tables_missing_updated_at_triggers() WHERE NOT has_trigger;

-- =============================================================================
-- SECTION 5: VALIDATION SUMMARY
-- =============================================================================

DO $$
DECLARE
    total_tables INTEGER;
    missing_triggers INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'updated_at'
    AND table_name NOT LIKE 'pg_%';

    SELECT COUNT(*) INTO missing_triggers
    FROM find_tables_missing_updated_at_triggers()
    WHERE NOT has_trigger;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE FIXES VALIDATION SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total tables with updated_at column: %', total_tables;
    RAISE NOTICE 'Tables missing triggers: %', missing_triggers;
    RAISE NOTICE '';

    IF missing_triggers > 0 THEN
        RAISE NOTICE 'Tables still missing triggers:';
        FOR rec IN
            SELECT table_name
            FROM find_tables_missing_updated_at_triggers()
            WHERE NOT has_trigger
        LOOP
            RAISE NOTICE '  - %', rec.table_name;
        END LOOP;
    ELSE
        RAISE NOTICE 'All tables with updated_at have triggers!';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'DB-006: Tenant setup function exists: %',
        EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'setup_new_tenant');
    RAISE NOTICE 'DB-007: Appointment overlap function exists: %',
        EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'check_appointment_overlap');
    RAISE NOTICE 'DB-008: Materialized views exist: %',
        (SELECT COUNT(*) FROM pg_matviews WHERE matviewname LIKE 'mv_%') || ' views';
    RAISE NOTICE '========================================';
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

COMMENT ON FUNCTION find_tables_missing_updated_at_triggers() IS
'Diagnostic utility to identify tables with updated_at column but missing triggers.
Use: SELECT * FROM find_tables_missing_updated_at_triggers() WHERE NOT has_trigger;';

-- Summary:
-- ✓ DB-005: Added missing updated_at triggers with verification
-- ✓ DB-006: Verified setup_new_tenant() exists (from 54_tenant_setup.sql)
-- ✓ DB-007: Verified check_appointment_overlap() exists (from 55_appointment_overlap.sql)
-- ✓ DB-008: Verified materialized views exist (from 31 and 57)
--
-- This migration is idempotent - safe to run multiple times.
