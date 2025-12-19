-- =============================================================================
-- 14_RLS_POLICIES.SQL
-- =============================================================================
-- Row Level Security policies for all tables.
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_patient_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dicom_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_dosages ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproductive_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE euthanasia_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_campaign_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- A. TENANTS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated can view tenants" ON tenants;
CREATE POLICY "Authenticated can view tenants" ON tenants
    FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================================================
-- B. PROFILES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can view all profiles in tenant" ON profiles;
CREATE POLICY "Staff can view all profiles in tenant" ON profiles
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view profile of pet owner with active QR" ON profiles;
CREATE POLICY "Public can view profile of pet owner with active QR" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            JOIN pet_qr_codes ON pet_qr_codes.pet_id = pets.id
            WHERE pets.owner_id = profiles.id
            AND pet_qr_codes.is_active = TRUE
        )
    );

-- =============================================================================
-- C. CLINIC INVITES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Admins manage invites" ON clinic_invites;
CREATE POLICY "Admins manage invites" ON clinic_invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
            AND tenant_id = clinic_invites.tenant_id
        )
    );

-- =============================================================================
-- D. PETS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can access own pets" ON pets;
CREATE POLICY "Owners can access own pets" ON pets
    FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Staff can access all pets in tenant" ON pets;
CREATE POLICY "Staff can access all pets in tenant" ON pets
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners can modify own pets" ON pets;
CREATE POLICY "Owners can modify own pets" ON pets
    FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Staff can modify all pets in tenant" ON pets;
CREATE POLICY "Staff can modify all pets in tenant" ON pets
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Public can view pets with active QR codes" ON pets;
CREATE POLICY "Public can view pets with active QR codes" ON pets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pet_qr_codes
            WHERE pet_qr_codes.pet_id = pets.id
            AND pet_qr_codes.is_active = TRUE
        )
    );

-- =============================================================================
-- E. VACCINE TEMPLATES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Public can read vaccine templates" ON vaccine_templates;
CREATE POLICY "Public can read vaccine templates" ON vaccine_templates
    FOR SELECT USING (TRUE);

-- =============================================================================
-- F. VACCINES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can access pet vaccines" ON vaccines;
CREATE POLICY "Owners can access pet vaccines" ON vaccines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccines.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage vaccines" ON vaccines;
CREATE POLICY "Staff can manage vaccines" ON vaccines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccines.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

DROP POLICY IF EXISTS "Owners can modify own pet vaccines" ON vaccines;
CREATE POLICY "Owners can modify own pet vaccines" ON vaccines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccines.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- G. VACCINE REACTIONS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view vaccine reactions" ON vaccine_reactions;
CREATE POLICY "Owners can view vaccine reactions" ON vaccine_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccine_reactions.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can insert vaccine reactions" ON vaccine_reactions;
CREATE POLICY "Owners can insert vaccine reactions" ON vaccine_reactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccine_reactions.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage vaccine reactions" ON vaccine_reactions;
CREATE POLICY "Staff can manage vaccine reactions" ON vaccine_reactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccine_reactions.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- H. QR TAGS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Public can view tags" ON qr_tags;
CREATE POLICY "Public can view tags" ON qr_tags
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Owner or staff can update tags" ON qr_tags;
CREATE POLICY "Owner or staff can update tags" ON qr_tags
    FOR UPDATE USING (
        pet_id IS NULL  -- Unassigned can be claimed
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = qr_tags.pet_id
            AND (pets.owner_id = auth.uid() OR public.is_staff_of(pets.tenant_id))
        )
    );

-- =============================================================================
-- I. CLINIC PATIENT ACCESS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can manage access" ON clinic_patient_access;
CREATE POLICY "Staff can manage access" ON clinic_patient_access
    FOR ALL USING (public.is_staff_of(clinic_id));

-- =============================================================================
-- J. MEDICAL RECORDS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view own pet records" ON medical_records;
CREATE POLICY "Owners can view own pet records" ON medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = medical_records.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage medical records" ON medical_records;
CREATE POLICY "Staff can manage medical records" ON medical_records
    FOR ALL USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- K. PRESCRIPTIONS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view prescriptions" ON prescriptions;
CREATE POLICY "Owners can view prescriptions" ON prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = prescriptions.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage prescriptions" ON prescriptions;
CREATE POLICY "Staff can manage prescriptions" ON prescriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = prescriptions.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- L. VOICE NOTES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view voice notes" ON voice_notes;
CREATE POLICY "Owners can view voice notes" ON voice_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = voice_notes.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage voice notes" ON voice_notes;
CREATE POLICY "Staff can manage voice notes" ON voice_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = voice_notes.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- M. DICOM IMAGES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view dicom images" ON dicom_images;
CREATE POLICY "Owners can view dicom images" ON dicom_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = dicom_images.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage dicom images" ON dicom_images;
CREATE POLICY "Staff can manage dicom images" ON dicom_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = dicom_images.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- N. REFERENCE DATA POLICIES (Public Read)
-- =============================================================================

DROP POLICY IF EXISTS "Public can read diagnosis codes" ON diagnosis_codes;
CREATE POLICY "Public can read diagnosis codes" ON diagnosis_codes
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can read drug dosages" ON drug_dosages;
CREATE POLICY "Public can read drug dosages" ON drug_dosages
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can read growth standards" ON growth_standards;
CREATE POLICY "Public can read growth standards" ON growth_standards
    FOR SELECT USING (TRUE);

