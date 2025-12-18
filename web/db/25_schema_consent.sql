-- =============================================================================
-- 25_SCHEMA_CONSENT.SQL
-- =============================================================================
-- Digital consent forms and document signing for veterinary clinics.
-- Includes templates, signatures, and audit trail.
-- =============================================================================

-- =============================================================================
-- A. CONSENT TEMPLATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global template

    -- Template info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'surgery', 'anesthesia', 'treatment', 'euthanasia', 'boarding',
        'grooming', 'dental', 'vaccination', 'diagnostic', 'general',
        'release', 'financial', 'emergency', 'research'
    )),

    -- Content
    title TEXT NOT NULL,
    description TEXT,
    content_html TEXT NOT NULL, -- Rich text content with placeholders
    -- Placeholders: {{pet_name}}, {{owner_name}}, {{procedure}}, {{date}}, etc.

    -- Requirements
    requires_witness BOOLEAN DEFAULT FALSE,
    requires_id_verification BOOLEAN DEFAULT FALSE,
    requires_payment_acknowledgment BOOLEAN DEFAULT FALSE,
    min_age_to_sign INTEGER DEFAULT 18,

    -- Expiration
    validity_days INTEGER, -- NULL = never expires
    can_be_revoked BOOLEAN DEFAULT TRUE,

    -- Language
    language TEXT DEFAULT 'es',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,

    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(COALESCE(tenant_id, 'GLOBAL'), code, version)
);

-- =============================================================================
-- B. CONSENT TEMPLATE FIELDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_template_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES consent_templates(id) ON DELETE CASCADE,

    -- Field info
    field_name TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN (
        'text', 'number', 'date', 'checkbox', 'radio', 'select', 'textarea', 'signature'
    )),

    -- Validation
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT,
    options JSONB, -- For select/radio: [{"value": "", "label": ""}]
    validation_regex TEXT,
    min_length INTEGER,
    max_length INTEGER,

    -- Display
    display_order INTEGER DEFAULT 0,
    help_text TEXT,
    placeholder TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- C. CONSENT DOCUMENTS (Signed consents)
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES consent_templates(id) ON DELETE SET NULL,

    -- Document number
    document_number TEXT NOT NULL,

    -- Related entities
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,

    -- Content (snapshot at time of signing)
    template_version INTEGER,
    rendered_content_html TEXT NOT NULL,
    field_values JSONB DEFAULT '{}',

    -- Signer info
    signer_name TEXT NOT NULL,
    signer_email TEXT,
    signer_phone TEXT,
    signer_id_type TEXT, -- cedula, passport, license
    signer_id_number TEXT,
    signer_relationship TEXT, -- owner, authorized_representative, guardian

    -- Signature
    signature_type TEXT NOT NULL CHECK (signature_type IN (
        'digital', 'typed', 'drawn', 'biometric', 'in_person'
    )),
    signature_data TEXT, -- Base64 image or typed name
    signature_hash TEXT, -- SHA256 hash for verification

    -- Witness (if required)
    witness_name TEXT,
    witness_signature_data TEXT,
    witness_signed_at TIMESTAMPTZ,

    -- Staff who facilitated
    facilitated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Timestamps
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revocation_reason TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'pending', 'active', 'expired', 'revoked', 'superseded'
    )),

    -- Verification
    ip_address INET,
    user_agent TEXT,
    geolocation JSONB,

    -- PDF archive
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, document_number)
);

-- =============================================================================
-- D. CONSENT AUDIT LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_document_id UUID NOT NULL REFERENCES consent_documents(id) ON DELETE CASCADE,

    -- Action
    action TEXT NOT NULL CHECK (action IN (
        'created', 'viewed', 'signed', 'witnessed', 'revoked',
        'expired', 'pdf_generated', 'pdf_downloaded', 'emailed', 'printed'
    )),

    -- Who
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    performed_by_name TEXT,

    -- Details
    details JSONB DEFAULT '{}',

    -- Context
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- E. CONSENT REQUESTS (For remote signing)
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES consent_templates(id) ON DELETE CASCADE,

    -- Request info
    request_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),

    -- Related entities
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

    -- Recipient
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    recipient_phone TEXT,

    -- Pre-filled data
    prefilled_data JSONB DEFAULT '{}',

    -- Request details
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    reminder_sent_at TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'viewed', 'signed', 'expired', 'cancelled'
    )),

    -- Result
    consent_document_id UUID REFERENCES consent_documents(id) ON DELETE SET NULL,

    -- Notes
    message TEXT, -- Custom message to recipient

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- F. BLANKET CONSENTS (Standing authorizations)
-- =============================================================================

