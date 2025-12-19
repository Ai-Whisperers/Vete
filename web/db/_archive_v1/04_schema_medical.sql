-- =============================================================================
-- 04_SCHEMA_MEDICAL.SQL
-- =============================================================================
-- Medical records, prescriptions, voice notes, and DICOM images.
-- =============================================================================

-- =============================================================================
-- A. MEDICAL RECORDS
-- =============================================================================
-- General medical history entries for pets.

CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    performed_by UUID REFERENCES profiles(id),

    -- Record Details
    type TEXT NOT NULL CHECK (type IN (
        'consultation', 'exam', 'surgery', 'hospitalization', 'wellness', 'other'
    )),
    title TEXT NOT NULL,
    diagnosis TEXT,
    diagnosis_code UUID REFERENCES diagnosis_codes(id),  -- Link to standardized code
    visit_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,

    -- Vitals (JSONB for flexibility)
    vitals JSONB,                           -- { weight, temp, hr, rr, bp }

    -- Attachments
    attachments TEXT[],                     -- Array of file URLs

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. PRESCRIPTIONS
-- =============================================================================
-- Digital prescriptions with drugs array and digital signature.

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES profiles(id),            -- Prescribing vet

    -- Prescription Content
    drugs JSONB NOT NULL DEFAULT '[]'::jsonb,       -- Array of drug objects
    notes TEXT,

    -- Digital Signature
    digital_signature_hash TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),

    -- QR Code for verification
    qr_code_url TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- C. VOICE NOTES
-- =============================================================================
-- Audio dictation with optional transcription.

CREATE TABLE IF NOT EXISTS voice_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Content
    note_text TEXT,                         -- Transcribed text
    audio_url TEXT,                         -- Storage URL

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. DICOM IMAGES
-- =============================================================================
-- Medical imaging (X-rays, ultrasounds, etc.)

CREATE TABLE IF NOT EXISTS dicom_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Image Details
    image_oid TEXT NOT NULL,                -- Object identifier or storage path
    modality TEXT,                          -- 'XR', 'US', 'CT', 'MRI'
    body_part TEXT,
    taken_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA MEDICAL COMPLETE
-- =============================================================================
