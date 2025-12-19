-- =============================================================================
-- 24_SCHEMA_LAB_RESULTS.SQL
-- =============================================================================
-- Laboratory results and diagnostic testing for veterinary clinics.
-- Includes test panels, results, reference ranges, and external lab integration.
-- =============================================================================

-- =============================================================================
-- A. LAB TEST CATALOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_test_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global template

    -- Test info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'hematology', 'chemistry', 'urinalysis', 'serology', 'microbiology',
        'cytology', 'histopathology', 'parasitology', 'endocrinology',
        'coagulation', 'immunology', 'toxicology', 'genetics', 'other'
    )),

    -- Description
    description TEXT,
    specimen_type TEXT, -- blood, urine, feces, tissue, swab, etc.
    specimen_requirements TEXT, -- fasting, specific container, etc.

    -- Turnaround
    turnaround_hours INTEGER,
    is_in_house BOOLEAN DEFAULT FALSE, -- Can be done at clinic

    -- Pricing
    base_price DECIMAL(12,2),
    external_lab_cost DECIMAL(12,2),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- Unique index for global codes (tenant_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_test_catalog_global_code
ON lab_test_catalog (code) WHERE tenant_id IS NULL;

-- =============================================================================
-- B. LAB TEST PANELS (Groups of tests)
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_test_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,

    -- Panel info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Pricing
    panel_price DECIMAL(12,2), -- Discounted price vs individual tests

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS lab_panel_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID NOT NULL REFERENCES lab_test_panels(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES lab_test_catalog(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,

    UNIQUE(panel_id, test_id)
);

-- =============================================================================
-- C. REFERENCE RANGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_reference_ranges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES lab_test_catalog(id) ON DELETE CASCADE,

    -- Applicability
    species TEXT NOT NULL,
    breed TEXT, -- NULL = all breeds
    age_min_months INTEGER,
    age_max_months INTEGER,
    sex TEXT CHECK (sex IN ('male', 'female', 'neutered_male', 'neutered_female')),

    -- Component (for tests with multiple values)
    component_name TEXT NOT NULL DEFAULT 'result',

    -- Range values
    unit TEXT NOT NULL,
    range_low DECIMAL(12,4),
    range_high DECIMAL(12,4),
    critical_low DECIMAL(12,4),
    critical_high DECIMAL(12,4),

    -- Display
    decimal_places INTEGER DEFAULT 2,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. LAB ORDERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Order info
    order_number TEXT NOT NULL,
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ordered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Clinical context
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,
    clinical_notes TEXT,
    fasting_status TEXT CHECK (fasting_status IN ('fasted', 'non_fasted', 'unknown')),

    -- Specimen collection
    specimen_collected_at TIMESTAMPTZ,
    specimen_collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    specimen_type TEXT,
    specimen_quality TEXT CHECK (specimen_quality IN ('adequate', 'hemolyzed', 'lipemic', 'icteric', 'clotted', 'insufficient')),

    -- Processing
    lab_type TEXT NOT NULL DEFAULT 'in_house' CHECK (lab_type IN ('in_house', 'external')),
    external_lab_name TEXT,
    external_lab_accession TEXT,
    sent_to_lab_at TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN (
        'ordered', 'specimen_collected', 'in_progress', 'completed',
        'partial', 'cancelled', 'rejected'
    )),
    priority TEXT DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'routine')),

    -- Results
    results_received_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    has_critical_values BOOLEAN DEFAULT FALSE,
    critical_values_acknowledged BOOLEAN DEFAULT FALSE,
    critical_values_acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Billing
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    total_cost DECIMAL(12,2),

    -- Notes
    notes TEXT,
    internal_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, order_number)
);

-- =============================================================================
-- E. LAB ORDER ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,

    -- What was ordered
    test_id UUID REFERENCES lab_test_catalog(id) ON DELETE SET NULL,
    panel_id UUID REFERENCES lab_test_panels(id) ON DELETE SET NULL,

    -- Custom test (if not in catalog)
    custom_test_name TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'cancelled'
    )),

    -- Pricing
    price DECIMAL(12,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT lab_order_item_test_check CHECK (
        test_id IS NOT NULL OR panel_id IS NOT NULL OR custom_test_name IS NOT NULL
    )
);

