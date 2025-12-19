-- =============================================================================
-- 03_STORE.SQL
-- =============================================================================
-- Store categories, products, inventory, and promotions seed data.
-- All prices in Guaranies (PYG).
--
-- Dependencies: 10_core (tenants), 60_store (tables)
-- =============================================================================

-- =============================================================================
-- STORE CATEGORIES
-- =============================================================================

INSERT INTO public.store_categories (tenant_id, name, slug, description, display_order, is_active) VALUES
    -- Adris Categories
    ('adris', 'Alimento Perros', 'alimento-perros', 'Alimento balanceado para perros de todas las edades', 1, TRUE),
    ('adris', 'Alimento Gatos', 'alimento-gatos', 'Alimento balanceado para gatos de todas las edades', 2, TRUE),
    ('adris', 'Antiparasitarios', 'antiparasitarios', 'Productos antiparasitarios internos y externos', 3, TRUE),
    ('adris', 'Accesorios', 'accesorios', 'Collares, correas, arneses y accesorios', 4, TRUE),
    ('adris', 'Higiene', 'higiene', 'Productos de higiene y limpieza', 5, TRUE),
    ('adris', 'Juguetes', 'juguetes', 'Juguetes para perros y gatos', 6, TRUE),
    ('adris', 'Camas y Casas', 'camas-casas', 'Camas, cuchas y transportadoras', 7, TRUE),
    ('adris', 'Snacks y Premios', 'snacks-premios', 'Galletas, huesos y premios', 8, TRUE),
    ('adris', 'Medicamentos', 'medicamentos', 'Medicamentos con receta veterinaria', 9, TRUE),
    ('adris', 'Suplementos', 'suplementos', 'Vitaminas y suplementos nutricionales', 10, TRUE),

    -- PetLife Categories
    ('petlife', 'Alimentos', 'alimentos', 'Alimentos para todas las mascotas', 1, TRUE),
    ('petlife', 'Accesorios', 'accesorios', 'Accesorios y juguetes', 2, TRUE),
    ('petlife', 'Medicamentos', 'medicamentos', 'Productos veterinarios', 3, TRUE)

ON CONFLICT (tenant_id, slug) DO NOTHING;

-- =============================================================================
-- STORE PRODUCTS
-- =============================================================================

DO $$
DECLARE
    v_cat_dog_food UUID;
    v_cat_cat_food UUID;
    v_cat_anti UUID;
    v_cat_acc UUID;
    v_cat_hyg UUID;
    v_cat_toys UUID;
    v_cat_beds UUID;
    v_cat_snacks UUID;
    v_cat_meds UUID;
    v_cat_supps UUID;
