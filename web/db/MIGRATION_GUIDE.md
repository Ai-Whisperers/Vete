# Database Migration Guide

## Quick Start

### Running All Migrations

```bash
cd web/db

# Option 1: Run the full setup script (drops everything and rebuilds)
psql $DATABASE_URL -f _FULL_SETUP.sql

# Option 2: Run individual migrations in order (for existing database)
psql $DATABASE_URL -f 102_comprehensive_db_fixes.sql
```

### Verification Commands

```sql
-- 1. Check all database fixes were applied
\i web/db/102_comprehensive_db_fixes.sql

-- 2. Find any tables still missing triggers
SELECT * FROM find_tables_missing_updated_at_triggers() WHERE NOT has_trigger;

-- 3. Verify prerequisite functions exist
SELECT
    EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') AS has_updated_at_func,
    EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'setup_new_tenant') AS has_tenant_setup,
    EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'check_appointment_overlap') AS has_overlap_check,
    (SELECT COUNT(*) FROM pg_matviews WHERE matviewname LIKE 'mv_%') AS mv_count;

-- 4. Get validation summary (included in migration)
-- This runs automatically at the end of 102_comprehensive_db_fixes.sql
```

## Common Operations

### Creating a New Tenant

```sql
-- Create tenant with all default data
SELECT setup_new_tenant('myclinic', 'My Veterinary Clinic');

-- Verify creation
SELECT * FROM get_tenant_info('myclinic');

-- Expected output:
-- tenant_id: myclinic
-- tenant_name: My Veterinary Clinic
-- payment_methods_count: 5
-- services_count: 13
-- categories_count: 6
-- users_count: 0 (initially)
-- pets_count: 0 (initially)
```

### Checking Appointment Availability

```sql
-- Check if a specific time slot is available
SELECT check_appointment_overlap(
    'adris',                    -- tenant_id
    '2024-12-20',               -- date
    '09:00',                    -- start_time
    '09:30',                    -- end_time
    NULL,                       -- vet_id (NULL = any vet)
    NULL                        -- exclude_id (NULL = check all)
) AS has_overlap;

-- Get all available slots for a date
SELECT * FROM get_available_slots(
    'adris',                    -- tenant_id
    '2024-12-20',               -- date
    30,                         -- slot_duration_minutes
    '08:00',                    -- work_start
    '18:00',                    -- work_end
    '12:00',                    -- break_start
    '14:00'                     -- break_end
);

-- Get available slots for specific vet
SELECT * FROM get_available_slots(
    'adris',
    '2024-12-20',
    30,
    '08:00',
    '18:00',
    '12:00',
    '14:00',
    'vet-uuid-here'             -- vet_id
) WHERE is_available = TRUE;
```

### Working with Materialized Views

```sql
-- View clinic dashboard stats
SELECT * FROM mv_clinic_dashboard_stats WHERE tenant_id = 'adris';

-- Refresh all core views
SELECT * FROM refresh_all_materialized_views();

-- Refresh only critical dashboard views (faster)
SELECT refresh_critical_dashboard_views();

-- Refresh enhanced views
SELECT * FROM refresh_enhanced_materialized_views();

-- Check last refresh times
SELECT
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) AS size,
    (SELECT refreshed_at FROM mv_clinic_dashboard_stats LIMIT 1) AS last_refresh
FROM pg_matviews
WHERE matviewname LIKE 'mv_%'
ORDER BY matviewname;
```

## Troubleshooting

### Issue: Tables Missing Triggers

```sql
-- Find tables with updated_at but no trigger
SELECT table_name
FROM find_tables_missing_updated_at_triggers()
WHERE NOT has_trigger;

-- Manually add trigger to a table
DROP TRIGGER IF EXISTS set_updated_at_TABLENAME ON TABLENAME;
CREATE TRIGGER set_updated_at_TABLENAME
    BEFORE UPDATE ON TABLENAME
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### Issue: Materialized Views Out of Date

```sql
-- Check when views were last refreshed
SELECT
    matviewname,
    (SELECT refreshed_at FROM mv_clinic_dashboard_stats LIMIT 1) AS last_refresh,
    NOW() - (SELECT refreshed_at FROM mv_clinic_dashboard_stats LIMIT 1) AS age
FROM pg_matviews
WHERE matviewname = 'mv_clinic_dashboard_stats';

-- Force refresh all views
SELECT * FROM refresh_all_views_complete();
```

### Issue: Appointment Overlap Function Not Working

```sql
-- Verify function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'check_appointment_overlap';

-- Check if appointment_date column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'appointment_date';

-- If missing, run the overlap migration
\i web/db/55_appointment_overlap.sql
```

### Issue: Tenant Setup Function Missing

```sql
-- Verify function exists
SELECT proname FROM pg_proc WHERE proname = 'setup_new_tenant';

