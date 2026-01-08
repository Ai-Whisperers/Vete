# Vete - Multi-Tenant Veterinary Platform

> **Quick Context**: This is a SaaS veterinary clinic management platform built with Next.js 15, Supabase, and TypeScript. It hosts multiple clinics from a single codebase using dynamic routing (`/[clinic]/*`).

## Session Quick Start

When starting a new session, understand these key points:

1. **Multi-tenant**: Routes like `/adris/services` and `/petlife/services` serve different clinics
2. **JSON-CMS**: Content lives in `web/.content_data/[clinic]/*.json` - no code changes needed for content
3. **Spanish UI**: All user-facing text is in Spanish (Paraguay market)
4. **Theme system**: Colors come from CSS variables, not hardcoded values
5. **RLS security**: Every database table uses Row-Level Security for tenant isolation

## Technology Stack

| Component       | Technology            | Version         | Notes                        |
| --------------- | --------------------- | --------------- | ---------------------------- |
| Framework       | Next.js (App Router)  | 15.5.9          | Server Components by default |
| Language        | TypeScript            | 5.x             | Strict mode enabled          |
| Styling         | Tailwind CSS          | **3.4.19**      | **DO NOT upgrade to v4**     |
| Database        | Supabase (PostgreSQL) | 2.88.0          | RLS for multi-tenancy        |
| ORM             | Drizzle ORM           | 0.45.1          | Type-safe queries            |
| State           | Zustand               | 5.0.9           | Client state management      |
| Data Fetching   | TanStack React Query  | 5.90.12         | Server state caching         |
| Background Jobs | Inngest               | 3.48.1          | Async job processing         |
| Rate Limiting   | Upstash               | 2.0.7           | Redis-based limiting         |
| i18n            | next-intl             | 4.7.0           | Internationalization         |
| Auth            | Supabase Auth         | -               | Email/Password               |
| Storage         | Supabase Storage      | -               | Pet photos, vaccines, docs   |
| PDF             | @react-pdf/renderer   | 4.3.1           | Prescription PDFs            |
| Charts          | recharts              | 3.6.0           | Growth charts, analytics     |
| Testing         | Vitest + Playwright   | 4.0.16 / 1.57.0 | Unit + E2E                   |

## Project Structure

