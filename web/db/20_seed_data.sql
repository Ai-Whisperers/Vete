-- =============================================================================
-- 20_SEED_DATA.SQL
-- =============================================================================
-- Demo data for testing. Requires users to be created first via the API.
-- Run: npx tsx web/scripts/create_users.ts
-- =============================================================================

-- =============================================================================
-- A. ENSURE TENANTS EXIST
-- =============================================================================
-- Note: For new tenants, use the setup_new_tenant() function instead:
--   SELECT setup_new_tenant('clinic_id', 'Clinic Name');
-- This will create the tenant with all default data (payment methods, services, categories, etc.)

-- For demo purposes, we ensure tenants exist first
INSERT INTO tenants (id, name) VALUES
    ('adris', 'Veterinaria Adris'),
    ('petlife', 'PetLife Center')
ON CONFLICT (id) DO NOTHING;

-- If using setup_new_tenant(), it would look like:
-- SELECT setup_new_tenant('adris', 'Veterinaria Adris');
-- SELECT setup_new_tenant('petlife', 'PetLife Center');

-- =============================================================================
-- B. UPDATE PROFILE ROLES (After users are created)
-- =============================================================================

UPDATE profiles SET role = 'admin', tenant_id = 'adris' WHERE email = 'admin@demo.com';
UPDATE profiles SET role = 'vet', tenant_id = 'adris' WHERE email = 'vet@demo.com';
UPDATE profiles SET role = 'owner', tenant_id = 'adris' WHERE email = 'owner@demo.com';
UPDATE profiles SET role = 'owner', tenant_id = 'adris' WHERE email = 'owner2@demo.com';
UPDATE profiles SET role = 'vet', tenant_id = 'petlife' WHERE email = 'vet@petlife.com';

-- =============================================================================
-- C. SEED PRODUCTS
-- =============================================================================

INSERT INTO products (tenant_id, name, category, price, stock, description) VALUES
    ('adris', 'Royal Canin Puppy', 'dog', 150000, 20, 'Alimento balanceado para cachorros.'),
    ('adris', 'NexGard Spectra', 'dog', 80000, 50, 'Antipulgas y garrapatas.'),
    ('adris', 'Rascador Torre', 'cat', 250000, 5, 'Torre de 3 pisos.'),
    ('petlife', 'Whiskas Adulto', 'cat', 40000, 100, 'Alimento económico.')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- D. CREATE DEMO PETS, VACCINES, RECORDS, AND QR TAGS
-- =============================================================================

DO $$
DECLARE
    owner_juan UUID;
    owner_maria UUID;
    vet_house UUID;

    p_firulais UUID;
    p_mishi UUID;
    p_thor UUID;
