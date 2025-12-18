-- =============================================================================
-- 54_TENANT_SETUP.SQL
-- =============================================================================
-- Tenant onboarding function to replace hardcoded tenant IDs in seed scripts.
-- Creates a new tenant with all required default data.
-- =============================================================================

-- =============================================================================
-- A. MAIN TENANT SETUP FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION setup_new_tenant(
    p_tenant_id TEXT,
    p_tenant_name TEXT
)
RETURNS void AS $$
BEGIN
    -- =============================================================================
    -- 1. INSERT TENANT
    -- =============================================================================
    INSERT INTO tenants (id, name)
    VALUES (p_tenant_id, p_tenant_name)
    ON CONFLICT (id) DO NOTHING;

    -- =============================================================================
    -- 2. PAYMENT METHODS (Required for invoicing)
    -- =============================================================================
    INSERT INTO payment_methods (tenant_id, name, type, is_default) VALUES
        (p_tenant_id, 'Efectivo', 'cash', TRUE),
        (p_tenant_id, 'Tarjeta de Crédito', 'credit_card', FALSE),
        (p_tenant_id, 'Tarjeta de Débito', 'debit_card', FALSE),
        (p_tenant_id, 'Transferencia Bancaria', 'bank_transfer', FALSE),
        (p_tenant_id, 'Pago Móvil', 'mobile_payment', FALSE)
    ON CONFLICT DO NOTHING;

    -- =============================================================================
    -- 3. INVOICE SEQUENCE (Required for invoice numbering)
    -- =============================================================================
    INSERT INTO invoice_sequences (tenant_id, prefix, current_number, format)
    VALUES (
        p_tenant_id,
        UPPER(LEFT(p_tenant_id, 3)),  -- First 3 chars as prefix (e.g., 'ADR', 'PET')
        0,
        '{prefix}-{year}-{number}'
    )
    ON CONFLICT (tenant_id) DO NOTHING;

    -- =============================================================================
    -- 4. DEFAULT SERVICES (Common veterinary services)
    -- =============================================================================
    INSERT INTO services (tenant_id, code, name, category, base_price, duration_minutes, is_taxable) VALUES
        (p_tenant_id, 'CONSULT-001', 'Consulta General', 'consultation', 150000, 30, TRUE),
        (p_tenant_id, 'CONSULT-002', 'Consulta de Emergencia', 'consultation', 300000, 45, TRUE),
        (p_tenant_id, 'VAC-001', 'Vacunación Antirrábica', 'vaccination', 80000, 15, TRUE),
        (p_tenant_id, 'VAC-002', 'Vacunación Séxtuple (Perros)', 'vaccination', 120000, 15, TRUE),
        (p_tenant_id, 'VAC-003', 'Vacunación Triple Felina', 'vaccination', 100000, 15, TRUE),
        (p_tenant_id, 'SURG-001', 'Castración (Perro)', 'surgery', 400000, 120, TRUE),
        (p_tenant_id, 'SURG-002', 'Castración (Gato)', 'surgery', 300000, 90, TRUE),
        (p_tenant_id, 'EXAM-001', 'Análisis de Sangre Completo', 'lab', 250000, 30, TRUE),
        (p_tenant_id, 'EXAM-002', 'Radiografía Simple', 'imaging', 200000, 20, TRUE),
        (p_tenant_id, 'EXAM-003', 'Ecografía Abdominal', 'imaging', 350000, 30, TRUE),
        (p_tenant_id, 'GROOM-001', 'Baño y Corte', 'grooming', 150000, 60, TRUE),
        (p_tenant_id, 'DENT-001', 'Limpieza Dental', 'dentistry', 300000, 60, TRUE),
        (p_tenant_id, 'HOSP-001', 'Hospitalización (día)', 'hospitalization', 200000, 1440, TRUE)
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- =============================================================================
    -- 5. DEFAULT STORE CATEGORIES (For inventory)
    -- =============================================================================
    INSERT INTO store_categories (tenant_id, name, slug, description) VALUES
        (p_tenant_id, 'Alimento para Perros', 'alimento-perros', 'Alimentos balanceados y naturales para perros'),
        (p_tenant_id, 'Alimento para Gatos', 'alimento-gatos', 'Alimentos balanceados y naturales para gatos'),
        (p_tenant_id, 'Antiparasitarios', 'antiparasitarios', 'Productos contra pulgas, garrapatas y parásitos'),
        (p_tenant_id, 'Accesorios', 'accesorios', 'Collares, correas, juguetes y más'),
        (p_tenant_id, 'Higiene', 'higiene', 'Shampoos, cepillos y productos de limpieza'),
        (p_tenant_id, 'Medicamentos', 'medicamentos', 'Medicamentos veterinarios')
    ON CONFLICT (tenant_id, slug) DO NOTHING;

    -- =============================================================================
    -- 6. NOTIFICATION TEMPLATES (For reminders)
    -- =============================================================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminder_templates') THEN
        INSERT INTO reminder_templates (tenant_id, name, type, template_text, days_before, is_active) VALUES
            (p_tenant_id, 'Recordatorio de Vacuna', 'vaccine_due',
             'Hola {owner_name}, recordamos que {pet_name} tiene programada su vacuna {vaccine_name} para el {due_date}.',
             7, TRUE),
            (p_tenant_id, 'Recordatorio de Cita', 'appointment',
             'Hola {owner_name}, le recordamos su cita con {pet_name} para el {appointment_date} a las {appointment_time}.',
             1, TRUE),
            (p_tenant_id, 'Seguimiento Post-Cirugía', 'post_surgery',
             'Hola {owner_name}, ¿cómo se encuentra {pet_name} después de la cirugía? Por favor responda este mensaje o llámenos si tiene dudas.',
             1, TRUE)
        ON CONFLICT DO NOTHING;
    END IF;

    -- =============================================================================
    -- NOTIFICATION
    -- =============================================================================
    RAISE NOTICE 'Tenant % (%) created successfully with default data', p_tenant_name, p_tenant_id;

