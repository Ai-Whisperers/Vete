-- =============================================================================
-- 50_RLS_POLICIES_COMPLETE.SQL
-- =============================================================================
-- Complete RLS policies for all tables missing row-level security.
-- This migration addresses TICKET-DB-001 from TICKETS.md.
-- =============================================================================

-- =============================================================================
-- A. LABORATORY TABLES
-- =============================================================================

-- A1. LAB_TEST_CATALOG
ALTER TABLE lab_test_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read lab test catalog" ON lab_test_catalog;
CREATE POLICY "Public can read lab test catalog" ON lab_test_catalog
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage tenant lab tests" ON lab_test_catalog;
CREATE POLICY "Staff can manage tenant lab tests" ON lab_test_catalog
    FOR ALL USING (
        tenant_id IS NULL  -- Global templates are read-only via SELECT policy
        OR public.is_staff_of(tenant_id)
    );

-- A2. LAB_TEST_PANELS
ALTER TABLE lab_test_panels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view lab panels" ON lab_test_panels;
CREATE POLICY "Staff can view lab panels" ON lab_test_panels
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage lab panels" ON lab_test_panels;
CREATE POLICY "Staff can manage lab panels" ON lab_test_panels
    FOR ALL USING (public.is_staff_of(tenant_id));

-- A3. LAB_PANEL_TESTS
ALTER TABLE lab_panel_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage panel tests" ON lab_panel_tests;
CREATE POLICY "Staff can manage panel tests" ON lab_panel_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_test_panels
            WHERE lab_test_panels.id = lab_panel_tests.panel_id
            AND public.is_staff_of(lab_test_panels.tenant_id)
        )
    );

-- A4. LAB_REFERENCE_RANGES
ALTER TABLE lab_reference_ranges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read reference ranges" ON lab_reference_ranges;
CREATE POLICY "Public can read reference ranges" ON lab_reference_ranges
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage reference ranges" ON lab_reference_ranges;
CREATE POLICY "Staff can manage reference ranges" ON lab_reference_ranges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_test_catalog
            WHERE lab_test_catalog.id = lab_reference_ranges.test_id
            AND (
                lab_test_catalog.tenant_id IS NULL
                OR public.is_staff_of(lab_test_catalog.tenant_id)
            )
        )
    );

-- A5. LAB_ORDERS
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own pet lab orders" ON lab_orders;
CREATE POLICY "Owners can view own pet lab orders" ON lab_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = lab_orders.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage lab orders" ON lab_orders;
CREATE POLICY "Staff can manage lab orders" ON lab_orders
    FOR ALL USING (public.is_staff_of(tenant_id));

-- A6. LAB_ORDER_ITEMS
ALTER TABLE lab_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own lab order items" ON lab_order_items;
CREATE POLICY "Owners can view own lab order items" ON lab_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            JOIN pets ON pets.id = lab_orders.pet_id
            WHERE lab_orders.id = lab_order_items.lab_order_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage lab order items" ON lab_order_items;
CREATE POLICY "Staff can manage lab order items" ON lab_order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            WHERE lab_orders.id = lab_order_items.lab_order_id
            AND public.is_staff_of(lab_orders.tenant_id)
        )
    );

-- A7. LAB_RESULTS
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own lab results" ON lab_results;
CREATE POLICY "Owners can view own lab results" ON lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            JOIN pets ON pets.id = lab_orders.pet_id
            WHERE lab_orders.id = lab_results.lab_order_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage lab results" ON lab_results;
CREATE POLICY "Staff can manage lab results" ON lab_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            WHERE lab_orders.id = lab_results.lab_order_id
            AND public.is_staff_of(lab_orders.tenant_id)
        )
    );

-- A8. EXTERNAL_LAB_ORDERS
ALTER TABLE external_lab_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage external lab orders" ON external_lab_orders;
CREATE POLICY "Staff can manage external lab orders" ON external_lab_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            WHERE lab_orders.id = external_lab_orders.order_id
            AND public.is_staff_of(lab_orders.tenant_id)
        )
    );

-- =============================================================================
-- B. HOSPITALIZATION TABLES
-- =============================================================================

