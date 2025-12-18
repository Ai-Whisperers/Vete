-- ============================================
-- Comprehensive Seed Data for All Tables
-- Run after basic seeds (90-97)
-- ============================================

-- Get tenant and user IDs for reference
DO $$
DECLARE
    v_tenant_id TEXT := 'adris';
    v_vet_id UUID;
    v_admin_id UUID;
    v_owner_id UUID;
    v_pet_id UUID;
    v_pet_id_2 UUID;
    v_service_id UUID;
    v_kennel_id UUID;
    v_hosp_id UUID;
    v_invoice_id UUID;
    v_lab_order_id UUID;
    v_conversation_id UUID;
    v_consent_template_id UUID;
    v_policy_id UUID;
    v_test_id UUID;
    v_panel_id UUID;
BEGIN
    -- Get existing user IDs
    SELECT id INTO v_vet_id FROM profiles WHERE tenant_id = v_tenant_id AND role = 'vet' LIMIT 1;
    SELECT id INTO v_admin_id FROM profiles WHERE tenant_id = v_tenant_id AND role = 'admin' LIMIT 1;
    SELECT id INTO v_owner_id FROM profiles WHERE tenant_id = v_tenant_id AND role = 'owner' LIMIT 1;
    SELECT id INTO v_pet_id FROM pets WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_pet_id_2 FROM pets WHERE tenant_id = v_tenant_id OFFSET 1 LIMIT 1;
    SELECT id INTO v_service_id FROM services WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_consent_template_id FROM consent_templates WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_test_id FROM lab_test_catalog WHERE tenant_id = v_tenant_id LIMIT 1;

    IF v_vet_id IS NULL THEN
        RAISE NOTICE 'No vet found - run basic seeds first';
        RETURN;
    END IF;

    -- ============================================
    -- 1. KENNELS (Hospital beds/cages)
    -- ============================================
    INSERT INTO kennels (tenant_id, name, code, kennel_type, size_category, daily_rate, current_status, floor_number, notes)
    VALUES
        (v_tenant_id, 'Jaula Pequeña 1', 'K-P01', 'cage', 'small', 50000, 'available', 1, 'Para gatos y perros pequeños'),
        (v_tenant_id, 'Jaula Pequeña 2', 'K-P02', 'cage', 'small', 50000, 'available', 1, 'Para gatos y perros pequeños'),
        (v_tenant_id, 'Jaula Mediana 1', 'K-M01', 'cage', 'medium', 75000, 'available', 1, 'Para perros medianos'),
        (v_tenant_id, 'Jaula Mediana 2', 'K-M02', 'cage', 'medium', 75000, 'occupied', 1, 'Para perros medianos'),
        (v_tenant_id, 'Jaula Grande 1', 'K-G01', 'cage', 'large', 100000, 'available', 1, 'Para perros grandes'),
        (v_tenant_id, 'Incubadora 1', 'INC-01', 'incubator', 'small', 150000, 'available', 1, 'Para neonatos y críticos'),
        (v_tenant_id, 'UCI 1', 'UCI-01', 'icu', 'medium', 200000, 'available', 1, 'Cuidados intensivos'),
        (v_tenant_id, 'Aislamiento 1', 'ISO-01', 'isolation', 'medium', 120000, 'available', 2, 'Para casos infecciosos')
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_kennel_id FROM kennels WHERE tenant_id = v_tenant_id AND code = 'K-M02' LIMIT 1;

    -- ============================================
    -- 2. STAFF PROFILES
    -- ============================================
    INSERT INTO staff_profiles (tenant_id, user_id, job_title, specialization, license_number, hire_date, employment_status, hourly_rate, can_be_booked, color_code)
    VALUES
        (v_tenant_id, v_vet_id, 'Veterinario', 'Medicina General', 'VET-001-PY', CURRENT_DATE - INTERVAL '2 years', 'active', 150000, true, '#3B82F6'),
        (v_tenant_id, v_admin_id, 'Administrador', NULL, NULL, CURRENT_DATE - INTERVAL '3 years', 'active', 100000, false, '#10B981')
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 3. STAFF SCHEDULES
    -- ============================================
    INSERT INTO staff_schedules (tenant_id, staff_profile_id, day_of_week, start_time, end_time, is_available)
    SELECT v_tenant_id, sp.id, dow, '08:00'::TIME, '17:00'::TIME, true
    FROM staff_profiles sp
    CROSS JOIN generate_series(1, 5) AS dow
    WHERE sp.tenant_id = v_tenant_id AND sp.can_be_booked = true
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 4. STORE BRANDS
    -- ============================================
    INSERT INTO store_brands (tenant_id, name, slug, logo_url, is_active)
    VALUES
        (v_tenant_id, 'Royal Canin', 'royal-canin', NULL, true),
        (v_tenant_id, 'Hills Science Diet', 'hills', NULL, true),
        (v_tenant_id, 'Purina Pro Plan', 'purina', NULL, true),
        (v_tenant_id, 'Eukanuba', 'eukanuba', NULL, true),
        (v_tenant_id, 'Frontline', 'frontline', NULL, true),
        (v_tenant_id, 'Advantage', 'advantage', NULL, true)
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 5. LAB TEST PANELS
    -- ============================================
    INSERT INTO lab_test_panels (tenant_id, name, code, description, panel_price)
    VALUES
        (v_tenant_id, 'Hemograma Completo', 'CBC', 'Conteo sanguíneo completo', 150000),
        (v_tenant_id, 'Perfil Hepático', 'LIVER', 'Panel de función hepática', 200000),
        (v_tenant_id, 'Perfil Renal', 'RENAL', 'Panel de función renal', 180000),
        (v_tenant_id, 'Perfil Tiroideo', 'THYROID', 'Hormonas tiroideas T3, T4, TSH', 250000),
        (v_tenant_id, 'Perfil Prequirúrgico', 'PRESURG', 'Hemograma + Coagulación + Bioquímica básica', 350000)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_panel_id;

    -- ============================================
    -- 6. INVOICES & PAYMENTS
    -- ============================================
    INSERT INTO invoices (tenant_id, client_id, invoice_number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, amount_due, status, notes)
    VALUES
        (v_tenant_id, v_owner_id, 'INV-2024-0001', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 250000, 10, 25000, 275000, 0, 'paid', 'Consulta y vacunación'),
        (v_tenant_id, v_owner_id, 'INV-2024-0002', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '28 days', 450000, 10, 45000, 495000, 495000, 'sent', 'Hospitalización'),
        (v_tenant_id, v_owner_id, 'INV-2024-0003', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 180000, 10, 18000, 198000, 198000, 'draft', 'Laboratorio')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_invoice_id;

    -- Get first invoice for items
    SELECT id INTO v_invoice_id FROM invoices WHERE tenant_id = v_tenant_id AND status = 'paid' LIMIT 1;

    IF v_invoice_id IS NOT NULL THEN
        INSERT INTO invoice_items (invoice_id, item_type, description, quantity, unit_price, discount_percent, subtotal)
        VALUES
            (v_invoice_id, 'service', 'Consulta General', 1, 150000, 0, 150000),
            (v_invoice_id, 'service', 'Vacuna Antirrábica', 1, 100000, 0, 100000)
        ON CONFLICT DO NOTHING;

        INSERT INTO payments (tenant_id, invoice_id, amount, payment_date, payment_method, reference_number, status, received_by)
        VALUES
            (v_tenant_id, v_invoice_id, 275000, CURRENT_DATE - INTERVAL '5 days', 'cash', 'CASH-001', 'completed', v_admin_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- ============================================
    -- 7. PRESCRIPTIONS
    -- ============================================
    INSERT INTO prescriptions (tenant_id, pet_id, vet_id, prescription_date, valid_until, diagnosis, medications, instructions, is_controlled, status)
    VALUES
        (v_tenant_id, v_pet_id, v_vet_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
         'Infección bacteriana leve',
         '[{"name": "Amoxicilina 500mg", "dosage": "1 tableta cada 12 horas", "duration": "7 días", "quantity": 14}]'::JSONB,
         'Administrar con comida. Completar todo el tratamiento.', false, 'active'),
        (v_tenant_id, v_pet_id_2, v_vet_id, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days',
         'Dolor articular',
         '[{"name": "Meloxicam 2mg", "dosage": "1 tableta diaria", "duration": "14 días", "quantity": 14}]'::JSONB,
         'Administrar con comida. No combinar con otros antiinflamatorios.', false, 'active')
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 8. LAB ORDERS & RESULTS
    -- ============================================
    INSERT INTO lab_orders (tenant_id, pet_id, order_number, ordered_by, ordered_at, status, priority, lab_type, clinical_notes, has_critical_values)
    VALUES
        (v_tenant_id, v_pet_id, 'LAB-2024-0001', v_vet_id, CURRENT_TIMESTAMP - INTERVAL '3 days', 'completed', 'routine', 'in_house', 'Control anual', false),
        (v_tenant_id, v_pet_id_2, 'LAB-2024-0002', v_vet_id, CURRENT_TIMESTAMP - INTERVAL '1 day', 'in_progress', 'urgent', 'in_house', 'Vómitos recurrentes', false),
        (v_tenant_id, v_pet_id, 'LAB-2024-0003', v_vet_id, CURRENT_TIMESTAMP, 'ordered', 'routine', 'external', 'Seguimiento función renal', false)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_lab_order_id;

    -- Get completed lab order for results
    SELECT id INTO v_lab_order_id FROM lab_orders WHERE tenant_id = v_tenant_id AND status = 'completed' LIMIT 1;

    IF v_lab_order_id IS NOT NULL AND v_test_id IS NOT NULL THEN
        INSERT INTO lab_order_items (lab_order_id, test_id, status, result_value, unit)
        VALUES
            (v_lab_order_id, v_test_id, 'completed', '12.5', 'g/dL')
        ON CONFLICT DO NOTHING;
    END IF;

    -- ============================================
    -- 9. HOSPITALIZATIONS
    -- ============================================
    IF v_kennel_id IS NOT NULL THEN
        INSERT INTO hospitalizations (tenant_id, pet_id, kennel_id, admitted_at, admitted_by, reason, diagnosis, treatment_plan, status, acuity_level, estimated_discharge, daily_rate)
        VALUES
            (v_tenant_id, v_pet_id_2, v_kennel_id, CURRENT_TIMESTAMP - INTERVAL '2 days', v_vet_id,
             'Gastroenteritis aguda', 'Gastroenteritis bacteriana',
             'Fluidoterapia IV, antieméticos, dieta blanda',
             'active', 'moderate', CURRENT_DATE + INTERVAL '2 days', 150000)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_hosp_id;

        IF v_hosp_id IS NOT NULL THEN
            -- Add vitals
            INSERT INTO hospitalization_vitals (hospitalization_id, recorded_at, recorded_by, temperature, heart_rate, respiratory_rate, weight_kg, hydration_status, pain_score, notes)
            VALUES
                (v_hosp_id, CURRENT_TIMESTAMP - INTERVAL '2 days', v_vet_id, 39.2, 120, 28, 8.5, 'mild_dehydration', 3, 'Ingreso'),
                (v_hosp_id, CURRENT_TIMESTAMP - INTERVAL '1 day', v_vet_id, 38.8, 100, 22, 8.3, 'normal', 2, 'Mejorando'),
                (v_hosp_id, CURRENT_TIMESTAMP, v_vet_id, 38.5, 90, 20, 8.4, 'normal', 1, 'Estable')
            ON CONFLICT DO NOTHING;

            -- Add treatments
            INSERT INTO hospitalization_treatments (hospitalization_id, treatment_type, medication_name, dosage, route, frequency, administered_at, administered_by, notes)
            VALUES
                (v_hosp_id, 'medication', 'Metoclopramida', '0.5mg/kg', 'IV', 'TID', CURRENT_TIMESTAMP - INTERVAL '2 days', v_vet_id, 'Primera dosis'),
                (v_hosp_id, 'fluid', 'Ringer Lactato', '500ml', 'IV', 'Continuous', CURRENT_TIMESTAMP - INTERVAL '2 days', v_vet_id, 'Mantenimiento'),
                (v_hosp_id, 'medication', 'Omeprazol', '1mg/kg', 'IV', 'BID', CURRENT_TIMESTAMP - INTERVAL '1 day', v_vet_id, NULL)
            ON CONFLICT DO NOTHING;

            -- Add feedings
            INSERT INTO hospitalization_feedings (hospitalization_id, fed_at, fed_by, food_type, amount, unit, appetite_level, vomited, notes)
            VALUES
                (v_hosp_id, CURRENT_TIMESTAMP - INTERVAL '1 day', v_vet_id, 'Dieta gastrointestinal', 50, 'g', 'poor', false, 'Comió poco'),
                (v_hosp_id, CURRENT_TIMESTAMP, v_vet_id, 'Dieta gastrointestinal', 100, 'g', 'good', false, 'Buen apetito')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- ============================================
    -- 10. CONVERSATIONS & MESSAGES
    -- ============================================
    INSERT INTO conversations (tenant_id, client_id, pet_id, subject, status, channel, last_message_at)
    VALUES
        (v_tenant_id, v_owner_id, v_pet_id, 'Consulta sobre vacunas', 'open', 'internal', CURRENT_TIMESTAMP),
        (v_tenant_id, v_owner_id, v_pet_id_2, 'Seguimiento hospitalización', 'open', 'internal', CURRENT_TIMESTAMP)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_conversation_id;

    SELECT id INTO v_conversation_id FROM conversations WHERE tenant_id = v_tenant_id LIMIT 1;

    IF v_conversation_id IS NOT NULL THEN
        INSERT INTO messages (conversation_id, sender_id, sender_type, content, status, created_at)
        VALUES
            (v_conversation_id, v_owner_id, 'client', 'Hola, quería consultar cuándo toca la próxima vacuna de Max.', 'read', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
            (v_conversation_id, v_vet_id, 'staff', 'Hola! Según nuestros registros, la próxima vacuna (refuerzo antirrábico) está programada para el mes que viene.', 'delivered', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
            (v_conversation_id, v_owner_id, 'client', 'Perfecto, gracias por la información!', 'delivered', CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING;
    END IF;

    -- ============================================
    -- 11. REMINDERS
    -- ============================================
    INSERT INTO reminders (tenant_id, pet_id, owner_id, reminder_type, title, message, scheduled_for, status, channel)
    VALUES
        (v_tenant_id, v_pet_id, v_owner_id, 'vaccine', 'Recordatorio de Vacuna', 'La vacuna antirrábica de Max vence pronto.', CURRENT_DATE + INTERVAL '7 days', 'pending', 'email'),
        (v_tenant_id, v_pet_id, v_owner_id, 'appointment', 'Cita de Control', 'Recordatorio: Tiene una cita de control programada.', CURRENT_DATE + INTERVAL '1 day', 'pending', 'sms'),
        (v_tenant_id, v_pet_id_2, v_owner_id, 'followup', 'Seguimiento Post-Hospitalización', 'Control de seguimiento después de la hospitalización.', CURRENT_DATE + INTERVAL '5 days', 'pending', 'whatsapp')
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 12. EXPENSES
    -- ============================================
    INSERT INTO expenses (tenant_id, category, description, amount, expense_date, payment_method, vendor, receipt_url, created_by, status)
    VALUES
        (v_tenant_id, 'supplies', 'Medicamentos - Reposición mensual', 2500000, CURRENT_DATE - INTERVAL '10 days', 'transfer', 'Distribuidora Veterinaria SA', NULL, v_admin_id, 'approved'),
        (v_tenant_id, 'utilities', 'Electricidad - Diciembre', 850000, CURRENT_DATE - INTERVAL '5 days', 'transfer', 'ANDE', NULL, v_admin_id, 'approved'),
        (v_tenant_id, 'maintenance', 'Reparación equipo rayos X', 1200000, CURRENT_DATE - INTERVAL '3 days', 'cash', 'Técnico Médico SRL', NULL, v_admin_id, 'pending'),
        (v_tenant_id, 'supplies', 'Material quirúrgico', 750000, CURRENT_DATE, 'credit_card', 'MedVet Supplies', NULL, v_admin_id, 'pending')
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 13. CONSENT DOCUMENTS
    -- ============================================
    IF v_consent_template_id IS NOT NULL THEN
        INSERT INTO consent_documents (tenant_id, pet_id, template_id, signed_by, signed_at, signature_type, signature_data, witness_name, is_valid, expires_at)
        VALUES
            (v_tenant_id, v_pet_id, v_consent_template_id, v_owner_id, CURRENT_TIMESTAMP - INTERVAL '1 month', 'digital', 'base64_signature_data_here', 'Dr. Martinez', true, CURRENT_DATE + INTERVAL '11 months'),
            (v_tenant_id, v_pet_id_2, v_consent_template_id, v_owner_id, CURRENT_TIMESTAMP - INTERVAL '2 days', 'digital', 'base64_signature_data_here', 'Dr. Martinez', true, CURRENT_DATE + INTERVAL '1 year')
        ON CONFLICT DO NOTHING;
    END IF;

    -- ============================================
    -- 14. INSURANCE POLICIES & CLAIMS
    -- ============================================
    INSERT INTO insurance_policies (tenant_id, pet_id, provider_id, policy_number, coverage_type, start_date, end_date, premium_amount, coverage_limit, deductible, status)
    SELECT v_tenant_id, v_pet_id, ip.id, 'POL-2024-001', 'comprehensive', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '6 months', 150000, 10000000, 500000, 'active'
    FROM insurance_providers ip WHERE ip.name ILIKE '%seguro%' OR ip.id IS NOT NULL LIMIT 1
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_policy_id;

    IF v_policy_id IS NOT NULL THEN
        INSERT INTO insurance_claims (tenant_id, policy_id, pet_id, claim_number, claim_date, incident_date, claim_type, description, amount_claimed, amount_approved, status)
        VALUES
            (v_tenant_id, v_policy_id, v_pet_id, 'CLM-2024-001', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE - INTERVAL '1 month' - INTERVAL '2 days', 'treatment', 'Tratamiento por infección', 350000, 300000, 'approved')
        ON CONFLICT DO NOTHING;
    END IF;

    -- ============================================
    -- 15. VACCINE REACTIONS
    -- ============================================
    INSERT INTO vaccine_reactions (tenant_id, pet_id, vaccine_id, reaction_type, severity, onset_hours, symptoms, treatment_given, outcome, reported_by, reported_at)
    SELECT v_tenant_id, v.pet_id, v.id, 'local', 'mild', 2, 'Inflamación leve en sitio de inyección', 'Observación, aplicación de hielo', 'resolved', v_vet_id, CURRENT_TIMESTAMP - INTERVAL '1 month'
    FROM vaccines v WHERE v.tenant_id = v_tenant_id LIMIT 1
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 16. NOTIFICATION TEMPLATES
    -- ============================================
    INSERT INTO notification_templates (tenant_id, name, type, channel, subject, body, variables, is_active)
    VALUES
        (v_tenant_id, 'Recordatorio de Vacuna', 'vaccine_reminder', 'email', 'Recordatorio: Vacuna de {{pet_name}}', 'Hola {{owner_name}}, le recordamos que la vacuna {{vaccine_name}} de {{pet_name}} vence el {{due_date}}.', '["owner_name", "pet_name", "vaccine_name", "due_date"]'::JSONB, true),
        (v_tenant_id, 'Confirmación de Cita', 'appointment_confirmation', 'email', 'Cita Confirmada - {{clinic_name}}', 'Su cita para {{pet_name}} ha sido confirmada para el {{date}} a las {{time}}.', '["pet_name", "date", "time", "clinic_name"]'::JSONB, true),
        (v_tenant_id, 'Recordatorio de Cita SMS', 'appointment_reminder', 'sms', NULL, '{{clinic_name}}: Recordatorio de cita mañana {{time}} para {{pet_name}}.', '["clinic_name", "time", "pet_name"]'::JSONB, true)
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 17. TIME OFF REQUESTS
    -- ============================================
    INSERT INTO time_off_requests (tenant_id, staff_profile_id, type_id, start_date, end_date, reason, status, requested_at, reviewed_by, reviewed_at)
    SELECT v_tenant_id, sp.id, tot.id, CURRENT_DATE + INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month' + INTERVAL '5 days', 'Vacaciones programadas', 'approved', CURRENT_TIMESTAMP - INTERVAL '2 weeks', v_admin_id, CURRENT_TIMESTAMP - INTERVAL '1 week'
    FROM staff_profiles sp, time_off_types tot
    WHERE sp.tenant_id = v_tenant_id AND sp.can_be_booked = true AND tot.tenant_id = v_tenant_id AND tot.name ILIKE '%vacacion%'
    LIMIT 1
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 18. LOYALTY POINTS
    -- ============================================
    INSERT INTO loyalty_points (tenant_id, client_id, balance, lifetime_earned, tier)
    VALUES
        (v_tenant_id, v_owner_id, 1500, 2500, 'silver')
    ON CONFLICT DO NOTHING;

    INSERT INTO loyalty_transactions (tenant_id, client_id, points, transaction_type, description, reference_id, created_at)
    VALUES
        (v_tenant_id, v_owner_id, 1000, 'earn', 'Compra de servicios', NULL, CURRENT_TIMESTAMP - INTERVAL '2 months'),
        (v_tenant_id, v_owner_id, 800, 'earn', 'Compra de productos', NULL, CURRENT_TIMESTAMP - INTERVAL '1 month'),
        (v_tenant_id, v_owner_id, 700, 'earn', 'Hospitalización', NULL, CURRENT_TIMESTAMP - INTERVAL '1 week'),
        (v_tenant_id, v_owner_id, -1000, 'redeem', 'Descuento en consulta', NULL, CURRENT_TIMESTAMP - INTERVAL '2 weeks')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Comprehensive seed data inserted successfully!';
END $$;

-- ============================================
-- Also seed for petlife tenant
-- ============================================
DO $$
DECLARE
    v_tenant_id TEXT := 'petlife';
    v_vet_id UUID;
    v_owner_id UUID;
    v_pet_id UUID;
BEGIN
    SELECT id INTO v_vet_id FROM profiles WHERE tenant_id = v_tenant_id AND role = 'vet' LIMIT 1;
    SELECT id INTO v_owner_id FROM profiles WHERE tenant_id = v_tenant_id AND role = 'owner' LIMIT 1;
    SELECT id INTO v_pet_id FROM pets WHERE tenant_id = v_tenant_id LIMIT 1;

    IF v_vet_id IS NULL THEN
        RAISE NOTICE 'No petlife vet found - skipping petlife seeds';
        RETURN;
    END IF;

    -- Add minimal data for petlife
    INSERT INTO kennels (tenant_id, name, code, kennel_type, size_category, daily_rate, current_status)
    VALUES
        (v_tenant_id, 'Jaula Pequeña 1', 'K-P01', 'cage', 'small', 45000, 'available'),
        (v_tenant_id, 'Jaula Mediana 1', 'K-M01', 'cage', 'medium', 65000, 'available'),
        (v_tenant_id, 'Jaula Grande 1', 'K-G01', 'cage', 'large', 85000, 'available')
    ON CONFLICT DO NOTHING;

    INSERT INTO staff_profiles (tenant_id, user_id, job_title, hire_date, employment_status, can_be_booked, color_code)
    VALUES (v_tenant_id, v_vet_id, 'Veterinario', CURRENT_DATE - INTERVAL '1 year', 'active', true, '#8B5CF6')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'PetLife seed data inserted successfully!';
END $$;
