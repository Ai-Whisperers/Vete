# Centralized Veterinary Platform Architecture (v2)

## 1. System Overview

**Type**: Multi-Tenant SaaS (B2B2C).
**Goal**: A unified platform where Clinics manage their presence and Vets/Owners share a portable pet health record.
**Stack**:

- **Frontend**: Next.js 14 (App Router) + React + TailwindCSS.
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Hosting**: Vercel.

## 2. Database Schema (PostgreSQL)

### `public.tenants` (Clinics)

| Column                | Type  | Description                             |
| :-------------------- | :---- | :-------------------------------------- |
| `id`                  | UUID  | Primary Key                             |
| `slug`                | Text  | Subdomain (e.g., `vete-adris`) - Unique |
| `name`                | Text  | Display Name                            |
| `brand_color_primary` | Hex   | Custom branding                         |
| `whatsapp_number`     | Text  | For "Floating Button"                   |
| `config`              | JSONB | Enabled features, business hours        |

### `public.profiles` (Users: Vets & Owners)

| Column      | Type | Description             |
| :---------- | :--- | :---------------------- |
| `id`        | UUID | Linked to `auth.users`  |
| `role`      | Enum | `vet`, `owner`, `admin` |
| `full_name` | Text |                         |
| `clinic_id` | UUID | Foreign Key (If Vet)    |

### `public.pets` (Universal Records)

| Column       | Type | Description               |
| :----------- | :--- | :------------------------ |
| `id`         | UUID | Primary Key               |
| `owner_id`   | UUID | Foreign Key to `profiles` |
| `name`       | Text |                           |
| `species`    | Enum | `dog`, `cat`, etc.        |
| `breed`      | Text |                           |
| `birth_date` | Date | Used for Age Calculator   |
| `avatar_url` | URL  | Photo                     |
| `chip_id`    | Text | Optional Microchip ID     |

### `public.vaccinations` (The Digital Card)

| Column              | Type | Description                                     |
| :------------------ | :--- | :---------------------------------------------- |
| `id`                | UUID | Primary Key                                     |
| `pet_id`            | UUID | Foreign Key                                     |
| `vaccine_type`      | Enum | `rabies`, `sextuple`, `leishmania`, `deworming` |
| `date_administered` | Date |                                                 |
| `next_due_date`     | Date | Logic: Date + Duration                          |
| **`verified`**      | Bool | `true` if added by Vet, `false` if Owner        |
| **`proof_url`**     | URL  | Photo of sticker (Required if !verified)        |
| `created_by_clinic` | UUID | FK to `tenants` (If verified)                   |

## 3. API Structure (Next.js Server Actions)

### Authentication

- `auth.signInWithOtp({ email })`
- `auth.signInWithWhatsapp` (Future)

### Pet Management

- `GET /api/pets/:id` -> Returns Pet + Vaccinations (Public if QR scanned? Or requires basic auth?)
- `POST /api/pets` -> Owner registers new pet.

### Vaccination Logic

- **Owner Upload**:
  1.  User selects "Add Vaccine".
  2.  User uploads Photo -> Supabase Storage bucket `vaccine-proofs/${pet_id}`.
  3.  `INSERT INTO vacations (verified: false, proof_url: ...)`
- **Vet Entry**:
  1.  Vet logs in via `vete-adris`.
  2.  `INSERT INTO vaccinations (verified: true, created_by_clinic: current_clinic)`

## 4. Multi-Tenant Routing (Middleware)

- **Middleware.ts**: Intercepts request to `vete-adris.platform.com`.
- **Logic**:
  1.  Extracts subdomain `vete-adris`.
  2.  Fetches `tenant` config from DB (cached).
  3.  Injects `tenantId` into headers/context.
  4.  Renders `<HomePage tenant={tenant} />`.

## 5. Security Policies (RLS)

- `vaccinations`:
  - `SELECT`: Public (or via signed QR token).
  - `INSERT`: Authenticated Users only.
  - `UPDATE`: Only `verified: false` records can be edited by Owners. `verified: true` only by Vets.
