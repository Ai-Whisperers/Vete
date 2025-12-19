-- =============================================================================
-- RLS VERIFICATION SCRIPT
-- =============================================================================
-- Run this script to verify Row-Level Security coverage across all tables
-- This helps identify missing RLS policies and potential security issues
-- =============================================================================
--
-- Usage:
--   psql -f verify-rls.sql
--   or execute sections individually in your SQL client
--
-- =============================================================================

\echo '==================================================================='
\echo 'RLS VERIFICATION REPORT'
\echo 'Generated:' `date`
\echo '==================================================================='
\echo ''

-- =============================================================================
-- 1. TABLES WITHOUT RLS ENABLED
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '1. TABLES WITHOUT RLS ENABLED (Security Risk!)'
\echo '-------------------------------------------------------------------'
\echo ''

SELECT
    schemaname,
    tablename,
    'MISSING RLS - HIGH RISK' as issue,
    'Enable RLS: ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;' as fix
FROM pg_tables
WHERE schemaname = 'public'
-- Exclude system tables
AND tablename NOT IN (
    'schema_migrations',
    'spatial_ref_sys',
    'scheduled_job_log',
    'cron_job',
    'cron_job_run_details'
)
-- Tables that should NOT have RLS (reference data)
AND tablename NOT IN (
    'diagnosis_codes',
    'drug_dosages',
    'growth_standards',
    'vaccine_schedules',
    'toxic_foods'
)
-- Check if RLS is enabled
AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = tablename
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
)
ORDER BY tablename;

\echo ''

-- =============================================================================
-- 2. TABLES WITH RLS ENABLED BUT NO POLICIES
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '2. TABLES WITH RLS ENABLED BUT NO POLICIES (Will block all access!)'
\echo '-------------------------------------------------------------------'
\echo ''

SELECT
    c.relname as table_name,
    'RLS ENABLED BUT NO POLICIES - BLOCKS ALL ACCESS' as issue,
    'Add policies or disable RLS' as fix
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r'
AND c.relrowsecurity = true
AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public'
    AND p.tablename = c.relname
)
ORDER BY c.relname;

\echo ''

-- =============================================================================
-- 3. POLICY COVERAGE SUMMARY
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '3. POLICY COVERAGE SUMMARY (Tables with RLS)'
\echo '-------------------------------------------------------------------'
\echo ''

SELECT
    tablename,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

\echo ''

-- =============================================================================
-- 4. MISSING CRUD POLICIES
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '4. TABLES MISSING SPECIFIC CRUD POLICIES'
\echo '-------------------------------------------------------------------'
\echo ''

WITH policy_types AS (
    SELECT
        tablename,
        MAX(CASE WHEN cmd = 'SELECT' THEN 1 ELSE 0 END) as has_select,
        MAX(CASE WHEN cmd = 'INSERT' THEN 1 ELSE 0 END) as has_insert,
        MAX(CASE WHEN cmd = 'UPDATE' THEN 1 ELSE 0 END) as has_update,
        MAX(CASE WHEN cmd = 'DELETE' THEN 1 ELSE 0 END) as has_delete,
        MAX(CASE WHEN cmd = 'ALL' THEN 1 ELSE 0 END) as has_all
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
)
SELECT
    tablename,
    CASE WHEN has_select = 0 AND has_all = 0 THEN 'NO SELECT POLICY' ELSE NULL END as select_issue,
    CASE WHEN has_insert = 0 AND has_all = 0 THEN 'NO INSERT POLICY' ELSE NULL END as insert_issue,
    CASE WHEN has_update = 0 AND has_all = 0 THEN 'NO UPDATE POLICY' ELSE NULL END as update_issue,
    CASE WHEN has_delete = 0 AND has_all = 0 THEN 'NO DELETE POLICY' ELSE NULL END as delete_issue
FROM policy_types
WHERE (has_select = 0 OR has_insert = 0 OR has_update = 0 OR has_delete = 0)
AND has_all = 0
ORDER BY tablename;

\echo ''

-- =============================================================================
-- 5. POLICIES WITH HARDCODED TENANT IDS (Security Risk!)
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '5. POLICIES WITH HARDCODED VALUES (Potential Security Issue)'
\echo '-------------------------------------------------------------------'
\echo ''

SELECT
    tablename,
    policyname,
    cmd as operation,
    CASE
        WHEN qual LIKE '%''adris''%' THEN 'HARDCODED: adris'
        WHEN qual LIKE '%''demo''%' THEN 'HARDCODED: demo'
        WHEN qual LIKE '%''petlife''%' THEN 'HARDCODED: petlife'
        WHEN qual LIKE '%TRUE%' THEN 'ALWAYS TRUE (PUBLIC ACCESS)'
        ELSE 'Check definition manually'
    END as issue,
    qual as policy_definition
FROM pg_policies
WHERE schemaname = 'public'
AND (
    qual LIKE '%''adris''%' OR
    qual LIKE '%''demo''%' OR
    qual LIKE '%''petlife''%' OR
    qual ~ 'TRUE(?![A-Za-z])' -- TRUE as literal, not in function names
)
ORDER BY tablename, policyname;

\echo ''

-- =============================================================================
-- 6. POLICIES THAT MIGHT BE TOO PERMISSIVE
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '6. POTENTIALLY OVERLY PERMISSIVE POLICIES'
\echo '-------------------------------------------------------------------'
\echo ''

