-- =============================================================================
-- 02_PROFILES.SQL
-- =============================================================================
-- User profiles extending auth.users with application-specific data.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT REFERENCES public.tenants(id),

    -- Identity
    full_name TEXT,
    email TEXT,
    phone TEXT,
    secondary_phone TEXT,
    avatar_url TEXT,

    -- Role-based access control
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'vet', 'admin')),

    -- Owner-specific fields
    client_code TEXT,
    address TEXT,
    city TEXT,
    document_type TEXT,
    document_number TEXT,
    preferred_contact TEXT DEFAULT 'phone' CHECK (preferred_contact IN ('phone', 'email', 'whatsapp')),

    -- Vet-specific fields
    signature_url TEXT,
    license_number TEXT,
    specializations TEXT[],

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT profiles_phone_length CHECK (phone IS NULL OR char_length(phone) >= 6),
    CONSTRAINT profiles_email_format CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Staff view tenant profiles" ON public.profiles;
CREATE POLICY "Staff view tenant profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Staff update tenant profiles" ON public.profiles;
CREATE POLICY "Staff update tenant profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id) AND id != auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
CREATE POLICY "Service role full access" ON public.profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_role ON public.profiles(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON public.profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON public.profiles USING gin(full_name gin_trgm_ops);

-- Unique client code per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_client_code ON public.profiles(tenant_id, client_code)
    WHERE client_code IS NOT NULL AND deleted_at IS NULL;

-- Staff lookup optimization for RLS
CREATE INDEX IF NOT EXISTS idx_profiles_staff_lookup ON public.profiles(id, tenant_id, role)
    WHERE role IN ('vet', 'admin') AND deleted_at IS NULL;

-- Staff listing
CREATE INDEX IF NOT EXISTS idx_profiles_staff_list ON public.profiles(tenant_id, role)
    INCLUDE (full_name, email, phone, avatar_url)
    WHERE role IN ('vet', 'admin') AND deleted_at IS NULL;

-- Client listing
CREATE INDEX IF NOT EXISTS idx_profiles_client_list ON public.profiles(tenant_id)
    INCLUDE (full_name, email, phone, client_code, avatar_url)
    WHERE role = 'owner' AND deleted_at IS NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS protect_critical_columns ON public.profiles;
CREATE TRIGGER protect_critical_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_critical_profile_columns();

-- =============================================================================
-- DEMO ACCOUNTS TABLE (For Development - DELETE IN PRODUCTION)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.demo_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'vet', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manage demo accounts" ON public.demo_accounts;
CREATE POLICY "Service role manage demo accounts" ON public.demo_accounts
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- AUTH TRIGGER (Create profile on signup) - NO HARDCODED EMAILS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
    demo_record RECORD;
    v_tenant_id TEXT;
    v_role TEXT;
BEGIN
    -- Check for pending invite (highest priority)
    SELECT tenant_id, role INTO invite_record
    FROM public.clinic_invites
    WHERE email = NEW.email
    AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT 1;

    IF invite_record.tenant_id IS NOT NULL THEN
        v_tenant_id := invite_record.tenant_id;
        v_role := COALESCE(invite_record.role, 'owner');
        DELETE FROM public.clinic_invites WHERE email = NEW.email;
    ELSE
        -- Check demo_accounts table (configurable, not hardcoded)
        SELECT tenant_id, role INTO demo_record
        FROM public.demo_accounts
        WHERE email = NEW.email AND is_active = true;

        IF demo_record.tenant_id IS NOT NULL THEN
            v_tenant_id := demo_record.tenant_id;
            v_role := demo_record.role;
        ELSE
            v_tenant_id := NULL;
            v_role := 'owner';
        END IF;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, avatar_url, tenant_id, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        v_tenant_id,
        v_role
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
