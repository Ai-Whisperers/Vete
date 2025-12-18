-- =============================================================================
-- 23_SCHEMA_HOSPITALIZATION.SQL
-- =============================================================================
-- Hospitalization and boarding management for veterinary clinics.
-- Includes kennels, hospitalization records, vitals monitoring, and feeding.
-- =============================================================================

-- =============================================================================
-- A. KENNELS / CAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS kennels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Kennel info
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    location TEXT, -- e.g., 'Ward A', 'ICU', 'Isolation'
    kennel_type TEXT NOT NULL DEFAULT 'standard' CHECK (kennel_type IN (
        'standard', 'large', 'small', 'icu', 'isolation', 'exotic', 'recovery'
    )),

    -- Specifications
    size_category TEXT NOT NULL DEFAULT 'medium' CHECK (size_category IN ('small', 'medium', 'large', 'xlarge')),
    max_weight_kg DECIMAL(6,2),
    species_allowed TEXT[] DEFAULT ARRAY['dog', 'cat'],

    -- Features
    has_oxygen BOOLEAN DEFAULT FALSE,
    has_heating BOOLEAN DEFAULT FALSE,
    has_iv_pole BOOLEAN DEFAULT FALSE,
    has_camera BOOLEAN DEFAULT FALSE,

    -- Pricing
    daily_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
    icu_surcharge DECIMAL(12,2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    current_status TEXT DEFAULT 'available' CHECK (current_status IN (
        'available', 'occupied', 'cleaning', 'maintenance', 'reserved'
    )),

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- =============================================================================
-- B. HOSPITALIZATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    kennel_id UUID REFERENCES kennels(id) ON DELETE SET NULL,

    -- Hospitalization info
    hospitalization_number TEXT NOT NULL,
    hospitalization_type TEXT NOT NULL DEFAULT 'medical' CHECK (hospitalization_type IN (
        'medical', 'surgical', 'boarding', 'observation', 'emergency', 'quarantine'
    )),

    -- Dates
    admitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_discharge_at TIMESTAMPTZ,
    actual_discharge_at TIMESTAMPTZ,

    -- Admitting info
    admitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    discharged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    primary_vet_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Clinical info
    admission_reason TEXT NOT NULL,
    admission_diagnosis TEXT,
    admission_weight_kg DECIMAL(6,2),
    discharge_diagnosis TEXT,
    discharge_weight_kg DECIMAL(6,2),
    discharge_instructions TEXT,

    -- Treatment plan
    treatment_plan JSONB DEFAULT '{}',
    -- Structure: {
    --   "medications": [{"name": "", "dose": "", "frequency": "", "route": ""}],
    --   "procedures": [{"name": "", "frequency": ""}],
    --   "monitoring": {"vitals_frequency": "q4h", "special_observations": []}
    -- }

    -- Diet
    diet_instructions TEXT,
    feeding_schedule JSONB DEFAULT '[]',
    -- Structure: [{"time": "08:00", "food": "", "amount": "", "special_instructions": ""}]

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'discharged', 'transferred', 'deceased', 'escaped'
    )),
    acuity_level TEXT DEFAULT 'stable' CHECK (acuity_level IN (
        'critical', 'unstable', 'stable', 'improving', 'ready_for_discharge'
    )),

    -- Emergency contacts
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    owner_consent_given BOOLEAN DEFAULT FALSE,
    consent_document_url TEXT,

    -- Billing
    estimated_daily_cost DECIMAL(12,2),
    deposit_amount DECIMAL(12,2) DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT FALSE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Metadata
    notes TEXT,
    internal_notes TEXT, -- Staff only notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, hospitalization_number)
);