SELECT
    tablename,
    policyname,
    cmd as operation,
    roles as applies_to_roles,
    'Review if PUBLIC access is intended' as warning
FROM pg_policies
WHERE schemaname = 'public'
AND permissive = 'PERMISSIVE'
AND (
    qual IS NULL OR -- No condition = all rows
    qual = 'true' OR
    qual LIKE '%true%'
)
-- Exclude known public tables
AND tablename NOT IN (
    'tenants',
    'services',
    'diagnosis_codes',
    'drug_dosages',
    'growth_standards',
    'toxic_foods',
    'qr_tags',
    'lost_pets',
    'store_products',
    'store_categories',
    'consent_templates',
    'lab_test_catalog',
    'kennels'
)
ORDER BY tablename, policyname;

\echo ''

-- =============================================================================
-- 7. DETAILED POLICY DEFINITIONS
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '7. ALL RLS POLICIES (Detailed View)'
\echo '-------------------------------------------------------------------'
\echo ''

SELECT
    tablename,
    policyname,
    cmd as operation,
    permissive as policy_type,
    roles as applies_to,
    CASE
        WHEN qual IS NULL THEN '(no condition - all rows)'
        ELSE qual
    END as using_clause,
    CASE
        WHEN with_check IS NULL THEN '(same as USING)'
        ELSE with_check
    END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

\echo ''

-- =============================================================================
-- 8. POLICY DEPENDENCIES ON FUNCTIONS
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '8. POLICIES USING CUSTOM FUNCTIONS'
\echo '-------------------------------------------------------------------'
\echo ''

SELECT
    tablename,
    policyname,
    CASE
        WHEN qual LIKE '%is_staff_of%' THEN 'is_staff_of()'
        WHEN qual LIKE '%auth.uid()%' THEN 'auth.uid()'
        WHEN qual LIKE '%current_user%' THEN 'current_user'
        WHEN qual LIKE '%session_user%' THEN 'session_user'
        ELSE 'Other function'
    END as depends_on_function,
    qual as policy_definition
FROM pg_policies
WHERE schemaname = 'public'
AND (
    qual LIKE '%is_staff_of%' OR
    qual LIKE '%auth.uid()%' OR
    qual LIKE '%current_user%' OR
    qual LIKE '%session_user%'
)
ORDER BY depends_on_function, tablename;

\echo ''

-- =============================================================================
-- 9. VERIFY is_staff_of() FUNCTION EXISTS
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '9. VERIFY SECURITY FUNCTIONS EXIST'
\echo '-------------------------------------------------------------------'
\echo ''

SELECT
    routine_name as function_name,
    routine_type,
    'EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('is_staff_of', 'is_admin_of', 'get_tenant_id')
UNION ALL
SELECT
    'auth.uid' as function_name,
    'function' as routine_type,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_schema = 'auth'
            AND routine_name = 'uid'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
ORDER BY function_name;

\echo ''

-- =============================================================================
-- 10. TABLES BY RLS STATUS
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '10. SUMMARY: TABLES BY RLS STATUS'
\echo '-------------------------------------------------------------------'
\echo ''

WITH table_rls AS (
    SELECT
        t.tablename,
        COALESCE(c.relrowsecurity, false) as rls_enabled,
        COUNT(p.policyname) as policy_count
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
    LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE 'sql_%'
    GROUP BY t.tablename, c.relrowsecurity
)
SELECT
    CASE
        WHEN rls_enabled = false THEN 'NO RLS'
        WHEN rls_enabled = true AND policy_count = 0 THEN 'RLS BUT NO POLICIES'
        WHEN rls_enabled = true AND policy_count > 0 THEN 'RLS WITH POLICIES'
        ELSE 'UNKNOWN'
    END as status,
    COUNT(*) as table_count,
    string_agg(tablename, ', ' ORDER BY tablename) as tables
FROM table_rls
GROUP BY status
ORDER BY
    CASE status
        WHEN 'NO RLS' THEN 1
        WHEN 'RLS BUT NO POLICIES' THEN 2
        WHEN 'RLS WITH POLICIES' THEN 3
        ELSE 4
    END;

\echo ''

-- =============================================================================
-- 11. RECOMMENDATIONS
-- =============================================================================

\echo '-------------------------------------------------------------------'
\echo '11. RECOMMENDATIONS'
\echo '-------------------------------------------------------------------'
\echo ''
\echo 'Based on this verification, you should:'
\echo ''
\echo '1. Enable RLS on all tables listed in section 1'
\echo '2. Add policies to tables in section 2'
\echo '3. Review tables missing specific CRUD policies (section 4)'
\echo '4. Remove hardcoded tenant IDs from policies (section 5)'
\echo '5. Review permissive policies for unintended public access (section 6)'
\echo '6. Ensure all referenced functions exist (section 9)'
\echo ''
\echo 'Example fixes:'
\echo ''
\echo '-- Enable RLS:'
\echo 'ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;'
\echo ''
\echo '-- Add tenant isolation policy:'
\echo 'CREATE POLICY "Staff manage" ON table_name FOR ALL'
\echo '  USING (is_staff_of(tenant_id));'
\echo ''
\echo '-- Add owner access policy:'
\echo 'CREATE POLICY "Owner view" ON table_name FOR SELECT'
\echo '  USING (owner_id = auth.uid());'
\echo ''
\echo '==================================================================='
\echo 'END OF RLS VERIFICATION REPORT'
\echo '==================================================================='
