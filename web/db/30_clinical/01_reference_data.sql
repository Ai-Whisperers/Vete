-- =============================================================================
-- 01_REFERENCE_DATA.SQL
-- =============================================================================
-- Clinical reference tables: diagnosis codes, drug dosages, growth standards.
-- =============================================================================

-- =============================================================================
-- DIAGNOSIS CODES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.diagnosis_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    term TEXT NOT NULL,
    standard TEXT DEFAULT 'custom' CHECK (standard IN ('venom', 'snomed', 'custom')),
    category TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- DRUG DOSAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.drug_dosages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    species TEXT DEFAULT 'all' CHECK (species IN ('dog', 'cat', 'all')),

    -- Dosage range
    min_dose_mg_kg NUMERIC(10,2),
    max_dose_mg_kg NUMERIC(10,2),
    concentration_mg_ml NUMERIC(10,2),

    -- Administration
    route TEXT,
    frequency TEXT,
    notes TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(name, species)
);

-- =============================================================================
-- GROWTH STANDARDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.growth_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breed TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')),
    age_weeks INTEGER NOT NULL,
    weight_kg NUMERIC(10,2) NOT NULL,
    percentile TEXT DEFAULT 'P50',

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(breed, gender, age_weeks, percentile)
);

-- =============================================================================
-- REPRODUCTIVE CYCLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reproductive_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Cycle details
    cycle_start TIMESTAMPTZ NOT NULL,
    cycle_end TIMESTAMPTZ NOT NULL,
    notes TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT reproductive_cycles_dates CHECK (cycle_end >= cycle_start)
);

-- =============================================================================
-- EUTHANASIA ASSESSMENTS (HHHHHMM Scale)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.euthanasia_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Assessment
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 70),
    notes TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Assessor
    assessed_by UUID REFERENCES public.profiles(id),
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_dosages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reproductive_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.euthanasia_assessments ENABLE ROW LEVEL SECURITY;

-- Public read for reference data
DROP POLICY IF EXISTS "Public read diagnosis codes" ON public.diagnosis_codes;
CREATE POLICY "Public read diagnosis codes" ON public.diagnosis_codes
    FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role manage diagnosis codes" ON public.diagnosis_codes;
CREATE POLICY "Service role manage diagnosis codes" ON public.diagnosis_codes
    FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Public read drug dosages" ON public.drug_dosages;
CREATE POLICY "Public read drug dosages" ON public.drug_dosages
    FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role manage drug dosages" ON public.drug_dosages;
CREATE POLICY "Service role manage drug dosages" ON public.drug_dosages
    FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Public read growth standards" ON public.growth_standards;
CREATE POLICY "Public read growth standards" ON public.growth_standards
    FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role manage growth standards" ON public.growth_standards;
CREATE POLICY "Service role manage growth standards" ON public.growth_standards
    FOR ALL TO service_role USING (true);

-- Reproductive cycles
DROP POLICY IF EXISTS "Staff manage reproductive cycles" ON public.reproductive_cycles;
CREATE POLICY "Staff manage reproductive cycles" ON public.reproductive_cycles
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Owners view pet cycles" ON public.reproductive_cycles;
CREATE POLICY "Owners view pet cycles" ON public.reproductive_cycles
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id) AND deleted_at IS NULL);

-- Euthanasia assessments
DROP POLICY IF EXISTS "Staff manage assessments" ON public.euthanasia_assessments;
CREATE POLICY "Staff manage assessments" ON public.euthanasia_assessments
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Owners view pet assessments" ON public.euthanasia_assessments;
CREATE POLICY "Owners view pet assessments" ON public.euthanasia_assessments
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id) AND deleted_at IS NULL);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_code ON public.diagnosis_codes(code);
CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_category ON public.diagnosis_codes(category);
CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_active ON public.diagnosis_codes(id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_drug_dosages_name ON public.drug_dosages(name);
CREATE INDEX IF NOT EXISTS idx_drug_dosages_species ON public.drug_dosages(species);
CREATE INDEX IF NOT EXISTS idx_drug_dosages_active ON public.drug_dosages(id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_growth_standards_breed ON public.growth_standards(breed);
CREATE INDEX IF NOT EXISTS idx_growth_standards_active ON public.growth_standards(id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reproductive_cycles_pet ON public.reproductive_cycles(pet_id);
CREATE INDEX IF NOT EXISTS idx_reproductive_cycles_tenant ON public.reproductive_cycles(tenant_id);

CREATE INDEX IF NOT EXISTS idx_euthanasia_assessments_pet ON public.euthanasia_assessments(pet_id);
CREATE INDEX IF NOT EXISTS idx_euthanasia_assessments_tenant ON public.euthanasia_assessments(tenant_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.diagnosis_codes;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.diagnosis_codes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.reproductive_cycles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.reproductive_cycles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-set tenant_id
CREATE OR REPLACE FUNCTION public.clinical_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL AND NEW.pet_id IS NOT NULL THEN
        SELECT tenant_id INTO NEW.tenant_id FROM public.pets WHERE id = NEW.pet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reproductive_cycles_auto_tenant ON public.reproductive_cycles;
CREATE TRIGGER reproductive_cycles_auto_tenant
    BEFORE INSERT ON public.reproductive_cycles
    FOR EACH ROW EXECUTE FUNCTION public.clinical_set_tenant_id();

DROP TRIGGER IF EXISTS euthanasia_assessments_auto_tenant ON public.euthanasia_assessments;
CREATE TRIGGER euthanasia_assessments_auto_tenant
    BEFORE INSERT ON public.euthanasia_assessments
    FOR EACH ROW EXECUTE FUNCTION public.clinical_set_tenant_id();
