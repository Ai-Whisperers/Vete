# Database Schema Reference

Complete reference for all database tables in the Vete platform.

## Table of Contents

- [Core Tables](#core-tables)
- [Pet Management](#pet-management)
- [Medical Records](#medical-records)
- [Clinical Reference](#clinical-reference)
- [Appointments](#appointments)
- [Invoicing](#invoicing)
- [Inventory](#inventory)
- [Finance](#finance)
- [Hospitalization](#hospitalization)
- [Communication](#communication)
- [Safety & Audit](#safety--audit)

---

## Core Tables

### `tenants`

Clinic/tenant registry.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (slug: 'adris', 'petlife') |
| `name` | TEXT | Display name |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `profiles`

User profiles (extends Supabase auth.users).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (matches auth.users.id) |
| `tenant_id` | TEXT | FK to tenants |
| `email` | TEXT | User email |
| `full_name` | TEXT | Display name |
| `phone` | TEXT | Phone number |
| `avatar_url` | TEXT | Profile photo |
| `role` | TEXT | 'owner', 'vet', 'admin' |
| `city` | TEXT | City for epidemiology |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update |

### `clinic_invites`

Staff invitation tokens.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `email` | TEXT | Invited email |
| `role` | TEXT | Role to assign |
| `invited_by` | UUID | FK to profiles |
| `expires_at` | TIMESTAMPTZ | Expiration |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## Pet Management

### `pets`

Pet profiles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `owner_id` | UUID | FK to profiles |
| `name` | TEXT | Pet name |
| `species` | TEXT | 'dog', 'cat', etc. |
| `breed` | TEXT | Breed |
| `birth_date` | DATE | Date of birth |
| `sex` | TEXT | 'male', 'female', 'unknown' |
| `color` | TEXT | Coat color |
| `weight_kg` | NUMERIC | Current weight |
| `microchip_id` | TEXT | Microchip number |
| `photo_url` | TEXT | Profile photo |
| `notes` | TEXT | General notes |
| `is_neutered` | BOOLEAN | Spay/neuter status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update |

### `vaccines`

Vaccination records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pet_id` | UUID | FK to pets |
| `name` | TEXT | Vaccine name |
| `brand` | TEXT | Manufacturer |
| `lot_number` | TEXT | Batch/lot number |
| `administered_date` | DATE | Date given |
| `administered_by` | UUID | FK to profiles (vet) |
| `next_due_date` | DATE | Next dose due |
| `status` | TEXT | 'pending', 'verified' |
| `notes` | TEXT | Additional notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `vaccine_templates`

Default vaccine schedules by species.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `species` | TEXT | Target species |
| `vaccine_name` | TEXT | Vaccine name |
| `dose_number` | INT | Dose sequence |
| `min_age_weeks` | INT | Minimum age |
| `interval_weeks` | INT | Interval between doses |

### `qr_tags`

Physical QR tag registry.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `code` | TEXT | Unique tag code |
| `pet_id` | UUID | FK to pets (nullable) |
| `tenant_id` | TEXT | FK to tenants |
| `is_active` | BOOLEAN | Tag status |
| `assigned_at` | TIMESTAMPTZ | Assignment date |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## Medical Records

### `medical_records`

Clinical consultations and procedures.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pet_id` | UUID | FK to pets |
| `tenant_id` | TEXT | FK to tenants |
| `vet_id` | UUID | FK to profiles |
| `visit_date` | DATE | Visit date |
| `type` | TEXT | 'consultation', 'surgery', 'emergency', etc. |
| `chief_complaint` | TEXT | Presenting issue |
| `history` | TEXT | Medical history |
| `physical_exam` | JSONB | Exam findings |
| `diagnosis_code` | UUID | FK to diagnosis_codes |
| `diagnosis_text` | TEXT | Diagnosis description |
| `treatment` | TEXT | Treatment provided |
| `notes` | TEXT | Additional notes |
| `follow_up_date` | DATE | Follow-up scheduled |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `prescriptions`

Digital prescriptions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pet_id` | UUID | FK to pets |
| `medical_record_id` | UUID | FK to medical_records |
| `vet_id` | UUID | FK to profiles |
| `tenant_id` | TEXT | FK to tenants |
| `medications` | JSONB | Array of medications |
| `instructions` | TEXT | Patient instructions |
| `valid_until` | DATE | Prescription expiry |
| `signature_url` | TEXT | Vet signature image |
| `status` | TEXT | 'active', 'filled', 'expired' |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## Clinical Reference

### `diagnosis_codes`

VeNom/SNOMED diagnosis codes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `code` | TEXT | Diagnosis code |
| `name` | TEXT | Display name |
| `description` | TEXT | Description |
| `category` | TEXT | Category grouping |
| `species` | TEXT[] | Applicable species |

### `drug_dosages`

Drug dosing reference.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `drug_name` | TEXT | Drug name |
| `species` | TEXT | Target species |
| `indication` | TEXT | Usage indication |
| `dose_mg_per_kg` | NUMERIC | Dose calculation |
| `route` | TEXT | Administration route |
| `frequency` | TEXT | Dosing frequency |
| `max_dose_mg` | NUMERIC | Maximum dose |
| `notes` | TEXT | Additional notes |

### `growth_standards`

Weight percentiles by species/breed.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `species` | TEXT | Species |
| `breed_category` | TEXT | Breed size category |
| `age_weeks` | INT | Age in weeks |
| `p5_weight` | NUMERIC | 5th percentile |
| `p25_weight` | NUMERIC | 25th percentile |
| `p50_weight` | NUMERIC | 50th percentile |
| `p75_weight` | NUMERIC | 75th percentile |
| `p95_weight` | NUMERIC | 95th percentile |

### `vaccine_reactions`

Adverse reaction tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pet_id` | UUID | FK to pets |
| `vaccine_id` | UUID | FK to vaccines |
| `reaction_type` | TEXT | Type of reaction |
| `severity` | TEXT | 'mild', 'moderate', 'severe' |
| `description` | TEXT | Details |
| `onset_hours` | INT | Hours after vaccine |
| `resolved_at` | TIMESTAMPTZ | Resolution time |
| `reported_by` | UUID | FK to profiles |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `euthanasia_assessments`

Quality of life assessments (HHHHHMM scale).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pet_id` | UUID | FK to pets |
| `assessed_by` | UUID | FK to profiles |
| `hurt_score` | INT | Pain (0-10) |
| `hunger_score` | INT | Appetite (0-10) |
| `hydration_score` | INT | Hydration (0-10) |
| `hygiene_score` | INT | Hygiene (0-10) |
| `happiness_score` | INT | Happiness (0-10) |
| `mobility_score` | INT | Mobility (0-10) |
| `more_good_days_score` | INT | Good days (0-10) |
| `total_score` | INT | Calculated total |
| `notes` | TEXT | Assessment notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `reproductive_cycles`

Breeding management.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pet_id` | UUID | FK to pets |
| `cycle_type` | TEXT | 'heat', 'pregnancy', etc. |
| `start_date` | DATE | Cycle start |
| `end_date` | DATE | Cycle end |
| `notes` | TEXT | Notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## Appointments

### `appointments`

Appointment scheduling.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `pet_id` | UUID | FK to pets |
| `owner_id` | UUID | FK to profiles |
| `vet_id` | UUID | FK to profiles |
| `service_id` | UUID | FK to services |
| `start_time` | TIMESTAMPTZ | Appointment start |
| `end_time` | TIMESTAMPTZ | Appointment end |
| `status` | TEXT | 'pending', 'confirmed', 'completed', 'cancelled' |
| `notes` | TEXT | Appointment notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## Invoicing

### `services`

Billable service catalog.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `code` | TEXT | Service code |
| `name` | TEXT | Service name |
| `description` | TEXT | Description |
| `category` | TEXT | Category |
| `base_price` | NUMERIC | Base price |
| `tax_rate` | NUMERIC | Tax percentage |
| `duration_minutes` | INT | Duration |
| `is_active` | BOOLEAN | Active status |

### `invoices`

Invoice headers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `invoice_number` | TEXT | Human-readable number |
| `client_id` | UUID | FK to profiles |
| `pet_id` | UUID | FK to pets |
| `invoice_date` | DATE | Invoice date |
| `due_date` | DATE | Payment due date |
| `subtotal` | NUMERIC | Subtotal |
| `tax_amount` | NUMERIC | Tax amount |
| `discount_amount` | NUMERIC | Discounts |
| `total` | NUMERIC | Grand total |
| `amount_paid` | NUMERIC | Amount paid |
| `balance_due` | NUMERIC | Remaining balance |
| `status` | TEXT | 'draft', 'sent', 'paid', etc. |
| `notes` | TEXT | Client notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `invoice_items`

Invoice line items.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `invoice_id` | UUID | FK to invoices |
| `item_type` | TEXT | 'service', 'product', 'custom' |
| `service_id` | UUID | FK to services |
| `product_id` | UUID | FK to store_products |
| `description` | TEXT | Line description |
| `quantity` | NUMERIC | Quantity |
| `unit_price` | NUMERIC | Unit price |
| `subtotal` | NUMERIC | Line subtotal |
| `tax_amount` | NUMERIC | Line tax |
| `total` | NUMERIC | Line total |

### `payments`

Payment records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `invoice_id` | UUID | FK to invoices |
| `payment_method_id` | UUID | FK to payment_methods |
| `amount` | NUMERIC | Payment amount |
| `payment_date` | TIMESTAMPTZ | Payment date |
| `reference_number` | TEXT | Transaction reference |
| `status` | TEXT | 'completed', 'refunded', etc. |
| `received_by` | UUID | FK to profiles |

---

## Inventory

### `store_products`

Product catalog.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `category_id` | UUID | FK to store_categories |
| `sku` | TEXT | SKU code |
| `name` | TEXT | Product name |
| `description` | TEXT | Description |
| `base_price` | NUMERIC | Retail price |
| `cost_price` | NUMERIC | Cost price |
| `is_active` | BOOLEAN | Active status |

### `store_inventory`

Stock levels.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `product_id` | UUID | FK to store_products |
| `tenant_id` | TEXT | FK to tenants |
| `stock_quantity` | NUMERIC | Current stock |
| `reorder_point` | NUMERIC | Low stock threshold |
| `weighted_average_cost` | NUMERIC | WAC calculation |
| `updated_at` | TIMESTAMPTZ | Last update |

### `store_inventory_transactions`

Stock movements.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `product_id` | UUID | FK to store_products |
| `type` | TEXT | 'purchase', 'sale', 'adjustment', etc. |
| `quantity` | NUMERIC | Quantity (+ or -) |
| `unit_cost` | NUMERIC | Cost per unit |
| `performed_by` | UUID | FK to profiles |
| `notes` | TEXT | Transaction notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## Finance

### `expenses`

Clinic expenses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `clinic_id` | TEXT | FK to tenants |
| `category` | TEXT | Expense category |
| `amount` | NUMERIC | Amount |
| `description` | TEXT | Description |
| `date` | DATE | Expense date |
| `proof_url` | TEXT | Receipt image |
| `created_by` | UUID | FK to profiles |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `loyalty_points`

Points balance per user.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `points` | INT | Current balance |
| `updated_at` | TIMESTAMPTZ | Last update |

### `loyalty_transactions`

Points ledger.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `clinic_id` | TEXT | FK to tenants |
| `pet_id` | UUID | FK to pets |
| `points` | INT | Points earned/spent |
| `description` | TEXT | Transaction reason |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## Hospitalization

### `kennels`

Kennel/cage registry.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `name` | TEXT | Kennel name |
| `code` | TEXT | Kennel code |
| `location` | TEXT | Physical location |
| `kennel_type` | TEXT | 'standard', 'icu', 'isolation', etc. |
| `size_category` | TEXT | Size category |
| `daily_rate` | NUMERIC | Daily charge |
| `current_status` | TEXT | 'available', 'occupied', etc. |
| `is_active` | BOOLEAN | Active status |

### `hospitalizations`

Hospitalization records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `pet_id` | UUID | FK to pets |
| `kennel_id` | UUID | FK to kennels |
| `hospitalization_number` | TEXT | Case number |
| `hospitalization_type` | TEXT | 'medical', 'surgical', 'boarding' |
| `admitted_at` | TIMESTAMPTZ | Admission time |
| `actual_discharge_at` | TIMESTAMPTZ | Discharge time |
| `admission_reason` | TEXT | Reason for admission |
| `treatment_plan` | JSONB | Treatment protocol |
| `status` | TEXT | 'active', 'discharged' |
| `acuity_level` | TEXT | 'critical', 'stable', etc. |

### `hospitalization_vitals`

Vitals monitoring.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `hospitalization_id` | UUID | FK to hospitalizations |
| `recorded_by` | UUID | FK to profiles |
| `recorded_at` | TIMESTAMPTZ | Recording time |
| `temperature_celsius` | NUMERIC | Temperature |
| `heart_rate_bpm` | INT | Heart rate |
| `respiratory_rate` | INT | Respiratory rate |
| `pain_score` | INT | Pain scale (0-10) |
| `observations` | TEXT | Notes |

---

## Communication

### `conversations`

Message threads.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `client_id` | UUID | FK to profiles |
| `pet_id` | UUID | FK to pets |
| `subject` | TEXT | Conversation subject |
| `channel` | TEXT | 'in_app', 'sms', 'whatsapp' |
| `status` | TEXT | 'open', 'resolved', 'closed' |
| `assigned_to` | UUID | FK to profiles |
| `last_message_at` | TIMESTAMPTZ | Last message time |

### `messages`

Individual messages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | FK to conversations |
| `sender_id` | UUID | FK to profiles |
| `sender_type` | TEXT | 'client', 'staff', 'system' |
| `message_type` | TEXT | 'text', 'image', 'file' |
| `content` | TEXT | Message content |
| `status` | TEXT | 'sent', 'delivered', 'read' |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `reminders`

Scheduled reminders.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `client_id` | UUID | FK to profiles |
| `pet_id` | UUID | FK to pets |
| `type` | TEXT | 'vaccine_reminder', 'appointment_reminder' |
| `scheduled_at` | TIMESTAMPTZ | Send time |
| `status` | TEXT | 'pending', 'sent', 'failed' |
| `reference_type` | TEXT | Related entity type |
| `reference_id` | UUID | Related entity ID |

---

## Safety & Audit

### `lost_pets`

Lost and found registry.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pet_id` | UUID | FK to pets |
| `reported_by` | UUID | FK to profiles |
| `status` | TEXT | 'lost', 'found', 'reunited' |
| `last_seen_location` | TEXT | Last known location |
| `last_seen_date` | DATE | Date last seen |
| `finder_contact` | TEXT | Finder info |
| `resolved_at` | TIMESTAMPTZ | Resolution time |

### `disease_reports`

Epidemiological data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `diagnosis_code_id` | UUID | FK to diagnosis_codes |
| `species` | TEXT | Affected species |
| `location_zone` | TEXT | Geographic zone |
| `reported_date` | DATE | Report date |
| `severity` | TEXT | 'mild', 'moderate', 'severe' |

### `audit_logs`

Security audit trail.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | FK to tenants |
| `user_id` | UUID | FK to profiles |
| `action` | TEXT | Action performed |
| `resource` | TEXT | Affected resource |
| `details` | JSONB | Additional details |
| `ip_address` | TEXT | Client IP |
| `created_at` | TIMESTAMPTZ | Action timestamp |

---

## Entity Relationship Diagram

```
tenants
    │
    ├─── profiles (tenant_id)
    │       │
    │       ├─── pets (owner_id)
    │       │       │
    │       │       ├─── vaccines (pet_id)
    │       │       ├─── medical_records (pet_id)
    │       │       ├─── prescriptions (pet_id)
    │       │       ├─── appointments (pet_id)
    │       │       ├─── hospitalizations (pet_id)
    │       │       └─── qr_tags (pet_id)
    │       │
    │       ├─── invoices (client_id)
    │       ├─── conversations (client_id)
    │       └─── loyalty_points (user_id)
    │
    ├─── services (tenant_id)
    ├─── store_products (tenant_id)
    ├─── kennels (tenant_id)
    └─── expenses (clinic_id)
```

---

## Related Documentation

- [Database Overview](overview.md)
- [RLS Policies](rls-policies.md)
- [Migrations Guide](migrations.md)
- [Functions Reference](functions.md)
