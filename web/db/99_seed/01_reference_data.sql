-- =============================================================================
-- 01_REFERENCE_DATA.SQL
-- =============================================================================
-- System-wide reference data: diagnosis codes, drug dosages, growth standards,
-- lab test catalog, insurance providers, time off types, message templates.
--
-- This data is shared across all tenants (tenant_id = NULL for global data).
--
-- Dependencies: All table modules
-- =============================================================================

-- =============================================================================
-- DIAGNOSIS CODES
-- =============================================================================

INSERT INTO public.diagnosis_codes (code, term, standard, category) VALUES
    -- Dermatology
    ('OTIT001', 'Otitis Externa', 'venom', 'dermatology'),
    ('PYOD001', 'Pyoderma', 'venom', 'dermatology'),
    ('ALRG001', 'Dermatitis Alérgica', 'venom', 'dermatology'),
    ('SARN001', 'Sarna', 'venom', 'dermatology'),
    ('DERH001', 'Dermatofitosis', 'venom', 'dermatology'),

    -- Gastroenterology
    ('GAST001', 'Gastroenteritis Aguda', 'venom', 'gastroenterology'),
    ('COLI001', 'Colitis', 'venom', 'gastroenterology'),
    ('PANK001', 'Pancreatitis', 'venom', 'gastroenterology'),
    ('OBST001', 'Obstrucción Intestinal', 'venom', 'gastroenterology'),

    -- Orthopedics
    ('FRAC001', 'Fractura de Miembro', 'venom', 'orthopedics'),
    ('ARTR001', 'Artritis', 'venom', 'orthopedics'),
    ('DISP001', 'Displasia de Cadera', 'venom', 'orthopedics'),
    ('LUXP001', 'Luxación Patelar', 'venom', 'orthopedics'),

    -- Ophthalmology
    ('CONJ001', 'Conjuntivitis', 'venom', 'ophthalmology'),
    ('CATA001', 'Cataratas', 'venom', 'ophthalmology'),
    ('GLAU001', 'Glaucoma', 'venom', 'ophthalmology'),
    ('ULCC001', 'Úlcera Corneal', 'venom', 'ophthalmology'),

    -- Dentistry
    ('PERI001', 'Enfermedad Periodontal', 'venom', 'dentistry'),
    ('GING001', 'Gingivitis', 'venom', 'dentistry'),
    ('STOM001', 'Estomatitis', 'venom', 'dentistry'),

    -- Endocrinology
    ('DIAB001', 'Diabetes Mellitus', 'venom', 'endocrinology'),
    ('HYPO001', 'Hipotiroidismo', 'venom', 'endocrinology'),
    ('HYPE001', 'Hipertiroidismo', 'venom', 'endocrinology'),
    ('CUSH001', 'Síndrome de Cushing', 'venom', 'endocrinology'),

    -- Nephrology/Urology
    ('CKID001', 'Enfermedad Renal Crónica', 'venom', 'nephrology'),
    ('CIST001', 'Cistitis', 'venom', 'urology'),
    ('URLT001', 'Urolitiasis', 'venom', 'urology'),
    ('ITUR001', 'Infección Urinaria', 'venom', 'urology'),

    -- Cardiology
    ('CARD001', 'Insuficiencia Cardíaca', 'venom', 'cardiology'),
    ('CMIO001', 'Cardiomiopatía', 'venom', 'cardiology'),
    ('SCAR001', 'Soplo Cardíaco', 'venom', 'cardiology'),

    -- Infectious/Parasitology
    ('HEAR001', 'Dirofilariasis', 'venom', 'parasitology'),
    ('PARO001', 'Parvovirus Canino', 'venom', 'infectious'),
    ('DISR001', 'Distemper Canino', 'venom', 'infectious'),
    ('LEUC001', 'Leucemia Felina', 'venom', 'infectious'),
    ('PERI002', 'Peritonitis Infecciosa Felina', 'venom', 'infectious'),

    -- Other
    ('OBES001', 'Obesidad', 'venom', 'nutrition'),
    ('TRAR001', 'Trauma', 'venom', 'emergency'),
    ('INTT001', 'Intoxicación', 'venom', 'emergency'),
    ('CONV001', 'Convulsiones', 'venom', 'neurology'),
    ('ONCO001', 'Neoplasia', 'venom', 'oncology')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- DRUG DOSAGES
