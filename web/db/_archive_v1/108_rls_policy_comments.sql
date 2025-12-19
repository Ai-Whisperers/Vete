-- =============================================================================
-- 108_RLS_POLICY_COMMENTS.SQL
-- =============================================================================
-- Add documentation comments to RLS policies for better maintainability
-- and understanding of security rules
-- =============================================================================

-- =============================================================================
-- A. CORE TABLES
-- =============================================================================

-- Profiles policies
COMMENT ON POLICY "Users can view own profile" ON profiles IS
    'Users can only read their own profile data';

COMMENT ON POLICY "Users can update own profile" ON profiles IS
    'Users can only update their own profile data (name, phone, etc.)';

COMMENT ON POLICY "Staff can view tenant profiles" ON profiles IS
    'Staff members (vet, admin) can view all profiles within their tenant for client management';

-- Tenants policies
COMMENT ON POLICY "Anyone can view tenants" ON tenants IS
    'Tenant information (clinic names, IDs) is publicly readable for routing and public website display';

-- =============================================================================
-- B. PET MANAGEMENT
-- =============================================================================

-- Pets policies
COMMENT ON POLICY "Staff manage pets" ON pets IS
    'Staff members can perform all operations (create, read, update, delete) on pets within their tenant';

COMMENT ON POLICY "Owners view own pets" ON pets IS
    'Pet owners can view pets where they are the registered owner via the owner_id foreign key';

-- Vaccines policies
COMMENT ON POLICY "Staff manage vaccines" ON vaccines IS
    'Staff can create and manage vaccine records for all pets in their tenant';

COMMENT ON POLICY "Owners view pet vaccines" ON vaccines IS
    'Pet owners can view vaccine records for their own pets by joining through the pets table';

-- Medical records policies
COMMENT ON POLICY "Staff manage medical records" ON medical_records IS
    'Veterinarians and admins can create and view all medical records within their tenant';

COMMENT ON POLICY "Owners view pet medical records" ON medical_records IS
    'Pet owners can view medical records for their own pets (diagnosis, treatments, prescriptions)';

-- QR tags policies
COMMENT ON POLICY "Staff manage qr tags" ON qr_tags IS
    'Staff can create, assign, and deactivate QR tags for pet identification';

COMMENT ON POLICY "Anyone can read active qr tags" ON qr_tags IS
    'Active QR tags are publicly readable to enable lost pet scanning by anyone who finds the tag';

-- =============================================================================
-- C. SERVICES & APPOINTMENTS
-- =============================================================================

-- Services policies
COMMENT ON POLICY "Public can read services" ON services IS
    'Service catalog is publicly readable for booking UI - no authentication required';

COMMENT ON POLICY "Staff manage services" ON services IS
    'Only staff can create, update, or delete services (pricing, descriptions, availability)';

-- Appointments policies
COMMENT ON POLICY "Staff manage appointments" ON appointments IS
    'Staff can manage all appointments within their tenant - create, view, update status, cancel';

COMMENT ON POLICY "Owners view own appointments" ON appointments IS
    'Pet owners can view appointments for their own pets by joining through pets table';

COMMENT ON POLICY "Owners create appointments" ON appointments IS
    'Pet owners can create new appointments for their own pets via the booking system';

-- =============================================================================
-- D. INVOICING & PAYMENTS
-- =============================================================================

-- Invoices policies
COMMENT ON POLICY "Staff manage invoices" ON invoices IS
    'Staff can create and manage all invoices within their tenant - draft, send, record payments';

COMMENT ON POLICY "Clients view own invoices" ON invoices IS
    'Clients can view invoices where they are the billed party (client_id matches their profile)';

-- Invoice items policies
COMMENT ON POLICY "Staff manage invoice items" ON invoice_items IS
    'Staff can add, update, and remove line items from invoices within their tenant';

COMMENT ON POLICY "Clients view own invoice items" ON invoice_items IS
    'Clients can view line items for their own invoices by joining through invoices table';

-- Payments policies
COMMENT ON POLICY "Staff manage payments" ON payments IS
    'Staff can record and manage all payments within their tenant';

COMMENT ON POLICY "Clients view own payments" ON payments IS
    'Clients can view payment history for their own invoices';

-- =============================================================================
-- E. CLINICAL TOOLS
-- =============================================================================

-- Diagnosis codes policies
COMMENT ON POLICY "Public read diagnosis codes" ON diagnosis_codes IS
    'Diagnosis codes (VeNom/SNOMED) are publicly readable for clinical tool access';

COMMENT ON POLICY "Staff manage diagnosis codes" ON diagnosis_codes IS
    'Staff can add custom diagnosis codes for their tenant or update existing ones';

