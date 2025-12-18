-- =============================================================================
-- 21_VACCINES.SQL
-- =============================================================================
-- Vaccination records, templates, and reaction tracking.
--
-- Dependencies: 20_pets.sql
-- =============================================================================

-- =============================================================================
-- A. VACCINE TEMPLATES (Reference Data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.vaccine_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Can be global (tenant_id NULL) or clinic-specific
    tenant_id TEXT REFERENCES public.tenants(id),

    -- Vaccine info
    name TEXT NOT NULL,
    species TEXT[] NOT NULL,              -- ['dog'], ['cat'], ['dog', 'cat']
    description TEXT,

    -- Schedule
    min_age_weeks INTEGER,
    recommended_age_weeks INTEGER,
    booster_interval_days INTEGER,        -- NULL if single dose
    is_required BOOLEAN DEFAULT false,    -- Legal requirement

    -- Display
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT vaccine_templates_name_length CHECK (char_length(name) BETWEEN 2 AND 100),
    CONSTRAINT vaccine_templates_interval_positive CHECK (
        booster_interval_days IS NULL OR booster_interval_days > 0
    )
);

-- =============================================================================
-- B. VACCINES (Applied to Pets)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.vaccines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.vaccine_templates(id),
    administered_by UUID REFERENCES public.profiles(id),

    -- Vaccine details
    name TEXT NOT NULL,
    batch_number TEXT,
    manufacturer TEXT,

    -- Dates
    administered_date DATE NOT NULL,
    next_due_date DATE,

    -- Status
    status TEXT NOT NULL DEFAULT 'completed'
        CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')),

    -- Documentation
    vet_signature TEXT,                   -- Signature URL or hash
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    certificate_url TEXT,
    notes TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT vaccines_date_order CHECK (
        next_due_date IS NULL OR next_due_date > administered_date
    )
);

-- =============================================================================
-- C. VACCINE REACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.vaccine_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    vaccine_id UUID REFERENCES public.vaccines(id) ON DELETE SET NULL,

    -- Reaction details
    vaccine_brand TEXT NOT NULL,
    reaction_date DATE,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    symptoms TEXT[],
    treatment TEXT,
    outcome TEXT,
    notes TEXT,

    -- Reported by
    reported_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. ROW LEVEL SECURITY
-- =============================================================================

-- Vaccine Templates
ALTER TABLE public.vaccine_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read global templates" ON public.vaccine_templates
    FOR SELECT USING (tenant_id IS NULL AND is_active = true);

CREATE POLICY "Staff manage clinic templates" ON public.vaccine_templates
    FOR ALL TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id));

CREATE POLICY "Service role full access templates" ON public.vaccine_templates
    FOR ALL TO service_role USING (true);

-- Vaccines
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view pet vaccines" ON public.vaccines
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id) AND deleted_at IS NULL);

CREATE POLICY "Staff manage vaccines" ON public.vaccines
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pets p
            WHERE p.id = vaccines.pet_id
            AND public.is_staff_of(p.tenant_id)
        )
        AND deleted_at IS NULL
    );

CREATE POLICY "Service role full access vaccines" ON public.vaccines
    FOR ALL TO service_role USING (true);

-- Vaccine Reactions
ALTER TABLE public.vaccine_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view pet reactions" ON public.vaccine_reactions
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id));

CREATE POLICY "Staff manage reactions" ON public.vaccine_reactions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pets p
            WHERE p.id = vaccine_reactions.pet_id
            AND public.is_staff_of(p.tenant_id)
        )
    );

-- =============================================================================
-- E. INDEXES
-- =============================================================================

-- Templates
CREATE INDEX IF NOT EXISTS idx_vaccine_templates_tenant ON public.vaccine_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_templates_species ON public.vaccine_templates USING gin(species);

-- Vaccines
CREATE INDEX IF NOT EXISTS idx_vaccines_pet ON public.vaccines(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_active ON public.vaccines(pet_id, deleted_at)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vaccines_due_date ON public.vaccines(next_due_date)
    WHERE next_due_date IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vaccines_status ON public.vaccines(status)
    WHERE deleted_at IS NULL;

-- Reactions
CREATE INDEX IF NOT EXISTS idx_vaccine_reactions_pet ON public.vaccine_reactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_reactions_vaccine ON public.vaccine_reactions(vaccine_id);

-- =============================================================================
-- F. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.vaccine_templates;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.vaccine_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.vaccines;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.vaccines
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- G. DEFAULT DATA (Global Vaccine Templates)
-- =============================================================================

INSERT INTO public.vaccine_templates (tenant_id, name, species, booster_interval_days, is_required, display_order)
VALUES
    (NULL, 'Rabia', ARRAY['dog', 'cat'], 365, true, 1),
    (NULL, 'Sextuple/Polivalente', ARRAY['dog'], 365, false, 2),
    (NULL, 'Triple Felina', ARRAY['cat'], 365, false, 3),
    (NULL, 'Leucemia Felina (FeLV)', ARRAY['cat'], 365, false, 4),
    (NULL, 'Bordetella (Tos de Perrera)', ARRAY['dog'], 180, false, 5),
    (NULL, 'Leptospirosis', ARRAY['dog'], 365, false, 6)
ON CONFLICT DO NOTHING;
