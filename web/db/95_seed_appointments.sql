-- =============================================================================
-- 95_SEED_APPOINTMENTS.SQL
-- =============================================================================
-- Creates comprehensive sample appointments for testing daily schedule widget.
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
    -- PAST APPOINTMENTS (for history context)
    -- =========================================================================

    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE - INTERVAL '7 days' + TIME '10:00',
         CURRENT_DATE - INTERVAL '7 days' + TIME '10:30',
         'completed', 'Control post-vacunacion', 'Sin reacciones adversas. Peso estable.', v_owner_juan),
        ('adris', v_pet_luna, v_vet_house,
         CURRENT_DATE - INTERVAL '14 days' + TIME '11:00',
         CURRENT_DATE - INTERVAL '14 days' + TIME '11:30',
         'completed', 'Control post-cirugia', 'Recuperacion completa. Herida cicatrizada.', v_owner_juan),
        ('adris', v_pet_mishi, v_vet_house,
         CURRENT_DATE - INTERVAL '5 days' + TIME '09:30',
         CURRENT_DATE - INTERVAL '5 days' + TIME '10:00',
         'completed', 'Consulta general', 'Examen fisico normal.', v_owner_juan);

    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE - INTERVAL '10 days' + TIME '15:00',
             CURRENT_DATE - INTERVAL '10 days' + TIME '15:30',
             'completed', 'Vacunacion anual', 'Sextuple y antirrabica aplicadas.', v_owner_maria);
    END IF;

    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE - INTERVAL '8 days' + TIME '16:00',
             CURRENT_DATE - INTERVAL '8 days' + TIME '16:30',
             'completed', 'Control dermatitis', 'Mejoria notable en lesiones.', v_owner_maria),
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE - INTERVAL '3 days' + TIME '14:00',
             CURRENT_DATE - INTERVAL '3 days' + TIME '14:30',
             'cancelled', 'Control dermatitis', 'Cancelado por el dueno - reagendado.', v_owner_maria);
    END IF;

    -- =========================================================================
    -- TODAY'S APPOINTMENTS - Full day schedule for testing widget
    -- =========================================================================

    -- 08:00 - COMPLETED (early morning, already done)
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by, checked_in_at, started_at) VALUES
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE + TIME '08:00',
         CURRENT_DATE + TIME '08:30',
         'completed', 'Vacunacion Bordetella', 'Vacuna aplicada sin complicaciones.', v_owner_juan,
         CURRENT_DATE + TIME '07:55', CURRENT_DATE + TIME '08:02');

    -- 08:30 - COMPLETED
    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by, checked_in_at, started_at) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE + TIME '08:30',
             CURRENT_DATE + TIME '09:00',
             'completed', 'Control peso', 'Peso normal. Dieta adecuada.', v_owner_maria,
             CURRENT_DATE + TIME '08:25', CURRENT_DATE + TIME '08:32');
    END IF;

    -- 09:00 - NO SHOW
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_luna, v_vet_house,
         CURRENT_DATE + TIME '09:00',
         CURRENT_DATE + TIME '09:30',
         'no_show', 'Desparasitacion', 'Paciente no se presento.', v_owner_juan);

    -- 09:30 - COMPLETED
    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by, checked_in_at, started_at) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE + TIME '09:30',
             CURRENT_DATE + TIME '10:00',
             'completed', 'Control dermatitis', 'Lesiones resueltas. Alta medica.', v_owner_maria,
             CURRENT_DATE + TIME '09:25', CURRENT_DATE + TIME '09:35');
    END IF;

    -- 10:00 - IN_PROGRESS (current consultation)
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by, checked_in_at, started_at) VALUES
        ('adris', v_pet_mishi, v_vet_house,
         CURRENT_DATE + TIME '10:00',
         CURRENT_DATE + TIME '10:45',
         'in_progress', 'Vacunacion Leucemia Felina', 'Primera dosis. Test FeLV negativo.', v_owner_juan,
         CURRENT_DATE + TIME '09:50', CURRENT_DATE + TIME '10:05');

    -- 10:30 - CHECKED_IN (waiting in queue)
    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by, checked_in_at) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE + TIME '10:30',
             CURRENT_DATE + TIME '11:00',
             'checked_in', 'Limpieza dental', 'Pre-evaluacion para limpieza.', v_owner_maria,
             CURRENT_DATE + TIME '10:20');
    END IF;

    -- 11:00 - CONFIRMED (next in line)
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE + TIME '11:00',
         CURRENT_DATE + TIME '11:30',
         'confirmed', 'Consulta dermatologica', 'Dueno reporta picazon en orejas.', v_owner_juan);

    -- 11:30 - CONFIRMED
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_luna, v_vet_house,
         CURRENT_DATE + TIME '11:30',
         CURRENT_DATE + TIME '12:00',
         'confirmed', 'Control anual', 'Examen fisico completo.', v_owner_juan);

    -- 12:00 - PENDING (lunch break gap)
    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE + TIME '12:00',
             CURRENT_DATE + TIME '12:30',
             'pending', 'Radiografia control', v_owner_maria);
    END IF;

    -- 14:00 - CONFIRMED (afternoon)
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_mishi, v_vet_house,
         CURRENT_DATE + TIME '14:00',
         CURRENT_DATE + TIME '14:30',
         'confirmed', 'Control post-vacuna', 'Verificar reacciones 4 horas post.', v_owner_juan);

    -- 14:30 - PENDING
    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, created_by) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE + TIME '14:30',
             CURRENT_DATE + TIME '15:00',
             'pending', 'Ecografia abdominal', v_owner_maria);
    END IF;

    -- 15:00 - CONFIRMED
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_luna, v_vet_house,
         CURRENT_DATE + TIME '15:00',
         CURRENT_DATE + TIME '15:30',
         'confirmed', 'Bano medicado', 'Shampoo antiparasitario.', v_owner_juan);

    -- 15:30 - PENDING
    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE + TIME '15:30',
             CURRENT_DATE + TIME '16:00',
             'pending', 'Vacunacion refuerzo', v_owner_maria);
    END IF;

    -- 16:00 - CONFIRMED
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE + TIME '16:00',
         CURRENT_DATE + TIME '16:30',
         'confirmed', 'Corte de unas', 'Incluye limpieza de oidos.', v_owner_juan);

    -- 16:30 - PENDING (late afternoon)
    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, created_by) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE + TIME '16:30',
             CURRENT_DATE + TIME '17:00',
             'pending', 'Consulta oftalmologica', v_owner_maria);
    END IF;

    -- 17:00 - CONFIRMED (last slot)
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_mishi, v_vet_house,
         CURRENT_DATE + TIME '17:00',
         CURRENT_DATE + TIME '17:30',
         'confirmed', 'Revision general', 'Chequeo rutinario.', v_owner_juan);

    -- =========================================================================
    -- TOMORROW'S APPOINTMENTS
    -- =========================================================================

    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE + INTERVAL '1 day' + TIME '09:00',
         CURRENT_DATE + INTERVAL '1 day' + TIME '09:30',
         'confirmed', 'Control dermatologico', 'Seguimiento tratamiento oidos.', v_owner_juan),
        ('adris', v_pet_luna, NULL,
         CURRENT_DATE + INTERVAL '1 day' + TIME '10:00',
         CURRENT_DATE + INTERVAL '1 day' + TIME '11:00',
         'pending', 'Peluqueria completa', 'Bano, corte y secado.', v_owner_juan);

    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE + INTERVAL '1 day' + TIME '11:00',
             CURRENT_DATE + INTERVAL '1 day' + TIME '12:00',
             'confirmed', 'Limpieza dental profesional', 'Ayuno de 12 horas requerido.', v_owner_maria);
    END IF;

    -- =========================================================================
    -- NEXT WEEK APPOINTMENTS
    -- =========================================================================

    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_mishi, v_vet_house,
         CURRENT_DATE + INTERVAL '7 days' + TIME '10:00',
         CURRENT_DATE + INTERVAL '7 days' + TIME '10:30',
         'pending', 'Segunda dosis Leucemia', 'Refuerzo vacuna FeLV.', v_owner_juan),
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE + INTERVAL '14 days' + TIME '10:00',
         CURRENT_DATE + INTERVAL '14 days' + TIME '10:30',
         'pending', 'Vacuna Leptospirosis', 'Refuerzo anual.', v_owner_juan);

    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE + INTERVAL '7 days' + TIME '14:00',
             CURRENT_DATE + INTERVAL '7 days' + TIME '14:30',
             'pending', 'Control alergias', 'Evaluacion mensual.', v_owner_maria);
    END IF;

    -- =========================================================================
    -- SUMMARY
    -- =========================================================================

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'APPOINTMENTS SEEDED SUCCESSFULLY!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'TODAY''s appointments:';
    RAISE NOTICE '  - 08:00 Firulais  -> COMPLETED';
    RAISE NOTICE '  - 08:30 Thor      -> COMPLETED';
    RAISE NOTICE '  - 09:00 Luna      -> NO SHOW';
    RAISE NOTICE '  - 09:30 Max       -> COMPLETED';
    RAISE NOTICE '  - 10:00 Mishi     -> IN PROGRESS';
    RAISE NOTICE '  - 10:30 Thor      -> CHECKED IN';
    RAISE NOTICE '  - 11:00 Firulais  -> CONFIRMED';
    RAISE NOTICE '  - 11:30 Luna      -> CONFIRMED';
    RAISE NOTICE '  - 12:00 Max       -> PENDING';
    RAISE NOTICE '  - 14:00 Mishi     -> CONFIRMED';
    RAISE NOTICE '  - 14:30 Thor      -> PENDING';
    RAISE NOTICE '  - 15:00 Luna      -> CONFIRMED';
    RAISE NOTICE '  - 15:30 Max       -> PENDING';
    RAISE NOTICE '  - 16:00 Firulais  -> CONFIRMED';
    RAISE NOTICE '  - 16:30 Thor      -> PENDING';
    RAISE NOTICE '  - 17:00 Mishi     -> CONFIRMED';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Login as vet@demo.com / password123';
    RAISE NOTICE 'Visit: /adris/portal/dashboard';
    RAISE NOTICE '============================================';

END $$;

-- =============================================================================
-- APPOINTMENTS SEEDED
-- =============================================================================
