-- =============================================================================
-- 95_SEED_APPOINTMENTS.SQL
-- =============================================================================
-- Creates sample appointments for testing.
-- Requires 94_seed_pets.sql to have run first.
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
    -- Get user IDs
    SELECT id INTO v_owner_juan FROM auth.users WHERE email = 'owner@demo.com';
    SELECT id INTO v_owner_maria FROM auth.users WHERE email = 'owner2@demo.com';
    SELECT id INTO v_vet_house FROM auth.users WHERE email = 'vet@demo.com';

    IF v_owner_juan IS NULL THEN
        RAISE NOTICE 'ERROR: owner@demo.com not found. Run previous seed files first!';
        RETURN;
    END IF;

    -- Get pet IDs
    SELECT id INTO v_pet_firulais FROM pets WHERE owner_id = v_owner_juan AND name = 'Firulais';
    SELECT id INTO v_pet_mishi FROM pets WHERE owner_id = v_owner_juan AND name = 'Mishi';
    SELECT id INTO v_pet_luna FROM pets WHERE owner_id = v_owner_juan AND name = 'Luna';

    IF v_owner_maria IS NOT NULL THEN
        SELECT id INTO v_pet_thor FROM pets WHERE owner_id = v_owner_maria AND name = 'Thor';
        SELECT id INTO v_pet_max FROM pets WHERE owner_id = v_owner_maria AND name = 'Max';
    END IF;

    IF v_pet_firulais IS NULL THEN
        RAISE NOTICE 'ERROR: Pets not found. Run 94_seed_pets.sql first!';
        RETURN;
    END IF;

    -- Clean existing appointments
    DELETE FROM appointments WHERE tenant_id = 'adris'
        AND pet_id IN (v_pet_firulais, v_pet_mishi, v_pet_luna, v_pet_thor, v_pet_max);

    -- =========================================================================
    -- CREATE APPOINTMENTS
    -- =========================================================================

    -- Past appointments (completed)
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE - INTERVAL '7 days' + TIME '10:00',
         CURRENT_DATE - INTERVAL '7 days' + TIME '10:30',
         'completed', 'Control post-vacunacion', 'Sin reacciones adversas.', v_owner_juan),
        ('adris', v_pet_luna, v_vet_house,
         CURRENT_DATE - INTERVAL '14 days' + TIME '11:00',
         CURRENT_DATE - INTERVAL '14 days' + TIME '11:30',
         'completed', 'Control post-cirugia', 'Recuperacion completa.', v_owner_juan);

    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE - INTERVAL '14 days' + TIME '15:00',
             CURRENT_DATE - INTERVAL '14 days' + TIME '15:30',
             'completed', 'Vacunacion', 'Vacunas aplicadas correctamente.', v_owner_maria);
    END IF;

    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE - INTERVAL '8 days' + TIME '16:00',
             CURRENT_DATE - INTERVAL '8 days' + TIME '16:30',
             'completed', 'Control dermatitis', 'Mejoria notable.', v_owner_maria);
    END IF;

    -- Today's appointments
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_mishi, v_vet_house,
         CURRENT_DATE + TIME '14:00',
         CURRENT_DATE + TIME '14:30',
         'confirmed', 'Vacunacion pendiente', 'Leucemia felina primera dosis.', v_owner_juan);

    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE + TIME '16:00',
             CURRENT_DATE + TIME '16:30',
             'confirmed', 'Control dermatitis', v_owner_maria);
    END IF;

    -- Tomorrow's appointments
    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE + INTERVAL '1 day' + TIME '09:00',
             CURRENT_DATE + INTERVAL '1 day' + TIME '10:00',
             'confirmed', 'Revision general', 'Control de peso.', v_owner_maria);
    END IF;

    -- Next week appointments
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_luna, NULL,
         CURRENT_DATE + INTERVAL '5 days' + TIME '11:00',
         CURRENT_DATE + INTERVAL '5 days' + TIME '12:00',
         'pending', 'Bano y corte', 'Traer toalla propia.', v_owner_juan),
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE + INTERVAL '7 days' + TIME '10:00',
         CURRENT_DATE + INTERVAL '7 days' + TIME '10:30',
         'confirmed', 'Vacuna Bordetella', NULL, v_owner_juan);

    -- Cancelled appointment (for history)
    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE - INTERVAL '3 days' + TIME '16:00',
             CURRENT_DATE - INTERVAL '3 days' + TIME '16:30',
             'cancelled', 'Control dermatitis', 'Cancelado por el dueno - reagendado.', v_owner_maria);
    END IF;

    RAISE NOTICE 'Appointments created';

END $$;

-- =============================================================================
-- APPOINTMENTS SEEDED
-- =============================================================================
