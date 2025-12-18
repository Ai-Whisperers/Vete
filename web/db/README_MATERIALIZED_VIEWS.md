# Materialized Views Guide

This document explains the materialized views system in the Vete platform, including how to use, refresh, and maintain them.

## Overview

The platform uses **materialized views** to pre-compute expensive aggregations for dashboard performance. Unlike regular views, materialized views store their results physically, making queries extremely fast.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Core Views (31_materialized_views.sql)                     │
│  - General purpose analytics                                │
│  - Refreshed hourly                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Enhanced Views (57_materialized_views.sql)                 │
│  - Detailed analytics with more granularity                 │
│  - Business intelligence metrics                            │
│  - Refreshed every 2 hours (configurable)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Scheduled Jobs (32_scheduled_jobs.sql)                     │
│  - Automatic refresh via pg_cron                            │
│  - Monitoring and logging                                   │
└─────────────────────────────────────────────────────────────┘
```

## Available Materialized Views

### Core Views (File: 31_materialized_views.sql)

| View Name | Purpose | Refresh Frequency |
|-----------|---------|-------------------|
| `mv_clinic_dashboard_stats` | Main dashboard metrics (pets, appointments, revenue) | Every 15 min |
| `mv_pet_statistics` | Pet demographics by species/breed | Hourly |
| `mv_appointment_analytics` | Monthly appointment metrics | Hourly |
| `mv_revenue_analytics` | Monthly revenue breakdown | Hourly |
| `mv_service_popularity` | Service usage statistics | Hourly |
| `mv_vaccine_compliance` | Vaccination compliance rates | Hourly |
| `mv_client_retention` | Client retention cohorts | Hourly |
| `mv_inventory_alerts` | Low stock and expiry alerts | Every 15 min |
| `mv_disease_heatmap` | Epidemiological heatmap data | Hourly |
| `mv_staff_performance` | Staff productivity metrics | Hourly |
| `mv_client_summary` | Client overview for /api/clients | Hourly |

### Enhanced Views (File: 57_materialized_views.sql)

| View Name | Purpose | Refresh Frequency |
|-----------|---------|-------------------|
| `mv_clinic_dashboard_stats_v2` | Enhanced dashboard with more metrics | Every 10 min (optional) |
| `mv_appointment_analytics_daily` | Daily appointment patterns by hour/day | Every 2 hours |
| `mv_inventory_alerts_detailed` | Multi-level inventory alerts with priority | Every 10 min (optional) |
| `mv_pet_health_summary` | Per-pet health overview | Every 2 hours |
| `mv_revenue_by_service` | Revenue breakdown by service type | Every 2 hours |
| `mv_client_lifetime_value` | Comprehensive client LTV metrics | Every 2 hours |

## Usage Examples

### 1. Query Dashboard Stats

```sql
-- Get all stats for a clinic
SELECT * FROM mv_clinic_dashboard_stats
WHERE tenant_id = 'adris';

-- Get enhanced version with more metrics
SELECT * FROM mv_clinic_dashboard_stats_v2
WHERE tenant_id = 'adris';
```

### 2. Check Inventory Alerts

```sql
-- Get all inventory alerts
SELECT
    product_name,
    alert_type,
    stock_quantity,
    min_stock_level,
    expiry_date
FROM mv_inventory_alerts
WHERE tenant_id = 'adris'
ORDER BY product_name;

-- Get detailed alerts with priority
SELECT
    product_name,
    alert_level,
    priority_score,
    stock_quantity,
    days_until_expiry,
    reorder_cost_estimate
FROM mv_inventory_alerts_detailed
WHERE tenant_id = 'adris'
ORDER BY priority_score DESC;
```

### 3. Analyze Appointment Patterns

```sql
-- Monthly trends
SELECT
    month,
    total_appointments,
    completed,
    completion_rate,
    no_show_rate
FROM mv_appointment_analytics
WHERE tenant_id = 'adris'
ORDER BY month DESC
LIMIT 12;

-- Daily patterns by hour
SELECT
    day_of_week,
    hour_of_day,
    AVG(total_appointments) as avg_appointments,
    AVG(completion_rate) as avg_completion_rate
FROM mv_appointment_analytics_daily
WHERE tenant_id = 'adris'
  AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY day_of_week, hour_of_day
ORDER BY day_of_week, hour_of_day;
```

### 4. Client Lifetime Value Analysis

```sql
-- Top clients by lifetime revenue
SELECT
    full_name,
    email,
    total_pets,
    lifetime_revenue,
    total_completed_visits,
    client_status
