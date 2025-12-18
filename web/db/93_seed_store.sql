-- =============================================================================
-- 93_SEED_STORE.SQL
-- =============================================================================
-- Creates store categories, products, and inventory for testing.
-- =============================================================================

-- =============================================================================
-- 1. STORE CATEGORIES
-- =============================================================================

INSERT INTO store_categories (tenant_id, name, slug, description) VALUES
    -- Adris categories
    ('adris', 'Alimento Perros', 'alimento-perros', 'Alimento para perros de todas las edades'),
    ('adris', 'Alimento Gatos', 'alimento-gatos', 'Alimento para gatos de todas las edades'),
    ('adris', 'Antiparasitarios', 'antiparasitarios', 'Productos antiparasitarios internos y externos'),
    ('adris', 'Accesorios', 'accesorios', 'Collares, correas y accesorios'),
    ('adris', 'Higiene', 'higiene', 'Productos de higiene y limpieza'),
    ('adris', 'Juguetes', 'juguetes', 'Juguetes para perros y gatos'),
    ('adris', 'Camas y Casas', 'camas-casas', 'Camas, cuchas y transportadoras'),
    ('adris', 'Snacks y Premios', 'snacks-premios', 'Galletas, huesos y premios'),
    -- PetLife categories
    ('petlife', 'Alimentos', 'alimentos', 'Alimentos para mascotas'),
    ('petlife', 'Accesorios', 'accesorios', 'Accesorios varios')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- =============================================================================
-- 2. STORE PRODUCTS
-- =============================================================================

