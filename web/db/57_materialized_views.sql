-- =============================================================================
-- 57_MATERIALIZED_VIEWS.SQL
-- =============================================================================
-- Additional materialized views for enhanced analytics and performance.
-- Complements existing views in 31_materialized_views.sql
--
-- NOTE: The core materialized views (mv_clinic_dashboard_stats,
-- mv_appointment_analytics, mv_inventory_alerts) are defined in
-- 31_materialized_views.sql. This file provides supplementary views.
-- =============================================================================

-- =============================================================================
-- A. ENHANCED CLINIC DASHBOARD STATS (Optimized Version)
-- =============================================================================
-- Improved version with better performance and additional metrics
-- If you want to replace the existing view, first drop it:
-- DROP MATERIALIZED VIEW IF EXISTS mv_clinic_dashboard_stats CASCADE;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_clinic_dashboard_stats_v2 AS
SELECT
    t.id AS tenant_id,
    t.name AS clinic_name,

    -- Pet counts (active pets only)
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) AS total_pets,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species = 'dog') AS total_dogs,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species = 'cat') AS total_cats,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species NOT IN ('dog', 'cat')) AS total_other,

    -- New pets this month
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS new_pets_this_month,

    -- Client counts
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role = 'owner') AS total_clients,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role = 'owner' AND DATE_TRUNC('month', pr.created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS new_clients_this_month,

    -- Today's appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE) AS today_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'confirmed') AS today_confirmed,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'completed') AS today_completed,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'pending') AS today_pending,

    -- Tomorrow's appointments (for planning)
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE + INTERVAL '1 day') AS tomorrow_appointments,

    -- This week appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL
        AND a.start_time >= DATE_TRUNC('week', CURRENT_DATE)
        AND a.start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days') AS week_appointments,

    -- Medical records this month
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.deleted_at IS NULL AND DATE_TRUNC('month', mr.created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS month_records,

    -- Vaccines pending
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending') AS vaccines_pending,
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending' AND v.next_due_date <= CURRENT_DATE) AS vaccines_overdue,
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending' AND v.next_due_date > CURRENT_DATE AND v.next_due_date <= CURRENT_DATE + INTERVAL '7 days') AS vaccines_due_this_week,
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending' AND v.next_due_date > CURRENT_DATE + INTERVAL '7 days' AND v.next_due_date <= CURRENT_DATE + INTERVAL '30 days') AS vaccines_due_this_month,

    -- Active hospitalizations
    COUNT(DISTINCT h.id) FILTER (WHERE h.deleted_at IS NULL AND h.status = 'active') AS active_hospitalizations,

    -- Pending lab orders
    COUNT(DISTINCT lo.id) FILTER (WHERE lo.deleted_at IS NULL AND lo.status IN ('ordered', 'specimen_collected', 'in_progress')) AS pending_lab_orders,

    -- Revenue metrics
    COALESCE(SUM(inv.total_amount) FILTER (WHERE inv.deleted_at IS NULL AND DATE_TRUNC('month', inv.created_at) = DATE_TRUNC('month', CURRENT_DATE) AND inv.status = 'paid'), 0) AS month_revenue,
    COALESCE(SUM(inv.total_amount) FILTER (WHERE inv.deleted_at IS NULL AND DATE(inv.created_at) = CURRENT_DATE AND inv.status = 'paid'), 0) AS today_revenue,

    -- Outstanding invoices
    COALESCE(SUM(inv.balance_due) FILTER (WHERE inv.deleted_at IS NULL AND inv.status IN ('sent', 'overdue')), 0) AS outstanding_balance,
    COUNT(DISTINCT inv.id) FILTER (WHERE inv.deleted_at IS NULL AND inv.status = 'overdue') AS overdue_invoice_count,

    -- Staff metrics
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role IN ('vet', 'admin')) AS total_staff,

    -- Last refresh
    NOW() AS refreshed_at

FROM tenants t
LEFT JOIN pets p ON p.tenant_id = t.id
LEFT JOIN profiles pr ON pr.tenant_id = t.id
LEFT JOIN appointments a ON a.tenant_id = t.id
LEFT JOIN medical_records mr ON mr.tenant_id = t.id
LEFT JOIN vaccines v ON v.pet_id = p.id
LEFT JOIN hospitalizations h ON h.tenant_id = t.id
LEFT JOIN lab_orders lo ON lo.tenant_id = t.id
LEFT JOIN invoices inv ON inv.tenant_id = t.id
GROUP BY t.id, t.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_clinic_dashboard_v2_tenant ON mv_clinic_dashboard_stats_v2(tenant_id);

