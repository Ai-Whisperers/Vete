-- =============================================================================
-- 22_SCHEMA_REMINDERS.SQL
-- =============================================================================
-- Reminder and notification system for vaccines, appointments, and follow-ups.
-- Supports multiple channels: SMS, Email, WhatsApp, Push notifications.
-- =============================================================================

-- =============================================================================
-- A. NOTIFICATION CHANNELS
-- =============================================================================
-- Available notification channels per tenant.

CREATE TABLE IF NOT EXISTS notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Channel Details
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    )),
    name TEXT NOT NULL,                     -- 'Email Principal', 'WhatsApp Business'

    -- Configuration (encrypted in production)
    config JSONB,                           -- API keys, sender info, etc.

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, channel_type)
);

-- =============================================================================
-- B. NOTIFICATION TEMPLATES
-- =============================================================================
-- Message templates for different reminder types.

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Template Details
    name TEXT NOT NULL,                     -- 'Vaccine Reminder', 'Appointment Confirmation'
    type TEXT NOT NULL CHECK (type IN (
        'vaccine_reminder', 'vaccine_overdue',
        'appointment_reminder', 'appointment_confirmation', 'appointment_cancelled',
        'invoice_sent', 'payment_received', 'payment_overdue',
        'birthday', 'follow_up', 'lab_results_ready',
        'hospitalization_update', 'custom'
    )),
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    )),

    -- Content
    subject TEXT,                           -- For email
    body TEXT NOT NULL,                     -- Message body with {{variables}}

    -- Variables available: {{pet_name}}, {{owner_name}}, {{clinic_name}},
    -- {{vaccine_name}}, {{due_date}}, {{appointment_date}}, {{appointment_time}}

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, type, channel_type)
);

-- Seed default templates
INSERT INTO notification_templates (tenant_id, name, type, channel_type, subject, body) VALUES
    -- Vaccine Reminders
    ('adris', 'Recordatorio de Vacuna', 'vaccine_reminder', 'sms',
     NULL, 'Hola {{owner_name}}! Recordatorio: {{pet_name}} tiene su vacuna {{vaccine_name}} programada para el {{due_date}}. Veterinaria Adris.'),
    ('adris', 'Recordatorio de Vacuna', 'vaccine_reminder', 'email',
     'Recordatorio de Vacuna para {{pet_name}}',
     'Estimado/a {{owner_name}},\n\nLe recordamos que {{pet_name}} tiene programada su vacuna {{vaccine_name}} para el {{due_date}}.\n\nPor favor, contáctenos para agendar su cita.\n\nSaludos,\nVeterinaria Adris'),
    ('adris', 'Vacuna Vencida', 'vaccine_overdue', 'sms',
     NULL, 'IMPORTANTE: {{pet_name}} tiene la vacuna {{vaccine_name}} vencida desde {{due_date}}. Contacte a Veterinaria Adris para programar.'),

    -- Appointment Reminders
    ('adris', 'Confirmación de Cita', 'appointment_confirmation', 'sms',
     NULL, 'Cita confirmada para {{pet_name}} el {{appointment_date}} a las {{appointment_time}}. Veterinaria Adris.'),
    ('adris', 'Recordatorio de Cita', 'appointment_reminder', 'sms',
     NULL, 'Recordatorio: Mañana {{pet_name}} tiene cita a las {{appointment_time}}. Veterinaria Adris.'),

    -- Birthday
    ('adris', 'Feliz Cumpleaños', 'birthday', 'sms',
     NULL, '🎂 Feliz cumpleaños {{pet_name}}! De parte de todo el equipo de Veterinaria Adris.')
ON CONFLICT (tenant_id, type, channel_type) DO NOTHING;

-- =============================================================================
-- C. CLIENT NOTIFICATION PREFERENCES
-- =============================================================================
-- Per-client preferences for how they want to be contacted.

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Preferences by Type
    vaccine_reminders BOOLEAN DEFAULT TRUE,
    appointment_reminders BOOLEAN DEFAULT TRUE,
    payment_reminders BOOLEAN DEFAULT TRUE,
    promotional BOOLEAN DEFAULT FALSE,
    birthday_greetings BOOLEAN DEFAULT TRUE,

    -- Preferred Channels (ordered by preference)
    preferred_channels TEXT[] DEFAULT ARRAY['sms', 'email'],

    -- Contact Info Override
    preferred_phone TEXT,
    preferred_email TEXT,

    -- Timing
    reminder_days_before INTEGER DEFAULT 3,     -- Days before due date
    reminder_time TIME DEFAULT '09:00:00',      -- Preferred time to receive

    -- Quiet Hours
    quiet_start TIME DEFAULT '21:00:00',
    quiet_end TIME DEFAULT '08:00:00',

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(client_id)
);