```
Vete/
├── CLAUDE.md                     # This file - AI assistant context
├── web/                          # Next.js application
│   ├── app/
│   │   ├── [clinic]/             # Multi-tenant routes
│   │   │   ├── layout.tsx        # Theme provider, clinic config
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── services/         # Service catalog
│   │   │   ├── book/             # Appointment booking
│   │   │   ├── portal/           # Pet owner portal (auth required)
│   │   │   ├── dashboard/        # Staff dashboard (vet/admin only)
│   │   │   └── tools/            # Interactive tools
│   │   ├── ambassador/           # Ambassador portal (NEW)
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── login/            # Login page
│   │   │   ├── register/         # Registration
│   │   │   ├── payouts/          # Payout management
│   │   │   └── referrals/        # Referral tracking
│   │   ├── reclamar/             # Claim pre-generated site (NEW)
│   │   ├── api/                  # REST API routes
│   │   ├── actions/              # Server Actions
│   │   └── auth/                 # Auth routes
│   ├── components/               # React components
│   │   ├── layout/               # Navigation, footer
│   │   ├── ui/                   # Buttons, cards, etc.
│   │   ├── clinical/             # Clinical tools UI
│   │   ├── booking/              # Booking flow
│   │   └── ...
│   ├── lib/
│   │   ├── clinics.ts            # Content loading (JSON-CMS)
│   │   ├── supabase/             # DB client (server/client)
│   │   ├── constants/            # Centralized constants (messages, pagination, time)
│   │   ├── types/                # TypeScript definitions
│   │   │   └── entities/         # Entity type definitions
│   │   ├── test-utils/           # Testing infrastructure
│   │   └── hooks/                # Custom React hooks library (8 hooks)
│   │       ├── index.ts          # Exports all hooks and types
│   │       ├── use-async-data.ts # Data fetching with loading/error states
│   │       ├── use-form-state.ts # Form management with Zod validation
│   │       ├── use-modal.ts      # Modal/dialog state management
│   │       ├── use-synced-state.ts # localStorage + API synchronization
│   │       ├── use-barcode-scanner.ts # Barcode/QR scanning
│   │       ├── use-import-wizard.ts # CSV/Excel import wizard
│   │       └── use-tenant-features.tsx # Tier-based feature gating
│   ├── i18n/                     # Internationalization config
│   ├── messages/                 # Translation files (es.json, en.json)
│   ├── db/                       # SQL migrations (numbered)
│   ├── .content_data/            # JSON content per clinic
│   │   ├── _TEMPLATE/            # Copy for new clinics
│   │   ├── adris/                # Veterinaria Adris
│   │   └── petlife/              # PetLife Center
│   └── tests/                    # Test files
├── documentation/                # Full technical docs
│   ├── architecture/             # System design
│   ├── database/                 # Schema, RLS, migrations
│   ├── features/                 # Feature documentation
│   ├── api/                      # API reference
│   └── growth-strategy/          # Growth & monetization docs
│       ├── 01-pricing-strategy.md
│       ├── 02-pre-generation-system.md
│       ├── 03-ambassador-program.md
│       └── ... (10 files total)
├── .claude/                      # Claude Code configuration
│   ├── commands/                 # Slash commands
│   └── exemplars/                # Code pattern examples
├── .antigravity/                 # Antigravity Agent configuration
│   └── rules.md                  # Agent rules and context
└── .cursor/                      # Cursor AI configuration
    └── rules/                    # Cursor rules (.mdc)

```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Pet Owner / Vet / Admin)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                     │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │   /[clinic]    │  │     /api/*     │  │   /auth/*     │  │
│  │  Dynamic Pages │  │   REST APIs    │  │  Supabase Auth│  │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │   JSON-CMS     │  │ Server Actions │  │ThemeProvider  │  │
│  │ .content_data/ │  │   Mutations    │  │ CSS Variables │  │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ PostgreSQL  │  │    Auth     │  │      Storage        │  │
│  │  + RLS      │  │             │  │   Pet photos, PDFs  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## User Roles & Permissions

| Role    | Description   | Access                                             |
| ------- | ------------- | -------------------------------------------------- |
| `owner` | Pet owners    | Own pets, book appointments, view records          |
| `vet`   | Veterinarians | All patients, create prescriptions, clinical tools |
| `admin` | Clinic admins | Everything + settings, team, finances              |

**Security function**: `is_staff_of(tenant_id)` checks if user is vet/admin in that tenant.

## Database Schema (100+ Tables)

```sql
-- Core (tenant isolation)
tenants (id, name)
profiles (id, tenant_id, role, full_name, email, phone)
clinic_invites (email, tenant_id, role, expires_at)

-- Pet Management
pets (id, owner_id, tenant_id, name, species, breed, ...)
vaccines (id, pet_id, vaccine_name, administered_date, next_due_date, status)
medical_records (id, pet_id, tenant_id, vet_id, record_type, diagnosis_code, ...)
qr_tags (id, code, pet_id, tenant_id, is_active)

-- Clinical Tools
diagnosis_codes (id, code, name, description, category, species[])
drug_dosages (id, drug_name, species, dose_mg_per_kg, route, frequency)
prescriptions (id, pet_id, vet_id, medications JSONB, valid_until, signature_url)
vaccine_reactions (id, pet_id, vaccine_id, reaction_type, severity, onset_hours)
euthanasia_assessments (id, pet_id, hurt_score, hunger_score, ... total_score)
reproductive_cycles (id, pet_id, cycle_type, start_date, end_date)
growth_standards (id, species, breed_category, age_weeks, p50_weight, ...)

-- Appointments & Services
services (id, tenant_id, name, category, base_price, duration_minutes)
appointments (id, tenant_id, pet_id, vet_id, service_id, start_time, end_time, status)

-- Invoicing & Payments
invoices (id, tenant_id, client_id, invoice_number, subtotal, tax_amount, total, status)
invoice_items (id, invoice_id, item_type, service_id, product_id, quantity, unit_price)
payments (id, tenant_id, invoice_id, amount, payment_date, status)
payment_methods (id, tenant_id, name, is_active)
refunds (id, payment_id, amount, reason, status)

-- Inventory & Store
store_categories (id, tenant_id, name, slug, parent_id)
store_products (id, tenant_id, category_id, sku, name, base_price, is_active, is_prescription_required)
store_inventory (id, product_id, stock_quantity, reorder_point, weighted_average_cost)
store_orders (id, tenant_id, customer_id, status, total, requires_prescription_review, prescription_file_url)
store_order_items (id, order_id, product_id, quantity, unit_price, requires_prescription, prescription_file_url)
store_campaigns (id, tenant_id, name, discount_type, discount_value, valid_from, valid_to)
store_coupons (id, tenant_id, code, discount_type, discount_value, usage_limit)
store_carts (id, tenant_id, customer_id, items JSONB, updated_at)
store_wishlists (id, tenant_id, user_id, product_id, created_at)
store_stock_alerts (id, tenant_id, product_id, email, notified, created_at)
store_inventory_transactions (id, product_id, type, quantity, unit_cost, notes, reference_type, reference_id, performed_by, created_at)

-- Views
unified_clinic_inventory (VIEW) -- Combines own products + catalog assignments with stock levels

-- Finance
expenses (id, clinic_id, category, amount, description, date, proof_url)
loyalty_points (id, user_id, balance, lifetime_earned)
loyalty_transactions (id, clinic_id, user_id, points, description, type)

-- Hospitalization
kennels (id, tenant_id, name, code, kennel_type, daily_rate, current_status)
hospitalizations (id, tenant_id, pet_id, kennel_id, admitted_at, status, acuity_level)
hospitalization_vitals (id, hospitalization_id, temperature, heart_rate, pain_score, ...)
hospitalization_medications (id, hospitalization_id, medication_name, dose, administered_at)
hospitalization_feedings (id, hospitalization_id, food_type, amount, fed_at)

-- Laboratory
lab_test_catalog (id, tenant_id, name, code, category, reference_range)
lab_panels (id, tenant_id, name, tests[])
lab_orders (id, tenant_id, pet_id, ordered_by, status, ordered_at)
lab_order_items (id, lab_order_id, test_id, status)
lab_results (id, lab_order_id, test_id, value, unit, is_abnormal)
lab_result_attachments (id, lab_order_id, file_url, file_type)
lab_result_comments (id, lab_order_id, comment, created_by)

-- Consent Management
consent_templates (id, tenant_id, name, content, version)
consent_template_versions (id, template_id, version, content)
consent_documents (id, tenant_id, pet_id, template_id, signed_at, signature_url)

-- Insurance
insurance_providers (id, name, contact_info)
insurance_policies (id, tenant_id, pet_id, provider_id, policy_number, coverage_details)
insurance_claims (id, tenant_id, policy_id, pet_id, claim_type, amount, status)
insurance_claim_items (id, claim_id, service_id, amount)

-- Messaging
conversations (id, tenant_id, client_id, pet_id, channel, status, last_message_at)
messages (id, conversation_id, sender_id, sender_type, content, status, created_at)
message_attachments (id, message_id, file_url, file_type)
message_templates (id, tenant_id, name, content, category)
whatsapp_messages (id, tenant_id, phone_number, direction, content, status)

-- Reminders
reminders (id, tenant_id, client_id, pet_id, type, scheduled_at, status)
reminder_templates (id, tenant_id, type, channel, subject, body)

-- Staff Management
staff_profiles (id, profile_id, tenant_id, specialization, license_number)
staff_schedules (id, staff_id, day_of_week, start_time, end_time)
staff_time_off (id, staff_id, type, start_date, end_date, status)
staff_time_off_types (id, tenant_id, name, paid, max_days)

-- Safety & Audit
lost_pets (id, pet_id, status, last_seen_location, reported_by)
lost_pet_sightings (id, lost_pet_id, location, reported_by, created_at)
disease_reports (id, tenant_id, diagnosis_code_id, species, location_zone)
audit_logs (id, tenant_id, user_id, action, resource, details JSONB)
notifications (id, user_id, title, message, read_at, created_at)

-- Adoptions (NEW)
adoptions (id, tenant_id, pet_id, status, description, is_featured)
adoption_applications (id, adoption_id, applicant_id, status, notes)

-- Procurement (NEW)
suppliers (id, tenant_id, name, contact_info, is_verified)
supplier_products (id, supplier_id, product_name, unit_cost, lead_time)
procurement_orders (id, tenant_id, supplier_id, status, total, ordered_at)
procurement_order_items (id, order_id, product_id, quantity, unit_cost)
procurement_leads (id, tenant_id, product_name, suppliers JSONB)

-- Referrals (NEW)
referral_codes (id, tenant_id, code, owner_id, commission_rate, status)
referral_transactions (id, referral_code_id, referred_user_id, status, commission_amount)

-- Platform Administration (NEW)
platform_announcements (id, title, content, is_active, created_at)
platform_commission_invoices (id, tenant_id, amount, status, period_start, period_end)

-- Ambassador Program (NEW)
ambassadors (id, email, full_name, phone, user_id, type, university, institution, status, tier, referral_code, total_referrals, total_conversions, total_earnings, total_paid, created_at)
ambassador_referrals (id, ambassador_id, clinic_name, clinic_email, status, converted_at, commission_amount, commission_paid, trial_started_at, utm_source, created_at)
ambassador_payouts (id, ambassador_id, amount, status, bank_name, account_number, account_holder, notes, processed_at, processed_by, created_at)
```

### Recent Migrations (057-061)

| Migration | Purpose |
|-----------|---------|
| 057 | Atomic lab order creation (prevents orphaned items) |
| 058 | Waitlist notification system (auto-cascade on cancellation) |
| 059 | Atomic appointment status (TOCTOU protection) |
| 060 | Pre-generation fields (tenant status, scraped data) |
| 061 | Ambassador program (3 tables, tier functions) |

See `documentation/database/schema-reference.md` for complete column definitions.

## Common Commands

```bash
# Development
cd web
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint

# Testing
npm run test:unit        # Vitest unit tests
npm run test:e2e         # Playwright E2E
npm run test             # All tests

# Access clinics locally
http://localhost:3000/adris
http://localhost:3000/petlife
```

## Environment Variables

See `web/.env.example` for complete reference (82 variables documented).

**Required** in `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://...
```

**Optional** (78 additional variables for features like email, WhatsApp, Stripe, etc.)

---

## Coding Standards

### TypeScript

- Strict mode enabled
- Explicit return types on all functions
- Use `interface` for object shapes, `type` for unions
- Zod for runtime validation at API boundaries

### React/Next.js

- **Server Components** by default (no `"use client"` unless needed)
- Server Actions for mutations (not API routes for forms)
- Small, focused components
- Props interface defined above component

### Styling (Critical)

- **ONLY Tailwind utility classes**
- **Theme colors via CSS variables**: `bg-[var(--primary)]`, `text-[var(--text-primary)]`
- **NEVER hardcode colors** like `bg-blue-500` or `#333`
- Mobile-first responsive design
- No inline styles

### Database

- **ALWAYS enable RLS** on new tables
- **ALWAYS filter by tenant_id** in queries
- Parameterized queries only (no string interpolation)
- Migrations in `web/db/XX_name.sql` format

### API Routes

```typescript
// Required pattern for all API routes
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // 2. Get tenant context
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  // 3. Query with tenant filter
  const { data, error } = await supabase
    .from("table")
    .select("*")
    .eq("tenant_id", profile.tenant_id);

  // 4. Return response
  return NextResponse.json(data);
}
```

### User-Facing Text

- **All text in Spanish** (Paraguay market)
- Error messages: `"No autorizado"`, `"Error al guardar"`, etc.
- Button labels: `"Guardar"`, `"Cancelar"`, `"Enviar"`, etc.

---

## Slash Commands (Use with `/command`)

| Command          | Purpose                              |
| ---------------- | ------------------------------------ |
| `/add-feature`   | Add new feature with proper patterns |
| `/add-clinic`    | Onboard a new clinic tenant          |
| `/add-api`       | Create Supabase-connected API route  |
| `/add-migration` | Create SQL migration with RLS        |
| `/add-component` | Create themed React component        |
| `/run-tests`     | Execute test suite                   |
| `/review-code`   | Project-specific code review         |
| `/debug`         | Structured debugging approach        |
| `/git-workflow`  | Git branching and PR guidelines      |

## Exemplars (Pattern Reference)

Located in `.claude/exemplars/`:

| File                             | Shows                                      |
| -------------------------------- | ------------------------------------------ |
| `nextjs-page-exemplar.md`        | Server Components, SSG, multi-tenant pages |
| `supabase-api-exemplar.md`       | Auth, RLS, tenant isolation patterns       |
| `react-component-exemplar.md`    | Theme variables, TypeScript, accessibility |
| `database-migration-exemplar.md` | RLS policies, indexes, triggers            |
| `vitest-testing-exemplar.md`     | Unit tests, mocking, parameterized tests   |
| `server-action-exemplar.md`      | Form handling, validation, mutations       |
| `rate-limiting-exemplar.md`      | Upstash Redis rate limiting patterns       |

---

## Common Tasks

### Adding a New Clinic

1. Create folder: `web/.content_data/[clinic-slug]/`
2. Copy all JSON files from `_TEMPLATE/`
3. Edit `config.json`: name, contact, branding, enabled modules
4. Edit `theme.json`: colors, fonts, gradients
5. Customize other JSON files
6. Add tenant record in Supabase `tenants` table
7. Deploy - routes auto-generate via `generateStaticParams`

### Adding a New Database Table

```sql
-- web/db/XX_new_table.sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REQUIRED: Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- REQUIRED: Create policies
CREATE POLICY "Staff manage" ON new_table FOR ALL
  USING (is_staff_of(tenant_id));

CREATE POLICY "Owner view own" ON new_table FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
    AND profiles.tenant_id = new_table.tenant_id
  ));

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON new_table
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### Adding a New API Route

Create `web/app/api/[resource]/route.ts` using the pattern in Coding Standards above.

### Using Custom Hooks

Import from `@/lib/hooks`:

```typescript
import { useAsyncData, useFormState, useModal } from "@/lib/hooks";

// Data fetching with loading states
const { data, isLoading, error, refetch } = useAsyncData(
  () => fetch("/api/pets").then((r) => r.json()),
  [tenantId],
  { refetchInterval: 30000, enabled: !!tenantId }
);

// Form with Zod validation
const form = useFormState({
  initialValues: { name: "", species: "dog" },
  schema: petSchema,
  onSubmit: async (values) => await createPet(values),
});

// Modal state management
const editModal = useModalWithData<Pet>();
editModal.open(selectedPet);
```

### Adding a New Page

```typescript
// web/app/[clinic]/new-page/page.tsx
import { getClinicData } from "@/lib/clinics";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ clinic: string }>;
}

export async function generateStaticParams() {
  return [{ clinic: "adris" }, { clinic: "petlife" }];
}

export default async function NewPage({ params }: Props) {
  const { clinic } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {clinicData.config.name}
      </h1>
    </div>
  );
}
```

---

## Critical Warnings

1. **Tailwind v3 ONLY** - Do NOT upgrade to v4. Build breaks with JSON scanning.
2. **Hidden content directory** - `.content_data` is dot-prefixed to hide from Tailwind.
3. **RLS required** - NEVER create tables without RLS policies.
4. **No direct DB access** - Always use Supabase client, never raw SQL in components.
5. **Spanish content** - All user-facing text in Spanish.
6. **Theme variables** - Never hardcode colors. Use `var(--primary)`, `var(--bg-default)`, etc.
7. **Auth on APIs** - Every API route must check authentication first.
8. **Tenant isolation** - Every query must filter by `tenant_id`.

### Atomic Database Operations

Three critical operations use PostgreSQL functions to ensure atomicity:

1. **Lab Order Creation** (`create_lab_order_atomic`)
   - Creates order + items + panels in single transaction
   - Prevents orphaned records on partial failure

2. **Appointment Status Updates** (`update_appointment_status_atomic`)
   - Row-level locking prevents race conditions
   - Validates state transitions before update
   - Tracks cancellation/completion metadata

3. **Waitlist Processing** (`process_waitlist_on_cancellation`)
   - Auto-notifies next person when slot opens
   - Cascades to subsequent waitlist entries on expiration
   - 4-hour offer windows with automatic cleanup

---

## Documentation Reference

**In-project documentation** (see `web/docs/`):

| Topic                 | File                       |
| --------------------- | -------------------------- |
| Architecture          | `web/docs/ARCHITECTURE.md` |
| NPM Scripts           | `web/docs/SCRIPTS.md`      |
| Environment Variables | `web/.env.example`         |

**Extended documentation** (see `documentation/`):

| Topic           | File                                          |
| --------------- | --------------------------------------------- |
| System Design   | `documentation/architecture/overview.md`      |
| Multi-tenancy   | `documentation/architecture/multi-tenancy.md` |
| Database schema | `documentation/database/schema-reference.md`  |
| RLS policies    | `documentation/database/rls-policies.md`      |
| All features    | `documentation/features/overview.md`          |
| All features    | `documentation/features/overview.md`          |
| API reference   | `documentation/api/overview.md`               |
| Git Workflow    | `documentation/GIT_WORKFLOW.md`               |

## Security Audit

The `.claude/SUPABASE_AUDIT.md` contains a comprehensive security audit with all fixes applied. Key points:

- All API routes have authentication
- All sensitive tables have RLS
- Dynamic `tenant_id` (not hardcoded)
- QR tag theft prevention
- Proper signup trigger with invite tenant

---

## Feature Status

### Core Platform ✅

- Multi-tenant public websites with dynamic theming
- Authentication (Supabase Auth with invite system)
- Pet profiles with photos, QR codes, and microchip tracking
- Vaccine records with PDF generation and reaction tracking
- Medical records and digital prescriptions
- Growth charts with breed-specific standards

### Appointments & Scheduling ✅

- Multi-step appointment booking wizard
- Real-time slot availability with overlap detection
- Calendar view for staff (day/week/month)
- Check-in and completion workflows
- Appointment reschedule and cancellation
- Staff schedule management with time-off requests

### Clinical Tools ✅

- Drug dosage calculator (species/weight-based)
- Diagnosis code search (VeNom/SNOMED)
- Quality of life assessments (HHHHHMM scale)
- Reproductive cycle tracking
- Growth chart analysis
- Prescription generation with PDF export

### Hospitalization Module ✅

- Patient admission with kennel assignment
- Vital signs monitoring (temp, HR, RR, pain scale)
- Treatment sheets and medication logs
- Feeding logs
- Discharge workflows

### Laboratory Module ✅

- Lab test ordering from catalog
- Result entry with reference ranges
- Lab order comments and notes
- Result attachments and reports

### Invoicing & Payments ✅

- Full invoice lifecycle (draft → sent → paid)
- Line items (services, products, custom)
- Payment recording with multiple methods
- Refund processing
- Invoice PDF generation and email sending

### E-Commerce / Store ✅

- Product catalog with categories and brands
- Shopping cart with database persistence (logged-in users)
- Stock validation before cart add
- Checkout flow with prescription upload support
- Prescription order approval workflow (vet dashboard)
- Coupon validation
- Product reviews and ratings
- Wishlist with database persistence and dedicated page
- "Notify when available" for out-of-stock products
- Stock alerts for low inventory

### Inventory Management (Enhanced) ✅

- Unified inventory view combining own products + catalog product assignments
- Stock adjustment with reason codes (damage, theft, expired, correction, etc.)
- Stock receiving with WAC (Weighted Average Cost) recalculation
- Stock history modal with complete transaction timeline
- Reorder suggestions grouped by supplier with urgency levels
- Expiring products dashboard
- Product-level movement history API
- Barcode scanning for quick lookups

### Stock Reservation System ✅

- Cart items with automatic stock reservation
- Reserved quantity tracking per cart
- Automatic release of expired reservations via cron job
- Prevents overselling during checkout

### Background Jobs (Cron) ✅

14 cron endpoints for background processing:

- `/api/cron/release-reservations` - Release expired cart stock reservations
- `/api/cron/process-subscriptions` - Process recurring subscription renewals
- `/api/cron/expiry-alerts` - Send product expiry notifications
- `/api/cron/stock-alerts` - Send low stock email alerts
- `/api/cron/stock-alerts/staff` - Staff stock notifications
- `/api/cron/reminders` - Process scheduled appointment/vaccine reminders
- `/api/cron/reminders/generate` - Generate reminder queue
- `/api/cron/billing/auto-charge` - Auto-charge subscriptions
- `/api/cron/billing/evaluate-grace` - Evaluate grace periods
- `/api/cron/billing/generate-platform-invoices` - Monthly platform invoices
- `/api/cron/billing/send-reminders` - Send billing reminders
- `/api/cron/generate-commission-invoices` - Generate commission invoices
- `/api/cron/generate-recurring` - Generate recurring appointments

### Custom React Hooks Library ✅

Located in `lib/hooks/` (8 hook files):

- `useAsyncData` / `useSimpleAsyncData` - Data fetching with loading/error/success states
- `useFormState` - Form management with Zod schema validation
- `useModal` / `useModalWithData` - Modal state management
- `useConfirmation` - Promise-based confirmation dialogs
- `useSyncedState` / `useLocalStorage` - localStorage + API synchronization
- `useDashboardLabels` - Dashboard label provider
- `useBarcodeScanner` - Barcode/QR code scanning
- `useImportWizard` - CSV/Excel data import wizard
- `useTenantFeatures` - Tier-based feature gating with `FeatureGate` component

### Communications ✅

- Internal messaging (clinic ↔ owner)
- WhatsApp integration (bidirectional)
- Message templates library
- Quick replies
- Notification system

### Insurance Module ✅

- Policy management
- Claims submission and tracking
- Pre-authorization requests
- Insurance provider directory

### Consent Management ✅

- Consent templates
- Blanket consent handling
- Digital signatures
- Audit trail for consents

### Administration ✅

- Staff/team management with invites
- Client management dashboard
- Expense tracking
- Loyalty points program
- Audit logs
- Epidemiology heatmaps

### Interactive Tools ✅

- Toxic food checker
- Pet age calculator
- QR tag scanning and assignment

### Adoptions System ✅ (NEW)

- Pet adoption listings with photos and descriptions
- Featured adoptions display
- Adoption applications workflow
- Application status tracking (pending, approved, rejected)
- Adopter management

### Lost & Found Module ✅ (NEW)

- Lost pet reporting with photos and last seen location
- Sighting reports from community
- Lost/found pet matching
- Status tracking (lost, found, reunited)
- Public lost pet listings

### Procurement System ✅ (NEW)

- Supplier management with contact info and verification
- Supplier product catalogs with pricing
- Purchase order creation and tracking
- Price comparison across suppliers
- Procurement leads and suggestions
- Order history and analytics

### Referral Program ✅ (NEW)

- Referral code generation
- Referral tracking with status (pending, trial_started, converted, expired)
- Commission calculation on successful referrals
- Referral statistics dashboard
- Automated referral processing

### Platform Administration ✅ (NEW)

- Multi-tenant management dashboard
- Platform-wide announcements
- Commission invoice generation
- Platform billing management
- Tenant feature tier management
- Bank transfer verification

### Ambassador Program ✅ (NEW)

- Individual ambassador registration (students, teachers, vet assistants)
- Three-tier commission system:
  - Embajador (1+ conversions): 30% commission
  - Promotor (5+ conversions): 40% commission
  - Super (10+ conversions): 50% commission
- Automatic tier upgrades on conversion thresholds
- Referral code generation and tracking
- Bank transfer payout management
- Statistics dashboard with tier progression
- Lifetime Professional plan for ambassadors

### Pre-Generation System ✅ (NEW)

- Pre-generated clinic websites from scraped data
- Claim flow at `/reclamar` for clinic owners
- Status tracking: pregenerated → claimed → active → suspended
- Auto-creates user account and profile on claim
- Immediate free trial activation
- ROI guarantee messaging
- Supports clinic types: general, emergency, specialist, grooming, rural

### Cron Monitoring ✅ (NEW)

- Health check endpoint at `/api/health/cron`
- Automatic failure alerting on job errors
- High error rate detection (>10% threshold)
- Slow job detection (>2 minute threshold)
- Expected interval + grace period tracking
- Critical vs non-critical job classification

### API Coverage

- **450+ HTTP methods** across **269 API route files**
- **42 Server Actions** for form mutations
- **14 Cron job endpoints** for background tasks (100% test coverage)
- Rate limiting on sensitive endpoints (Upstash Redis)
- Full Zod validation on inputs
- Atomic database operations for critical paths

### Planned / Future

- Multi-language support (English)
- Mobile app (React Native)
- Telemedicine integration
- Advanced analytics dashboards
- Automated reminder campaigns (SMS/Email)

---

_Last updated: January 2026_
