-- =============================================================================
-- 31_MATERIALIZED_VIEWS.SQL
-- =============================================================================
-- Materialized views for dashboard performance optimization.
-- Pre-computed aggregations that are refreshed periodically.
-- =============================================================================

-- =============================================================================
-- A. CLINIC DASHBOARD STATS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_clinic_dashboard_stats AS
SELECT
    t.id AS tenant_id,
    t.name AS clinic_name,

    -- Pet counts
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) AS total_pets,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species = 'dog') AS total_dogs,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species = 'cat') AS total_cats,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species NOT IN ('dog', 'cat')) AS total_other,

    -- Client counts
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role = 'owner') AS total_clients,

    -- Today's appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE) AS today_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'confirmed') AS today_confirmed,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'completed') AS today_completed,

    -- This week appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND a.start_time >= DATE_TRUNC('week', CURRENT_DATE) AND a.start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days') AS week_appointments,

    -- Medical records this month
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.deleted_at IS NULL AND DATE_TRUNC('month', mr.created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS month_records,

    -- Vaccines pending
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending') AS vaccines_pending,
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending' AND v.next_due_date <= CURRENT_DATE + INTERVAL '7 days') AS vaccines_due_soon,

    -- Active hospitalizations
    COUNT(DISTINCT h.id) FILTER (WHERE h.deleted_at IS NULL AND h.status = 'active') AS active_hospitalizations,

    -- Pending lab orders
    COUNT(DISTINCT lo.id) FILTER (WHERE lo.deleted_at IS NULL AND lo.status IN ('ordered', 'specimen_collected', 'in_progress')) AS pending_lab_orders,

    -- Revenue this month
    COALESCE(SUM(inv.total) FILTER (WHERE inv.deleted_at IS NULL AND DATE_TRUNC('month', inv.created_at) = DATE_TRUNC('month', CURRENT_DATE) AND inv.status = 'paid'), 0) AS month_revenue,

    -- Outstanding invoices
    COALESCE(SUM(inv.balance_due) FILTER (WHERE inv.deleted_at IS NULL AND inv.status IN ('sent', 'overdue')), 0) AS outstanding_balance,

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_clinic_dashboard_tenant ON mv_clinic_dashboard_stats(tenant_id);

-- =============================================================================
-- B. PET STATISTICS BY SPECIES/BREED
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pet_statistics AS
SELECT
    tenant_id,
    species,
    breed,
    COUNT(*) AS count,
    AVG(weight_kg) AS avg_weight,
    AVG(EXTRACT(YEAR FROM AGE(COALESCE(birth_date, CURRENT_DATE)))) AS avg_age_years,
    COUNT(*) FILTER (WHERE is_neutered = TRUE) AS neutered_count,
    COUNT(*) FILTER (WHERE sex = 'male') AS male_count,
    COUNT(*) FILTER (WHERE sex = 'female') AS female_count,
    NOW() AS refreshed_at
FROM pets
WHERE deleted_at IS NULL
GROUP BY tenant_id, species, breed;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pet_stats ON mv_pet_statistics(tenant_id, species, COALESCE(breed, 'Unknown'));

-- =============================================================================
-- C. APPOINTMENT ANALYTICS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_appointment_analytics AS
SELECT
    tenant_id,
    DATE_TRUNC('month', start_time) AS month,
    COUNT(*) AS total_appointments,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
    COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) AS completion_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'no_show') / NULLIF(COUNT(*), 0), 2) AS no_show_rate,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS avg_duration_minutes,
    NOW() AS refreshed_at
