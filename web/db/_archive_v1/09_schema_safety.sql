-- =============================================================================
-- 09_SCHEMA_SAFETY.SQL
-- =============================================================================
-- Pet safety features: QR codes for collars and lost & found registry.
-- =============================================================================

-- =============================================================================
-- A. PET QR CODES
-- =============================================================================
-- Digital QR codes for pet identification (different from physical qr_tags).
-- Stored in Supabase Storage with metadata here.

CREATE TABLE IF NOT EXISTS pet_qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- QR Code
    qr_code_url TEXT NOT NULL,              -- Storage URL
    qr_data TEXT NOT NULL,                  -- JSON payload with pet ID + emergency contact

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Only one active QR per pet
    CONSTRAINT pet_qr_codes_one_active UNIQUE(pet_id, is_active)
);

-- =============================================================================
-- B. LOST PETS REGISTRY
-- =============================================================================
-- Public registry for lost and found pets.

CREATE TABLE IF NOT EXISTS lost_pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Reporter
    reported_by UUID NOT NULL REFERENCES profiles(id),

    -- Status
    status TEXT DEFAULT 'lost'
        CHECK (status IN ('lost', 'found', 'reunited')),

    -- Last Seen Info
    last_seen_location TEXT,
    last_seen_date DATE,
    last_seen_time TIME,

    -- Finder Info (when status = 'found')
    finder_contact TEXT,
    finder_notes TEXT,

    -- Notes
    notes TEXT,

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA SAFETY COMPLETE
-- =============================================================================
