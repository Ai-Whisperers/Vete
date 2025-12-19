-- =============================================================================
-- 02_MEDICAL_RECORDS.SQL
-- =============================================================================
-- Medical records and prescriptions.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    vet_id UUID REFERENCES public.profiles(id),

    -- Record type
    record_type TEXT NOT NULL CHECK (record_type IN (
        'consultation', 'surgery', 'emergency', 'vaccination', 'checkup',
        'dental', 'grooming', 'lab_result', 'imaging', 'other'
    )),

    -- Visit info
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    chief_complaint TEXT,

    -- Clinical findings
    weight_kg NUMERIC(6,2),
    temperature NUMERIC(4,1),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    blood_pressure TEXT,

    -- Assessment
    diagnosis_code TEXT,
    diagnosis_text TEXT,
    clinical_notes TEXT,

    -- Plan
    treatment_plan TEXT,
    follow_up_date DATE,
    follow_up_notes TEXT,

    -- Attachments
    attachments TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PRESCRIPTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    vet_id UUID NOT NULL REFERENCES public.profiles(id),
    medical_record_id UUID REFERENCES public.medical_records(id),

    -- Prescription number
    prescription_number TEXT,

    -- Dates
    prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,

    -- Medications (JSONB array)
    medications JSONB NOT NULL DEFAULT '[]',

    -- Signature
    signature_url TEXT,
    signed_at TIMESTAMPTZ,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'dispensed', 'expired', 'cancelled')),

    -- PDF
    pdf_url TEXT,

    -- Notes
    notes TEXT,
    pharmacist_notes TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Medical records
DROP POLICY IF EXISTS "Staff manage medical records" ON public.medical_records;
CREATE POLICY "Staff manage medical records" ON public.medical_records
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Owners view pet records" ON public.medical_records;
CREATE POLICY "Owners view pet records" ON public.medical_records
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role full access records" ON public.medical_records;
CREATE POLICY "Service role full access records" ON public.medical_records
    FOR ALL TO service_role USING (true);

-- Prescriptions
DROP POLICY IF EXISTS "Staff manage prescriptions" ON public.prescriptions;
CREATE POLICY "Staff manage prescriptions" ON public.prescriptions
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Owners view pet prescriptions" ON public.prescriptions;
CREATE POLICY "Owners view pet prescriptions" ON public.prescriptions
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role full access prescriptions" ON public.prescriptions;
CREATE POLICY "Service role full access prescriptions" ON public.prescriptions
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_medical_records_pet ON public.medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant ON public.medical_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_vet ON public.medical_records(vet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON public.medical_records(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON public.medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_medical_records_active ON public.medical_records(tenant_id, deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_prescriptions_pet ON public.prescriptions(pet_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_tenant ON public.prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_vet ON public.prescriptions(vet_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON public.prescriptions(prescribed_date DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status) WHERE deleted_at IS NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.medical_records;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.prescriptions;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-set tenant_id
DROP TRIGGER IF EXISTS medical_records_auto_tenant ON public.medical_records;
CREATE TRIGGER medical_records_auto_tenant
    BEFORE INSERT ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION public.clinical_set_tenant_id();

DROP TRIGGER IF EXISTS prescriptions_auto_tenant ON public.prescriptions;
CREATE TRIGGER prescriptions_auto_tenant
    BEFORE INSERT ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.clinical_set_tenant_id();
