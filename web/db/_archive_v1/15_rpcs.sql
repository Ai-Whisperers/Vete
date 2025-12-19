-- =============================================================================
-- 15_RPCS.SQL
-- =============================================================================
-- Remote Procedure Calls (RPCs) for complex operations.
-- =============================================================================

-- =============================================================================
-- A. GET_CLINIC_STATS
-- =============================================================================
-- Returns dashboard statistics for a clinic.

CREATE OR REPLACE FUNCTION public.get_clinic_stats(clinic_id TEXT)
RETURNS JSON AS $$
DECLARE
    total_pets INT;
    pending_vaccines INT;
    upcoming_appointments INT;
    is_staff BOOLEAN;
BEGIN
    SELECT public.is_staff_of(clinic_id) INTO is_staff;

    IF NOT is_staff THEN
        RETURN json_build_object('error', 'Unauthorized');
    END IF;

    SELECT COUNT(*) INTO total_pets
    FROM pets
    WHERE tenant_id = clinic_id;

    SELECT COUNT(*) INTO pending_vaccines
    FROM vaccines v
    JOIN pets p ON v.pet_id = p.id
    WHERE p.tenant_id = clinic_id
    AND v.status = 'pending';

    SELECT COUNT(*) INTO upcoming_appointments
    FROM appointments
    WHERE tenant_id = clinic_id
    AND start_time >= NOW()
    AND status = 'confirmed';

    RETURN json_build_object(
        'pets', total_pets,
        'pending_vaccines', pending_vaccines,
        'upcoming_appointments', upcoming_appointments
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- B. GET_PET_BY_TAG
-- =============================================================================
-- Public lookup of pet info by QR tag code.

CREATE OR REPLACE FUNCTION public.get_pet_by_tag(tag_code TEXT)
RETURNS JSON AS $$
DECLARE
    tag_record RECORD;
    pet_record RECORD;
    owner_record RECORD;
    vaccine_status TEXT := 'unknown';
BEGIN
    SELECT * INTO tag_record FROM qr_tags WHERE code = tag_code;

    IF tag_record IS NULL THEN
        RETURN json_build_object('status', 'not_found');
    END IF;

    IF tag_record.pet_id IS NULL THEN
        RETURN json_build_object('status', 'unassigned', 'code', tag_code);
    END IF;

    SELECT * INTO pet_record FROM pets WHERE id = tag_record.pet_id;
    SELECT full_name, phone INTO owner_record FROM profiles WHERE id = pet_record.owner_id;

    IF EXISTS (
        SELECT 1 FROM vaccines
        WHERE pet_id = pet_record.id
        AND status = 'verified'
        AND administered_date > (NOW() - INTERVAL '1 year')
    ) THEN
        vaccine_status := 'up_to_date';
    ELSE
        vaccine_status := 'needs_check';
    END IF;

    RETURN json_build_object(
        'status', 'assigned',
        'pet', json_build_object(
            'name', pet_record.name,
            'species', pet_record.species,
            'breed', pet_record.breed,
            'photo_url', pet_record.photo_url,
            'diet_notes', pet_record.diet_notes
        ),
        'owner', json_build_object(
            'name', owner_record.full_name,
            'phone', owner_record.phone
        ),
        'vaccine_status', vaccine_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. ASSIGN_TAG_TO_PET
-- =============================================================================
-- Assigns an unassigned QR tag to a pet.

CREATE OR REPLACE FUNCTION public.assign_tag_to_pet(tag_code TEXT, target_pet_id UUID)
RETURNS JSON AS $$
DECLARE
    tag_record RECORD;
BEGIN
    SELECT * INTO tag_record FROM qr_tags WHERE code = tag_code;

    IF tag_record IS NULL THEN
        RETURN json_build_object('error', 'Tag not found');
    END IF;

    IF tag_record.status != 'unassigned' THEN
        RETURN json_build_object('error', 'Tag already assigned');
    END IF;

    -- Check authorization
    IF NOT EXISTS (
        SELECT 1 FROM pets
        WHERE id = target_pet_id
        AND (owner_id = auth.uid() OR public.is_staff_of(tenant_id))
    ) THEN
        RETURN json_build_object('error', 'Unauthorized');
    END IF;

    UPDATE qr_tags
    SET pet_id = target_pet_id, status = 'active', updated_at = NOW()
    WHERE code = tag_code;

    RETURN json_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- D. GET_NETWORK_STATS
-- =============================================================================
-- Public network-wide statistics.

CREATE OR REPLACE FUNCTION public.get_network_stats()
RETURNS JSON AS $$
DECLARE
    total_pets INT;
    total_vaccines INT;
    top_species TEXT;
BEGIN
    SELECT COUNT(*) INTO total_pets FROM pets;
    SELECT COUNT(*) INTO total_vaccines FROM vaccines WHERE status = 'verified';
    SELECT species INTO top_species FROM pets GROUP BY species ORDER BY COUNT(*) DESC LIMIT 1;

    RETURN json_build_object(
        'total_pets', total_pets,
        'total_vaccines', total_vaccines,
        'most_popular_species', top_species
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- E. SEARCH_PETS_GLOBAL
-- =============================================================================
-- Global pet search with privacy protection.

CREATE OR REPLACE FUNCTION public.search_pets_global(search_query TEXT, requesting_clinic_id TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    species TEXT,
    breed TEXT,
    photo_url TEXT,
    microchip_id TEXT,
    tenant_id TEXT,
    owner_name TEXT,
    owner_phone TEXT,
    is_local BOOLEAN,
    has_access BOOLEAN
) AS $$
DECLARE
    is_authorized BOOLEAN;
BEGIN
    -- Verify requester is staff
    SELECT public.is_staff_of(requesting_clinic_id) INTO is_authorized;
    IF NOT is_authorized THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.species,
        p.breed,
        p.photo_url,
        p.microchip_id,
        p.tenant_id,
        CASE
            WHEN (p.tenant_id = requesting_clinic_id OR cpa.id IS NOT NULL) THEN pr.full_name
            ELSE 'Privacy Protected'::TEXT
        END AS owner_name,
        CASE
            WHEN (p.tenant_id = requesting_clinic_id OR cpa.id IS NOT NULL) THEN pr.phone
            ELSE NULL::TEXT
        END AS owner_phone,
        (p.tenant_id = requesting_clinic_id) AS is_local,
        (p.tenant_id = requesting_clinic_id OR cpa.id IS NOT NULL) AS has_access
    FROM pets p
    JOIN profiles pr ON p.owner_id = pr.id
    LEFT JOIN clinic_patient_access cpa ON cpa.pet_id = p.id AND cpa.clinic_id = requesting_clinic_id
    WHERE
        (p.name ILIKE '%' || search_query || '%' OR p.microchip_id ILIKE '%' || search_query || '%')
    ORDER BY is_local DESC, p.name ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- F. GRANT_CLINIC_ACCESS
-- =============================================================================
-- Grants a clinic access to a pet's records.

CREATE OR REPLACE FUNCTION public.grant_clinic_access(target_pet_id UUID, target_clinic_id TEXT)
RETURNS JSON AS $$
BEGIN
    -- Check if already local
    IF EXISTS (SELECT 1 FROM pets WHERE id = target_pet_id AND tenant_id = target_clinic_id) THEN
        RETURN json_build_object('status', 'already_local');
    END IF;

    INSERT INTO clinic_patient_access (clinic_id, pet_id, access_level)
    VALUES (target_clinic_id, target_pet_id, 'write')
    ON CONFLICT (clinic_id, pet_id) DO NOTHING;

    RETURN json_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- G. GET_CLIENT_PET_COUNTS
-- =============================================================================
-- Returns pet counts for a batch of client IDs (optimized aggregation).

CREATE OR REPLACE FUNCTION public.get_client_pet_counts(
    client_ids UUID[],
    p_tenant_id TEXT
)
RETURNS TABLE (
    owner_id UUID,
    pet_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.owner_id,
        COUNT(*)::BIGINT AS pet_count
    FROM pets p
    WHERE p.owner_id = ANY(client_ids)
      AND p.tenant_id = p_tenant_id
      AND p.deleted_at IS NULL
    GROUP BY p.owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- H. GET_CLIENT_LAST_APPOINTMENTS
-- =============================================================================
-- Returns last appointment date for a batch of client IDs (optimized aggregation).

CREATE OR REPLACE FUNCTION public.get_client_last_appointments(
    client_ids UUID[],
    p_tenant_id TEXT
)
RETURNS TABLE (
    owner_id UUID,
    last_appointment TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (p.owner_id)
        p.owner_id,
        a.start_time AS last_appointment
    FROM appointments a
    JOIN pets p ON a.pet_id = p.id
    WHERE p.owner_id = ANY(client_ids)
      AND a.tenant_id = p_tenant_id
      AND a.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY p.owner_id, a.start_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- RPCS COMPLETE
-- =============================================================================