-- =============================================================================
-- F. LAB RESULTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    lab_order_item_id UUID REFERENCES lab_order_items(id) ON DELETE CASCADE,
    test_id UUID REFERENCES lab_test_catalog(id) ON DELETE SET NULL,

    -- Result identification
    component_name TEXT NOT NULL DEFAULT 'result',

    -- Value
    result_type TEXT NOT NULL DEFAULT 'numeric' CHECK (result_type IN (
        'numeric', 'text', 'positive_negative', 'reactive_nonreactive',
        'detected_not_detected', 'qualitative'
    )),
    numeric_value DECIMAL(12,4),
    text_value TEXT,
    unit TEXT,

    -- Interpretation
    reference_range_id UUID REFERENCES lab_reference_ranges(id) ON DELETE SET NULL,
    range_low DECIMAL(12,4),
    range_high DECIMAL(12,4),
    flag TEXT CHECK (flag IN ('normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal')),
    is_critical BOOLEAN DEFAULT FALSE,

    -- Method and quality
    method TEXT,
    instrument TEXT,
    dilution_factor DECIMAL(6,2),
    quality_flag TEXT,

    -- Entered by
    entered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entered_at TIMESTAMPTZ DEFAULT NOW(),

    -- Verification
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- G. LAB RESULT ATTACHMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_result_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,

    -- Attachment info
    attachment_type TEXT NOT NULL CHECK (attachment_type IN (
        'report_pdf', 'image', 'graph', 'raw_data', 'external_report', 'other'
    )),
    title TEXT NOT NULL,
    description TEXT,

    -- File
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes INTEGER,

    -- Who
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- H. LAB RESULT COMMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_result_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,

    -- Comment
    comment_type TEXT NOT NULL DEFAULT 'interpretation' CHECK (comment_type IN (
        'interpretation', 'recommendation', 'follow_up', 'technical', 'other'
    )),
    comment TEXT NOT NULL,

    -- Who
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- I. EXTERNAL LAB INTEGRATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS external_lab_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Lab info
    lab_name TEXT NOT NULL,
    lab_code TEXT NOT NULL,
    api_endpoint TEXT,

    -- Credentials (encrypted)
    credentials JSONB DEFAULT '{}',

    -- Mappings
    test_mappings JSONB DEFAULT '{}', -- Map local test codes to lab codes
    species_mappings JSONB DEFAULT '{}',

    -- Settings
    auto_send_orders BOOLEAN DEFAULT FALSE,
    auto_receive_results BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, lab_code)
);