CREATE TABLE IF NOT EXISTS blanket_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Scope
    consent_type TEXT NOT NULL CHECK (consent_type IN (
        'emergency_treatment', 'routine_care', 'vaccination',
        'diagnostic_imaging', 'blood_work', 'medication',
        'minor_procedures', 'communication', 'photo_release'
    )),

    -- Which pets (NULL = all)
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,

    -- Limits
    max_amount DECIMAL(12,2), -- Maximum cost without additional consent
    valid_procedures TEXT[], -- Specific procedures allowed

    -- Validity
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Signature
    signature_data TEXT,
    consent_document_id UUID REFERENCES consent_documents(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, owner_id, consent_type, pet_id)
);

-- =============================================================================
-- G. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_consent_templates_tenant ON consent_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_templates_category ON consent_templates(category);
CREATE INDEX IF NOT EXISTS idx_consent_templates_active ON consent_templates(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_consent_template_fields_template ON consent_template_fields(template_id);

CREATE INDEX IF NOT EXISTS idx_consent_documents_tenant ON consent_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_pet ON consent_documents(pet_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_owner ON consent_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_status ON consent_documents(status);
CREATE INDEX IF NOT EXISTS idx_consent_documents_signed_at ON consent_documents(signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_documents_expires ON consent_documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consent_documents_appointment ON consent_documents(appointment_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_hospitalization ON consent_documents(hospitalization_id);

CREATE INDEX IF NOT EXISTS idx_consent_audit_document ON consent_audit_log(consent_document_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_action ON consent_audit_log(action);

CREATE INDEX IF NOT EXISTS idx_consent_requests_tenant ON consent_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_requests_token ON consent_requests(request_token);
CREATE INDEX IF NOT EXISTS idx_consent_requests_status ON consent_requests(status);
CREATE INDEX IF NOT EXISTS idx_consent_requests_expires ON consent_requests(expires_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_blanket_consents_tenant ON blanket_consents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blanket_consents_owner ON blanket_consents(owner_id);
CREATE INDEX IF NOT EXISTS idx_blanket_consents_pet ON blanket_consents(pet_id);
CREATE INDEX IF NOT EXISTS idx_blanket_consents_active ON blanket_consents(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- H. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_consent_templates_updated_at
    BEFORE UPDATE ON consent_templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_consent_documents_updated_at
    BEFORE UPDATE ON consent_documents
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_consent_requests_updated_at
    BEFORE UPDATE ON consent_requests
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_blanket_consents_updated_at
    BEFORE UPDATE ON blanket_consents
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- I. FUNCTIONS
-- =============================================================================

-- Generate consent document number
CREATE OR REPLACE FUNCTION generate_consent_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
BEGIN
    v_prefix := 'CON';
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(document_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM consent_documents
    WHERE tenant_id = p_tenant_id
      AND document_number LIKE v_prefix || v_year || '%';

    RETURN v_prefix || v_year || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Log consent action
CREATE OR REPLACE FUNCTION log_consent_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
        VALUES (NEW.id, 'created', auth.uid(), jsonb_build_object('template_id', NEW.template_id));

        IF NEW.status = 'active' THEN
            INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
            VALUES (NEW.id, 'signed', auth.uid(), jsonb_build_object('signer_name', NEW.signer_name));
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            IF NEW.status = 'revoked' THEN
                INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
                VALUES (NEW.id, 'revoked', auth.uid(), jsonb_build_object('reason', NEW.revocation_reason));
            ELSIF NEW.status = 'expired' THEN
                INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
                VALUES (NEW.id, 'expired', NULL, '{}');
            END IF;
        END IF;

        IF OLD.pdf_url IS NULL AND NEW.pdf_url IS NOT NULL THEN
            INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
            VALUES (NEW.id, 'pdf_generated', auth.uid(), jsonb_build_object('url', NEW.pdf_url));
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_document_audit
    AFTER INSERT OR UPDATE ON consent_documents
    FOR EACH ROW EXECUTE FUNCTION log_consent_action();

-- Check if consent exists for procedure
CREATE OR REPLACE FUNCTION check_consent_exists(
    p_pet_id UUID,
    p_consent_category TEXT,
    p_tenant_id TEXT
)
RETURNS TABLE (
    has_valid_consent BOOLEAN,
    consent_document_id UUID,
    signed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE,
        cd.id,
        cd.signed_at,
        cd.expires_at
    FROM consent_documents cd
    JOIN consent_templates ct ON cd.template_id = ct.id
    WHERE cd.pet_id = p_pet_id
      AND cd.tenant_id = p_tenant_id
      AND ct.category = p_consent_category
      AND cd.status = 'active'
      AND (cd.expires_at IS NULL OR cd.expires_at > NOW())
    ORDER BY cd.signed_at DESC
    LIMIT 1;

    -- If no specific consent, check blanket consent
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            TRUE,
            bc.consent_document_id,
            bc.granted_at,
            bc.expires_at
        FROM blanket_consents bc
        WHERE (bc.pet_id = p_pet_id OR bc.pet_id IS NULL)
          AND bc.tenant_id = p_tenant_id
          AND bc.consent_type = CASE p_consent_category
              WHEN 'surgery' THEN 'emergency_treatment'
              WHEN 'vaccination' THEN 'vaccination'
              WHEN 'diagnostic' THEN 'diagnostic_imaging'
              ELSE 'routine_care'
          END
          AND bc.is_active = TRUE
          AND (bc.expires_at IS NULL OR bc.expires_at > NOW())
        LIMIT 1;
    END IF;

    -- Return no consent found
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Expire old consents
CREATE OR REPLACE FUNCTION expire_old_consents()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE consent_documents
    SET status = 'expired'
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;

    UPDATE consent_requests
    SET status = 'expired'
    WHERE status IN ('pending', 'sent', 'viewed')
      AND expires_at < NOW();

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- J. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blanket_consents ENABLE ROW LEVEL SECURITY;

-- Consent Templates: Global visible to all, tenant-specific to staff
CREATE POLICY consent_templates_select ON consent_templates FOR SELECT TO authenticated
    USING (tenant_id IS NULL OR is_staff_of(tenant_id));

CREATE POLICY consent_templates_insert ON consent_templates FOR INSERT TO authenticated
    WITH CHECK (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

CREATE POLICY consent_templates_update ON consent_templates FOR UPDATE TO authenticated
    USING (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

-- Template Fields
CREATE POLICY consent_template_fields_select ON consent_template_fields FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM consent_templates t WHERE t.id = consent_template_fields.template_id
                AND (t.tenant_id IS NULL OR is_staff_of(t.tenant_id)))
    );

CREATE POLICY consent_template_fields_insert ON consent_template_fields FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM consent_templates t WHERE t.id = consent_template_fields.template_id
                AND t.tenant_id IS NOT NULL AND is_staff_of(t.tenant_id))
    );

-- Consent Documents: Staff manage, owners view their own
CREATE POLICY consent_documents_select_staff ON consent_documents FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY consent_documents_select_owner ON consent_documents FOR SELECT TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY consent_documents_insert ON consent_documents FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id) OR owner_id = auth.uid());

CREATE POLICY consent_documents_update ON consent_documents FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Audit Log: Staff only
CREATE POLICY consent_audit_log_select ON consent_audit_log FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM consent_documents cd WHERE cd.id = consent_audit_log.consent_document_id
                AND is_staff_of(cd.tenant_id))
    );

CREATE POLICY consent_audit_log_insert ON consent_audit_log FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM consent_documents cd WHERE cd.id = consent_audit_log.consent_document_id
                AND (is_staff_of(cd.tenant_id) OR cd.owner_id = auth.uid()))
    );

-- Consent Requests: Staff manage
CREATE POLICY consent_requests_select ON consent_requests FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY consent_requests_insert ON consent_requests FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY consent_requests_update ON consent_requests FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Blanket Consents: Staff and owners
CREATE POLICY blanket_consents_select_staff ON blanket_consents FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY blanket_consents_select_owner ON blanket_consents FOR SELECT TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY blanket_consents_insert ON blanket_consents FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id) OR owner_id = auth.uid());