FROM mv_client_lifetime_value
WHERE tenant_id = 'adris'
ORDER BY lifetime_revenue DESC
LIMIT 50;

-- Identify at-risk clients
SELECT
    full_name,
    email,
    last_visit_date,
    lifetime_revenue,
    total_pets
FROM mv_client_lifetime_value
WHERE tenant_id = 'adris'
  AND client_status = 'at_risk'
ORDER BY lifetime_revenue DESC;
```

### 5. Pet Health Overview

```sql
-- Pets with overdue vaccines
SELECT
    pet_name,
    owner_name,
    vaccines_overdue,
    next_vaccine_due,
    last_visit_date
FROM mv_pet_health_summary
WHERE tenant_id = 'adris'
  AND vaccines_overdue > 0
ORDER BY next_vaccine_due;

-- Pets that haven't visited recently
SELECT
    pet_name,
    owner_name,
    days_since_last_visit,
    has_chronic_conditions
FROM mv_pet_health_summary
WHERE tenant_id = 'adris'
  AND days_since_last_visit > 365
ORDER BY days_since_last_visit DESC;
```

## Refresh Operations

### Automatic Refresh (Recommended)

Materialized views are automatically refreshed via pg_cron on a schedule:

```sql
-- View scheduled jobs
SELECT * FROM scheduled_jobs;

-- View recent job executions
SELECT * FROM recent_job_executions
WHERE job_name LIKE '%refresh%'
ORDER BY started_at DESC
LIMIT 20;

-- View job statistics
SELECT * FROM job_statistics
WHERE job_name LIKE '%refresh%';
```

### Manual Refresh

#### Refresh All Core Views
```sql
-- Refresh all core materialized views (takes 1-5 minutes)
SELECT * FROM refresh_all_materialized_views();
```

#### Refresh Dashboard Views Only (Fast)
```sql
-- Quick refresh for frequently accessed views (takes seconds)
SELECT refresh_dashboard_views();
```

#### Refresh Enhanced Views
```sql
-- Refresh all enhanced views from 57_materialized_views.sql
SELECT * FROM refresh_enhanced_materialized_views();
```

#### Refresh Critical Views Only
```sql
-- Refresh most frequently accessed enhanced views
SELECT refresh_critical_dashboard_views();
```

#### Refresh Everything
```sql
-- Refresh both core and enhanced views (comprehensive)
SELECT * FROM refresh_all_views_complete();
```

#### Manual Refresh via Trigger Job
```sql
-- Trigger specific refresh jobs manually
SELECT trigger_job('refresh_dashboard');
SELECT trigger_job('refresh_mv');
```

### Concurrent Refresh

All materialized views use **CONCURRENT** refresh, which means:
- No locks on the view during refresh
- Users can query the view while it's being refreshed
- Requires a UNIQUE index (all our views have this)
- Slightly slower than non-concurrent, but much better UX

## Performance Monitoring

### Check Last Refresh Time

```sql
-- Core views - check refreshed_at column
SELECT
    tenant_id,
    clinic_name,
    refreshed_at,
    NOW() - refreshed_at AS age
FROM mv_clinic_dashboard_stats;

-- Enhanced views - same pattern
SELECT
    tenant_id,
    refreshed_at,
    NOW() - refreshed_at AS age
FROM mv_clinic_dashboard_stats_v2;
```

### View Refresh Logs

```sql
-- Check materialized view refresh history
SELECT
    view_name,
    refresh_started_at,
    refresh_completed_at,
    duration_seconds,
    status,
    error_message
FROM materialized_view_refresh_log
ORDER BY refresh_started_at DESC
LIMIT 50;

-- Check average refresh times
SELECT
    view_name,
    COUNT(*) as refresh_count,
    AVG(duration_seconds) as avg_duration_sec,
    MAX(duration_seconds) as max_duration_sec,
    COUNT(*) FILTER (WHERE status = 'failed') as failures
FROM materialized_view_refresh_log
WHERE refresh_started_at >= NOW() - INTERVAL '7 days'
GROUP BY view_name
ORDER BY avg_duration_sec DESC;
```

## Adding to Cron Schedule

To schedule the enhanced views for automatic refresh, add to `32_scheduled_jobs.sql`:

```sql
-- Refresh enhanced views every 2 hours
SELECT cron.schedule(
    'vete_refresh_enhanced_views',
    '0 */2 * * *',
    $$SELECT run_scheduled_job('refresh_enhanced', 'job_refresh_enhanced_views')$$
);

