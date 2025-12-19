-- =============================================================================
-- 94_SEED_PETS.SQL
-- =============================================================================
-- Creates pets, vaccines, medical records for demo users.
-- Requires 91_seed_demo_users.sql to have run first.
-- =============================================================================

DO $$
DECLARE
    v_owner_juan UUID;
    v_owner_maria UUID;
    v_vet_house UUID;
    v_pet_firulais UUID;
    v_pet_mishi UUID;
    v_pet_luna UUID;
    v_pet_thor UUID;
    v_pet_max UUID;
BEGIN
    -- =========================================================================
    -- GET USER IDs
    -- =========================================================================

    SELECT id INTO v_owner_juan FROM auth.users WHERE email = 'owner@demo.com';
    SELECT id INTO v_owner_maria FROM auth.users WHERE email = 'owner2@demo.com';
    SELECT id INTO v_vet_house FROM auth.users WHERE email = 'vet@demo.com';

    IF v_owner_juan IS NULL THEN
        RAISE NOTICE 'ERROR: owner@demo.com not found. Run 91_seed_demo_users.sql first!';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating pets for owner@demo.com (%)...', v_owner_juan;

    -- =========================================================================
    -- CLEAN EXISTING DATA (idempotent)
    -- =========================================================================

    DELETE FROM vaccines WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_juan);
    DELETE FROM medical_records WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_juan);
    DELETE FROM appointments WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_juan);
    DELETE FROM qr_tags WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_juan);
    DELETE FROM pets WHERE owner_id = v_owner_juan;

    IF v_owner_maria IS NOT NULL THEN
        DELETE FROM vaccines WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_maria);
        DELETE FROM medical_records WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_maria);
        DELETE FROM appointments WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_maria);
        DELETE FROM qr_tags WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_maria);
        DELETE FROM pets WHERE owner_id = v_owner_maria;
    END IF;

    -- =========================================================================
    -- JUAN'S PETS (owner@demo.com)
    -- =========================================================================

    -- Firulais - Golden Retriever
    INSERT INTO pets (
        owner_id, tenant_id, name, species, breed, birth_date,
        weight_kg, sex, is_neutered, color, temperament,
        microchip_id, diet_category, diet_notes
    ) VALUES (
        v_owner_juan, 'adris', 'Firulais', 'dog', 'Golden Retriever', '2020-03-15',
        28.5, 'male', TRUE, 'Dorado', 'friendly',
        '9810000001', 'balanced', 'Royal Canin Adulto'
    ) RETURNING id INTO v_pet_firulais;

    -- Mishi - Siamese cat
    INSERT INTO pets (
        owner_id, tenant_id, name, species, breed, birth_date,
        weight_kg, sex, is_neutered, color, temperament,
        diet_category, diet_notes
    ) VALUES (
        v_owner_juan, 'adris', 'Mishi', 'cat', 'Siames', '2021-06-20',
        4.2, 'female', FALSE, 'Cream point', 'shy',
        'premium', 'Royal Canin Indoor'
    ) RETURNING id INTO v_pet_mishi;

    -- Luna - Labrador
    INSERT INTO pets (
        owner_id, tenant_id, name, species, breed, birth_date,
        weight_kg, sex, is_neutered, color, temperament,
        microchip_id, diet_category, diet_notes
    ) VALUES (
        v_owner_juan, 'adris', 'Luna', 'dog', 'Labrador Retriever', '2022-01-10',
        22.0, 'female', TRUE, 'Negro', 'playful',
        '9810000003', 'balanced', 'Pro Plan Adulto'
    ) RETURNING id INTO v_pet_luna;

    RAISE NOTICE 'Created 3 pets for Juan: Firulais, Mishi, Luna';

    -- =========================================================================
    -- MARIA'S PETS (owner2@demo.com)
    -- =========================================================================

    IF v_owner_maria IS NOT NULL THEN
        -- Thor - French Bulldog
        INSERT INTO pets (
            owner_id, tenant_id, name, species, breed, birth_date,
            weight_kg, sex, is_neutered, color, temperament, microchip_id
        ) VALUES (
            v_owner_maria, 'adris', 'Thor', 'dog', 'Bulldog Frances', '2021-09-05',
            12.0, 'male', TRUE, 'Atigrado', 'calm', '9810000002'
        ) RETURNING id INTO v_pet_thor;

        -- Max - Beagle
        INSERT INTO pets (
            owner_id, tenant_id, name, species, breed, birth_date,
            weight_kg, sex, is_neutered, color, temperament, microchip_id
        ) VALUES (
            v_owner_maria, 'adris', 'Max', 'dog', 'Beagle', '2019-11-20',
            14.5, 'male', TRUE, 'Tricolor', 'energetic', '9810000004'
        ) RETURNING id INTO v_pet_max;

        RAISE NOTICE 'Created 2 pets for Maria: Thor, Max';
    END IF;

    -- =========================================================================
    -- VACCINES
    -- =========================================================================

    -- Firulais vaccines (up to date)
    INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number, notes) VALUES
        (v_pet_firulais, 'Antirrabica', '2024-01-15', '2025-01-15', 'verified', v_vet_house, 'LOT-2024-RAB-001', 'Sin reacciones'),
        (v_pet_firulais, 'Sextuple (DHLPP)', '2024-01-15', '2025-01-15', 'verified', v_vet_house, 'LOT-2024-SEX-001', NULL),
        (v_pet_firulais, 'Bordetella', NULL, CURRENT_DATE + INTERVAL '7 days', 'pending', NULL, NULL, 'Proxima dosis');

    -- Mishi vaccines (partially vaccinated)
    INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number, notes) VALUES
        (v_pet_mishi, 'Triple Felina', '2024-06-01', '2025-06-01', 'verified', v_vet_house, 'LOT-2024-TF-001', NULL),
        (v_pet_mishi, 'Leucemia Felina', NULL, CURRENT_DATE + INTERVAL '14 days', 'pending', NULL, NULL, 'Pendiente primera dosis');

    -- Luna vaccines (up to date)
    INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number, notes) VALUES
        (v_pet_luna, 'Antirrabica', '2024-03-10', '2025-03-10', 'verified', v_vet_house, 'LOT-2024-RAB-002', NULL),
        (v_pet_luna, 'Sextuple (DHLPP)', '2024-03-10', '2025-03-10', 'verified', v_vet_house, 'LOT-2024-SEX-002', NULL);

    -- Thor vaccines (recent)
    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number) VALUES
            (v_pet_thor, 'Antirrabica', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'verified', v_vet_house, 'LOT-2024-RAB-003'),
            (v_pet_thor, 'Sextuple (DHLPP)', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'verified', v_vet_house, 'LOT-2024-SEX-003');
    END IF;

    -- Max vaccines (OVERDUE - for testing alerts)
    IF v_pet_max IS NOT NULL THEN
        INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, notes) VALUES
            (v_pet_max, 'Antirrabica', '2023-11-20', '2024-11-20', 'pending', 'VENCIDA - Contactar al dueno'),
            (v_pet_max, 'Sextuple (DHLPP)', '2023-11-20', '2024-11-20', 'pending', 'VENCIDA');
    END IF;

    RAISE NOTICE 'Vaccines created';

    -- =========================================================================
    -- MEDICAL RECORDS
    -- =========================================================================

    INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, visit_date) VALUES
        -- Firulais records
        (v_pet_firulais, 'adris', v_vet_house, 'consultation', 'Control Anual 2024', 'Paciente sano', 'Peso estable. Pelaje brillante. Sin alteraciones.', '2024-01-15'),
        (v_pet_firulais, 'adris', v_vet_house, 'vaccination', 'Vacunacion Anual', 'Vacunas aplicadas', 'Antirrabica y sextuple. Sin reacciones adversas.', '2024-01-15'),
        -- Mishi records
        (v_pet_mishi, 'adris', v_vet_house, 'consultation', 'Primera Consulta', 'Gata sana', 'Nuevo paciente. Examen fisico normal.', '2024-05-01'),
        (v_pet_mishi, 'adris', v_vet_house, 'vaccination', 'Triple Felina', 'Vacuna aplicada', 'Primera dosis de triple felina.', '2024-06-01'),
        -- Luna records
        (v_pet_luna, 'adris', v_vet_house, 'surgery', 'Esterilizacion (OVH)', 'Ovariohisterectomia', 'Cirugia sin complicaciones.', '2024-02-15'),
        (v_pet_luna, 'adris', v_vet_house, 'consultation', 'Control Post-quirurgico', 'Recuperacion exitosa', 'Herida cicatrizando correctamente.', '2024-02-25');

    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, visit_date) VALUES
            (v_pet_thor, 'adris', v_vet_house, 'surgery', 'Castracion', 'Orquiectomia electiva', 'Procedimiento sin complicaciones.', CURRENT_DATE - INTERVAL '90 days');
    END IF;

    IF v_pet_max IS NOT NULL THEN
        INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, visit_date) VALUES
            (v_pet_max, 'adris', v_vet_house, 'consultation', 'Dermatitis Alergica', 'Dermatitis atopica', 'Lesiones eritematosas en axilas y abdomen.', CURRENT_DATE - INTERVAL '15 days'),
            (v_pet_max, 'adris', v_vet_house, 'consultation', 'Control Dermatitis', 'Mejoria parcial', 'Lesiones en proceso de resolucion.', CURRENT_DATE - INTERVAL '8 days');
    END IF;

    RAISE NOTICE 'Medical records created';

    -- =========================================================================
    -- QR TAGS
    -- =========================================================================

    INSERT INTO qr_tags (code, pet_id, tenant_id, status) VALUES
        ('QR-ADRIS-001', v_pet_firulais, 'adris', 'active'),
        ('QR-ADRIS-002', v_pet_luna, 'adris', 'active'),
        ('QR-ADRIS-003', v_pet_thor, 'adris', 'active'),
        ('QR-ADRIS-004', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-005', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-006', NULL, 'adris', 'unassigned');

    RAISE NOTICE 'QR tags created';

    -- =========================================================================
    -- OWNER-CLINIC CONNECTIONS
    -- =========================================================================

    INSERT INTO owner_clinic_connections (owner_id, tenant_id, connection_type)
    VALUES (v_owner_juan, 'adris', 'pet_registered')
    ON CONFLICT (owner_id, tenant_id) DO NOTHING;

    IF v_owner_maria IS NOT NULL THEN
        INSERT INTO owner_clinic_connections (owner_id, tenant_id, connection_type)
        VALUES (v_owner_maria, 'adris', 'pet_registered')
        ON CONFLICT (owner_id, tenant_id) DO NOTHING;
    END IF;

    -- =========================================================================
    -- SUMMARY
    -- =========================================================================

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'PETS CREATED SUCCESSFULLY!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'owner@demo.com: 3 pets (Firulais, Mishi, Luna)';
    IF v_owner_maria IS NOT NULL THEN
        RAISE NOTICE 'owner2@demo.com: 2 pets (Thor, Max)';
    END IF;
    RAISE NOTICE '============================================';

END $$;

-- =============================================================================
-- PETS SEEDED
-- =============================================================================
