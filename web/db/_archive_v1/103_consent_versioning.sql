-- =============================================================================
-- 103_CONSENT_VERSIONING.SQL
-- =============================================================================
-- Consent template version history tracking
-- =============================================================================

-- Add version parent tracking to consent_templates
ALTER TABLE consent_templates
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES consent_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS change_summary TEXT;

-- Create index for finding current version
CREATE INDEX IF NOT EXISTS idx_consent_templates_current
ON consent_templates(tenant_id, code, is_current) WHERE is_current = TRUE;

-- Create index for version history
CREATE INDEX IF NOT EXISTS idx_consent_templates_parent
ON consent_templates(parent_id);

-- =============================================================================
-- FUNCTION: Create new version of template
-- =============================================================================

CREATE OR REPLACE FUNCTION create_consent_template_version(
    p_template_id UUID,
    p_content_html TEXT,
    p_change_summary TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_template consent_templates%ROWTYPE;
    v_new_id UUID;
    v_new_version INTEGER;
BEGIN
    -- Get current template
    SELECT * INTO v_template FROM consent_templates WHERE id = p_template_id;

    IF v_template IS NULL THEN
        RAISE EXCEPTION 'Template not found';
    END IF;

    -- Calculate new version
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_new_version
    FROM consent_templates
    WHERE tenant_id = v_template.tenant_id AND code = v_template.code;

    -- Mark old version as not current
    UPDATE consent_templates
    SET is_current = FALSE
    WHERE tenant_id = v_template.tenant_id
      AND code = v_template.code
      AND is_current = TRUE;

    -- Insert new version
    INSERT INTO consent_templates (
        tenant_id, code, name, category, title, description,
        content_html, requires_witness, requires_id_verification,
        requires_payment_acknowledgment, min_age_to_sign,
        validity_days, can_be_revoked, language, is_active,
        version, parent_id, is_current, published_at, change_summary,
        created_by
    )
    VALUES (
        v_template.tenant_id, v_template.code, v_template.name, v_template.category,
        v_template.title, v_template.description,
        p_content_html, v_template.requires_witness, v_template.requires_id_verification,
        v_template.requires_payment_acknowledgment, v_template.min_age_to_sign,
        v_template.validity_days, v_template.can_be_revoked, v_template.language,
        TRUE, -- is_active
        v_new_version, v_template.id, TRUE, NOW(), p_change_summary,
        auth.uid()
    )
    RETURNING id INTO v_new_id;

    -- Copy fields to new version
    INSERT INTO consent_template_fields (
        template_id, field_name, field_label, field_type,
        is_required, default_value, options, validation_regex,
        min_length, max_length, display_order, help_text, placeholder
    )
    SELECT
        v_new_id, field_name, field_label, field_type,
        is_required, default_value, options, validation_regex,
        min_length, max_length, display_order, help_text, placeholder
    FROM consent_template_fields
    WHERE template_id = p_template_id;

    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION: Get template version history
-- =============================================================================

CREATE OR REPLACE FUNCTION get_consent_template_versions(p_template_id UUID)
RETURNS TABLE (
    id UUID,
    version INTEGER,
    is_current BOOLEAN,
    published_at TIMESTAMPTZ,
    change_summary TEXT,
    created_by_name TEXT,
    created_at TIMESTAMPTZ,
    documents_count BIGINT
) AS $$
DECLARE
    v_template consent_templates%ROWTYPE;
BEGIN
    -- Get template info
    SELECT * INTO v_template FROM consent_templates WHERE id = p_template_id;

    IF v_template IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        ct.id,
        ct.version,
        ct.is_current,
        ct.published_at,
        ct.change_summary,
        p.full_name AS created_by_name,
        ct.created_at,
        (SELECT COUNT(*) FROM consent_documents cd WHERE cd.template_id = ct.id) AS documents_count
    FROM consent_templates ct
    LEFT JOIN profiles p ON ct.created_by = p.id
    WHERE ct.tenant_id = v_template.tenant_id AND ct.code = v_template.code
    ORDER BY ct.version DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Update existing templates to have is_current = TRUE
-- =============================================================================

UPDATE consent_templates
SET is_current = TRUE, published_at = created_at
WHERE is_current IS NULL OR is_current = FALSE;

-- Only keep highest version as current for each code
WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY tenant_id, code ORDER BY version DESC) as rn
    FROM consent_templates
)
UPDATE consent_templates ct
SET is_current = FALSE
FROM ranked r
WHERE ct.id = r.id AND r.rn > 1;

-- =============================================================================
-- CONSENT VERSIONING COMPLETE
-- =============================================================================
