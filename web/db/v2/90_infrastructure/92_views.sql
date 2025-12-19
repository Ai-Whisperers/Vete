-- =============================================================================
-- 92_VIEWS.SQL
-- =============================================================================
-- Dashboard views for analytics and monitoring.
--
-- Views:
--   - low_stock_products     → Products below minimum stock
--   - expiring_products      → Products expiring within 30 days
--   - public_health_heatmap  → Disease report aggregation
--   - overdue_vaccines       → Pets with overdue vaccinations
--   - upcoming_appointments  → Today's appointments
--   - active_hospitalizations→ Current inpatients
--   - unpaid_invoices        → Invoices pending payment
--   - clinic_dashboard_stats → Summary statistics per tenant
--
-- Dependencies: All domain tables
-- =============================================================================

-- =============================================================================
-- A. LOW STOCK PRODUCTS VIEW
-- =============================================================================
-- Products where stock_quantity is at or below min_stock_level

CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT
    p.id,
    p.tenant_id,
    p.name,
    p.sku,
    p.image_url,
    i.stock_quantity,
    i.min_stock_level,
    i.reorder_quantity,
    i.expiry_date,
    i.batch_number,
    c.name AS category_name,
    (i.min_stock_level - i.stock_quantity) AS quantity_needed
FROM public.store_products p
INNER JOIN public.store_inventory i ON p.id = i.product_id
LEFT JOIN public.store_categories c ON p.category_id = c.id
WHERE i.stock_quantity <= i.min_stock_level
  AND p.is_active = TRUE;

COMMENT ON VIEW public.low_stock_products IS 'Products with stock at or below minimum level';

-- =============================================================================
-- B. EXPIRING PRODUCTS VIEW
-- =============================================================================
-- Products expiring within the next 30 days

