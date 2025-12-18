-- =============================================================================
-- 20_PETS.SQL
-- =============================================================================
-- Pet profiles - the core entity for veterinary management.
--
-- Dependencies: 10_core/*
-- =============================================================================

-- =============================================================================
-- A. TABLE DEFINITION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    owner_id UUID NOT NULL REFERENCES public.profiles(id),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Identity
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other')),
    breed TEXT,
    color TEXT,

    -- Demographics
    sex TEXT CHECK (sex IN ('male', 'female', 'unknown')),
    birth_date DATE,
    is_neutered BOOLEAN DEFAULT false,
    neutered_date DATE,

    -- Physical characteristics
    weight_kg NUMERIC(6,2),
    weight_updated_at TIMESTAMPTZ,

    -- Identification
    microchip_number TEXT,
    microchip_date DATE,
    registration_number TEXT,

    -- Media
    photo_url TEXT,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Medical flags
    is_deceased BOOLEAN DEFAULT false,
    deceased_date DATE,
    deceased_reason TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    notes TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT pets_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
    CONSTRAINT pets_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0),
    CONSTRAINT pets_birth_not_future CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE),
    CONSTRAINT pets_deceased_consistency CHECK (
        (is_deceased = false AND deceased_date IS NULL) OR
        (is_deceased = true)
    )
);

-- =============================================================================
-- B. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Owners can view and manage their own pets
CREATE POLICY "Owners manage own pets" ON public.pets
    FOR ALL TO authenticated
    USING (owner_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (owner_id = auth.uid());

-- Staff can view and manage all pets in their tenant
CREATE POLICY "Staff manage tenant pets" ON public.pets
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

-- Service role has full access (including deleted)
CREATE POLICY "Service role full access" ON public.pets
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- C. INDEXES
-- =============================================================================

-- Primary lookups
CREATE INDEX IF NOT EXISTS idx_pets_owner ON public.pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_tenant ON public.pets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pets_tenant_owner ON public.pets(tenant_id, owner_id);

-- Soft delete filter (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_pets_active ON public.pets(tenant_id, deleted_at)
    WHERE deleted_at IS NULL;

-- Search
CREATE INDEX IF NOT EXISTS idx_pets_name_search ON public.pets
    USING gin(name gin_trgm_ops);

-- Identification
CREATE INDEX IF NOT EXISTS idx_pets_microchip ON public.pets(microchip_number)
    WHERE microchip_number IS NOT NULL;

-- Species/breed filtering
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(tenant_id, species);

-- =============================================================================
-- D. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.pets;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.pets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- E. FUNCTIONS
-- =============================================================================

-- Get pet age in human-readable format
CREATE OR REPLACE FUNCTION public.get_pet_age(pet_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_birth_date DATE;
    v_years INTEGER;
    v_months INTEGER;
BEGIN
    SELECT birth_date INTO v_birth_date
    FROM public.pets WHERE id = pet_id;

    IF v_birth_date IS NULL THEN
        RETURN NULL;
    END IF;

    v_years := EXTRACT(YEAR FROM age(CURRENT_DATE, v_birth_date));
    v_months := EXTRACT(MONTH FROM age(CURRENT_DATE, v_birth_date));

    IF v_years > 0 THEN
        RETURN v_years || ' año' || CASE WHEN v_years > 1 THEN 's' ELSE '' END;
    ELSE
        RETURN v_months || ' mes' || CASE WHEN v_months != 1 THEN 'es' ELSE '' END;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Search pets (for staff)
CREATE OR REPLACE FUNCTION public.search_pets(
    p_tenant_id TEXT,
    p_query TEXT,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    species TEXT,
    breed TEXT,
    owner_name TEXT,
    owner_phone TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.species,
        p.breed,
        pr.full_name,
        pr.phone
    FROM public.pets p
    JOIN public.profiles pr ON p.owner_id = pr.id
    WHERE p.tenant_id = p_tenant_id
    AND p.deleted_at IS NULL
    AND (
        p.name ILIKE '%' || p_query || '%'
        OR p.microchip_number ILIKE '%' || p_query || '%'
        OR pr.full_name ILIKE '%' || p_query || '%'
        OR pr.phone ILIKE '%' || p_query || '%'
    )
    ORDER BY
        CASE WHEN p.name ILIKE p_query || '%' THEN 0 ELSE 1 END,
        p.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
