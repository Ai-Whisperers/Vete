-- =============================================================================
-- 92_SEED_SERVICES.SQL
-- =============================================================================
-- Creates service catalog for clinics.
-- =============================================================================

INSERT INTO services (tenant_id, code, name, category, base_price, duration_minutes, is_taxable, description) VALUES
    -- =========================================================================
    -- ADRIS CLINIC SERVICES
    -- =========================================================================

    -- Consultations
    ('adris', 'CONSULT-GEN', 'Consulta General', 'consultation', 150000, 30, TRUE, 'Consulta medica general'),
    ('adris', 'CONSULT-URG', 'Urgencia', 'consultation', 250000, 45, TRUE, 'Atencion de urgencia'),
    ('adris', 'CONSULT-SPEC', 'Consulta Especializada', 'consultation', 200000, 45, TRUE, 'Consulta con especialista'),

    -- Grooming
    ('adris', 'BATH-S', 'Bano Perro Pequeno', 'grooming', 50000, 45, TRUE, 'Bano completo para perros pequenos (hasta 10kg)'),
    ('adris', 'BATH-M', 'Bano Perro Mediano', 'grooming', 70000, 60, TRUE, 'Bano completo para perros medianos (10-25kg)'),
    ('adris', 'BATH-L', 'Bano Perro Grande', 'grooming', 90000, 75, TRUE, 'Bano completo para perros grandes (25kg+)'),
    ('adris', 'BATH-CAT', 'Bano Gato', 'grooming', 60000, 45, TRUE, 'Bano completo para gatos'),
    ('adris', 'NAIL-001', 'Corte de Unas', 'grooming', 25000, 15, TRUE, 'Corte de unas para perros y gatos'),
    ('adris', 'HAIRCUT-001', 'Corte de Pelo', 'grooming', 80000, 60, TRUE, 'Corte de pelo segun raza'),
    ('adris', 'GROOM-FULL', 'Estetica Completa', 'grooming', 120000, 90, TRUE, 'Bano, corte, unas y limpieza de oidos'),

    -- Treatments
    ('adris', 'DESPAR-INT', 'Desparasitacion Interna', 'treatment', 35000, 15, TRUE, 'Antiparasitario interno oral'),
    ('adris', 'DESPAR-EXT', 'Desparasitacion Externa', 'treatment', 45000, 10, TRUE, 'Pipeta antiparasitaria'),
    ('adris', 'CLEAN-EARS', 'Limpieza de Oidos', 'treatment', 30000, 20, TRUE, 'Limpieza profunda de oidos'),
    ('adris', 'CLEAN-GLANDS', 'Vaciado de Glandulas', 'treatment', 40000, 15, TRUE, 'Vaciado de glandulas anales'),
    ('adris', 'DENTAL-CLEAN', 'Limpieza Dental', 'treatment', 180000, 60, TRUE, 'Limpieza dental con ultrasonido'),

    -- Vaccines
    ('adris', 'VAC-RABIES', 'Vacuna Antirrabica', 'vaccination', 80000, 15, TRUE, 'Vacuna contra la rabia'),
    ('adris', 'VAC-SEXTUPLE', 'Vacuna Sextuple', 'vaccination', 120000, 15, TRUE, 'Vacuna sextuple canina (DHLPP)'),
    ('adris', 'VAC-TRIPLE', 'Triple Felina', 'vaccination', 100000, 15, TRUE, 'Vacuna triple para gatos'),
    ('adris', 'VAC-LEUK', 'Leucemia Felina', 'vaccination', 110000, 15, TRUE, 'Vacuna contra leucemia felina'),
    ('adris', 'VAC-BORDETELLA', 'Bordetella', 'vaccination', 75000, 15, TRUE, 'Vacuna contra tos de perrera'),

    -- Surgeries
    ('adris', 'SURG-NEUTER-M', 'Castracion Macho', 'surgery', 350000, 60, TRUE, 'Castracion de macho'),
    ('adris', 'SURG-SPAY-F', 'Esterilizacion Hembra', 'surgery', 450000, 90, TRUE, 'Esterilizacion de hembra (OVH)'),

    -- Diagnostics
    ('adris', 'XRAY-001', 'Radiografia', 'diagnostic', 150000, 30, TRUE, 'Radiografia simple'),
    ('adris', 'ECHO-001', 'Ecografia Abdominal', 'diagnostic', 200000, 45, TRUE, 'Ecografia abdominal completa'),
    ('adris', 'BLOOD-001', 'Hemograma Completo', 'diagnostic', 80000, 15, TRUE, 'Analisis de sangre completo'),

    -- Identification
    ('adris', 'CHIP-001', 'Microchip', 'identification', 120000, 15, TRUE, 'Colocacion de microchip con registro'),
    ('adris', 'QR-TAG', 'Placa QR', 'identification', 45000, 5, TRUE, 'Placa identificadora con codigo QR'),

    -- =========================================================================
    -- PETLIFE CLINIC SERVICES
    -- =========================================================================

    ('petlife', 'CONSULT-001', 'Consulta General', 'consultation', 100000, 30, TRUE, 'Consulta medica general'),
    ('petlife', 'BATH-ALL', 'Bano Completo', 'grooming', 55000, 60, TRUE, 'Servicio de bano para cualquier tamano'),
    ('petlife', 'VAC-RABIES', 'Vacuna Antirrabica', 'vaccination', 75000, 15, TRUE, 'Vacuna contra la rabia'),
    ('petlife', 'VAC-MULTI', 'Vacuna Multiple', 'vaccination', 95000, 15, TRUE, 'Vacuna multiple canina o felina')

ON CONFLICT (tenant_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- =============================================================================
-- SERVICES CREATED
-- =============================================================================
