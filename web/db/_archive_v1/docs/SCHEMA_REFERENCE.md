# Database Schema Reference

## Overview

The Vete platform uses PostgreSQL via Supabase with Row-Level Security (RLS) for multi-tenant isolation.

## Core Tables

### tenants
Primary tenant/clinic table.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Clinic slug (e.g., 'adris') |
| name | TEXT | Display name |
| settings | JSONB | Clinic settings |
| created_at | TIMESTAMPTZ | Creation timestamp |

### profiles
User profiles linked to Supabase auth.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Links to auth.users |
| tenant_id | TEXT FK | Clinic association |
| email | TEXT | User email |
| full_name | TEXT | Display name |
| phone | TEXT | Contact phone |
| role | TEXT | owner, vet, or admin |
| avatar_url | TEXT | Profile photo URL |
| created_at | TIMESTAMPTZ | Creation timestamp |

### pets
Pet records with owner association.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Pet identifier |
| tenant_id | TEXT FK | Clinic association |
| owner_id | UUID FK | Owner profile |
| name | TEXT | Pet name |
| species | TEXT | dog, cat, etc. |
| breed | TEXT | Breed name |
| date_of_birth | DATE | Birth date |
| sex | TEXT | male or female |
| weight_kg | NUMERIC | Current weight |
| is_neutered | BOOLEAN | Neutered status |
| microchip_number | TEXT | Microchip ID |
| photo_url | TEXT | Photo URL |

## Medical Tables

### vaccines
Vaccination records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Record ID |
| pet_id | UUID FK | Pet reference |
| vaccine_name | TEXT | Vaccine name |
| batch_number | TEXT | Vaccine batch |
| administered_date | DATE | When given |
| next_due_date | DATE | Next vaccination |
| administered_by | UUID FK | Vet who administered |
| status | TEXT | pending, completed, overdue |

### medical_records
General medical history.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Record ID |
| tenant_id | TEXT FK | Clinic |
| pet_id | UUID FK | Pet |
| vet_id | UUID FK | Attending vet |
| record_type | TEXT | consultation, surgery, etc. |
| diagnosis_code | TEXT | VeNom/SNOMED code |
| chief_complaint | TEXT | Reason for visit |
| diagnosis | TEXT | Diagnosis |
| treatment | TEXT | Treatment plan |
| notes | TEXT | Additional notes |
| attachments | JSONB | File attachments |
| created_at | TIMESTAMPTZ | Record date |

### prescriptions
Medication prescriptions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Prescription ID |
| tenant_id | TEXT FK | Clinic |
| pet_id | UUID FK | Pet |
| vet_id | UUID FK | Prescribing vet |
| medications | JSONB | Medication details |
| instructions | TEXT | Dosage instructions |
| valid_until | DATE | Expiration date |
| signature_url | TEXT | Vet signature |

## Appointment Tables

### services
Service catalog.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Service ID |
| tenant_id | TEXT FK | Clinic |
| name | TEXT | Service name |
| description | TEXT | Description |
| category | TEXT | Service category |
| base_price | INTEGER | Price in guaraníes |
| duration_minutes | INTEGER | Duration |
| is_active | BOOLEAN | Available for booking |

### appointments
Scheduled appointments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Appointment ID |
| tenant_id | TEXT FK | Clinic |
| pet_id | UUID FK | Pet |
| client_id | UUID FK | Pet owner |
| vet_id | UUID FK | Assigned vet |
| service_id | UUID FK | Service |
| start_time | TIMESTAMPTZ | Start time |
| end_time | TIMESTAMPTZ | End time |
| status | TEXT | scheduled, confirmed, completed, etc. |
| notes | TEXT | Notes |

## Financial Tables

### invoices
Customer invoices.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Invoice ID |
| tenant_id | TEXT FK | Clinic |
| client_id | UUID FK | Client |
| invoice_number | TEXT | Invoice number |
| subtotal | INTEGER | Subtotal |
| tax_amount | INTEGER | Tax |
| total | INTEGER | Total |
| status | TEXT | draft, sent, paid, etc. |
| due_date | DATE | Payment due date |
| notes | TEXT | Notes |

### payments
Payment records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Payment ID |
| tenant_id | TEXT FK | Clinic |
| invoice_id | UUID FK | Invoice |
| amount | INTEGER | Payment amount |
| payment_method | TEXT | cash, card, transfer |
| payment_date | TIMESTAMPTZ | When paid |
| status | TEXT | completed, failed, refunded |

## Hospitalization Tables

### kennels
Hospital kennel/cage definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Kennel ID |
| tenant_id | TEXT FK | Clinic |
| name | TEXT | Kennel name |
| code | TEXT | Short code |
| kennel_type | TEXT | small, medium, large, icu |
| daily_rate | INTEGER | Daily charge |
| current_status | TEXT | available, occupied, maintenance |

### hospitalizations
Active/past hospitalizations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Hospitalization ID |
| tenant_id | TEXT FK | Clinic |
| pet_id | UUID FK | Patient |
| kennel_id | UUID FK | Assigned kennel |
| admitted_at | TIMESTAMPTZ | Admission time |
| discharged_at | TIMESTAMPTZ | Discharge time |
| status | TEXT | admitted, active, discharged |
| reason | TEXT | Reason for admission |
| diagnosis | TEXT | Diagnosis |
| treatment_plan | TEXT | Treatment plan |
| acuity_level | TEXT | low, medium, high, critical |

## Row-Level Security

All tables have RLS enabled with policies based on:

1. **Tenant isolation**: Users can only access data within their tenant
2. **Role-based access**: Staff (vet/admin) have broader access than owners
3. **Ownership**: Owners can access their own pets and appointments

Key RLS functions:
- `is_staff_of(tenant_id)` - Returns true if user is staff in tenant
- `auth.uid()` - Current authenticated user ID