-- B1. KENNELS
ALTER TABLE kennels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view kennels" ON kennels;
CREATE POLICY "Staff can view kennels" ON kennels
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage kennels" ON kennels;
CREATE POLICY "Staff can manage kennels" ON kennels
    FOR ALL USING (public.is_staff_of(tenant_id));

-- B2. HOSPITALIZATIONS
ALTER TABLE hospitalizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own pet hospitalizations" ON hospitalizations;
CREATE POLICY "Owners can view own pet hospitalizations" ON hospitalizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = hospitalizations.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalizations" ON hospitalizations;
CREATE POLICY "Staff can manage hospitalizations" ON hospitalizations
    FOR ALL USING (public.is_staff_of(tenant_id));

-- B3. HOSPITALIZATION_VISITS
ALTER TABLE hospitalization_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own hospitalization visits" ON hospitalization_visits;
CREATE POLICY "Owners can view own hospitalization visits" ON hospitalization_visits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            JOIN pets ON pets.id = hospitalizations.pet_id
            WHERE hospitalizations.id = hospitalization_visits.hospitalization_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalization visits" ON hospitalization_visits;
CREATE POLICY "Staff can manage hospitalization visits" ON hospitalization_visits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            WHERE hospitalizations.id = hospitalization_visits.hospitalization_id
            AND public.is_staff_of(hospitalizations.tenant_id)
        )
    );

-- B4. HOSPITALIZATION_VITALS
ALTER TABLE hospitalization_vitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own hospitalization vitals" ON hospitalization_vitals;
CREATE POLICY "Owners can view own hospitalization vitals" ON hospitalization_vitals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            JOIN pets ON pets.id = hospitalizations.pet_id
            WHERE hospitalizations.id = hospitalization_vitals.hospitalization_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalization vitals" ON hospitalization_vitals;
CREATE POLICY "Staff can manage hospitalization vitals" ON hospitalization_vitals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            WHERE hospitalizations.id = hospitalization_vitals.hospitalization_id
            AND public.is_staff_of(hospitalizations.tenant_id)
        )
    );

-- B5. HOSPITALIZATION_MEDICATIONS
ALTER TABLE hospitalization_medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own hospitalization medications" ON hospitalization_medications;
CREATE POLICY "Owners can view own hospitalization medications" ON hospitalization_medications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            JOIN pets ON pets.id = hospitalizations.pet_id
            WHERE hospitalizations.id = hospitalization_medications.hospitalization_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalization medications" ON hospitalization_medications;
CREATE POLICY "Staff can manage hospitalization medications" ON hospitalization_medications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            WHERE hospitalizations.id = hospitalization_medications.hospitalization_id
            AND public.is_staff_of(hospitalizations.tenant_id)
        )
    );

-- B6. HOSPITALIZATION_PROCEDURES
ALTER TABLE hospitalization_procedures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own hospitalization procedures" ON hospitalization_procedures;
CREATE POLICY "Owners can view own hospitalization procedures" ON hospitalization_procedures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            JOIN pets ON pets.id = hospitalizations.pet_id
            WHERE hospitalizations.id = hospitalization_procedures.hospitalization_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalization procedures" ON hospitalization_procedures;
CREATE POLICY "Staff can manage hospitalization procedures" ON hospitalization_procedures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            WHERE hospitalizations.id = hospitalization_procedures.hospitalization_id
            AND public.is_staff_of(hospitalizations.tenant_id)
        )
    );

-- B7. HOSPITALIZATION_FEEDING_LOG
ALTER TABLE hospitalization_feeding_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own feeding log" ON hospitalization_feeding_log;
CREATE POLICY "Owners can view own feeding log" ON hospitalization_feeding_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            JOIN pets ON pets.id = hospitalizations.pet_id
            WHERE hospitalizations.id = hospitalization_feeding_log.hospitalization_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage feeding log" ON hospitalization_feeding_log;
CREATE POLICY "Staff can manage feeding log" ON hospitalization_feeding_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            WHERE hospitalizations.id = hospitalization_feeding_log.hospitalization_id
            AND public.is_staff_of(hospitalizations.tenant_id)
        )
    );

