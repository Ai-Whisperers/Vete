-- =============================================================================
-- 04_LAB.SQL
-- =============================================================================
-- Laboratory management: test catalog, orders, results.
-- ALL CHILD TABLES INCLUDE tenant_id FOR OPTIMIZED RLS.
-- =============================================================================

-- =============================================================================
-- LAB TEST CATALOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lab_test_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES public.tenants(id),  -- NULL = global

    -- Test info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,

    -- Pricing
    base_price NUMERIC(12,2) DEFAULT 0,

    -- Reference ranges (JSON for flexibility)
    reference_ranges JSONB DEFAULT '{}',
    -- Structure: {"dog": {"min": 5, "max": 15, "unit": "mg/dL"}, "cat": {...}}

    -- Settings
    turnaround_days INTEGER DEFAULT 1,
    requires_fasting BOOLEAN DEFAULT false,
    sample_type TEXT CHECK (sample_type IS NULL OR sample_type IN ('blood', 'serum', 'plasma', 'urine', 'feces', 'tissue', 'swab', 'other')),

    -- Status
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 100,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique per tenant/global
    UNIQUE(tenant_id, code)
);

-- Unique for global tests
CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_test_catalog_global_code
ON public.lab_test_catalog (code) WHERE tenant_id IS NULL AND deleted_at IS NULL;

-- =============================================================================
-- LAB PANELS (Test Groups)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lab_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES public.tenants(id),

    -- Panel info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Tests included (array of test IDs)
    test_ids UUID[] NOT NULL DEFAULT '{}',

    -- Pricing
    panel_price NUMERIC(12,2),  -- NULL = sum of individual tests

    -- Status
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 100,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- =============================================================================
-- LAB ORDERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Order number
    order_number TEXT NOT NULL,

    -- Relationships
    pet_id UUID NOT NULL REFERENCES public.pets(id),
    ordered_by UUID REFERENCES public.profiles(id),
    medical_record_id UUID REFERENCES public.medical_records(id),

    -- Order details
    priority TEXT DEFAULT 'routine'
        CHECK (priority IN ('stat', 'urgent', 'routine')),
    clinical_notes TEXT,
    fasting_confirmed BOOLEAN DEFAULT false,

    -- Lab type
    lab_type TEXT DEFAULT 'in_house'
        CHECK (lab_type IN ('in_house', 'reference_lab')),
    reference_lab_name TEXT,
    external_accession TEXT,

    -- Status workflow
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',      -- Order created
            'collected',    -- Sample collected
            'processing',   -- Being analyzed
            'completed',    -- Results ready
            'cancelled'     -- Order cancelled
        )),

    -- Status timestamps
    collected_at TIMESTAMPTZ,
    collected_by UUID REFERENCES public.profiles(id),
    processing_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, order_number)
);

-- =============================================================================
-- LAB ORDER ITEMS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lab_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    test_id UUID NOT NULL REFERENCES public.lab_test_catalog(id),

    -- Status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),

    -- Pricing at time of order
    price NUMERIC(12,2),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(lab_order_id, test_id)
);

-- =============================================================================
-- LAB RESULTS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    test_id UUID NOT NULL REFERENCES public.lab_test_catalog(id),

    -- Result
    value TEXT NOT NULL,
    numeric_value NUMERIC(12,4),
    unit TEXT,

    -- Reference range at time of result
    reference_min NUMERIC(12,4),
    reference_max NUMERIC(12,4),

    -- Flags
    flag TEXT CHECK (flag IS NULL OR flag IN ('low', 'normal', 'high', 'critical')),
    is_abnormal BOOLEAN DEFAULT false,

    -- Notes
    notes TEXT,

    -- Entered by
    entered_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(lab_order_id, test_id)
);

-- =============================================================================
-- LAB RESULT ATTACHMENTS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lab_result_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- File info
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes INTEGER,

    -- Metadata
    description TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- LAB RESULT COMMENTS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lab_result_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Comment
    comment TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.lab_test_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_result_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_result_comments ENABLE ROW LEVEL SECURITY;

