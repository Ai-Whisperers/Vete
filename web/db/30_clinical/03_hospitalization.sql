-- =============================================================================
-- 03_HOSPITALIZATION.SQL
-- =============================================================================
-- Hospitalization management: kennels, admissions, vitals, treatments.
-- ALL CHILD TABLES INCLUDE tenant_id FOR OPTIMIZED RLS.
-- =============================================================================

-- =============================================================================
-- KENNELS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.kennels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Kennel info
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    location TEXT,
    kennel_type TEXT DEFAULT 'standard'
        CHECK (kennel_type IN ('standard', 'isolation', 'icu', 'recovery', 'large', 'small')),

    -- Capacity
    max_occupancy INTEGER DEFAULT 1,
    current_occupancy INTEGER DEFAULT 0,

    -- Pricing
    daily_rate NUMERIC(12,2) DEFAULT 0,

    -- Status
    current_status TEXT DEFAULT 'available'
        CHECK (current_status IN ('available', 'occupied', 'cleaning', 'maintenance', 'reserved')),
    is_active BOOLEAN DEFAULT true,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(tenant_id, code),
    CONSTRAINT kennels_occupancy CHECK (current_occupancy <= max_occupancy),
    CONSTRAINT kennels_occupancy_positive CHECK (current_occupancy >= 0)
);

-- =============================================================================
-- HOSPITALIZATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Relationships
    pet_id UUID NOT NULL REFERENCES public.pets(id),
    kennel_id UUID REFERENCES public.kennels(id),
    primary_vet_id UUID REFERENCES public.profiles(id),
    admitted_by UUID REFERENCES public.profiles(id),

    -- Admission info
    admission_number TEXT NOT NULL,
    admitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_discharge TIMESTAMPTZ,
    actual_discharge TIMESTAMPTZ,

    -- Diagnosis
    reason TEXT NOT NULL,
    diagnosis TEXT,
    notes TEXT,

    -- Priority/Acuity
    acuity_level TEXT DEFAULT 'normal'
        CHECK (acuity_level IN ('low', 'normal', 'high', 'critical')),

    -- Status
    status TEXT NOT NULL DEFAULT 'admitted'
        CHECK (status IN (
            'admitted',       -- Currently hospitalized
            'in_treatment',   -- Active treatment
            'stable',         -- Stable condition
            'critical',       -- Critical condition
            'recovering',     -- Recovery phase
            'discharged',     -- Discharged
            'deceased',       -- Died during hospitalization
            'transferred'     -- Transferred to another facility
        )),

    -- Discharge
    discharge_notes TEXT,
    discharged_by UUID REFERENCES public.profiles(id),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,

    -- Billing
    estimated_cost NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    invoice_id UUID,  -- FK to invoices

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, admission_number)
);

-- Only one active hospitalization per pet
CREATE UNIQUE INDEX IF NOT EXISTS idx_hospitalizations_one_active_per_pet
ON public.hospitalizations(pet_id)
WHERE status NOT IN ('discharged', 'deceased', 'transferred') AND deleted_at IS NULL;

-- =============================================================================
-- HOSPITALIZATION VITALS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Vitals with validation
    temperature NUMERIC(4,1) CHECK (temperature IS NULL OR (temperature >= 30 AND temperature <= 45)),
    heart_rate INTEGER CHECK (heart_rate IS NULL OR (heart_rate >= 20 AND heart_rate <= 400)),
    respiratory_rate INTEGER CHECK (respiratory_rate IS NULL OR (respiratory_rate >= 5 AND respiratory_rate <= 150)),
    blood_pressure_systolic INTEGER CHECK (blood_pressure_systolic IS NULL OR (blood_pressure_systolic >= 40 AND blood_pressure_systolic <= 300)),
    blood_pressure_diastolic INTEGER CHECK (blood_pressure_diastolic IS NULL OR (blood_pressure_diastolic >= 20 AND blood_pressure_diastolic <= 200)),
    weight_kg NUMERIC(6,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
    pain_score INTEGER CHECK (pain_score IS NULL OR (pain_score >= 0 AND pain_score <= 10)),
    mentation TEXT CHECK (mentation IS NULL OR mentation IN ('bright', 'quiet', 'dull', 'obtunded', 'comatose')),

    -- Notes
    notes TEXT,

    -- Recorded by
    recorded_by UUID REFERENCES public.profiles(id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- HOSPITALIZATION MEDICATIONS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Medication
    medication_name TEXT NOT NULL,
    dose TEXT NOT NULL,
    route TEXT CHECK (route IS NULL OR route IN ('oral', 'IV', 'IM', 'SQ', 'topical', 'inhaled', 'rectal', 'ophthalmic', 'otic')),
    frequency TEXT,

    -- Schedule
    scheduled_at TIMESTAMPTZ,
    administered_at TIMESTAMPTZ,
    skipped_reason TEXT,

    -- Status
    status TEXT DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'administered', 'skipped', 'held')),

    -- Administered by
    administered_by UUID REFERENCES public.profiles(id),

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- HOSPITALIZATION TREATMENTS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Treatment
    treatment_type TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Schedule
    scheduled_at TIMESTAMPTZ,
    performed_at TIMESTAMPTZ,

    -- Status
    status TEXT DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'performed', 'skipped', 'pending')),

    -- Performed by
    performed_by UUID REFERENCES public.profiles(id),

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- HOSPITALIZATION FEEDINGS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_feedings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Feeding details
    food_type TEXT NOT NULL,
    amount TEXT,
    method TEXT CHECK (method IS NULL OR method IN ('oral', 'syringe', 'tube', 'assisted')),

    -- Timing
    scheduled_at TIMESTAMPTZ,
    fed_at TIMESTAMPTZ,

    -- Results
    consumed_amount TEXT,
    appetite_score INTEGER CHECK (appetite_score IS NULL OR (appetite_score >= 0 AND appetite_score <= 5)),
    vomited BOOLEAN DEFAULT false,

    -- Status
    status TEXT DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'completed', 'refused', 'partial')),

    -- Fed by
    fed_by UUID REFERENCES public.profiles(id),

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- HOSPITALIZATION NOTES - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Note
    note_type TEXT DEFAULT 'progress'
        CHECK (note_type IN ('progress', 'doctor', 'nursing', 'discharge', 'other')),
    content TEXT NOT NULL,

    -- Author
    created_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.kennels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_notes ENABLE ROW LEVEL SECURITY;