-- B8. HOSPITALIZATION_BILLING
ALTER TABLE hospitalization_billing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own hospitalization billing" ON hospitalization_billing;
CREATE POLICY "Owners can view own hospitalization billing" ON hospitalization_billing
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            JOIN pets ON pets.id = hospitalizations.pet_id
            WHERE hospitalizations.id = hospitalization_billing.hospitalization_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalization billing" ON hospitalization_billing;
CREATE POLICY "Staff can manage hospitalization billing" ON hospitalization_billing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            WHERE hospitalizations.id = hospitalization_billing.hospitalization_id
            AND public.is_staff_of(hospitalizations.tenant_id)
        )
    );

-- =============================================================================
-- C. CONSENT TABLES
-- =============================================================================

-- C1. CONSENT_TEMPLATES
ALTER TABLE consent_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read consent templates" ON consent_templates;
CREATE POLICY "Public can read consent templates" ON consent_templates
    FOR SELECT USING (
        is_active = TRUE
        AND (
            tenant_id IS NULL  -- Global templates
            OR EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.tenant_id = consent_templates.tenant_id
            )
        )
    );

DROP POLICY IF EXISTS "Staff can manage consent templates" ON consent_templates;
CREATE POLICY "Staff can manage consent templates" ON consent_templates
    FOR ALL USING (
        tenant_id IS NULL  -- Global templates read-only
        OR public.is_staff_of(tenant_id)
    );

-- C2. CONSENT_TEMPLATE_FIELDS
ALTER TABLE consent_template_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view template fields" ON consent_template_fields;
CREATE POLICY "Users can view template fields" ON consent_template_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM consent_templates
            WHERE consent_templates.id = consent_template_fields.template_id
            AND (
                consent_templates.tenant_id IS NULL
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.tenant_id = consent_templates.tenant_id
                )
            )
        )
    );

DROP POLICY IF EXISTS "Staff can manage template fields" ON consent_template_fields;
CREATE POLICY "Staff can manage template fields" ON consent_template_fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM consent_templates
            WHERE consent_templates.id = consent_template_fields.template_id
            AND public.is_staff_of(consent_templates.tenant_id)
        )
    );

-- C3. CONSENT_DOCUMENTS
ALTER TABLE consent_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own consent documents" ON consent_documents;
CREATE POLICY "Owners can view own consent documents" ON consent_documents
    FOR SELECT USING (
        signer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = consent_documents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create consent documents" ON consent_documents;
CREATE POLICY "Owners can create consent documents" ON consent_documents
    FOR INSERT WITH CHECK (
        signer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = consent_documents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage consent documents" ON consent_documents;
CREATE POLICY "Staff can manage consent documents" ON consent_documents
    FOR ALL USING (public.is_staff_of(tenant_id));

-- C4. CONSENT_SIGNATURES
ALTER TABLE consent_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own signatures" ON consent_signatures;
CREATE POLICY "Users can view own signatures" ON consent_signatures
    FOR SELECT USING (
        signer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM consent_documents
            WHERE consent_documents.id = consent_signatures.consent_document_id
            AND public.is_staff_of(consent_documents.tenant_id)
        )
    );

DROP POLICY IF EXISTS "Users can create own signatures" ON consent_signatures;
CREATE POLICY "Users can create own signatures" ON consent_signatures
    FOR INSERT WITH CHECK (signer_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage signatures" ON consent_signatures;
CREATE POLICY "Staff can manage signatures" ON consent_signatures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM consent_documents
            WHERE consent_documents.id = consent_signatures.consent_document_id
            AND public.is_staff_of(consent_documents.tenant_id)
        )
    );