CREATE POLICY blanket_consents_update ON blanket_consents FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id) OR owner_id = auth.uid());

-- =============================================================================
-- K. SEED CONSENT TEMPLATES
-- =============================================================================

INSERT INTO consent_templates (tenant_id, code, name, category, title, content_html, requires_witness, language) VALUES
(NULL, 'SURGERY_GENERAL', 'Consentimiento Quirúrgico General', 'surgery',
 'Consentimiento para Procedimiento Quirúrgico',
 '<h2>Consentimiento Informado para Cirugía</h2>
<p>Yo, <strong>{{owner_name}}</strong>, propietario/a de <strong>{{pet_name}}</strong>, autorizo al equipo veterinario de {{clinic_name}} a realizar el siguiente procedimiento quirúrgico:</p>
<p><strong>Procedimiento:</strong> {{procedure}}</p>
<p>Entiendo que:</p>
<ul>
<li>Toda cirugía conlleva riesgos, incluyendo pero no limitados a: reacciones a la anestesia, hemorragias, infecciones y en casos raros, la muerte.</li>
<li>Se me ha explicado el procedimiento y he tenido la oportunidad de hacer preguntas.</li>
<li>Autorizo cualquier procedimiento adicional que el veterinario considere necesario durante la cirugía.</li>
</ul>
<p>Declaro haber recibido información sobre los cuidados pre y post operatorios.</p>',
 TRUE, 'es'),

