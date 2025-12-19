# Database Migrations v2

Incremental migrations to improve the database schema.

## Migration Files

| # | File | Description | Priority |
|---|------|-------------|----------|
| 001 | `001_add_tenant_id_to_child_tables.sql` | Adds `tenant_id` to child tables for better RLS | HIGH |
| 002 | `002_add_missing_foreign_keys.sql` | Adds missing FK constraints | HIGH |
| 003 | `003_fix_sequence_generation.sql` | Fixes race conditions in number generation | HIGH |
| 004 | `004_fix_handle_new_user.sql` | Removes hardcoded demo emails | HIGH |
| 005 | `005_add_brin_indexes.sql` | Adds BRIN indexes for time-series | MEDIUM |
| 006 | `006_add_constraints.sql` | Adds CHECK and unique constraints | MEDIUM |
| 007 | `007_optimize_rls_policies.sql` | Optimizes RLS to use direct tenant_id | MEDIUM |
| 008 | `008_add_covering_indexes.sql` | Adds covering indexes for queries | MEDIUM |
| 009 | `009_fix_invoice_totals.sql` | Fixes invoice calculation logic | MEDIUM |
| 010 | `010_add_soft_delete.sql` | Adds soft delete to remaining tables | LOW |
| 011 | `011_fix_available_slots.sql` | Fixes appointment slot generation | LOW |

## Running Migrations

### Using psql

```bash
psql $DATABASE_URL

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
\i web/db/v2/migrations/011_fix_available_slots.sql
```

### Using run script

```bash
cd web/db/v2/migrations
psql $DATABASE_URL -f run_migrations.sql
```

## Pre-Migration Checklist

- [ ] Backup the database
- [ ] Test on staging first
- [ ] Review for data that may violate new constraints

## Post-Migration

```sql
-- Verify tenant_id columns
SELECT table_name FROM information_schema.columns
WHERE column_name = 'tenant_id' AND table_schema = 'public';

-- Run ANALYZE
ANALYZE;

-- Check constraint violations (should be 0)
SELECT COUNT(*) FROM hospitalizations
WHERE status NOT IN ('discharged', 'deceased', 'transferred')
GROUP BY pet_id HAVING COUNT(*) > 1;
```

## Production Notes

**IMPORTANT**: Remove demo accounts in production:
```sql
DELETE FROM public.demo_accounts;
```

## Changes Summary

- **Security**: Removed hardcoded demo emails, added demo_accounts table
- **Integrity**: Added FK constraints, CHECK constraints, unique indexes
- **Performance**: Added tenant_id to children, BRIN indexes, covering indexes, optimized RLS
- **Consistency**: Soft delete on all tables, fixed invoice calculations, fixed slot generation