-- =============================================================================
-- J. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_tenant ON lab_test_catalog(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_category ON lab_test_catalog(category);
CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_code ON lab_test_catalog(code);

CREATE INDEX IF NOT EXISTS idx_lab_test_panels_tenant ON lab_test_panels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_panel_tests_panel ON lab_panel_tests(panel_id);

CREATE INDEX IF NOT EXISTS idx_lab_reference_ranges_test ON lab_reference_ranges(test_id);
CREATE INDEX IF NOT EXISTS idx_lab_reference_ranges_species ON lab_reference_ranges(species);

CREATE INDEX IF NOT EXISTS idx_lab_orders_tenant ON lab_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_pet ON lab_orders(pet_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_ordered_at ON lab_orders(ordered_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_orders_critical ON lab_orders(has_critical_values) WHERE has_critical_values = TRUE;
CREATE INDEX IF NOT EXISTS idx_lab_orders_medical_record ON lab_orders(medical_record_id);

CREATE INDEX IF NOT EXISTS idx_lab_order_items_order ON lab_order_items(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_order_items_test ON lab_order_items(test_id);

CREATE INDEX IF NOT EXISTS idx_lab_results_order ON lab_results(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test ON lab_results(test_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_critical ON lab_results(is_critical) WHERE is_critical = TRUE;
CREATE INDEX IF NOT EXISTS idx_lab_results_flag ON lab_results(flag);

CREATE INDEX IF NOT EXISTS idx_lab_attachments_order ON lab_result_attachments(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_comments_order ON lab_result_comments(lab_order_id);

-- =============================================================================
-- K. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_lab_test_catalog_updated_at
    BEFORE UPDATE ON lab_test_catalog
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lab_test_panels_updated_at
    BEFORE UPDATE ON lab_test_panels
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lab_reference_ranges_updated_at
    BEFORE UPDATE ON lab_reference_ranges
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lab_orders_updated_at
    BEFORE UPDATE ON lab_orders
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lab_results_updated_at
    BEFORE UPDATE ON lab_results
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_external_lab_integrations_updated_at
    BEFORE UPDATE ON external_lab_integrations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- L. FUNCTIONS
-- =============================================================================

-- Generate lab order number
CREATE OR REPLACE FUNCTION generate_lab_order_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
BEGIN
    v_prefix := 'LAB';
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM lab_orders
    WHERE tenant_id = p_tenant_id
      AND order_number LIKE v_prefix || v_year || '%';

    RETURN v_prefix || v_year || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Evaluate result against reference range
CREATE OR REPLACE FUNCTION evaluate_lab_result(
    p_numeric_value DECIMAL,
    p_test_id UUID,
    p_species TEXT,
    p_age_months INTEGER DEFAULT NULL,
    p_sex TEXT DEFAULT NULL
)
RETURNS TABLE (
    flag TEXT,
    is_critical BOOLEAN,
    range_low DECIMAL,
    range_high DECIMAL,
    unit TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN p_numeric_value < rr.critical_low THEN 'critical_low'
            WHEN p_numeric_value > rr.critical_high THEN 'critical_high'
            WHEN p_numeric_value < rr.range_low THEN 'low'
            WHEN p_numeric_value > rr.range_high THEN 'high'
            ELSE 'normal'
        END::TEXT,
        (p_numeric_value < rr.critical_low OR p_numeric_value > rr.critical_high)::BOOLEAN,
        rr.range_low,
        rr.range_high,
        rr.unit
    FROM lab_reference_ranges rr
    WHERE rr.test_id = p_test_id
      AND rr.species = p_species
      AND (rr.age_min_months IS NULL OR p_age_months >= rr.age_min_months)
      AND (rr.age_max_months IS NULL OR p_age_months <= rr.age_max_months)
      AND (rr.sex IS NULL OR rr.sex = p_sex)
    ORDER BY
        CASE WHEN rr.breed IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN rr.age_min_months IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN rr.sex IS NOT NULL THEN 0 ELSE 1 END
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Update order status when results change
CREATE OR REPLACE FUNCTION update_lab_order_status()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id UUID;
    v_total_items INTEGER;
    v_completed_items INTEGER;
    v_has_critical BOOLEAN;
BEGIN
    v_order_id := COALESCE(NEW.lab_order_id, OLD.lab_order_id);

    -- Count items
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO v_total_items, v_completed_items
    FROM lab_order_items
    WHERE lab_order_id = v_order_id;

    -- Check for critical values
    SELECT EXISTS(SELECT 1 FROM lab_results WHERE lab_order_id = v_order_id AND is_critical = TRUE)
    INTO v_has_critical;

    -- Update order status
    UPDATE lab_orders SET
        status = CASE
            WHEN v_completed_items = 0 THEN 'in_progress'
            WHEN v_completed_items = v_total_items THEN 'completed'
            ELSE 'partial'
        END,
        has_critical_values = v_has_critical,
        results_received_at = CASE
            WHEN v_completed_items > 0 AND results_received_at IS NULL THEN NOW()
            ELSE results_received_at
        END
    WHERE id = v_order_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lab_results_update_order_status
    AFTER INSERT OR UPDATE ON lab_results
    FOR EACH ROW EXECUTE FUNCTION update_lab_order_status();

-- Get lab results history for a pet
CREATE OR REPLACE FUNCTION get_pet_lab_history(
    p_pet_id UUID,
    p_test_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    ordered_at TIMESTAMPTZ,
    test_name TEXT,
    component_name TEXT,
    numeric_value DECIMAL,
    text_value TEXT,
    unit TEXT,
    flag TEXT,
    is_critical BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lo.id,
        lo.order_number,
        lo.ordered_at,
        ltc.name,
        lr.component_name,
        lr.numeric_value,
        lr.text_value,
        lr.unit,
        lr.flag,
        lr.is_critical
    FROM lab_orders lo
    JOIN lab_results lr ON lo.id = lr.lab_order_id
    LEFT JOIN lab_test_catalog ltc ON lr.test_id = ltc.id
    WHERE lo.pet_id = p_pet_id
      AND lo.status IN ('completed', 'partial')
      AND (p_test_id IS NULL OR lr.test_id = p_test_id)
    ORDER BY lo.ordered_at DESC, ltc.name, lr.component_name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- M. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE lab_test_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_test_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_panel_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reference_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_result_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_result_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_lab_integrations ENABLE ROW LEVEL SECURITY;

-- Lab Test Catalog: Global templates visible to all, tenant-specific to staff
CREATE POLICY lab_test_catalog_select ON lab_test_catalog FOR SELECT TO authenticated
    USING (tenant_id IS NULL OR is_staff_of(tenant_id));

CREATE POLICY lab_test_catalog_insert ON lab_test_catalog FOR INSERT TO authenticated
    WITH CHECK (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

CREATE POLICY lab_test_catalog_update ON lab_test_catalog FOR UPDATE TO authenticated
    USING (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

-- Lab Test Panels
CREATE POLICY lab_test_panels_select ON lab_test_panels FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY lab_test_panels_insert ON lab_test_panels FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY lab_test_panels_update ON lab_test_panels FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Panel Tests
CREATE POLICY lab_panel_tests_all ON lab_panel_tests FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_test_panels p WHERE p.id = lab_panel_tests.panel_id AND is_staff_of(p.tenant_id))
    );

-- Reference Ranges: Read for staff, global readable
CREATE POLICY lab_reference_ranges_select ON lab_reference_ranges FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY lab_reference_ranges_insert ON lab_reference_ranges FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_test_catalog t WHERE t.id = lab_reference_ranges.test_id
                AND (t.tenant_id IS NULL OR is_staff_of(t.tenant_id)))
    );

-- Lab Orders: Staff manage, owners view their pets
CREATE POLICY lab_orders_select_staff ON lab_orders FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY lab_orders_select_owner ON lab_orders FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM pets WHERE pets.id = lab_orders.pet_id AND pets.owner_id = auth.uid())
    );

CREATE POLICY lab_orders_insert ON lab_orders FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY lab_orders_update ON lab_orders FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Lab Order Items
CREATE POLICY lab_order_items_select ON lab_order_items FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_order_items.lab_order_id
                AND (is_staff_of(lo.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = lo.pet_id AND pets.owner_id = auth.uid())))
    );

CREATE POLICY lab_order_items_insert ON lab_order_items FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_order_items.lab_order_id AND is_staff_of(lo.tenant_id))
    );

-- Lab Results
CREATE POLICY lab_results_select ON lab_results FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_results.lab_order_id
                AND (is_staff_of(lo.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = lo.pet_id AND pets.owner_id = auth.uid())))
    );

