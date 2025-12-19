-- =============================================================================
-- VERIFY_MIGRATIONS.SQL
-- =============================================================================
-- Run this script after migrations to verify everything was applied correctly.
-- =============================================================================

\echo '=========================================='
\echo 'MIGRATION VERIFICATION REPORT'
\echo '=========================================='
\echo ''

-- =============================================================================
-- 1. CHECK: tenant_id added to child tables
-- =============================================================================
\echo '>>> Checking tenant_id columns...'

SELECT
    table_name,
    CASE WHEN column_name IS NOT NULL THEN 'YES' ELSE 'NO' END as has_tenant_id
FROM (
    VALUES
        ('vaccines'),
        ('vaccine_reactions'),
        ('hospitalization_vitals'),
        ('hospitalization_medications'),
        ('hospitalization_treatments'),
        ('hospitalization_feedings'),
        ('hospitalization_notes'),
        ('invoice_items'),
        ('store_campaign_items'),
        ('qr_tag_scans')
) AS expected(table_name)
LEFT JOIN information_schema.columns c
    ON c.table_name = expected.table_name
    AND c.column_name = 'tenant_id'
    AND c.table_schema = 'public'
ORDER BY table_name;

-- =============================================================================
-- 2. CHECK: Foreign keys exist
-- =============================================================================
\echo ''
\echo '>>> Checking foreign keys...'

SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND (
    tc.constraint_name LIKE '%tenant_fk%'
    OR tc.constraint_name LIKE 'invoice_items_product%'
    OR tc.constraint_name LIKE 'hospitalizations_invoice%'
)
ORDER BY tc.table_name;

-- =============================================================================
-- 3. CHECK: Document sequences table exists
-- =============================================================================
\echo ''
\echo '>>> Checking document_sequences table...'

SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'document_sequences'
    AND table_schema = 'public'
) as document_sequences_exists;

-- =============================================================================
-- 4. CHECK: Demo accounts table exists
-- =============================================================================
\echo ''
\echo '>>> Checking demo_accounts table...'

SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'demo_accounts'
    AND table_schema = 'public'
) as demo_accounts_exists;

-- Demo accounts configured
SELECT email, tenant_id, role, is_active
FROM public.demo_accounts
ORDER BY tenant_id, role;

-- =============================================================================
-- 5. CHECK: BRIN indexes created
-- =============================================================================
\echo ''
\echo '>>> Checking BRIN indexes...'

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE '%_brin'
ORDER BY tablename;

-- =============================================================================
-- 6. CHECK: Constraints added
-- =============================================================================
\echo ''
\echo '>>> Checking CHECK constraints...'

SELECT conname, conrelid::regclass as table_name
FROM pg_constraint
WHERE contype = 'c'
AND connamespace = 'public'::regnamespace
AND (
    conname LIKE 'invoices_%'
    OR conname LIKE 'invoice_items_%'
    OR conname LIKE 'payments_%'
    OR conname LIKE 'refunds_%'
    OR conname LIKE 'store_%'
    OR conname LIKE 'kennels_%'
    OR conname LIKE 'hospitalizations_%'
    OR conname LIKE 'vitals_%'
    OR conname LIKE 'client_credits_%'
    OR conname LIKE 'services_%'
)
ORDER BY conrelid::regclass::text, conname;

-- =============================================================================
-- 7. CHECK: Unique indexes created
-- =============================================================================
\echo ''
\echo '>>> Checking unique business rule indexes...'

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND (
    indexname LIKE 'idx_one_%'
    OR indexname LIKE 'idx_unique_%'
)
ORDER BY tablename;

-- =============================================================================
-- 8. CHECK: Covering indexes created
-- =============================================================================
\echo ''
\echo '>>> Checking covering indexes...'

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND (
    indexname LIKE 'idx_%_list'
    OR indexname LIKE 'idx_%_calendar'
    OR indexname LIKE 'idx_%_board'
    OR indexname LIKE 'idx_%_inbox'
    OR indexname LIKE 'idx_%_queue'
    OR indexname LIKE 'idx_%_history'
    OR indexname LIKE 'idx_%_report'
)
ORDER BY tablename, indexname;

-- =============================================================================
-- 9. CHECK: Soft delete columns added
-- =============================================================================
\echo ''
\echo '>>> Checking soft delete columns...'

SELECT
    table_name,
    MAX(CASE WHEN column_name = 'deleted_at' THEN 'YES' ELSE 'NO' END) as has_deleted_at,
    MAX(CASE WHEN column_name = 'deleted_by' THEN 'YES' ELSE 'NO' END) as has_deleted_by
FROM (
    VALUES
        ('vaccine_templates'),
        ('diagnosis_codes'),
        ('drug_dosages'),
        ('kennels'),
        ('message_templates'),
        ('store_categories'),
        ('store_brands'),
        ('store_campaigns'),
        ('store_coupons'),
        ('payment_methods')
) AS expected(table_name)
LEFT JOIN information_schema.columns c
    ON c.table_name = expected.table_name
    AND c.column_name IN ('deleted_at', 'deleted_by')
    AND c.table_schema = 'public'
GROUP BY expected.table_name
ORDER BY table_name;

-- =============================================================================
-- 10. CHECK: RLS policies updated
-- =============================================================================
\echo ''
\echo '>>> Checking RLS policies (sample)...'

SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('vaccines', 'hospitalization_vitals', 'invoice_items')
ORDER BY tablename, policyname;

-- =============================================================================
-- 11. CHECK: Functions updated
-- =============================================================================
\echo ''
\echo '>>> Checking functions...'

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'generate_invoice_number',
    'generate_admission_number',
    'next_document_number',
    'handle_new_user',
    'update_invoice_totals',
    'calculate_invoice_item_total',
    'soft_delete',
    'soft_delete_batch',
    'restore_deleted',
    'purge_deleted_records'
)
ORDER BY routine_name;

-- =============================================================================
-- 12. CHECK: Data integrity
-- =============================================================================
\echo ''
\echo '>>> Checking data integrity...'

-- Orphaned tenant_id (should be 0)
SELECT 'vaccines with NULL tenant_id' as check,
       COUNT(*) as count
FROM public.vaccines
WHERE tenant_id IS NULL;

-- Multiple active hospitalizations per pet (should be 0)
SELECT 'Pets with multiple active hospitalizations' as check,
       COUNT(*) as count
FROM (
    SELECT pet_id
    FROM public.hospitalizations
    WHERE status NOT IN ('discharged', 'deceased', 'transferred')
    AND deleted_at IS NULL
    GROUP BY pet_id
    HAVING COUNT(*) > 1
) dupes;

-- =============================================================================
-- SUMMARY
-- =============================================================================
\echo ''
\echo '=========================================='
\echo 'VERIFICATION COMPLETE'
\echo '=========================================='

SELECT
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*) FROM pg_constraint WHERE connamespace = 'public'::regnamespace) as total_constraints,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies;