-- Drug dosages policies
COMMENT ON POLICY "Public read drug dosages" ON drug_dosages IS
    'Drug dosage calculations are publicly readable for clinical calculator tool';

COMMENT ON POLICY "Staff manage drug dosages" ON drug_dosages IS
    'Staff can add custom drug dosage protocols for their tenant';

-- Prescriptions policies
COMMENT ON POLICY "Staff manage prescriptions" ON prescriptions IS
    'Veterinarians can create and sign prescriptions for pets within their tenant';

COMMENT ON POLICY "Owners view pet prescriptions" ON prescriptions IS
    'Pet owners can view prescriptions issued for their own pets';

-- Growth standards policies
COMMENT ON POLICY "Public read growth standards" ON growth_standards IS
    'Growth chart data is publicly readable for the growth calculator tool';

-- Vaccine reactions policies
COMMENT ON POLICY "Staff manage vaccine reactions" ON vaccine_reactions IS
    'Staff can record and monitor adverse vaccine reactions for safety tracking';

COMMENT ON POLICY "Owners view pet vaccine reactions" ON vaccine_reactions IS
    'Pet owners can view vaccine reaction history for their own pets';

-- Euthanasia assessments policies
COMMENT ON POLICY "Staff manage euthanasia assessments" ON euthanasia_assessments IS
    'Veterinarians can create quality of life assessments (HHHHHMM scale) for end-of-life care decisions';

COMMENT ON POLICY "Owners view pet assessments" ON euthanasia_assessments IS
    'Pet owners can view quality of life assessments for their own pets';

-- =============================================================================
-- F. HOSPITALIZATION
-- =============================================================================

-- Kennels policies
COMMENT ON POLICY "Staff manage kennels" ON kennels IS
    'Staff can create, update, and manage kennel inventory and availability';

COMMENT ON POLICY "Public view available kennels" ON kennels IS
    'Available kennels are publicly viewable for hospitalization booking';

-- Hospitalizations policies
COMMENT ON POLICY "Staff manage hospitalizations" ON hospitalizations IS
    'Staff can admit, monitor, and discharge hospitalized patients';

COMMENT ON POLICY "Owners view pet hospitalizations" ON hospitalizations IS
    'Pet owners can view hospitalization records and status for their own pets';

-- Hospitalization vitals policies
COMMENT ON POLICY "Staff manage vitals" ON hospitalization_vitals IS
    'Staff can record vital signs (temp, HR, RR, pain score) for hospitalized patients';

COMMENT ON POLICY "Owners view pet vitals" ON hospitalization_vitals IS
    'Pet owners can view vital sign logs for their hospitalized pets';

-- =============================================================================
-- G. LABORATORY
-- =============================================================================

-- Lab test catalog policies
COMMENT ON POLICY "Public view lab tests" ON lab_test_catalog IS
    'Lab test catalog is publicly viewable for test ordering UI';

COMMENT ON POLICY "Staff manage lab tests" ON lab_test_catalog IS
    'Staff can add custom lab tests or update reference ranges for their tenant';

-- Lab orders policies
COMMENT ON POLICY "Staff manage lab orders" ON lab_orders IS
    'Staff can create lab orders and enter results for patients in their tenant';

COMMENT ON POLICY "Owners view pet lab orders" ON lab_orders IS
    'Pet owners can view lab orders and pending results for their own pets';

-- Lab results policies
COMMENT ON POLICY "Staff manage lab results" ON lab_results IS
    'Staff can enter and update lab result values and interpretations';

COMMENT ON POLICY "Owners view pet lab results" ON lab_results IS
    'Pet owners can view completed lab results for their own pets';

-- =============================================================================
-- H. STORE & INVENTORY
-- =============================================================================

-- Store products policies
COMMENT ON POLICY "Public view active products" ON store_products IS
    'Active store products are publicly viewable for e-commerce catalog';

COMMENT ON POLICY "Staff manage products" ON store_products IS
    'Staff can create, update, and manage product catalog and pricing';

-- Store inventory policies
COMMENT ON POLICY "Staff manage inventory" ON store_inventory IS
    'Staff can manage inventory levels, reorder points, and stock counts';

-- Store orders policies
COMMENT ON POLICY "Staff manage all orders" ON store_orders IS
    'Staff can view and manage all customer orders within their tenant';

COMMENT ON POLICY "Customers view own orders" ON store_orders IS
    'Customers can view their own order history and status';

COMMENT ON POLICY "Customers create orders" ON store_orders IS
    'Customers can create new orders through the e-commerce checkout flow';

-- =============================================================================
-- I. COMMUNICATIONS
-- =============================================================================