-- If missing, run the tenant setup migration
\i web/db/54_tenant_setup.sql
```

## Testing Your Changes

### Test Updated_at Triggers

```sql
-- Pick any table with updated_at
UPDATE services
SET description = 'Test update at ' || NOW()
WHERE code = 'CONSULT-001'
RETURNING code, updated_at, created_at;

-- Verify updated_at is newer than created_at
-- and approximately matches NOW()
```

### Test Tenant Setup

```sql
BEGIN;

-- Create test tenant
SELECT setup_new_tenant('test_clinic', 'Test Clinic');

-- Verify defaults
SELECT
    (SELECT COUNT(*) FROM payment_methods WHERE tenant_id = 'test_clinic') AS payment_methods,
    (SELECT COUNT(*) FROM services WHERE tenant_id = 'test_clinic') AS services,
    (SELECT COUNT(*) FROM store_categories WHERE tenant_id = 'test_clinic') AS categories;

-- Expected: payment_methods=5, services=13, categories=6

ROLLBACK; -- Don't actually create the test tenant
```

### Test Appointment Overlap

```sql
BEGIN;

-- Create two overlapping appointments
INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status)
VALUES
    ('adris', (SELECT id FROM pets LIMIT 1), (SELECT id FROM profiles WHERE role='vet' LIMIT 1),
     '2024-12-20 09:00:00', '2024-12-20 09:30:00', 'confirmed'),
    ('adris', (SELECT id FROM pets LIMIT 1 OFFSET 1), (SELECT id FROM profiles WHERE role='vet' LIMIT 1),
     '2024-12-20 09:15:00', '2024-12-20 09:45:00', 'confirmed');

-- This should return TRUE (overlap detected)
SELECT check_appointment_overlap('adris', '2024-12-20', '09:20', '09:40') AS should_be_true;

-- This should return FALSE (no overlap)
SELECT check_appointment_overlap('adris', '2024-12-20', '10:00', '10:30') AS should_be_false;

ROLLBACK; -- Clean up test data
```

## Performance Monitoring

### Check Trigger Performance

```sql
-- This would require enabling query logging
-- Check pg_stat_user_tables for trigger overhead
SELECT
    schemaname,
    tablename,
    n_tup_upd AS updates,
    n_tup_hot_upd AS hot_updates,
    ROUND(100.0 * n_tup_hot_upd / NULLIF(n_tup_upd, 0), 2) AS hot_update_pct
FROM pg_stat_user_tables
WHERE n_tup_upd > 0
ORDER BY n_tup_upd DESC
LIMIT 20;
```

### Monitor Materialized View Refresh Times

```sql
-- Check refresh log
SELECT
    view_name,
    refresh_started_at,
    duration_seconds,
    rows_affected,
    status
FROM materialized_view_refresh_log
ORDER BY refresh_started_at DESC
LIMIT 20;

-- Average refresh times
SELECT
    view_name,
    COUNT(*) AS refresh_count,
    AVG(duration_seconds) AS avg_duration_sec,
    MAX(duration_seconds) AS max_duration_sec
FROM materialized_view_refresh_log
WHERE status = 'completed'
GROUP BY view_name
ORDER BY avg_duration_sec DESC;
```

## Maintenance

### Schedule Regular Refreshes

```sql
-- Add to pg_cron (if available)
SELECT cron.schedule(
    'vete_refresh_critical_views',
    '*/10 * * * *',  -- Every 10 minutes
    $$SELECT refresh_critical_dashboard_views()$$
);

SELECT cron.schedule(
    'vete_refresh_all_views',
    '0 */2 * * *',  -- Every 2 hours
    $$SELECT refresh_all_materialized_views()$$
);
```

### Backup Before Major Changes

```bash
# Backup database before running migrations
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Or backup specific schema
pg_dump $DATABASE_URL --schema=public > backup_schema_$(date +%Y%m%d_%H%M%S).sql
```

## Migration Rollback

If you need to undo changes:

```sql
-- Drop the diagnostic function
DROP FUNCTION IF EXISTS find_tables_missing_updated_at_triggers() CASCADE;

-- Remove specific triggers (example)
DROP TRIGGER IF EXISTS set_updated_at_TABLENAME ON TABLENAME;

-- Recreate from backup
-- psql $DATABASE_URL < backup_TIMESTAMP.sql
```

## Related Files

- `102_comprehensive_db_fixes.sql` - Main fixes migration
- `DB_FIXES_SUMMARY.md` - Detailed explanation of all fixes
- `54_tenant_setup.sql` - Tenant onboarding functions
- `55_appointment_overlap.sql` - Appointment validation
- `31_materialized_views.sql` - Core analytics views
- `57_materialized_views.sql` - Enhanced analytics views

## Support

For issues or questions:

1. Check `DB_FIXES_SUMMARY.md` for detailed documentation
2. Run diagnostic queries from this guide
3. Verify migration order was correct
4. Check PostgreSQL logs for errors