-- =============================================================================

INSERT INTO public.drug_dosages (name, species, min_dose_mg_kg, max_dose_mg_kg, concentration_mg_ml, route, frequency, notes) VALUES
    -- Antibiotics
    ('Amoxicilina', 'dog', 10, 20, 50, 'PO', 'BID', 'Amplio espectro'),
    ('Amoxicilina', 'cat', 10, 15, 50, 'PO', 'BID', 'Amplio espectro'),
    ('Amoxicilina/Clavulánico', 'dog', 12.5, 25, 50, 'PO', 'BID', 'Para infecciones resistentes'),
    ('Amoxicilina/Clavulánico', 'cat', 12.5, 25, 62.5, 'PO', 'BID', 'Para infecciones resistentes'),
    ('Cefalexina', 'dog', 22, 30, 250, 'PO', 'BID', 'Piodermias'),
    ('Cefalexina', 'cat', 15, 25, 250, 'PO', 'BID', 'Infecciones bacterianas'),
    ('Metronidazol', 'dog', 10, 15, 250, 'PO', 'BID', 'Anaerobios y protozoos'),
    ('Metronidazol', 'cat', 10, 15, 250, 'PO', 'BID', 'Giardia'),
    ('Enrofloxacina', 'dog', 5, 20, 50, 'PO', 'SID', 'Evitar en cachorros'),
    ('Enrofloxacina', 'cat', 5, 10, 50, 'PO', 'SID', 'No usar dosis altas'),
    ('Doxiciclina', 'dog', 5, 10, 100, 'PO', 'BID', 'Ehrlichia, Borrelia'),
    ('Doxiciclina', 'cat', 5, 10, 100, 'PO', 'BID', 'Dar con comida'),

    -- Analgésicos/Antiinflamatorios
    ('Meloxicam', 'dog', 0.1, 0.2, 1.5, 'PO', 'SID', 'AINE COX-2 preferencial'),
    ('Meloxicam', 'cat', 0.05, 0.1, 0.5, 'PO', 'SID', 'Solo dosis única o corto plazo'),
    ('Carprofeno', 'dog', 2, 4, 25, 'PO', 'BID', 'AINE, evitar en IR'),
    ('Tramadol', 'dog', 2, 5, 50, 'PO', 'BID-TID', 'Opioide moderado'),
    ('Tramadol', 'cat', 1, 2, 50, 'PO', 'BID', 'Opioide moderado'),
    ('Gabapentina', 'dog', 5, 10, 100, 'PO', 'TID', 'Dolor neuropático'),
    ('Gabapentina', 'cat', 5, 10, 100, 'PO', 'BID-TID', 'Ansiolítico y analgésico'),

    -- Corticoides
    ('Prednisolona', 'dog', 0.5, 2, 5, 'PO', 'SID-BID', 'Antiinflamatorio'),
    ('Prednisolona', 'cat', 1, 2, 5, 'PO', 'SID-BID', 'Dosis altas para IBD'),
    ('Dexametasona', 'dog', 0.1, 0.25, 2, 'IV/IM', 'SID', 'Emergencias'),
    ('Dexametasona', 'cat', 0.1, 0.25, 2, 'IV/IM', 'SID', 'Emergencias'),

    -- Gastrointestinales
    ('Omeprazol', 'dog', 0.5, 1, 20, 'PO', 'SID', 'Gastroprotector'),
    ('Omeprazol', 'cat', 0.5, 1, 20, 'PO', 'SID', 'Gastroprotector'),
    ('Metoclopramida', 'dog', 0.2, 0.5, 5, 'PO/IV', 'TID', 'Antiemético'),
    ('Metoclopramida', 'cat', 0.2, 0.5, 5, 'PO/IV', 'TID', 'Antiemético'),
    ('Ondansetrón', 'dog', 0.1, 0.2, 2, 'IV', 'BID', 'Antiemético potente'),
    ('Maropitant', 'dog', 1, 1, 10, 'SC', 'SID', 'Cerenia'),
    ('Maropitant', 'cat', 1, 1, 10, 'SC', 'SID', 'Cerenia'),

    -- Antiparasitarios
    ('Fenbendazol', 'dog', 50, 50, 100, 'PO', 'SID', '3-5 días'),
    ('Fenbendazol', 'cat', 50, 50, 100, 'PO', 'SID', '3-5 días'),
    ('Ivermectina', 'dog', 0.006, 0.012, 10, 'PO', 'mensual', 'No en Collies'),
    ('Praziquantel', 'dog', 5, 7.5, 50, 'PO', 'dosis única', 'Tenias'),
    ('Praziquantel', 'cat', 5, 5, 50, 'PO', 'dosis única', 'Tenias')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- GROWTH STANDARDS