DO $$
DECLARE
    v_cat_dog_food UUID;
    v_cat_cat_food UUID;
    v_cat_anti UUID;
    v_cat_acc UUID;
    v_cat_hyg UUID;
    v_cat_toys UUID;
    v_cat_snacks UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO v_cat_dog_food FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros';
    SELECT id INTO v_cat_cat_food FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-gatos';
    SELECT id INTO v_cat_anti FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios';
    SELECT id INTO v_cat_acc FROM store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios';
    SELECT id INTO v_cat_hyg FROM store_categories WHERE tenant_id = 'adris' AND slug = 'higiene';
    SELECT id INTO v_cat_toys FROM store_categories WHERE tenant_id = 'adris' AND slug = 'juguetes';
    SELECT id INTO v_cat_snacks FROM store_categories WHERE tenant_id = 'adris' AND slug = 'snacks-premios';

    -- Insert products
    INSERT INTO store_products (tenant_id, sku, name, description, base_price, is_active, category_id) VALUES
        -- Dog Food
        ('adris', 'FOOD-DOG-001', 'Royal Canin Medium Adult 3kg', 'Alimento premium para perros adultos medianos', 85000, TRUE, v_cat_dog_food),
        ('adris', 'FOOD-DOG-002', 'Royal Canin Puppy 2kg', 'Alimento para cachorros', 75000, TRUE, v_cat_dog_food),
        ('adris', 'FOOD-DOG-003', 'Pro Plan Adult 7.5kg', 'Alimento super premium adultos', 180000, TRUE, v_cat_dog_food),
        ('adris', 'FOOD-DOG-004', 'Pedigree Adulto 15kg', 'Alimento economico adultos', 95000, TRUE, v_cat_dog_food),
        ('adris', 'FOOD-DOG-005', 'Royal Canin Mini Adult 1kg', 'Alimento para perros pequenos', 45000, TRUE, v_cat_dog_food),
        -- Cat Food
        ('adris', 'FOOD-CAT-001', 'Royal Canin Indoor 1.5kg', 'Alimento para gatos de interior', 65000, TRUE, v_cat_cat_food),
        ('adris', 'FOOD-CAT-002', 'Whiskas Adulto Pollo 1kg', 'Alimento para gatos adultos', 35000, TRUE, v_cat_cat_food),
        ('adris', 'FOOD-CAT-003', 'Pro Plan Urinary 3kg', 'Alimento para gatos con problemas urinarios', 120000, TRUE, v_cat_cat_food),
        ('adris', 'FOOD-CAT-004', 'Royal Canin Kitten 1kg', 'Alimento para gatitos', 55000, TRUE, v_cat_cat_food),
        -- Antiparasitics
        ('adris', 'ANTI-001', 'NexGard Spectra M (7-15kg)', 'Antiparasitario masticable mensual', 85000, TRUE, v_cat_anti),
        ('adris', 'ANTI-002', 'NexGard Spectra L (15-30kg)', 'Antiparasitario masticable mensual', 95000, TRUE, v_cat_anti),
        ('adris', 'ANTI-003', 'Frontline Plus Perro M', 'Pipeta antipulgas y garrapatas', 55000, TRUE, v_cat_anti),
        ('adris', 'ANTI-004', 'Frontline Plus Gato', 'Pipeta antipulgas para gatos', 50000, TRUE, v_cat_anti),
        ('adris', 'ANTI-005', 'Seresto Collar Perro M', 'Collar antiparasitario 8 meses', 180000, TRUE, v_cat_anti),
        ('adris', 'ANTI-006', 'Bravecto Perro M', 'Antiparasitario trimestral', 150000, TRUE, v_cat_anti),
        -- Accessories
        ('adris', 'ACC-001', 'Collar Nylon M', 'Collar ajustable para perro mediano', 25000, TRUE, v_cat_acc),
        ('adris', 'ACC-002', 'Correa Retractil 5m', 'Correa extensible con freno', 65000, TRUE, v_cat_acc),
        ('adris', 'ACC-003', 'Arnes Acolchado M', 'Arnes ergonomico para paseo', 55000, TRUE, v_cat_acc),
        ('adris', 'ACC-004', 'Plato Doble Inox', 'Comedero y bebedero acero inoxidable', 35000, TRUE, v_cat_acc),
        ('adris', 'ACC-005', 'Transportadora M', 'Transportadora para viajes', 120000, TRUE, v_cat_acc),
        -- Hygiene
        ('adris', 'HYG-001', 'Shampoo Antipulgas 500ml', 'Shampoo medicado contra pulgas', 35000, TRUE, v_cat_hyg),
        ('adris', 'HYG-002', 'Shampoo Pelo Blanco 500ml', 'Shampoo especial para pelo claro', 40000, TRUE, v_cat_hyg),
        ('adris', 'HYG-003', 'Cepillo Deslanador', 'Cepillo para remover pelo muerto', 45000, TRUE, v_cat_hyg),
        ('adris', 'HYG-004', 'Toallitas Humedas x50', 'Toallitas para limpieza rapida', 25000, TRUE, v_cat_hyg),
        ('adris', 'HYG-005', 'Cortaunas Profesional', 'Cortaunas de acero inoxidable', 30000, TRUE, v_cat_hyg),
        -- Toys
        ('adris', 'TOY-001', 'Kong Classic M', 'Juguete rellenable resistente', 55000, TRUE, v_cat_toys),
        ('adris', 'TOY-002', 'Pelota Tennis x3', 'Set de 3 pelotas de tennis', 20000, TRUE, v_cat_toys),
        ('adris', 'TOY-003', 'Hueso Nylon Sabor', 'Hueso de nylon con sabor', 30000, TRUE, v_cat_toys),
        ('adris', 'TOY-004', 'Cuerda Interactiva', 'Cuerda para juego de tira', 18000, TRUE, v_cat_toys),
        -- Snacks
        ('adris', 'SNACK-001', 'Dentastix x7', 'Snacks dentales para perros', 25000, TRUE, v_cat_snacks),
        ('adris', 'SNACK-002', 'Galletas Entrenamiento x100', 'Galletas pequenas para premiar', 18000, TRUE, v_cat_snacks),
        ('adris', 'SNACK-003', 'Hueso Natural M', 'Hueso natural de res', 15000, TRUE, v_cat_snacks)
    ON CONFLICT (tenant_id, sku) DO UPDATE SET
        name = EXCLUDED.name,
        base_price = EXCLUDED.base_price,
        category_id = EXCLUDED.category_id,
        is_active = EXCLUDED.is_active;

    RAISE NOTICE 'Store products created';
END $$;

-- =============================================================================
-- 3. INVENTORY
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
-- STORE DATA CREATED
-- =============================================================================
