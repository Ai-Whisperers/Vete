-- =============================================================================
-- 02_VACCINES.SQL
-- =============================================================================
-- Vaccination records, templates, and reaction tracking.
-- INCLUDES tenant_id on vaccines for optimized RLS.
-- =============================================================================

-- =============================================================================
-- VACCINE TEMPLATES (Reference Data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.vaccine_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES public.tenants(id),

    -- Vaccine info
    name TEXT NOT NULL,
    species TEXT[] NOT NULL,
    description TEXT,

    -- Schedule
    min_age_weeks INTEGER,
    recommended_age_weeks INTEGER,
    booster_interval_days INTEGER,
    is_required BOOLEAN DEFAULT false,

    -- Display
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT vaccine_templates_name_length CHECK (char_length(name) BETWEEN 2 AND 100),
    CONSTRAINT vaccine_templates_interval_positive CHECK (booster_interval_days IS NULL OR booster_interval_days > 0)
);

-- =============================================================================
-- VACCINES (Applied to Pets) - WITH TENANT_ID FOR OPTIMIZED RLS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.vaccines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),  -- Direct tenant reference
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
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')),

    -- Documentation
    vet_signature TEXT,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    certificate_url TEXT,
    notes TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT vaccines_date_order CHECK (next_due_date IS NULL OR next_due_date > administered_date)
);

-- =============================================================================
-- VACCINE REACTIONS - WITH TENANT_ID
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.vaccine_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
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
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.vaccine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_reactions ENABLE ROW LEVEL SECURITY;

-- Templates
DROP POLICY IF EXISTS "Public read global templates" ON public.vaccine_templates;
CREATE POLICY "Public read global templates" ON public.vaccine_templates
    FOR SELECT USING (tenant_id IS NULL AND is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Staff manage clinic templates" ON public.vaccine_templates;
CREATE POLICY "Staff manage clinic templates" ON public.vaccine_templates
    FOR ALL TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access templates" ON public.vaccine_templates;
CREATE POLICY "Service role full access templates" ON public.vaccine_templates
    FOR ALL TO service_role USING (true);

-- Vaccines (OPTIMIZED: uses direct tenant_id)
DROP POLICY IF EXISTS "Owners view pet vaccines" ON public.vaccines;
CREATE POLICY "Owners view pet vaccines" ON public.vaccines
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Staff manage vaccines" ON public.vaccines;
CREATE POLICY "Staff manage vaccines" ON public.vaccines
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role full access vaccines" ON public.vaccines;
CREATE POLICY "Service role full access vaccines" ON public.vaccines
    FOR ALL TO service_role USING (true);

-- Reactions (OPTIMIZED: uses direct tenant_id)
DROP POLICY IF EXISTS "Owners view pet reactions" ON public.vaccine_reactions;
CREATE POLICY "Owners view pet reactions" ON public.vaccine_reactions
    FOR SELECT TO authenticated
    USING (public.is_owner_of_pet(pet_id));

DROP POLICY IF EXISTS "Staff manage reactions" ON public.vaccine_reactions;
CREATE POLICY "Staff manage reactions" ON public.vaccine_reactions
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access reactions" ON public.vaccine_reactions;
CREATE POLICY "Service role full access reactions" ON public.vaccine_reactions
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_vaccine_templates_tenant ON public.vaccine_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_templates_species ON public.vaccine_templates USING gin(species);
CREATE INDEX IF NOT EXISTS idx_vaccine_templates_active ON public.vaccine_templates(id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_vaccines_pet ON public.vaccines(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_tenant ON public.vaccines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_active ON public.vaccines(pet_id, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vaccines_status ON public.vaccines(status) WHERE deleted_at IS NULL;

-- Covering index for vaccine history
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_history ON public.vaccines(pet_id, administered_date DESC)
    INCLUDE (name, status, next_due_date, administered_by) WHERE deleted_at IS NULL;

-- Due vaccines for reminders
CREATE INDEX IF NOT EXISTS idx_vaccines_due ON public.vaccines(tenant_id, next_due_date)
    INCLUDE (pet_id, name, status)
    WHERE next_due_date IS NOT NULL AND status = 'completed' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_vaccine_reactions_pet ON public.vaccine_reactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_reactions_tenant ON public.vaccine_reactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_reactions_vaccine ON public.vaccine_reactions(vaccine_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.vaccine_templates;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.vaccine_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.vaccines;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.vaccines
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-set tenant_id from pet
CREATE OR REPLACE FUNCTION public.vaccines_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        SELECT tenant_id INTO NEW.tenant_id FROM public.pets WHERE id = NEW.pet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vaccines_auto_tenant ON public.vaccines;
CREATE TRIGGER vaccines_auto_tenant
    BEFORE INSERT ON public.vaccines
    FOR EACH ROW EXECUTE FUNCTION public.vaccines_set_tenant_id();

-- Auto-set tenant_id for reactions
CREATE OR REPLACE FUNCTION public.vaccine_reactions_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        SELECT tenant_id INTO NEW.tenant_id FROM public.pets WHERE id = NEW.pet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vaccine_reactions_auto_tenant ON public.vaccine_reactions;
CREATE TRIGGER vaccine_reactions_auto_tenant
    BEFORE INSERT ON public.vaccine_reactions
    FOR EACH ROW EXECUTE FUNCTION public.vaccine_reactions_set_tenant_id();
