-- =============================================================================
-- 03_SCHEMA_PETS.SQL
-- =============================================================================
-- Pet management tables: pets, vaccines, vaccine templates, vaccine reactions.
-- =============================================================================

-- =============================================================================
-- A. PETS
-- =============================================================================
-- Core pet information linked to owner (profile) and tenant.

CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Basic Info
    name TEXT NOT NULL,
    species TEXT NOT NULL,                  -- 'dog', 'cat', 'rabbit', 'ferret', etc.
    breed TEXT,
    birth_date DATE,
    sex TEXT CHECK (sex IN ('male', 'female')),
    is_neutered BOOLEAN DEFAULT FALSE,

    -- Physical Attributes
    weight_kg NUMERIC(5,2),
    color TEXT,
    photo_url TEXT,

    -- Identification
    microchip_id TEXT UNIQUE,

    -- Health & Behavior
    temperament TEXT,                       -- 'friendly', 'shy', 'aggressive', 'unknown'
    existing_conditions TEXT,               -- Free text summary
    allergies TEXT,

    -- Diet
    diet_category TEXT,                     -- 'balanced', 'raw', 'prescription', etc.
    diet_notes TEXT,

    -- General Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT pets_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0)
);

-- =============================================================================
-- B. VACCINE TEMPLATES
-- =============================================================================
-- Default vaccination schedules per species.
-- Used to auto-create pending vaccines when a pet is registered.

CREATE TABLE IF NOT EXISTS vaccine_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species TEXT NOT NULL,                  -- 'dog', 'cat', 'rabbit', 'ferret'
    vaccine_name TEXT NOT NULL,
    frequency TEXT,                         -- 'annual', 'one-time', 'puppy-series'
    is_mandatory BOOLEAN DEFAULT FALSE,
    description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One template per vaccine per species
    UNIQUE(species, vaccine_name)
);

-- Seed default templates (Paraguay context)
INSERT INTO vaccine_templates (species, vaccine_name, is_mandatory, frequency, description) VALUES
    -- Dogs
    ('dog', 'Rabia', TRUE, 'annual', 'Obligatoria por ley. Anual a partir de los 3 meses.'),
    ('dog', 'Sextuple/Polivalente', TRUE, 'annual', 'Moquillo, Parvovirus, Hepatitis, Leptospirosis, Parainfluenza. Refuerzo anual.'),
    -- Cats
    ('cat', 'Rabia', TRUE, 'annual', 'Obligatoria por ley. Anual.'),
    ('cat', 'Triple Felina', TRUE, 'annual', 'Rinotraqueitis, Calicivirus, Panleucopenia. Refuerzo anual.'),
    ('cat', 'Leucemia Felina (FeLV)', FALSE, 'annual', 'Recomendada para gatos con acceso al exterior.'),
    -- Rabbits
    ('rabbit', 'Mixomatosis', TRUE, 'biannual', 'Alta mortalidad. Semestral o anual según riesgo.'),
    ('rabbit', 'Enfermedad Hemorrágica Viral (RHD)', TRUE, 'annual', 'Mortal. Refuerzo anual.'),
    -- Ferrets
    ('ferret', 'Rabia', TRUE, 'annual', 'Obligatoria. Anual.'),
    ('ferret', 'Moquillo (Distemper)', TRUE, 'annual', 'Muy susceptible. Vacuna específica o canina recombinante.')
ON CONFLICT (species, vaccine_name) DO NOTHING;

-- =============================================================================
-- C. VACCINES
-- =============================================================================
-- Individual vaccine records for each pet.

CREATE TABLE IF NOT EXISTS vaccines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Vaccine Details
    name TEXT NOT NULL,
    administered_date DATE,
    next_due_date DATE,
    batch_number TEXT,

    -- Administration
    administered_by UUID REFERENCES profiles(id),   -- Vet who administered
    vet_signature TEXT,                             -- Digital signature

    -- Status Workflow
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verified', 'rejected')),

    -- Evidence
    photos TEXT[],                                  -- Array of photo URLs

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT vaccines_dates_logic CHECK (
        next_due_date IS NULL OR administered_date IS NULL OR next_due_date >= administered_date
    )
);

-- =============================================================================
-- D. VACCINE REACTIONS
-- =============================================================================
-- Track adverse reactions to vaccines for safety monitoring.

CREATE TABLE IF NOT EXISTS vaccine_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vaccine_id UUID REFERENCES vaccines(id) ON DELETE CASCADE,

    -- Reaction Details
    vaccine_brand TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reaction_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. QR TAGS
-- =============================================================================
-- Physical QR tags for pet identification (collars, etc.)

CREATE TABLE IF NOT EXISTS qr_tags (
    code TEXT PRIMARY KEY,                          -- Unique tag code
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    tenant_id TEXT REFERENCES tenants(id),          -- Batch ownership

    -- Status
    status TEXT NOT NULL DEFAULT 'unassigned'
        CHECK (status IN ('active', 'unassigned', 'lost')),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. CLINIC PATIENT ACCESS
-- =============================================================================
-- Cross-clinic access for pets (e.g., referrals, emergencies)

CREATE TABLE IF NOT EXISTS clinic_patient_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Access Level
    access_level TEXT DEFAULT 'write'
        CHECK (access_level IN ('read', 'write')),

    -- Metadata
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One access record per clinic-pet pair
    UNIQUE(clinic_id, pet_id)
);

-- =============================================================================
-- SCHEMA PETS COMPLETE
-- =============================================================================
