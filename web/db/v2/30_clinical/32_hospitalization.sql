-- =============================================================================
-- 32_HOSPITALIZATION.SQL
-- =============================================================================
-- Hospitalization management: kennels, admissions, vitals, treatments.
--
-- Dependencies: 20_pets.sql, 10_core/*
-- =============================================================================

-- =============================================================================
-- A. KENNELS
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

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(tenant_id, code),
    CONSTRAINT kennels_occupancy CHECK (current_occupancy <= max_occupancy)
);

-- =============================================================================
-- B. HOSPITALIZATIONS
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

    -- Priority
    priority TEXT DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'critical')),

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

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, admission_number)
);

-- =============================================================================
-- C. HOSPITALIZATION VITALS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,

    -- Vitals
    temperature NUMERIC(4,1),        -- Celsius
    heart_rate INTEGER,              -- BPM
    respiratory_rate INTEGER,        -- Breaths per minute
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    weight_kg NUMERIC(6,2),
    pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
    mentation TEXT CHECK (mentation IN ('bright', 'quiet', 'dull', 'obtunded', 'comatose')),

    -- Notes
    notes TEXT,

    -- Recorded by
    recorded_by UUID REFERENCES public.profiles(id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. HOSPITALIZATION MEDICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,

    -- Medication
    medication_name TEXT NOT NULL,
    dose TEXT NOT NULL,
    route TEXT,  -- oral, IV, IM, SQ
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
-- E. HOSPITALIZATION TREATMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,

    -- Treatment
    treatment_type TEXT NOT NULL,  -- 'fluid_therapy', 'bandage_change', 'wound_care', etc.
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
-- F. HOSPITALIZATION FEEDINGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_feedings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,

    -- Feeding details
    food_type TEXT NOT NULL,
    amount TEXT,
    method TEXT,  -- 'oral', 'syringe', 'tube'

    -- Timing
    scheduled_at TIMESTAMPTZ,
    fed_at TIMESTAMPTZ,

    -- Results
    consumed_amount TEXT,
    appetite_score INTEGER CHECK (appetite_score >= 0 AND appetite_score <= 5),
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
-- G. HOSPITALIZATION NOTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hospitalization_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES public.hospitalizations(id) ON DELETE CASCADE,

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
-- H. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.kennels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalization_notes ENABLE ROW LEVEL SECURITY;

-- Kennels: Staff only
CREATE POLICY "Staff manage kennels" ON public.kennels
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Hospitalizations: Staff manage, owners view
CREATE POLICY "Staff manage hospitalizations" ON public.hospitalizations
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

CREATE POLICY "Owners view pet hospitalizations" ON public.hospitalizations
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id) AND deleted_at IS NULL);

-- Vitals: Staff manage, owners view
CREATE POLICY "Staff manage vitals" ON public.hospitalization_vitals
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hospitalizations h
            WHERE h.id = hospitalization_vitals.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

CREATE POLICY "Owners view vitals" ON public.hospitalization_vitals
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hospitalizations h
            WHERE h.id = hospitalization_vitals.hospitalization_id
            AND public.is_owner_of_pet(h.pet_id)
        )
    );

-- Medications: Staff only
CREATE POLICY "Staff manage medications" ON public.hospitalization_medications
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hospitalizations h
            WHERE h.id = hospitalization_medications.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

-- Treatments: Staff only
CREATE POLICY "Staff manage treatments" ON public.hospitalization_treatments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hospitalizations h
            WHERE h.id = hospitalization_treatments.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

-- Feedings: Staff only
CREATE POLICY "Staff manage feedings" ON public.hospitalization_feedings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hospitalizations h
            WHERE h.id = hospitalization_feedings.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

-- Notes: Staff only
CREATE POLICY "Staff manage notes" ON public.hospitalization_notes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hospitalizations h
            WHERE h.id = hospitalization_notes.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

-- =============================================================================
-- I. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_kennels_tenant ON public.kennels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kennels_status ON public.kennels(current_status)
    WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kennels_available ON public.kennels(tenant_id, current_status)
    WHERE current_status = 'available' AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_hospitalizations_tenant ON public.hospitalizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_pet ON public.hospitalizations(pet_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_kennel ON public.hospitalizations(kennel_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON public.hospitalizations(status)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hospitalizations_active ON public.hospitalizations(tenant_id, status)
    WHERE status NOT IN ('discharged', 'deceased', 'transferred') AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hospitalization_vitals_hosp ON public.hospitalization_vitals(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_vitals_recorded ON public.hospitalization_vitals(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_hospitalization_medications_hosp ON public.hospitalization_medications(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hospitalization_medications_scheduled ON public.hospitalization_medications(scheduled_at)
    WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_hospitalization_treatments_hosp ON public.hospitalization_treatments(hospitalization_id);

CREATE INDEX IF NOT EXISTS idx_hospitalization_feedings_hosp ON public.hospitalization_feedings(hospitalization_id);

CREATE INDEX IF NOT EXISTS idx_hospitalization_notes_hosp ON public.hospitalization_notes(hospitalization_id);

-- =============================================================================
-- J. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.kennels;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.kennels
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.hospitalizations;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.hospitalizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- K. FUNCTIONS
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

-- Generate admission number
CREATE OR REPLACE FUNCTION public.generate_admission_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_sequence INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(admission_number FROM 4) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM public.hospitalizations
    WHERE tenant_id = p_tenant_id;

    RETURN 'ADM' || LPAD(v_sequence::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

