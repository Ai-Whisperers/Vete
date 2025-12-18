-- =============================================================================
-- 45_SEED_COMPREHENSIVE.SQL
-- =============================================================================
-- Complete test data for E2E testing. Creates realistic scenarios for all features.
-- Run AFTER create_users.ts has created the auth users.
--
-- Test accounts:
--   owner@demo.com   / password123  -> 3 pets (Firulais, Mishi, Luna)
--   owner2@demo.com  / password123  -> 2 pets (Thor, Max)
--   vet@demo.com     / password123  -> Staff vet
--   admin@demo.com   / password123  -> Staff admin
--
-- =============================================================================

-- =============================================================================
-- 1. ENSURE TENANTS EXIST (uses setup_new_tenant for full data)
-- =============================================================================

-- Only run setup if tenant doesn't exist (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'adris') THEN
        PERFORM setup_new_tenant('adris', 'Veterinaria Adris');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'petlife') THEN
        PERFORM setup_new_tenant('petlife', 'PetLife Center');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'testclinic') THEN
        PERFORM setup_new_tenant('testclinic', 'Test Clinic');
    END IF;
END $$;

-- =============================================================================
-- 2. ADDITIONAL SERVICES FOR TESTING
-- =============================================================================

INSERT INTO services (tenant_id, code, name, category, base_price, duration_minutes, is_taxable, description) VALUES
    -- Grooming services
    ('adris', 'BATH-S', 'Baño Perro Pequeño', 'grooming', 50000, 45, TRUE, 'Baño completo para perros pequeños (hasta 10kg)'),
    ('adris', 'BATH-M', 'Baño Perro Mediano', 'grooming', 70000, 60, TRUE, 'Baño completo para perros medianos (10-25kg)'),
    ('adris', 'BATH-L', 'Baño Perro Grande', 'grooming', 90000, 75, TRUE, 'Baño completo para perros grandes (25kg+)'),
    ('adris', 'BATH-CAT', 'Baño Gato', 'grooming', 60000, 45, TRUE, 'Baño completo para gatos'),
    ('adris', 'NAIL-001', 'Corte de Uñas', 'grooming', 25000, 15, TRUE, 'Corte de uñas para perros y gatos'),
    ('adris', 'HAIRCUT-001', 'Corte de Pelo', 'grooming', 80000, 60, TRUE, 'Corte de pelo según raza'),
    -- Treatments
    ('adris', 'DESPAR-INT', 'Desparasitación Interna', 'treatment', 35000, 15, TRUE, 'Antiparasitario interno oral'),
    ('adris', 'DESPAR-EXT', 'Desparasitación Externa', 'treatment', 45000, 10, TRUE, 'Pipeta antiparasitaria'),
    ('adris', 'CLEAN-EARS', 'Limpieza de Oídos', 'treatment', 30000, 20, TRUE, 'Limpieza profunda de oídos'),
    ('adris', 'CLEAN-GLANDS', 'Vaciado de Glándulas', 'treatment', 40000, 15, TRUE, 'Vaciado de glándulas anales'),
    -- Identification
    ('adris', 'CHIP-001', 'Microchip', 'identification', 120000, 15, TRUE, 'Colocación de microchip con registro'),
    ('adris', 'QR-TAG', 'Placa QR', 'identification', 45000, 5, TRUE, 'Placa identificadora con código QR'),
    -- PetLife services
    ('petlife', 'BATH-ALL', 'Baño Completo', 'grooming', 55000, 60, TRUE, 'Servicio de baño para cualquier tamaño'),
    ('petlife', 'CONSULT-001', 'Consulta General', 'consultation', 100000, 30, TRUE, 'Consulta médica general')
ON CONFLICT (tenant_id, code) DO NOTHING;

-- =============================================================================
-- 3. STORE CATEGORIES (additional if needed)
-- =============================================================================