-- =============================================================================
-- D. REMINDERS
-- =============================================================================
-- Scheduled reminders to be sent.

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Target
    client_id UUID NOT NULL REFERENCES profiles(id),
    pet_id UUID REFERENCES pets(id),

    -- Reminder Type
    type TEXT NOT NULL CHECK (type IN (
        'vaccine_reminder', 'vaccine_overdue',
        'appointment_reminder', 'appointment_confirmation', 'appointment_cancelled',
        'invoice_sent', 'payment_received', 'payment_overdue',
        'birthday', 'follow_up', 'lab_results_ready',
        'hospitalization_update', 'custom'
    )),

    -- Reference
    reference_type TEXT,                    -- 'vaccine', 'appointment', 'invoice'
    reference_id UUID,                      -- ID of the related record

    -- Schedule
    scheduled_at TIMESTAMPTZ NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'sent', 'failed', 'cancelled', 'skipped'
    )),

    -- Attempts
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMPTZ,
    next_attempt_at TIMESTAMPTZ,

    -- Error Tracking
    error_message TEXT,

    -- Custom Content (overrides template)
    custom_subject TEXT,
    custom_body TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. NOTIFICATION QUEUE
-- =============================================================================
-- Actual messages ready to be sent.

CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    reminder_id UUID REFERENCES reminders(id) ON DELETE SET NULL,

    -- Recipient
    client_id UUID NOT NULL REFERENCES profiles(id),

    -- Channel
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    )),

    -- Destination
    destination TEXT NOT NULL,              -- Phone number or email

    -- Content
    subject TEXT,
    body TEXT NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'
    )),

    -- Tracking
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,                  -- For email tracking
    clicked_at TIMESTAMPTZ,

    -- Error
    error_code TEXT,
    error_message TEXT,

    -- External Reference
    external_id TEXT,                       -- Twilio SID, SendGrid ID, etc.

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. NOTIFICATION LOG
-- =============================================================================
-- Historical log of all sent notifications.

CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    queue_id UUID REFERENCES notification_queue(id),
    reminder_id UUID REFERENCES reminders(id),

    -- Details
    client_id UUID NOT NULL REFERENCES profiles(id),
    channel_type TEXT NOT NULL,
    destination TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,

    -- Result
    status TEXT NOT NULL,                   -- 'sent', 'delivered', 'failed', 'bounced'
    error_message TEXT,

    -- Timing
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,

    -- Cost (for SMS/WhatsApp tracking)
    cost NUMERIC(10,4),
    currency TEXT DEFAULT 'PYG'
);

-- =============================================================================
-- G. AUTO-REMINDER RULES
-- =============================================================================
-- Automatic reminder generation rules.

CREATE TABLE IF NOT EXISTS reminder_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Rule Details
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'vaccine_due', 'vaccine_overdue',
        'appointment_before', 'birthday',
        'follow_up_after_visit', 'wellness_checkup'
    )),

    -- Timing
    days_offset INTEGER NOT NULL,           -- Days before (-) or after (+) trigger
    time_of_day TIME DEFAULT '09:00:00',

    -- Channels
    channels TEXT[] DEFAULT ARRAY['sms'],

    -- Conditions
    conditions JSONB,                       -- Species, vaccine type, etc.

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default rules
INSERT INTO reminder_rules (tenant_id, name, type, days_offset, channels) VALUES
    ('adris', 'Recordatorio 7 días antes', 'vaccine_due', -7, ARRAY['email']),
    ('adris', 'Recordatorio 3 días antes', 'vaccine_due', -3, ARRAY['sms']),
    ('adris', 'Recordatorio 1 día antes', 'vaccine_due', -1, ARRAY['sms', 'whatsapp']),
    ('adris', 'Vacuna vencida', 'vaccine_overdue', 1, ARRAY['sms']),
    ('adris', 'Vacuna muy vencida', 'vaccine_overdue', 7, ARRAY['sms', 'email']),
    ('adris', 'Recordatorio cita día anterior', 'appointment_before', -1, ARRAY['sms']),
    ('adris', 'Recordatorio cita 2 horas', 'appointment_before', 0, ARRAY['sms']),
    ('adris', 'Cumpleaños mascota', 'birthday', 0, ARRAY['sms'])
