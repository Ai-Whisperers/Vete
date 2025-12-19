-- =============================================================================
-- 05_SCHEMA_CLINICAL.SQL
-- =============================================================================
-- Clinical reference tables and assessment tools:
-- - Diagnosis codes (VeNom/SNOMED)
-- - Drug dosages
-- - Growth standards
-- - Reproductive cycles
-- - Euthanasia assessments (HHHHHMM scale)
-- =============================================================================

-- =============================================================================
-- A. DIAGNOSIS CODES
-- =============================================================================
-- Standardized diagnosis codes (VeNom, SNOMED, or custom).

CREATE TABLE IF NOT EXISTS diagnosis_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,              -- e.g., '1001', 'VN-123'
    term TEXT NOT NULL,                     -- e.g., 'Otitis externa'
    standard TEXT DEFAULT 'custom'
        CHECK (standard IN ('venom', 'snomed', 'custom')),
    category TEXT,                          -- e.g., 'Dermatology', 'Cardiology'

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial diagnosis codes (VeNom subset)
INSERT INTO diagnosis_codes (code, term, standard, category) VALUES
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

-- =============================================================================
-- B. DRUG DOSAGES
-- =============================================================================
-- Reference table for drug dosing calculations.

CREATE TABLE IF NOT EXISTS drug_dosages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    species TEXT DEFAULT 'all'
        CHECK (species IN ('dog', 'cat', 'all')),

    -- Dosage Range
    min_dose_mg_kg NUMERIC(10,2),
    max_dose_mg_kg NUMERIC(10,2),
    concentration_mg_ml NUMERIC(10,2),

    -- Administration
    route TEXT,                             -- 'oral', 'iv', 'im', 'sc'
    frequency TEXT,                         -- 'once daily', 'twice daily', etc.
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One entry per drug-species combination
    UNIQUE(name, species)
);

-- Seed common drug dosages
INSERT INTO drug_dosages (name, species, min_dose_mg_kg, max_dose_mg_kg, concentration_mg_ml, frequency, notes) VALUES
    ('Amoxicillin', 'all', 10.00, 20.00, 50.00, 'twice daily', NULL),
    ('Meloxicam', 'dog', 0.10, 0.20, 1.50, 'once daily', 'Loading dose @ 0.2 mg/kg'),
    ('Meloxicam', 'cat', 0.05, 0.05, 0.50, 'once daily', 'Use with caution in cats'),
    ('Tramadol', 'all', 2.00, 5.00, 50.00, 'every 8-12 hours', NULL),
    ('Cephalexin', 'all', 22.00, 30.00, 250.00, 'twice daily', 'Available as capsules'),
    ('Metronidazole', 'all', 10.00, 15.00, 50.00, 'twice daily', NULL),
    ('Enrofloxacin', 'dog', 5.00, 20.00, 50.00, 'once daily', 'Avoid in young animals'),
    ('Prednisolone', 'all', 0.50, 2.00, 5.00, 'once daily', 'Taper dose when stopping')
ON CONFLICT (name, species) DO NOTHING;

-- =============================================================================
-- C. GROWTH STANDARDS
-- =============================================================================
-- Weight percentiles by breed/age for growth tracking.

CREATE TABLE IF NOT EXISTS growth_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breed TEXT NOT NULL,                    -- 'Labrador Retriever', 'Medium Dog', etc.
    gender TEXT CHECK (gender IN ('male', 'female')),
    age_weeks INTEGER NOT NULL,
    weight_kg NUMERIC(10,2) NOT NULL,
    percentile TEXT DEFAULT 'P50',          -- 'P25', 'P50', 'P75'

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One entry per breed-gender-age-percentile
    UNIQUE(breed, gender, age_weeks, percentile)
);

-- Seed medium dog growth standards
INSERT INTO growth_standards (breed, gender, age_weeks, weight_kg, percentile) VALUES
    -- Male Medium Dog
    ('Medium Dog', 'male', 8, 3.5, 'P50'),
    ('Medium Dog', 'male', 12, 7.0, 'P50'),
    ('Medium Dog', 'male', 16, 11.0, 'P50'),
    ('Medium Dog', 'male', 24, 16.0, 'P50'),
    ('Medium Dog', 'male', 36, 19.5, 'P50'),
    ('Medium Dog', 'male', 52, 22.0, 'P50'),
    -- Female Medium Dog
    ('Medium Dog', 'female', 8, 3.2, 'P50'),
    ('Medium Dog', 'female', 12, 6.5, 'P50'),
    ('Medium Dog', 'female', 16, 10.0, 'P50'),
    ('Medium Dog', 'female', 24, 14.5, 'P50'),
    ('Medium Dog', 'female', 36, 17.5, 'P50'),
    ('Medium Dog', 'female', 52, 19.0, 'P50')
ON CONFLICT (breed, gender, age_weeks, percentile) DO NOTHING;

-- =============================================================================
-- D. REPRODUCTIVE CYCLES
-- =============================================================================
-- Track reproductive cycles for breeding management.

CREATE TABLE IF NOT EXISTS reproductive_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Cycle Details
    cycle_start TIMESTAMPTZ NOT NULL,
    cycle_end TIMESTAMPTZ NOT NULL,
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Validate dates
    CONSTRAINT reproductive_cycles_dates CHECK (cycle_end >= cycle_start)
);

-- =============================================================================
-- E. EUTHANASIA ASSESSMENTS (HHHHHMM Scale)
-- =============================================================================
-- Quality of life assessments using the HHHHHMM scale (0-70).
-- Categories: Hurt, Hunger, Hydration, Hygiene, Happiness, Mobility, More Good Days

CREATE TABLE IF NOT EXISTS euthanasia_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Assessment
    score INTEGER NOT NULL
        CHECK (score >= 0 AND score <= 70),     -- HHHHHMM scale: 7 categories x 10 max
    notes TEXT,

    -- Who assessed
    assessed_by UUID REFERENCES profiles(id),
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA CLINICAL COMPLETE
-- =============================================================================
