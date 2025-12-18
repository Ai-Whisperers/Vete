# Database Quick Reference Card

## One-Liner Commands

```sql
-- Run comprehensive fixes
\i web/db/102_comprehensive_db_fixes.sql

-- Create new tenant
SELECT setup_new_tenant('clinic_id', 'Clinic Name');

-- Check appointment overlap
SELECT check_appointment_overlap('tenant_id', '2024-12-20', '09:00', '09:30');

-- Get available slots
SELECT * FROM get_available_slots('tenant_id', '2024-12-20');

-- Refresh dashboard
SELECT refresh_critical_dashboard_views();

-- Find missing triggers
SELECT * FROM find_tables_missing_updated_at_triggers() WHERE NOT has_trigger;

-- Tenant info
SELECT * FROM get_tenant_info('tenant_id');
```

## File Reference

| File | Purpose |
|------|---------|
| `102_comprehensive_db_fixes.sql` | Main migration - fixes all DB-005 through DB-008 issues |
| `54_tenant_setup.sql` | Tenant onboarding functions (DB-006) |
| `55_appointment_overlap.sql` | Appointment validation (DB-007) |
| `31_materialized_views.sql` | Core analytics views (DB-008) |
| `57_materialized_views.sql` | Enhanced analytics views (DB-008) |
| `DB_FIXES_SUMMARY.md` | Detailed documentation of all fixes |
| `MIGRATION_GUIDE.md` | Step-by-step migration instructions |

## Key Functions

### Tenant Management
- `setup_new_tenant(id, name)` - Create tenant with defaults
- `tenant_exists(id)` - Check if tenant exists
- `get_tenant_info(id)` - Get tenant statistics
- `delete_tenant_cascade(id)` - ⚠️ Delete all tenant data

### Appointment Scheduling
- `check_appointment_overlap(tenant, date, start, end, vet?, exclude?)` - Check overlap
- `get_available_slots(tenant, date, duration?, work_start?, work_end?, break_start?, break_end?, vet?)` - Get slots

### Materialized Views
- `refresh_all_materialized_views()` - Refresh all core views
- `refresh_enhanced_materialized_views()` - Refresh enhanced views
- `refresh_critical_dashboard_views()` - Quick refresh critical views
- `refresh_all_views_complete()` - Refresh everything

### Diagnostics
- `find_tables_missing_updated_at_triggers()` - Find tables missing triggers

## Materialized Views

### Core Views (31_materialized_views.sql)
| View | Purpose |
|------|---------|
| `mv_clinic_dashboard_stats` | Overall clinic metrics |
| `mv_pet_statistics` | Pet demographics |
| `mv_appointment_analytics` | Monthly appointment metrics |
| `mv_revenue_analytics` | Monthly revenue breakdown |
| `mv_service_popularity` | Service usage tracking |
| `mv_vaccine_compliance` | Vaccine compliance rates |
| `mv_client_retention` | Cohort retention |
| `mv_inventory_alerts` | Stock alerts |
| `mv_disease_heatmap` | Epidemiology |
| `mv_staff_performance` | Staff metrics |
| `mv_client_summary` | Client overview |

### Enhanced Views (57_materialized_views.sql)
| View | Purpose |
|------|---------|
| `mv_clinic_dashboard_stats_v2` | Enhanced dashboard |
| `mv_appointment_analytics_daily` | Daily patterns |
| `mv_inventory_alerts_detailed` | Multi-level alerts |
| `mv_pet_health_summary` | Per-pet health |
| `mv_revenue_by_service` | Service revenue |
| `mv_client_lifetime_value` | Client LTV |

## Common Queries

### Check Database Health
```sql
-- Missing triggers
SELECT COUNT(*) FROM find_tables_missing_updated_at_triggers() WHERE NOT has_trigger;

-- Materialized view count
SELECT COUNT(*) FROM pg_matviews WHERE matviewname LIKE 'mv_%';

-- Function existence
SELECT COUNT(*) FROM pg_proc WHERE proname IN (
    'handle_updated_at',
    'setup_new_tenant',
    'check_appointment_overlap'
);
```

### Test Appointment Booking
```sql
-- Get today's available slots
SELECT slot_time, is_available
FROM get_available_slots('adris', CURRENT_DATE)
WHERE is_available = TRUE
ORDER BY slot_time;

-- Check if 9 AM is available
SELECT NOT check_appointment_overlap(
    'adris',
    CURRENT_DATE,
    '09:00',
    '09:30'
) AS is_available;
```

### Dashboard Data
```sql
-- Quick clinic overview
SELECT
    total_pets,
    total_clients,
    today_appointments,
    today_completed,
    month_revenue,
    outstanding_balance
FROM mv_clinic_dashboard_stats
WHERE tenant_id = 'adris';

-- Inventory alerts
SELECT
    product_name,
    stock_quantity,
    min_stock_level,
    alert_type
FROM mv_inventory_alerts
WHERE tenant_id = 'adris'
ORDER BY
    CASE alert_type
        WHEN 'out_of_stock' THEN 1
        WHEN 'low_stock' THEN 2
        WHEN 'expired' THEN 3
        WHEN 'expiring_soon' THEN 4
    END;
```

## Troubleshooting

### Trigger Not Firing
```sql
-- Check trigger exists
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'TABLE_NAME'::regclass
AND tgname LIKE '%updated_at%';

-- Manually add trigger
CREATE TRIGGER set_updated_at_TABLE_NAME
    BEFORE UPDATE ON TABLE_NAME
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### View Not Refreshing
```sql
-- Force refresh with error details
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats;
    RAISE NOTICE 'Refresh successful';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;
```

### Appointment Overlap Not Working
```sql
-- Check appointment_date exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'appointments'
AND column_name = 'appointment_date';

-- If missing, run:
-- \i web/db/55_appointment_overlap.sql
```

## Performance Tips

1. **Materialized Views**: Refresh during off-peak hours
2. **Appointment Queries**: Always filter by `appointment_date` not just `start_time`
3. **Triggers**: Minimal - only on tables with frequent updates
4. **Indexes**: All foreign keys and commonly filtered columns are indexed

## Security Reminders

- ⚠️ Never use `delete_tenant_cascade()` in production without backup
- ✅ Always use `setup_new_tenant()` for new tenants (ensures RLS works)
- ✅ Test appointment overlap before booking (prevents double-booking)
- ✅ Refresh materialized views regularly (stale data misleads)

## Version Info

- **Migration**: 102_comprehensive_db_fixes.sql
- **Created**: December 2024
- **Fixes**: DB-005, DB-006, DB-007, DB-008
- **Dependencies**: PostgreSQL 14+, Supabase

## Documentation

- Full details: `DB_FIXES_SUMMARY.md`
- Step-by-step: `MIGRATION_GUIDE.md`
- This card: `QUICK_REFERENCE.md`
