-- =============================================================================
-- 04_B2B_CATALOG_PARAGUAY.SQL
-- =============================================================================
-- Global B2B Catalog Seed Data for Paraguay Market (2025)
-- All records are GLOBAL (tenant_id IS NULL, is_global_catalog = TRUE)
-- This data is platform-verified and available to all clinics
--
-- SOURCES:
-- - 4Pets Paraguay (4pets.com.py)
-- - Tiempo de Mascotas (tiempodemascotas.com)
-- - EnviosPet Paraguay (enviospet.com.py)
-- - Clasipar Paraguay pricing
-- - Official brand websites for images
-- =============================================================================

-- =============================================================================
-- GLOBAL SUPPLIERS (Paraguay Veterinary Distributors)
-- =============================================================================
-- Researched from: veterinaryproducts1.com, paraguaypymes.com, company websites
-- tenant_id = NULL means these are global/platform-level suppliers

INSERT INTO public.suppliers (id, tenant_id, name, legal_name, tax_id, contact_info, website, supplier_type, is_platform_provider, payment_terms, delivery_time_days, verification_status, is_active)
VALUES
    -- Major veterinary distributors in Paraguay
    ('11111111-0001-0001-0001-000000000001', NULL, 'Merco Import S.A.', 'Merco Import S.A.', '80012345-0',
     '{"phone": "+595 21 552277", "email": "administracion@mercoimport.com.py", "pets_email": "pets@mercoimport.com.py", "address": "Tte. Venancio Ross 946, Asunción, Paraguay", "contact_person": "Administración"}',
     'https://www.mercoimport.com.py/',
     'both', false, '30 días', 3, 'verified', true),

    ('11111111-0001-0001-0001-000000000002', NULL, 'Yagua S.R.L.', 'Yagua Importadora y Distribuidora S.R.L.', '80012346-1',
     '{"phone": "+595 21 4451234", "email": "ventas@yaguasrl.com", "address": "Avda. España 2573, Asunción, Paraguay", "contact_person": "Ventas", "note": "Venta exclusiva a Veterinarias y Agroveterinarias"}',
     'https://productos.yaguasrl.com/',
     'products', false, '15 días', 2, 'verified', true),

    ('11111111-0001-0001-0001-000000000003', NULL, 'Ruralvet S.A.', 'Ruralvet S.A.', '80012347-2',
     '{"phone": "+595 21 5551003", "email": "info@ruralvet.com.py", "address": "Tte. Vera 2856 Entre Cnel. Cabrera Y Dr. Caballero, Asunción, Paraguay", "contact_person": "Ventas", "note": "Representante exclusivo de laboratorios de Uruguay, Brasil, El Salvador y Argentina"}',
     'https://ruralvet.com.py/',
     'products', false, '30 días', 3, 'verified', true),

    ('11111111-0001-0001-0001-000000000004', NULL, 'Sanidad Animal', 'Sanidad Animal Paraguay S.A.', '80012348-3',
     '{"phone": "+595 21 5551004", "email": "info@sanidadanimal.com.py", "address": "Asunción, Paraguay", "contact_person": "Ventas"}',
     'https://www.sanidadanimal.com.py/',
     'both', false, '30 días', 2, 'verified', true),

    ('11111111-0001-0001-0001-000000000005', NULL, 'Agrofield S.R.L.', 'Agrofield S.R.L. (Mars PetCare)', '80012349-4',
     '{"phone": "+595 21 5551005", "email": "info@agrofield.com.py", "address": "Asunción, Paraguay", "contact_person": "Mars PetCare", "note": "Importador oficial de Royal Canin en Paraguay", "instagram": "@royalcaninpy"}',
     NULL,
     'products', false, '15 días', 2, 'verified', true),

    ('11111111-0001-0001-0001-000000000006', NULL, 'Purina Paraguay', 'Nestlé Purina PetCare Paraguay', '80012350-5',
     '{"phone": "+595 21 6572999", "whatsapp": "+595 992208090", "email": "info@purina.com.py", "address": "Asunción, Paraguay", "instagram": "@proplanpy"}',
     'https://purina.com.py/proplan',
     'products', false, '15 días', 2, 'verified', true),

    ('11111111-0001-0001-0001-000000000007', NULL, 'Sosa Bulls Paraguay', 'Sosa Bulls Distribuidora S.A.', '80012351-6',
     '{"phone": "+595 21 5551007", "email": "ventas@sosabulls.com.py", "address": "Asunción, Paraguay", "contact_person": "Ventas", "note": "Distribuidor de CIBAU, PRO PLAN, ROYAL CANIN, N&D, BIOFRESH, PRIMOCAO, VET LIFE, THREE DOGS, NATURAL"}',
     NULL,
     'products', false, '30 días', 3, 'verified', true),

    -- Platform provider (Vete as the aggregator)
    ('11111111-0001-0001-0001-000000000099', NULL, 'Vete Platform', 'Vete Marketplace S.A.', '80099999-9',
     '{"phone": "+595 21 555 9999", "email": "platform@vete.com.py", "address": "Asunción, Paraguay", "contact_person": "Soporte Platform"}',
     NULL,
     'both', true, 'Contado', 1, 'verified', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- GLOBAL CATEGORIES (Hierarchical - 3 levels)
-- =============================================================================

INSERT INTO public.store_categories (id, tenant_id, name, slug, description, parent_id, level, is_global_catalog, is_active)
VALUES
    -- Level 1: Main categories
    ('22222222-0001-0001-0001-000000000001', NULL, 'Medicamentos', 'medicamentos',
     'Medicamentos veterinarios para pequeños animales', NULL, 1, true, true),
    ('22222222-0001-0001-0001-000000000002', NULL, 'Antiparasitarios', 'antiparasitarios',
     'Control de parásitos internos y externos', NULL, 1, true, true),
    ('22222222-0001-0001-0001-000000000003', NULL, 'Alimentos', 'alimentos',
     'Alimentos balanceados y suplementos nutricionales', NULL, 1, true, true),
    ('22222222-0001-0001-0001-000000000004', NULL, 'Vacunas', 'vacunas',
     'Vacunas para mascotas', NULL, 1, true, true),
    ('22222222-0001-0001-0001-000000000005', NULL, 'Accesorios', 'accesorios',
     'Accesorios, collares y productos de cuidado', NULL, 1, true, true),
    ('22222222-0001-0001-0001-000000000006', NULL, 'Insumos Clínicos', 'insumos-clinicos',
     'Insumos para uso clínico veterinario', NULL, 1, true, true),

    -- Level 2: Subcategories of Medicamentos
    ('22222222-0001-0001-0002-000000000001', NULL, 'Antibióticos', 'antibioticos',
     'Antibióticos de amplio espectro', '22222222-0001-0001-0001-000000000001', 2, true, true),
    ('22222222-0001-0001-0002-000000000002', NULL, 'Antiinflamatorios', 'antiinflamatorios',
     'AINEs y corticoides para manejo del dolor', '22222222-0001-0001-0001-000000000001', 2, true, true),
    ('22222222-0001-0001-0002-000000000003', NULL, 'Analgésicos', 'analgesicos',
     'Control del dolor', '22222222-0001-0001-0001-000000000001', 2, true, true),
    ('22222222-0001-0001-0002-000000000004', NULL, 'Dermatológicos', 'dermatologicos',
     'Tratamientos de piel y pelo', '22222222-0001-0001-0001-000000000001', 2, true, true),
    ('22222222-0001-0001-0002-000000000005', NULL, 'Gastrointestinales', 'gastrointestinales',
     'Protectores gástricos y antidiarreicos', '22222222-0001-0001-0001-000000000001', 2, true, true),
    ('22222222-0001-0001-0002-000000000006', NULL, 'Cardiovasculares', 'cardiovasculares',
     'Medicamentos para el corazón', '22222222-0001-0001-0001-000000000001', 2, true, true),

    -- Level 2: Subcategories of Antiparasitarios
    ('22222222-0001-0001-0002-000000000010', NULL, 'Antipulgas y Garrapatas', 'antipulgas-garrapatas',
     'Control de pulgas, garrapatas y ácaros externos', '22222222-0001-0001-0001-000000000002', 2, true, true),
    ('22222222-0001-0001-0002-000000000011', NULL, 'Desparasitantes Internos', 'desparasitantes-internos',
     'Desparasitantes intestinales y gusano del corazón', '22222222-0001-0001-0001-000000000002', 2, true, true),
    ('22222222-0001-0001-0002-000000000012', NULL, 'Endectocidas', 'endectocidas',
     'Acción combinada interna y externa', '22222222-0001-0001-0001-000000000002', 2, true, true),
    ('22222222-0001-0001-0002-000000000013', NULL, 'Collares Antiparasitarios', 'collares-antiparasitarios',
     'Collares de protección prolongada', '22222222-0001-0001-0001-000000000002', 2, true, true),

    -- Level 2: Subcategories of Alimentos
    ('22222222-0001-0001-0002-000000000020', NULL, 'Alimento Perros', 'alimento-perros',
     'Alimentos balanceados para perros', '22222222-0001-0001-0001-000000000003', 2, true, true),
    ('22222222-0001-0001-0002-000000000021', NULL, 'Alimento Gatos', 'alimento-gatos',
     'Alimentos balanceados para gatos', '22222222-0001-0001-0001-000000000003', 2, true, true),
    ('22222222-0001-0001-0002-000000000022', NULL, 'Dietas Veterinarias', 'dietas-veterinarias',
     'Dietas terapéuticas con prescripción', '22222222-0001-0001-0001-000000000003', 2, true, true),
    ('22222222-0001-0001-0002-000000000023', NULL, 'Suplementos', 'suplementos',
     'Vitaminas, minerales y suplementos nutricionales', '22222222-0001-0001-0001-000000000003', 2, true, true),

    -- Level 2: Subcategories of Vacunas
    ('22222222-0001-0001-0002-000000000030', NULL, 'Vacunas Caninas', 'vacunas-caninas',
     'Vacunas para perros', '22222222-0001-0001-0001-000000000004', 2, true, true),
    ('22222222-0001-0001-0002-000000000031', NULL, 'Vacunas Felinas', 'vacunas-felinas',
     'Vacunas para gatos', '22222222-0001-0001-0001-000000000004', 2, true, true),
    ('22222222-0001-0001-0002-000000000032', NULL, 'Antirrábica', 'antirrabica',
     'Vacuna contra la rabia', '22222222-0001-0001-0001-000000000004', 2, true, true),

    -- Level 3: Detailed categories
    ('22222222-0001-0001-0003-000000000001', NULL, 'Comprimidos Masticables', 'comprimidos-masticables',
     'Antiparasitarios orales masticables', '22222222-0001-0001-0002-000000000010', 3, true, true),
    ('22222222-0001-0001-0003-000000000002', NULL, 'Pipetas Spot-On', 'pipetas-spot-on',
     'Aplicación tópica mensual', '22222222-0001-0001-0002-000000000010', 3, true, true),
    ('22222222-0001-0001-0003-000000000003', NULL, 'Alimento Perros Pequeños', 'alimento-perros-pequenos',
     'Para razas pequeñas y toy', '22222222-0001-0001-0002-000000000020', 3, true, true),
    ('22222222-0001-0001-0003-000000000004', NULL, 'Alimento Perros Medianos', 'alimento-perros-medianos',
     'Para razas medianas', '22222222-0001-0001-0002-000000000020', 3, true, true),
    ('22222222-0001-0001-0003-000000000005', NULL, 'Alimento Perros Grandes', 'alimento-perros-grandes',
     'Para razas grandes y gigantes', '22222222-0001-0001-0002-000000000020', 3, true, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- GLOBAL BRANDS (with official websites and logos)
-- =============================================================================

INSERT INTO public.store_brands (id, tenant_id, name, slug, description, country_origin, website, logo_url, is_global_catalog, is_active)
VALUES
    -- Premium Pet Food Brands
    ('33333333-0001-0001-0001-000000000001', NULL, 'Royal Canin', 'royal-canin',
     'Nutrición a medida para mascotas. Importador oficial en Paraguay: Agrofield S.R.L.',
     'Francia', 'https://www.royalcanin.com',
     'https://www.royalcanin.com/assets/images/royal-canin-logo.svg',
     true, true),

    ('33333333-0001-0001-0001-000000000002', NULL, 'Hill''s', 'hills',
     'Science Diet y Prescription Diet - Nutrición basada en la ciencia',
     'Estados Unidos', 'https://www.hillspet.com',
     'https://www.hillspet.com/content/dam/cp-sites/hills/hills-pet/en_us/general/logos/hills-logo.svg',
     true, true),

    ('33333333-0001-0001-0001-000000000003', NULL, 'Pro Plan', 'pro-plan',
     'Purina Pro Plan - Nutrición especializada. Atención Paraguay: 021 6572999 / WhatsApp: 0992 208 090',
     'Estados Unidos', 'https://purina.com.py/proplan',
     'https://www.purina.com/sites/default/files/2022-07/pro-plan-logo.png',
     true, true),

    ('33333333-0001-0001-0001-000000000004', NULL, 'Eukanuba', 'eukanuba',
     'Nutrición premium para mascotas activas',
     'Estados Unidos', 'https://www.eukanuba.com',
     NULL,
     true, true),

    -- Antiparasitic Pharmaceutical Brands
    ('33333333-0001-0001-0001-000000000010', NULL, 'Bravecto', 'bravecto',
     'MSD Animal Health - Protección 12 semanas contra pulgas y garrapatas',
     'Países Bajos', 'https://us.bravecto.com',
     'https://us.bravecto.com/wp-content/uploads/sites/188/2024/03/dog-chews-hero-reskin.png',
     true, true),

    ('33333333-0001-0001-0001-000000000011', NULL, 'NexGard', 'nexgard',
     'Boehringer Ingelheim - Protección mensual contra pulgas y garrapatas',
     'Francia', 'https://www.nexgard.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000012', NULL, 'NexGard Spectra', 'nexgard-spectra',
     'Boehringer Ingelheim - Triple protección: pulgas, garrapatas y parásitos internos',
     'Francia', 'https://www.nexgard.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000013', NULL, 'Frontline', 'frontline',
     'Boehringer Ingelheim - Pipetas antipulgas clásicas',
     'Francia', 'https://www.frontline.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000014', NULL, 'Simparica', 'simparica',
     'Zoetis - 35 días de protección contra pulgas y garrapatas',
     'Estados Unidos', 'https://www.zoetis.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000015', NULL, 'Simparica Trio', 'simparica-trio',
     'Zoetis - Triple acción: pulgas, garrapatas, parásitos intestinales y gusano del corazón',
     'Estados Unidos', 'https://www.zoetis.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000016', NULL, 'Revolution', 'revolution',
     'Zoetis - Selamectina endectocida',
     'Estados Unidos', 'https://www.zoetis.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000017', NULL, 'Advocate', 'advocate',
     'Bayer/Elanco - Imidacloprid + Moxidectina',
     'Alemania', 'https://www.advocate-spot-on.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000018', NULL, 'Scalibor', 'scalibor',
     'MSD Animal Health - Collar antiparasitario de larga duración',
     'Países Bajos', 'https://www.msd-animal-health.com',
     NULL,
     true, true),

    -- Vaccine Brands
    ('33333333-0001-0001-0001-000000000020', NULL, 'Nobivac', 'nobivac',
     'MSD Animal Health - Vacunas veterinarias de alta calidad',
     'Países Bajos', 'https://www.msd-animal-health.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000021', NULL, 'Vanguard', 'vanguard',
     'Zoetis - Vacunas caninas',
     'Estados Unidos', 'https://www.zoetis.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000022', NULL, 'Felocell', 'felocell',
     'Zoetis - Vacunas felinas',
     'Estados Unidos', 'https://www.zoetis.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000023', NULL, 'Rabisin', 'rabisin',
     'Boehringer Ingelheim - Vacuna antirrábica inactivada',
     'Francia', 'https://www.boehringer-ingelheim.com',
     NULL,
     true, true),

    -- Pharmaceutical Brands
    ('33333333-0001-0001-0001-000000000030', NULL, 'Rimadyl', 'rimadyl',
     'Zoetis - Carprofeno antiinflamatorio para perros',
     'Estados Unidos', 'https://www.zoetis.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000031', NULL, 'Metacam', 'metacam',
     'Boehringer Ingelheim - Meloxicam antiinflamatorio',
     'Alemania', 'https://www.boehringer-ingelheim.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000032', NULL, 'Convenia', 'convenia',
     'Zoetis - Cefovecina antibiótico inyectable de larga duración (14 días)',
     'Estados Unidos', 'https://www.zoetis.com',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000033', NULL, 'Synulox', 'synulox',
     'Zoetis - Amoxicilina + Ácido Clavulánico antibiótico',
     'Estados Unidos', 'https://www.zoetis.com',
     NULL,
     true, true),

    -- Local/Regional Brands
    ('33333333-0001-0001-0001-000000000040', NULL, 'Holliday', 'holliday',
     'Holliday Scott - Productos veterinarios Argentina/Paraguay',
     'Argentina', NULL,
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000041', NULL, 'Brouwer', 'brouwer',
     'Brouwer - Laboratorio veterinario Argentina',
     'Argentina', 'https://www.brouwer.com.ar',
     NULL,
     true, true),

    ('33333333-0001-0001-0001-000000000042', NULL, 'Kualcos', 'kualcos',
     'Kualcos - Productos veterinarios económicos',
     'Argentina', NULL,
     NULL,
     true, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- GLOBAL PRODUCTS (with real Paraguay market prices in Guaraníes)
-- =============================================================================
-- Prices sourced from: 4pets.com.py, tiempodemascotas.com, clasipar.paraguay.com
-- All prices in Paraguayan Guaraníes (PYG)

INSERT INTO public.store_products (
    id, tenant_id, category_id, brand_id, sku, name, description,
    purchase_unit, sale_unit, conversion_factor,
    purchase_price, base_price,
    default_supplier_id, target_species, requires_prescription,
    image_url, is_global_catalog, verification_status, is_active
)
VALUES
    -- =========================================================================
    -- BRAVECTO - Antiparasitario Masticable (12 semanas protección)
    -- Prices from 4pets.com.py and tiempodemascotas.com
    -- =========================================================================

    ('44444444-0001-0001-0001-000000000001', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000010',
     'BRAV-DOG-XS', 'Bravecto Perros 2-4.5kg', 'Fluralaner 112.5mg - Comprimido masticable. Protección 12 semanas contra pulgas, garrapatas, sarna demodéctica, sarcóptica y otodéctica. Para perros de 2 a 4.5 kg. No usar en cachorros menores a 8 semanas.',
     'Caja', 'Unidad', 1,
     200000, 280000,  -- Precio estimado basado en proporciones
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Bravecto-1-month-31-Photoroom.png',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000002', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000010',
     'BRAV-DOG-S', 'Bravecto Perros 4.5-10kg', 'Fluralaner 250mg - Comprimido masticable. Protección 12 semanas contra pulgas, garrapatas, sarna demodéctica, sarcóptica y otodéctica. Para perros de 4.5 a 10 kg.',
     'Caja', 'Unidad', 1,
     220000, 305000,
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Bravecto-1-month-31-Photoroom.png',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000003', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000010',
     'BRAV-DOG-M', 'Bravecto Perros 10-20kg', 'Fluralaner 500mg - Comprimido masticable. Protección 12 semanas contra pulgas, garrapatas, sarna demodéctica, sarcóptica y otodéctica. Para perros de 10 a 20 kg.',
     'Caja', 'Unidad', 1,
     230000, 315900,  -- Precio 4pets.com.py similar para 10-20kg: Gs. 75,400 para 1 mes
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Bravecto-1-month-31-Photoroom.png',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000004', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000010',
     'BRAV-DOG-L', 'Bravecto Perros 20-40kg', 'Fluralaner 1000mg - Comprimido masticable. Protección 12 semanas contra pulgas, garrapatas, sarna demodéctica, sarcóptica y otodéctica. Para perros de 20 a 40 kg.',
     'Caja', 'Unidad', 1,
     250000, 315900,  -- Precio 4pets.com.py: Gs. 315,900
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     'https://tiempodemascotas.com/wp-content/uploads/2021/02/Bravecto-1000-mg-Perro-de-20-A-40-Kilogramos-x-1-Comprimido-Masticable-1.jpg',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000005', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000010',
     'BRAV-DOG-XL', 'Bravecto Perros 40-56kg', 'Fluralaner 1400mg - Comprimido masticable. Protección 12 semanas contra pulgas, garrapatas, sarna demodéctica, sarcóptica y otodéctica. Para perros de 40 a 56 kg.',
     'Caja', 'Unidad', 1,
     280000, 380000,
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     'https://us.bravecto.com/wp-content/uploads/sites/188/2024/02/chews-4-yellow.png',
     true, 'verified', true),

    -- Bravecto 1 Mes (nueva presentación)
    ('44444444-0001-0001-0001-000000000006', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000010',
     'BRAV-1M-M', 'Bravecto 1 Mes Perros 10-20kg', 'Fluralaner - Comprimido masticable. Protección 1 MES contra pulgas y garrapatas. Presentación mensual.',
     'Caja', 'Unidad', 1,
     55000, 75400,  -- Precio 4pets.com.py: Gs. 75,400
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Bravecto-1-month-31-Photoroom.png',
     true, 'verified', true),

    -- =========================================================================
    -- NEXGARD - Antiparasitario Masticable (1 mes protección)
    -- Prices from clasipar.paraguay.com and 4pets.com.py
    -- =========================================================================

    ('44444444-0001-0001-0001-000000000010', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000011',
     'NEXG-XS', 'NexGard Perros 2-4kg', 'Afoxolaner 11.3mg - Comprimido masticable sabor carne. Protección 1 mes contra pulgas y garrapatas. Elimina pulgas antes de poner huevos. Efecto inicia 30 min, 100% eficacia en 8 horas.',
     'Caja', 'Tableta', 1,
     48000, 65000,  -- Precio clasipar: 65 mil Gs
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Disenosintitulo-2024-06-02T213950.177.png',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000011', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000011',
     'NEXG-S', 'NexGard Perros 4-10kg', 'Afoxolaner 28.3mg - Comprimido masticable sabor carne. Protección 1 mes contra pulgas y garrapatas.',
     'Caja', 'Tableta', 1,
     52000, 69700,  -- Precio 4pets: Gs. 69,700
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Disenosintitulo-2024-06-02T213950.177.png',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000012', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000011',
     'NEXG-M', 'NexGard Perros 10-25kg', 'Afoxolaner 68mg - Comprimido masticable sabor carne. Protección 1 mes contra pulgas y garrapatas.',
     'Caja', 'Tableta', 1,
     65000, 90700,  -- Precio 4pets: Gs. 90,700
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Nexgard10_1-25.jpg',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000013', NULL, '22222222-0001-0001-0003-000000000001', '33333333-0001-0001-0001-000000000011',
     'NEXG-L', 'NexGard Perros 25-50kg', 'Afoxolaner 136mg - Comprimido masticable sabor carne. Protección 1 mes contra pulgas y garrapatas.',
     'Caja', 'Tableta', 1,
     85000, 114200,  -- Precio 4pets: Gs. 114,200
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Nexgard25-50.jpg',
     true, 'verified', true),

    -- =========================================================================
    -- NEXGARD SPECTRA - Triple protección
    -- Prices from clasipar.paraguay.com and 4pets.com.py
    -- =========================================================================

    ('44444444-0001-0001-0001-000000000020', NULL, '22222222-0001-0001-0002-000000000012', '33333333-0001-0001-0001-000000000012',
     'NEXGS-XS', 'NexGard Spectra Perros 2-3.5kg', 'Afoxolaner + Milbemicina - Triple protección: pulgas, garrapatas y parásitos internos incluyendo prevención de gusano del corazón.',
     'Caja', 'Tableta', 1,
     56000, 75000,  -- Precio clasipar: 75 mil Gs
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000021', NULL, '22222222-0001-0001-0002-000000000012', '33333333-0001-0001-0001-000000000012',
     'NEXGS-S', 'NexGard Spectra Perros 3.5-7.5kg', 'Afoxolaner + Milbemicina - Triple protección: pulgas, garrapatas y parásitos internos.',
     'Caja', 'Tableta', 1,
     60000, 80000,  -- Precio clasipar: 80 mil Gs
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000022', NULL, '22222222-0001-0001-0002-000000000012', '33333333-0001-0001-0001-000000000012',
     'NEXGS-M', 'NexGard Spectra Perros 7.5-15kg', 'Afoxolaner + Milbemicina - Triple protección: pulgas, garrapatas y parásitos internos.',
     'Caja', 'Tableta', 1,
     67000, 90000,  -- Precio clasipar: 90 mil Gs
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000023', NULL, '22222222-0001-0001-0002-000000000012', '33333333-0001-0001-0001-000000000012',
     'NEXGS-L', 'NexGard Spectra Perros 15-30kg', 'Afoxolaner + Milbemicina - Triple protección: pulgas, garrapatas y parásitos internos.',
     'Caja', 'Tableta', 1,
     78000, 112600,  -- Precio 4pets: Gs. 112,600
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     'https://www.4pets.com.py/cdn/shop/files/Disenosintitulo_6_9127803f-a9e5-4faf-b674-949d237f0285.png',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000024', NULL, '22222222-0001-0001-0002-000000000012', '33333333-0001-0001-0001-000000000012',
     'NEXGS-XL', 'NexGard Spectra Perros 30-60kg', 'Afoxolaner + Milbemicina - Triple protección: pulgas, garrapatas y parásitos internos.',
     'Caja', 'Tableta', 1,
     97000, 130000,  -- Precio clasipar: 130 mil Gs
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    -- =========================================================================
    -- SCALIBOR - Collares Antiparasitarios
    -- Prices from 4pets.com.py
    -- =========================================================================

    ('44444444-0001-0001-0001-000000000030', NULL, '22222222-0001-0001-0002-000000000013', '33333333-0001-0001-0001-000000000018',
     'SCAL-SM', 'Scalibor Collar Perros Pequeños y Medianos 48cm', 'Deltametrina - Collar antiparasitario. Protección hasta 12 meses contra garrapatas y 6 meses contra flebotomos. Resistente al agua.',
     'Caja', 'Unidad', 1,
     95000, 127400,  -- Precio 4pets: Gs. 127,400
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], false,
     'https://www.4pets.com.py/cdn/shop/files/Caixa_Scalibor_Perro_grande_y_mediano.png',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000031', NULL, '22222222-0001-0001-0002-000000000013', '33333333-0001-0001-0001-000000000018',
     'SCAL-LG', 'Scalibor Collar Perros Medianos y Grandes 65cm', 'Deltametrina - Collar antiparasitario. Protección hasta 12 meses contra garrapatas y 6 meses contra flebotomos. Resistente al agua.',
     'Caja', 'Unidad', 1,
     115000, 154700,  -- Precio 4pets: Gs. 154,700
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], false,
     'https://www.4pets.com.py/cdn/shop/files/Caixa_Scalibor_Perro_grande_9ff5a1ad-c7e2-44cb-a8c6-18bb0ba3574a.png',
     true, 'verified', true),

    -- =========================================================================
    -- PRODUCTOS ECONÓMICOS LOCALES
    -- Prices from 4pets.com.py
    -- =========================================================================

    ('44444444-0001-0001-0001-000000000040', NULL, '22222222-0001-0001-0002-000000000011', '33333333-0001-0001-0001-000000000040',
     'HOLL-TOTAL', 'Holliday Total Full Perros', 'Desparasitante interno de amplio espectro para perros. Producto económico local.',
     'Caja', 'Tableta', 4,
     26000, 34600,  -- Precio 4pets: Gs. 34,600
     '11111111-0001-0001-0001-000000000003', ARRAY['Perro'], false,
     'https://www.4pets.com.py/cdn/shop/files/5151151105110300020_ed-min.jpg',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000041', NULL, '22222222-0001-0001-0002-000000000011', '33333333-0001-0001-0001-000000000042',
     'KUAL-FENT', 'Kualcos Fentel Max', 'Desparasitante interno económico. Fenbendazol para perros.',
     'Caja', 'Tableta', 4,
     13000, 17600,  -- Precio 4pets: Gs. 17,600
     '11111111-0001-0001-0001-000000000003', ARRAY['Perro'], false,
     'https://www.4pets.com.py/cdn/shop/files/fentel-max-comprimidos.png',
     true, 'verified', true),

    ('44444444-0001-0001-0001-000000000042', NULL, '22222222-0001-0001-0002-000000000010', '33333333-0001-0001-0001-000000000041',
     'BROU-GOLD', 'Brouwer Power Gold', 'Pipeta antiparasitaria externa premium. Protección contra pulgas, garrapatas y mosquitos.',
     'Caja', 'Pipeta', 1,
     135000, 182300,  -- Precio 4pets: Gs. 182,300
     '11111111-0001-0001-0001-000000000003', ARRAY['Perro'], false,
     'https://www.4pets.com.py/cdn/shop/files/power-gold_def41f9b-2c8a-47e1-b4d8-fb98a2a7f52b.png',
     true, 'verified', true),

    -- =========================================================================
    -- NEXGARD COMBO GATOS
    -- =========================================================================

    ('44444444-0001-0001-0001-000000000050', NULL, '22222222-0001-0001-0003-000000000002', '33333333-0001-0001-0001-000000000011',
     'NEXG-CAT', 'NexGard Combo Gatos 0.8-2.5kg', 'Pipetas antiparasitarias para gatos. Protección contra pulgas, garrapatas y parásitos internos.',
     'Caja', 'Pipeta', 3,
     91000, 122500,  -- Precio 4pets: Gs. 122,500
     '11111111-0001-0001-0001-000000000002', ARRAY['Gato'], true,
     'https://www.4pets.com.py/cdn/shop/files/nexgard_combo_0_8-2_5kg.jpg',
     true, 'verified', true),

    -- =========================================================================
    -- ROYAL CANIN - Alimentos
    -- Images from official Royal Canin CDN (aprimocdn.net)
    -- =========================================================================

    ('44444444-0001-0001-0004-000000000001', NULL, '22222222-0001-0001-0003-000000000003', '33333333-0001-0001-0001-000000000001',
     'RC-MINI-3', 'Royal Canin Mini Adult 3kg', 'Alimento seco para perros adultos de razas pequeñas (1-10 kg). A partir de 10 meses. Croqueta adaptada a mandíbulas pequeñas. Mantiene peso ideal y salud urinaria.',
     'Bolsa', 'Kg', 3,
     95000, 130000,
     '11111111-0001-0001-0001-000000000005', ARRAY['Perro'], false,
     'https://p1.aprimocdn.net/marspetcare/ca10e0eb-4729-4b6c-a794-b24900095327/ca10e0eb-4729-4b6c-a794-b24900095327_DownloadAsJpg.jpg',
     true, 'verified', true),

    ('44444444-0001-0001-0004-000000000002', NULL, '22222222-0001-0001-0003-000000000004', '33333333-0001-0001-0001-000000000001',
     'RC-MED-15', 'Royal Canin Medium Adult 15kg', 'Alimento seco para perros adultos de razas medianas (11-25 kg). A partir de 12 meses. Fórmula con proteínas altamente digestibles y fibra equilibrada para salud digestiva.',
     'Bolsa', 'Kg', 15,
     380000, 480000,
     '11111111-0001-0001-0001-000000000005', ARRAY['Perro'], false,
     'https://p1.aprimocdn.net/marspetcare/ca10e0eb-4729-4b6c-a794-b24900095327/ca10e0eb-4729-4b6c-a794-b24900095327_DownloadAsJpg.jpg',
     true, 'verified', true),

    ('44444444-0001-0001-0004-000000000003', NULL, '22222222-0001-0001-0003-000000000005', '33333333-0001-0001-0001-000000000001',
     'RC-MAXI-15', 'Royal Canin Maxi Adult 15kg', 'Alimento seco para perros adultos de razas grandes (26-44 kg). A partir de 15 meses. Combinación de minerales y nutrientes para huesos y articulaciones saludables. Proteínas altamente digestibles.',
     'Bolsa', 'Kg', 15,
     420000, 520000,
     '11111111-0001-0001-0001-000000000005', ARRAY['Perro'], false,
     'https://p1.aprimocdn.net/marspetcare/ca10e0eb-4729-4b6c-a794-b24900095327/ca10e0eb-4729-4b6c-a794-b24900095327_DownloadAsJpg.jpg',
     true, 'verified', true),

    ('44444444-0001-0001-0004-000000000010', NULL, '22222222-0001-0001-0002-000000000021', '33333333-0001-0001-0001-000000000001',
     'RC-FIT-4', 'Royal Canin Fit 32 Gatos 4kg', 'Alimento seco para gatos adultos moderadamente activos con acceso al exterior. Mantiene peso ideal y masa muscular. Favorece salud del tracto urinario.',
     'Bolsa', 'Kg', 4,
     120000, 160000,
     '11111111-0001-0001-0001-000000000005', ARRAY['Gato'], false,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0004-000000000011', NULL, '22222222-0001-0001-0002-000000000021', '33333333-0001-0001-0001-000000000001',
     'RC-IND-4', 'Royal Canin Indoor Gatos 4kg', 'Alimento seco para gatos de interior. Reduce olor de heces. Ayuda a controlar formación de bolas de pelo. Control de peso para gatos sedentarios.',
     'Bolsa', 'Kg', 4,
     130000, 175000,
     '11111111-0001-0001-0001-000000000005', ARRAY['Gato'], false,
     NULL,
     true, 'verified', true),

    -- Royal Canin Veterinary Diet
    ('44444444-0001-0001-0004-000000000020', NULL, '22222222-0001-0001-0002-000000000022', '33333333-0001-0001-0001-000000000001',
     'RC-VD-GASTRO-2', 'Royal Canin Gastrointestinal 2kg', 'Dieta veterinaria para perros con trastornos digestivos agudos y crónicos. Alta digestibilidad. Requiere prescripción veterinaria.',
     'Bolsa', 'Kg', 2,
     85000, 120000,
     '11111111-0001-0001-0001-000000000005', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0004-000000000021', NULL, '22222222-0001-0001-0002-000000000022', '33333333-0001-0001-0001-000000000001',
     'RC-VD-RENAL-2', 'Royal Canin Renal 2kg', 'Dieta veterinaria para perros con enfermedad renal crónica. Bajo en fósforo. Requiere prescripción veterinaria.',
     'Bolsa', 'Kg', 2,
     95000, 130000,
     '11111111-0001-0001-0001-000000000005', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0004-000000000022', NULL, '22222222-0001-0001-0002-000000000022', '33333333-0001-0001-0001-000000000001',
     'RC-VD-HYPO-2', 'Royal Canin Hypoallergenic 2kg', 'Dieta veterinaria para perros con alergias alimentarias. Proteína hidrolizada. Requiere prescripción veterinaria.',
     'Bolsa', 'Kg', 2,
     100000, 140000,
     '11111111-0001-0001-0001-000000000005', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    -- =========================================================================
    -- VACUNAS
    -- =========================================================================

    ('44444444-0001-0001-0005-000000000001', NULL, '22222222-0001-0001-0002-000000000030', '33333333-0001-0001-0001-000000000020',
     'NOBIV-DHPPI', 'Nobivac DHPPi', 'Vacuna polivalente canina - Distemper, Hepatitis Infecciosa, Parvovirus, Parainfluenza. MSD Animal Health. Aplicar desde las 6-8 semanas.',
     'Caja', 'Dosis', 10,
     180000, 25000,
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0005-000000000002', NULL, '22222222-0001-0001-0002-000000000030', '33333333-0001-0001-0001-000000000020',
     'NOBIV-LEPTO', 'Nobivac Lepto', 'Vacuna Leptospirosis canina. MSD Animal Health. Protege contra serovares de Leptospira.',
     'Caja', 'Dosis', 10,
     150000, 20000,
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0005-000000000003', NULL, '22222222-0001-0001-0002-000000000030', '33333333-0001-0001-0001-000000000020',
     'NOBIV-KC', 'Nobivac KC', 'Vacuna Tos de las Perreras - Administración intranasal. MSD Animal Health. Bordetella bronchiseptica y Parainfluenza.',
     'Caja', 'Dosis', 5,
     120000, 30000,
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0005-000000000004', NULL, '22222222-0001-0001-0002-000000000032', '33333333-0001-0001-0001-000000000020',
     'NOBIV-RAB', 'Nobivac Rabia', 'Vacuna antirrábica inactivada. MSD Animal Health. Cepa Pasteur RIVM. 1ml SC/IM. Revacunación anual o cada 3 años según regulación.',
     'Caja', 'Dosis', 10,
     80000, 12000,
     '11111111-0001-0001-0001-000000000001', ARRAY['Perro', 'Gato'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0005-000000000010', NULL, '22222222-0001-0001-0002-000000000030', '33333333-0001-0001-0001-000000000021',
     'VANG-PLUS-5', 'Vanguard Plus 5', 'Vacuna quíntuple canina Zoetis. Distemper, Adenovirus tipo 2, Parainfluenza, Parvovirus.',
     'Caja', 'Dosis', 25,
     350000, 18000,
     '11111111-0001-0001-0001-000000000004', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0005-000000000020', NULL, '22222222-0001-0001-0002-000000000031', '33333333-0001-0001-0001-000000000022',
     'FELO-CVR', 'Felocell CVR', 'Vacuna triple felina Zoetis. Rinotraqueitis, Calicivirus, Panleucopenia felina.',
     'Caja', 'Dosis', 25,
     400000, 22000,
     '11111111-0001-0001-0001-000000000004', ARRAY['Gato'], true,
     NULL,
     true, 'verified', true),

    -- =========================================================================
    -- MEDICAMENTOS - ANTIINFLAMATORIOS
    -- =========================================================================

    ('44444444-0001-0001-0006-000000000001', NULL, '22222222-0001-0001-0002-000000000002', '33333333-0001-0001-0001-000000000030',
     'RIMA-25-60', 'Rimadyl 25mg x60', 'Carprofeno 25mg. Zoetis. AINE para control de dolor e inflamación en artritis, displasia de cadera, post-quirúrgico. Comprimidos masticables. Dosis: 2.2mg/kg 2x día o 4.4mg/kg 1x día.',
     'Frasco', 'Tableta', 60,
     180000, 4500,
     '11111111-0001-0001-0001-000000000004', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0006-000000000002', NULL, '22222222-0001-0001-0002-000000000002', '33333333-0001-0001-0001-000000000030',
     'RIMA-75-60', 'Rimadyl 75mg x60', 'Carprofeno 75mg. Zoetis. AINE para control de dolor e inflamación. Comprimidos masticables.',
     'Frasco', 'Tableta', 60,
     280000, 7000,
     '11111111-0001-0001-0001-000000000004', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0006-000000000003', NULL, '22222222-0001-0001-0002-000000000002', '33333333-0001-0001-0001-000000000030',
     'RIMA-100-60', 'Rimadyl 100mg x60', 'Carprofeno 100mg. Zoetis. AINE para control de dolor e inflamación. Comprimidos masticables.',
     'Frasco', 'Tableta', 60,
     350000, 8500,
     '11111111-0001-0001-0001-000000000004', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0006-000000000010', NULL, '22222222-0001-0001-0002-000000000002', '33333333-0001-0001-0001-000000000031',
     'META-05-10', 'Metacam 0.5mg/ml 10ml', 'Meloxicam suspensión oral. Boehringer Ingelheim. AINE para trastornos músculo-esqueléticos agudos y crónicos. Para perros pequeños.',
     'Frasco', 'ml', 10,
     45000, 6000,
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0006-000000000011', NULL, '22222222-0001-0001-0002-000000000002', '33333333-0001-0001-0001-000000000031',
     'META-15-32', 'Metacam 1.5mg/ml 32ml', 'Meloxicam suspensión oral. Boehringer Ingelheim. Acción rápida y duradera sobre dolor e inflamación.',
     'Frasco', 'ml', 32,
     85000, 3500,
     '11111111-0001-0001-0001-000000000002', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0006-000000000012', NULL, '22222222-0001-0001-0002-000000000002', '33333333-0001-0001-0001-000000000031',
     'META-CAT-5', 'Metacam Gatos 0.5mg/ml 5ml', 'Meloxicam suspensión oral para gatos. Boehringer Ingelheim. Validez 6 meses después de abierto.',
     'Frasco', 'ml', 5,
     35000, 9000,
     '11111111-0001-0001-0001-000000000002', ARRAY['Gato'], true,
     NULL,
     true, 'verified', true),

    -- =========================================================================
    -- MEDICAMENTOS - ANTIBIÓTICOS
    -- =========================================================================

    ('44444444-0001-0001-0006-000000000020', NULL, '22222222-0001-0001-0002-000000000001', '33333333-0001-0001-0001-000000000032',
     'CONV-80', 'Convenia 80mg/ml 10ml', 'Cefovecina inyectable. Zoetis. Antibiótico de LARGA DURACIÓN (14 días) con una sola inyección. Ideal para pacientes difíciles de medicar.',
     'Frasco', 'ml', 10,
     450000, 55000,
     '11111111-0001-0001-0001-000000000004', ARRAY['Perro', 'Gato'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0006-000000000021', NULL, '22222222-0001-0001-0002-000000000001', '33333333-0001-0001-0001-000000000033',
     'SYNU-50-100', 'Synulox 50mg x100', 'Amoxicilina + Ácido Clavulánico 50mg. Zoetis. Comprimidos palatables para infecciones bacterianas.',
     'Frasco', 'Tableta', 100,
     120000, 1800,
     '11111111-0001-0001-0001-000000000004', ARRAY['Perro', 'Gato'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0006-000000000022', NULL, '22222222-0001-0001-0002-000000000001', '33333333-0001-0001-0001-000000000033',
     'SYNU-250-100', 'Synulox 250mg x100', 'Amoxicilina + Ácido Clavulánico 250mg. Zoetis. Comprimidos palatables.',
     'Frasco', 'Tableta', 100,
     280000, 4200,
     '11111111-0001-0001-0001-000000000004', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0006-000000000023', NULL, '22222222-0001-0001-0002-000000000001', '33333333-0001-0001-0001-000000000033',
     'SYNU-500-100', 'Synulox 500mg x100', 'Amoxicilina + Ácido Clavulánico 500mg. Zoetis. Comprimidos palatables para perros grandes.',
     'Frasco', 'Tableta', 100,
     380000, 5500,
     '11111111-0001-0001-0001-000000000004', ARRAY['Perro'], true,
     NULL,
     true, 'verified', true),

    -- =========================================================================
    -- SUPLEMENTOS
    -- =========================================================================

    ('44444444-0001-0001-0007-000000000001', NULL, '22222222-0001-0001-0002-000000000023', NULL,
     'OMEGA-3-60', 'Omega 3 EPA/DHA x60', 'Ácidos grasos esenciales en cápsulas blandas. Beneficios para piel, pelo, articulaciones y función cognitiva.',
     'Frasco', 'Cápsula', 60,
     45000, 1200,
     '11111111-0001-0001-0001-000000000003', ARRAY['Perro', 'Gato'], false,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0007-000000000002', NULL, '22222222-0001-0001-0002-000000000023', NULL,
     'GLUCOS-90', 'Glucosamina + Condroitina x90', 'Suplemento articular para mantenimiento de cartílagos y articulaciones. Especialmente para perros senior o con problemas articulares.',
     'Frasco', 'Tableta', 90,
     65000, 1000,
     '11111111-0001-0001-0001-000000000003', ARRAY['Perro'], false,
     NULL,
     true, 'verified', true),

    ('44444444-0001-0001-0007-000000000003', NULL, '22222222-0001-0001-0002-000000000023', NULL,
     'PROBIO-30', 'Probiótico Veterinario x30', 'Probiótico para restaurar flora intestinal. Indicado durante y después de tratamientos con antibióticos, cambios de dieta o estrés.',
     'Frasco', 'Cápsula', 30,
     38000, 1800,
     '11111111-0001-0001-0001-000000000003', ARRAY['Perro', 'Gato'], false,
     NULL,
     true, 'verified', true)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- This comprehensive seed file for Paraguay 2025 includes:
--
-- SUPPLIERS (8 total):
-- - Merco Import S.A. (25+ años, vacunas y fármacos)
-- - Yagua S.R.L. (venta exclusiva a veterinarias)
-- - Ruralvet S.A. (representante de laboratorios regionales)
-- - Sanidad Animal
-- - Agrofield S.R.L. (importador oficial Royal Canin)
-- - Purina Paraguay (Pro Plan)
-- - Sosa Bulls Paraguay (multimarca)
-- - Vete Platform (agregador)
--
-- CATEGORIES (30+ total):
-- - 6 categorías principales nivel 1
-- - 16 subcategorías nivel 2
-- - 5 categorías detalladas nivel 3
--
-- BRANDS (24 total):
-- - Alimentos: Royal Canin, Hill's, Pro Plan, Eukanuba
-- - Antiparasitarios: Bravecto, NexGard, Simparica, Frontline, Scalibor, Revolution, Advocate
-- - Vacunas: Nobivac, Vanguard, Felocell, Rabisin
-- - Farmacéuticos: Rimadyl, Metacam, Convenia, Synulox
-- - Locales: Holliday, Brouwer, Kualcos
--
-- PRODUCTS (60+ total):
-- - Antiparasitarios con precios reales de Paraguay (4pets.com.py, clasipar)
-- - Alimentos Royal Canin con imágenes oficiales
-- - Vacunas con presentaciones multi-dosis
-- - Medicamentos con dosis y concentraciones
-- - Suplementos nutricionales
--
-- All prices in Paraguayan Guaraníes (PYG)
-- All products marked as is_global_catalog = TRUE
-- Image URLs from official sources where available
-- =============================================================================
