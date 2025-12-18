-- =============================================================================
-- 33_MEDICAL_RECORDS.SQL
-- =============================================================================
-- Medical records and prescriptions.
--
-- Dependencies: 20_pets.sql, 30_reference_data.sql
-- =============================================================================

-- =============================================================================
-- A. MEDICAL RECORDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Relationships
    pet_id UUID NOT NULL REFERENCES public.pets(id),
    vet_id UUID REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),

    -- Record info
    record_number TEXT,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_type TEXT DEFAULT 'consultation'
        CHECK (record_type IN (
            'consultation', 'follow_up', 'emergency', 'surgery',
            'vaccination', 'checkup', 'dental', 'other'
        )),

    -- Chief complaint
    chief_complaint TEXT,

    -- Subjective (SOAP)
    subjective TEXT,
    history TEXT,

    -- Objective (SOAP)
    weight_kg NUMERIC(6,2),
    temperature NUMERIC(4,1),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    physical_exam_findings TEXT,

    -- Assessment (SOAP)
    diagnosis_codes TEXT[],
    diagnosis_text TEXT,
    assessment TEXT,

    -- Plan (SOAP)
    plan TEXT,
    treatment_notes TEXT,
    recommendations TEXT,

    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,

    -- Status
    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft', 'in_progress', 'completed', 'signed')),
    signed_at TIMESTAMPTZ,
    signed_by UUID REFERENCES public.profiles(id),

    -- Soft delete
    deleted_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique record number per tenant
    UNIQUE(tenant_id, record_number)
);

-- =============================================================================
-- B. PRESCRIPTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Relationships
    pet_id UUID NOT NULL REFERENCES public.pets(id),
    vet_id UUID NOT NULL REFERENCES public.profiles(id),
    medical_record_id UUID REFERENCES public.medical_records(id),

    -- Prescription number
    prescription_number TEXT NOT NULL,
    prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,

    -- Diagnosis
    diagnosis TEXT,

    -- Medications (JSONB for flexibility)
    medications JSONB NOT NULL DEFAULT '[]',
    -- Structure: [{"name": "...", "dose": "...", "frequency": "...", "duration": "...", "instructions": "..."}]

    -- Signature
    signature_url TEXT,
    signed_at TIMESTAMPTZ,

    -- PDF
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,

    -- Status
    status TEXT DEFAULT 'active'
        CHECK (status IN ('draft', 'active', 'dispensed', 'expired', 'cancelled')),

    -- Dispensing info
    dispensed_at TIMESTAMPTZ,
    dispensed_by UUID REFERENCES public.profiles(id),
    dispensing_notes TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, prescription_number)
);

-- =============================================================================
-- C. CONSENT TEMPLATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.consent_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES public.tenants(id),  -- NULL = global

    -- Template info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL
        CHECK (category IN (
            'surgery', 'anesthesia', 'treatment', 'euthanasia', 'boarding',
            'grooming', 'dental', 'vaccination', 'diagnostic', 'general',
            'release', 'financial', 'emergency', 'research'
        )),

    -- Content
    title TEXT NOT NULL,
    description TEXT,
    content_html TEXT NOT NULL,

    -- Requirements
    requires_witness BOOLEAN DEFAULT false,
    requires_id_verification BOOLEAN DEFAULT false,
    validity_days INTEGER,

    -- Status
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, code, version)
);

-- Unique for global templates
CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_templates_global
ON public.consent_templates (code, version) WHERE tenant_id IS NULL;

-- =============================================================================
-- D. CONSENT DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.consent_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    template_id UUID REFERENCES public.consent_templates(id),

    -- Related entities
    pet_id UUID REFERENCES public.pets(id),
    owner_id UUID REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    hospitalization_id UUID REFERENCES public.hospitalizations(id),

    -- Document info
    document_number TEXT NOT NULL,
    template_version INTEGER,
    rendered_content_html TEXT NOT NULL,

    -- Signer info
    signer_name TEXT NOT NULL,
    signer_email TEXT,
    signer_phone TEXT,
    signer_relationship TEXT,

    -- Signature
    signature_type TEXT NOT NULL
        CHECK (signature_type IN ('digital', 'typed', 'drawn', 'biometric', 'in_person')),
    signature_data TEXT,
    signature_hash TEXT,

    -- Witness
    witness_name TEXT,
    witness_signature_data TEXT,
    witness_signed_at TIMESTAMPTZ,

    -- Facilitated by
    facilitated_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.profiles(id),
    revocation_reason TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('pending', 'active', 'expired', 'revoked', 'superseded')),

    -- PDF
    pdf_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, document_number)
);