BEGIN
    -- Get Adris category IDs
    SELECT id INTO v_cat_dog_food FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros';
    SELECT id INTO v_cat_cat_food FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-gatos';
    SELECT id INTO v_cat_anti FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios';
    SELECT id INTO v_cat_acc FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios';
    SELECT id INTO v_cat_hyg FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'higiene';
    SELECT id INTO v_cat_toys FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'juguetes';
    SELECT id INTO v_cat_beds FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'camas-casas';
    SELECT id INTO v_cat_snacks FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'snacks-premios';
    SELECT id INTO v_cat_meds FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'medicamentos';
    SELECT id INTO v_cat_supps FROM public.store_categories WHERE tenant_id = 'adris' AND slug = 'suplementos';

    -- Insert Products
    INSERT INTO public.store_products (tenant_id, category_id, sku, name, description, base_price, cost_price, is_active, target_species, weight_kg) VALUES
        -- Dog Food
        ('adris', v_cat_dog_food, 'FOOD-DOG-001', 'Royal Canin Medium Adult 3kg', 'Alimento premium para perros adultos medianos (11-25kg)', 85000, 51000, TRUE, ARRAY['dog'], 3),
        ('adris', v_cat_dog_food, 'FOOD-DOG-002', 'Royal Canin Puppy 2kg', 'Alimento para cachorros hasta 12 meses', 75000, 45000, TRUE, ARRAY['dog'], 2),
        ('adris', v_cat_dog_food, 'FOOD-DOG-003', 'Pro Plan Adult 7.5kg', 'Alimento super premium para adultos', 180000, 108000, TRUE, ARRAY['dog'], 7.5),
        ('adris', v_cat_dog_food, 'FOOD-DOG-004', 'Pedigree Adulto 15kg', 'Alimento económico para adultos', 95000, 57000, TRUE, ARRAY['dog'], 15),
        ('adris', v_cat_dog_food, 'FOOD-DOG-005', 'Royal Canin Mini Adult 1kg', 'Alimento para perros pequeños (<10kg)', 45000, 27000, TRUE, ARRAY['dog'], 1),
        ('adris', v_cat_dog_food, 'FOOD-DOG-006', 'Hill''s Science Diet 5kg', 'Alimento científico para adultos', 150000, 90000, TRUE, ARRAY['dog'], 5),
        ('adris', v_cat_dog_food, 'FOOD-DOG-007', 'Royal Canin Maxi Adult 15kg', 'Alimento para perros grandes (26-44kg)', 220000, 132000, TRUE, ARRAY['dog'], 15),
        ('adris', v_cat_dog_food, 'FOOD-DOG-008', 'Pro Plan Sensitive Skin 3kg', 'Para perros con piel sensible', 120000, 72000, TRUE, ARRAY['dog'], 3),

        -- Cat Food
        ('adris', v_cat_cat_food, 'FOOD-CAT-001', 'Royal Canin Indoor 1.5kg', 'Alimento para gatos de interior', 65000, 39000, TRUE, ARRAY['cat'], 1.5),
        ('adris', v_cat_cat_food, 'FOOD-CAT-002', 'Whiskas Adulto Pollo 1kg', 'Alimento sabor pollo', 35000, 21000, TRUE, ARRAY['cat'], 1),
        ('adris', v_cat_cat_food, 'FOOD-CAT-003', 'Pro Plan Urinary 3kg', 'Para gatos con problemas urinarios', 120000, 72000, TRUE, ARRAY['cat'], 3),
        ('adris', v_cat_cat_food, 'FOOD-CAT-004', 'Royal Canin Kitten 1kg', 'Alimento para gatitos hasta 12 meses', 55000, 33000, TRUE, ARRAY['cat'], 1),
        ('adris', v_cat_cat_food, 'FOOD-CAT-005', 'Fancy Feast Húmedo x12', 'Pack de 12 latas de comida húmeda', 85000, 51000, TRUE, ARRAY['cat'], 1),
        ('adris', v_cat_cat_food, 'FOOD-CAT-006', 'Royal Canin Sterilised 2kg', 'Para gatos esterilizados', 80000, 48000, TRUE, ARRAY['cat'], 2),

        -- Antiparasitics
        ('adris', v_cat_anti, 'ANTI-001', 'NexGard Spectra M (7-15kg)', 'Antiparasitario masticable mensual', 85000, 51000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_anti, 'ANTI-002', 'NexGard Spectra L (15-30kg)', 'Antiparasitario masticable mensual', 95000, 57000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_anti, 'ANTI-003', 'Frontline Plus Perro M', 'Pipeta antipulgas y garrapatas', 55000, 33000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_anti, 'ANTI-004', 'Frontline Plus Gato', 'Pipeta antipulgas para gatos', 50000, 30000, TRUE, ARRAY['cat'], NULL),
        ('adris', v_cat_anti, 'ANTI-005', 'Seresto Collar Perro M', 'Collar antiparasitario 8 meses', 180000, 108000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_anti, 'ANTI-006', 'Bravecto Perro M (10-20kg)', 'Antiparasitario trimestral masticable', 150000, 90000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_anti, 'ANTI-007', 'Simparica Trio M', 'Antiparasitario completo mensual', 95000, 57000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_anti, 'ANTI-008', 'Revolution Plus Gato', 'Antiparasitario mensual para gatos', 75000, 45000, TRUE, ARRAY['cat'], NULL),
        ('adris', v_cat_anti, 'ANTI-009', 'Advantage Multi Perro M', 'Pipeta multiparasitario', 70000, 42000, TRUE, ARRAY['dog'], NULL),

        -- Accessories
        ('adris', v_cat_acc, 'ACC-001', 'Collar Nylon M', 'Collar ajustable nylon 35-50cm', 25000, 15000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_acc, 'ACC-002', 'Correa Retráctil 5m', 'Correa extensible con freno', 65000, 39000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_acc, 'ACC-003', 'Arnés Acolchado M', 'Arnés ergonómico para paseo', 55000, 33000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_acc, 'ACC-004', 'Plato Doble Inox', 'Comedero y bebedero acero inoxidable', 35000, 21000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_acc, 'ACC-005', 'Transportadora M', 'Transportadora rígida para viajes', 120000, 72000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_acc, 'ACC-006', 'Bebedero Fuente 2L', 'Fuente de agua automática', 95000, 57000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_acc, 'ACC-007', 'Collar GPS Tracker', 'Collar con rastreador GPS', 250000, 150000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_acc, 'ACC-008', 'Rascador Gato Torre', 'Torre rascador con plataformas', 180000, 108000, TRUE, ARRAY['cat'], NULL),
        ('adris', v_cat_acc, 'ACC-009', 'Arenero Cubierto', 'Arenero con tapa para gatos', 95000, 57000, TRUE, ARRAY['cat'], NULL),

        -- Hygiene
        ('adris', v_cat_hyg, 'HYG-001', 'Shampoo Antipulgas 500ml', 'Shampoo medicado contra pulgas', 35000, 21000, TRUE, ARRAY['dog', 'cat'], 0.5),
        ('adris', v_cat_hyg, 'HYG-002', 'Shampoo Pelo Blanco 500ml', 'Shampoo especial pelo claro', 40000, 24000, TRUE, ARRAY['dog', 'cat'], 0.5),
        ('adris', v_cat_hyg, 'HYG-003', 'Cepillo Deslanador', 'Cepillo para pelo muerto', 45000, 27000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_hyg, 'HYG-004', 'Toallitas Húmedas x50', 'Toallitas para limpieza rápida', 25000, 15000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_hyg, 'HYG-005', 'Cortauñas Profesional', 'Cortauñas acero inoxidable', 30000, 18000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_hyg, 'HYG-006', 'Limpiador de Oídos 100ml', 'Solución limpiadora de oídos', 28000, 17000, TRUE, ARRAY['dog', 'cat'], 0.1),
        ('adris', v_cat_hyg, 'HYG-007', 'Pasta Dental Perros', 'Pasta dental sabor pollo', 25000, 15000, TRUE, ARRAY['dog'], 0.1),
        ('adris', v_cat_hyg, 'HYG-008', 'Perfume Mascotas 100ml', 'Colonia suave para mascotas', 30000, 18000, TRUE, ARRAY['dog', 'cat'], 0.1),

        -- Toys
        ('adris', v_cat_toys, 'TOY-001', 'Kong Classic M', 'Juguete rellenable resistente', 55000, 33000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_toys, 'TOY-002', 'Pelota Tennis x3', 'Set de 3 pelotas de tennis', 20000, 12000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_toys, 'TOY-003', 'Hueso Nylon Sabor', 'Hueso de nylon con sabor bacon', 30000, 18000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_toys, 'TOY-004', 'Cuerda Interactiva', 'Cuerda para juego de tira', 18000, 11000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_toys, 'TOY-005', 'Ratón con Catnip', 'Ratón de juguete con hierba gatera', 15000, 9000, TRUE, ARRAY['cat'], NULL),
        ('adris', v_cat_toys, 'TOY-006', 'Varita Plumas', 'Varita interactiva con plumas', 22000, 13000, TRUE, ARRAY['cat'], NULL),
        ('adris', v_cat_toys, 'TOY-007', 'Frisbee Perros', 'Disco volador resistente', 28000, 17000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_toys, 'TOY-008', 'Túnel Gato Plegable', 'Túnel de juego para gatos', 45000, 27000, TRUE, ARRAY['cat'], NULL),

        -- Beds
        ('adris', v_cat_beds, 'BED-001', 'Cama Ortopédica M', 'Cama con espuma de memoria', 150000, 90000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_beds, 'BED-002', 'Cama Redonda Gato', 'Cama acogedora para gatos', 65000, 39000, TRUE, ARRAY['cat'], NULL),
        ('adris', v_cat_beds, 'BED-003', 'Cucha Plástica M', 'Cucha exterior resistente', 180000, 108000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_beds, 'BED-004', 'Manta Polar M', 'Manta suave para mascotas', 35000, 21000, TRUE, ARRAY['dog', 'cat'], NULL),

        -- Snacks
        ('adris', v_cat_snacks, 'SNACK-001', 'Dentastix x7', 'Snacks dentales para perros', 25000, 15000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_snacks, 'SNACK-002', 'Galletas Entrenamiento x100', 'Galletas pequeñas para premiar', 18000, 11000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_snacks, 'SNACK-003', 'Hueso Natural M', 'Hueso natural de res', 15000, 9000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_snacks, 'SNACK-004', 'Dreamies Gato x60g', 'Premios crujientes para gatos', 20000, 12000, TRUE, ARRAY['cat'], 0.06),
        ('adris', v_cat_snacks, 'SNACK-005', 'Jerky Strips Pollo', 'Tiras de pollo deshidratado', 35000, 21000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_snacks, 'SNACK-006', 'Oreja de Cerdo x3', 'Orejas de cerdo deshidratadas', 28000, 17000, TRUE, ARRAY['dog'], NULL),

        -- Supplements
        ('adris', v_cat_supps, 'SUPP-001', 'Omega 3+6 Cápsulas x60', 'Suplemento para piel y pelo', 75000, 45000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_supps, 'SUPP-002', 'Glucosamina Articular', 'Suplemento para articulaciones', 85000, 51000, TRUE, ARRAY['dog'], NULL),
        ('adris', v_cat_supps, 'SUPP-003', 'Probióticos Digestivos', 'Suplemento para flora intestinal', 55000, 33000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_supps, 'SUPP-004', 'Multivitamínico Senior', 'Vitaminas para mascotas mayores', 65000, 39000, TRUE, ARRAY['dog', 'cat'], NULL),
        ('adris', v_cat_supps, 'SUPP-005', 'Calming Treats x30', 'Snacks calmantes naturales', 45000, 27000, TRUE, ARRAY['dog', 'cat'], NULL)

    ON CONFLICT (tenant_id, sku) DO UPDATE SET
        name = EXCLUDED.name,
        base_price = EXCLUDED.base_price,
        cost_price = EXCLUDED.cost_price,
        category_id = EXCLUDED.category_id;

    RAISE NOTICE 'Store products created successfully';
