-- =============================================================================
-- 90_SEED_TENANTS.SQL
-- =============================================================================
-- Creates tenant records for multi-tenancy.
-- This is the first seed file and must run before all other seed files.
-- =============================================================================

INSERT INTO tenants (id, name, subdomain, is_active) VALUES
    ('adris', 'Veterinaria Adris', 'adris', TRUE),
    ('petlife', 'PetLife Center', 'petlife', TRUE),
    ('testclinic', 'Test Clinic', 'testclinic', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    is_active = EXCLUDED.is_active;

-- =============================================================================
-- TENANTS CREATED
-- =============================================================================