FROM appointments
WHERE deleted_at IS NULL
  AND start_time >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY tenant_id, DATE_TRUNC('month', start_time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_appt_analytics ON mv_appointment_analytics(tenant_id, month);

-- =============================================================================
-- D. REVENUE ANALYTICS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_analytics AS
SELECT
    tenant_id,
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS invoice_count,
    SUM(subtotal) AS gross_revenue,
    SUM(discount_amount) AS total_discounts,
    SUM(tax_amount) AS total_taxes,
    SUM(total) AS net_revenue,
    SUM(total) FILTER (WHERE status = 'paid') AS collected_revenue,
    SUM(balance_due) FILTER (WHERE status IN ('sent', 'overdue')) AS outstanding_revenue,
    AVG(total) AS avg_invoice_amount,
    COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
    NOW() AS refreshed_at
FROM invoices
WHERE deleted_at IS NULL
  AND created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY tenant_id, DATE_TRUNC('month', created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_revenue_analytics ON mv_revenue_analytics(tenant_id, month);

-- =============================================================================
-- E. SERVICE POPULARITY
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_service_popularity AS
SELECT
    s.tenant_id,
    s.id AS service_id,
    s.name AS service_name,
    s.category,
    COUNT(ii.id) AS times_used,
    SUM(ii.quantity) AS total_quantity,
    SUM(ii.quantity * ii.unit_price) AS total_revenue,
    AVG(ii.unit_price) AS avg_price,
    DATE_TRUNC('month', MAX(i.created_at)) AS last_used_month,
    NOW() AS refreshed_at
FROM services s
LEFT JOIN invoice_items ii ON ii.service_id = s.id
LEFT JOIN invoices i ON ii.invoice_id = i.id AND i.deleted_at IS NULL
WHERE s.is_active = TRUE
  AND (i.created_at IS NULL OR i.created_at >= CURRENT_DATE - INTERVAL '12 months')
GROUP BY s.tenant_id, s.id, s.name, s.category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_service_popularity ON mv_service_popularity(tenant_id, service_id);

-- =============================================================================
-- F. VACCINE COMPLIANCE
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vaccine_compliance AS
SELECT
    p.tenant_id,
    v.name AS vaccine_name,
    COUNT(DISTINCT v.pet_id) AS total_pets,
    COUNT(DISTINCT v.pet_id) FILTER (WHERE v.status = 'verified') AS vaccinated,
    COUNT(DISTINCT v.pet_id) FILTER (WHERE v.status = 'pending') AS pending,
    COUNT(DISTINCT v.pet_id) FILTER (WHERE v.status = 'pending' AND v.next_due_date < CURRENT_DATE) AS overdue,
    ROUND(100.0 * COUNT(DISTINCT v.pet_id) FILTER (WHERE v.status = 'verified') / NULLIF(COUNT(DISTINCT v.pet_id), 0), 2) AS compliance_rate,
    NOW() AS refreshed_at
FROM vaccines v
JOIN pets p ON v.pet_id = p.id
WHERE v.deleted_at IS NULL
  AND p.deleted_at IS NULL
GROUP BY p.tenant_id, v.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_vaccine_compliance ON mv_vaccine_compliance(tenant_id, vaccine_name);

-- =============================================================================
-- G. CLIENT RETENTION METRICS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_client_retention AS
SELECT
    tenant_id,
    DATE_TRUNC('month', first_visit) AS cohort_month,
    COUNT(DISTINCT owner_id) AS cohort_size,
    COUNT(DISTINCT owner_id) FILTER (WHERE months_since_first <= 1 AND visit_count > 1) AS returned_month_1,
    COUNT(DISTINCT owner_id) FILTER (WHERE months_since_first <= 3 AND visit_count > 1) AS returned_month_3,
    COUNT(DISTINCT owner_id) FILTER (WHERE months_since_first <= 6 AND visit_count > 1) AS returned_month_6,
    COUNT(DISTINCT owner_id) FILTER (WHERE months_since_first <= 12 AND visit_count > 1) AS returned_month_12,
    NOW() AS refreshed_at
FROM (
    SELECT
        p.tenant_id,
        p.owner_id,
        MIN(a.start_time) AS first_visit,
        MAX(a.start_time) AS last_visit,
        COUNT(a.id) AS visit_count,
        EXTRACT(MONTH FROM AGE(MAX(a.start_time), MIN(a.start_time))) AS months_since_first
    FROM pets p
    JOIN appointments a ON a.pet_id = p.id AND a.status = 'completed' AND a.deleted_at IS NULL
    WHERE p.deleted_at IS NULL
    GROUP BY p.tenant_id, p.owner_id
) cohorts
GROUP BY tenant_id, DATE_TRUNC('month', first_visit);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_client_retention ON mv_client_retention(tenant_id, cohort_month);

-- =============================================================================
-- H. INVENTORY ALERTS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inventory_alerts AS
SELECT
    sp.tenant_id,
    sp.id AS product_id,
    sp.name AS product_name,
    sp.sku,
    si.stock_quantity,
    si.min_stock_level,
    si.expiry_date,
    si.batch_number,
    CASE
        WHEN si.stock_quantity <= 0 THEN 'out_of_stock'
        WHEN si.stock_quantity <= si.min_stock_level THEN 'low_stock'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE THEN 'expired'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'ok'
    END AS alert_type,
    NOW() AS refreshed_at
FROM store_products sp
JOIN store_inventory si ON sp.id = si.product_id
WHERE sp.is_active = TRUE
  AND (
    si.stock_quantity <= si.min_stock_level
    OR si.stock_quantity <= 0
    OR (si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '30 days')
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventory_alerts ON mv_inventory_alerts(tenant_id, product_id, batch_number);

-- =============================================================================
-- I. PUBLIC HEALTH HEATMAP (Enhanced)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_disease_heatmap AS
SELECT
    dr.tenant_id,
    dc.code AS diagnosis_code,
    dc.term AS diagnosis_name,
    dr.species,
    dr.location_zone,
    DATE_TRUNC('week', dr.reported_date) AS week,
    COUNT(*) AS case_count,
    AVG(CASE
        WHEN dr.severity = 'mild' THEN 1
        WHEN dr.severity = 'moderate' THEN 2
        WHEN dr.severity = 'severe' THEN 3
        ELSE 0
    END) AS avg_severity,
    NOW() AS refreshed_at
FROM disease_reports dr
LEFT JOIN diagnosis_codes dc ON dr.diagnosis_code_id = dc.id
WHERE dr.reported_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY dr.tenant_id, dc.code, dc.term, dr.species, dr.location_zone, DATE_TRUNC('week', dr.reported_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_disease_heatmap ON mv_disease_heatmap(tenant_id, diagnosis_code, species, location_zone, week);

-- =============================================================================
-- J. STAFF PERFORMANCE
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_staff_performance AS
SELECT
    sp.tenant_id,
    sp.id AS staff_profile_id,
    p.full_name AS staff_name,
    sp.job_title,
    DATE_TRUNC('month', a.start_time) AS month,

    -- Appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.vet_id = sp.user_id) AS appointments_handled,
    COUNT(DISTINCT a.id) FILTER (WHERE a.vet_id = sp.user_id AND a.status = 'completed') AS appointments_completed,

    -- Medical records
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.performed_by = sp.user_id) AS records_created,

    -- Average rating (if feedback system exists)
    -- AVG(f.rating) FILTER (WHERE f.staff_id = sp.user_id) AS avg_rating,

    NOW() AS refreshed_at
FROM staff_profiles sp
JOIN profiles p ON sp.user_id = p.id
LEFT JOIN appointments a ON a.tenant_id = sp.tenant_id
    AND a.start_time >= CURRENT_DATE - INTERVAL '12 months'
    AND a.deleted_at IS NULL
LEFT JOIN medical_records mr ON mr.tenant_id = sp.tenant_id
    AND mr.created_at >= CURRENT_DATE - INTERVAL '12 months'
    AND mr.deleted_at IS NULL
WHERE sp.employment_status = 'active'
GROUP BY sp.tenant_id, sp.id, p.full_name, sp.job_title, DATE_TRUNC('month', a.start_time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_staff_performance ON mv_staff_performance(tenant_id, staff_profile_id, month);

-- =============================================================================
-- K. REFRESH FUNCTIONS
-- =============================================================================

-- Refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS TABLE (view_name TEXT, refreshed_at TIMESTAMPTZ) AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats;
    view_name := 'mv_clinic_dashboard_stats'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pet_statistics;
    view_name := 'mv_pet_statistics'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_appointment_analytics;
    view_name := 'mv_appointment_analytics'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_analytics;
    view_name := 'mv_revenue_analytics'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_service_popularity;
    view_name := 'mv_service_popularity'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vaccine_compliance;
    view_name := 'mv_vaccine_compliance'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_retention;
    view_name := 'mv_client_retention'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_alerts;
    view_name := 'mv_inventory_alerts'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_disease_heatmap;
    view_name := 'mv_disease_heatmap'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_staff_performance;
    view_name := 'mv_staff_performance'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_summary;
    view_name := 'mv_client_summary'; refreshed_at := NOW(); RETURN NEXT;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Refresh dashboard views only (for frequent updates)
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_alerts;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_summary;
END;
$$ LANGUAGE plpgsql;

-- Track last refresh times
CREATE TABLE IF NOT EXISTS materialized_view_refresh_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    view_name TEXT NOT NULL,
    refresh_started_at TIMESTAMPTZ NOT NULL,
    refresh_completed_at TIMESTAMPTZ,
    duration_seconds DECIMAL(10,2),
    rows_affected INTEGER,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_mv_refresh_log_view ON materialized_view_refresh_log(view_name);
CREATE INDEX IF NOT EXISTS idx_mv_refresh_log_time ON materialized_view_refresh_log(refresh_started_at DESC);

-- =============================================================================
-- L. CLIENT SUMMARY (for /api/clients optimization)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_client_summary AS
SELECT
    pr.id AS client_id,
    pr.tenant_id,
    pr.full_name,
    pr.email,
    pr.phone,
    pr.created_at,
    COUNT(DISTINCT p.id) AS pet_count,
    MAX(a.start_time) AS last_appointment_date,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS completed_appointments_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'cancelled' OR a.status = 'no_show') AS missed_appointments_count,
    SUM(COALESCE(inv.total, 0)) FILTER (WHERE inv.status = 'paid') AS lifetime_value,
    MAX(inv.created_at) AS last_invoice_date,
    NOW() AS refreshed_at
FROM profiles pr
LEFT JOIN pets p ON p.owner_id = pr.id AND p.tenant_id = pr.tenant_id AND p.deleted_at IS NULL
LEFT JOIN appointments a ON a.pet_id = p.id AND a.tenant_id = pr.tenant_id AND a.deleted_at IS NULL
LEFT JOIN invoices inv ON inv.client_id = pr.id AND inv.tenant_id = pr.tenant_id AND inv.deleted_at IS NULL
WHERE pr.role = 'owner'
GROUP BY pr.id, pr.tenant_id, pr.full_name, pr.email, pr.phone, pr.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_client_summary_client ON mv_client_summary(client_id);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_tenant ON mv_client_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_name ON mv_client_summary(tenant_id, full_name);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_email ON mv_client_summary(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_pet_count ON mv_client_summary(tenant_id, pet_count);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_last_appt ON mv_client_summary(tenant_id, last_appointment_date);

-- =============================================================================
-- M. GRANT ACCESS TO MATERIALIZED VIEWS
-- =============================================================================

GRANT SELECT ON mv_clinic_dashboard_stats TO authenticated;
GRANT SELECT ON mv_pet_statistics TO authenticated;
GRANT SELECT ON mv_appointment_analytics TO authenticated;
GRANT SELECT ON mv_revenue_analytics TO authenticated;
GRANT SELECT ON mv_service_popularity TO authenticated;
GRANT SELECT ON mv_vaccine_compliance TO authenticated;
GRANT SELECT ON mv_client_retention TO authenticated;
GRANT SELECT ON mv_inventory_alerts TO authenticated;
GRANT SELECT ON mv_disease_heatmap TO authenticated;
GRANT SELECT ON mv_staff_performance TO authenticated;
GRANT SELECT ON mv_client_summary TO authenticated;

-- =============================================================================
-- MATERIALIZED VIEWS COMPLETE
-- =============================================================================
