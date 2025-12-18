-- =============================================================================
-- 30_REFERENCE_DATA.SQL
-- =============================================================================
-- Clinical reference tables: diagnosis codes, drug dosages, growth standards.
--
-- Dependencies: 02_functions/*
-- =============================================================================

-- =============================================================================
-- A. DIAGNOSIS CODES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.diagnosis_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Code details
    code TEXT NOT NULL UNIQUE,
    term TEXT NOT NULL,
    standard TEXT DEFAULT 'custom'
        CHECK (standard IN ('venom', 'snomed', 'custom')),
    category TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. DRUG DOSAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.drug_dosages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Drug info
    name TEXT NOT NULL,
    species TEXT DEFAULT 'all'
        CHECK (species IN ('dog', 'cat', 'all')),

    -- Dosage range
    min_dose_mg_kg NUMERIC(10,2),
    max_dose_mg_kg NUMERIC(10,2),
    concentration_mg_ml NUMERIC(10,2),

    -- Administration
    route TEXT,
    frequency TEXT,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(name, species)
);

-- =============================================================================
-- C. GROWTH STANDARDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.growth_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Standard details
    breed TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')),
    age_weeks INTEGER NOT NULL,
    weight_kg NUMERIC(10,2) NOT NULL,
    percentile TEXT DEFAULT 'P50',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(breed, gender, age_weeks, percentile)
);

-- =============================================================================
-- D. REPRODUCTIVE CYCLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reproductive_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,

    -- Cycle details
    cycle_start TIMESTAMPTZ NOT NULL,
    cycle_end TIMESTAMPTZ NOT NULL,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT reproductive_cycles_dates CHECK (cycle_end >= cycle_start)
);

-- =============================================================================
-- E. EUTHANASIA ASSESSMENTS (HHHHHMM Scale)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.euthanasia_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,

    -- Assessment
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 70),
    notes TEXT,

    -- Assessor
    assessed_by UUID REFERENCES public.profiles(id),
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_dosages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reproductive_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.euthanasia_assessments ENABLE ROW LEVEL SECURITY;

-- Diagnosis codes: Public read
CREATE POLICY "Public read diagnosis codes" ON public.diagnosis_codes
    FOR SELECT USING (true);

CREATE POLICY "Service role manage diagnosis codes" ON public.diagnosis_codes
    FOR ALL TO service_role USING (true);

-- Drug dosages: Public read
CREATE POLICY "Public read drug dosages" ON public.drug_dosages
    FOR SELECT USING (true);

CREATE POLICY "Service role manage drug dosages" ON public.drug_dosages
    FOR ALL TO service_role USING (true);

-- Growth standards: Public read
CREATE POLICY "Public read growth standards" ON public.growth_standards
    FOR SELECT USING (true);

CREATE POLICY "Service role manage growth standards" ON public.growth_standards
    FOR ALL TO service_role USING (true);

-- Reproductive cycles: Staff manage, owners view
CREATE POLICY "Staff manage reproductive cycles" ON public.reproductive_cycles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pets p
            WHERE p.id = reproductive_cycles.pet_id
            AND public.is_staff_of(p.tenant_id)
        )
    );

CREATE POLICY "Owners view pet cycles" ON public.reproductive_cycles
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id));

-- Euthanasia assessments: Staff manage, owners view
CREATE POLICY "Staff manage assessments" ON public.euthanasia_assessments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pets p
            WHERE p.id = euthanasia_assessments.pet_id
            AND public.is_staff_of(p.tenant_id)
        )
    );

CREATE POLICY "Owners view pet assessments" ON public.euthanasia_assessments
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id));

-- =============================================================================
-- G. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_code ON public.diagnosis_codes(code);
CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_category ON public.diagnosis_codes(category);

CREATE INDEX IF NOT EXISTS idx_drug_dosages_name ON public.drug_dosages(name);
CREATE INDEX IF NOT EXISTS idx_drug_dosages_species ON public.drug_dosages(species);

CREATE INDEX IF NOT EXISTS idx_growth_standards_breed ON public.growth_standards(breed);

CREATE INDEX IF NOT EXISTS idx_reproductive_cycles_pet ON public.reproductive_cycles(pet_id);

CREATE INDEX IF NOT EXISTS idx_euthanasia_assessments_pet ON public.euthanasia_assessments(pet_id);

-- =============================================================================
-- H. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.diagnosis_codes;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.diagnosis_codes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.reproductive_cycles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.reproductive_cycles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- I. SEED DATA
-- =============================================================================

-- Diagnosis codes (VeNom subset)
INSERT INTO public.diagnosis_codes (code, term, standard, category) VALUES
    ('1001', 'Otitis externa', 'venom', 'Dermatology'),
    ('1002', 'Pyoderma', 'venom', 'Dermatology'),
    ('1003', 'Gastroenteritis', 'venom', 'Gastroenterology'),
    ('1004', 'Fracture', 'venom', 'Orthopedics'),
    ('1005', 'Conjunctivitis', 'venom', 'Ophthalmology'),
    ('1006', 'Periodontal disease', 'venom', 'Dentistry'),
    ('1007', 'Diabetes mellitus', 'venom', 'Endocrinology'),
    ('1008', 'Chronic kidney disease', 'venom', 'Nephrology'),
    ('1009', 'Heartworm disease', 'venom', 'Cardiology'),
    ('1010', 'Obesity', 'venom', 'Nutrition')
ON CONFLICT (code) DO NOTHING;

-- Drug dosages
INSERT INTO public.drug_dosages (name, species, min_dose_mg_kg, max_dose_mg_kg, concentration_mg_ml, frequency, notes) VALUES
    ('Amoxicillin', 'all', 10.00, 20.00, 50.00, 'twice daily', NULL),
    ('Meloxicam', 'dog', 0.10, 0.20, 1.50, 'once daily', 'Loading dose @ 0.2 mg/kg'),
    ('Meloxicam', 'cat', 0.05, 0.05, 0.50, 'once daily', 'Use with caution in cats'),
    ('Tramadol', 'all', 2.00, 5.00, 50.00, 'every 8-12 hours', NULL),
    ('Cephalexin', 'all', 22.00, 30.00, 250.00, 'twice daily', 'Available as capsules'),
    ('Metronidazole', 'all', 10.00, 15.00, 50.00, 'twice daily', NULL),
    ('Enrofloxacin', 'dog', 5.00, 20.00, 50.00, 'once daily', 'Avoid in young animals'),
    ('Prednisolone', 'all', 0.50, 2.00, 5.00, 'once daily', 'Taper dose when stopping')
ON CONFLICT (name, species) DO NOTHING;

-- Growth standards (medium dog)
INSERT INTO public.growth_standards (breed, gender, age_weeks, weight_kg, percentile) VALUES
    ('Medium Dog', 'male', 8, 3.5, 'P50'),
    ('Medium Dog', 'male', 12, 7.0, 'P50'),
    ('Medium Dog', 'male', 16, 11.0, 'P50'),
    ('Medium Dog', 'male', 24, 16.0, 'P50'),
    ('Medium Dog', 'male', 36, 19.5, 'P50'),
    ('Medium Dog', 'male', 52, 22.0, 'P50'),
    ('Medium Dog', 'female', 8, 3.2, 'P50'),
    ('Medium Dog', 'female', 12, 6.5, 'P50'),
    ('Medium Dog', 'female', 16, 10.0, 'P50'),
    ('Medium Dog', 'female', 24, 14.5, 'P50'),
    ('Medium Dog', 'female', 36, 17.5, 'P50'),
    ('Medium Dog', 'female', 52, 19.0, 'P50')
ON CONFLICT (breed, gender, age_weeks, percentile) DO NOTHING;

