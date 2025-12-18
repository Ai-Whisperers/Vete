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

| Component | Technology | Version | Notes |
|-----------|------------|---------|-------|
| Framework | Next.js (App Router) | 15.5.9 | Server Components by default |
| Language | TypeScript | 5.x | Strict mode enabled |
| Styling | Tailwind CSS | **3.4.19** | **DO NOT upgrade to v4** |
| Database | Supabase (PostgreSQL) | 2.88.0 | RLS for multi-tenancy |
| Auth | Supabase Auth | - | Email/Password |
| Storage | Supabase Storage | - | Pet photos, vaccines, docs |
| PDF | @react-pdf/renderer | 4.3.1 | Prescription PDFs |
| Charts | recharts | 3.6.0 | Growth charts, analytics |
| Testing | Vitest + Playwright | Latest | Unit + E2E |

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
│   │   └── supabase/             # DB client (server/client)
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
│   └── api/                      # API reference
└── .claude/                      # Claude Code configuration
    ├── commands/                 # Slash commands
    └── exemplars/                # Code pattern examples
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

| Role | Description | Access |
|------|-------------|--------|
| `owner` | Pet owners | Own pets, book appointments, view records |
| `vet` | Veterinarians | All patients, create prescriptions, clinical tools |
| `admin` | Clinic admins | Everything + settings, team, finances |

**Security function**: `is_staff_of(tenant_id)` checks if user is vet/admin in that tenant.

## Database Schema (Key Tables)

```sql
-- Core (tenant isolation)
tenants (id, name)
profiles (id, tenant_id, role, full_name, email)
clinic_invites (email, tenant_id, role)

-- Pet Management
pets (id, owner_id, tenant_id, name, species, breed, ...)
vaccines (id, pet_id, vaccine_name, date_administered, next_due)
medical_records (id, pet_id, tenant_id, record_type, notes, ...)
qr_tags (id, code, pet_id)

-- Clinical Tools
diagnosis_codes (id, code, term, description)  -- VeNom/SNOMED
drug_dosages (id, drug_name, species, dosage_per_kg, route)
prescriptions (id, pet_id, vet_id, drug_name, dosage, ...)
vaccine_reactions (id, pet_id, vaccine_id, reaction_type, ...)
euthanasia_assessments (id, pet_id, hurt_score, hunger_score, ...)

-- Business
appointments (id, clinic_slug, pet_id, service_id, appointment_date)
store_products (id, tenant_id, sku, name, price)
store_inventory (id, product_id, current_stock)
expenses (id, clinic_id, category, amount)
loyalty_points (id, user_id, balance, lifetime_earned)
```

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

Required in `web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
DATABASE_URL=postgresql://...
```

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
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Get tenant context
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  // 3. Query with tenant filter
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('tenant_id', profile.tenant_id)

  // 4. Return response
  return NextResponse.json(data)
}
```

### User-Facing Text
- **All text in Spanish** (Paraguay market)
- Error messages: `"No autorizado"`, `"Error al guardar"`, etc.
- Button labels: `"Guardar"`, `"Cancelar"`, `"Enviar"`, etc.

---

## Slash Commands (Use with `/command`)

| Command | Purpose |
|---------|---------|
| `/add-feature` | Add new feature with proper patterns |
| `/add-clinic` | Onboard a new clinic tenant |
| `/add-api` | Create Supabase-connected API route |
| `/add-migration` | Create SQL migration with RLS |
| `/add-component` | Create themed React component |
| `/run-tests` | Execute test suite |
| `/review-code` | Project-specific code review |
| `/debug` | Structured debugging approach |

## Exemplars (Pattern Reference)

Located in `.claude/exemplars/`:

| File | Shows |
|------|-------|
| `nextjs-page-exemplar.md` | Server Components, SSG, multi-tenant pages |
| `supabase-api-exemplar.md` | Auth, RLS, tenant isolation patterns |
| `react-component-exemplar.md` | Theme variables, TypeScript, accessibility |
| `database-migration-exemplar.md` | RLS policies, indexes, triggers |
| `vitest-testing-exemplar.md` | Unit tests, mocking, parameterized tests |
| `server-action-exemplar.md` | Form handling, validation, mutations |

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

### Adding a New Page

```typescript
// web/app/[clinic]/new-page/page.tsx
import { getClinicData } from '@/lib/clinics'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ clinic: string }>
}

export async function generateStaticParams() {
  return [{ clinic: 'adris' }, { clinic: 'petlife' }]
}

export default async function NewPage({ params }: Props) {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)

  if (!clinicData) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {clinicData.config.name}
      </h1>
    </div>
  )
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

---

## Documentation Reference

For deeper understanding, see `documentation/`:

| Topic | File |
|-------|------|
| Architecture | `documentation/architecture/overview.md` |
| Multi-tenancy | `documentation/architecture/multi-tenancy.md` |
| Database schema | `documentation/database/schema-reference.md` |
| RLS policies | `documentation/database/rls-policies.md` |
| All features | `documentation/features/overview.md` |
| API reference | `documentation/api/overview.md` |

## Security Audit

The `.claude/SUPABASE_AUDIT.md` contains a comprehensive security audit with all fixes applied. Key points:

- All API routes have authentication
- All sensitive tables have RLS
- Dynamic `tenant_id` (not hardcoded)
- QR tag theft prevention
- Proper signup trigger with invite tenant

---

## Feature Status

### Live Features
- Multi-tenant public websites with dynamic theming
- Authentication (Supabase Auth)
- Pet profiles with photos and QR codes
- Vaccine records with PDF generation
- Medical records and prescriptions
- Appointment booking system
- Staff dashboard
- Inventory management (WAC)
- Financial expense tracking
- Loyalty points program
- Clinical tools (drug dosages, growth charts, diagnosis codes)
- Quality of life assessments (HHHHHMM scale)
- Epidemiology reports

### In Progress
- Enhanced analytics dashboard
- Epidemiology heatmaps
- Campaign management

### Planned
- SMS/Email reminders
- Multi-language support
- Mobile app integration

---

*Last updated: December 2024*
