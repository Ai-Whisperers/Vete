-- =============================================================================
-- 97_SEED_DEMO_DATA.SQL
-- =============================================================================
-- Demo data for testing: pets, appointments, vaccines, etc.
-- This file creates sample data for the demo accounts.
--
-- Demo Accounts (created via auth trigger):
--   owner@demo.com / password123  → adris owner (Firulais, Mishi, Luna)
--   owner2@demo.com / password123 → adris owner (Thor, Max)
--   vet@demo.com / password123    → adris vet
--   admin@demo.com / password123  → adris admin
--   vet@petlife.com / password123 → petlife vet
--   admin@petlife.com / password123 → petlife admin
--
-- Dependencies: All tables, demo users must exist in auth.users
-- =============================================================================

-- =============================================================================
-- A. REFERENCE DATA: DIAGNOSIS CODES
-- =============================================================================

INSERT INTO public.diagnosis_codes (code, term, standard, category) VALUES
    ('OTIT001', 'Otitis Externa', 'venom', 'dermatology'),
    ('PYOD001', 'Pyoderma', 'venom', 'dermatology'),
    ('GAST001', 'Gastroenteritis Aguda', 'venom', 'gastroenterology'),
    ('FRAC001', 'Fractura de Miembro', 'venom', 'orthopedics'),
    ('CONJ001', 'Conjuntivitis', 'venom', 'ophthalmology'),
    ('PERI001', 'Enfermedad Periodontal', 'venom', 'dentistry'),
    ('DIAB001', 'Diabetes Mellitus', 'venom', 'endocrinology'),
    ('CKID001', 'Enfermedad Renal Crónica', 'venom', 'nephrology'),
    ('HEAR001', 'Dirofilariasis', 'venom', 'parasitology'),
    ('OBES001', 'Obesidad', 'venom', 'nutrition'),
    ('ALRG001', 'Dermatitis Alérgica', 'venom', 'dermatology'),
    ('ARTR001', 'Artritis', 'venom', 'orthopedics'),
    ('CARD001', 'Insuficiencia Cardíaca', 'venom', 'cardiology'),
    ('CIST001', 'Cistitis', 'venom', 'urology'),
    ('PARO001', 'Parvovirus Canino', 'venom', 'infectious')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- B. REFERENCE DATA: DRUG DOSAGES
-- =============================================================================

INSERT INTO public.drug_dosages (name, species, min_dose_mg_kg, max_dose_mg_kg, concentration_mg_ml, route, frequency) VALUES
    ('Amoxicilina', 'dog', 10, 20, 50, 'PO', 'BID'),
    ('Amoxicilina', 'cat', 10, 15, 50, 'PO', 'BID'),
    ('Meloxicam', 'dog', 0.1, 0.2, 1.5, 'PO', 'SID'),
    ('Meloxicam', 'cat', 0.05, 0.1, 0.5, 'PO', 'SID'),
    ('Tramadol', 'dog', 2, 5, 50, 'PO', 'BID-TID'),
    ('Tramadol', 'cat', 1, 2, 50, 'PO', 'BID'),
    ('Cefalexina', 'dog', 22, 30, 250, 'PO', 'BID'),
    ('Cefalexina', 'cat', 15, 25, 250, 'PO', 'BID'),
    ('Metronidazol', 'dog', 10, 15, 250, 'PO', 'BID'),
    ('Metronidazol', 'cat', 10, 15, 250, 'PO', 'BID'),
    ('Enrofloxacina', 'dog', 5, 20, 50, 'PO', 'SID'),
    ('Enrofloxacina', 'cat', 5, 10, 50, 'PO', 'SID'),
    ('Prednisolona', 'dog', 0.5, 2, 5, 'PO', 'SID-BID'),
    ('Prednisolona', 'cat', 1, 2, 5, 'PO', 'SID-BID'),
    ('Omeprazol', 'dog', 0.5, 1, 20, 'PO', 'SID'),
    ('Omeprazol', 'cat', 0.5, 1, 20, 'PO', 'SID')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- C. REFERENCE DATA: GROWTH STANDARDS (Medium Dog)
-- =============================================================================