(NULL, 'ANESTHESIA', 'Consentimiento Anestésico', 'anesthesia',
 'Consentimiento para Anestesia',
 '<h2>Consentimiento para Procedimiento Anestésico</h2>
<p>Yo, <strong>{{owner_name}}</strong>, autorizo la administración de anestesia a mi mascota <strong>{{pet_name}}</strong>.</p>
<p>Entiendo los riesgos asociados con la anestesia y he informado al veterinario sobre cualquier condición de salud preexistente.</p>',
 FALSE, 'es'),

(NULL, 'EUTHANASIA', 'Consentimiento para Eutanasia', 'euthanasia',
 'Autorización para Eutanasia Humanitaria',
 '<h2>Consentimiento para Eutanasia</h2>
<p>Yo, <strong>{{owner_name}}</strong>, solicito y autorizo la eutanasia humanitaria de mi mascota <strong>{{pet_name}}</strong>.</p>
<p>Confirmo que:</p>
<ul>
<li>Esta decisión ha sido tomada de manera informada y voluntaria.</li>
<li>He tenido la oportunidad de discutir alternativas con el veterinario.</li>
<li>Entiendo que este procedimiento es irreversible.</li>
</ul>
<p><strong>Disposición de restos:</strong> {{disposition_choice}}</p>',
 TRUE, 'es'),

(NULL, 'BOARDING', 'Contrato de Hospedaje', 'boarding',
 'Contrato de Servicio de Hospedaje',
 '<h2>Contrato de Hospedaje</h2>
<p>Yo, <strong>{{owner_name}}</strong>, dejo a mi mascota <strong>{{pet_name}}</strong> bajo el cuidado de {{clinic_name}} durante el período:</p>
<p><strong>Desde:</strong> {{start_date}} <strong>Hasta:</strong> {{end_date}}</p>
<p>Autorizo el tratamiento médico de emergencia si fuera necesario y acepto los términos y condiciones del servicio de hospedaje.</p>',
 FALSE, 'es'),

(NULL, 'PHOTO_RELEASE', 'Autorización de Uso de Imagen', 'general',
 'Autorización para Uso de Fotografías',
 '<h2>Autorización de Uso de Imagen</h2>
<p>Yo, <strong>{{owner_name}}</strong>, autorizo a {{clinic_name}} a utilizar fotografías de mi mascota <strong>{{pet_name}}</strong> para fines promocionales, educativos y en redes sociales.</p>',
 FALSE, 'es')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- CONSENT SCHEMA COMPLETE
-- =============================================================================