-- =============================================================================

INSERT INTO public.growth_standards (breed, gender, age_weeks, weight_kg, percentile) VALUES
    -- Small Dog Male (toy/miniature)
    ('small_dog', 'male', 8, 1.5, 'P50'),
    ('small_dog', 'male', 12, 2.5, 'P50'),
    ('small_dog', 'male', 16, 3.5, 'P50'),
    ('small_dog', 'male', 24, 4.5, 'P50'),
    ('small_dog', 'male', 36, 5.5, 'P50'),
    ('small_dog', 'male', 52, 6.0, 'P50'),

    -- Small Dog Female
    ('small_dog', 'female', 8, 1.3, 'P50'),
    ('small_dog', 'female', 12, 2.2, 'P50'),
    ('small_dog', 'female', 16, 3.0, 'P50'),
    ('small_dog', 'female', 24, 4.0, 'P50'),
    ('small_dog', 'female', 36, 4.8, 'P50'),
    ('small_dog', 'female', 52, 5.2, 'P50'),

    -- Medium Dog Male (11-25kg adult)
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
    ('medium_dog', 'female', 52, 18.0, 'P50'),

    -- Large Dog Male (26-44kg adult)
    ('large_dog', 'male', 8, 5.0, 'P50'),
    ('large_dog', 'male', 12, 10.0, 'P50'),
    ('large_dog', 'male', 16, 16.0, 'P50'),
    ('large_dog', 'male', 24, 26.0, 'P50'),
    ('large_dog', 'male', 36, 34.0, 'P50'),
    ('large_dog', 'male', 52, 38.0, 'P50'),

    -- Large Dog Female
    ('large_dog', 'female', 8, 4.5, 'P50'),
    ('large_dog', 'female', 12, 9.0, 'P50'),
    ('large_dog', 'female', 16, 14.0, 'P50'),
    ('large_dog', 'female', 24, 22.0, 'P50'),
    ('large_dog', 'female', 36, 28.0, 'P50'),
    ('large_dog', 'female', 52, 32.0, 'P50'),

    -- Cat Male
    ('cat', 'male', 8, 0.9, 'P50'),
    ('cat', 'male', 12, 1.5, 'P50'),
    ('cat', 'male', 16, 2.2, 'P50'),
    ('cat', 'male', 24, 3.5, 'P50'),
    ('cat', 'male', 36, 4.2, 'P50'),
    ('cat', 'male', 52, 4.8, 'P50'),

    -- Cat Female
    ('cat', 'female', 8, 0.8, 'P50'),
    ('cat', 'female', 12, 1.3, 'P50'),
    ('cat', 'female', 16, 1.9, 'P50'),
    ('cat', 'female', 24, 3.0, 'P50'),
    ('cat', 'female', 36, 3.5, 'P50'),
    ('cat', 'female', 52, 4.0, 'P50')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- LAB TEST CATALOG (Global)
-- =============================================================================

