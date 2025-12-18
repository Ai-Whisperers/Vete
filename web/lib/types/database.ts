// =============================================================================
// DATABASE TYPES - Auto-generated from SQL schema
// =============================================================================
// These types match the Supabase database schema for type-safe queries.
// =============================================================================

// =============================================================================
// ENUMS
// =============================================================================

export type UserRole = 'owner' | 'vet' | 'admin';
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
export type PetSex = 'male' | 'female' | 'unknown';
export type PetTemperament = 'friendly' | 'shy' | 'aggressive' | 'nervous' | 'calm';
export type DietCategory = 'dry' | 'wet' | 'raw' | 'homemade' | 'prescription' | 'mixed' | 'balanced';

export type VaccineStatus = 'pending' | 'verified' | 'expired' | 'exempted';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type MedicalRecordType = 'consultation' | 'exam' | 'surgery' | 'vaccination' | 'emergency' | 'follow_up' | 'lab' | 'imaging' | 'dental' | 'grooming' | 'other';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check' | 'credit' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type ReminderType = 'vaccine' | 'appointment' | 'follow_up' | 'medication' | 'checkup' | 'custom';
export type ReminderStatus = 'pending' | 'sent' | 'acknowledged' | 'snoozed' | 'cancelled';
export type NotificationChannel = 'in_app' | 'sms' | 'whatsapp' | 'email' | 'push';

export type HospitalizationType = 'medical' | 'surgical' | 'boarding' | 'observation' | 'emergency' | 'quarantine';
export type HospitalizationStatus = 'active' | 'discharged' | 'transferred' | 'deceased' | 'escaped';
export type AcuityLevel = 'critical' | 'unstable' | 'stable' | 'improving' | 'ready_for_discharge';
export type KennelType = 'standard' | 'large' | 'small' | 'icu' | 'isolation' | 'exotic' | 'recovery';
export type KennelStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';

export type LabCategory = 'hematology' | 'chemistry' | 'urinalysis' | 'serology' | 'microbiology' | 'cytology' | 'histopathology' | 'parasitology' | 'endocrinology' | 'coagulation' | 'immunology' | 'toxicology' | 'genetics' | 'other';
export type LabOrderStatus = 'ordered' | 'specimen_collected' | 'in_progress' | 'completed' | 'partial' | 'cancelled' | 'rejected';
export type LabResultFlag = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high' | 'abnormal';

export type ConsentCategory = 'surgery' | 'anesthesia' | 'treatment' | 'euthanasia' | 'boarding' | 'grooming' | 'dental' | 'vaccination' | 'diagnostic' | 'general' | 'release' | 'financial' | 'emergency' | 'research';
export type ConsentStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'superseded';
export type SignatureType = 'digital' | 'typed' | 'drawn' | 'biometric' | 'in_person';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'volunteer';
export type EmploymentStatus = 'active' | 'on_leave' | 'suspended' | 'terminated';
export type ShiftType = 'regular' | 'overtime' | 'on_call' | 'emergency' | 'training' | 'meeting';
export type TimeOffRequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled' | 'withdrawn';

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'appointment_card' | 'invoice_card' | 'prescription_card' | 'system';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed' | 'spam';
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type InsuranceClaimType = 'accident' | 'illness' | 'wellness' | 'preventive' | 'emergency' | 'surgery' | 'hospitalization';
export type InsuranceClaimStatus = 'draft' | 'pending_documents' | 'submitted' | 'under_review' | 'approved' | 'partially_approved' | 'denied' | 'paid' | 'appealed' | 'closed';
export type InsurancePolicyStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';

// =============================================================================
// CORE TABLES
// =============================================================================

