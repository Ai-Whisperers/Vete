-- =============================================================================
-- 96_SEED_INVITES.SQL
-- =============================================================================
-- Creates clinic invites for testing the signup flow.
-- =============================================================================

INSERT INTO clinic_invites (tenant_id, email, role) VALUES
    -- Adris invites
    ('adris', 'newvet@demo.com', 'vet'),
    ('adris', 'newadmin@demo.com', 'admin'),
    ('adris', 'newowner@demo.com', 'owner'),
    -- PetLife invites
    ('petlife', 'newvet@petlife.com', 'vet'),
    ('petlife', 'newadmin@petlife.com', 'admin'),
    -- Test clinic invites
    ('testclinic', 'testadmin@test.com', 'admin'),
    ('testclinic', 'testvet@test.com', 'vet')
ON CONFLICT (email, tenant_id) DO NOTHING;

-- =============================================================================
-- INVITES CREATED
-- =============================================================================
--
-- These emails can be used to test the signup flow:
-- - Sign up with one of these emails
-- - The user will be automatically assigned to the correct tenant/role
--
-- =============================================================================