INSERT INTO public.growth_standards (breed, gender, age_weeks, weight_kg, percentile) VALUES
    -- Medium Dog Male
    ('medium_dog', 'male', 8, 3.5, 'P50'),
    ('medium_dog', 'male', 12, 6.0, 'P50'),
    ('medium_dog', 'male', 16, 9.0, 'P50'),
    ('medium_dog', 'male', 24, 14.0, 'P50'),
    ('medium_dog', 'male', 36, 18.0, 'P50'),
    ('medium_dog', 'male', 52, 22.0, 'P50'),
    -- Medium Dog Female
    ('medium_dog', 'female', 8, 3.0, 'P50'),
    ('medium_dog', 'female', 12, 5.0, 'P50'),
    ('medium_dog', 'female', 16, 7.5, 'P50'),
    ('medium_dog', 'female', 24, 12.0, 'P50'),
    ('medium_dog', 'female', 36, 15.0, 'P50'),
    ('medium_dog', 'female', 52, 18.0, 'P50')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- D. LAB TEST CATALOG
-- =============================================================================

INSERT INTO public.lab_test_catalog (tenant_id, code, name, category, base_price, turnaround_days) VALUES
    (NULL, 'CBC', 'Hemograma Completo', 'hematology', 80000, 1),
    (NULL, 'CHEM10', 'Perfil Bioquímico 10', 'chemistry', 120000, 1),
    (NULL, 'CHEM17', 'Perfil Bioquímico 17', 'chemistry', 180000, 1),
    (NULL, 'UA', 'Urianálisis Completo', 'urinalysis', 60000, 1),
    (NULL, 'T4', 'T4 Total', 'endocrinology', 95000, 2),
    (NULL, 'TSH', 'TSH Canino', 'endocrinology', 110000, 2),
    (NULL, 'CORT', 'Cortisol', 'endocrinology', 120000, 2),
    (NULL, 'FELV', 'FeLV Antígeno', 'serology', 75000, 1),
    (NULL, 'FIV', 'FIV Anticuerpos', 'serology', 75000, 1),
    (NULL, 'HW', 'Dirofilaria Antígeno', 'parasitology', 65000, 1),
    (NULL, 'FECAL', 'Coproparasitológico', 'parasitology', 45000, 1),
    (NULL, 'LIPID', 'Perfil Lipídico', 'chemistry', 90000, 1),
    (NULL, 'COAG', 'Perfil de Coagulación', 'coagulation', 100000, 1),
    (NULL, 'PANC', 'Lipasa Pancreática', 'chemistry', 85000, 2),
    (NULL, 'CITO', 'Citología', 'cytology', 70000, 2)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- E. PAYMENT METHODS
-- =============================================================================

INSERT INTO public.payment_methods (tenant_id, name, type, is_default, display_order) VALUES
    ('adris', 'Efectivo', 'cash', TRUE, 1),
    ('adris', 'Tarjeta de Débito', 'card', FALSE, 2),
    ('adris', 'Tarjeta de Crédito', 'card', FALSE, 3),
    ('adris', 'Transferencia Bancaria', 'transfer', FALSE, 4),
    ('adris', 'QR - Billetera Digital', 'transfer', FALSE, 5),
    ('petlife', 'Efectivo', 'cash', TRUE, 1),
    ('petlife', 'Tarjeta', 'card', FALSE, 2),
    ('petlife', 'Transferencia', 'transfer', FALSE, 3)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- F. KENNELS
-- =============================================================================

INSERT INTO public.kennels (tenant_id, name, code, kennel_type, daily_rate, current_status) VALUES
    ('adris', 'Jaula 1', 'K01', 'standard', 80000, 'available'),
    ('adris', 'Jaula 2', 'K02', 'standard', 80000, 'available'),
    ('adris', 'Jaula 3', 'K03', 'standard', 80000, 'available'),
    ('adris', 'Jaula Grande 1', 'K04', 'large', 100000, 'available'),
    ('adris', 'Jaula Grande 2', 'K05', 'large', 100000, 'available'),
    ('adris', 'UCI 1', 'UCI1', 'icu', 150000, 'available'),
    ('adris', 'UCI 2', 'UCI2', 'icu', 150000, 'available'),
    ('adris', 'Aislamiento', 'ISO1', 'isolation', 120000, 'available'),
    ('petlife', 'Jaula A', 'JA', 'standard', 70000, 'available'),
    ('petlife', 'Jaula B', 'JB', 'standard', 70000, 'available'),
    ('petlife', 'Jaula Grande', 'JG', 'large', 90000, 'available')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- G. MESSAGE TEMPLATES
-- =============================================================================