INSERT INTO store_categories (tenant_id, name, slug, description) VALUES
    ('adris', 'Juguetes', 'juguetes', 'Juguetes para perros y gatos'),
    ('adris', 'Camas y Casas', 'camas-casas', 'Camas, cuchas y transportadoras'),
    ('adris', 'Snacks y Premios', 'snacks-premios', 'Galletas, huesos y premios'),
    ('petlife', 'Alimentos', 'alimentos', 'Alimentos para mascotas'),
    ('petlife', 'Accesorios', 'accesorios', 'Accesorios varios')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- =============================================================================
-- 4. STORE PRODUCTS FOR CART TESTING
-- =============================================================================

INSERT INTO store_products (tenant_id, sku, name, description, base_price, is_active, category_id) VALUES
    -- Dog Food
    ('adris', 'FOOD-DOG-001', 'Royal Canin Medium Adult 3kg', 'Alimento premium para perros adultos medianos', 85000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros' LIMIT 1)),
    ('adris', 'FOOD-DOG-002', 'Royal Canin Puppy 2kg', 'Alimento para cachorros', 75000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros' LIMIT 1)),
    ('adris', 'FOOD-DOG-003', 'Pro Plan Adult 7.5kg', 'Alimento super premium adultos', 180000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros' LIMIT 1)),
    ('adris', 'FOOD-DOG-004', 'Pedigree Adulto 15kg', 'Alimento económico adultos', 95000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros' LIMIT 1)),
    -- Cat Food
    ('adris', 'FOOD-CAT-001', 'Royal Canin Indoor 1.5kg', 'Alimento para gatos de interior', 65000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-gatos' LIMIT 1)),
    ('adris', 'FOOD-CAT-002', 'Whiskas Adulto Pollo 1kg', 'Alimento para gatos adultos', 35000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-gatos' LIMIT 1)),
    ('adris', 'FOOD-CAT-003', 'Pro Plan Urinary 3kg', 'Alimento para gatos con problemas urinarios', 120000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-gatos' LIMIT 1)),
    -- Antiparasitics
    ('adris', 'ANTI-001', 'NexGard Spectra M (7-15kg)', 'Antiparasitario masticable mensual', 85000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios' LIMIT 1)),
    ('adris', 'ANTI-002', 'NexGard Spectra L (15-30kg)', 'Antiparasitario masticable mensual', 95000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios' LIMIT 1)),
    ('adris', 'ANTI-003', 'Frontline Plus Perro M', 'Pipeta antipulgas y garrapatas', 55000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios' LIMIT 1)),
    ('adris', 'ANTI-004', 'Frontline Plus Gato', 'Pipeta antipulgas para gatos', 50000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios' LIMIT 1)),
    ('adris', 'ANTI-005', 'Seresto Collar Perro M', 'Collar antiparasitario 8 meses', 180000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios' LIMIT 1)),
    -- Accessories
    ('adris', 'ACC-001', 'Collar Nylon M', 'Collar ajustable para perro mediano', 25000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios' LIMIT 1)),
    ('adris', 'ACC-002', 'Correa Retráctil 5m', 'Correa extensible con freno', 65000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios' LIMIT 1)),
    ('adris', 'ACC-003', 'Arnés Acolchado M', 'Arnés ergonómico para paseo', 55000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios' LIMIT 1)),
    ('adris', 'ACC-004', 'Plato Doble Inox', 'Comedero y bebedero acero inoxidable', 35000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios' LIMIT 1)),
    -- Hygiene
    ('adris', 'HYG-001', 'Shampoo Antipulgas 500ml', 'Shampoo medicado contra pulgas', 35000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'higiene' LIMIT 1)),
    ('adris', 'HYG-002', 'Shampoo Pelo Blanco 500ml', 'Shampoo especial para pelo claro', 40000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'higiene' LIMIT 1)),
    ('adris', 'HYG-003', 'Cepillo Deslanador', 'Cepillo para remover pelo muerto', 45000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'higiene' LIMIT 1)),
    ('adris', 'HYG-004', 'Toallitas Húmedas x50', 'Toallitas para limpieza rápida', 25000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'higiene' LIMIT 1)),
    -- Toys
    ('adris', 'TOY-001', 'Kong Classic M', 'Juguete rellenable resistente', 55000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'juguetes' LIMIT 1)),
    ('adris', 'TOY-002', 'Pelota Tennis x3', 'Set de 3 pelotas de tennis', 20000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'juguetes' LIMIT 1)),
    ('adris', 'TOY-003', 'Hueso Nylon Sabor', 'Hueso de nylon con sabor', 30000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'juguetes' LIMIT 1)),
    -- Snacks
    ('adris', 'SNACK-001', 'Dentastix x7', 'Snacks dentales para perros', 25000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'snacks-premios' LIMIT 1)),
    ('adris', 'SNACK-002', 'Galletas Entrenamiento x100', 'Galletas pequeñas para premiar', 18000, TRUE,
        (SELECT id FROM store_categories WHERE tenant_id = 'adris' AND slug = 'snacks-premios' LIMIT 1))
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 5. INVENTORY FOR CART TESTING
-- =============================================================================

INSERT INTO store_inventory (tenant_id, product_id, stock_quantity, min_stock_level, weighted_average_cost)
SELECT
    'adris',
    sp.id,
    CASE
        WHEN sp.sku LIKE 'FOOD-%' THEN 30 + (random() * 20)::int
        WHEN sp.sku LIKE 'ANTI-%' THEN 15 + (random() * 15)::int
        WHEN sp.sku LIKE 'ACC-%' THEN 10 + (random() * 10)::int
        WHEN sp.sku LIKE 'HYG-%' THEN 20 + (random() * 10)::int
        WHEN sp.sku LIKE 'TOY-%' THEN 15 + (random() * 10)::int
        WHEN sp.sku LIKE 'SNACK-%' THEN 25 + (random() * 15)::int
        ELSE 10
    END,
    5,
    sp.base_price * 0.6  -- 60% cost margin
FROM store_products sp
WHERE sp.tenant_id = 'adris'
ON CONFLICT (product_id) DO UPDATE SET
    stock_quantity = EXCLUDED.stock_quantity,
    min_stock_level = EXCLUDED.min_stock_level,
    weighted_average_cost = EXCLUDED.weighted_average_cost;

-- =============================================================================
-- 6. COMPLETE PET DATA (requires users created first)
-- =============================================================================

DO $$
DECLARE
    v_owner_juan UUID;
    v_owner_maria UUID;
    v_vet_house UUID;
    v_admin UUID;
    v_pet_firulais UUID;
    v_pet_mishi UUID;
    v_pet_luna UUID;
    v_pet_thor UUID;
    v_pet_max UUID;
    v_invoice_id UUID;
    v_invoice_number TEXT;
BEGIN
    -- Get user IDs
    SELECT id INTO v_owner_juan FROM auth.users WHERE email = 'owner@demo.com';
    SELECT id INTO v_owner_maria FROM auth.users WHERE email = 'owner2@demo.com';
    SELECT id INTO v_vet_house FROM auth.users WHERE email = 'vet@demo.com';
    SELECT id INTO v_admin FROM auth.users WHERE email = 'admin@demo.com';

    IF v_owner_juan IS NULL THEN
        RAISE NOTICE 'Demo users not found. Run create_users.ts first, then re-run this seed.';
        RETURN;
    END IF;

    -- Update profiles with correct roles if not already set
    UPDATE profiles SET role = 'owner', tenant_id = 'adris', full_name = 'Juan Perez', phone = '+595981234567'
    WHERE id = v_owner_juan AND (role IS NULL OR role = 'owner');

    UPDATE profiles SET role = 'owner', tenant_id = 'adris', full_name = 'Maria Gonzalez', phone = '+595987654321'
    WHERE id = v_owner_maria AND (role IS NULL OR role = 'owner');

    UPDATE profiles SET role = 'vet', tenant_id = 'adris', full_name = 'Dr. House', signature_url = NULL
    WHERE id = v_vet_house;

    UPDATE profiles SET role = 'admin', tenant_id = 'adris', full_name = 'Admin Adris'
    WHERE id = v_admin;

    -- =========================================================================
    -- CREATE PETS
    -- =========================================================================

    -- Juan's pets
    INSERT INTO pets (owner_id, tenant_id, name, species, breed, birth_date, weight_kg, sex, is_neutered, color, temperament, microchip_id, diet_category, diet_notes)
    VALUES
        (v_owner_juan, 'adris', 'Firulais', 'dog', 'Golden Retriever', '2020-03-15', 28.5, 'male', TRUE, 'Dorado', 'friendly', '9810000001', 'balanced', 'Royal Canin Adulto'),
        (v_owner_juan, 'adris', 'Mishi', 'cat', 'Siames', '2021-06-20', 4.2, 'female', FALSE, 'Cream point', 'shy', NULL, 'premium', 'Royal Canin Indoor'),
        (v_owner_juan, 'adris', 'Luna', 'dog', 'Labrador Retriever', '2022-01-10', 22.0, 'female', TRUE, 'Negro', 'playful', '9810000003', 'balanced', 'Pro Plan Adulto')
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_pet_firulais FROM pets WHERE name = 'Firulais' AND owner_id = v_owner_juan;
    SELECT id INTO v_pet_mishi FROM pets WHERE name = 'Mishi' AND owner_id = v_owner_juan;
    SELECT id INTO v_pet_luna FROM pets WHERE name = 'Luna' AND owner_id = v_owner_juan;

    -- Maria's pets
    INSERT INTO pets (owner_id, tenant_id, name, species, breed, birth_date, weight_kg, sex, is_neutered, color, temperament, microchip_id)
    VALUES
        (v_owner_maria, 'adris', 'Thor', 'dog', 'Bulldog Frances', '2021-09-05', 12.0, 'male', TRUE, 'Atigrado', 'calm', '9810000002'),
        (v_owner_maria, 'adris', 'Max', 'dog', 'Beagle', '2019-11-20', 14.5, 'male', TRUE, 'Tricolor', 'energetic', '9810000004')
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_pet_thor FROM pets WHERE name = 'Thor' AND owner_id = v_owner_maria;
    SELECT id INTO v_pet_max FROM pets WHERE name = 'Max' AND owner_id = v_owner_maria;

    -- =========================================================================
    -- CREATE VACCINES
    -- =========================================================================

    -- Delete existing to prevent duplicates
    DELETE FROM vaccines WHERE pet_id IN (v_pet_firulais, v_pet_mishi, v_pet_luna, v_pet_thor, v_pet_max);

    INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number, notes) VALUES
        -- Firulais (up to date)
        (v_pet_firulais, 'Antirrábica', '2024-01-15', '2025-01-15', 'verified', v_vet_house, 'LOT-2024-RAB-001', 'Sin reacciones'),
        (v_pet_firulais, 'Séxtuple (DHLPP)', '2024-01-15', '2025-01-15', 'verified', v_vet_house, 'LOT-2024-SEX-001', NULL),
        (v_pet_firulais, 'Bordetella', NULL, CURRENT_DATE + INTERVAL '7 days', 'pending', NULL, NULL, 'Próxima dosis'),
        -- Mishi (partially vaccinated)
        (v_pet_mishi, 'Triple Felina', '2024-06-01', '2025-06-01', 'verified', v_vet_house, 'LOT-2024-TF-001', NULL),
        (v_pet_mishi, 'Leucemia Felina', NULL, CURRENT_DATE + INTERVAL '14 days', 'pending', NULL, NULL, 'Pendiente primera dosis'),
        -- Luna (up to date)
        (v_pet_luna, 'Antirrábica', '2024-03-10', '2025-03-10', 'verified', v_vet_house, 'LOT-2024-RAB-002', NULL),
        (v_pet_luna, 'Séxtuple (DHLPP)', '2024-03-10', '2025-03-10', 'verified', v_vet_house, 'LOT-2024-SEX-002', NULL),
        -- Thor (recent)
        (v_pet_thor, 'Antirrábica', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'verified', v_vet_house, 'LOT-2024-RAB-003', NULL),
        (v_pet_thor, 'Séxtuple (DHLPP)', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'verified', v_vet_house, 'LOT-2024-SEX-003', NULL),
        -- Max (OVERDUE - for testing alerts)
        (v_pet_max, 'Antirrábica', '2023-11-20', '2024-11-20', 'pending', NULL, NULL, 'VENCIDA - Contactar al dueño'),
        (v_pet_max, 'Séxtuple (DHLPP)', '2023-11-20', '2024-11-20', 'pending', NULL, NULL, 'VENCIDA');

    -- =========================================================================
    -- CREATE MEDICAL RECORDS
    -- =========================================================================

    DELETE FROM medical_records WHERE pet_id IN (v_pet_firulais, v_pet_mishi, v_pet_luna, v_pet_thor, v_pet_max);

    INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, visit_date, created_at) VALUES
        -- Firulais
        (v_pet_firulais, 'adris', v_vet_house, 'consultation', 'Control Anual 2024', 'Paciente sano', 'Peso estable. Pelaje brillante. Sin alteraciones en auscultación. Se aplica pipeta antiparasitaria. Se recomienda continuar con alimento actual.', '2024-01-15', '2024-01-15 10:30:00'),
        (v_pet_firulais, 'adris', v_vet_house, 'vaccination', 'Vacunación Anual', 'Vacunas aplicadas', 'Se aplicaron vacunas antirrábica y séxtuple. Sin reacciones adversas. Próximo control en 1 año.', '2024-01-15', '2024-01-15 10:45:00'),
        (v_pet_firulais, 'adris', v_vet_house, 'consultation', 'Control Post-vacuna', 'Sin complicaciones', 'Control a 7 días de vacunación. Sin reacciones. Paciente activo y con buen apetito.', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '7 days' + TIME '10:00'),
        -- Mishi
        (v_pet_mishi, 'adris', v_vet_house, 'consultation', 'Primera Consulta', 'Gata sana', 'Nuevo paciente. Examen físico normal. Se recomienda completar esquema de vacunación y considerar esterilización.', '2024-05-01', '2024-05-01 14:00:00'),
        (v_pet_mishi, 'adris', v_vet_house, 'vaccination', 'Triple Felina', 'Vacuna aplicada', 'Primera dosis de triple felina. Tolero bien. Próxima dosis de refuerzo en 1 mes.', '2024-06-01', '2024-06-01 09:30:00'),
        (v_pet_mishi, 'adris', v_vet_house, 'exam', 'Ecografía Abdominal', 'Normal', 'Control de rutina. Órganos abdominales sin alteraciones. Vejiga, riñones, hígado y bazo normales.', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '60 days' + TIME '11:00'),
        -- Luna
        (v_pet_luna, 'adris', v_vet_house, 'surgery', 'Esterilización (OVH)', 'Ovariohisterectomía', 'Cirugía sin complicaciones. Paciente en recuperación. Indicaciones: collar isabelino 10 días, antibiótico y antiinflamatorio.', '2024-02-15', '2024-02-15 08:00:00'),
        (v_pet_luna, 'adris', v_vet_house, 'consultation', 'Control Post-quirúrgico', 'Recuperación exitosa', 'Herida cicatrizando correctamente. Sin signos de infección. Retiro de puntos.', '2024-02-25', '2024-02-25 10:00:00'),
        -- Thor
        (v_pet_thor, 'adris', v_vet_house, 'surgery', 'Castración', 'Orquiectomía electiva', 'Procedimiento sin complicaciones. Recuperación en casa. Indicaciones: reposo 7 días, collar isabelino, limpieza diaria de herida.', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '90 days' + TIME '09:00'),
        (v_pet_thor, 'adris', v_vet_house, 'consultation', 'Control Post-castración', 'Recuperación completa', 'Herida completamente cicatrizada. Alta definitiva.', CURRENT_DATE - INTERVAL '80 days', CURRENT_DATE - INTERVAL '80 days' + TIME '10:30'),
        -- Max
        (v_pet_max, 'adris', v_vet_house, 'consultation', 'Dermatitis Alérgica', 'Dermatitis atópica', 'Lesiones eritematosas en axilas y abdomen. Prurito moderado. Se indica tratamiento con corticoides tópicos y antihistamínicos orales.', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days' + TIME '16:00'),
        (v_pet_max, 'adris', v_vet_house, 'consultation', 'Control Dermatitis', 'Mejoría parcial', 'Lesiones en proceso de resolución. Continuar tratamiento 7 días más. Considerar dieta hipoalergénica.', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '8 days' + TIME '15:00');

    -- =========================================================================
    -- CREATE QR TAGS
    -- =========================================================================

    DELETE FROM qr_tags WHERE tenant_id = 'adris';

    INSERT INTO qr_tags (code, pet_id, tenant_id, status) VALUES
        ('QR-ADRIS-001', v_pet_firulais, 'adris', 'active'),
        ('QR-ADRIS-002', v_pet_luna, 'adris', 'active'),
        ('QR-ADRIS-003', v_pet_thor, 'adris', 'active'),
        ('QR-ADRIS-004', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-005', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-006', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-007', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-008', NULL, 'adris', 'unassigned');

    -- =========================================================================
    -- CREATE APPOINTMENTS
    -- =========================================================================

    DELETE FROM appointments WHERE tenant_id = 'adris';

    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        -- Past appointments (completed)
        ('adris', v_pet_firulais, v_vet_house, CURRENT_DATE - INTERVAL '7 days' + TIME '10:00', CURRENT_DATE - INTERVAL '7 days' + TIME '10:30', 'completed', 'Control post-vacunación', 'Sin reacciones adversas.', v_owner_juan),
        ('adris', v_pet_thor, v_vet_house, CURRENT_DATE - INTERVAL '14 days' + TIME '11:00', CURRENT_DATE - INTERVAL '14 days' + TIME '11:30', 'completed', 'Vacunación', 'Vacunas aplicadas correctamente.', v_owner_maria),
        ('adris', v_pet_max, v_vet_house, CURRENT_DATE - INTERVAL '8 days' + TIME '15:00', CURRENT_DATE - INTERVAL '8 days' + TIME '15:30', 'completed', 'Control dermatitis', 'Mejoría notable.', v_owner_maria),
        -- Today
        ('adris', v_pet_mishi, v_vet_house, CURRENT_DATE + TIME '14:00', CURRENT_DATE + TIME '14:30', 'confirmed', 'Vacunación pendiente', 'Leucemia felina primera dosis.', v_owner_juan),
        ('adris', v_pet_max, v_vet_house, CURRENT_DATE + TIME '16:00', CURRENT_DATE + TIME '16:30', 'confirmed', 'Control dermatitis', NULL, v_owner_maria),
        -- Tomorrow
        ('adris', v_pet_thor, v_vet_house, CURRENT_DATE + INTERVAL '1 day' + TIME '09:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:00', 'confirmed', 'Revisión general', 'Control de peso.', v_owner_maria),
        -- Next week
        ('adris', v_pet_luna, NULL, CURRENT_DATE + INTERVAL '5 days' + TIME '11:00', CURRENT_DATE + INTERVAL '5 days' + TIME '12:00', 'pending', 'Baño y corte', 'Traer toalla propia.', v_owner_juan),
        ('adris', v_pet_firulais, v_vet_house, CURRENT_DATE + INTERVAL '7 days' + TIME '10:00', CURRENT_DATE + INTERVAL '7 days' + TIME '10:30', 'confirmed', 'Vacuna Bordetella', NULL, v_owner_juan),
        -- Cancelled (for history)
        ('adris', v_pet_max, v_vet_house, CURRENT_DATE - INTERVAL '3 days' + TIME '16:00', CURRENT_DATE - INTERVAL '3 days' + TIME '16:30', 'cancelled', 'Control dermatitis', 'Cancelado por el dueño - reagendado.', v_owner_maria);

    -- =========================================================================
    -- CREATE SAMPLE INVOICE WITH ITEMS
    -- =========================================================================

    -- Check if invoice functions exist
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_invoice_number') THEN
        v_invoice_number := generate_invoice_number('adris');

        INSERT INTO invoices (
            tenant_id, invoice_number, client_id, pet_id,
            invoice_date, due_date, status, notes, created_by
        ) VALUES (
            'adris', v_invoice_number, v_owner_juan, v_pet_firulais,
            CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '23 days',
            'sent', 'Control anual con vacunación completa', v_vet_house
        ) RETURNING id INTO v_invoice_id;

        -- Add invoice items
        INSERT INTO invoice_items (
            invoice_id, item_type, description, quantity, unit_price,
            is_taxable, tax_rate, subtotal, tax_amount, total
        ) VALUES
            (v_invoice_id, 'service', 'Consulta General', 1, 150000, TRUE, 10, 150000, 15000, 165000),
            (v_invoice_id, 'service', 'Vacunación Antirrábica', 1, 80000, TRUE, 10, 80000, 8000, 88000),
            (v_invoice_id, 'service', 'Vacunación Séxtuple (DHLPP)', 1, 120000, TRUE, 10, 120000, 12000, 132000),
            (v_invoice_id, 'product', 'Desparasitación Externa (Pipeta)', 1, 45000, TRUE, 10, 45000, 4500, 49500);

        -- Calculate totals
        PERFORM calculate_invoice_totals(v_invoice_id);

        RAISE NOTICE 'Sample invoice created: %', v_invoice_number;
    END IF;

    RAISE NOTICE '✅ Comprehensive seed data created successfully!';
    RAISE NOTICE '   - 5 pets created (3 for owner@demo.com, 2 for owner2@demo.com)';
    RAISE NOTICE '   - Vaccines, medical records, and appointments generated';
    RAISE NOTICE '   - Store products and inventory ready for cart testing';

END $$;

-- =============================================================================
-- 7. CLINIC INVITES FOR TESTING SIGNUP FLOW
-- =============================================================================

INSERT INTO clinic_invites (tenant_id, email, role) VALUES
    ('adris', 'newvet@demo.com', 'vet'),
    ('adris', 'newadmin@demo.com', 'admin'),
    ('petlife', 'newvet@petlife.com', 'vet'),
    ('testclinic', 'testadmin@test.com', 'admin')
ON CONFLICT (email, tenant_id) DO NOTHING;

-- =============================================================================
-- 8. REFRESH MATERIALIZED VIEWS
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'refresh_all_materialized_views') THEN
        PERFORM refresh_all_materialized_views();
        RAISE NOTICE '✅ Materialized views refreshed';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not refresh materialized views: %', SQLERRM;
END $$;

-- =============================================================================
-- COMPREHENSIVE SEED COMPLETE
-- =============================================================================
--
-- Test with:
--   1. Login as owner@demo.com -> See 3 pets, upcoming appointments
--   2. Login as vet@demo.com -> See dashboard with today's appointments
--   3. Go to /adris/services -> Add services to cart
--   4. Go to /adris/store -> Add products to cart
--   5. Complete checkout -> Invoice created
--
-- =============================================================================
