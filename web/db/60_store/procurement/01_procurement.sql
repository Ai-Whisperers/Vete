-- =============================================================================
-- 01_PROCUREMENT.SQL
-- =============================================================================
-- B2B procurement intelligence and clinic product assignments
--
-- DEPENDENCIES: 10_core/01_tenants.sql, 10_core/02_profiles.sql,
--               60_store/suppliers/01_suppliers.sql, 60_store/categories/01_categories.sql,
--               60_store/brands/01_brands.sql, 60_store/products/01_products.sql
-- =============================================================================

-- =============================================================================
-- PROCUREMENT LEADS (B2B Market Intelligence)
-- =============================================================================
-- Captures competitor data when clinics import their purchase history.
-- Used for market analysis, price intelligence, and product discovery.
-- This is the "we learn from what you buy" layer.

CREATE TABLE IF NOT EXISTS public.procurement_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Source tenant (who uploaded this data)
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Raw data (as imported, before matching)
    raw_product_name TEXT NOT NULL,
    raw_brand_name TEXT,
    raw_supplier_name TEXT,
    raw_price_paid NUMERIC(12,2),
    raw_quantity NUMERIC(12,2),
    raw_unit TEXT,
    raw_invoice_date DATE,
    raw_data JSONB,                               -- Original row data for reference

    -- Matched entities (after processing)
    matched_product_id UUID REFERENCES public.store_products(id),
    matched_brand_id UUID REFERENCES public.store_brands(id),
    matched_supplier_id UUID REFERENCES public.suppliers(id),
    matched_category_id UUID REFERENCES public.store_categories(id),

    -- Processing status
    status TEXT DEFAULT 'new'
        CHECK (status IN ('new', 'processing', 'matched', 'unmatched', 'ignored', 'converted')),

    -- Match confidence (0-100)
    match_confidence INTEGER CHECK (match_confidence IS NULL OR match_confidence BETWEEN 0 AND 100),

    -- Conversion tracking (when we create a catalog product from this lead)
    converted_product_id UUID REFERENCES public.store_products(id),
    converted_at TIMESTAMPTZ,
    converted_by UUID REFERENCES public.profiles(id),

    -- Intelligence flags
    is_new_product BOOLEAN DEFAULT false,         -- Product not in our catalog
    is_new_brand BOOLEAN DEFAULT false,           -- Brand not in our catalog
    is_new_supplier BOOLEAN DEFAULT false,        -- Supplier not in our catalog
    price_variance NUMERIC(5,2),                  -- % difference from catalog price

    -- Detection metadata
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.procurement_leads IS 'B2B market intelligence: captured competitor/supplier data from clinic imports';
COMMENT ON COLUMN public.procurement_leads.status IS 'Processing status: new, processing, matched, unmatched, ignored, converted';
COMMENT ON COLUMN public.procurement_leads.match_confidence IS 'Auto-matching confidence 0-100%';
COMMENT ON COLUMN public.procurement_leads.is_new_product IS 'TRUE if product not found in global catalog (market opportunity)';
COMMENT ON COLUMN public.procurement_leads.price_variance IS 'Percentage difference from catalog price (negative = cheaper elsewhere)';

-- =============================================================================
-- CLINIC PRODUCT ASSIGNMENTS (Link global products to clinics)
-- =============================================================================
-- When a clinic wants to use a global catalog product, they create an assignment
-- with their own pricing, stock levels, and location.

CREATE TABLE IF NOT EXISTS public.clinic_product_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Reference to global catalog product
    catalog_product_id UUID NOT NULL REFERENCES public.store_products(id),

    -- Clinic-specific settings
    sale_price NUMERIC(12,2) NOT NULL,            -- What THIS clinic charges
    min_stock_level NUMERIC(12,2) DEFAULT 0,
    location TEXT,                                -- Storage location in clinic
    requires_prescription BOOLEAN DEFAULT false,  -- Clinic can override

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Created by
    created_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, catalog_product_id)
);

COMMENT ON TABLE public.clinic_product_assignments IS 'Links global catalog products to clinics with clinic-specific pricing and settings';
COMMENT ON COLUMN public.clinic_product_assignments.catalog_product_id IS 'Reference to global catalog product';
COMMENT ON COLUMN public.clinic_product_assignments.sale_price IS 'Clinic-specific selling price (may differ from catalog)';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Procurement leads indexes
CREATE INDEX IF NOT EXISTS idx_procurement_leads_tenant ON public.procurement_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_procurement_leads_status ON public.procurement_leads(status);
CREATE INDEX IF NOT EXISTS idx_procurement_leads_matched_product ON public.procurement_leads(matched_product_id);
CREATE INDEX IF NOT EXISTS idx_procurement_leads_confidence ON public.procurement_leads(match_confidence);
CREATE INDEX IF NOT EXISTS idx_procurement_leads_new_flags ON public.procurement_leads(is_new_product, is_new_brand, is_new_supplier)
    WHERE is_new_product = true OR is_new_brand = true OR is_new_supplier = true;

-- Clinic product assignments indexes
CREATE INDEX IF NOT EXISTS idx_clinic_product_assignments_tenant ON public.clinic_product_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clinic_product_assignments_catalog ON public.clinic_product_assignments(catalog_product_id);
CREATE INDEX IF NOT EXISTS idx_clinic_product_assignments_active ON public.clinic_product_assignments(tenant_id, is_active)
    WHERE is_active = true;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE public.procurement_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_product_assignments ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS "Service role full access procurement" ON public.procurement_leads;
CREATE POLICY "Service role full access procurement" ON public.procurement_leads
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access assignments" ON public.clinic_product_assignments;
CREATE POLICY "Service role full access assignments" ON public.clinic_product_assignments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Clinic staff can manage their clinic's procurement data and product assignments
DROP POLICY IF EXISTS "Clinic staff manage procurement" ON public.procurement_leads;
CREATE POLICY "Clinic staff manage procurement" ON public.procurement_leads
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = procurement_leads.tenant_id
            AND p.role IN ('vet', 'admin')
            AND p.deleted_at IS NULL
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = procurement_leads.tenant_id
            AND p.role IN ('vet', 'admin')
            AND p.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Clinic staff manage assignments" ON public.clinic_product_assignments;
CREATE POLICY "Clinic staff manage assignments" ON public.clinic_product_assignments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = clinic_product_assignments.tenant_id
            AND p.role IN ('vet', 'admin')
            AND p.deleted_at IS NULL
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = clinic_product_assignments.tenant_id
            AND p.role IN ('vet', 'admin')
            AND p.deleted_at IS NULL
        )
    );

-- Platform admins can view all procurement intelligence
DROP POLICY IF EXISTS "Platform admins view procurement" ON public.procurement_leads;
CREATE POLICY "Platform admins view procurement" ON public.procurement_leads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
            AND p.tenant_id IS NULL
            AND p.deleted_at IS NULL
        )
    );

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated at triggers
DROP TRIGGER IF EXISTS handle_updated_at_procurement ON public.procurement_leads;
CREATE TRIGGER handle_updated_at_procurement
    BEFORE UPDATE ON public.procurement_leads
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_assignments ON public.clinic_product_assignments;
CREATE TRIGGER handle_updated_at_assignments
    BEFORE UPDATE ON public.clinic_product_assignments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
