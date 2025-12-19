-- =============================================================================
-- 02_SCHEMA_CORE.SQL
-- =============================================================================
-- Core tables: tenants (clinics), profiles (users), and clinic invites.
-- These are the foundation tables that other tables depend on.
-- =============================================================================

-- =============================================================================
-- A. TENANTS (Clinics)
-- =============================================================================
-- Multi-tenant support: each clinic is a tenant with isolated data.
-- Using text ID for readable URLs (e.g., 'adris', 'petlife')

CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,                    -- Slug: 'adris', 'petlife'
    name TEXT NOT NULL,                     -- Display name: 'Veterinaria Adris'

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize default tenants (required before creating profiles)
INSERT INTO tenants (id, name) VALUES
    ('adris', 'Veterinaria Adris'),
    ('petlife', 'PetLife Center')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- B. PROFILES (Users: Owners, Vets, Admins)
-- =============================================================================
-- Extends auth.users with application-specific data.
-- Created automatically via trigger when a user signs up.

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Identity
    full_name TEXT,
    email TEXT,
    phone TEXT,
    secondary_phone TEXT,
    avatar_url TEXT,

    -- Role-based access
    role TEXT NOT NULL DEFAULT 'owner'
        CHECK (role IN ('owner', 'vet', 'admin')),

    -- Owner-specific
    client_code TEXT,                       -- Unique ID per tenant for billing
    address TEXT,
    city TEXT,

    -- Vet-specific
    signature_url TEXT,                     -- Digital signature for prescriptions

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT profiles_phone_length CHECK (phone IS NULL OR char_length(phone) >= 6),
    CONSTRAINT profiles_email_format CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- =============================================================================
-- C. CLINIC INVITES
-- =============================================================================
-- Pending invitations for staff (vets/admins) to join a clinic.
-- When a user signs up with a matching email, they get the invited role.

CREATE TABLE IF NOT EXISTS clinic_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('vet', 'admin')),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One invite per email per tenant
    UNIQUE(email, tenant_id)
);

-- =============================================================================
-- SCHEMA CORE COMPLETE
-- =============================================================================
