-- =============================================================================
-- 101_RLS_VERIFICATION.SQL
-- =============================================================================
-- Verification queries to ensure all tables have proper RLS configuration.
-- Run this after migrations to validate database security.
-- =============================================================================

-- =============================================================================
-- A. CHECK ALL TABLES HAVE RLS ENABLED
-- =============================================================================
-- Lists all tables that should have RLS but don't

SELECT
    schemaname,
    tablename,
    'MISSING RLS' as issue
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys')
  AND tablename NOT LIKE 'pg_%'
  AND NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = tablename
        AND c.relrowsecurity = true
  );

-- =============================================================================
-- B. LIST ALL TABLES WITH RLS STATUS
-- =============================================================================

SELECT
    c.relname AS table_name,
    CASE WHEN c.relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END AS rls_status,
    CASE WHEN c.relforcerowsecurity THEN 'FORCED' ELSE 'NOT FORCED' END AS rls_forced,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = c.relname) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname NOT LIKE 'pg_%'
ORDER BY
    CASE WHEN c.relrowsecurity THEN 0 ELSE 1 END,
    c.relname;

-- =============================================================================
-- C. LIST ALL RLS POLICIES BY TABLE
-- =============================================================================

SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    with_check AS check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- D. CHECK TABLES WITHOUT ANY POLICIES
-- =============================================================================

SELECT
    c.relname AS table_name,
    'RLS ENABLED BUT NO POLICIES' as issue
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
  AND NOT EXISTS (
      SELECT 1 FROM pg_policies p WHERE p.tablename = c.relname
  );

-- =============================================================================
-- E. CHECK TABLES WITH TENANT_ID BUT MISSING TENANT ISOLATION
-- =============================================================================
-- These tables have tenant_id but their RLS policies might not filter by tenant

SELECT
    t.table_name,
    p.policyname,
    p.qual,
    CASE
        WHEN p.qual LIKE '%tenant_id%' OR p.qual LIKE '%is_staff_of%' THEN 'OK'
        ELSE 'POSSIBLE MISSING TENANT FILTER'
    END AS status
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.table_name AND c.table_schema = t.table_schema
LEFT JOIN pg_policies p ON p.tablename = t.table_name
WHERE c.column_name = 'tenant_id'
  AND c.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, p.policyname;

-- =============================================================================
-- F. LIST ALL FOREIGN KEYS AND CASCADE RULES
-- =============================================================================

SELECT
    tc.table_name AS child_table,
    kcu.column_name AS child_column,
    ccu.table_name AS parent_table,
    ccu.column_name AS parent_column,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =============================================================================
-- G. CHECK FOR MISSING INDEXES ON FOREIGN KEYS
-- =============================================================================

SELECT
    tc.table_name,
    kcu.column_name AS fk_column,
    'MISSING INDEX ON FK' AS issue
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
      SELECT 1 FROM pg_indexes pi
      WHERE pi.tablename = tc.table_name
        AND pi.indexdef LIKE '%' || kcu.column_name || '%'
  );

-- =============================================================================
-- H. CHECK FOR TABLES WITH UPDATED_AT BUT NO TRIGGER
-- =============================================================================

SELECT
    c.table_name,
    'HAS updated_at BUT NO TRIGGER' AS issue
FROM information_schema.columns c
WHERE c.column_name = 'updated_at'
  AND c.table_schema = 'public'
  AND NOT EXISTS (
      SELECT 1 FROM information_schema.triggers t
      WHERE t.event_object_table = c.table_name
        AND t.trigger_name LIKE '%updated_at%'
  );

-- =============================================================================
-- I. SUMMARY COUNTS
-- =============================================================================

SELECT 'Total Tables' AS metric,
       COUNT(*)::TEXT AS value
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
UNION ALL
SELECT 'Tables with RLS Enabled',
       COUNT(*)::TEXT
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
UNION ALL
SELECT 'Total RLS Policies',
       COUNT(*)::TEXT
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 'Total Indexes',
       COUNT(*)::TEXT
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 'Total Triggers',
       COUNT(*)::TEXT
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- =============================================================================
-- J. REFERENCE DATA TABLES AUDIT
-- =============================================================================
-- Check that reference/lookup tables are readable by all authenticated users

SELECT
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
      'diagnosis_codes',
      'drug_dosages',
      'growth_percentiles',
      'vaccine_templates',
      'lab_test_catalog',
      'lab_panels',
      'lab_reference_ranges'
  )
ORDER BY tablename, policyname;

-- =============================================================================
-- VERIFICATION QUERIES COMPLETE
-- =============================================================================
-- Run these queries and review the output to ensure:
-- 1. All tables have RLS enabled
-- 2. All tables have at least one policy
-- 3. Tables with tenant_id filter by tenant
-- 4. Foreign keys have indexes
-- 5. updated_at columns have triggers
-- =============================================================================