INSERT INTO public.lab_test_catalog (tenant_id, code, name, category, base_price, turnaround_days, sample_type) VALUES
    -- Hematology
    (NULL, 'CBC', 'Hemograma Completo', 'hematology', 80000, 1, 'blood'),
    (NULL, 'CBC-DIFF', 'Hemograma con Diferencial', 'hematology', 95000, 1, 'blood'),
    (NULL, 'RETP', 'Reticulocitos %', 'hematology', 45000, 1, 'blood'),

    -- Chemistry
    (NULL, 'CHEM10', 'Perfil Bioquímico 10', 'chemistry', 120000, 1, 'serum'),
    (NULL, 'CHEM17', 'Perfil Bioquímico 17', 'chemistry', 180000, 1, 'serum'),
    (NULL, 'LIPID', 'Perfil Lipídico', 'chemistry', 90000, 1, 'serum'),
    (NULL, 'GLUC', 'Glucosa', 'chemistry', 25000, 1, 'serum'),
    (NULL, 'BUN', 'Nitrógeno Ureico', 'chemistry', 30000, 1, 'serum'),
    (NULL, 'CREA', 'Creatinina', 'chemistry', 30000, 1, 'serum'),
    (NULL, 'ALT', 'Alanina Aminotransferasa', 'chemistry', 35000, 1, 'serum'),
    (NULL, 'ALP', 'Fosfatasa Alcalina', 'chemistry', 35000, 1, 'serum'),
    (NULL, 'PANC', 'Lipasa Pancreática (SPEC)', 'chemistry', 85000, 2, 'serum'),

    -- Urinalysis
    (NULL, 'UA', 'Urianálisis Completo', 'urinalysis', 60000, 1, 'urine'),
    (NULL, 'UPC', 'Proteína/Creatinina Urinaria', 'urinalysis', 55000, 1, 'urine'),
    (NULL, 'URCULT', 'Urocultivo', 'microbiology', 120000, 3, 'urine'),

    -- Endocrinology
    (NULL, 'T4', 'T4 Total', 'endocrinology', 95000, 2, 'serum'),
    (NULL, 'FT4', 'T4 Libre', 'endocrinology', 110000, 2, 'serum'),
    (NULL, 'TSH', 'TSH Canino', 'endocrinology', 110000, 2, 'serum'),
    (NULL, 'CORT', 'Cortisol Basal', 'endocrinology', 120000, 2, 'serum'),
    (NULL, 'ACTH', 'Estimulación con ACTH', 'endocrinology', 180000, 2, 'serum'),
    (NULL, 'LDDS', 'Supresión con Dexametasona', 'endocrinology', 200000, 2, 'serum'),

    -- Serology
    (NULL, 'FELV', 'FeLV Antígeno (SNAP)', 'serology', 75000, 1, 'blood'),
    (NULL, 'FIV', 'FIV Anticuerpos (SNAP)', 'serology', 75000, 1, 'blood'),
    (NULL, 'COMBO', 'FeLV/FIV Combo', 'serology', 95000, 1, 'blood'),
    (NULL, '4DX', 'Test 4Dx (Ehrlichia, Lyme, Anaplasma, HW)', 'serology', 120000, 1, 'blood'),

    -- Parasitology
    (NULL, 'HW', 'Dirofilaria Antígeno', 'parasitology', 65000, 1, 'blood'),
    (NULL, 'FECAL', 'Coproparasitológico', 'parasitology', 45000, 1, 'feces'),
    (NULL, 'GIAR', 'Giardia (SNAP)', 'parasitology', 65000, 1, 'feces'),

    -- Coagulation
    (NULL, 'COAG', 'Perfil de Coagulación', 'coagulation', 100000, 1, 'citrated_blood'),
    (NULL, 'PT', 'Tiempo de Protrombina', 'coagulation', 55000, 1, 'citrated_blood'),
    (NULL, 'PTT', 'Tiempo Parcial de Tromboplastina', 'coagulation', 55000, 1, 'citrated_blood'),

    -- Cytology
    (NULL, 'CITO', 'Citología General', 'cytology', 70000, 2, 'tissue'),
    (NULL, 'FNA', 'Aspirado con Aguja Fina', 'cytology', 85000, 2, 'tissue'),

    -- Histopathology
    (NULL, 'BIOP', 'Biopsia', 'histopathology', 250000, 7, 'tissue'),
    (NULL, 'DERM', 'Histopatología Dermatológica', 'histopathology', 200000, 5, 'skin')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INSURANCE PROVIDERS (Global)
-- =============================================================================