-- =============================================================================
-- O. REPRODUCTIVE CYCLES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view reproductive cycles" ON reproductive_cycles;
CREATE POLICY "Owners can view reproductive cycles" ON reproductive_cycles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = reproductive_cycles.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage reproductive cycles" ON reproductive_cycles;
CREATE POLICY "Staff can manage reproductive cycles" ON reproductive_cycles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = reproductive_cycles.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- P. EUTHANASIA ASSESSMENTS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view euthanasia assessments" ON euthanasia_assessments;
CREATE POLICY "Owners can view euthanasia assessments" ON euthanasia_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = euthanasia_assessments.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage euthanasia assessments" ON euthanasia_assessments;
CREATE POLICY "Staff can manage euthanasia assessments" ON euthanasia_assessments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = euthanasia_assessments.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- Q. APPOINTMENTS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view own appointments" ON appointments;
CREATE POLICY "Owners can view own appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = appointments.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can book appointments" ON appointments;
CREATE POLICY "Owners can book appointments" ON appointments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = appointments.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can cancel own appointments" ON appointments;
CREATE POLICY "Owners can cancel own appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = appointments.pet_id
            AND pets.owner_id = auth.uid()
        )
    ) WITH CHECK (status = 'cancelled');

DROP POLICY IF EXISTS "Staff can view all appointments" ON appointments;
CREATE POLICY "Staff can view all appointments" ON appointments
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;
CREATE POLICY "Staff can manage appointments" ON appointments
    FOR ALL USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- R. STORE/INVENTORY POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can manage store categories" ON store_categories;
CREATE POLICY "Staff can manage store categories" ON store_categories
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant can view store categories" ON store_categories;
CREATE POLICY "Tenant can view store categories" ON store_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = store_categories.tenant_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage store products" ON store_products;
CREATE POLICY "Staff can manage store products" ON store_products
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant can view store products" ON store_products;
CREATE POLICY "Tenant can view store products" ON store_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = store_products.tenant_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage store inventory" ON store_inventory;
CREATE POLICY "Staff can manage store inventory" ON store_inventory
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage inventory transactions" ON store_inventory_transactions;
CREATE POLICY "Staff can manage inventory transactions" ON store_inventory_transactions
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage store campaigns" ON store_campaigns;
CREATE POLICY "Staff can manage store campaigns" ON store_campaigns
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant can view store campaigns" ON store_campaigns;
CREATE POLICY "Tenant can view store campaigns" ON store_campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = store_campaigns.tenant_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage campaign items" ON store_campaign_items;
CREATE POLICY "Staff can manage campaign items" ON store_campaign_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM store_campaigns
            WHERE store_campaigns.id = store_campaign_items.campaign_id
            AND public.is_staff_of(store_campaigns.tenant_id)
        )
    );

DROP POLICY IF EXISTS "Staff can view price history" ON store_price_history;
CREATE POLICY "Staff can view price history" ON store_price_history
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage products" ON products;
CREATE POLICY "Staff can manage products" ON products
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant can view products" ON products;
CREATE POLICY "Tenant can view products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = products.tenant_id
        )
    );

-- =============================================================================
-- S. FINANCE POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Admins can manage expenses" ON expenses;
CREATE POLICY "Admins can manage expenses" ON expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Staff can view expenses" ON expenses;
CREATE POLICY "Staff can view expenses" ON expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'vet')
        )
    );

DROP POLICY IF EXISTS "Users can view own loyalty points" ON loyalty_points;
CREATE POLICY "Users can view own loyalty points" ON loyalty_points
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage loyalty points" ON loyalty_points;
CREATE POLICY "Staff can manage loyalty points" ON loyalty_points
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('vet', 'admin')
        )
    );

DROP POLICY IF EXISTS "Owners can view loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Owners can view loyalty transactions" ON loyalty_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = loyalty_transactions.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Staff can manage loyalty transactions" ON loyalty_transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- T. SAFETY POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view own pet QR codes" ON pet_qr_codes;
CREATE POLICY "Owners can view own pet QR codes" ON pet_qr_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_qr_codes.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create QR codes for own pets" ON pet_qr_codes;
CREATE POLICY "Owners can create QR codes for own pets" ON pet_qr_codes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_qr_codes.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage QR codes" ON pet_qr_codes;
CREATE POLICY "Staff can manage QR codes" ON pet_qr_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN pets pt ON pt.tenant_id = p.tenant_id
            WHERE p.id = auth.uid()
            AND p.role IN ('vet', 'admin')
            AND pt.id = pet_qr_codes.pet_id
        )
    );

DROP POLICY IF EXISTS "Anyone can view active lost pets" ON lost_pets;
CREATE POLICY "Anyone can view active lost pets" ON lost_pets
    FOR SELECT USING (status IN ('lost', 'found'));

DROP POLICY IF EXISTS "Owners can report own pets as lost" ON lost_pets;
CREATE POLICY "Owners can report own pets as lost" ON lost_pets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = lost_pets.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can update own lost pet reports" ON lost_pets;
CREATE POLICY "Owners can update own lost pet reports" ON lost_pets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = lost_pets.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can update lost pet reports" ON lost_pets;
CREATE POLICY "Staff can update lost pet reports" ON lost_pets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN pets pt ON pt.tenant_id = p.tenant_id
            WHERE p.id = auth.uid()
            AND p.role IN ('vet', 'admin')
            AND pt.id = lost_pets.pet_id
        )
    );

-- =============================================================================
-- U. EPIDEMIOLOGY POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can view disease reports" ON disease_reports;
CREATE POLICY "Staff can view disease reports" ON disease_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES COMPLETE
-- =============================================================================