ON CONFLICT DO NOTHING;

-- =============================================================================
-- H. FUNCTION: Generate Vaccine Reminders
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_vaccine_reminders()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_rule RECORD;
    v_vaccine RECORD;
    v_scheduled_at TIMESTAMPTZ;
BEGIN
    -- Loop through active rules
    FOR v_rule IN
        SELECT * FROM reminder_rules
        WHERE is_active = TRUE AND type IN ('vaccine_due', 'vaccine_overdue')
    LOOP
        -- Find vaccines matching the rule
        FOR v_vaccine IN
            SELECT v.*, p.owner_id, p.name as pet_name, p.tenant_id
            FROM vaccines v
            JOIN pets p ON v.pet_id = p.id
            WHERE p.tenant_id = v_rule.tenant_id
            AND v.status = 'pending'
            AND v.next_due_date IS NOT NULL
            AND v.next_due_date + (v_rule.days_offset || ' days')::INTERVAL = CURRENT_DATE
        LOOP
            -- Check if reminder already exists
            IF NOT EXISTS (
                SELECT 1 FROM reminders
                WHERE reference_type = 'vaccine'
                AND reference_id = v_vaccine.id
                AND type = v_rule.type
                AND DATE(scheduled_at) = CURRENT_DATE
            ) THEN
                -- Calculate scheduled time
                v_scheduled_at := CURRENT_DATE + v_rule.time_of_day;

                -- Create reminder
                INSERT INTO reminders (
                    tenant_id, client_id, pet_id, type,
                    reference_type, reference_id, scheduled_at
                ) VALUES (
                    v_vaccine.tenant_id, v_vaccine.owner_id, v_vaccine.pet_id,
                    CASE WHEN v_rule.days_offset < 0 THEN 'vaccine_reminder' ELSE 'vaccine_overdue' END,
                    'vaccine', v_vaccine.id, v_scheduled_at
                );

                v_count := v_count + 1;
            END IF;
        END LOOP;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- I. FUNCTION: Generate Appointment Reminders
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_appointment_reminders()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_appointment RECORD;
BEGIN
    -- 24-hour reminder
    FOR v_appointment IN
        SELECT a.*, p.owner_id, p.name as pet_name
        FROM appointments a
        JOIN pets p ON a.pet_id = p.id
        WHERE a.status = 'confirmed'
        AND DATE(a.start_time) = CURRENT_DATE + INTERVAL '1 day'
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM reminders
            WHERE reference_type = 'appointment'
            AND reference_id = v_appointment.id
            AND type = 'appointment_reminder'
        ) THEN
            INSERT INTO reminders (
                tenant_id, client_id, pet_id, type,
                reference_type, reference_id, scheduled_at
            ) VALUES (
                v_appointment.tenant_id, v_appointment.owner_id, v_appointment.pet_id,
                'appointment_reminder', 'appointment', v_appointment.id,
                NOW() + INTERVAL '1 hour'
            );
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- J. FUNCTION: Process Reminder Queue
-- =============================================================================

CREATE OR REPLACE FUNCTION process_pending_reminders()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_reminder RECORD;
    v_template RECORD;
    v_prefs RECORD;
    v_channel TEXT;
    v_destination TEXT;
    v_body TEXT;
    v_subject TEXT;
    v_pet RECORD;
    v_client RECORD;
    v_tenant RECORD;