END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- B. HELPER FUNCTION: Validate Tenant Exists
-- =============================================================================

CREATE OR REPLACE FUNCTION tenant_exists(p_tenant_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM tenants WHERE id = p_tenant_id);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- C. HELPER FUNCTION: Get Tenant Info
-- =============================================================================

CREATE OR REPLACE FUNCTION get_tenant_info(p_tenant_id TEXT)
RETURNS TABLE (
    tenant_id TEXT,
    tenant_name TEXT,
    payment_methods_count BIGINT,
    services_count BIGINT,
    categories_count BIGINT,
    users_count BIGINT,
    pets_count BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id AS tenant_id,
        t.name AS tenant_name,
        (SELECT COUNT(*) FROM payment_methods WHERE tenant_id = t.id) AS payment_methods_count,
        (SELECT COUNT(*) FROM services WHERE tenant_id = t.id) AS services_count,
        (SELECT COUNT(*) FROM store_categories WHERE tenant_id = t.id) AS categories_count,
        (SELECT COUNT(*) FROM profiles WHERE tenant_id = t.id) AS users_count,
        (SELECT COUNT(*) FROM pets WHERE tenant_id = t.id) AS pets_count,
        t.created_at
    FROM tenants t
    WHERE t.id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- D. HELPER FUNCTION: Delete Tenant (Use with caution!)
-- =============================================================================

CREATE OR REPLACE FUNCTION delete_tenant_cascade(p_tenant_id TEXT)
RETURNS void AS $$
BEGIN
    -- This will cascade delete all related data due to foreign key constraints
    -- USE WITH EXTREME CAUTION - THIS IS IRREVERSIBLE

    RAISE WARNING 'Deleting tenant % and ALL associated data...', p_tenant_id;

    -- Delete tenant (will cascade to all related tables)
    DELETE FROM tenants WHERE id = p_tenant_id;

    RAISE NOTICE 'Tenant % deleted successfully', p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- USAGE EXAMPLES
-- =============================================================================

-- Create a new tenant with all default data:
-- SELECT setup_new_tenant('myclinic', 'My Veterinary Clinic');

-- Check if tenant exists:
-- SELECT tenant_exists('myclinic');

-- Get tenant info and statistics:
-- SELECT * FROM get_tenant_info('myclinic');

-- Delete tenant (DANGEROUS - deletes all data):
-- SELECT delete_tenant_cascade('myclinic');

-- =============================================================================
-- TENANT SETUP COMPLETE
-- =============================================================================