INSERT INTO public.message_templates (tenant_id, code, name, category, subject, content, channels) VALUES
    (NULL, 'APPT_CONFIRM', 'Confirmación de Cita', 'appointment', 'Cita Confirmada - {{clinic_name}}',
     'Hola {{owner_name}}, tu cita para {{pet_name}} ha sido confirmada para el {{date}} a las {{time}}. ¡Te esperamos!',
     ARRAY['email', 'whatsapp']),
    (NULL, 'APPT_REMINDER', 'Recordatorio de Cita', 'reminder', 'Recordatorio: Cita mañana - {{clinic_name}}',
     'Hola {{owner_name}}, te recordamos que tienes cita con {{pet_name}} mañana {{date}} a las {{time}}. Para cancelar, responde a este mensaje.',
     ARRAY['email', 'whatsapp', 'sms']),
    (NULL, 'VACCINE_DUE', 'Vacuna Próxima', 'reminder', 'Vacuna pendiente para {{pet_name}}',
     'Hola {{owner_name}}, la vacuna {{vaccine_name}} de {{pet_name}} vence el {{due_date}}. Agenda tu cita en {{booking_url}}',
     ARRAY['email', 'whatsapp']),
    (NULL, 'VACCINE_OVERDUE', 'Vacuna Vencida', 'reminder', '¡Atención! Vacuna vencida - {{pet_name}}',
     'Hola {{owner_name}}, la vacuna {{vaccine_name}} de {{pet_name}} está vencida desde el {{due_date}}. Es importante vacunar cuanto antes.',
     ARRAY['email', 'whatsapp', 'sms']),
    (NULL, 'INVOICE_READY', 'Factura Lista', 'transactional', 'Tu factura #{{invoice_number}}',
     'Hola {{owner_name}}, tu factura #{{invoice_number}} por Gs. {{total}} está lista. Puedes verla en: {{invoice_url}}',
     ARRAY['email']),
    (NULL, 'WELCOME', 'Bienvenida', 'transactional', '¡Bienvenido a {{clinic_name}}!',
     'Hola {{owner_name}}, gracias por registrar a {{pet_name}} en {{clinic_name}}. Estamos aquí para cuidar de tu mascota.',
     ARRAY['email']),
    (NULL, 'LAB_RESULTS', 'Resultados de Laboratorio', 'transactional', 'Resultados listos para {{pet_name}}',
     'Hola {{owner_name}}, los resultados de laboratorio de {{pet_name}} ya están disponibles. Puedes verlos en tu portal o consultar con nosotros.',
     ARRAY['email', 'whatsapp'])
ON CONFLICT DO NOTHING;

-- =============================================================================
-- H. CONSENT TEMPLATES
-- =============================================================================

INSERT INTO public.consent_templates (tenant_id, code, name, category, title, content_html, requires_witness, validity_days) VALUES
    (NULL, 'SURG_GENERAL', 'Consentimiento Quirúrgico', 'surgery', 'Consentimiento Informado para Procedimiento Quirúrgico',
     '<h2>Consentimiento Quirúrgico</h2><p>Yo, <strong>{{owner_name}}</strong>, propietario/a de <strong>{{pet_name}}</strong>, autorizo al equipo veterinario de <strong>{{clinic_name}}</strong> a realizar el procedimiento: <strong>{{procedure_name}}</strong>.</p><p>He sido informado/a de los riesgos, beneficios y alternativas del procedimiento. Comprendo que la anestesia conlleva riesgos inherentes.</p><p>Autorizo cualquier procedimiento adicional que el veterinario considere necesario durante la cirugía.</p>',
     FALSE, 1),
    (NULL, 'ANEST', 'Consentimiento Anestésico', 'anesthesia', 'Consentimiento para Anestesia',
     '<h2>Consentimiento Anestésico</h2><p>Autorizo la administración de anestesia a <strong>{{pet_name}}</strong>. He sido informado/a de los riesgos de la anestesia general, incluyendo reacciones adversas y, en casos excepcionales, muerte.</p><p>Confirmo que mi mascota ha cumplido con el ayuno pre-quirúrgico indicado.</p>',
     FALSE, 1),
    (NULL, 'EUTH', 'Consentimiento Eutanasia', 'euthanasia', 'Consentimiento para Eutanasia Humanitaria',
     '<h2>Consentimiento para Eutanasia</h2><p>Yo, <strong>{{owner_name}}</strong>, solicito y autorizo la eutanasia humanitaria de mi mascota <strong>{{pet_name}}</strong>.</p><p>Comprendo que este procedimiento es irreversible y ha sido recomendado debido a: <strong>{{reason}}</strong>.</p><p>Deseo estar presente durante el procedimiento: {{owner_present}}</p><p>Disposición de los restos: {{remains_disposition}}</p>',
     TRUE, NULL),
    (NULL, 'BOARD', 'Contrato de Hospedaje', 'boarding', 'Contrato de Hospedaje',
     '<h2>Contrato de Hospedaje</h2><p>Acepto las condiciones de hospedaje de <strong>{{pet_name}}</strong> en <strong>{{clinic_name}}</strong> desde el <strong>{{start_date}}</strong> hasta el <strong>{{end_date}}</strong>.</p><p>Tarifa diaria: Gs. {{daily_rate}}</p><p>Autorizo atención veterinaria de emergencia si fuera necesario.</p>',
     FALSE, NULL),
    (NULL, 'PHOTO', 'Autorización de Uso de Imagen', 'general', 'Autorización de Uso de Fotografías',
     '<h2>Autorización de Uso de Imagen</h2><p>Autorizo a <strong>{{clinic_name}}</strong> a utilizar fotografías de <strong>{{pet_name}}</strong> para fines promocionales en redes sociales y material publicitario.</p>',
     FALSE, 365)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- I. INSURANCE PROVIDERS