-- Conversations policies
COMMENT ON POLICY "Staff manage conversations" ON conversations IS
    'Staff can view and manage all client conversations within their tenant';

COMMENT ON POLICY "Clients view own conversations" ON conversations IS
    'Clients can view conversations where they are a participant';

-- Messages policies
COMMENT ON POLICY "Staff manage messages" ON messages IS
    'Staff can send and view all messages within their tenant conversations';

COMMENT ON POLICY "Clients view conversation messages" ON messages IS
    'Clients can view messages in their own conversations only';

COMMENT ON POLICY "Clients send messages" ON messages IS
    'Clients can send messages in their own conversations';

-- WhatsApp messages policies
COMMENT ON POLICY "Staff manage whatsapp" ON whatsapp_messages IS
    'Staff can send and view all WhatsApp messages for their tenant';

-- Reminders policies
COMMENT ON POLICY "Staff manage reminders" ON reminders IS
    'Staff can create and manage automated reminders (vaccines, appointments) for clients';

COMMENT ON POLICY "Clients view own reminders" ON reminders IS
    'Clients can view reminders sent to them';

-- =============================================================================
-- J. CONSENT MANAGEMENT
-- =============================================================================

-- Consent templates policies
COMMENT ON POLICY "Public view consent templates" ON consent_templates IS
    'Consent templates are publicly viewable for display during booking/admission flows';

COMMENT ON POLICY "Staff manage consent templates" ON consent_templates IS
    'Staff can create and update consent form templates with versioning';

-- Consent documents policies
COMMENT ON POLICY "Staff manage consent documents" ON consent_documents IS
    'Staff can create consent documents and record signatures';

COMMENT ON POLICY "Clients view own consents" ON consent_documents IS
    'Clients can view consent forms they have signed for their pets';

-- =============================================================================
-- K. INSURANCE
-- =============================================================================

-- Insurance policies (pet_insurance_policies table)
COMMENT ON POLICY "Staff manage insurance policies" ON pet_insurance_policies IS
    'Staff can manage insurance policies for pets within their tenant';

COMMENT ON POLICY "Owners view pet policies" ON pet_insurance_policies IS
    'Pet owners can view insurance policies for their own pets';

-- Insurance claims policies
COMMENT ON POLICY "Staff manage claims" ON insurance_claims IS
    'Staff can create and manage insurance claims for their tenant';

COMMENT ON POLICY "Owners view pet claims" ON insurance_claims IS
    'Pet owners can view insurance claims for their own pets';

-- =============================================================================
-- L. STAFF MANAGEMENT
-- =============================================================================

-- Staff profiles policies
COMMENT ON POLICY "Staff view tenant staff" ON staff_profiles IS
    'Staff can view other staff profiles within their tenant for scheduling and assignment';

-- Staff schedules policies
COMMENT ON POLICY "Staff manage schedules" ON staff_schedules IS
    'Staff can manage availability schedules for appointment booking system';

-- Staff time off policies
COMMENT ON POLICY "Staff manage time off" ON staff_time_off IS
    'Staff can request time off and view their own requests; admins can approve/reject';

-- =============================================================================
-- M. AUDIT & NOTIFICATIONS
-- =============================================================================

-- Audit logs policies
COMMENT ON POLICY "Staff view tenant audit logs" ON audit_logs IS
    'Staff can view audit logs for their tenant for compliance and security monitoring';

-- Notifications policies
COMMENT ON POLICY "Users view own notifications" ON notifications IS
    'Users can view notifications sent to them';

COMMENT ON POLICY "Users update own notifications" ON notifications IS
    'Users can mark their own notifications as read';

-- =============================================================================
-- N. SAFETY & EPIDEMIOLOGY
-- =============================================================================

-- Lost pets policies
COMMENT ON POLICY "Public view lost pets" ON lost_pets IS
    'Lost pet reports are publicly viewable to help reunite pets with owners';

COMMENT ON POLICY "Staff manage lost pets" ON lost_pets IS
    'Staff can create and update lost pet reports';

COMMENT ON POLICY "Owners manage own lost pets" ON lost_pets IS
    'Pet owners can report their own pets as lost or found';

-- Disease reports policies
COMMENT ON POLICY "Staff manage disease reports" ON disease_reports IS
    'Staff can create disease reports for epidemiological tracking and outbreak monitoring';

COMMENT ON POLICY "Public view aggregated disease data" ON disease_reports IS
    'Aggregated disease data (not individual records) is publicly viewable for health awareness';

-- =============================================================================
-- RLS POLICY DOCUMENTATION COMPLETE
-- =============================================================================
