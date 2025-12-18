-- =============================================================================
-- 11_PROFILES.SQL
-- =============================================================================
-- User profiles extending auth.users with application-specific data.
-- Created automatically via trigger when a user signs up.
--
-- Dependencies: 10_tenants.sql
-- =============================================================================

-- =============================================================================
-- A. TABLE DEFINITION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    -- Links to Supabase Auth
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tenant association (required for multi-tenancy)
    tenant_id TEXT REFERENCES public.tenants(id),

    -- Identity
    full_name TEXT,
    email TEXT,
    phone TEXT,
    secondary_phone TEXT,
    avatar_url TEXT,

    -- Role-based access control
    role TEXT NOT NULL DEFAULT 'owner'
        CHECK (role IN ('owner', 'vet', 'admin')),

    -- Owner-specific fields
    client_code TEXT,                      -- Unique ID per tenant for billing
    address TEXT,
    city TEXT,
    document_type TEXT,                    -- CI, Passport, etc.
    document_number TEXT,
    preferred_contact TEXT DEFAULT 'phone'
        CHECK (preferred_contact IN ('phone', 'email', 'whatsapp')),

    -- Vet-specific fields
    signature_url TEXT,                    -- Digital signature for prescriptions
    license_number TEXT,                   -- Professional license
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
-- B. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile (with restrictions)
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Staff can view all profiles in their tenant
CREATE POLICY "Staff view tenant profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        tenant_id IS NOT NULL
        AND public.is_staff_of(tenant_id)
        AND deleted_at IS NULL
    );

-- Staff can update profiles in their tenant (except their own role/tenant)
CREATE POLICY "Staff update tenant profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
        tenant_id IS NOT NULL
        AND public.is_staff_of(tenant_id)
        AND id != auth.uid()  -- Can't modify own critical fields
        AND deleted_at IS NULL
    );

-- Service role has full access
CREATE POLICY "Service role full access" ON public.profiles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- C. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_role ON public.profiles(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON public.profiles(deleted_at)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_client_code ON public.profiles(tenant_id, client_code)
    WHERE client_code IS NOT NULL;

-- Full-text search on name
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON public.profiles
    USING gin(full_name gin_trgm_ops);

-- =============================================================================
-- D. TRIGGERS
-- =============================================================================

-- Updated_at trigger
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Protect critical columns trigger
DROP TRIGGER IF EXISTS protect_critical_columns ON public.profiles;
CREATE TRIGGER protect_critical_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_critical_profile_columns();

-- =============================================================================
-- E. AUTH TRIGGER (Create profile on signup)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
    v_tenant_id TEXT;
    v_role TEXT;
BEGIN
    -- Check for pending invite
    SELECT tenant_id, role INTO invite_record
    FROM public.clinic_invites
    WHERE email = NEW.email
    AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT 1;

    IF invite_record.tenant_id IS NOT NULL THEN
        -- User was invited to a specific clinic
        v_tenant_id := invite_record.tenant_id;
        v_role := COALESCE(invite_record.role, 'owner');

        -- Mark invite as used
        DELETE FROM public.clinic_invites WHERE email = NEW.email;
    ELSE
        -- Handle known demo accounts (for development/testing)
        CASE
            WHEN NEW.email IN ('admin@demo.com', 'vet@demo.com', 'owner@demo.com', 'owner2@demo.com') THEN
                v_tenant_id := 'adris';
                v_role := CASE
                    WHEN NEW.email = 'admin@demo.com' THEN 'admin'
                    WHEN NEW.email = 'vet@demo.com' THEN 'vet'
                    ELSE 'owner'
                END;
            WHEN NEW.email IN ('vet@petlife.com', 'admin@petlife.com') THEN
                v_tenant_id := 'petlife';
                v_role := CASE
                    WHEN NEW.email = 'admin@petlife.com' THEN 'admin'
                    ELSE 'vet'
                END;
            ELSE
                -- New user without invite - tenant assigned later
                v_tenant_id := NULL;
                v_role := 'owner';
        END CASE;
    END IF;

    -- Create profile
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        avatar_url,
        tenant_id,
        role
    ) VALUES (
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

-- Create trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