CREATE OR REPLACE VIEW public.expiring_products AS
SELECT
    p.id,
    p.tenant_id,
    p.name,
    p.sku,
    p.image_url,
    i.stock_quantity,
    i.expiry_date,
    i.batch_number,
    c.name AS category_name,
    (i.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM public.store_products p
INNER JOIN public.store_inventory i ON p.id = i.product_id
LEFT JOIN public.store_categories c ON p.category_id = c.id
WHERE i.expiry_date IS NOT NULL
  AND i.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND i.expiry_date >= CURRENT_DATE
  AND i.stock_quantity > 0
  AND p.is_active = TRUE
ORDER BY i.expiry_date ASC;

COMMENT ON VIEW public.expiring_products IS 'Products expiring within 30 days';

-- =============================================================================
-- C. PUBLIC HEALTH HEATMAP VIEW
-- =============================================================================
-- Aggregated disease reports for epidemiology dashboard

CREATE OR REPLACE VIEW public.public_health_heatmap AS
SELECT
    dr.diagnosis_code,
    dr.diagnosis_name,
    dr.species,
    dr.location_zone,
    DATE_TRUNC('week', dr.case_date) AS week,
    COUNT(*) AS case_count,
    SUM(dr.case_count) AS total_cases,
    AVG(CASE
        WHEN dr.severity = 'mild' THEN 1
        WHEN dr.severity = 'moderate' THEN 2
        WHEN dr.severity = 'severe' THEN 3
        WHEN dr.severity = 'critical' THEN 4
    END) AS avg_severity
FROM public.disease_reports dr
WHERE dr.case_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY
    dr.diagnosis_code,
    dr.diagnosis_name,
    dr.species,
    dr.location_zone,
    DATE_TRUNC('week', dr.case_date);

COMMENT ON VIEW public.public_health_heatmap IS 'Disease report aggregation for epidemiology';

-- =============================================================================
-- D. OVERDUE VACCINES VIEW
-- =============================================================================
-- Pets with vaccines past their due date

CREATE OR REPLACE VIEW public.overdue_vaccines AS
SELECT
    v.id AS vaccine_id,
    v.pet_id,
    v.name AS vaccine_name,
    v.next_due_date,
    (CURRENT_DATE - v.next_due_date) AS days_overdue,
    p.name AS pet_name,
    p.species,
    p.owner_id,
    p.tenant_id,
    pr.full_name AS owner_name,
    pr.phone AS owner_phone,
    pr.email AS owner_email
FROM public.vaccines v
INNER JOIN public.pets p ON v.pet_id = p.id
LEFT JOIN public.profiles pr ON p.owner_id = pr.id
WHERE v.next_due_date < CURRENT_DATE
  AND v.deleted_at IS NULL
  AND p.deleted_at IS NULL
  AND v.status = 'completed'
ORDER BY v.next_due_date ASC;

COMMENT ON VIEW public.overdue_vaccines IS 'Pets with overdue vaccinations';

-- =============================================================================
-- E. UPCOMING APPOINTMENTS VIEW
-- =============================================================================
-- Today's and upcoming appointments

CREATE OR REPLACE VIEW public.upcoming_appointments AS
SELECT
    a.id,
    a.tenant_id,
    a.pet_id,
    a.service_id,
    a.vet_id,
    a.start_time,
    a.end_time,
    a.status,
    a.reason,
    p.name AS pet_name,
    p.species,
    p.photo_url AS pet_photo,
    pr.full_name AS owner_name,
    pr.phone AS owner_phone,
    s.name AS service_name,
    s.duration_minutes,
    v.full_name AS vet_name
FROM public.appointments a
INNER JOIN public.pets p ON a.pet_id = p.id
LEFT JOIN public.profiles pr ON p.owner_id = pr.id
LEFT JOIN public.services s ON a.service_id = s.id
LEFT JOIN public.profiles v ON a.vet_id = v.id
WHERE a.start_time >= CURRENT_DATE
  AND a.start_time < CURRENT_DATE + INTERVAL '7 days'
  AND a.status NOT IN ('cancelled', 'no_show')
ORDER BY a.start_time ASC;

COMMENT ON VIEW public.upcoming_appointments IS 'Appointments for the next 7 days';

-- =============================================================================
-- F. ACTIVE HOSPITALIZATIONS VIEW
-- =============================================================================
-- Currently hospitalized patients

CREATE OR REPLACE VIEW public.active_hospitalizations AS
SELECT
    h.id,
    h.tenant_id,
    h.pet_id,
    h.kennel_id,
    h.admission_number,
    h.admitted_at,
    h.reason,
    h.diagnosis,
    h.status,
    h.priority,
    h.estimated_cost,
    p.name AS pet_name,
    p.species,
    p.photo_url AS pet_photo,
    pr.full_name AS owner_name,
    pr.phone AS owner_phone,
    k.name AS kennel_name,
    k.code AS kennel_code,
    v.full_name AS primary_vet_name,
    EXTRACT(DAY FROM NOW() - h.admitted_at) AS days_hospitalized
FROM public.hospitalizations h
INNER JOIN public.pets p ON h.pet_id = p.id
LEFT JOIN public.profiles pr ON p.owner_id = pr.id
LEFT JOIN public.kennels k ON h.kennel_id = k.id
LEFT JOIN public.profiles v ON h.primary_vet_id = v.id
WHERE h.status IN ('admitted', 'in_treatment', 'observation', 'critical')
ORDER BY
    CASE h.priority
        WHEN 'critical' THEN 1
        WHEN 'urgent' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END,
    h.admitted_at DESC;

COMMENT ON VIEW public.active_hospitalizations IS 'Currently hospitalized patients';

-- =============================================================================
-- G. UNPAID INVOICES VIEW
-- =============================================================================
-- Invoices with outstanding balance

CREATE OR REPLACE VIEW public.unpaid_invoices AS
SELECT
    i.id,
    i.tenant_id,
    i.invoice_number,
    i.client_id,
    i.pet_id,
    i.invoice_date,
    i.due_date,
    i.total,
    i.amount_paid,
    i.balance_due,
    i.status,
    (CURRENT_DATE - i.due_date) AS days_overdue,
    pr.full_name AS client_name,
    pr.phone AS client_phone,
    pr.email AS client_email,
    p.name AS pet_name
FROM public.invoices i
LEFT JOIN public.profiles pr ON i.client_id = pr.id
LEFT JOIN public.pets p ON i.pet_id = p.id
WHERE i.balance_due > 0
  AND i.status NOT IN ('cancelled', 'refunded', 'draft')
ORDER BY
    CASE
        WHEN i.due_date < CURRENT_DATE THEN 0
        ELSE 1
    END,
    i.due_date ASC;

COMMENT ON VIEW public.unpaid_invoices IS 'Invoices with outstanding balance';

-- =============================================================================
-- H. CLINIC DASHBOARD STATS FUNCTION
-- =============================================================================
-- Returns summary statistics for a clinic dashboard

CREATE OR REPLACE FUNCTION public.get_clinic_stats(p_tenant_id TEXT)
RETURNS TABLE (
    total_pets BIGINT,
    total_clients BIGINT,
    pending_vaccines BIGINT,
    overdue_vaccines BIGINT,
    today_appointments BIGINT,
    week_appointments BIGINT,
    active_hospitalizations BIGINT,
    unpaid_invoices BIGINT,
    unpaid_amount NUMERIC,
    low_stock_items BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.pets WHERE tenant_id = p_tenant_id AND deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.profiles WHERE tenant_id = p_tenant_id AND role = 'owner' AND deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.vaccines v
         JOIN public.pets p ON v.pet_id = p.id
         WHERE p.tenant_id = p_tenant_id AND v.status = 'scheduled' AND v.deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.vaccines v
         JOIN public.pets p ON v.pet_id = p.id
         WHERE p.tenant_id = p_tenant_id AND v.next_due_date < CURRENT_DATE AND v.deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.appointments
         WHERE tenant_id = p_tenant_id AND start_time::DATE = CURRENT_DATE AND status NOT IN ('cancelled', 'no_show')),
        (SELECT COUNT(*) FROM public.appointments
         WHERE tenant_id = p_tenant_id AND start_time >= CURRENT_DATE AND start_time < CURRENT_DATE + 7 AND status NOT IN ('cancelled', 'no_show')),
        (SELECT COUNT(*) FROM public.hospitalizations
         WHERE tenant_id = p_tenant_id AND status IN ('admitted', 'in_treatment', 'observation', 'critical')),
        (SELECT COUNT(*) FROM public.invoices WHERE tenant_id = p_tenant_id AND balance_due > 0 AND status NOT IN ('cancelled', 'refunded', 'draft')),
        (SELECT COALESCE(SUM(balance_due), 0) FROM public.invoices WHERE tenant_id = p_tenant_id AND balance_due > 0 AND status NOT IN ('cancelled', 'refunded', 'draft')),
        (SELECT COUNT(*) FROM public.store_inventory i
         JOIN public.store_products p ON i.product_id = p.id
         WHERE p.tenant_id = p_tenant_id AND i.stock_quantity <= i.min_stock_level AND p.is_active = TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_clinic_stats IS 'Returns dashboard summary statistics for a clinic';

-- =============================================================================
-- I. NETWORK STATS FUNCTION (Cross-tenant)
-- =============================================================================
-- Returns network-wide statistics (for admin dashboard)

CREATE OR REPLACE FUNCTION public.get_network_stats()
RETURNS TABLE (
    total_tenants BIGINT,
    total_pets BIGINT,
    total_users BIGINT,
    total_vaccines BIGINT,
    top_species JSONB,
    active_today BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.tenants WHERE is_active = TRUE),
        (SELECT COUNT(*) FROM public.pets WHERE deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.profiles WHERE deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.vaccines WHERE deleted_at IS NULL),
        (SELECT jsonb_agg(row_to_json(s)) FROM (
            SELECT species, COUNT(*) as count
            FROM public.pets
            WHERE deleted_at IS NULL
            GROUP BY species
            ORDER BY count DESC
            LIMIT 5
        ) s),
        (SELECT COUNT(DISTINCT tenant_id) FROM public.appointments
         WHERE start_time::DATE = CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_network_stats IS 'Returns network-wide statistics';

-- =============================================================================
-- J. GRANT ACCESS TO VIEWS
-- =============================================================================

GRANT SELECT ON public.low_stock_products TO authenticated;
GRANT SELECT ON public.expiring_products TO authenticated;
GRANT SELECT ON public.public_health_heatmap TO authenticated;
GRANT SELECT ON public.overdue_vaccines TO authenticated;
GRANT SELECT ON public.upcoming_appointments TO authenticated;
GRANT SELECT ON public.active_hospitalizations TO authenticated;
GRANT SELECT ON public.unpaid_invoices TO authenticated;

-- =============================================================================
-- VIEWS SETUP COMPLETE
-- =============================================================================
