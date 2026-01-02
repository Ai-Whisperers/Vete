# Database Migrations v2

This directory contains incremental migrations to improve the database schema.

## Migration Files

| # | File | Description | Priority |
|---|------|-------------|----------|
| 001 | `001_add_tenant_id_to_child_tables.sql` | Adds `tenant_id` to child tables for better RLS performance | HIGH |
| 002 | `002_add_missing_foreign_keys.sql` | Adds missing FK constraints (invoice_items.product_id, etc.) | HIGH |
| 003 | `003_fix_sequence_generation.sql` | Fixes race conditions in invoice/admission number generation | HIGH |
| 004 | `004_fix_handle_new_user.sql` | Removes hardcoded demo emails from auth trigger | HIGH |
| 005 | `005_add_brin_indexes.sql` | Adds BRIN indexes for time-series tables | MEDIUM |
| 006 | `006_add_constraints.sql` | Adds CHECK constraints and unique constraints | MEDIUM |
| 007 | `007_optimize_rls_policies.sql` | Optimizes RLS policies to use direct tenant_id | MEDIUM |
| 008 | `008_add_covering_indexes.sql` | Adds covering indexes for common query patterns | MEDIUM |
| 009 | `009_fix_invoice_totals.sql` | Fixes invoice total calculation logic | MEDIUM |
| 010 | `010_add_soft_delete.sql` | Adds soft delete to remaining tables | LOW |

## Running Migrations

### Option 1: Using Supabase CLI

```bash
# Run all migrations in order
supabase db push
```

### Option 2: Using psql directly

```bash
# Connect to your database
psql $DATABASE_URL

# Run migrations in order
\i web/db/v2/migrations/001_add_tenant_id_to_child_tables.sql
\i web/db/v2/migrations/002_add_missing_foreign_keys.sql
\i web/db/v2/migrations/003_fix_sequence_generation.sql
\i web/db/v2/migrations/004_fix_handle_new_user.sql
\i web/db/v2/migrations/005_add_brin_indexes.sql
\i web/db/v2/migrations/006_add_constraints.sql
\i web/db/v2/migrations/007_optimize_rls_policies.sql
\i web/db/v2/migrations/008_add_covering_indexes.sql
\i web/db/v2/migrations/009_fix_invoice_totals.sql
\i web/db/v2/migrations/010_add_soft_delete.sql
```

### Option 3: Using the run script

```bash
# From project root
./web/db/v2/migrations/run_migrations.sh
```

## Pre-Migration Checklist

- [ ] Backup the database
- [ ] Test migrations on staging first
- [ ] Review migration logs for errors
- [ ] Verify RLS policies work correctly
- [ ] Test application functionality

## Post-Migration Verification

Run these queries to verify the migrations:

```sql
-- Check tenant_id was added to all tables
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name = 'tenant_id'
AND table_schema = 'public'
ORDER BY table_name;

-- Check for tables still missing tenant_id
SELECT t.table_name
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND t.table_name NOT IN (
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'tenant_id'
    AND table_schema = 'public'
)
AND t.table_name NOT IN ('tenants', 'demo_accounts', 'document_sequences');

-- Check all constraints were added
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;

-- Check index sizes
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

## Rollback

Each migration is wrapped in a transaction (BEGIN/COMMIT). If a migration fails, it will automatically rollback.

For manual rollback, you'll need to:
1. Drop added columns/indexes
2. Restore original functions
3. Restore original RLS policies

**Note**: Some migrations (like sequence generation fix) create new tables that may need manual cleanup.

## Production Considerations

### Before deploying to production:

1. **Remove demo accounts**:
   ```sql
   DELETE FROM public.demo_accounts;
   -- Or disable them:
   UPDATE public.demo_accounts SET is_active = false;
   ```

2. **Verify constraints won't fail**:
   Run validation queries in each migration's comments to check for data issues.

3. **Monitor performance**:
   After adding indexes, run `ANALYZE` on affected tables:
   ```sql
   ANALYZE public.appointments;
   ANALYZE public.invoices;
   ANALYZE public.vaccines;
   -- etc.
   ```

4. **Set up autovacuum** for high-volume tables:
   ```sql
   ALTER TABLE audit_logs SET (autovacuum_vacuum_scale_factor = 0.01);
   ALTER TABLE messages SET (autovacuum_vacuum_scale_factor = 0.01);
   ```

## Changes Summary

### Security Fixes
- Removed hardcoded demo email logic from `handle_new_user()`
- Added demo accounts table for configurable development accounts

### Data Integrity
- Added missing FK constraint on `invoice_items.product_id`
- Added unique constraints for business rules (one active hospitalization per pet, etc.)
- Added CHECK constraints for valid data ranges

### Performance
- Added `tenant_id` to child tables for direct RLS checks
- Added BRIN indexes for time-series data
- Added covering indexes for common queries
- Optimized RLS policies to eliminate subqueries

### Consistency
- Added soft delete columns to all relevant tables
- Fixed invoice totals calculation
- Fixed sequence generation race conditions