-- =============================================================================
-- B. ENHANCED APPOINTMENT ANALYTICS (Daily Granularity)
-- =============================================================================
-- Daily appointment metrics for detailed scheduling analysis

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_appointment_analytics_daily AS
SELECT
    tenant_id,
    DATE(start_time) AS appointment_date,
    EXTRACT(DOW FROM start_time) AS day_of_week, -- 0=Sunday, 6=Saturday
    EXTRACT(HOUR FROM start_time) AS hour_of_day,

    -- Appointment counts
    COUNT(*) AS total_appointments,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
    COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending,
    COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,

    -- Rates
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) AS completion_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'no_show') / NULLIF(COUNT(*), 0), 2) AS no_show_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / NULLIF(COUNT(*), 0), 2) AS cancellation_rate,

    -- Duration metrics
    AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS avg_duration_minutes,
    MIN(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS min_duration_minutes,
    MAX(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS max_duration_minutes,

    -- Unique metrics
    COUNT(DISTINCT pet_id) AS unique_pets,
    COUNT(DISTINCT vet_id) AS unique_vets,

    NOW() AS refreshed_at

FROM appointments
WHERE deleted_at IS NULL
  AND start_time >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY tenant_id, DATE(start_time), EXTRACT(DOW FROM start_time), EXTRACT(HOUR FROM start_time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_appt_daily ON mv_appointment_analytics_daily(tenant_id, appointment_date, hour_of_day);
CREATE INDEX IF NOT EXISTS idx_mv_appt_daily_dow ON mv_appointment_analytics_daily(tenant_id, day_of_week);

-- =============================================================================
-- C. ENHANCED INVENTORY ALERTS (Multi-level Alerts)
-- =============================================================================
-- Comprehensive inventory monitoring with priority levels

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inventory_alerts_detailed AS
SELECT
    sp.tenant_id,
    sp.id AS product_id,
    sp.name AS product_name,
    sp.sku,
    sc.name AS category_name,

    -- Stock levels
    si.stock_quantity,
    si.min_stock_level,
    si.weighted_average_cost,
    si.expiry_date,
    si.batch_number,
    si.supplier_name,

    -- Alert classification
    CASE
        WHEN si.stock_quantity <= 0 THEN 'critical_out_of_stock'
        WHEN si.stock_quantity <= si.min_stock_level * 0.25 THEN 'critical_very_low'
        WHEN si.stock_quantity <= si.min_stock_level * 0.5 THEN 'high_low_stock'
        WHEN si.stock_quantity <= si.min_stock_level THEN 'medium_approaching_min'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE THEN 'critical_expired'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'high_expiring_week'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'medium_expiring_month'
        ELSE 'low_monitor'
    END AS alert_level,

    -- Priority score (higher = more urgent)
    CASE
        WHEN si.stock_quantity <= 0 THEN 100
        WHEN si.expiry_date <= CURRENT_DATE THEN 95
        WHEN si.stock_quantity <= si.min_stock_level * 0.25 THEN 90
        WHEN si.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 85
        WHEN si.stock_quantity <= si.min_stock_level * 0.5 THEN 70
        WHEN si.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 60
        WHEN si.stock_quantity <= si.min_stock_level THEN 50
        ELSE 10
    END AS priority_score,

    -- Financial impact
    (si.min_stock_level - si.stock_quantity) * si.weighted_average_cost AS reorder_cost_estimate,
    si.stock_quantity * si.weighted_average_cost AS current_stock_value,

    -- Days until critical
    CASE
        WHEN si.expiry_date IS NOT NULL
        THEN EXTRACT(DAY FROM (si.expiry_date - CURRENT_DATE))
        ELSE NULL
    END AS days_until_expiry,

    NOW() AS refreshed_at

FROM store_products sp
JOIN store_inventory si ON sp.id = si.product_id
LEFT JOIN store_categories sc ON sp.category_id = sc.id
WHERE sp.is_active = TRUE
  AND (
    si.stock_quantity <= si.min_stock_level
    OR si.stock_quantity <= 0
    OR (si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '30 days')
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inv_alerts_detailed ON mv_inventory_alerts_detailed(tenant_id, product_id, COALESCE(batch_number, 'no-batch'));
CREATE INDEX IF NOT EXISTS idx_mv_inv_alerts_priority ON mv_inventory_alerts_detailed(tenant_id, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_mv_inv_alerts_level ON mv_inventory_alerts_detailed(tenant_id, alert_level);

-- =============================================================================
-- D. PET HEALTH SUMMARY
-- =============================================================================
-- Quick health overview per pet for dashboard

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pet_health_summary AS
SELECT
    p.id AS pet_id,
    p.tenant_id,
    p.name AS pet_name,
    p.species,
    p.owner_id,
    pr.full_name AS owner_name,

    -- Age calculation
    EXTRACT(YEAR FROM AGE(COALESCE(p.birth_date, CURRENT_DATE))) AS age_years,

    -- Vaccine status
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'verified') AS vaccines_complete,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'pending') AS vaccines_pending,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'pending' AND v.next_due_date < CURRENT_DATE) AS vaccines_overdue,
    MIN(v.next_due_date) FILTER (WHERE v.status = 'pending' AND v.next_due_date >= CURRENT_DATE) AS next_vaccine_due,

    -- Medical records
    COUNT(DISTINCT mr.id) AS total_medical_records,
    MAX(mr.created_at) AS last_medical_record_date,

    -- Appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS total_visits,
    MAX(a.start_time) FILTER (WHERE a.status = 'completed') AS last_visit_date,
    MIN(a.start_time) FILTER (WHERE a.start_time > NOW() AND a.status IN ('pending', 'confirmed')) AS next_appointment,

    -- Health indicators
    EXISTS(SELECT 1 FROM medical_records mr2 WHERE mr2.pet_id = p.id AND mr2.record_type = 'chronic_condition' AND mr2.deleted_at IS NULL) AS has_chronic_conditions,
    p.allergies IS NOT NULL AND p.allergies != '' AS has_allergies,

    -- Days since last visit
    EXTRACT(DAY FROM (NOW() - MAX(a.start_time) FILTER (WHERE a.status = 'completed'))) AS days_since_last_visit,

    NOW() AS refreshed_at

FROM pets p
LEFT JOIN profiles pr ON p.owner_id = pr.id
LEFT JOIN vaccines v ON v.pet_id = p.id AND v.deleted_at IS NULL
LEFT JOIN medical_records mr ON mr.pet_id = p.id AND mr.deleted_at IS NULL
LEFT JOIN appointments a ON a.pet_id = p.id AND a.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.tenant_id, p.name, p.species, p.owner_id, pr.full_name, p.birth_date, p.allergies;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pet_health_pet ON mv_pet_health_summary(pet_id);
CREATE INDEX IF NOT EXISTS idx_mv_pet_health_tenant ON mv_pet_health_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mv_pet_health_overdue ON mv_pet_health_summary(tenant_id, vaccines_overdue) WHERE vaccines_overdue > 0;
CREATE INDEX IF NOT EXISTS idx_mv_pet_health_next_vaccine ON mv_pet_health_summary(tenant_id, next_vaccine_due);

-- =============================================================================
-- E. REVENUE BREAKDOWN BY SERVICE
-- =============================================================================
-- Service-level revenue analytics

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_by_service AS
SELECT
    s.tenant_id,
    DATE_TRUNC('month', i.created_at) AS month,
    s.id AS service_id,
    s.name AS service_name,
    s.category AS service_category,

    -- Volume metrics
    COUNT(DISTINCT ii.id) AS times_invoiced,
    SUM(ii.quantity) AS total_quantity,

    -- Revenue metrics
    SUM(ii.total_price) AS total_revenue,
    AVG(ii.unit_price) AS avg_unit_price,
    MIN(ii.unit_price) AS min_unit_price,
    MAX(ii.unit_price) AS max_unit_price,

    -- Client metrics
    COUNT(DISTINCT i.client_id) AS unique_clients,

    NOW() AS refreshed_at

FROM services s
LEFT JOIN invoice_items ii ON ii.service_id = s.id
LEFT JOIN invoices i ON ii.invoice_id = i.id AND i.deleted_at IS NULL AND i.status = 'paid'
WHERE s.is_active = TRUE
  AND i.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY s.tenant_id, DATE_TRUNC('month', i.created_at), s.id, s.name, s.category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_revenue_service ON mv_revenue_by_service(tenant_id, service_id, month);
CREATE INDEX IF NOT EXISTS idx_mv_revenue_service_month ON mv_revenue_by_service(tenant_id, month);
CREATE INDEX IF NOT EXISTS idx_mv_revenue_service_category ON mv_revenue_by_service(tenant_id, service_category, month);

-- =============================================================================
-- F. CLIENT LIFETIME VALUE ENHANCED
-- =============================================================================
-- Comprehensive client value metrics

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_client_lifetime_value AS
SELECT
    pr.id AS client_id,
    pr.tenant_id,
    pr.full_name,
    pr.email,
    pr.phone,

    -- Pet portfolio
    COUNT(DISTINCT p.id) AS total_pets,
    COUNT(DISTINCT p.id) FILTER (WHERE p.species = 'dog') AS dog_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.species = 'cat') AS cat_count,

    -- Visit history
    MIN(a.start_time) FILTER (WHERE a.status = 'completed') AS first_visit_date,
    MAX(a.start_time) FILTER (WHERE a.status = 'completed') AS last_visit_date,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS total_completed_visits,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'no_show') AS total_no_shows,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'cancelled') AS total_cancellations,

    -- Financial metrics
    COALESCE(SUM(inv.total_amount) FILTER (WHERE inv.status = 'paid'), 0) AS lifetime_revenue,
    COALESCE(AVG(inv.total_amount) FILTER (WHERE inv.status = 'paid'), 0) AS avg_invoice_amount,
    COALESCE(SUM(inv.balance_due) FILTER (WHERE inv.status IN ('sent', 'overdue')), 0) AS current_balance_due,

    -- Engagement metrics
    EXTRACT(DAY FROM (MAX(a.start_time) FILTER (WHERE a.status = 'completed') - MIN(a.start_time) FILTER (WHERE a.status = 'completed'))) AS customer_lifetime_days,
    CASE
        WHEN MAX(a.start_time) FILTER (WHERE a.status = 'completed') >= CURRENT_DATE - INTERVAL '90 days' THEN 'active'
        WHEN MAX(a.start_time) FILTER (WHERE a.status = 'completed') >= CURRENT_DATE - INTERVAL '180 days' THEN 'at_risk'
        WHEN MAX(a.start_time) FILTER (WHERE a.status = 'completed') IS NULL THEN 'never_visited'
        ELSE 'churned'
    END AS client_status,

    -- Loyalty indicators
    COUNT(DISTINCT DATE_TRUNC('month', a.start_time)) FILTER (WHERE a.status = 'completed') AS active_months,
    COALESCE(lp.balance, 0) AS loyalty_points_balance,

    NOW() AS refreshed_at