END $$;

-- =============================================================================
-- INVENTORY
-- =============================================================================

INSERT INTO public.store_inventory (product_id, tenant_id, stock_quantity, min_stock_level, reorder_quantity, weighted_average_cost)
SELECT
    sp.id,
    sp.tenant_id,
    CASE
        WHEN sp.sku LIKE 'FOOD-%' THEN 20 + (random() * 30)::int
        WHEN sp.sku LIKE 'ANTI-%' THEN 10 + (random() * 20)::int
        WHEN sp.sku LIKE 'ACC-%' THEN 8 + (random() * 12)::int
        WHEN sp.sku LIKE 'HYG-%' THEN 15 + (random() * 15)::int
        WHEN sp.sku LIKE 'TOY-%' THEN 10 + (random() * 15)::int
        WHEN sp.sku LIKE 'SNACK-%' THEN 20 + (random() * 20)::int
        WHEN sp.sku LIKE 'BED-%' THEN 4 + (random() * 6)::int
        WHEN sp.sku LIKE 'SUPP-%' THEN 8 + (random() * 12)::int
        ELSE 10
    END,
    CASE
        WHEN sp.sku LIKE 'FOOD-%' THEN 10
        WHEN sp.sku LIKE 'ANTI-%' THEN 5
        ELSE 3
    END,
    CASE
        WHEN sp.sku LIKE 'FOOD-%' THEN 30
        WHEN sp.sku LIKE 'ANTI-%' THEN 20
        ELSE 15
    END,
    COALESCE(sp.cost_price, sp.base_price * 0.6)