-- =============================================================================

INSERT INTO public.insurance_providers (name, code, claims_email, supports_electronic_claims, typical_processing_days) VALUES
    ('PetPlan', 'PETPLAN', 'claims@petplan.com', TRUE, 14),
    ('Embrace Pet Insurance', 'EMBRACE', 'claims@embracepet.com', TRUE, 10),
    ('Nationwide Pet', 'NATIONWIDE', 'petclaims@nationwide.com', TRUE, 15),
    ('Trupanion', 'TRUPANION', 'claims@trupanion.com', TRUE, 5),
    ('Healthy Paws', 'HEALTHYPAWS', 'claims@healthypaws.com', TRUE, 10),
    ('ASPCA Pet Insurance', 'ASPCA', 'claims@aspcapetinsurance.com', TRUE, 14),
    ('Otro Seguro', 'OTHER', NULL, FALSE, 30)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- J. TIME OFF TYPES
-- =============================================================================

INSERT INTO public.time_off_types (tenant_id, name, code, is_paid, max_days_per_year, requires_approval, color) VALUES
    (NULL, 'Vacaciones', 'VAC', TRUE, 15, TRUE, '#4CAF50'),
    (NULL, 'Enfermedad', 'SICK', TRUE, 10, FALSE, '#F44336'),
    (NULL, 'Personal', 'PERS', FALSE, 3, TRUE, '#2196F3'),
    (NULL, 'Maternidad', 'MAT', TRUE, 90, TRUE, '#E91E63'),
    (NULL, 'Paternidad', 'PAT', TRUE, 14, TRUE, '#9C27B0'),
    (NULL, 'Duelo', 'BER', TRUE, 5, FALSE, '#607D8B'),
    (NULL, 'Sin Goce', 'UNPD', FALSE, 30, TRUE, '#FF9800'),
    (NULL, 'Capacitación', 'TRAIN', TRUE, 10, TRUE, '#00BCD4')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- K. QR TAGS (Sample batch for testing)
-- =============================================================================

INSERT INTO public.qr_tags (tenant_id, code, is_active, is_registered, batch_id) VALUES
    ('adris', 'VT001ABC', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VT002DEF', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VT003GHI', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VT004JKL', TRUE, FALSE, 'BATCH-2024-001'),
    ('adris', 'VT005MNO', TRUE, FALSE, 'BATCH-2024-001'),
    ('petlife', 'PL001XYZ', TRUE, FALSE, 'BATCH-2024-002'),
    ('petlife', 'PL002ABC', TRUE, FALSE, 'BATCH-2024-002')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- DEMO DATA SEED COMPLETE
-- =============================================================================
-- 
-- NOTE: Pets, appointments, vaccines, and invoices require user IDs.
-- These should be created after demo users sign up and trigger profile creation.
-- Use the following SQL after demo users exist:
--
-- See: 98_seed_after_users.sql (run after demo accounts are created in auth.users)
-- =============================================================================