-- C5. CONSENT_REQUESTS
ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own consent requests" ON consent_requests;
CREATE POLICY "Owners can view own consent requests" ON consent_requests
    FOR SELECT USING (
        requester_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = consent_requests.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage consent requests" ON consent_requests;
CREATE POLICY "Staff can manage consent requests" ON consent_requests
    FOR ALL USING (public.is_staff_of(tenant_id));

-- C6. BLANKET_CONSENTS
ALTER TABLE blanket_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own blanket consents" ON blanket_consents;
CREATE POLICY "Owners can view own blanket consents" ON blanket_consents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = blanket_consents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create blanket consents" ON blanket_consents;
CREATE POLICY "Owners can create blanket consents" ON blanket_consents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = blanket_consents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can update own blanket consents" ON blanket_consents;
CREATE POLICY "Owners can update own blanket consents" ON blanket_consents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = blanket_consents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage blanket consents" ON blanket_consents;
CREATE POLICY "Staff can manage blanket consents" ON blanket_consents
    FOR ALL USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- D. MESSAGING TABLES
-- =============================================================================

-- D1. CONVERSATIONS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view own conversations" ON conversations;
CREATE POLICY "Clients can view own conversations" ON conversations
    FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Clients can create conversations" ON conversations;
CREATE POLICY "Clients can create conversations" ON conversations
    FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Clients can update own conversations" ON conversations;
CREATE POLICY "Clients can update own conversations" ON conversations
    FOR UPDATE USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage conversations" ON conversations;
CREATE POLICY "Staff can manage conversations" ON conversations
    FOR ALL USING (public.is_staff_of(tenant_id));

-- D2. MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.client_id = auth.uid()
                OR public.is_staff_of(conversations.tenant_id)
            )
        )
    );

DROP POLICY IF EXISTS "Users can send messages to own conversations" ON messages;
CREATE POLICY "Users can send messages to own conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.client_id = auth.uid()
                OR public.is_staff_of(conversations.tenant_id)
            )
        )
    );

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- D3. MESSAGE_TEMPLATES
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view message templates" ON message_templates;
CREATE POLICY "Staff can view message templates" ON message_templates
    FOR SELECT USING (
        tenant_id IS NULL  -- Global templates
        OR public.is_staff_of(tenant_id)
    );

DROP POLICY IF EXISTS "Staff can manage message templates" ON message_templates;
CREATE POLICY "Staff can manage message templates" ON message_templates
    FOR ALL USING (public.is_staff_of(tenant_id));

-- D4. BROADCAST_CAMPAIGNS
ALTER TABLE broadcast_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage broadcast campaigns" ON broadcast_campaigns;
CREATE POLICY "Staff can manage broadcast campaigns" ON broadcast_campaigns
    FOR ALL USING (public.is_staff_of(tenant_id));

-- D5. BROADCAST_RECIPIENTS
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage broadcast recipients" ON broadcast_recipients;
CREATE POLICY "Staff can manage broadcast recipients" ON broadcast_recipients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM broadcast_campaigns
            WHERE broadcast_campaigns.id = broadcast_recipients.campaign_id
            AND public.is_staff_of(broadcast_campaigns.tenant_id)
        )
    );

-- D6. MESSAGE_ATTACHMENTS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view attachments in own conversations" ON message_attachments;
CREATE POLICY "Users can view attachments in own conversations" ON message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages
            JOIN conversations ON conversations.id = messages.conversation_id
            WHERE messages.id = message_attachments.message_id
            AND (
                conversations.client_id = auth.uid()
                OR public.is_staff_of(conversations.tenant_id)
            )
        )
    );

DROP POLICY IF EXISTS "Users can create attachments for own messages" ON message_attachments;
CREATE POLICY "Users can create attachments for own messages" ON message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_attachments.message_id
            AND messages.sender_id = auth.uid()
        )
    );

-- =============================================================================
-- E. INSURANCE TABLES
-- =============================================================================

-- E1. INSURANCE_PROVIDERS
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read insurance providers" ON insurance_providers;
CREATE POLICY "Public can read insurance providers" ON insurance_providers
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Staff can manage insurance providers" ON insurance_providers;
CREATE POLICY "Staff can manage insurance providers" ON insurance_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- E2. PET_INSURANCE_POLICIES
ALTER TABLE pet_insurance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own pet insurance" ON pet_insurance_policies;
CREATE POLICY "Owners can view own pet insurance" ON pet_insurance_policies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_insurance_policies.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create pet insurance" ON pet_insurance_policies;
CREATE POLICY "Owners can create pet insurance" ON pet_insurance_policies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_insurance_policies.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can update own pet insurance" ON pet_insurance_policies;
CREATE POLICY "Owners can update own pet insurance" ON pet_insurance_policies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_insurance_policies.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage pet insurance" ON pet_insurance_policies;
CREATE POLICY "Staff can manage pet insurance" ON pet_insurance_policies
    FOR ALL USING (public.is_staff_of(tenant_id));

