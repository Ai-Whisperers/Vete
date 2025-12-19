-- =============================================================================
-- 17_REALTIME.SQL
-- =============================================================================
-- Supabase Realtime subscriptions.
-- =============================================================================

-- =============================================================================
-- A. CREATE REALTIME PUBLICATION
-- =============================================================================
-- Subscribe to changes on these tables for real-time updates.

BEGIN;

DROP PUBLICATION IF EXISTS supabase_realtime;

CREATE PUBLICATION supabase_realtime FOR TABLE
    pets,
    vaccines,
    clinic_invites,
    medical_records,
    appointments,
    qr_tags,
    lost_pets;

COMMIT;

-- =============================================================================
-- B. VIEWS FOR DASHBOARDS
-- =============================================================================

-- Low Stock Products View
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
    p.id,
    p.name,
    p.sku,
    i.stock_quantity,
    i.min_stock_level,
    i.expiry_date,
    i.batch_number,
    p.tenant_id
FROM store_products p
INNER JOIN store_inventory i ON p.id = i.product_id
WHERE i.stock_quantity <= i.min_stock_level
  AND p.is_active = TRUE;

-- Expiring Products View (within 30 days)
CREATE OR REPLACE VIEW expiring_products AS
SELECT
    p.id,
    p.name,
    p.sku,
    i.stock_quantity,
    i.expiry_date,
    i.batch_number,
    p.tenant_id,
    (i.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM store_products p
INNER JOIN store_inventory i ON p.id = i.product_id
WHERE i.expiry_date IS NOT NULL
  AND i.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND i.expiry_date >= CURRENT_DATE
  AND p.is_active = TRUE
ORDER BY i.expiry_date ASC;

-- Public Health Heatmap View
CREATE OR REPLACE VIEW public_health_heatmap AS
SELECT
    dr.diagnosis_code_id,
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
    END) AS avg_severity
FROM disease_reports dr
LEFT JOIN diagnosis_codes dc ON dr.diagnosis_code_id = dc.id
WHERE dr.reported_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY dr.diagnosis_code_id, dc.code, dc.term, dr.species, dr.location_zone, DATE_TRUNC('week', dr.reported_date);

-- Grant access to views
GRANT SELECT ON low_stock_products TO authenticated;
GRANT SELECT ON expiring_products TO authenticated;
GRANT SELECT ON public_health_heatmap TO authenticated;

-- =============================================================================
-- REALTIME COMPLETE
-- =============================================================================
