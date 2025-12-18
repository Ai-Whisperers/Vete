-- =============================================================================
-- 99_SEED_FINALIZE.SQL
-- =============================================================================
-- Final seed file - refreshes views and validates data.
-- This should be the LAST seed file to run.
-- =============================================================================

-- =============================================================================
-- 1. REFRESH MATERIALIZED VIEWS
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'refresh_all_materialized_views') THEN
        PERFORM refresh_all_materialized_views();
        RAISE NOTICE 'Materialized views refreshed';
    ELSE
        -- Manually refresh if function doesn't exist
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'daily_stats') THEN
            REFRESH MATERIALIZED VIEW daily_stats;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'monthly_revenue') THEN
            REFRESH MATERIALIZED VIEW monthly_revenue;
        END IF;
        RAISE NOTICE 'Materialized views refreshed manually';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not refresh materialized views: %', SQLERRM;
END $$;

-- =============================================================================
-- 2. VALIDATION SUMMARY
-- =============================================================================

DO $$
DECLARE
    v_tenants INT;
    v_users INT;
    v_pets INT;
    v_services INT;
    v_products INT;
    v_appointments INT;
BEGIN
    SELECT COUNT(*) INTO v_tenants FROM tenants;
    SELECT COUNT(*) INTO v_users FROM auth.users WHERE email LIKE '%@demo.com' OR email LIKE '%@petlife.com';
    SELECT COUNT(*) INTO v_pets FROM pets;
    SELECT COUNT(*) INTO v_services FROM services;
    SELECT COUNT(*) INTO v_products FROM store_products;
    SELECT COUNT(*) INTO v_appointments FROM appointments;

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DATABASE SEED COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tenants:      %', v_tenants;
    RAISE NOTICE 'Demo Users:   %', v_users;
    RAISE NOTICE 'Pets:         %', v_pets;
    RAISE NOTICE 'Services:     %', v_services;
    RAISE NOTICE 'Products:     %', v_products;
    RAISE NOTICE 'Appointments: %', v_appointments;
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'TEST ACCOUNTS (password: password123):';
    RAISE NOTICE '  owner@demo.com   - Pet owner with 3 pets';
    RAISE NOTICE '  owner2@demo.com  - Pet owner with 2 pets';
    RAISE NOTICE '  vet@demo.com     - Veterinarian';
    RAISE NOTICE '  admin@demo.com   - Clinic admin';
    RAISE NOTICE '';
    RAISE NOTICE 'Access the app at:';
    RAISE NOTICE '  http://localhost:3000/adris';
    RAISE NOTICE '  http://localhost:3000/petlife';
    RAISE NOTICE '============================================';
END $$;

-- =============================================================================
-- SEED COMPLETE
-- =============================================================================