FROM public.store_products sp
WHERE sp.tenant_id = 'adris'
ON CONFLICT (product_id) DO UPDATE SET
    stock_quantity = EXCLUDED.stock_quantity,
    min_stock_level = EXCLUDED.min_stock_level,
    reorder_quantity = EXCLUDED.reorder_quantity,
    weighted_average_cost = EXCLUDED.weighted_average_cost;

-- =============================================================================
-- COUPONS
-- =============================================================================

INSERT INTO public.store_coupons (tenant_id, code, name, discount_type, discount_value, min_purchase_amount, usage_limit, valid_from, valid_until, is_active) VALUES
    ('adris', 'BIENVENIDO10', 'Bienvenido 10% Off', 'percentage', 10, 50000, 100, NOW(), NOW() + INTERVAL '90 days', TRUE),
    ('adris', 'NAVIDAD2024', 'Navidad 2024', 'percentage', 15, 100000, 50, '2024-12-01', '2024-12-31', TRUE),
    ('adris', 'DESCUENTO20K', '20.000 Gs Off', 'fixed_amount', 20000, 150000, 30, NOW(), NOW() + INTERVAL '60 days', TRUE),
    ('adris', 'PRIMERACOMPRA', 'Primera Compra 15%', 'percentage', 15, 0, NULL, NOW(), NOW() + INTERVAL '365 days', TRUE),
    ('adris', 'COMBO2X1', 'Segundo al 50%', 'percentage', 50, 100000, 20, NOW(), NOW() + INTERVAL '30 days', TRUE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- QR TAGS (Sample batch for testing)
-- =============================================================================

INSERT INTO public.qr_tags (tenant_id, code, is_active, is_registered, batch_id) VALUES
    ('adris', 'VET-A0001ABC', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0002DEF', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0003GHI', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0004JKL', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0005MNO', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0006PQR', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0007STU', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0008VWX', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0009YZ0', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VET-A0010123', TRUE, FALSE, 'BATCH-2024-001'),
    ('petlife', 'VET-P0001XYZ', TRUE, FALSE, 'BATCH-2024-002'),
    ('petlife', 'VET-P0002ABC', TRUE, FALSE, 'BATCH-2024-002'),
    ('petlife', 'VET-P0003DEF', TRUE, FALSE, 'BATCH-2024-002'),
    ('petlife', 'VET-P0004GHI', TRUE, FALSE, 'BATCH-2024-002'),
    ('petlife', 'VET-P0005JKL', TRUE, FALSE, 'BATCH-2024-002')
ON CONFLICT DO NOTHING;