-- =============================================================================
-- C. HOSPITALIZATION VITALS
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Who recorded
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Vital signs
    temperature_celsius DECIMAL(4,1),
    heart_rate_bpm INTEGER,
    respiratory_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    oxygen_saturation DECIMAL(4,1),
    weight_kg DECIMAL(6,2),

    -- Pain assessment (0-10 scale)
    pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
    pain_location TEXT,

    -- Hydration
    hydration_status TEXT CHECK (hydration_status IN (
        'normal', 'mild_dehydration', 'moderate_dehydration', 'severe_dehydration'
    )),

    -- Mental status
    mental_status TEXT CHECK (mental_status IN (
        'alert', 'responsive', 'lethargic', 'obtunded', 'comatose'
    )),

    -- GI status
    appetite TEXT CHECK (appetite IN ('normal', 'decreased', 'none', 'increased')),
    vomiting BOOLEAN DEFAULT FALSE,
    diarrhea BOOLEAN DEFAULT FALSE,
    urination TEXT CHECK (urination IN ('normal', 'increased', 'decreased', 'none', 'blood')),
    defecation TEXT CHECK (defecation IN ('normal', 'constipated', 'diarrhea', 'none', 'blood')),

    -- IV/Fluids
    iv_fluid_type TEXT,
    iv_rate_ml_hr INTEGER,
    total_fluids_in_ml INTEGER,
    total_fluids_out_ml INTEGER,

    -- Observations
    observations TEXT,
    abnormalities TEXT,

    -- Photos/attachments
    photo_urls TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. HOSPITALIZATION TREATMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Treatment info
    treatment_type TEXT NOT NULL CHECK (treatment_type IN (
        'medication', 'procedure', 'fluid_therapy', 'feeding', 'wound_care',
        'physical_therapy', 'diagnostic', 'other'
    )),
    treatment_name TEXT NOT NULL,

    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,

    -- Who
    scheduled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Details
    dosage TEXT,
    route TEXT, -- oral, IV, IM, SC, topical, etc.
    quantity DECIMAL(10,2),
    unit TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'completed', 'skipped', 'refused', 'held'
    )),
    skip_reason TEXT,

    -- Outcome
    response TEXT,
    adverse_reaction BOOLEAN DEFAULT FALSE,
    adverse_reaction_details TEXT,

    -- Billing
    is_billable BOOLEAN DEFAULT TRUE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    charge_amount DECIMAL(12,2),

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- E. FEEDING LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_feedings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Feeding info
    scheduled_at TIMESTAMPTZ NOT NULL,
    fed_at TIMESTAMPTZ,
    fed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Food details
    food_type TEXT NOT NULL,
    amount_offered TEXT,
    amount_consumed TEXT,
    consumption_percentage INTEGER CHECK (consumption_percentage >= 0 AND consumption_percentage <= 100),

    -- Method
    feeding_method TEXT DEFAULT 'voluntary' CHECK (feeding_method IN (
        'voluntary', 'assisted', 'syringe', 'tube', 'iv_nutrition'
    )),

    -- Water
    water_offered BOOLEAN DEFAULT TRUE,
    water_consumed TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'fed', 'refused', 'vomited', 'skipped'
    )),

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- F. KENNEL TRANSFERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS kennel_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Transfer details
    from_kennel_id UUID REFERENCES kennels(id) ON DELETE SET NULL,
    to_kennel_id UUID REFERENCES kennels(id) ON DELETE SET NULL,
    transferred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transferred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Reason
    reason TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- G. VISITATION LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Visitor info
    visitor_name TEXT NOT NULL,
    visitor_relationship TEXT, -- owner, family, other
    visitor_phone TEXT,

    -- Visit details
    visit_start TIMESTAMPTZ NOT NULL,
    visit_end TIMESTAMPTZ,

    -- Authorization
    authorized_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,
    pet_response TEXT, -- How the pet responded to the visit

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- H. HOSPITALIZATION DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Document info
    document_type TEXT NOT NULL CHECK (document_type IN (
        'consent', 'estimate', 'discharge_summary', 'lab_result',
        'imaging', 'referral', 'other'
    )),
    title TEXT NOT NULL,
    description TEXT,

    -- File
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes INTEGER,

    -- Who
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- I. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_kennels_tenant ON kennels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kennels_status ON kennels(current_status) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_kennels_type ON kennels(tenant_id, kennel_type);