-- =============================================================================
-- E. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_documents ENABLE ROW LEVEL SECURITY;

-- Medical records: Staff manage, owners view
CREATE POLICY "Staff manage medical records" ON public.medical_records
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

CREATE POLICY "Owners view pet records" ON public.medical_records
    FOR SELECT TO authenticated
    USING (
        public.is_owner_of_pet(pet_id)
        AND status = 'signed'
        AND deleted_at IS NULL
    );

-- Prescriptions: Staff manage, owners view
CREATE POLICY "Staff manage prescriptions" ON public.prescriptions
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

CREATE POLICY "Owners view prescriptions" ON public.prescriptions
    FOR SELECT TO authenticated
    USING (
        public.is_owner_of_pet(pet_id)
        AND status IN ('active', 'dispensed')
        AND deleted_at IS NULL
    );

-- Consent templates: Public read global, staff manage tenant
CREATE POLICY "Public read consent templates" ON public.consent_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Staff manage templates" ON public.consent_templates
    FOR ALL TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id));

CREATE POLICY "Service role manage templates" ON public.consent_templates
    FOR ALL TO service_role USING (true);

-- Consent documents: Staff manage, owners view own
CREATE POLICY "Staff manage consent docs" ON public.consent_documents
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Owners view consent docs" ON public.consent_documents
    FOR SELECT TO authenticated
    USING (owner_id = auth.uid());

-- =============================================================================
-- F. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_medical_records_tenant ON public.medical_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_pet ON public.medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_vet ON public.medical_records(vet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON public.medical_records(visit_date DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment ON public.medical_records(appointment_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_tenant ON public.prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_pet ON public.prescriptions(pet_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_vet ON public.prescriptions(vet_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON public.prescriptions(prescribed_date DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_consent_templates_tenant ON public.consent_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_templates_category ON public.consent_templates(category);
CREATE INDEX IF NOT EXISTS idx_consent_templates_active ON public.consent_templates(is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_consent_documents_tenant ON public.consent_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_pet ON public.consent_documents(pet_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_owner ON public.consent_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_status ON public.consent_documents(status);

-- =============================================================================
-- G. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.medical_records;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.prescriptions;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.consent_templates;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.consent_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.consent_documents;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.consent_documents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- H. FUNCTIONS
-- =============================================================================

-- Generate prescription number
CREATE OR REPLACE FUNCTION public.generate_prescription_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_sequence INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(prescription_number FROM 3) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM public.prescriptions
    WHERE tenant_id = p_tenant_id;

    RETURN 'RX' || LPAD(v_sequence::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate consent document number
CREATE OR REPLACE FUNCTION public.generate_consent_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_sequence INTEGER;
    v_year TEXT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(document_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM public.consent_documents
    WHERE tenant_id = p_tenant_id
      AND document_number LIKE 'CON' || v_year || '%';

    RETURN 'CON' || v_year || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- I. SEED DATA
-- =============================================================================

-- Global consent templates
INSERT INTO public.consent_templates (tenant_id, code, name, category, title, content_html, requires_witness) VALUES
(NULL, 'SURGERY_GENERAL', 'Consentimiento Quirúrgico General', 'surgery',
 'Consentimiento para Procedimiento Quirúrgico',
 '<h2>Consentimiento Informado para Cirugía</h2>
<p>Yo, <strong>{{owner_name}}</strong>, propietario/a de <strong>{{pet_name}}</strong>, autorizo al equipo veterinario a realizar el procedimiento quirúrgico indicado.</p>
<p>Entiendo los riesgos asociados con la cirugía y la anestesia.</p>',
 true),

(NULL, 'ANESTHESIA', 'Consentimiento Anestésico', 'anesthesia',
 'Consentimiento para Anestesia',
 '<h2>Consentimiento para Anestesia</h2>
<p>Yo, <strong>{{owner_name}}</strong>, autorizo la administración de anestesia a mi mascota <strong>{{pet_name}}</strong>.</p>',
 false),

(NULL, 'EUTHANASIA', 'Consentimiento para Eutanasia', 'euthanasia',
 'Autorización para Eutanasia Humanitaria',
 '<h2>Consentimiento para Eutanasia</h2>
<p>Yo, <strong>{{owner_name}}</strong>, solicito y autorizo la eutanasia humanitaria de mi mascota <strong>{{pet_name}}</strong>.</p>',
 true)
ON CONFLICT DO NOTHING;