export interface Tenant {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  tenant_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ClinicInvite {
  id: string;
  tenant_id: string;
  email: string;
  role: UserRole;
  token: string;
  accepted_at: string | null;
  created_at: string;
}

// =============================================================================
// PETS & MEDICAL
// =============================================================================

export interface Pet {
  id: string;
  owner_id: string;
  tenant_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  birth_date: string | null;
  weight_kg: number | null;
  microchip_id: string | null;
  photo_url: string | null;
  sex: PetSex | null;
  color: string | null;
  is_neutered: boolean | null;
  temperament: PetTemperament | null;
  diet_category: DietCategory | null;
  diet_notes: string | null;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Vaccine {
  id: string;
  pet_id: string;
  name: string;
  administered_date: string | null;
  next_due_date: string | null;
  batch_number: string | null;
  manufacturer: string | null;
  administered_by: string | null;
  status: VaccineStatus;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface MedicalRecord {
  id: string;
  pet_id: string;
  tenant_id: string;
  performed_by: string | null;
  type: MedicalRecordType;
  title: string;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  attachments: string[] | null;
  vital_signs: Record<string, unknown> | null;
  weight_kg: number | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Prescription {
  id: string;
  pet_id: string;
  tenant_id: string;
  medical_record_id: string | null;
  prescribed_by: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  quantity: number | null;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  refills_remaining: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  pet_id: string;
  vet_id: string | null;
  created_by: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// =============================================================================
// INVOICING (21)
// =============================================================================

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  duration_minutes: number | null;
  is_active: boolean;
  tax_rate: number;
  requires_appointment: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  client_id: string;
  pet_id: string | null;
  invoice_number: string;
  appointment_id: string | null;
  medical_record_id: string | null;
  hospitalization_id: string | null;
  subtotal: number;
  discount_amount: number;
  discount_reason: string | null;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  internal_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total_price: number;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  status: PaymentStatus;
  paid_at: string;
  processed_by: string | null;
  notes: string | null;
  created_at: string;
  deleted_at?: string | null;
}

export interface Refund {
  id: string;
  tenant_id: string;
  payment_id: string;
  invoice_id: string;
  amount: number;
  reason: string;
  refund_method: PaymentMethod;
  refund_reference: string | null;
  status: PaymentStatus;
  refunded_at: string | null;
  processed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface ClientCredit {
  id: string;
  tenant_id: string;
  client_id: string;
  amount: number;
  reason: string;
  expires_at: string | null;
  used_amount: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// REMINDERS & NOTIFICATIONS (22)
// =============================================================================

export interface NotificationChannelConfig {
  id: string;
  tenant_id: string | null;
  channel_type: NotificationChannel;
  name: string;
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
}

export interface NotificationTemplate {
  id: string;
  tenant_id: string | null;
  channel_id: string;
  code: string;
  name: string;
  subject: string | null;
  body_template: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  tenant_id: string;
  pet_id: string;
  owner_id: string;
  reminder_type: ReminderType;
  title: string;
  message: string | null;
  due_date: string;
  status: ReminderStatus;
  snoozed_until: string | null;
  related_vaccine_id: string | null;
  related_appointment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueue {
  id: string;
  tenant_id: string;
  reminder_id: string | null;
  template_id: string | null;
  channel: NotificationChannel;
  recipient_id: string;
  recipient_contact: string;
  subject: string | null;
  body: string;
  variables: Record<string, unknown>;
  scheduled_for: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  sent_at: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
}

// =============================================================================
// HOSPITALIZATION (23)
// =============================================================================

export interface Kennel {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  location: string | null;
  kennel_type: KennelType;
  size_category: 'small' | 'medium' | 'large' | 'xlarge';
  max_weight_kg: number | null;
  species_allowed: string[];
  has_oxygen: boolean;
  has_heating: boolean;
  has_iv_pole: boolean;
  has_camera: boolean;
  daily_rate: number;
  icu_surcharge: number;
  is_active: boolean;
  current_status: KennelStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hospitalization {
  id: string;
  tenant_id: string;
  pet_id: string;
  kennel_id: string | null;
  hospitalization_number: string;
  hospitalization_type: HospitalizationType;
  admitted_at: string;
  expected_discharge_at: string | null;
  actual_discharge_at: string | null;
  admitted_by: string | null;
  discharged_by: string | null;
  primary_vet_id: string | null;
  admission_reason: string;
  admission_diagnosis: string | null;
  admission_weight_kg: number | null;
  discharge_diagnosis: string | null;
  discharge_weight_kg: number | null;
  discharge_instructions: string | null;
  treatment_plan: Record<string, unknown>;
  diet_instructions: string | null;
  feeding_schedule: Record<string, unknown>[];
  status: HospitalizationStatus;
  acuity_level: AcuityLevel;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  owner_consent_given: boolean;
  estimated_daily_cost: number | null;
  deposit_amount: number;
  deposit_paid: boolean;
  invoice_id: string | null;
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface HospitalizationVitals {
  id: string;
  hospitalization_id: string;
  recorded_by: string | null;
  recorded_at: string;
  temperature_celsius: number | null;
  heart_rate_bpm: number | null;
  respiratory_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  oxygen_saturation: number | null;
  weight_kg: number | null;
  pain_score: number | null;
  pain_location: string | null;
  hydration_status: 'normal' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration' | null;
  mental_status: 'alert' | 'responsive' | 'lethargic' | 'obtunded' | 'comatose' | null;
  appetite: 'normal' | 'decreased' | 'none' | 'increased' | null;
  observations: string | null;
  created_at: string;
}

export interface HospitalizationTreatment {
  id: string;
  hospitalization_id: string;
  treatment_type: 'medication' | 'procedure' | 'fluid_therapy' | 'feeding' | 'wound_care' | 'physical_therapy' | 'diagnostic' | 'other';
  treatment_name: string;
  scheduled_at: string;
  completed_at: string | null;
  scheduled_by: string | null;
  performed_by: string | null;
  dosage: string | null;
  route: string | null;
  quantity: number | null;
  unit: string | null;
  status: 'scheduled' | 'completed' | 'skipped' | 'refused' | 'held';
  skip_reason: string | null;
  response: string | null;
  adverse_reaction: boolean;
  adverse_reaction_details: string | null;
  is_billable: boolean;
  service_id: string | null;
  charge_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// LAB RESULTS (24)
// =============================================================================

export interface LabTestCatalog {
  id: string;
  tenant_id: string | null;
  code: string;
  name: string;
  category: LabCategory;
  description: string | null;
  specimen_type: string | null;
  specimen_requirements: string | null;
  turnaround_hours: number | null;
  is_in_house: boolean;
  base_price: number | null;
  external_lab_cost: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LabOrder {
  id: string;
  tenant_id: string;
  pet_id: string;
  order_number: string;
  ordered_at: string;
  ordered_by: string | null;
  medical_record_id: string | null;
  hospitalization_id: string | null;
  clinical_notes: string | null;
  fasting_status: 'fasted' | 'non_fasted' | 'unknown' | null;
  specimen_collected_at: string | null;
  specimen_collected_by: string | null;
  specimen_type: string | null;
  specimen_quality: 'adequate' | 'hemolyzed' | 'lipemic' | 'icteric' | 'clotted' | 'insufficient' | null;
  lab_type: 'in_house' | 'external';
  external_lab_name: string | null;
  external_lab_accession: string | null;
  sent_to_lab_at: string | null;
  status: LabOrderStatus;
  priority: 'stat' | 'urgent' | 'routine';
  results_received_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  has_critical_values: boolean;
  critical_values_acknowledged: boolean;
  invoice_id: string | null;
  total_cost: number | null;
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LabResult {
  id: string;
  lab_order_id: string;
  lab_order_item_id: string | null;
  test_id: string | null;
  component_name: string;
  result_type: 'numeric' | 'text' | 'positive_negative' | 'reactive_nonreactive' | 'detected_not_detected' | 'qualitative';
  numeric_value: number | null;
  text_value: string | null;
  unit: string | null;
  reference_range_id: string | null;
  range_low: number | null;
  range_high: number | null;
  flag: LabResultFlag | null;
  is_critical: boolean;
  method: string | null;
  instrument: string | null;
  entered_by: string | null;
  entered_at: string;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CONSENT (25)
// =============================================================================

export interface ConsentTemplate {
  id: string;
  tenant_id: string | null;
  code: string;
  name: string;
  category: ConsentCategory;
  title: string;
  description: string | null;
  content_html: string;
  requires_witness: boolean;
  requires_id_verification: boolean;
  requires_payment_acknowledgment: boolean;
  min_age_to_sign: number;
  validity_days: number | null;
  can_be_revoked: boolean;
  language: string;
  is_active: boolean;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsentDocument {
  id: string;
  tenant_id: string;
  template_id: string | null;
  document_number: string;
  pet_id: string | null;
  owner_id: string | null;
  appointment_id: string | null;
  hospitalization_id: string | null;
  invoice_id: string | null;
  medical_record_id: string | null;
  template_version: number | null;
  rendered_content_html: string;
  field_values: Record<string, unknown>;
  signer_name: string;
  signer_email: string | null;
  signer_phone: string | null;
  signer_id_type: string | null;
  signer_id_number: string | null;
  signer_relationship: string | null;
  signature_type: SignatureType;
  signature_data: string | null;
  signature_hash: string | null;
  witness_name: string | null;
  witness_signature_data: string | null;
  witness_signed_at: string | null;
  facilitated_by: string | null;
  signed_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revocation_reason: string | null;
  status: ConsentStatus;
  ip_address: string | null;
  user_agent: string | null;
  pdf_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// =============================================================================
// STAFF (26)
// =============================================================================

export interface StaffProfile {
  id: string;
  user_id: string;
  tenant_id: string;
  employee_id: string | null;
  hire_date: string | null;
  termination_date: string | null;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  job_title: string;
  department: string | null;
  specializations: string[] | null;
  license_number: string | null;
  license_expiry: string | null;
  preferred_shift: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible' | null;
  max_hours_per_week: number;
  can_work_weekends: boolean;
  can_work_holidays: boolean;
  work_phone: string | null;
  work_email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  hourly_rate: number | null;
  salary_type: 'hourly' | 'salary' | 'commission' | null;
  certifications: Record<string, unknown>[];
  skills: string[] | null;
  languages: string[];
  color_code: string;
  can_be_booked: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffShift {
  id: string;
  staff_profile_id: string;
  tenant_id: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  break_minutes: number;
  shift_type: ShiftType;
  location: string | null;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  clock_in_at: string | null;
  clock_out_at: string | null;
  clock_in_method: 'manual' | 'badge' | 'biometric' | 'app' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeOffRequest {
  id: string;
  staff_profile_id: string;
  tenant_id: string;
  time_off_type_id: string;
  start_date: string;
  end_date: string;
  start_half_day: boolean;
  end_half_day: boolean;
  total_days: number;
  total_hours: number | null;
  reason: string | null;
  attachment_url: string | null;
  status: TimeOffRequestStatus;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  coverage_notes: string | null;
  covering_staff_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffTask {
  id: string;
  tenant_id: string;
  assigned_to: string | null;
  assigned_by: string | null;
  title: string;
  description: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date: string | null;
  reminder_at: string | null;
  pet_id: string | null;
  appointment_id: string | null;
  hospitalization_id: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'deferred';
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// MESSAGING (27)
// =============================================================================

export interface Conversation {
  id: string;
  tenant_id: string;
  client_id: string;
  pet_id: string | null;
  subject: string | null;
  channel: NotificationChannel;
  status: ConversationStatus;
  priority: ConversationPriority;
  assigned_to: string | null;
  assigned_at: string | null;
  last_message_at: string | null;
  last_client_message_at: string | null;
  last_staff_message_at: string | null;
  client_last_read_at: string | null;
  staff_last_read_at: string | null;
  unread_client_count: number;
  unread_staff_count: number;
  appointment_id: string | null;
  medical_record_id: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: 'client' | 'staff' | 'system' | 'bot';
  sender_name: string | null;
  message_type: MessageType;
  content: string | null;
  content_html: string | null;
  attachments: Record<string, unknown>[];
  card_data: Record<string, unknown> | null;
  reply_to_id: string | null;
  status: MessageStatus;
  delivered_at: string | null;
  read_at: string | null;
  failed_reason: string | null;
  external_message_id: string | null;
  external_channel: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface MessageTemplate {
  id: string;
  tenant_id: string | null;
  code: string;
  name: string;
  category: 'appointment' | 'reminder' | 'follow_up' | 'marketing' | 'transactional' | 'welcome' | 'feedback' | 'custom';
  subject: string | null;
  content: string;
  content_html: string | null;
  variables: string[];
  channels: string[];
  sms_approved: boolean;
  whatsapp_template_id: string | null;
  language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BroadcastCampaign {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  template_id: string | null;
  subject: string | null;
  content: string;
  content_html: string | null;
  channel: NotificationChannel;
  audience_type: 'all_clients' | 'pet_species' | 'pet_breed' | 'last_visit' | 'no_visit' | 'vaccine_due' | 'custom_list' | 'segment';
  audience_filter: Record<string, unknown>;
  scheduled_at: string | null;
  sent_at: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed';
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunicationPreferences {
  id: string;
  user_id: string;
  tenant_id: string | null;
  allow_sms: boolean;
  allow_whatsapp: boolean;
  allow_email: boolean;
  allow_in_app: boolean;
  allow_push: boolean;
  preferred_phone: string | null;
  preferred_email: string | null;
  whatsapp_number: string | null;
  allow_appointment_reminders: boolean;
  allow_vaccine_reminders: boolean;
  allow_marketing: boolean;
  allow_feedback_requests: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  preferred_language: string;
  timezone: string;
  unsubscribed_at: string | null;
  unsubscribe_reason: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// INSURANCE (28)
// =============================================================================

export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  website: string | null;
  claims_phone: string | null;
  claims_email: string | null;
  claims_fax: string | null;
  claims_address: string | null;
  api_endpoint: string | null;
  supports_electronic_claims: boolean;
  supports_pre_auth: boolean;
  provider_portal_url: string | null;
  claim_submission_method: 'manual' | 'email' | 'fax' | 'portal' | 'api';
  typical_processing_days: number;
  requires_itemized_invoice: boolean;
  requires_medical_records: boolean;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PetInsurancePolicy {
  id: string;
  tenant_id: string;
  pet_id: string;
  provider_id: string;
  policy_number: string;
  group_number: string | null;
  member_id: string | null;
  policyholder_name: string;
  policyholder_phone: string | null;
  policyholder_email: string | null;
  policyholder_address: string | null;
  effective_date: string;
  expiration_date: string | null;
  enrollment_date: string | null;
  plan_name: string | null;
  plan_type: 'accident_only' | 'accident_illness' | 'comprehensive' | 'wellness' | 'custom' | null;
  annual_limit: number | null;
  per_incident_limit: number | null;
  lifetime_limit: number | null;
  deductible_amount: number | null;
  deductible_type: 'annual' | 'per_incident' | 'per_condition';
  coinsurance_percentage: number | null;
  copay_amount: number | null;
  accident_waiting_period: number;
  illness_waiting_period: number;
  orthopedic_waiting_period: number;
  pre_existing_conditions: string[] | null;
  excluded_conditions: string[] | null;
  coverage_notes: string | null;
  status: InsurancePolicyStatus;
  verified_at: string | null;
  verified_by: string | null;
  policy_document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsuranceClaim {
  id: string;
  tenant_id: string;
  policy_id: string;
  pet_id: string;
  claim_number: string | null;
  provider_claim_number: string | null;
  invoice_id: string | null;
  medical_record_id: string | null;
  hospitalization_id: string | null;
  claim_type: InsuranceClaimType;
  date_of_service: string;
  diagnosis: string;
  diagnosis_code: string | null;
  treatment_description: string;
  total_charges: number;
  claimed_amount: number;
  deductible_applied: number;
  coinsurance_amount: number;
  approved_amount: number | null;
  paid_amount: number | null;
  adjustment_amount: number;
  adjustment_reason: string | null;
  status: InsuranceClaimStatus;
  submitted_at: string | null;
  acknowledged_at: string | null;
  processed_at: string | null;
  paid_at: string | null;
  closed_at: string | null;
  submission_method: 'email' | 'fax' | 'portal' | 'api' | 'mail' | null;
  confirmation_number: string | null;
  payment_method: 'check' | 'eft' | 'credit' | null;
  payment_reference: string | null;
  payment_to: 'clinic' | 'policyholder' | null;
  denial_reason: string | null;
  denial_code: string | null;
  can_appeal: boolean;
  appeal_deadline: string | null;
  submitted_by: string | null;
  processed_by: string | null;
  internal_notes: string | null;
  provider_notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// DASHBOARD / MATERIALIZED VIEWS
// =============================================================================

export interface ClinicDashboardStats {
  tenant_id: string;
  clinic_name: string;
  total_pets: number;
  total_dogs: number;
  total_cats: number;
  total_other: number;
  total_clients: number;
  today_appointments: number;
  today_confirmed: number;
  today_completed: number;
  week_appointments: number;
  month_records: number;
  vaccines_pending: number;
  vaccines_due_soon: number;
  active_hospitalizations: number;
  pending_lab_orders: number;
  month_revenue: number;
  outstanding_balance: number;
  refreshed_at: string;
}

export interface AppointmentAnalytics {
  tenant_id: string;
  month: string;
  total_appointments: number;
  completed: number;
  cancelled: number;
  no_shows: number;
  completion_rate: number;
  no_show_rate: number;
  avg_duration_minutes: number;
  refreshed_at: string;
}

export interface RevenueAnalytics {
  tenant_id: string;
  month: string;
  invoice_count: number;
  gross_revenue: number;
  total_discounts: number;
  total_taxes: number;
  net_revenue: number;
  collected_revenue: number;
  outstanding_revenue: number;
  avg_invoice_amount: number;
  overdue_count: number;
  refreshed_at: string;
}

export interface InventoryAlert {
  tenant_id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  stock_quantity: number;
  min_stock_level: number;
  expiry_date: string | null;
  batch_number: string | null;
  alert_type: 'out_of_stock' | 'low_stock' | 'expired' | 'expiring_soon' | 'ok';
  refreshed_at: string;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface ApiListResponse<T> {
  data: T[];
  error: string | null;
  count: number;
  page: number;
  totalPages: number;
}