-- Kennels: Staff only
DROP POLICY IF EXISTS "Staff manage kennels" ON public.kennels;
CREATE POLICY "Staff manage kennels" ON public.kennels
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role full access kennels" ON public.kennels;
CREATE POLICY "Service role full access kennels" ON public.kennels
    FOR ALL TO service_role USING (true);

-- Hospitalizations: Staff manage, owners view
DROP POLICY IF EXISTS "Staff manage hospitalizations" ON public.hospitalizations;
CREATE POLICY "Staff manage hospitalizations" ON public.hospitalizations
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Owners view pet hospitalizations" ON public.hospitalizations;
CREATE POLICY "Owners view pet hospitalizations" ON public.hospitalizations
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role full access hospitalizations" ON public.hospitalizations;
CREATE POLICY "Service role full access hospitalizations" ON public.hospitalizations
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Vitals uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage vitals" ON public.hospitalization_vitals;
CREATE POLICY "Staff manage vitals" ON public.hospitalization_vitals
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view vitals" ON public.hospitalization_vitals;
CREATE POLICY "Owners view vitals" ON public.hospitalization_vitals
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hospitalizations h
            WHERE h.id = hospitalization_vitals.hospitalization_id
            AND public.is_owner_of_pet(h.pet_id)
        )
    );

