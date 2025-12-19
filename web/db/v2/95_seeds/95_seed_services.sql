-- =============================================================================
-- 95_SEED_SERVICES.SQL
-- =============================================================================
-- Service catalog seed data for clinics.
-- All prices in Guaranies (PYG).
--
-- Dependencies: 10_core (tenants)
-- =============================================================================

-- =============================================================================
-- A. ADRIS CLINIC SERVICES
-- =============================================================================

INSERT INTO public.services (tenant_id, name, category, base_price, duration_minutes, description, is_active, display_order) VALUES
    -- Consultations
    ('adris', 'Consulta General', 'consultation', 150000, 30, 'Consulta médica general con evaluación completa', TRUE, 1),
    ('adris', 'Consulta de Urgencia', 'consultation', 250000, 45, 'Atención de urgencia fuera de horario', TRUE, 2),
    ('adris', 'Consulta Especializada', 'consultation', 200000, 45, 'Consulta con especialista (dermatología, cardiología, etc.)', TRUE, 3),
    ('adris', 'Control Post-Operatorio', 'consultation', 80000, 20, 'Revisión después de cirugía', TRUE, 4),
    ('adris', 'Segunda Opinión', 'consultation', 180000, 45, 'Evaluación de diagnóstico previo', TRUE, 5),

    -- Grooming
    ('adris', 'Baño Perro Pequeño', 'grooming', 50000, 45, 'Baño completo para perros hasta 10kg', TRUE, 10),
    ('adris', 'Baño Perro Mediano', 'grooming', 70000, 60, 'Baño completo para perros 10-25kg', TRUE, 11),
    ('adris', 'Baño Perro Grande', 'grooming', 90000, 75, 'Baño completo para perros 25kg+', TRUE, 12),
    ('adris', 'Baño Gato', 'grooming', 60000, 45, 'Baño completo para gatos', TRUE, 13),
    ('adris', 'Corte de Uñas', 'grooming', 25000, 15, 'Corte y limado de uñas', TRUE, 14),
    ('adris', 'Corte de Pelo', 'grooming', 80000, 60, 'Corte según raza o preferencia', TRUE, 15),
    ('adris', 'Estética Completa', 'grooming', 120000, 90, 'Baño, corte, uñas y limpieza de oídos', TRUE, 16),

    -- Treatments
    ('adris', 'Desparasitación Interna', 'treatment', 35000, 15, 'Antiparasitario interno oral', TRUE, 20),
    ('adris', 'Desparasitación Externa', 'treatment', 45000, 10, 'Pipeta o spray antiparasitario', TRUE, 21),
    ('adris', 'Limpieza de Oídos', 'treatment', 30000, 20, 'Limpieza profunda del canal auditivo', TRUE, 22),
    ('adris', 'Vaciado de Glándulas', 'treatment', 40000, 15, 'Vaciado de glándulas anales', TRUE, 23),
    ('adris', 'Limpieza Dental', 'treatment', 180000, 60, 'Limpieza dental con ultrasonido bajo anestesia', TRUE, 24),
    ('adris', 'Aplicación de Suero', 'treatment', 60000, 30, 'Fluidoterapia subcutánea o intravenosa', TRUE, 25),
    ('adris', 'Curación de Heridas', 'treatment', 50000, 30, 'Limpieza y vendaje de heridas', TRUE, 26),

    -- Vaccinations
    ('adris', 'Vacuna Antirrábica', 'vaccination', 80000, 15, 'Vacuna contra la rabia (obligatoria)', TRUE, 30),
    ('adris', 'Vacuna Séxtuple', 'vaccination', 120000, 15, 'Vacuna séxtuple canina (DHLPP)', TRUE, 31),
    ('adris', 'Vacuna Triple Felina', 'vaccination', 100000, 15, 'Vacuna triple para gatos', TRUE, 32),
    ('adris', 'Vacuna Leucemia Felina', 'vaccination', 110000, 15, 'Vacuna contra leucemia felina (FeLV)', TRUE, 33),
    ('adris', 'Vacuna Bordetella', 'vaccination', 75000, 15, 'Vacuna contra tos de perrera', TRUE, 34),
    ('adris', 'Vacuna Leptospirosis', 'vaccination', 85000, 15, 'Vacuna contra leptospirosis', TRUE, 35),

    -- Surgeries
    ('adris', 'Castración Macho Pequeño', 'surgery', 300000, 45, 'Castración para machos hasta 10kg', TRUE, 40),
    ('adris', 'Castración Macho Mediano', 'surgery', 350000, 60, 'Castración para machos 10-25kg', TRUE, 41),
    ('adris', 'Castración Macho Grande', 'surgery', 400000, 75, 'Castración para machos 25kg+', TRUE, 42),
    ('adris', 'Esterilización Hembra Pequeña', 'surgery', 400000, 75, 'OVH para hembras hasta 10kg', TRUE, 43),
    ('adris', 'Esterilización Hembra Mediana', 'surgery', 450000, 90, 'OVH para hembras 10-25kg', TRUE, 44),
    ('adris', 'Esterilización Hembra Grande', 'surgery', 500000, 120, 'OVH para hembras 25kg+', TRUE, 45),
    ('adris', 'Cirugía de Tejidos Blandos', 'surgery', 600000, 90, 'Cirugías menores de tejidos blandos', TRUE, 46),

    -- Diagnostics
    ('adris', 'Radiografía Simple', 'diagnostic', 150000, 30, 'Una placa radiográfica', TRUE, 50),
    ('adris', 'Radiografía Contrastada', 'diagnostic', 250000, 60, 'Radiografía con medio de contraste', TRUE, 51),
    ('adris', 'Ecografía Abdominal', 'diagnostic', 200000, 45, 'Ecografía abdominal completa', TRUE, 52),
    ('adris', 'Ecocardiograma', 'diagnostic', 300000, 45, 'Ecografía cardíaca', TRUE, 53),
    ('adris', 'Hemograma Completo', 'diagnostic', 80000, 15, 'Análisis de sangre completo', TRUE, 54),
    ('adris', 'Perfil Bioquímico', 'diagnostic', 120000, 15, 'Panel bioquímico sanguíneo', TRUE, 55),
    ('adris', 'Urianálisis', 'diagnostic', 60000, 15, 'Análisis de orina', TRUE, 56),
    ('adris', 'Raspado de Piel', 'diagnostic', 50000, 20, 'Raspado cutáneo para diagnóstico', TRUE, 57),

    -- Identification
    ('adris', 'Colocación de Microchip', 'identification', 120000, 15, 'Microchip con registro internacional', TRUE, 60),
    ('adris', 'Placa QR Vete', 'identification', 45000, 5, 'Placa identificadora con código QR', TRUE, 61),
    ('adris', 'Certificado de Salud', 'identification', 100000, 30, 'Certificado oficial de salud', TRUE, 62),

    -- Hospitalization
    ('adris', 'Internación Día', 'hospitalization', 150000, 1440, 'Internación por 24 horas con monitoreo', TRUE, 70),
    ('adris', 'Internación UCI', 'hospitalization', 250000, 1440, 'Unidad de cuidados intensivos 24h', TRUE, 71)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- B. PETLIFE CLINIC SERVICES
