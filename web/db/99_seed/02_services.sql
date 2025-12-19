-- =============================================================================
-- 02_SERVICES.SQL
-- =============================================================================
-- Service catalog seed data for clinics.
-- All prices in Guaranies (PYG).
--
-- Dependencies: 10_core (tenants), 40_scheduling (services table)
-- =============================================================================

-- =============================================================================
-- ADRIS CLINIC SERVICES
-- =============================================================================

INSERT INTO public.services (tenant_id, name, category, base_price, duration_minutes, description, is_active, display_order, color, available_days, available_start_time, available_end_time) VALUES
    -- Consultations
    ('adris', 'Consulta General', 'consultation', 150000, 30, 'Consulta médica general con evaluación completa', TRUE, 1, '#4CAF50', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Consulta de Urgencia', 'consultation', 250000, 45, 'Atención de urgencia fuera de horario', TRUE, 2, '#F44336', ARRAY[1,2,3,4,5,6,7], '00:00', '23:59'),
    ('adris', 'Consulta Especializada', 'consultation', 200000, 45, 'Consulta con especialista (dermatología, cardiología, etc.)', TRUE, 3, '#9C27B0', ARRAY[1,3,5], '09:00', '17:00'),
    ('adris', 'Control Post-Operatorio', 'consultation', 80000, 20, 'Revisión después de cirugía', TRUE, 4, '#8BC34A', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Segunda Opinión', 'consultation', 180000, 45, 'Evaluación de diagnóstico previo', TRUE, 5, '#00BCD4', ARRAY[1,2,3,4,5], '09:00', '17:00'),

    -- Grooming
    ('adris', 'Baño Perro Pequeño', 'grooming', 50000, 45, 'Baño completo para perros hasta 10kg', TRUE, 10, '#2196F3', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Baño Perro Mediano', 'grooming', 70000, 60, 'Baño completo para perros 10-25kg', TRUE, 11, '#2196F3', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Baño Perro Grande', 'grooming', 90000, 75, 'Baño completo para perros 25kg+', TRUE, 12, '#2196F3', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Baño Gato', 'grooming', 60000, 45, 'Baño completo para gatos', TRUE, 13, '#2196F3', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Corte de Uñas', 'grooming', 25000, 15, 'Corte y limado de uñas', TRUE, 14, '#03A9F4', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Corte de Pelo', 'grooming', 80000, 60, 'Corte según raza o preferencia', TRUE, 15, '#2196F3', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Estética Completa', 'grooming', 120000, 90, 'Baño, corte, uñas y limpieza de oídos', TRUE, 16, '#1565C0', ARRAY[1,2,3,4,5,6], '08:00', '16:00'),

    -- Treatments
    ('adris', 'Desparasitación Interna', 'treatment', 35000, 15, 'Antiparasitario interno oral', TRUE, 20, '#FF9800', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Desparasitación Externa', 'treatment', 45000, 10, 'Pipeta o spray antiparasitario', TRUE, 21, '#FF9800', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Limpieza de Oídos', 'treatment', 30000, 20, 'Limpieza profunda del canal auditivo', TRUE, 22, '#FFC107', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Vaciado de Glándulas', 'treatment', 40000, 15, 'Vaciado de glándulas anales', TRUE, 23, '#FFC107', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Limpieza Dental', 'treatment', 180000, 60, 'Limpieza dental con ultrasonido bajo anestesia', TRUE, 24, '#E91E63', ARRAY[2,4], '09:00', '14:00'),
    ('adris', 'Aplicación de Suero', 'treatment', 60000, 30, 'Fluidoterapia subcutánea o intravenosa', TRUE, 25, '#9C27B0', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Curación de Heridas', 'treatment', 50000, 30, 'Limpieza y vendaje de heridas', TRUE, 26, '#E91E63', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),

    -- Vaccinations
    ('adris', 'Vacuna Antirrábica', 'vaccination', 80000, 15, 'Vacuna contra la rabia (obligatoria anual)', TRUE, 30, '#4CAF50', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Vacuna Séxtuple Canina', 'vaccination', 120000, 15, 'Vacuna séxtuple canina (DHLPP)', TRUE, 31, '#4CAF50', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Vacuna Triple Felina', 'vaccination', 100000, 15, 'Vacuna triple para gatos', TRUE, 32, '#4CAF50', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Vacuna Leucemia Felina', 'vaccination', 110000, 15, 'Vacuna contra leucemia felina (FeLV)', TRUE, 33, '#4CAF50', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Vacuna Bordetella', 'vaccination', 75000, 15, 'Vacuna contra tos de perrera', TRUE, 34, '#8BC34A', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Vacuna Leptospirosis', 'vaccination', 85000, 15, 'Vacuna contra leptospirosis', TRUE, 35, '#8BC34A', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),

    -- Surgeries
    ('adris', 'Castración Macho Pequeño', 'surgery', 300000, 45, 'Castración para machos hasta 10kg', TRUE, 40, '#673AB7', ARRAY[2,4], '08:00', '12:00'),
    ('adris', 'Castración Macho Mediano', 'surgery', 350000, 60, 'Castración para machos 10-25kg', TRUE, 41, '#673AB7', ARRAY[2,4], '08:00', '12:00'),
    ('adris', 'Castración Macho Grande', 'surgery', 400000, 75, 'Castración para machos 25kg+', TRUE, 42, '#673AB7', ARRAY[2,4], '08:00', '12:00'),
    ('adris', 'Esterilización Hembra Pequeña', 'surgery', 400000, 75, 'OVH para hembras hasta 10kg', TRUE, 43, '#9C27B0', ARRAY[2,4], '08:00', '12:00'),
    ('adris', 'Esterilización Hembra Mediana', 'surgery', 450000, 90, 'OVH para hembras 10-25kg', TRUE, 44, '#9C27B0', ARRAY[2,4], '08:00', '12:00'),
    ('adris', 'Esterilización Hembra Grande', 'surgery', 500000, 120, 'OVH para hembras 25kg+', TRUE, 45, '#9C27B0', ARRAY[2,4], '08:00', '12:00'),
    ('adris', 'Cirugía de Tejidos Blandos', 'surgery', 600000, 90, 'Cirugías menores de tejidos blandos', TRUE, 46, '#7B1FA2', ARRAY[2,4], '08:00', '14:00'),

    -- Diagnostics
    ('adris', 'Radiografía Simple', 'diagnostic', 150000, 30, 'Una placa radiográfica', TRUE, 50, '#00ACC1', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Radiografía Contrastada', 'diagnostic', 250000, 60, 'Radiografía con medio de contraste', TRUE, 51, '#00ACC1', ARRAY[1,2,3,4,5], '09:00', '16:00'),
    ('adris', 'Ecografía Abdominal', 'diagnostic', 200000, 45, 'Ecografía abdominal completa', TRUE, 52, '#0097A7', ARRAY[1,3,5], '09:00', '17:00'),
    ('adris', 'Ecocardiograma', 'diagnostic', 300000, 45, 'Ecografía cardíaca', TRUE, 53, '#00838F', ARRAY[1,3,5], '09:00', '17:00'),
    ('adris', 'Hemograma Completo', 'diagnostic', 80000, 15, 'Análisis de sangre completo', TRUE, 54, '#26A69A', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Perfil Bioquímico', 'diagnostic', 120000, 15, 'Panel bioquímico sanguíneo', TRUE, 55, '#26A69A', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Urianálisis', 'diagnostic', 60000, 15, 'Análisis de orina', TRUE, 56, '#26A69A', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),
    ('adris', 'Raspado de Piel', 'diagnostic', 50000, 20, 'Raspado cutáneo para diagnóstico', TRUE, 57, '#26A69A', ARRAY[1,2,3,4,5,6], '08:00', '17:00'),

    -- Identification
    ('adris', 'Colocación de Microchip', 'identification', 120000, 15, 'Microchip con registro internacional', TRUE, 60, '#607D8B', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Placa QR Vete', 'identification', 45000, 5, 'Placa identificadora con código QR', TRUE, 61, '#607D8B', ARRAY[1,2,3,4,5,6], '08:00', '18:00'),
    ('adris', 'Certificado de Salud', 'identification', 100000, 30, 'Certificado oficial de salud para viaje', TRUE, 62, '#546E7A', ARRAY[1,2,3,4,5], '08:00', '17:00'),

    -- Hospitalization
    ('adris', 'Internación Día', 'hospitalization', 150000, 1440, 'Internación por 24 horas con monitoreo', TRUE, 70, '#795548', ARRAY[1,2,3,4,5,6,7], '00:00', '23:59'),
    ('adris', 'Internación UCI', 'hospitalization', 250000, 1440, 'Unidad de cuidados intensivos 24h', TRUE, 71, '#5D4037', ARRAY[1,2,3,4,5,6,7], '00:00', '23:59')

ON CONFLICT (tenant_id, name) DO UPDATE SET
    base_price = EXCLUDED.base_price,
    duration_minutes = EXCLUDED.duration_minutes,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order,
    color = EXCLUDED.color;

-- =============================================================================
-- PETLIFE CLINIC SERVICES
-- =============================================================================

INSERT INTO public.services (tenant_id, name, category, base_price, duration_minutes, description, is_active, display_order, color, available_days, available_start_time, available_end_time) VALUES
    -- Consultations
    ('petlife', 'Consulta General', 'consultation', 100000, 30, 'Consulta médica general', TRUE, 1, '#4CAF50', ARRAY[1,2,3,4,5], '09:00', '18:00'),
    ('petlife', 'Urgencia', 'consultation', 180000, 45, 'Atención de urgencia', TRUE, 2, '#F44336', ARRAY[1,2,3,4,5,6], '08:00', '20:00'),
    ('petlife', 'Control', 'consultation', 60000, 20, 'Consulta de seguimiento', TRUE, 3, '#8BC34A', ARRAY[1,2,3,4,5], '09:00', '18:00'),

    -- Grooming
    ('petlife', 'Baño Completo', 'grooming', 55000, 60, 'Baño para cualquier tamaño', TRUE, 10, '#2196F3', ARRAY[1,2,3,4,5,6], '09:00', '17:00'),
    ('petlife', 'Corte de Uñas', 'grooming', 20000, 15, 'Corte de uñas', TRUE, 11, '#03A9F4', ARRAY[1,2,3,4,5,6], '09:00', '18:00'),
    ('petlife', 'Estética Completa', 'grooming', 90000, 90, 'Baño, corte y uñas', TRUE, 12, '#1565C0', ARRAY[1,2,3,4,5,6], '09:00', '16:00'),

    -- Vaccines
    ('petlife', 'Vacuna Antirrábica', 'vaccination', 75000, 15, 'Vacuna contra la rabia', TRUE, 30, '#4CAF50', ARRAY[1,2,3,4,5], '09:00', '18:00'),
    ('petlife', 'Vacuna Múltiple Canina', 'vaccination', 95000, 15, 'Vacuna múltiple canina', TRUE, 31, '#4CAF50', ARRAY[1,2,3,4,5], '09:00', '18:00'),
    ('petlife', 'Vacuna Múltiple Felina', 'vaccination', 95000, 15, 'Vacuna múltiple para gatos', TRUE, 32, '#4CAF50', ARRAY[1,2,3,4,5], '09:00', '18:00'),

    -- Surgery
    ('petlife', 'Castración Macho', 'surgery', 280000, 60, 'Castración de macho', TRUE, 40, '#673AB7', ARRAY[3], '09:00', '12:00'),
    ('petlife', 'Esterilización Hembra', 'surgery', 380000, 90, 'Esterilización de hembra', TRUE, 41, '#9C27B0', ARRAY[3], '09:00', '12:00'),

    -- Diagnostics
    ('petlife', 'Análisis de Sangre', 'diagnostic', 70000, 20, 'Hemograma básico', TRUE, 50, '#00ACC1', ARRAY[1,2,3,4,5], '09:00', '17:00'),
    ('petlife', 'Radiografía', 'diagnostic', 120000, 30, 'Placa radiográfica', TRUE, 51, '#0097A7', ARRAY[1,2,3,4,5], '09:00', '17:00')

ON CONFLICT (tenant_id, name) DO UPDATE SET
    base_price = EXCLUDED.base_price,
    duration_minutes = EXCLUDED.duration_minutes,
    description = EXCLUDED.description;

-- =============================================================================
-- PAYMENT METHODS
-- =============================================================================

INSERT INTO public.payment_methods (tenant_id, name, type, is_default, display_order, instructions) VALUES
    ('adris', 'Efectivo', 'cash', TRUE, 1, NULL),
    ('adris', 'Tarjeta de Débito', 'card', FALSE, 2, 'Aceptamos Visa, Mastercard, Cabal'),
    ('adris', 'Tarjeta de Crédito', 'card', FALSE, 3, 'Aceptamos Visa, Mastercard, Cabal. Hasta 12 cuotas'),
    ('adris', 'Transferencia Bancaria', 'transfer', FALSE, 4, 'Banco Continental: 123456789'),
    ('adris', 'QR - Billetera Digital', 'digital', FALSE, 5, 'Billetera Personal, Tigo Money, Wally'),
    ('petlife', 'Efectivo', 'cash', TRUE, 1, NULL),
    ('petlife', 'Tarjeta', 'card', FALSE, 2, 'Aceptamos tarjetas'),
    ('petlife', 'Transferencia', 'transfer', FALSE, 3, NULL)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- KENNELS
-- =============================================================================

INSERT INTO public.kennels (tenant_id, name, code, kennel_type, daily_rate, current_status, description) VALUES
    ('adris', 'Jaula Pequeña 1', 'K01', 'small', 60000, 'available', 'Para mascotas hasta 5kg'),
    ('adris', 'Jaula Pequeña 2', 'K02', 'small', 60000, 'available', 'Para mascotas hasta 5kg'),
    ('adris', 'Jaula Mediana 1', 'K03', 'standard', 80000, 'available', 'Para mascotas 5-15kg'),
    ('adris', 'Jaula Mediana 2', 'K04', 'standard', 80000, 'available', 'Para mascotas 5-15kg'),
    ('adris', 'Jaula Mediana 3', 'K05', 'standard', 80000, 'available', 'Para mascotas 5-15kg'),
    ('adris', 'Jaula Grande 1', 'K06', 'large', 100000, 'available', 'Para mascotas 15-30kg'),
    ('adris', 'Jaula Grande 2', 'K07', 'large', 100000, 'available', 'Para mascotas 15-30kg'),
    ('adris', 'Jaula Extra Grande', 'K08', 'xlarge', 120000, 'available', 'Para mascotas >30kg'),
    ('adris', 'UCI 1', 'UCI1', 'icu', 150000, 'available', 'Unidad de cuidados intensivos'),
    ('adris', 'UCI 2', 'UCI2', 'icu', 150000, 'available', 'Unidad de cuidados intensivos'),
    ('adris', 'Aislamiento 1', 'ISO1', 'isolation', 120000, 'available', 'Para pacientes infecciosos'),
    ('adris', 'Aislamiento 2', 'ISO2', 'isolation', 120000, 'available', 'Para pacientes infecciosos'),
    ('petlife', 'Jaula A', 'JA', 'standard', 70000, 'available', NULL),
    ('petlife', 'Jaula B', 'JB', 'standard', 70000, 'available', NULL),
    ('petlife', 'Jaula C', 'JC', 'standard', 70000, 'available', NULL),
    ('petlife', 'Jaula Grande', 'JG', 'large', 90000, 'available', NULL)
ON CONFLICT DO NOTHING;