INSERT INTO public.insurance_providers (name, code, claims_email, claims_phone, website, is_active) VALUES
    ('PetPlan', 'PETPLAN', 'claims@petplan.com', '+1-800-237-1123', 'https://www.petplan.com', TRUE),
    ('Embrace Pet Insurance', 'EMBRACE', 'claims@embracepet.com', '+1-800-511-9172', 'https://www.embracepetinsurance.com', TRUE),
    ('Nationwide Pet', 'NATIONWIDE', 'petclaims@nationwide.com', '+1-888-899-4874', 'https://www.petinsurance.com', TRUE),
    ('Trupanion', 'TRUPANION', 'claims@trupanion.com', '+1-800-569-7913', 'https://www.trupanion.com', TRUE),
    ('Healthy Paws', 'HEALTHYPAWS', 'claims@healthypawspetinsurance.com', '+1-855-898-8991', 'https://www.healthypawspetinsurance.com', TRUE),
    ('ASPCA Pet Insurance', 'ASPCA', 'claims@aspcapetinsurance.com', '+1-888-716-1203', 'https://www.aspcapetinsurance.com', TRUE),
    ('Lemonade Pet', 'LEMONADE', 'pets@lemonade.com', '+1-844-733-8666', 'https://www.lemonade.com/pet', TRUE),
    ('Otro Seguro', 'OTHER', NULL, NULL, NULL, TRUE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- TIME OFF TYPES (Global)
-- =============================================================================

INSERT INTO public.time_off_types (tenant_id, name, code, is_paid, max_days_per_year, requires_approval, color) VALUES
    (NULL, 'Vacaciones', 'VAC', TRUE, 15, TRUE, '#4CAF50'),
    (NULL, 'Enfermedad', 'SICK', TRUE, 10, FALSE, '#F44336'),
    (NULL, 'Personal', 'PERS', FALSE, 3, TRUE, '#2196F3'),
    (NULL, 'Maternidad', 'MAT', TRUE, 90, TRUE, '#E91E63'),
    (NULL, 'Paternidad', 'PAT', TRUE, 14, TRUE, '#9C27B0'),
    (NULL, 'Duelo', 'BER', TRUE, 5, FALSE, '#607D8B'),
    (NULL, 'Sin Goce de Sueldo', 'UNPD', FALSE, 30, TRUE, '#FF9800'),
    (NULL, 'Capacitación', 'TRAIN', TRUE, 10, TRUE, '#00BCD4'),
    (NULL, 'Día Festivo', 'HOL', TRUE, NULL, FALSE, '#9E9E9E')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- MESSAGE TEMPLATES (Global)
-- =============================================================================

INSERT INTO public.message_templates (tenant_id, code, name, category, subject, content, channels) VALUES
    -- Appointments
    (NULL, 'APPT_CONFIRM', 'Confirmación de Cita', 'appointment', 'Cita Confirmada - {{clinic_name}}',
     'Hola {{owner_name}}, tu cita para {{pet_name}} ha sido confirmada para el {{date}} a las {{time}}. Te esperamos en {{clinic_address}}.',
     ARRAY['email', 'whatsapp']),

    (NULL, 'APPT_REMINDER_24H', 'Recordatorio 24h', 'reminder', 'Recordatorio: Cita mañana - {{clinic_name}}',
     'Hola {{owner_name}}, te recordamos que tienes cita con {{pet_name}} mañana {{date}} a las {{time}}. Si necesitas cancelar o reprogramar, responde a este mensaje.',
     ARRAY['email', 'whatsapp', 'sms']),

    (NULL, 'APPT_REMINDER_2H', 'Recordatorio 2h', 'reminder', 'Tu cita es en 2 horas',
     '¡Hola {{owner_name}}! Tu cita para {{pet_name}} es en 2 horas ({{time}}). ¡Te esperamos!',
     ARRAY['whatsapp', 'sms']),

    (NULL, 'APPT_CANCELLED', 'Cita Cancelada', 'appointment', 'Cita Cancelada - {{clinic_name}}',
     'Hola {{owner_name}}, tu cita del {{date}} a las {{time}} ha sido cancelada. Para reagendar, visita: {{booking_url}}',
     ARRAY['email', 'whatsapp']),

    -- Vaccines
    (NULL, 'VACCINE_DUE', 'Vacuna Próxima', 'reminder', 'Vacuna pendiente para {{pet_name}}',
     'Hola {{owner_name}}, la vacuna {{vaccine_name}} de {{pet_name}} vence el {{due_date}}. Agenda tu cita en {{booking_url}}',
     ARRAY['email', 'whatsapp']),

    (NULL, 'VACCINE_OVERDUE', 'Vacuna Vencida', 'reminder', '¡Atención! Vacuna vencida - {{pet_name}}',
     'Hola {{owner_name}}, la vacuna {{vaccine_name}} de {{pet_name}} está vencida desde el {{due_date}}. Es importante vacunar cuanto antes para proteger su salud.',
     ARRAY['email', 'whatsapp', 'sms']),

    -- Transactional
    (NULL, 'INVOICE_READY', 'Factura Lista', 'transactional', 'Tu factura #{{invoice_number}}',
     'Hola {{owner_name}}, tu factura #{{invoice_number}} por Gs. {{total}} está lista. Puedes verla y pagarla en: {{invoice_url}}',
     ARRAY['email']),

    (NULL, 'PAYMENT_RECEIVED', 'Pago Recibido', 'transactional', 'Confirmación de Pago - {{clinic_name}}',
     'Hola {{owner_name}}, hemos recibido tu pago de Gs. {{amount}} para la factura #{{invoice_number}}. ¡Gracias!',
     ARRAY['email']),

    (NULL, 'WELCOME', 'Bienvenida', 'transactional', '¡Bienvenido a {{clinic_name}}!',
     'Hola {{owner_name}}, gracias por registrar a {{pet_name}} en {{clinic_name}}. Estamos aquí para cuidar de tu mascota. Descarga nuestra app para acceder al portal de mascotas.',
     ARRAY['email']),

    -- Lab & Medical
    (NULL, 'LAB_RESULTS', 'Resultados de Laboratorio', 'transactional', 'Resultados listos para {{pet_name}}',
     'Hola {{owner_name}}, los resultados de laboratorio de {{pet_name}} ya están disponibles. Puedes verlos en tu portal o consultar con nosotros para interpretación.',
     ARRAY['email', 'whatsapp']),

    (NULL, 'PRESCRIPTION_READY', 'Receta Lista', 'transactional', 'Receta disponible - {{pet_name}}',
     'Hola {{owner_name}}, la receta de {{pet_name}} está disponible. Puedes recoger los medicamentos en nuestra farmacia o descargar la receta en: {{prescription_url}}',
     ARRAY['email', 'whatsapp']),

    -- Hospitalization
    (NULL, 'HOSP_ADMITTED', 'Paciente Internado', 'transactional', '{{pet_name}} ha sido internado',
     'Hola {{owner_name}}, {{pet_name}} ha sido internado en {{clinic_name}}. Te mantendremos informado sobre su evolución. Para consultas, contacta: {{clinic_phone}}',
     ARRAY['email', 'whatsapp']),

    (NULL, 'HOSP_UPDATE', 'Actualización de Internación', 'transactional', 'Actualización: {{pet_name}}',
     'Hola {{owner_name}}, actualización sobre {{pet_name}}: {{update_message}}. Si tienes preguntas, no dudes en contactarnos.',
     ARRAY['email', 'whatsapp']),

    (NULL, 'HOSP_DISCHARGE', 'Alta Médica', 'transactional', '{{pet_name}} está listo para ir a casa',
     'Hola {{owner_name}}, {{pet_name}} ha sido dado de alta. Puedes recogerlo hoy entre {{pickup_time}}. Te daremos instrucciones de cuidado al retirarlo.',
     ARRAY['email', 'whatsapp', 'sms'])
ON CONFLICT DO NOTHING;

-- =============================================================================
-- CONSENT TEMPLATES (Global)
-- =============================================================================

INSERT INTO public.consent_templates (tenant_id, code, name, category, title, content_html, requires_witness, validity_days) VALUES
    (NULL, 'SURG_GENERAL', 'Consentimiento Quirúrgico General', 'surgery', 'Consentimiento Informado para Procedimiento Quirúrgico',
     '<h2>Consentimiento Quirúrgico</h2>
      <p>Yo, <strong>{{owner_name}}</strong>, propietario/a de <strong>{{pet_name}}</strong> ({{species}}, {{breed}}), autorizo al equipo veterinario de <strong>{{clinic_name}}</strong> a realizar el procedimiento: <strong>{{procedure_name}}</strong>.</p>
      <h3>He sido informado/a de:</h3>
      <ul>
        <li>Los beneficios esperados del procedimiento</li>
        <li>Los riesgos y posibles complicaciones</li>
        <li>Las alternativas de tratamiento disponibles</li>
        <li>Que la anestesia general conlleva riesgos inherentes</li>
      </ul>
      <p>Autorizo cualquier procedimiento adicional que el veterinario considere necesario durante la cirugía para salvaguardar la vida o salud de mi mascota.</p>',
     FALSE, 1),

    (NULL, 'ANEST', 'Consentimiento Anestésico', 'anesthesia', 'Consentimiento para Administración de Anestesia',
     '<h2>Consentimiento Anestésico</h2>
      <p>Autorizo la administración de anestesia general a <strong>{{pet_name}}</strong>.</p>
      <p>He sido informado/a de los riesgos de la anestesia general, incluyendo reacciones adversas, complicaciones respiratorias o cardiovasculares y, en casos excepcionales, muerte.</p>
      <h3>Confirmo que:</h3>
      <ul>
        <li>Mi mascota ha cumplido con el ayuno pre-quirúrgico indicado ({{fasting_hours}} horas sin alimento)</li>
        <li>He informado sobre cualquier medicación que esté tomando</li>
        <li>He informado sobre alergias conocidas</li>
      </ul>',
     FALSE, 1),

    (NULL, 'EUTH', 'Consentimiento de Eutanasia', 'euthanasia', 'Autorización para Eutanasia Humanitaria',
     '<h2>Solicitud de Eutanasia Humanitaria</h2>
      <p>Yo, <strong>{{owner_name}}</strong>, en pleno uso de mis facultades mentales, solicito y autorizo la eutanasia humanitaria de mi mascota <strong>{{pet_name}}</strong>.</p>
      <p>Comprendo que este procedimiento es <strong>irreversible</strong> y que mi mascota dejará de vivir.</p>
      <h3>Motivo de la solicitud:</h3>
      <p>{{euthanasia_reason}}</p>
      <h3>Opciones seleccionadas:</h3>
      <ul>
        <li>Deseo estar presente durante el procedimiento: {{owner_present}}</li>
        <li>Disposición de los restos: {{remains_disposition}}</li>
      </ul>
      <p>Firmo este documento libre de cualquier presión o coacción.</p>',
     TRUE, NULL),

    (NULL, 'BOARD', 'Contrato de Hospedaje', 'boarding', 'Contrato de Hospedaje para Mascotas',
     '<h2>Contrato de Hospedaje</h2>
      <p>Acepto las condiciones de hospedaje de <strong>{{pet_name}}</strong> en <strong>{{clinic_name}}</strong>.</p>
      <h3>Período de hospedaje:</h3>
      <p>Desde: {{start_date}} hasta: {{end_date}}</p>
      <h3>Tarifa:</h3>
      <p>Gs. {{daily_rate}} por día</p>
      <h3>Condiciones:</h3>
      <ul>
        <li>Mi mascota está al día con sus vacunas</li>
        <li>Autorizo atención veterinaria de emergencia si fuera necesario</li>
        <li>Acepto las políticas de recolección y horarios</li>
      </ul>',
     FALSE, NULL),

    (NULL, 'PHOTO', 'Autorización de Imagen', 'general', 'Autorización de Uso de Fotografías',
     '<h2>Autorización de Uso de Imagen</h2>
      <p>Autorizo a <strong>{{clinic_name}}</strong> a utilizar fotografías y videos de <strong>{{pet_name}}</strong> para:</p>
      <ul>
        <li>Publicaciones en redes sociales</li>
        <li>Material publicitario y promocional</li>
        <li>Página web de la clínica</li>
      </ul>
      <p>Esta autorización no implica compensación económica y puede ser revocada en cualquier momento.</p>',
     FALSE, 365)
ON CONFLICT DO NOTHING;


