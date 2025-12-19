-- =============================================================================
-- 01_TENANTS.SQL
-- =============================================================================
-- Multi-tenant support: each clinic is a tenant with isolated data.
-- This is the foundation table - all other tables reference tenant_id.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,

    -- Contact information
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Paraguay',

    -- Business information
    ruc TEXT,
    logo_url TEXT,
    website_url TEXT,

    -- Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{}'::jsonb,

    -- Feature flags
    features_enabled TEXT[] DEFAULT ARRAY['core'],

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT tenants_id_format CHECK (id ~ '^[a-z][a-z0-9_-]*$'),
    CONSTRAINT tenants_id_length CHECK (char_length(id) BETWEEN 2 AND 50),
    CONSTRAINT tenants_name_length CHECK (char_length(name) BETWEEN 2 AND 100)
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active tenants" ON public.tenants;
CREATE POLICY "Public read active tenants" ON public.tenants
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access" ON public.tenants;
CREATE POLICY "Service role full access" ON public.tenants
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_tenants_active ON public.tenants(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tenants_name ON public.tenants USING gin(name gin_trgm_ops);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.tenants;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