FROM profiles pr
LEFT JOIN pets p ON p.owner_id = pr.id AND p.tenant_id = pr.tenant_id AND p.deleted_at IS NULL
LEFT JOIN appointments a ON a.pet_id = p.id AND a.tenant_id = pr.tenant_id AND a.deleted_at IS NULL
LEFT JOIN invoices inv ON inv.client_id = pr.id AND inv.tenant_id = pr.tenant_id AND inv.deleted_at IS NULL
LEFT JOIN loyalty_points lp ON lp.user_id = pr.id
WHERE pr.role = 'owner'
GROUP BY pr.id, pr.tenant_id, pr.full_name, pr.email, pr.phone, lp.balance;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_client_ltv_client ON mv_client_lifetime_value(client_id);
CREATE INDEX IF NOT EXISTS idx_mv_client_ltv_tenant ON mv_client_lifetime_value(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mv_client_ltv_status ON mv_client_lifetime_value(tenant_id, client_status);
CREATE INDEX IF NOT EXISTS idx_mv_client_ltv_revenue ON mv_client_lifetime_value(tenant_id, lifetime_revenue DESC);

-- =============================================================================
-- G. REFRESH FUNCTIONS FOR NEW VIEWS
-- =============================================================================

-- Refresh all enhanced materialized views
CREATE OR REPLACE FUNCTION refresh_enhanced_materialized_views()
RETURNS TABLE (view_name TEXT, refreshed_at TIMESTAMPTZ, duration_ms INTEGER) AS $$
DECLARE
    v_start TIMESTAMPTZ;
    v_duration INTEGER;
BEGIN
    -- mv_clinic_dashboard_stats_v2
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats_v2;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_clinic_dashboard_stats_v2';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_appointment_analytics_daily
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_appointment_analytics_daily;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_appointment_analytics_daily';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_inventory_alerts_detailed
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_alerts_detailed;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_inventory_alerts_detailed';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_pet_health_summary
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pet_health_summary;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_pet_health_summary';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_revenue_by_service
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_service;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_revenue_by_service';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_client_lifetime_value
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_lifetime_value;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_client_lifetime_value';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Quick dashboard refresh (most frequently accessed views)
CREATE OR REPLACE FUNCTION refresh_critical_dashboard_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats_v2;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_alerts_detailed;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pet_health_summary;
END;
$$ LANGUAGE plpgsql;

-- Scheduled job wrapper functions
CREATE OR REPLACE FUNCTION job_refresh_enhanced_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_enhanced_materialized_views();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION job_refresh_critical_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_critical_dashboard_views();
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- H. GRANT ACCESS TO NEW VIEWS
-- =============================================================================

GRANT SELECT ON mv_clinic_dashboard_stats_v2 TO authenticated;
GRANT SELECT ON mv_appointment_analytics_daily TO authenticated;
GRANT SELECT ON mv_inventory_alerts_detailed TO authenticated;
GRANT SELECT ON mv_pet_health_summary TO authenticated;
GRANT SELECT ON mv_revenue_by_service TO authenticated;
GRANT SELECT ON mv_client_lifetime_value TO authenticated;

-- =============================================================================
-- I. SCHEDULED JOBS FOR NEW VIEWS (Optional - Add to 32_scheduled_jobs.sql)
-- =============================================================================

-- To add these jobs to your cron schedule, run:
/*
SELECT cron.schedule(
    'vete_refresh_enhanced_views',
    '0 */2 * * *', -- Every 2 hours
    $$SELECT run_scheduled_job('refresh_enhanced', 'job_refresh_enhanced_views')$$
);

