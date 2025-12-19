-- =============================================================================
-- 28_SCHEMA_INSURANCE.SQL
-- =============================================================================
-- Pet insurance and claims management for veterinary clinics.
-- Includes policies, claims, pre-authorizations, and EOB handling.
-- =============================================================================

-- =============================================================================
-- A. INSURANCE PROVIDERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_providers (
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
    supports_electronic_claims BOOLEAN DEFAULT FALSE,
    supports_pre_auth BOOLEAN DEFAULT FALSE,
    provider_portal_url TEXT,

    -- Claim settings
    claim_submission_method TEXT DEFAULT 'manual' CHECK (claim_submission_method IN (
        'manual', 'email', 'fax', 'portal', 'api'
    )),
    typical_processing_days INTEGER DEFAULT 14,
    requires_itemized_invoice BOOLEAN DEFAULT TRUE,
    requires_medical_records BOOLEAN DEFAULT TRUE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- B. PET INSURANCE POLICIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS pet_insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES insurance_providers(id) ON DELETE RESTRICT,

    -- Policy info
    policy_number TEXT NOT NULL,
    group_number TEXT,
    member_id TEXT,

    -- Policyholder (may differ from pet owner)
    policyholder_name TEXT NOT NULL,
    policyholder_phone TEXT,
    policyholder_email TEXT,
    policyholder_address TEXT,

    -- Coverage dates
    effective_date DATE NOT NULL,
    expiration_date DATE,
    enrollment_date DATE,

    -- Plan details
    plan_name TEXT,
    plan_type TEXT CHECK (plan_type IN (
        'accident_only', 'accident_illness', 'comprehensive', 'wellness', 'custom'
    )),

    -- Coverage limits
    annual_limit DECIMAL(12,2),
    per_incident_limit DECIMAL(12,2),
    lifetime_limit DECIMAL(12,2),
    deductible_amount DECIMAL(12,2),
    deductible_type TEXT DEFAULT 'annual' CHECK (deductible_type IN ('annual', 'per_incident', 'per_condition')),
    coinsurance_percentage DECIMAL(5,2), -- % clinic is paid (e.g., 80%)
    copay_amount DECIMAL(12,2),

    -- Waiting periods (in days)
    accident_waiting_period INTEGER DEFAULT 0,
    illness_waiting_period INTEGER DEFAULT 14,
    orthopedic_waiting_period INTEGER DEFAULT 180,

    -- Exclusions and notes
    pre_existing_conditions TEXT[],
    excluded_conditions TEXT[],
    coverage_notes TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'pending', 'active', 'expired', 'cancelled', 'suspended'
    )),

    -- Verification
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Document
    policy_document_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(provider_id, policy_number)
);