-- E3. INSURANCE_CLAIMS
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own insurance claims" ON insurance_claims;
CREATE POLICY "Owners can view own insurance claims" ON insurance_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = insurance_claims.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage insurance claims" ON insurance_claims;
CREATE POLICY "Staff can manage insurance claims" ON insurance_claims
    FOR ALL USING (public.is_staff_of(tenant_id));

-- E4. INSURANCE_CLAIM_ITEMS
ALTER TABLE insurance_claim_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own claim items" ON insurance_claim_items;
CREATE POLICY "Owners can view own claim items" ON insurance_claim_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            JOIN pets ON pets.id = insurance_claims.pet_id
            WHERE insurance_claims.id = insurance_claim_items.claim_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage claim items" ON insurance_claim_items;
CREATE POLICY "Staff can manage claim items" ON insurance_claim_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            WHERE insurance_claims.id = insurance_claim_items.claim_id
            AND public.is_staff_of(insurance_claims.tenant_id)
        )
    );

-- E5. INSURANCE_PRE_AUTHORIZATIONS
ALTER TABLE insurance_pre_authorizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own pre-authorizations" ON insurance_pre_authorizations;
CREATE POLICY "Owners can view own pre-authorizations" ON insurance_pre_authorizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = insurance_pre_authorizations.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage pre-authorizations" ON insurance_pre_authorizations;
CREATE POLICY "Staff can manage pre-authorizations" ON insurance_pre_authorizations
    FOR ALL USING (public.is_staff_of(tenant_id));

-- E6. INSURANCE_EOB
ALTER TABLE insurance_eob ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own EOBs" ON insurance_eob;
CREATE POLICY "Owners can view own EOBs" ON insurance_eob
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            JOIN pets ON pets.id = insurance_claims.pet_id
            WHERE insurance_claims.id = insurance_eob.claim_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage EOBs" ON insurance_eob;
CREATE POLICY "Staff can manage EOBs" ON insurance_eob
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            WHERE insurance_claims.id = insurance_eob.claim_id
            AND public.is_staff_of(insurance_claims.tenant_id)
        )
    );

-- =============================================================================
-- F. SYSTEM/BACKGROUND TABLES
-- =============================================================================

-- F1. SCHEDULED_JOB_LOG
ALTER TABLE scheduled_job_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view job logs" ON scheduled_job_log;
CREATE POLICY "Admins can view job logs" ON scheduled_job_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can insert job logs" ON scheduled_job_log;
CREATE POLICY "System can insert job logs" ON scheduled_job_log
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "System can update job logs" ON scheduled_job_log;
CREATE POLICY "System can update job logs" ON scheduled_job_log
    FOR UPDATE USING (TRUE);

-- F2. MATERIALIZED_VIEW_REFRESH_LOG
ALTER TABLE materialized_view_refresh_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view refresh logs" ON materialized_view_refresh_log;
CREATE POLICY "Admins can view refresh logs" ON materialized_view_refresh_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can insert refresh logs" ON materialized_view_refresh_log;
CREATE POLICY "System can insert refresh logs" ON materialized_view_refresh_log
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "System can update refresh logs" ON materialized_view_refresh_log;
CREATE POLICY "System can update refresh logs" ON materialized_view_refresh_log
    FOR UPDATE USING (TRUE);

-- =============================================================================
-- RLS POLICIES COMPLETE
-- =============================================================================

-- Summary of tables secured:
-- Laboratory: lab_test_catalog, lab_test_panels, lab_panel_tests, lab_reference_ranges,
--             lab_orders, lab_order_items, lab_results, external_lab_orders
-- Hospitalization: kennels, hospitalizations, hospitalization_visits, hospitalization_vitals,
--                  hospitalization_medications, hospitalization_procedures,
--                  hospitalization_feeding_log, hospitalization_billing
-- Consent: consent_templates, consent_template_fields, consent_documents,
--          consent_signatures, consent_requests, blanket_consents
-- Messaging: conversations, messages, message_templates, broadcast_campaigns,
--            broadcast_recipients, message_attachments
-- Insurance: insurance_providers, pet_insurance_policies, insurance_claims,
--            insurance_claim_items, insurance_pre_authorizations, insurance_eob
-- System: scheduled_job_log, materialized_view_refresh_log