-- Refresh critical enhanced views every 10 minutes
SELECT cron.schedule(
    'vete_refresh_critical_views',
    '*/10 * * * *',
    $$SELECT run_scheduled_job('refresh_critical', 'job_refresh_critical_views')$$
);
```

## Best Practices

### 1. Query Pattern
Always filter by `tenant_id` first for performance:
```sql
-- GOOD
SELECT * FROM mv_clinic_dashboard_stats WHERE tenant_id = 'adris';

-- BAD (scans all rows)
SELECT * FROM mv_clinic_dashboard_stats WHERE clinic_name = 'Veterinaria Adris';
```

### 2. Refresh Strategy
- **High-traffic views**: Refresh every 5-15 minutes (dashboard, inventory)
- **Analytics views**: Refresh hourly or every 2 hours
- **Historical views**: Refresh daily or on-demand

### 3. Monitoring
Check refresh logs regularly:
```sql
-- Alert if any view hasn't refreshed in 2 hours
SELECT
    view_name,
    MAX(refresh_completed_at) as last_refresh,
    NOW() - MAX(refresh_completed_at) as stale_duration
FROM materialized_view_refresh_log
GROUP BY view_name
HAVING NOW() - MAX(refresh_completed_at) > INTERVAL '2 hours';
```

### 4. Troubleshooting

#### View Not Updating
```sql
-- Check if refresh jobs are running
SELECT * FROM job_statistics WHERE job_name LIKE '%refresh%';

-- Check for errors
SELECT * FROM scheduled_job_log
WHERE job_name LIKE '%refresh%' AND status = 'failed'
ORDER BY started_at DESC;

-- Manually refresh to see error
SELECT refresh_all_materialized_views();
```

#### Slow Refresh
```sql
-- Check view size
SELECT
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) AS size
FROM pg_matviews
WHERE matviewname LIKE 'mv_%'
ORDER BY pg_total_relation_size(schemaname||'.'||matviewname) DESC;

-- Analyze underlying tables
ANALYZE pets;
ANALYZE appointments;
ANALYZE invoices;
ANALYZE medical_records;
```

## Migration Guide

### Upgrading from Core to Enhanced Views

If you want to use the enhanced versions:

1. **Drop old view** (if replacing):
```sql
DROP MATERIALIZED VIEW mv_clinic_dashboard_stats CASCADE;
```

2. **Rename enhanced view**:
```sql
ALTER MATERIALIZED VIEW mv_clinic_dashboard_stats_v2
RENAME TO mv_clinic_dashboard_stats;
```

3. **Update application code** to use new columns

### Adding Custom Views

To add your own materialized view:

```sql
-- 1. Create the view with CONCURRENT refresh support
CREATE MATERIALIZED VIEW mv_my_custom_view AS
SELECT
    tenant_id,
    -- your aggregations here
    NOW() AS refreshed_at
FROM your_table
GROUP BY tenant_id;

-- 2. Add unique index for CONCURRENT refresh
CREATE UNIQUE INDEX idx_mv_my_custom_view
ON mv_my_custom_view(tenant_id);

-- 3. Grant access
GRANT SELECT ON mv_my_custom_view TO authenticated;

-- 4. Add to refresh function
-- Edit refresh_enhanced_materialized_views() to include your view

-- 5. Schedule refresh (optional)
-- Add to 32_scheduled_jobs.sql
```

## Security

All materialized views have:
- `GRANT SELECT ON ... TO authenticated` - Only logged-in users can query
- Tenant isolation via `tenant_id` in WHERE clauses
- No INSERT/UPDATE/DELETE permissions

## Maintenance

### Weekly Maintenance
```sql
-- Reindex all materialized views
REINDEX SCHEMA public;

-- Analyze statistics
ANALYZE;

-- Vacuum if needed
VACUUM ANALYZE;
```

### Monthly Review
- Check refresh durations (are they getting slower?)
- Review query patterns (which views are most used?)
- Adjust refresh schedules based on usage
- Archive old refresh logs

## Support

For issues with materialized views:
1. Check `materialized_view_refresh_log` for errors
2. Check `scheduled_job_log` for job failures
3. Manually refresh to see detailed error messages
4. Review underlying table indexes and statistics

---

**Last Updated**: December 2024
**Files**: `31_materialized_views.sql`, `57_materialized_views.sql`, `32_scheduled_jobs.sql`