BEGIN
    FOR v_reminder IN
        SELECT r.*, p.name as pet_name, p.species
        FROM reminders r
        LEFT JOIN pets p ON r.pet_id = p.id
        WHERE r.status = 'pending'
        AND r.scheduled_at <= NOW()
        AND (r.next_attempt_at IS NULL OR r.next_attempt_at <= NOW())
        ORDER BY r.scheduled_at
        LIMIT 100
    LOOP
        -- Get client preferences
        SELECT * INTO v_prefs FROM notification_preferences WHERE client_id = v_reminder.client_id;

        -- Get client info
        SELECT * INTO v_client FROM profiles WHERE id = v_reminder.client_id;

        -- Get tenant info
        SELECT * INTO v_tenant FROM tenants WHERE id = v_reminder.tenant_id;

        -- Determine channel
        IF v_prefs IS NOT NULL AND array_length(v_prefs.preferred_channels, 1) > 0 THEN
            v_channel := v_prefs.preferred_channels[1];
        ELSE
            v_channel := 'sms';
        END IF;

        -- Get template
        SELECT * INTO v_template
        FROM notification_templates
        WHERE tenant_id = v_reminder.tenant_id
        AND type = v_reminder.type
        AND channel_type = v_channel
        AND is_active = TRUE;

        IF v_template IS NULL THEN
            -- No template, skip
            UPDATE reminders SET status = 'skipped', error_message = 'No template found' WHERE id = v_reminder.id;
            CONTINUE;
        END IF;

        -- Get destination
        IF v_channel = 'email' THEN
            v_destination := COALESCE(v_prefs.preferred_email, v_client.email);
        ELSE
            v_destination := COALESCE(v_prefs.preferred_phone, v_client.phone);
        END IF;

        IF v_destination IS NULL THEN
            UPDATE reminders SET status = 'skipped', error_message = 'No destination' WHERE id = v_reminder.id;
            CONTINUE;
        END IF;

        -- Replace variables in template
        v_body := v_template.body;
        v_body := REPLACE(v_body, '{{pet_name}}', COALESCE(v_reminder.pet_name, ''));
        v_body := REPLACE(v_body, '{{owner_name}}', COALESCE(v_client.full_name, ''));
        v_body := REPLACE(v_body, '{{clinic_name}}', COALESCE(v_tenant.name, ''));

        v_subject := v_template.subject;
        IF v_subject IS NOT NULL THEN
            v_subject := REPLACE(v_subject, '{{pet_name}}', COALESCE(v_reminder.pet_name, ''));
        END IF;

        -- Add to queue
        INSERT INTO notification_queue (
            tenant_id, reminder_id, client_id, channel_type,
            destination, subject, body
        ) VALUES (
            v_reminder.tenant_id, v_reminder.id, v_reminder.client_id, v_channel,
            v_destination, v_subject, v_body
        );

        -- Update reminder status
        UPDATE reminders
        SET status = 'processing', attempts = attempts + 1, last_attempt_at = NOW()
        WHERE id = v_reminder.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- K. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_notification_templates_tenant ON notification_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_client ON notification_preferences(client_id);

CREATE INDEX IF NOT EXISTS idx_reminders_tenant ON reminders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reminders_client ON reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_reference ON reminders(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant ON notification_queue(tenant_id);

CREATE INDEX IF NOT EXISTS idx_notification_log_client ON notification_log(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent ON notification_log(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_reminder_rules_tenant ON reminder_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reminder_rules_active ON reminder_rules(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- L. RLS POLICIES
-- =============================================================================

ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;

-- Channels & Templates: Staff only
CREATE POLICY "Staff manage notification channels" ON notification_channels FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Staff manage notification templates" ON notification_templates FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Staff manage reminder rules" ON reminder_rules FOR ALL USING (public.is_staff_of(tenant_id));

-- Preferences: Users manage own
CREATE POLICY "Users manage own preferences" ON notification_preferences FOR ALL USING (client_id = auth.uid());
CREATE POLICY "Staff view preferences" ON notification_preferences FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('vet', 'admin'))
);

-- Reminders: Staff manage, clients view own
CREATE POLICY "Staff manage reminders" ON reminders FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own reminders" ON reminders FOR SELECT USING (client_id = auth.uid());

-- Queue: Staff only
CREATE POLICY "Staff manage notification queue" ON notification_queue FOR ALL USING (public.is_staff_of(tenant_id));

-- Log: Staff view, clients view own
CREATE POLICY "Staff view notification log" ON notification_log FOR SELECT USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own notification log" ON notification_log FOR SELECT USING (client_id = auth.uid());

-- =============================================================================
-- REMINDERS SCHEMA COMPLETE
-- =============================================================================