CREATE POLICY lab_results_insert ON lab_results FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_results.lab_order_id AND is_staff_of(lo.tenant_id))
    );

CREATE POLICY lab_results_update ON lab_results FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_results.lab_order_id AND is_staff_of(lo.tenant_id))
    );

-- Attachments and Comments
CREATE POLICY lab_attachments_select ON lab_result_attachments FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_result_attachments.lab_order_id
                AND (is_staff_of(lo.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = lo.pet_id AND pets.owner_id = auth.uid())))
    );

CREATE POLICY lab_attachments_insert ON lab_result_attachments FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_result_attachments.lab_order_id AND is_staff_of(lo.tenant_id))
    );

CREATE POLICY lab_comments_select ON lab_result_comments FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_result_comments.lab_order_id
                AND (is_staff_of(lo.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = lo.pet_id AND pets.owner_id = auth.uid())))
    );

CREATE POLICY lab_comments_insert ON lab_result_comments FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_result_comments.lab_order_id AND is_staff_of(lo.tenant_id))
    );

-- External Lab Integrations: Staff only
CREATE POLICY external_lab_integrations_all ON external_lab_integrations FOR ALL TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

-- =============================================================================
-- N. SEED COMMON LAB TESTS
-- =============================================================================

INSERT INTO lab_test_catalog (tenant_id, code, name, category, specimen_type, is_in_house) VALUES
    (NULL, 'CBC', 'Complete Blood Count', 'hematology', 'EDTA blood', TRUE),
    (NULL, 'CHEM10', 'Chemistry Panel 10', 'chemistry', 'Serum', TRUE),
    (NULL, 'UA', 'Urinalysis', 'urinalysis', 'Urine', TRUE),
    (NULL, 'FT4', 'Free T4', 'endocrinology', 'Serum', FALSE),
    (NULL, 'TSH', 'Thyroid Stimulating Hormone', 'endocrinology', 'Serum', FALSE),
    (NULL, 'CORT', 'Cortisol', 'endocrinology', 'Serum', FALSE),
    (NULL, 'PARVO', 'Parvovirus Antigen', 'serology', 'Feces', TRUE),
    (NULL, 'FIV-FELV', 'FIV/FeLV Combo', 'serology', 'Whole blood', TRUE),
    (NULL, 'HW', 'Heartworm Antigen', 'serology', 'Whole blood', TRUE),
    (NULL, 'FECAL', 'Fecal Float', 'parasitology', 'Feces', TRUE),
    (NULL, 'CYTO', 'Cytology', 'cytology', 'Aspirate/Swab', FALSE),
    (NULL, 'HISTO', 'Histopathology', 'histopathology', 'Tissue', FALSE),
    (NULL, 'CULTURE', 'Bacterial Culture & Sensitivity', 'microbiology', 'Swab', FALSE),
    (NULL, 'PT-PTT', 'Coagulation Panel', 'coagulation', 'Citrate blood', FALSE),
    (NULL, 'LIPA', 'Lipase', 'chemistry', 'Serum', TRUE),
    (NULL, 'AMYL', 'Amylase', 'chemistry', 'Serum', TRUE),
    (NULL, 'BILE', 'Bile Acids', 'chemistry', 'Serum', FALSE),
    (NULL, 'LEPT', 'Leptospirosis Antibody', 'serology', 'Serum', FALSE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- LAB RESULTS SCHEMA COMPLETE
-- =============================================================================