-- Test catalog: Public read
DROP POLICY IF EXISTS "Public read lab tests" ON public.lab_test_catalog;
CREATE POLICY "Public read lab tests" ON public.lab_test_catalog
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Staff manage tenant tests" ON public.lab_test_catalog;
CREATE POLICY "Staff manage tenant tests" ON public.lab_test_catalog
    FOR ALL TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id))
    WITH CHECK (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access lab tests" ON public.lab_test_catalog;
CREATE POLICY "Service role full access lab tests" ON public.lab_test_catalog
    FOR ALL TO service_role USING (true);

-- Lab panels
DROP POLICY IF EXISTS "Public read lab panels" ON public.lab_panels;
CREATE POLICY "Public read lab panels" ON public.lab_panels
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Staff manage panels" ON public.lab_panels;
CREATE POLICY "Staff manage panels" ON public.lab_panels
    FOR ALL TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access panels" ON public.lab_panels;
CREATE POLICY "Service role full access panels" ON public.lab_panels
    FOR ALL TO service_role USING (true);

-- Lab orders: Staff manage, owners view completed
DROP POLICY IF EXISTS "Staff manage lab orders" ON public.lab_orders;
CREATE POLICY "Staff manage lab orders" ON public.lab_orders
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Owners view pet lab orders" ON public.lab_orders;
CREATE POLICY "Owners view pet lab orders" ON public.lab_orders
    FOR SELECT TO authenticated
    USING (
        public.is_owner_of_pet(pet_id)
        AND status = 'completed'
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Service role full access lab orders" ON public.lab_orders;
CREATE POLICY "Service role full access lab orders" ON public.lab_orders
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Lab order items uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage order items" ON public.lab_order_items;
CREATE POLICY "Staff manage order items" ON public.lab_order_items
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view order items" ON public.lab_order_items;
CREATE POLICY "Owners view order items" ON public.lab_order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.lab_orders lo
            WHERE lo.id = lab_order_items.lab_order_id
            AND public.is_owner_of_pet(lo.pet_id)
            AND lo.status = 'completed'
        )
    );

DROP POLICY IF EXISTS "Service role full access order items" ON public.lab_order_items;
CREATE POLICY "Service role full access order items" ON public.lab_order_items
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Lab results uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage results" ON public.lab_results;
CREATE POLICY "Staff manage results" ON public.lab_results
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view results" ON public.lab_results;
CREATE POLICY "Owners view results" ON public.lab_results
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.lab_orders lo
            WHERE lo.id = lab_results.lab_order_id
            AND public.is_owner_of_pet(lo.pet_id)
            AND lo.status = 'completed'
        )
    );

DROP POLICY IF EXISTS "Service role full access results" ON public.lab_results;
CREATE POLICY "Service role full access results" ON public.lab_results
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Attachments uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage attachments" ON public.lab_result_attachments;
CREATE POLICY "Staff manage attachments" ON public.lab_result_attachments
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view attachments" ON public.lab_result_attachments;
CREATE POLICY "Owners view attachments" ON public.lab_result_attachments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.lab_orders lo
            WHERE lo.id = lab_result_attachments.lab_order_id
            AND public.is_owner_of_pet(lo.pet_id)
            AND lo.status = 'completed'
        )
    );