-- =============================================================================

INSERT INTO public.services (tenant_id, name, category, base_price, duration_minutes, description, is_active, display_order) VALUES
    -- Basic Services
    ('petlife', 'Consulta General', 'consultation', 100000, 30, 'Consulta médica general', TRUE, 1),
    ('petlife', 'Urgencia', 'consultation', 180000, 45, 'Atención de urgencia', TRUE, 2),

    -- Grooming
    ('petlife', 'Baño Completo', 'grooming', 55000, 60, 'Baño para cualquier tamaño', TRUE, 10),
    ('petlife', 'Corte de Uñas', 'grooming', 20000, 15, 'Corte de uñas', TRUE, 11),

    -- Vaccines
    ('petlife', 'Vacuna Antirrábica', 'vaccination', 75000, 15, 'Vacuna contra la rabia', TRUE, 30),
    ('petlife', 'Vacuna Múltiple', 'vaccination', 95000, 15, 'Vacuna múltiple canina o felina', TRUE, 31),

    -- Surgery
    ('petlife', 'Castración', 'surgery', 280000, 60, 'Castración de macho', TRUE, 40),
    ('petlife', 'Esterilización', 'surgery', 380000, 90, 'Esterilización de hembra', TRUE, 41)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- SERVICES SEED COMPLETE
-- =============================================================================