BEGIN
    -- 1. Lookup Users
    SELECT id INTO owner_juan FROM auth.users WHERE email = 'owner@demo.com';
    SELECT id INTO owner_maria FROM auth.users WHERE email = 'owner2@demo.com';
    SELECT id INTO vet_house FROM auth.users WHERE email = 'vet@demo.com';

    IF owner_juan IS NULL OR owner_maria IS NULL OR vet_house IS NULL THEN
        RAISE NOTICE 'Demo users not found. Run "npx tsx web/scripts/create_users.ts" first.';
        RETURN;
    END IF;

    -- 2. Create Pets
    -- Firulais
    IF NOT EXISTS (SELECT 1 FROM pets WHERE name = 'Firulais' AND owner_id = owner_juan) THEN
        INSERT INTO pets (owner_id, tenant_id, name, species, breed, weight_kg, microchip_id, diet_category, diet_notes, sex, is_neutered, color, temperament)
        VALUES (owner_juan, 'adris', 'Firulais', 'dog', 'Golden Retriever', 28.5, '9810000001', 'balanced', 'Royal Canin Adulto', 'male', TRUE, 'Dorado', 'friendly')
        RETURNING id INTO p_firulais;
    ELSE
        SELECT id INTO p_firulais FROM pets WHERE name = 'Firulais' AND owner_id = owner_juan;
    END IF;

    -- Mishi
    IF NOT EXISTS (SELECT 1 FROM pets WHERE name = 'Mishi' AND owner_id = owner_juan) THEN
        INSERT INTO pets (owner_id, tenant_id, name, species, breed, weight_kg, diet_category, sex, color, temperament)
        VALUES (owner_juan, 'adris', 'Mishi', 'cat', 'Siames', 4.2, 'raw', 'female', 'Cream/Brown', 'shy')
        RETURNING id INTO p_mishi;
    ELSE
        SELECT id INTO p_mishi FROM pets WHERE name = 'Mishi' AND owner_id = owner_juan;
    END IF;

    -- Thor
    IF NOT EXISTS (SELECT 1 FROM pets WHERE name = 'Thor' AND owner_id = owner_maria) THEN
        INSERT INTO pets (owner_id, tenant_id, name, species, breed, weight_kg, microchip_id)
        VALUES (owner_maria, 'adris', 'Thor', 'dog', 'Bulldog Frances', 12.0, '9810000002')
        RETURNING id INTO p_thor;
    ELSE
        SELECT id INTO p_thor FROM pets WHERE name = 'Thor' AND owner_id = owner_maria;
    END IF;

    -- 3. Create Vaccines & Records for Firulais
    IF NOT EXISTS (SELECT 1 FROM vaccines WHERE pet_id = p_firulais AND name = 'Rabies') THEN
        INSERT INTO vaccines (pet_id, name, administered_date, status, administered_by) VALUES
            (p_firulais, 'Rabies', '2024-01-01', 'verified', vet_house),
            (p_firulais, 'Sextuple', '2024-01-01', 'verified', vet_house);

        INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, created_at) VALUES
            (p_firulais, 'adris', vet_house, 'consultation', 'Control Anual', 'Sano', 'Paciente en excelente estado. Se aplica pipeta.', NOW() - INTERVAL '2 days');

        INSERT INTO qr_tags (code, pet_id, tenant_id, status) VALUES
            ('DEMO-001', p_firulais, 'adris', 'active');
    END IF;

    -- 4. Create Records for Mishi
    IF NOT EXISTS (SELECT 1 FROM vaccines WHERE pet_id = p_mishi) THEN
        INSERT INTO vaccines (pet_id, name, administered_date, status) VALUES
            (p_mishi, 'Triple Felina', '2024-06-01', 'pending');

        INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, created_at) VALUES
            (p_mishi, 'adris', vet_house, 'exam', 'Ecografía Abdominal', 'Cuerpo extraño', 'Se observa objeto compatible con juguete en intestino.', NOW() - INTERVAL '5 days');
    END IF;

    -- 5. Create Records for Thor
    IF NOT EXISTS (SELECT 1 FROM medical_records WHERE pet_id = p_thor) THEN
        INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, created_at) VALUES
            (p_thor, 'adris', vet_house, 'surgery', 'Castración', 'Electiva', 'Procedimiento sin complicaciones. Recuperación en casa.', NOW() - INTERVAL '10 days');

        INSERT INTO clinic_patient_access (clinic_id, pet_id, access_level) VALUES
            ('petlife', p_thor, 'write');
    END IF;

    -- 6. Extra QR Tags
    INSERT INTO qr_tags (code, tenant_id, status) VALUES
        ('DEMO-002', 'adris', 'unassigned'),
        ('DEMO-003', 'adris', 'unassigned'),
        ('DEMO-004', 'petlife', 'unassigned')
    ON CONFLICT DO NOTHING;

    -- 7. Appointments
    IF NOT EXISTS (SELECT 1 FROM appointments WHERE pet_id = p_firulais AND reason = 'Vacunación Anual') THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, created_by) VALUES
            ('adris', p_firulais, vet_house, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 1 hour', 'confirmed', 'Vacunación Anual', owner_juan),
            ('adris', p_mishi, NULL, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 30 minutes', 'pending', 'Revisión General', owner_juan);
    END IF;

END $$;

-- =============================================================================
-- E. PENDING INVITES
-- =============================================================================

INSERT INTO clinic_invites (tenant_id, email, role) VALUES
    ('adris', 'pending_vet@demo.com', 'vet')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED DATA COMPLETE
-- =============================================================================