DROP POLICY IF EXISTS "Service role full access attachments" ON public.lab_result_attachments;
CREATE POLICY "Service role full access attachments" ON public.lab_result_attachments
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Comments uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage comments" ON public.lab_result_comments;
CREATE POLICY "Staff manage comments" ON public.lab_result_comments
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access comments" ON public.lab_result_comments;
CREATE POLICY "Service role full access comments" ON public.lab_result_comments
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_tenant ON public.lab_test_catalog(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_category ON public.lab_test_catalog(category);
CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_active ON public.lab_test_catalog(is_active)
    WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lab_panels_tenant ON public.lab_panels(tenant_id);

CREATE INDEX IF NOT EXISTS idx_lab_orders_tenant ON public.lab_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_pet ON public.lab_orders(pet_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON public.lab_orders(status)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_orders_created_brin ON public.lab_orders
    USING BRIN(created_at) WITH (pages_per_range = 32);

CREATE INDEX IF NOT EXISTS idx_lab_order_items_order ON public.lab_order_items(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_order_items_tenant ON public.lab_order_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_order_items_test ON public.lab_order_items(test_id);

CREATE INDEX IF NOT EXISTS idx_lab_results_order ON public.lab_results(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_tenant ON public.lab_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_abnormal ON public.lab_results(is_abnormal)
    WHERE is_abnormal = true;

CREATE INDEX IF NOT EXISTS idx_lab_attachments_order ON public.lab_result_attachments(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_attachments_tenant ON public.lab_result_attachments(tenant_id);

CREATE INDEX IF NOT EXISTS idx_lab_comments_order ON public.lab_result_comments(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_comments_tenant ON public.lab_result_comments(tenant_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.lab_test_catalog;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.lab_test_catalog
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.lab_panels;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.lab_panels
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.lab_orders;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.lab_orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.lab_results;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.lab_results
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-set tenant_id for child tables
CREATE OR REPLACE FUNCTION public.lab_order_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        SELECT tenant_id INTO NEW.tenant_id
        FROM public.lab_orders
        WHERE id = NEW.lab_order_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lab_order_items_auto_tenant ON public.lab_order_items;
CREATE TRIGGER lab_order_items_auto_tenant
    BEFORE INSERT ON public.lab_order_items
    FOR EACH ROW EXECUTE FUNCTION public.lab_order_set_tenant_id();

DROP TRIGGER IF EXISTS lab_results_auto_tenant ON public.lab_results;
CREATE TRIGGER lab_results_auto_tenant
    BEFORE INSERT ON public.lab_results
    FOR EACH ROW EXECUTE FUNCTION public.lab_order_set_tenant_id();

DROP TRIGGER IF EXISTS lab_attachments_auto_tenant ON public.lab_result_attachments;
CREATE TRIGGER lab_attachments_auto_tenant
    BEFORE INSERT ON public.lab_result_attachments
    FOR EACH ROW EXECUTE FUNCTION public.lab_order_set_tenant_id();

DROP TRIGGER IF EXISTS lab_comments_auto_tenant ON public.lab_result_comments;
CREATE TRIGGER lab_comments_auto_tenant
    BEFORE INSERT ON public.lab_result_comments
    FOR EACH ROW EXECUTE FUNCTION public.lab_order_set_tenant_id();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- THREAD-SAFE lab order number generation
CREATE OR REPLACE FUNCTION public.generate_lab_order_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_number INTEGER;
    v_lock_id BIGINT;
BEGIN
    -- Create a unique lock ID from tenant_id hash + document type
    v_lock_id := ('x' || substr(md5(p_tenant_id || 'LAB'), 1, 8))::bit(32)::bigint;

    -- Acquire advisory lock
    PERFORM pg_advisory_xact_lock(v_lock_id);

    -- Get next number from sequences table
    INSERT INTO public.document_sequences (tenant_id, document_type, last_number, prefix)
    VALUES (p_tenant_id, 'lab_order', 1, 'LAB')
    ON CONFLICT (tenant_id, document_type) DO UPDATE
    SET last_number = public.document_sequences.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO v_number;

    RETURN 'LAB' || LPAD(v_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Global lab tests
INSERT INTO public.lab_test_catalog (tenant_id, code, name, category, sample_type, reference_ranges) VALUES
    (NULL, 'CBC', 'Complete Blood Count', 'Hematology', 'blood', '{}'),
    (NULL, 'CHEM10', 'Chemistry Panel 10', 'Chemistry', 'serum', '{}'),
    (NULL, 'UA', 'Urinalysis', 'Urine', 'urine', '{}'),
    (NULL, 'T4', 'Total T4', 'Endocrine', 'serum', '{}'),
    (NULL, 'FELV', 'FeLV Test', 'Infectious Disease', 'blood', '{}'),
    (NULL, 'FIV', 'FIV Test', 'Infectious Disease', 'blood', '{}'),
    (NULL, 'HW', 'Heartworm Test', 'Infectious Disease', 'blood', '{}'),
    (NULL, 'FECAL', 'Fecal Flotation', 'Parasitology', 'feces', '{}'),
    (NULL, 'LIPID', 'Lipid Panel', 'Chemistry', 'serum', '{}'),
    (NULL, 'COAG', 'Coagulation Panel', 'Hematology', 'blood', '{}')
ON CONFLICT DO NOTHING;

