# Database Fixes - Quick Reference

## Files Created (December 19, 2025)

| File | Lines | Type | Priority |
|------|-------|------|----------|
| `103_fix_public_rls_policies.sql` | 22 | Security | HIGH |
| `104_add_soft_delete_columns.sql` | 24 | Data | MEDIUM |
| `105_add_updated_at_triggers.sql` | 30 | Data | MEDIUM |
| `106_add_performance_indexes.sql` | 27 | Performance | MEDIUM |
| `MIGRATION_ORDER.md` | 102 | Docs | HIGH |
| `DB_FIXES_EXECUTED.md` | 250+ | Docs | INFO |

## Quick Execution (Production)

```bash
# Navigate to project
cd C:\Users\Alejandro\Documents\Ivan\Adris\Vete\web

# Run migrations in order
psql $DATABASE_URL -f db/103_fix_public_rls_policies.sql
psql $DATABASE_URL -f db/104_add_soft_delete_columns.sql
psql $DATABASE_URL -f db/105_add_updated_at_triggers.sql
psql $DATABASE_URL -f db/106_add_performance_indexes.sql
```

## Supabase Dashboard Execution

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of each file in order (103 → 104 → 105 → 106)
3. Execute one at a time
4. Verify success message before proceeding

## What Each Fix Does

### 103: Security Fix
- **Problem**: Lab reference tables accessible without authentication
- **Solution**: Require authenticated users only
- **Risk**: LOW (reference data, cross-tenant anyway)

### 104: Soft Deletes
- **Problem**: 10 tables missing `deleted_at` column
- **Solution**: Add column + partial indexes for active records
- **Risk**: LOW (additive change, backward compatible)

### 105: Update Triggers
- **Problem**: 12 tables not auto-updating `updated_at`
- **Solution**: Add triggers to all affected tables
- **Risk**: VERY LOW (standard pattern)

### 106: Performance Indexes
- **Problem**: Common queries doing table scans
- **Solution**: Add 11 targeted indexes
- **Risk**: LOW (indexes only, no schema changes)

## Verification Commands

```sql
-- Check RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('lab_test_catalog', 'lab_reference_ranges');

-- Check soft delete columns
SELECT table_name FROM information_schema.columns
WHERE column_name = 'deleted_at'
AND table_name IN ('services', 'invoices', 'payments');

-- Check triggers
SELECT event_object_table, trigger_name FROM information_schema.triggers
WHERE trigger_name = 'set_updated_at';

-- Check indexes
SELECT tablename, indexname FROM pg_indexes
WHERE indexname LIKE 'idx_%'
AND tablename IN ('appointments', 'invoices', 'lab_orders');
```

## Rollback (If Needed)

```sql
-- Rollback 106: Drop indexes
DROP INDEX idx_appointments_date;
DROP INDEX idx_invoices_client_status;
-- ... (see DB_FIXES_EXECUTED.md for full list)

-- Rollback 105: Drop triggers
DROP TRIGGER set_updated_at ON services;
-- ... (for all 12 tables)

-- Rollback 104: Drop soft delete
ALTER TABLE services DROP COLUMN deleted_at;
-- ... (for all 10 tables, drop indexes first)

-- Rollback 103: Revert RLS
DROP POLICY "Authenticated can read lab test catalog" ON lab_test_catalog;
-- ... (recreate public policies if needed)
```

## Status Summary

| Task | Status | Notes |
|------|--------|-------|
| DB-001: Rename duplicates | ✅ Already done | Files already renamed |
| DB-002: Fix RLS policies | ✅ Created | File: 103_fix_public_rls_policies.sql |
| DB-003: Migration docs | ✅ Created | File: MIGRATION_ORDER.md |
| DB-004: (Reserved) | - | Skipped |
| DB-005: Soft deletes | ✅ Created | File: 104_add_soft_delete_columns.sql |
| DB-006: Update triggers | ✅ Created | File: 105_add_updated_at_triggers.sql |
| DB-007: Performance indexes | ✅ Created | File: 106_add_performance_indexes.sql |

## Next Actions

1. **Review** migration files for project-specific needs
2. **Test** in development environment first
3. **Deploy** to staging
4. **Monitor** query performance after index addition
5. **Update** application code to use soft deletes where applicable

---

*For detailed information, see `DB_FIXES_EXECUTED.md`*
