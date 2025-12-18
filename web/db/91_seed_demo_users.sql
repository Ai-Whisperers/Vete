-- =============================================================================
-- 91_SEED_DEMO_USERS.SQL
-- =============================================================================
-- Creates demo users in auth.users for testing.
-- Requires service_role access (run via Supabase SQL Editor or service key).
--
-- Password for all users: password123
-- Bcrypt hash: $2a$10$PznXH/XK.SADSqvV2P1DhOkVOLGO0J1.eVQXR.cSx.qxDUbClnpXy
-- =============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_password_hash TEXT := '$2a$10$PznXH/XK.SADSqvV2P1DhOkVOLGO0J1.eVQXR.cSx.qxDUbClnpXy';
BEGIN
    -- =========================================================================
    -- ADRIS CLINIC USERS
    -- =========================================================================

    -- owner@demo.com - Pet Owner (Juan Perez)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner@demo.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'owner@demo.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Juan Perez"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: owner@demo.com';
    END IF;

    -- owner2@demo.com - Pet Owner (Maria Gonzalez)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner2@demo.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'owner2@demo.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Maria Gonzalez"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: owner2@demo.com';
    END IF;

    -- vet@demo.com - Veterinarian (Dr. House)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vet@demo.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'vet@demo.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Dr. House"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: vet@demo.com';
    END IF;

    -- admin@demo.com - Clinic Admin
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@demo.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'admin@demo.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Admin Adris"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: admin@demo.com';
    END IF;

    -- =========================================================================
    -- PETLIFE CLINIC USERS
    -- =========================================================================

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vet@petlife.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'vet@petlife.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Dr. PetLife"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: vet@petlife.com';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@petlife.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'admin@petlife.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Admin PetLife"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: admin@petlife.com';
    END IF;

    RAISE NOTICE 'Auth users created';
END $$;

-- =============================================================================
-- CREATE PROFILES FOR DEMO USERS
-- =============================================================================

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- owner@demo.com -> adris, owner
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner@demo.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id, phone)
        VALUES (v_user_id, 'owner@demo.com', 'Juan Perez', 'owner', 'adris', '+595981234567')
        ON CONFLICT (id) DO UPDATE SET
            role = 'owner', tenant_id = 'adris', full_name = 'Juan Perez', phone = '+595981234567';
    END IF;

    -- owner2@demo.com -> adris, owner
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner2@demo.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id, phone)
        VALUES (v_user_id, 'owner2@demo.com', 'Maria Gonzalez', 'owner', 'adris', '+595987654321')
        ON CONFLICT (id) DO UPDATE SET
            role = 'owner', tenant_id = 'adris', full_name = 'Maria Gonzalez', phone = '+595987654321';
    END IF;

    -- vet@demo.com -> adris, vet
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'vet@demo.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'vet@demo.com', 'Dr. House', 'vet', 'adris')
        ON CONFLICT (id) DO UPDATE SET
            role = 'vet', tenant_id = 'adris', full_name = 'Dr. House';
    END IF;

    -- admin@demo.com -> adris, admin
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@demo.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'admin@demo.com', 'Admin Adris', 'admin', 'adris')
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin', tenant_id = 'adris', full_name = 'Admin Adris';
    END IF;

    -- vet@petlife.com -> petlife, vet
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'vet@petlife.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'vet@petlife.com', 'Dr. PetLife', 'vet', 'petlife')
        ON CONFLICT (id) DO UPDATE SET
            role = 'vet', tenant_id = 'petlife', full_name = 'Dr. PetLife';
    END IF;

    -- admin@petlife.com -> petlife, admin
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@petlife.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'admin@petlife.com', 'Admin PetLife', 'admin', 'petlife')
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin', tenant_id = 'petlife', full_name = 'Admin PetLife';
    END IF;

    RAISE NOTICE 'Profiles created/updated';
END $$;

-- =============================================================================
-- DEMO USERS READY
-- =============================================================================
--
-- | Email             | Password    | Role   | Tenant   |
-- |-------------------|-------------|--------|----------|
-- | owner@demo.com    | password123 | owner  | adris    |
-- | owner2@demo.com   | password123 | owner  | adris    |
-- | vet@demo.com      | password123 | vet    | adris    |
-- | admin@demo.com    | password123 | admin  | adris    |
-- | vet@petlife.com   | password123 | vet    | petlife  |
-- | admin@petlife.com | password123 | admin  | petlife  |
--
-- =============================================================================