CREATE INDEX IF NOT EXISTS idx_hospitalizations_tenant ON hospitalizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_pet ON hospitalizations(pet_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_kennel ON hospitalizations(kennel_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON hospitalizations(status);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_active ON hospitalizations(tenant_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_hospitalizations_dates ON hospitalizations(admitted_at, actual_discharge_at);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_vet ON hospitalizations(primary_vet_id);

CREATE INDEX IF NOT EXISTS idx_hosp_vitals_hospitalization ON hospitalization_vitals(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_vitals_time ON hospitalization_vitals(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_hosp_treatments_hospitalization ON hospitalization_treatments(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_treatments_scheduled ON hospitalization_treatments(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_hosp_treatments_status ON hospitalization_treatments(status);

CREATE INDEX IF NOT EXISTS idx_hosp_feedings_hospitalization ON hospitalization_feedings(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_feedings_scheduled ON hospitalization_feedings(scheduled_at) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_kennel_transfers_hospitalization ON kennel_transfers(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_visits_hospitalization ON hospitalization_visits(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_documents_hospitalization ON hospitalization_documents(hospitalization_id);

-- =============================================================================
-- J. TRIGGERS
-- =============================================================================

-- Update timestamps
CREATE TRIGGER update_kennels_updated_at
    BEFORE UPDATE ON kennels
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_hospitalizations_updated_at
    BEFORE UPDATE ON hospitalizations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_hospitalization_treatments_updated_at
    BEFORE UPDATE ON hospitalization_treatments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- K. FUNCTIONS
-- =============================================================================

-- Generate hospitalization number
CREATE OR REPLACE FUNCTION generate_hospitalization_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
    v_number TEXT;
BEGIN
    v_prefix := 'H';
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(hospitalization_number FROM 4) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM hospitalizations
    WHERE tenant_id = p_tenant_id
      AND hospitalization_number LIKE v_prefix || v_year || '%';

    v_number := v_prefix || v_year || LPAD(v_sequence::TEXT, 5, '0');

    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Update kennel status based on hospitalizations
CREATE OR REPLACE FUNCTION update_kennel_status()
RETURNS TRIGGER AS $$
BEGIN
    -- When hospitalization is created or kennel assigned
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.kennel_id IS DISTINCT FROM OLD.kennel_id) THEN
        -- Mark new kennel as occupied
        IF NEW.kennel_id IS NOT NULL AND NEW.status = 'active' THEN
            UPDATE kennels SET current_status = 'occupied' WHERE id = NEW.kennel_id;
        END IF;

        -- Mark old kennel as available (if changed)
        IF TG_OP = 'UPDATE' AND OLD.kennel_id IS NOT NULL AND OLD.kennel_id != NEW.kennel_id THEN
            UPDATE kennels SET current_status = 'cleaning' WHERE id = OLD.kennel_id;
        END IF;
    END IF;

    -- When hospitalization is discharged
    IF TG_OP = 'UPDATE' AND NEW.status IN ('discharged', 'transferred', 'deceased') AND OLD.status = 'active' THEN
        IF NEW.kennel_id IS NOT NULL THEN
            UPDATE kennels SET current_status = 'cleaning' WHERE id = NEW.kennel_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hospitalization_kennel_status
    AFTER INSERT OR UPDATE ON hospitalizations
    FOR EACH ROW EXECUTE FUNCTION update_kennel_status();

-- Get current hospitalizations summary
CREATE OR REPLACE FUNCTION get_hospitalization_census(p_tenant_id TEXT)
RETURNS TABLE (
    total_active INTEGER,
    by_type JSONB,
    by_acuity JSONB,
    kennel_availability JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM hospitalizations WHERE tenant_id = p_tenant_id AND status = 'active'),
        (SELECT COALESCE(jsonb_object_agg(hospitalization_type, cnt), '{}'::jsonb)
         FROM (SELECT hospitalization_type, COUNT(*) as cnt
               FROM hospitalizations WHERE tenant_id = p_tenant_id AND status = 'active'
               GROUP BY hospitalization_type) t),
        (SELECT COALESCE(jsonb_object_agg(acuity_level, cnt), '{}'::jsonb)
         FROM (SELECT acuity_level, COUNT(*) as cnt
               FROM hospitalizations WHERE tenant_id = p_tenant_id AND status = 'active'
               GROUP BY acuity_level) t),
        (SELECT COALESCE(jsonb_object_agg(current_status, cnt), '{}'::jsonb)
         FROM (SELECT current_status, COUNT(*) as cnt
               FROM kennels WHERE tenant_id = p_tenant_id AND is_active = TRUE
               GROUP BY current_status) t);
END;
$$ LANGUAGE plpgsql;

-- Get pending treatments
CREATE OR REPLACE FUNCTION get_pending_treatments(
    p_tenant_id TEXT,
    p_hours_ahead INTEGER DEFAULT 4
)
RETURNS TABLE (
    treatment_id UUID,
    hospitalization_id UUID,
    pet_name TEXT,
    kennel_code TEXT,
    treatment_type TEXT,
    treatment_name TEXT,
    scheduled_at TIMESTAMPTZ,
    dosage TEXT,
    route TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.hospitalization_id,
        p.name,
        k.code,
        t.treatment_type,
        t.treatment_name,
        t.scheduled_at,
        t.dosage,
        t.route
    FROM hospitalization_treatments t
    JOIN hospitalizations h ON t.hospitalization_id = h.id
    JOIN pets p ON h.pet_id = p.id
    LEFT JOIN kennels k ON h.kennel_id = k.id
    WHERE h.tenant_id = p_tenant_id
      AND h.status = 'active'
      AND t.status = 'scheduled'
      AND t.scheduled_at <= NOW() + (p_hours_ahead || ' hours')::INTERVAL
    ORDER BY t.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- L. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE kennels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kennel_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_documents ENABLE ROW LEVEL SECURITY;

-- Kennels: Staff can manage
CREATE POLICY kennels_select ON kennels FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY kennels_insert ON kennels FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY kennels_update ON kennels FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY kennels_delete ON kennels FOR DELETE TO authenticated
    USING (is_staff_of(tenant_id));

-- Hospitalizations: Staff can manage, owners can view their pets
CREATE POLICY hospitalizations_select_staff ON hospitalizations FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY hospitalizations_select_owner ON hospitalizations FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pets WHERE pets.id = hospitalizations.pet_id AND pets.owner_id = auth.uid()
        )
    );

CREATE POLICY hospitalizations_insert ON hospitalizations FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY hospitalizations_update ON hospitalizations FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY hospitalizations_delete ON hospitalizations FOR DELETE TO authenticated
    USING (is_staff_of(tenant_id));

-- Vitals: Staff only
CREATE POLICY hosp_vitals_select ON hospitalization_vitals FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_vitals.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_vitals_insert ON hospitalization_vitals FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_vitals.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

CREATE POLICY hosp_vitals_update ON hospitalization_vitals FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_vitals.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Treatments: Staff only
CREATE POLICY hosp_treatments_select ON hospitalization_treatments FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_treatments.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_treatments_insert ON hospitalization_treatments FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_treatments.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

CREATE POLICY hosp_treatments_update ON hospitalization_treatments FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_treatments.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Feedings: Staff only for management
CREATE POLICY hosp_feedings_select ON hospitalization_feedings FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_feedings.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_feedings_insert ON hospitalization_feedings FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_feedings.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

CREATE POLICY hosp_feedings_update ON hospitalization_feedings FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_feedings.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Transfers: Staff only
CREATE POLICY kennel_transfers_all ON kennel_transfers FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = kennel_transfers.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Visits: Staff and owners
CREATE POLICY hosp_visits_select ON hospitalization_visits FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_visits.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_visits_insert ON hospitalization_visits FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_visits.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Documents: Staff and owners can view
CREATE POLICY hosp_documents_select ON hospitalization_documents FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_documents.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_documents_insert ON hospitalization_documents FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_documents.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- =============================================================================
-- HOSPITALIZATION SCHEMA COMPLETE
-- =============================================================================