-- =============================================================================
-- C. INSURANCE CLAIMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES pet_insurance_policies(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Claim info
    claim_number TEXT, -- Our internal number
    provider_claim_number TEXT, -- Insurance company's number

    -- Related entities
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,

    -- Claim details
    claim_type TEXT NOT NULL CHECK (claim_type IN (
        'accident', 'illness', 'wellness', 'preventive', 'emergency', 'surgery', 'hospitalization'
    )),
    date_of_service DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    diagnosis_code TEXT,
    treatment_description TEXT NOT NULL,

    -- Amounts
    total_charges DECIMAL(12,2) NOT NULL,
    claimed_amount DECIMAL(12,2) NOT NULL,
    deductible_applied DECIMAL(12,2) DEFAULT 0,
    coinsurance_amount DECIMAL(12,2) DEFAULT 0,
    approved_amount DECIMAL(12,2),
    paid_amount DECIMAL(12,2),
    adjustment_amount DECIMAL(12,2) DEFAULT 0,
    adjustment_reason TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_documents', 'submitted', 'under_review',
        'approved', 'partially_approved', 'denied', 'paid', 'appealed', 'closed'
    )),

    -- Dates
    submitted_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,

    -- Submission
    submission_method TEXT CHECK (submission_method IN ('email', 'fax', 'portal', 'api', 'mail')),
    confirmation_number TEXT,

    -- Payment
    payment_method TEXT CHECK (payment_method IN ('check', 'eft', 'credit')),
    payment_reference TEXT,
    payment_to TEXT CHECK (payment_to IN ('clinic', 'policyholder')),

    -- Denial
    denial_reason TEXT,
    denial_code TEXT,
    can_appeal BOOLEAN DEFAULT TRUE,
    appeal_deadline DATE,

    -- Staff handling
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    internal_notes TEXT,
    provider_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. CLAIM LINE ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claim_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,

    -- Item details
    service_date DATE NOT NULL,
    service_code TEXT, -- CPT/procedure code if applicable
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,

    -- Approval
    approved_amount DECIMAL(12,2),
    denial_reason TEXT,

    -- Related
    invoice_item_id UUID REFERENCES invoice_items(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- E. PRE-AUTHORIZATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_pre_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES pet_insurance_policies(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Pre-auth info
    pre_auth_number TEXT,
    provider_reference TEXT,

    -- Requested procedure
    procedure_description TEXT NOT NULL,
    procedure_code TEXT,
    diagnosis TEXT NOT NULL,
    estimated_cost DECIMAL(12,2) NOT NULL,
    planned_date DATE,

    -- Medical justification
    clinical_justification TEXT NOT NULL,
    supporting_documents TEXT[],

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'draft', 'submitted', 'pending', 'approved', 'denied', 'expired', 'cancelled'
    )),

    -- Approval details
    approved_amount DECIMAL(12,2),
    approved_procedures TEXT[],
    conditions TEXT,
    valid_from DATE,
    valid_until DATE,

    -- Denial
    denial_reason TEXT,

    -- Dates
    submitted_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,

    -- Staff
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- F. CLAIM DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claim_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES insurance_claims(id) ON DELETE CASCADE,
    pre_auth_id UUID REFERENCES insurance_pre_authorizations(id) ON DELETE CASCADE,

    -- Document info
    document_type TEXT NOT NULL CHECK (document_type IN (
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
    sent_to_insurance BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,

    -- Who
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT claim_or_preauth CHECK (claim_id IS NOT NULL OR pre_auth_id IS NOT NULL)
);

-- =============================================================================
-- G. CLAIM COMMUNICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claim_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,

    -- Communication details
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    channel TEXT NOT NULL CHECK (channel IN ('phone', 'email', 'fax', 'portal', 'mail')),

    -- Content
    subject TEXT,
    content TEXT NOT NULL,
    attachments TEXT[],

    -- Contact
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    reference_number TEXT,

    -- Who
    staff_member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Follow-up
    requires_follow_up BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- H. EXPLANATION OF BENEFITS (EOB)
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_eob (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,

    -- EOB info
    eob_number TEXT,
    eob_date DATE NOT NULL,

    -- Amounts
    billed_amount DECIMAL(12,2) NOT NULL,
    allowed_amount DECIMAL(12,2),
    deductible_amount DECIMAL(12,2),
    coinsurance_amount DECIMAL(12,2),
    copay_amount DECIMAL(12,2),
    other_adjustments DECIMAL(12,2),
    paid_amount DECIMAL(12,2) NOT NULL,
    patient_responsibility DECIMAL(12,2),

    -- Details
    adjustment_codes TEXT[],
    remark_codes TEXT[],
    denial_codes TEXT[],
    notes TEXT,

    -- Document
    eob_document_url TEXT,

    -- Processing
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- I. INSURANCE STATISTICS (For reporting)
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claim_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Counts
    claims_submitted INTEGER DEFAULT 0,
    claims_approved INTEGER DEFAULT 0,
    claims_denied INTEGER DEFAULT 0,
    claims_pending INTEGER DEFAULT 0,

    -- Amounts
    total_submitted DECIMAL(12,2) DEFAULT 0,
    total_approved DECIMAL(12,2) DEFAULT 0,
    total_paid DECIMAL(12,2) DEFAULT 0,
    total_denied DECIMAL(12,2) DEFAULT 0,

    -- Performance
    avg_processing_days DECIMAL(5,1),
    approval_rate DECIMAL(5,2),

    -- Common denials
    top_denial_reasons JSONB DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, provider_id, period_start, period_end)
);

