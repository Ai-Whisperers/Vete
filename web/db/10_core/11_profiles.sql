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

-- Users can insert their own profile (fallback if trigger fails)
CREATE POLICY "Users insert own profile" ON public.profiles
    FOR INSERT TO authenticated
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
-- E. DEMO ACCOUNTS TABLE (for development/testing)
-- =============================================================================
-- Allows configuring demo accounts through the database instead of hardcoding.
-- IMPORTANT: Disable or delete in production environments!

CREATE TABLE IF NOT EXISTS public.demo_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'vet', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Only allow demo accounts with specific email patterns
    CONSTRAINT demo_accounts_email_pattern CHECK (
        email LIKE '%@demo.%' OR
        email LIKE '%@test.%' OR
        email LIKE '%@example.%' OR
        email LIKE '%@petlife.%'
    )
);

-- RLS: Only service role can manage demo accounts
ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manage demo accounts" ON public.demo_accounts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed default demo accounts (idempotent)
INSERT INTO public.demo_accounts (email, tenant_id, role) VALUES
    ('admin@demo.com', 'adris', 'admin'),
    ('vet@demo.com', 'adris', 'vet'),
    ('owner@demo.com', 'adris', 'owner'),
    ('owner2@demo.com', 'adris', 'owner'),
    ('vet@petlife.com', 'petlife', 'vet'),
    ('admin@petlife.com', 'petlife', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- F. AUTH TRIGGER (Create profile on signup)
-- =============================================================================
-- This trigger runs when a new user signs up via Supabase Auth.
-- It creates a profile with the appropriate tenant and role based on:
-- 1. Pending invites (highest priority)
-- 2. Demo account configuration (for dev/test)
-- 3. Default: no tenant, owner role (user assigned to clinic later)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
    demo_record RECORD;
    v_tenant_id TEXT;
    v_role TEXT;
BEGIN
    -- 1. Check for pending invite (highest priority)
    BEGIN
        SELECT tenant_id, role INTO invite_record
        FROM public.clinic_invites
        WHERE email = NEW.email
        AND status = 'pending'
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC
        LIMIT 1;

        IF invite_record.tenant_id IS NOT NULL THEN
            v_tenant_id := invite_record.tenant_id;
            v_role := COALESCE(invite_record.role, 'owner');

            -- Mark invite as accepted
            UPDATE public.clinic_invites
            SET status = 'accepted',
                accepted_at = NOW(),
                accepted_by = NEW.id
            WHERE email = NEW.email AND status = 'pending';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- clinic_invites table might not exist yet, continue
        NULL;
    END;

    -- 2. If no invite, check demo accounts (for dev/test environments)
    IF v_tenant_id IS NULL THEN
        BEGIN
            SELECT tenant_id, role INTO demo_record
            FROM public.demo_accounts
            WHERE email = NEW.email
            AND is_active = true;

            IF demo_record.tenant_id IS NOT NULL THEN
                v_tenant_id := demo_record.tenant_id;
                v_role := demo_record.role;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- demo_accounts table might not exist yet, continue
            NULL;
        END;
    END IF;

    -- 3. Default: no tenant assigned (user will be assigned later via portal)
    IF v_tenant_id IS NULL THEN
        v_role := 'owner';
    END IF;

    -- Create profile (with conflict handling for safety)
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        avatar_url,
        tenant_id,
        role
    ) VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        v_tenant_id,
        v_role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the auth flow
    -- Profile will be created by application fallback
    RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- G. HELPER FUNCTION: Check if demo mode is enabled
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_demo_mode()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.demo_accounts WHERE is_active = true LIMIT 1
    );
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;