DROP POLICY IF EXISTS "Service role full access vitals" ON public.hospitalization_vitals;
CREATE POLICY "Service role full access vitals" ON public.hospitalization_vitals
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Medications uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage medications" ON public.hospitalization_medications;
CREATE POLICY "Staff manage medications" ON public.hospitalization_medications
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access medications" ON public.hospitalization_medications;
CREATE POLICY "Service role full access medications" ON public.hospitalization_medications
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Treatments uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage treatments" ON public.hospitalization_treatments;
CREATE POLICY "Staff manage treatments" ON public.hospitalization_treatments
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access treatments" ON public.hospitalization_treatments;
CREATE POLICY "Service role full access treatments" ON public.hospitalization_treatments
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Feedings uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage feedings" ON public.hospitalization_feedings;
CREATE POLICY "Staff manage feedings" ON public.hospitalization_feedings
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access feedings" ON public.hospitalization_feedings;
CREATE POLICY "Service role full access feedings" ON public.hospitalization_feedings
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Notes uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage notes" ON public.hospitalization_notes;
CREATE POLICY "Staff manage notes" ON public.hospitalization_notes
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access notes" ON public.hospitalization_notes;
CREATE POLICY "Service role full access notes" ON public.hospitalization_notes
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_kennels_tenant ON public.kennels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kennels_status ON public.kennels(current_status)
    WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_kennels_available ON public.kennels(tenant_id, current_status)
    WHERE current_status = 'available' AND is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hospitalizations_tenant ON public.hospitalizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_pet ON public.hospitalizations(pet_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_kennel ON public.hospitalizations(kennel_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON public.hospitalizations(status)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hospitalizations_active ON public.hospitalizations(tenant_id, status)
    WHERE status NOT IN ('discharged', 'deceased', 'transferred') AND deleted_at IS NULL;

-- BRIN indexes for time-series data
CREATE INDEX IF NOT EXISTS idx_hospitalization_vitals_hosp ON public.hospitalization_vitals(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_vitals_tenant ON public.hospitalization_vitals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_vitals_recorded_brin ON public.hospitalization_vitals
    USING BRIN(recorded_at) WITH (pages_per_range = 32);

CREATE INDEX IF NOT EXISTS idx_hospitalization_medications_hosp ON public.hospitalization_medications(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_medications_tenant ON public.hospitalization_medications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_medications_scheduled ON public.hospitalization_medications(scheduled_at)
    WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_hospitalization_treatments_hosp ON public.hospitalization_treatments(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_treatments_tenant ON public.hospitalization_treatments(tenant_id);

CREATE INDEX IF NOT EXISTS idx_hospitalization_feedings_hosp ON public.hospitalization_feedings(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_feedings_tenant ON public.hospitalization_feedings(tenant_id);

CREATE INDEX IF NOT EXISTS idx_hospitalization_notes_hosp ON public.hospitalization_notes(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_notes_tenant ON public.hospitalization_notes(tenant_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.kennels;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.kennels
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.hospitalizations;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.hospitalizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-set tenant_id for child tables
CREATE OR REPLACE FUNCTION public.hospitalization_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        SELECT tenant_id INTO NEW.tenant_id
        FROM public.hospitalizations
        WHERE id = NEW.hospitalization_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vitals_auto_tenant ON public.hospitalization_vitals;
CREATE TRIGGER vitals_auto_tenant
    BEFORE INSERT ON public.hospitalization_vitals
    FOR EACH ROW EXECUTE FUNCTION public.hospitalization_set_tenant_id();

DROP TRIGGER IF EXISTS medications_auto_tenant ON public.hospitalization_medications;
CREATE TRIGGER medications_auto_tenant
    BEFORE INSERT ON public.hospitalization_medications
    FOR EACH ROW EXECUTE FUNCTION public.hospitalization_set_tenant_id();

DROP TRIGGER IF EXISTS treatments_auto_tenant ON public.hospitalization_treatments;
CREATE TRIGGER treatments_auto_tenant
    BEFORE INSERT ON public.hospitalization_treatments
    FOR EACH ROW EXECUTE FUNCTION public.hospitalization_set_tenant_id();

DROP TRIGGER IF EXISTS feedings_auto_tenant ON public.hospitalization_feedings;
CREATE TRIGGER feedings_auto_tenant
    BEFORE INSERT ON public.hospitalization_feedings
    FOR EACH ROW EXECUTE FUNCTION public.hospitalization_set_tenant_id();

DROP TRIGGER IF EXISTS notes_auto_tenant ON public.hospitalization_notes;
CREATE TRIGGER notes_auto_tenant
    BEFORE INSERT ON public.hospitalization_notes
    FOR EACH ROW EXECUTE FUNCTION public.hospitalization_set_tenant_id();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Update kennel status on hospitalization changes
CREATE OR REPLACE FUNCTION public.update_kennel_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.kennel_id IS NOT NULL THEN
        UPDATE public.kennels
        SET current_occupancy = current_occupancy + 1,
            current_status = CASE WHEN current_occupancy + 1 >= max_occupancy THEN 'occupied' ELSE current_status END
        WHERE id = NEW.kennel_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Moving to different kennel
        IF OLD.kennel_id IS DISTINCT FROM NEW.kennel_id THEN
            IF OLD.kennel_id IS NOT NULL THEN
                UPDATE public.kennels
                SET current_occupancy = GREATEST(0, current_occupancy - 1),
                    current_status = CASE WHEN current_occupancy - 1 = 0 THEN 'available' ELSE current_status END
                WHERE id = OLD.kennel_id;
            END IF;
            IF NEW.kennel_id IS NOT NULL THEN
                UPDATE public.kennels
                SET current_occupancy = current_occupancy + 1,
                    current_status = CASE WHEN current_occupancy + 1 >= max_occupancy THEN 'occupied' ELSE current_status END
                WHERE id = NEW.kennel_id;
            END IF;
        END IF;
        -- Discharged
        IF NEW.status IN ('discharged', 'deceased', 'transferred') AND OLD.status NOT IN ('discharged', 'deceased', 'transferred') THEN
            IF NEW.kennel_id IS NOT NULL THEN
                UPDATE public.kennels
                SET current_occupancy = GREATEST(0, current_occupancy - 1),
                    current_status = CASE WHEN current_occupancy - 1 = 0 THEN 'available' ELSE current_status END
                WHERE id = NEW.kennel_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hospitalization_kennel_status ON public.hospitalizations;
CREATE TRIGGER hospitalization_kennel_status
    AFTER INSERT OR UPDATE ON public.hospitalizations
    FOR EACH ROW EXECUTE FUNCTION public.update_kennel_status();

-- THREAD-SAFE admission number generation using advisory locks
CREATE OR REPLACE FUNCTION public.generate_admission_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_number INTEGER;
    v_lock_id BIGINT;
BEGIN
    -- Create a unique lock ID from tenant_id hash + document type
    v_lock_id := ('x' || substr(md5(p_tenant_id || 'ADM'), 1, 8))::bit(32)::bigint;

    -- Acquire advisory lock
    PERFORM pg_advisory_xact_lock(v_lock_id);

    -- Get next number from sequences table
    INSERT INTO public.document_sequences (tenant_id, document_type, last_number, prefix)
    VALUES (p_tenant_id, 'admission', 1, 'ADM')
    ON CONFLICT (tenant_id, document_type) DO UPDATE
    SET last_number = public.document_sequences.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO v_number;

    RETURN 'ADM' || LPAD(v_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

