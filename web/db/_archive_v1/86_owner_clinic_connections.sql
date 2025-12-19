-- =============================================================================
-- 85_OWNER_CLINIC_CONNECTIONS.SQL
-- =============================================================================
-- Functions for implicit owner-clinic connections.
-- An owner is "connected" to a clinic if they have any interaction with it:
-- - Has a pet registered at that clinic
-- - Has booked an appointment at that clinic
-- - Has started a conversation with that clinic
-- =============================================================================

-- =============================================================================
-- A. IS_OWNER_CONNECTED_TO_CLINIC
-- =============================================================================
-- Checks if an owner has any interaction with a specific clinic.
-- Used to determine if clinic staff can access owner's data.

CREATE OR REPLACE FUNCTION public.is_owner_connected_to_clinic(
    p_owner_id UUID,
    p_clinic_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        -- Has a pet registered at this clinic
        SELECT 1 FROM pets
        WHERE owner_id = p_owner_id
        AND tenant_id = p_clinic_id
        AND deleted_at IS NULL
    ) OR EXISTS (
        -- Has booked an appointment at this clinic
        SELECT 1 FROM appointments
        WHERE user_id = p_owner_id
        AND tenant_id = p_clinic_id
    ) OR EXISTS (
        -- Has started a conversation with this clinic
        SELECT 1 FROM conversations
        WHERE client_id = p_owner_id
        AND tenant_id = p_clinic_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- B. GET_CONNECTED_OWNER_IDS
-- =============================================================================
-- Returns all owner IDs that are connected to a specific clinic.
-- Used by staff to query all accessible owners.

CREATE OR REPLACE FUNCTION public.get_connected_owner_ids(
    p_clinic_id TEXT
)
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT owner_id FROM (
        -- Owners with pets at this clinic
        SELECT owner_id FROM pets
        WHERE tenant_id = p_clinic_id
        AND deleted_at IS NULL

        UNION

        -- Owners with appointments at this clinic
        SELECT user_id AS owner_id FROM appointments
        WHERE tenant_id = p_clinic_id

        UNION

        -- Owners with conversations at this clinic
        SELECT client_id AS owner_id FROM conversations
        WHERE tenant_id = p_clinic_id
    ) AS connected_owners;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. GET_CONNECTED_PETS_FOR_CLINIC
-- =============================================================================
-- Returns all pets accessible to a clinic through connected owners.
-- This includes ALL pets of connected owners, not just those registered at the clinic.

CREATE OR REPLACE FUNCTION public.get_connected_pets_for_clinic(
    p_clinic_id TEXT
)
RETURNS TABLE (
    id UUID,
    owner_id UUID,
    tenant_id TEXT,
    name TEXT,
    species TEXT,
    breed TEXT,
    weight_kg NUMERIC,
    photo_url TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.owner_id,
        p.tenant_id,
        p.name,
        p.species,
        p.breed,
        p.weight_kg,
        p.photo_url,
        p.created_at
    FROM pets p
    WHERE p.deleted_at IS NULL
    AND p.owner_id IN (SELECT get_connected_owner_ids(p_clinic_id))
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON FUNCTION public.is_owner_connected_to_clinic IS
'Checks if an owner has any interaction (pet, appointment, conversation) with a clinic';

COMMENT ON FUNCTION public.get_connected_owner_ids IS
'Returns all owner IDs connected to a clinic through any interaction';

COMMENT ON FUNCTION public.get_connected_pets_for_clinic IS
'Returns all pets accessible to a clinic through connected owners';

-- =============================================================================
-- OWNER CLINIC CONNECTIONS COMPLETE
-- =============================================================================
