-- =============================================================================
-- 80_INSURANCE.SQL
-- =============================================================================
-- Pet insurance and claims management.
--
-- Dependencies: 10_core/*, 20_pets/*
-- =============================================================================

-- =============================================================================
-- A. INSURANCE PROVIDERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.insurance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Provider info
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    website TEXT,

    -- Contact
    claims_phone TEXT,
    claims_email TEXT,
    claims_fax TEXT,
    claims_address TEXT,

    -- Integration
    api_endpoint TEXT,
    supports_electronic_claims BOOLEAN DEFAULT false,
    supports_pre_auth BOOLEAN DEFAULT false,

    -- Settings
    claim_submission_method TEXT DEFAULT 'manual'
        CHECK (claim_submission_method IN ('manual', 'email', 'fax', 'portal', 'api')),
    typical_processing_days INTEGER DEFAULT 14,
    requires_itemized_invoice BOOLEAN DEFAULT true,

    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. PET INSURANCE POLICIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    pet_id UUID NOT NULL REFERENCES public.pets(id),
    provider_id UUID NOT NULL REFERENCES public.insurance_providers(id),

    -- Policy info
    policy_number TEXT NOT NULL,
    group_number TEXT,
    member_id TEXT,

    -- Policyholder
    policyholder_name TEXT NOT NULL,
    policyholder_phone TEXT,
    policyholder_email TEXT,

    -- Coverage dates
    effective_date DATE NOT NULL,
    expiration_date DATE,

    -- Plan details
    plan_name TEXT,
    plan_type TEXT
        CHECK (plan_type IN ('accident_only', 'accident_illness', 'comprehensive', 'wellness', 'custom')),

    -- Coverage limits
    annual_limit NUMERIC(12,2),
    per_incident_limit NUMERIC(12,2),
    deductible_amount NUMERIC(12,2),
    deductible_type TEXT DEFAULT 'annual'
        CHECK (deductible_type IN ('annual', 'per_incident', 'per_condition')),
    coinsurance_percentage NUMERIC(5,2),

    -- Exclusions
    pre_existing_conditions TEXT[],
    excluded_conditions TEXT[],
    coverage_notes TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'suspended')),

    -- Verification
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    policy_document_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(provider_id, policy_number)
);

-- =============================================================================
-- C. INSURANCE CLAIMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    policy_id UUID NOT NULL REFERENCES public.insurance_policies(id),
    pet_id UUID NOT NULL REFERENCES public.pets(id),

    -- Claim info
    claim_number TEXT,
    provider_claim_number TEXT,

    -- Related entities
    invoice_id UUID REFERENCES public.invoices(id),

    -- Claim details
    claim_type TEXT NOT NULL
        CHECK (claim_type IN ('accident', 'illness', 'wellness', 'preventive', 'emergency', 'surgery', 'hospitalization')),
    date_of_service DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    diagnosis_code TEXT,
    treatment_description TEXT NOT NULL,

    -- Amounts
    total_charges NUMERIC(12,2) NOT NULL,
    claimed_amount NUMERIC(12,2) NOT NULL,
    deductible_applied NUMERIC(12,2) DEFAULT 0,
    coinsurance_amount NUMERIC(12,2) DEFAULT 0,
    approved_amount NUMERIC(12,2),
    paid_amount NUMERIC(12,2),

    -- Status
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft', 'pending_documents', 'submitted', 'under_review',
            'approved', 'partially_approved', 'denied', 'paid', 'appealed', 'closed'
        )),

    -- Dates
    submitted_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,

    -- Submission
    submission_method TEXT
        CHECK (submission_method IN ('email', 'fax', 'portal', 'api', 'mail')),
    confirmation_number TEXT,

    -- Payment
    payment_method TEXT
        CHECK (payment_method IN ('check', 'eft', 'credit')),
    payment_reference TEXT,
    payment_to TEXT
        CHECK (payment_to IN ('clinic', 'policyholder')),

    -- Denial
    denial_reason TEXT,
    denial_code TEXT,
    can_appeal BOOLEAN DEFAULT true,
    appeal_deadline DATE,

    -- Staff
    submitted_by UUID REFERENCES public.profiles(id),

    -- Notes
    internal_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. CLAIM LINE ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.insurance_claim_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.insurance_claims(id) ON DELETE CASCADE,

    -- Item details
    service_date DATE NOT NULL,
    service_code TEXT,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,

    -- Approval
    approved_amount NUMERIC(12,2),
    denial_reason TEXT,

    -- Related
    invoice_item_id UUID REFERENCES public.invoice_items(id),
    service_id UUID REFERENCES public.services(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. CLAIM DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.insurance_claim_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.insurance_claims(id) ON DELETE CASCADE,

    -- Document info
    document_type TEXT NOT NULL
        CHECK (document_type IN (
            'invoice', 'itemized_statement', 'medical_record', 'lab_result',
            'imaging', 'prescription', 'referral', 'consent', 'eob', 'other'
        )),
    title TEXT NOT NULL,
    description TEXT,

    -- File
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes INTEGER,

    -- Status
    sent_to_insurance BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,

    -- Uploaded by
    uploaded_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claim_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claim_documents ENABLE ROW LEVEL SECURITY;

-- Providers: Public read
CREATE POLICY "Public read providers" ON public.insurance_providers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role manage providers" ON public.insurance_providers
    FOR ALL TO service_role USING (true);

-- Policies: Staff manage, owners view own
CREATE POLICY "Staff manage policies" ON public.insurance_policies
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Owners view pet policies" ON public.insurance_policies
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id));

-- Claims: Staff manage, owners view
CREATE POLICY "Staff manage claims" ON public.insurance_claims
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Owners view pet claims" ON public.insurance_claims
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id));

-- Claim items: Via claim policy
CREATE POLICY "Access claim items via claim" ON public.insurance_claim_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.insurance_claims c
            WHERE c.id = insurance_claim_items.claim_id
            AND public.is_staff_of(c.tenant_id)
        )
    );

-- Claim documents: Staff only
CREATE POLICY "Staff manage claim documents" ON public.insurance_claim_documents
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.insurance_claims c
            WHERE c.id = insurance_claim_documents.claim_id
            AND public.is_staff_of(c.tenant_id)
        )
    );

-- =============================================================================
-- G. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_insurance_providers_code ON public.insurance_providers(code);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_active ON public.insurance_providers(is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_insurance_policies_tenant ON public.insurance_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_pet ON public.insurance_policies(pet_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_provider ON public.insurance_policies(provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON public.insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_active ON public.insurance_policies(status)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_insurance_claims_tenant ON public.insurance_claims(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON public.insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_pet ON public.insurance_claims(pet_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_submitted ON public.insurance_claims(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_insurance_claim_items_claim ON public.insurance_claim_items(claim_id);

CREATE INDEX IF NOT EXISTS idx_insurance_claim_docs_claim ON public.insurance_claim_documents(claim_id);

-- =============================================================================
-- H. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.insurance_providers;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.insurance_providers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.insurance_policies;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.insurance_policies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.insurance_claims;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.insurance_claims
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- I. FUNCTIONS
-- =============================================================================

-- Generate claim number
CREATE OR REPLACE FUNCTION public.generate_claim_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_sequence INTEGER;
    v_year TEXT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(claim_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM public.insurance_claims
    WHERE tenant_id = p_tenant_id
      AND claim_number LIKE 'CLM' || v_year || '%';

    RETURN 'CLM' || v_year || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Check if pet has active insurance
CREATE OR REPLACE FUNCTION public.get_pet_active_insurance(p_pet_id UUID)
RETURNS TABLE (
    policy_id UUID,
    provider_name TEXT,
    policy_number TEXT,
    plan_name TEXT,
    annual_limit NUMERIC,
    deductible NUMERIC,
    coinsurance NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ip.id,
        pr.name,
        ip.policy_number,
        ip.plan_name,
        ip.annual_limit,
        ip.deductible_amount,
        ip.coinsurance_percentage
    FROM public.insurance_policies ip
    JOIN public.insurance_providers pr ON ip.provider_id = pr.id
    WHERE ip.pet_id = p_pet_id
      AND ip.status = 'active'
      AND (ip.expiration_date IS NULL OR ip.expiration_date >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- J. SEED DATA
-- =============================================================================

-- Insurance providers
INSERT INTO public.insurance_providers (code, name, website, supports_electronic_claims, typical_processing_days) VALUES
    ('PETPLAN', 'Petplan', 'https://www.petplan.com', false, 14),
    ('EMBRACE', 'Embrace Pet Insurance', 'https://www.embracepetinsurance.com', false, 10),
    ('NATIONWIDE', 'Nationwide Pet Insurance', 'https://www.petinsurance.com', false, 14),
    ('TRUPANION', 'Trupanion', 'https://www.trupanion.com', true, 5),
    ('HEALTHY_PAWS', 'Healthy Paws', 'https://www.healthypawspetinsurance.com', false, 7),
    ('OTHER', 'Otro Proveedor', NULL, false, 21)
ON CONFLICT (code) DO NOTHING;