SELECT cron.schedule(
    'vete_refresh_critical_views',
    '*/10 * * * *', -- Every 10 minutes
    $$SELECT run_scheduled_job('refresh_critical', 'job_refresh_critical_views')$$
);
*/

-- =============================================================================
-- J. UTILITY: Manual Refresh All (Core + Enhanced)
-- =============================================================================

CREATE OR REPLACE FUNCTION refresh_all_views_complete()
RETURNS TABLE (
    view_name TEXT,
    refreshed_at TIMESTAMPTZ,
    status TEXT
) AS $$
BEGIN
    -- Core views from 31_materialized_views.sql
    BEGIN
        PERFORM refresh_all_materialized_views();
        view_name := 'core_views_batch';
        refreshed_at := NOW();
        status := 'completed';
        RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
        view_name := 'core_views_batch';
        refreshed_at := NOW();
        status := 'failed: ' || SQLERRM;
        RETURN NEXT;
    END;

    -- Enhanced views from this file
    BEGIN
        PERFORM refresh_enhanced_materialized_views();
        view_name := 'enhanced_views_batch';
        refreshed_at := NOW();
        status := 'completed';
        RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
        view_name := 'enhanced_views_batch';
        refreshed_at := NOW();
        status := 'failed: ' || SQLERRM;
        RETURN NEXT;
    END;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ENHANCED MATERIALIZED VIEWS COMPLETE
-- =============================================================================
--
-- Summary of views created:
-- 1. mv_clinic_dashboard_stats_v2 - Enhanced dashboard with more metrics
-- 2. mv_appointment_analytics_daily - Daily appointment patterns
-- 3. mv_inventory_alerts_detailed - Multi-level inventory alerts
-- 4. mv_pet_health_summary - Per-pet health overview
-- 5. mv_revenue_by_service - Service-level revenue breakdown
-- 6. mv_client_lifetime_value - Comprehensive client value metrics
--
-- Usage:
-- - Query views directly: SELECT * FROM mv_clinic_dashboard_stats_v2 WHERE tenant_id = 'adris';
-- - Refresh all enhanced views: SELECT * FROM refresh_enhanced_materialized_views();
-- - Refresh critical views only: SELECT refresh_critical_dashboard_views();
-- - Refresh everything: SELECT * FROM refresh_all_views_complete();
--
-- Performance notes:
-- - Views include unique indexes for CONCURRENT refresh (no locks)
-- - Refresh times logged via refresh functions
-- - Schedule appropriately based on data volume and update frequency
-- =============================================================================