-- =============================================================================
-- J. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_insurance_providers_code ON insurance_providers(code);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_active ON insurance_providers(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_tenant ON pet_insurance_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_pet ON pet_insurance_policies(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_provider ON pet_insurance_policies(provider_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_status ON pet_insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_number ON pet_insurance_policies(policy_number);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_tenant ON insurance_claims(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_pet ON insurance_claims(pet_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_invoice ON insurance_claims(invoice_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_submitted ON insurance_claims(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_insurance_claim_items_claim ON insurance_claim_items(claim_id);

CREATE INDEX IF NOT EXISTS idx_insurance_pre_auth_tenant ON insurance_pre_authorizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_pre_auth_policy ON insurance_pre_authorizations(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_pre_auth_status ON insurance_pre_authorizations(status);

CREATE INDEX IF NOT EXISTS idx_insurance_claim_docs_claim ON insurance_claim_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claim_docs_preauth ON insurance_claim_documents(pre_auth_id);

CREATE INDEX IF NOT EXISTS idx_insurance_claim_comms_claim ON insurance_claim_communications(claim_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claim_comms_followup ON insurance_claim_communications(follow_up_date)
    WHERE requires_follow_up = TRUE AND follow_up_completed = FALSE;

CREATE INDEX IF NOT EXISTS idx_insurance_eob_claim ON insurance_eob(claim_id);

CREATE INDEX IF NOT EXISTS idx_insurance_stats_tenant ON insurance_claim_stats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_stats_provider ON insurance_claim_stats(provider_id);

-- =============================================================================
-- K. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_insurance_providers_updated_at
    BEFORE UPDATE ON insurance_providers
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_pet_insurance_policies_updated_at
    BEFORE UPDATE ON pet_insurance_policies
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_insurance_claims_updated_at
    BEFORE UPDATE ON insurance_claims
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_insurance_pre_auth_updated_at
    BEFORE UPDATE ON insurance_pre_authorizations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_insurance_stats_updated_at
    BEFORE UPDATE ON insurance_claim_stats
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- L. FUNCTIONS
-- =============================================================================

-- Generate claim number
CREATE OR REPLACE FUNCTION generate_claim_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
BEGIN
    v_prefix := 'CLM';
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(claim_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM insurance_claims
    WHERE tenant_id = p_tenant_id
      AND claim_number LIKE v_prefix || v_year || '%';

    RETURN v_prefix || v_year || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Calculate claim totals
CREATE OR REPLACE FUNCTION calculate_claim_totals(p_claim_id UUID)
RETURNS TABLE (
    total_charges DECIMAL,
    total_approved DECIMAL,
    patient_responsibility DECIMAL
) AS $$
DECLARE
    v_claim insurance_claims%ROWTYPE;
BEGIN
    SELECT * INTO v_claim FROM insurance_claims WHERE id = p_claim_id;

    RETURN QUERY
    SELECT
        COALESCE(SUM(total_price), 0)::DECIMAL,
        COALESCE(SUM(approved_amount), 0)::DECIMAL,
        (COALESCE(SUM(total_price), 0) - COALESCE(SUM(approved_amount), 0) +
         v_claim.deductible_applied + v_claim.coinsurance_amount)::DECIMAL
    FROM insurance_claim_items
    WHERE claim_id = p_claim_id;
END;
$$ LANGUAGE plpgsql;

-- Check if pet has active insurance
CREATE OR REPLACE FUNCTION get_pet_active_insurance(p_pet_id UUID)
RETURNS TABLE (
    policy_id UUID,
    provider_name TEXT,
    policy_number TEXT,
    plan_name TEXT,
    annual_limit DECIMAL,
    deductible DECIMAL,
    coinsurance DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pip.id,
        ip.name,
        pip.policy_number,
        pip.plan_name,
        pip.annual_limit,
        pip.deductible_amount,
        pip.coinsurance_percentage
    FROM pet_insurance_policies pip
    JOIN insurance_providers ip ON pip.provider_id = ip.id
    WHERE pip.pet_id = p_pet_id
      AND pip.status = 'active'
      AND (pip.expiration_date IS NULL OR pip.expiration_date >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Get claims summary for a policy
CREATE OR REPLACE FUNCTION get_policy_claims_summary(p_policy_id UUID)
RETURNS TABLE (
    total_claims INTEGER,
    total_submitted DECIMAL,
    total_approved DECIMAL,
    total_paid DECIMAL,
    ytd_deductible_met DECIMAL,
    pending_claims INTEGER
) AS $$
DECLARE
    v_year INTEGER;
BEGIN
    v_year := EXTRACT(YEAR FROM CURRENT_DATE);

    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER,
        COALESCE(SUM(claimed_amount), 0)::DECIMAL,
        COALESCE(SUM(approved_amount), 0)::DECIMAL,
        COALESCE(SUM(paid_amount), 0)::DECIMAL,
        COALESCE(SUM(deductible_applied) FILTER (WHERE EXTRACT(YEAR FROM date_of_service) = v_year), 0)::DECIMAL,
        COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review', 'pending_documents'))::INTEGER
    FROM insurance_claims
    WHERE policy_id = p_policy_id;
END;
$$ LANGUAGE plpgsql;

-- Update claim status and trigger appropriate actions
CREATE OR REPLACE FUNCTION update_claim_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Set timestamps based on status changes
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'submitted' THEN
                NEW.submitted_at := COALESCE(NEW.submitted_at, NOW());
            WHEN 'approved', 'partially_approved', 'denied' THEN
                NEW.processed_at := COALESCE(NEW.processed_at, NOW());
            WHEN 'paid' THEN
                NEW.paid_at := COALESCE(NEW.paid_at, NOW());
            WHEN 'closed' THEN
                NEW.closed_at := COALESCE(NEW.closed_at, NOW());
            ELSE
                -- No action needed
        END CASE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insurance_claim_status_update
    BEFORE UPDATE ON insurance_claims
    FOR EACH ROW EXECUTE FUNCTION update_claim_status();

-- =============================================================================
-- M. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claim_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_pre_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claim_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_eob ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claim_stats ENABLE ROW LEVEL SECURITY;

-- Insurance Providers: Public read
CREATE POLICY insurance_providers_select ON insurance_providers FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY insurance_providers_insert ON insurance_providers FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY insurance_providers_update ON insurance_providers FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Pet Insurance Policies: Staff and pet owners
CREATE POLICY pet_insurance_policies_select_staff ON pet_insurance_policies FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY pet_insurance_policies_select_owner ON pet_insurance_policies FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_insurance_policies.pet_id AND pets.owner_id = auth.uid()));

CREATE POLICY pet_insurance_policies_insert ON pet_insurance_policies FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY pet_insurance_policies_update ON pet_insurance_policies FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Insurance Claims: Staff manage, owners view
CREATE POLICY insurance_claims_select_staff ON insurance_claims FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY insurance_claims_select_owner ON insurance_claims FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = insurance_claims.pet_id AND pets.owner_id = auth.uid()));

CREATE POLICY insurance_claims_insert ON insurance_claims FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY insurance_claims_update ON insurance_claims FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Claim Items
CREATE POLICY insurance_claim_items_select ON insurance_claim_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_claim_items.claim_id
           AND (is_staff_of(ic.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = ic.pet_id AND pets.owner_id = auth.uid()))));

CREATE POLICY insurance_claim_items_insert ON insurance_claim_items FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_claim_items.claim_id AND is_staff_of(ic.tenant_id)));

-- Pre-authorizations: Staff only
CREATE POLICY insurance_pre_auth_select ON insurance_pre_authorizations FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY insurance_pre_auth_insert ON insurance_pre_authorizations FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY insurance_pre_auth_update ON insurance_pre_authorizations FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Documents, Communications, EOB: Staff only
CREATE POLICY insurance_claim_docs_all ON insurance_claim_documents FOR ALL TO authenticated
    USING (
        (claim_id IS NOT NULL AND EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_claim_documents.claim_id AND is_staff_of(ic.tenant_id)))
        OR
        (pre_auth_id IS NOT NULL AND EXISTS (SELECT 1 FROM insurance_pre_authorizations pa WHERE pa.id = insurance_claim_documents.pre_auth_id AND is_staff_of(pa.tenant_id)))
    );

CREATE POLICY insurance_claim_comms_all ON insurance_claim_communications FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_claim_communications.claim_id AND is_staff_of(ic.tenant_id)));

CREATE POLICY insurance_eob_all ON insurance_eob FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_eob.claim_id AND is_staff_of(ic.tenant_id)));

-- Stats: Staff only
CREATE POLICY insurance_stats_select ON insurance_claim_stats FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

-- =============================================================================
-- N. SEED INSURANCE PROVIDERS
-- =============================================================================

INSERT INTO insurance_providers (code, name, website, supports_electronic_claims, typical_processing_days) VALUES
    ('PETPLAN', 'Petplan', 'https://www.petplan.com', FALSE, 14),
    ('EMBRACE', 'Embrace Pet Insurance', 'https://www.embracepetinsurance.com', FALSE, 10),
    ('NATIONWIDE', 'Nationwide Pet Insurance', 'https://www.petinsurance.com', FALSE, 14),
    ('TRUPANION', 'Trupanion', 'https://www.trupanion.com', TRUE, 5),
    ('HEALTHY_PAWS', 'Healthy Paws', 'https://www.healthypawspetinsurance.com', FALSE, 7),
    ('FIGO', 'Figo Pet Insurance', 'https://www.figopetinsurance.com', FALSE, 10),
    ('ASPCA', 'ASPCA Pet Health Insurance', 'https://www.aspcapetinsurance.com', FALSE, 14),
    ('OTHER', 'Other Provider', NULL, FALSE, 21)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- INSURANCE SCHEMA COMPLETE
-- =============================================================================
