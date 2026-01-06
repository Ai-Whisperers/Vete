# Architecture Overview - Vete Platform

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Browser (Pet Owner / Vet / Admin)                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Next.js 15 App Router                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   /[clinic]/*   │  │     /api/*      │  │       /auth/*               │  │
│  │  Dynamic Pages  │  │  REST APIs      │  │    Supabase Auth            │  │
│  │  (SSR + SSG)    │  │  (256 routes)   │  │                             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   JSON-CMS      │  │ Server Actions  │  │     Inngest                 │  │
│  │ .content_data/  │  │  (42 actions)   │  │  Background Jobs            │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │    Supabase     │ │    Upstash      │ │   External      │
          │   PostgreSQL    │ │     Redis       │ │   Services      │
          │   + RLS         │ │   Rate Limit    │ │ Stripe/Twilio   │
          │   + Storage     │ │   + Caching     │ │ Resend/etc      │
          └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Directory Structure (Complete)

```
web/
├── app/                                    # Next.js App Router
│   ├── [clinic]/                           # Multi-tenant routes
│   │   ├── layout.tsx                      # Theme provider, clinic config
│   │   ├── page.tsx                        # Homepage
│   │   │
│   │   ├── dashboard/                      # Staff dashboard (35+ modules)
│   │   │   ├── admin/                      # Admin-only settings
│   │   │   ├── adoptions/                  # Pet adoption management
│   │   │   ├── analytics/                  # Business analytics
│   │   │   ├── appointments/               # Appointment management
│   │   │   ├── audit/                      # Audit log viewer
│   │   │   ├── calendar/                   # Staff scheduling
│   │   │   ├── campaigns/                  # Marketing campaigns
│   │   │   ├── clients/                    # Client management
│   │   │   ├── commissions/                # Commission tracking
│   │   │   ├── consents/                   # Consent management
│   │   │   ├── coupons/                    # Discount management
│   │   │   ├── epidemiology/               # Disease mapping
│   │   │   ├── hospital/                   # Hospitalization management
│   │   │   ├── insurance/                  # Insurance claims
│   │   │   ├── inventory/                  # Stock management
│   │   │   ├── invoices/                   # Financial records
│   │   │   ├── lab/                        # Laboratory orders
│   │   │   ├── lost-pets/                  # Lost pet tracking
│   │   │   ├── orders/                     # Store orders
│   │   │   ├── patients/                   # Patient profiles
│   │   │   ├── reminders/                  # Reminder settings
│   │   │   ├── schedules/                  # Staff schedules
│   │   │   ├── service-subscriptions/      # Recurring services
│   │   │   ├── settings/                   # Clinic settings (6 sub-pages)
│   │   │   ├── team/                       # Staff management
│   │   │   ├── time-off/                   # Time-off requests
│   │   │   ├── vaccines/                   # Vaccine tracking
│   │   │   └── whatsapp/                   # WhatsApp integration
│   │   │
│   │   ├── portal/                         # Pet owner portal (38+ modules)
│   │   │   ├── adoptions/                  # Pet adoption browsing
│   │   │   ├── appointments/               # My appointments
│   │   │   ├── campaigns/                  # Active promotions
│   │   │   ├── dashboard/                  # Pet owner dashboard
│   │   │   ├── epidemiology/               # Health maps
│   │   │   ├── finance/                    # Payment history
│   │   │   ├── invoices/                   # Billing
│   │   │   ├── lost-found/                 # Lost & found pets
│   │   │   ├── loyalty/                    # Loyalty points
│   │   │   ├── messages/                   # Messaging
│   │   │   ├── notifications/              # Alert center
│   │   │   ├── payments/                   # Payment methods
│   │   │   ├── pets/                       # Pet management
│   │   │   ├── profile/                    # User profile
│   │   │   ├── subscriptions/              # Subscription management
│   │   │   └── wishlist/                   # Product wishlist
│   │   │
│   │   ├── book/                           # Appointment booking wizard
│   │   ├── cart/                           # Shopping cart
│   │   │   └── checkout/                   # Checkout flow
│   │   ├── consent/                        # Digital consent signing
│   │   ├── diagnosis_codes/                # Diagnosis search tool
│   │   ├── drug_dosages/                   # Drug calculator
│   │   ├── euthanasia_assessments/         # Quality of life tool
│   │   ├── growth_charts/                  # Growth chart tool
│   │   ├── reproductive_cycles/            # Reproductive tracking
│   │   ├── faq/                            # FAQ page
│   │   ├── about/                          # About page
│   │   └── services/                       # Services catalog
│   │
│   ├── api/                                # REST API (256 route files)
│   │   ├── admin/                          # Admin operations
│   │   │   └── products/                   # Product approval workflow
│   │   ├── adoptions/                      # Pet adoption APIs [NEW]
│   │   ├── analytics/                      # Business analytics
│   │   ├── appointments/                   # Appointment CRUD
│   │   ├── availability/                   # Slot checking
│   │   ├── billing/                        # Advanced billing [NEW]
│   │   │   ├── bank-transfer/              # Bank transfers
│   │   │   ├── commissions/                # Commission billing
│   │   │   └── stripe/                     # Stripe integration
│   │   ├── booking/                        # Public booking
│   │   ├── calendar/                       # Calendar APIs
│   │   ├── clients/                        # Client management
│   │   ├── consents/                       # Consent workflows
│   │   ├── conversations/                  # Messaging
│   │   ├── cron/                           # Background jobs (14 endpoints)
│   │   ├── dashboard/                      # Dashboard data
│   │   ├── diagnosis-codes/                # Diagnosis search
│   │   ├── drug-dosages/                   # Drug calculations
│   │   ├── hospitalizations/               # Hospital management
│   │   ├── insurance/                      # Insurance APIs
│   │   ├── inventory/                      # Stock management
│   │   ├── invoices/                       # Invoice operations
│   │   ├── kennels/                        # Kennel management
│   │   ├── lab-orders/                     # Laboratory
│   │   ├── lost-found/                     # Lost pet APIs [NEW]
│   │   ├── lost-pets/                      # Lost pet management
│   │   ├── messages/                       # Message templates
│   │   ├── orders/                         # Store orders
│   │   ├── pets/                           # Pet operations
│   │   ├── platform/                       # Platform admin [NEW]
│   │   │   ├── announcements/              # System announcements
│   │   │   ├── billing/                    # Platform billing
│   │   │   ├── commissions/                # Commission management
│   │   │   └── tenants/                    # Tenant management
│   │   ├── prescriptions/                  # Prescription generation
│   │   ├── procurement/                    # Procurement system [NEW]
│   │   │   ├── orders/                     # Purchase orders
│   │   │   ├── leads/                      # Supplier leads
│   │   │   └── compare/                    # Price comparison
│   │   ├── referrals/                      # Referral program [NEW]
│   │   ├── reminders/                      # Reminder management
│   │   ├── services/                       # Service catalog
│   │   ├── sms/                            # SMS integration
│   │   ├── store/                          # E-commerce (15+ endpoints)
│   │   │   ├── cart/                       # Shopping cart
│   │   │   ├── categories/                 # Product categories
│   │   │   ├── checkout/                   # Checkout processing
│   │   │   ├── coupons/                    # Coupon validation
│   │   │   ├── orders/                     # Order management
│   │   │   ├── products/                   # Product catalog
│   │   │   ├── subscriptions/              # Product subscriptions
│   │   │   ├── wishlist/                   # Wishlist management
│   │   │   └── stock-alerts/               # Stock notifications
│   │   ├── suppliers/                      # Supplier management [NEW]
│   │   ├── vaccines/                       # Vaccine APIs
│   │   ├── vaccine-reactions/              # Adverse events
│   │   └── webhooks/                       # External integrations
│   │
│   ├── actions/                            # Server Actions (42 files)
│   │   ├── appointments.ts
│   │   ├── create-pet.ts
│   │   ├── create-vaccine.ts
│   │   ├── invoices/                       # Invoice actions (6 files)
│   │   ├── medical-records.ts
│   │   ├── messages.ts
│   │   ├── pets.ts
│   │   ├── safety.ts
│   │   ├── schedules.ts
│   │   ├── store.ts
│   │   ├── whatsapp.ts
│   │   └── ...
│   │
│   ├── auth/                               # Authentication routes
│   ├── admin/                              # Platform admin pages
│   └── global/                             # Global layouts
│
├── components/                             # React components (49 directories)
│   ├── ui/                                 # Shadcn UI components
│   ├── clinical/                           # Clinical tools UI
│   ├── store/                              # E-commerce components
│   ├── dashboard/                          # Dashboard layouts
│   ├── portal/                             # Portal layouts
│   ├── booking/                            # Booking wizard
│   ├── inventory/                          # Stock management UI
│   ├── hospital/                           # Hospitalization UI
│   ├── lab/                                # Laboratory UI
│   ├── invoices/                           # Invoice UI
│   ├── messaging/                          # Chat UI
│   └── ...
│
├── lib/                                    # Utilities & helpers
│   ├── hooks/                              # Custom React hooks
│   │   ├── index.ts                        # Central exports
│   │   ├── use-async-data.ts               # Data fetching
│   │   ├── use-form-state.ts               # Form management
│   │   ├── use-modal.ts                    # Modal state
│   │   ├── use-synced-state.ts             # localStorage sync
│   │   ├── use-barcode-scanner.ts          # Barcode scanning
│   │   ├── use-import-wizard.ts            # Import wizard
│   │   ├── use-dashboard-labels.tsx        # Label provider
│   │   └── use-tenant-features.tsx         # Feature gating
│   │
│   ├── constants/                          # Centralized constants [NEW]
│   │   ├── messages.ts                     # Spanish error messages
│   │   ├── pagination.ts                   # Page size limits
│   │   ├── time.ts                         # Time constants/TTL
│   │   └── index.ts
│   │
│   ├── types/                              # TypeScript definitions
│   │   ├── entities/                       # Entity types [NEW]
│   │   ├── database/                       # Database types
│   │   └── ...
│   │
│   ├── api/                                # API utilities
│   │   ├── crud-handler.ts                 # Generic CRUD
│   │   ├── with-auth.ts                    # Auth middleware
│   │   └── verify-tenant.ts                # Tenant validation
│   │
│   ├── supabase/                           # Database clients
│   │   ├── client.ts                       # Browser client
│   │   ├── server.ts                       # Server client
│   │   └── admin.ts                        # Admin client
│   │
│   ├── test-utils/                         # Testing infrastructure
│   │   ├── index.ts                        # Central exports
│   │   ├── fixtures/                       # Test data
│   │   ├── factories.ts                    # Object factories
│   │   ├── mock-presets.ts                 # Mock configurations
│   │   └── request-helpers.ts              # Request mocking [NEW]
│   │
│   ├── billing/                            # Billing logic
│   ├── booking/                            # Booking logic
│   ├── cart/                               # Cart logic
│   ├── clinical/                           # Clinical logic
│   ├── cron/                               # Cron handlers
│   ├── email/                              # Email sending
│   ├── pricing/                            # Price calculation
│   ├── store/                              # Store logic
│   ├── whatsapp/                           # WhatsApp client
│   │
│   ├── clinics.ts                          # Content loading
│   ├── env.ts                              # Environment validation
│   ├── logger.ts                           # Logging
│   ├── rate-limit.ts                       # Rate limiting
│   └── tenant-features.ts                  # Feature flags
│
├── db/                                     # Database layer
│   ├── 00_setup/                           # Schema setup
│   ├── 10_core/                            # Core tables
│   ├── 20_pets/                            # Pet tables
│   ├── 30_clinical/                        # Clinical tables
│   ├── 40_scheduling/                      # Appointment tables
│   ├── 50_finance/                         # Invoice/payment tables
│   ├── 60_store/                           # E-commerce tables
│   ├── 70_communications/                  # Messaging tables
│   ├── 80_billing/                         # Platform billing
│   ├── 80_insurance/                       # Insurance tables
│   ├── 85_system/                          # System tables
│   ├── 90_infrastructure/                  # Infrastructure
│   ├── migrations/                         # 50+ migrations
│   ├── seeds/                              # Seeding scripts
│   │   ├── scripts/
│   │   │   ├── seed.ts                     # Original seeder
│   │   │   ├── seed-v2.ts                  # Enhanced seeder
│   │   │   └── seed-demo-data.ts           # Demo data
│   │   └── data/                           # Static seed data
│   └── schema/                             # Drizzle schema
│
├── .content_data/                          # JSON-CMS content
│   ├── _TEMPLATE/                          # Template for new clinics
│   ├── adris/                              # Veterinaria Adris
│   │   ├── config.json                     # Clinic settings
│   │   ├── theme.json                      # Colors & branding
│   │   ├── content.json                    # Page content
│   │   ├── labels.json                     # UI text
│   │   └── dashboard-labels.json           # Dashboard text
│   └── petlife/                            # PetLife Center
│
├── i18n/                                   # Internationalization
│   └── config.ts                           # i18n setup
│
├── messages/                               # Translation files
│   ├── es.json                             # Spanish (primary)
│   └── en.json                             # English
│
├── tests/                                  # Test suites
│   ├── unit/                               # Unit tests
│   ├── integration/                        # Integration tests
│   ├── api/                                # API tests
│   ├── e2e/                                # Playwright E2E
│   ├── security/                           # Security tests
│   └── __fixtures__/                       # Test data
│
├── e2e/                                    # Playwright tests
│   ├── public/                             # Public page tests
│   ├── store/                              # Store tests
│   ├── portal/                             # Portal tests
│   ├── dashboard/                          # Dashboard tests
│   └── screenshots.spec.ts                 # Screenshot capture
│
├── scripts/                                # Utility scripts
│   ├── screenshots/                        # Screenshot generation
│   ├── sync-clinic-images.ts               # Image sync
│   └── generate-inventory-template.ts      # Inventory template
│
└── public/                                 # Static assets
    └── branding/                           # Clinic logos
```

## Multi-Tenant Design

### Dynamic Routing

```typescript
// app/[clinic]/page.tsx
export async function generateStaticParams() {
  return [{ clinic: 'adris' }, { clinic: 'petlife' }]
}

export default async function ClinicPage({ params }: Props) {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)
  // ...
}
```

### JSON-CMS Content Loading

```typescript
// lib/clinics.ts
export async function getClinicData(clinicSlug: string) {
  const config = await import(`.content_data/${clinicSlug}/config.json`)
  const theme = await import(`.content_data/${clinicSlug}/theme.json`)
  // ...
}
```

### Row-Level Security (RLS)

Every table uses RLS for tenant isolation:

```sql
CREATE POLICY "Tenant isolation" ON table_name
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Staff manage" ON table_name FOR ALL
  USING (is_staff_of(tenant_id));
```

## API Layer Details

### Route Organization

| Category | Route Pattern | Count |
|----------|--------------|-------|
| Core CRUD | `/api/[resource]` | 80+ |
| Nested Resources | `/api/[parent]/[id]/[child]` | 60+ |
| Actions | `/api/[resource]/[action]` | 50+ |
| Cron Jobs | `/api/cron/*` | 14 |
| Webhooks | `/api/webhooks/*` | 10+ |
| **Total** | | **256 files** |

### API Authentication Pattern

```typescript
// All API routes follow this pattern
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

  return NextResponse.json(data)
}
```

## Cron Jobs (14 Total)

| Endpoint | Purpose | Schedule |
|----------|---------|----------|
| `/api/cron/billing/auto-charge` | Auto-charge subscriptions | Daily |
| `/api/cron/billing/evaluate-grace` | Evaluate grace periods | Daily |
| `/api/cron/billing/generate-platform-invoices` | Generate platform invoices | Monthly |
| `/api/cron/billing/send-reminders` | Send billing reminders | Daily |
| `/api/cron/expiry-alerts` | Product expiry notifications | Daily |
| `/api/cron/generate-commission-invoices` | Generate commission invoices | Monthly |
| `/api/cron/generate-recurring` | Generate recurring appointments | Daily |
| `/api/cron/process-subscriptions` | Process subscriptions | Daily |
| `/api/cron/release-reservations` | Release expired cart reservations | Hourly |
| `/api/cron/reminders` | Process reminders | Hourly |
| `/api/cron/reminders/generate` | Generate reminder queue | Daily |
| `/api/cron/stock-alerts` | Low stock alerts | Daily |
| `/api/cron/stock-alerts/staff` | Staff stock notifications | Daily |

### Cron Security

All cron endpoints validate `CRON_SECRET`:

```typescript
// lib/cron/handler.ts
if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 })
}
```

## Custom Hooks Library

Location: `lib/hooks/`

### useAsyncData

Data fetching with loading/error states:

```typescript
const { data, isLoading, error, refetch } = useAsyncData(
  () => fetch('/api/pets').then(r => r.json()),
  [tenantId],
  { refetchInterval: 30000, enabled: !!tenantId }
)
```

### useFormState

Form management with Zod validation:

```typescript
const form = useFormState({
  initialValues: { name: '', species: 'dog' },
  schema: petSchema,
  onSubmit: async (values) => await createPet(values),
})
```

### useModal / useModalWithData

Modal state management:

```typescript
const editModal = useModalWithData<Pet>()
editModal.open(selectedPet)
// editModal.data contains the pet
```

### useSyncedState

localStorage + API synchronization:

```typescript
const [preferences, setPreferences] = useSyncedState('user-prefs', defaultPrefs, {
  syncToApi: true,
  apiEndpoint: '/api/preferences'
})
```

### useTenantFeatures

Tier-based feature gating:

```typescript
const { hasFeature, tier } = useTenantFeatures()

if (hasFeature('advanced_analytics')) {
  // Show advanced analytics
}

// Or use FeatureGate component
<FeatureGate feature="whatsapp">
  <WhatsAppIntegration />
</FeatureGate>
```

## State Management

### Client State: Zustand

```typescript
// Example store
import { create } from 'zustand'

const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}))
```

### Server State: TanStack Query

```typescript
// Example query
const { data: pets } = useQuery({
  queryKey: ['pets', tenantId],
  queryFn: () => fetch('/api/pets').then(r => r.json()),
  staleTime: 30000,
})
```

## Database Schema Overview

### Core Tables
- `tenants` - Clinic tenants
- `profiles` - User profiles (with role)
- `clinic_invites` - Staff/client invitations

### Pet Management
- `pets` - Pet profiles
- `vaccines` - Vaccine records
- `medical_records` - Medical history
- `prescriptions` - Digital prescriptions
- `qr_tags` - Pet identification tags

### Clinical
- `diagnosis_codes` - VeNom/SNOMED codes
- `drug_dosages` - Drug calculations
- `vaccine_reactions` - Adverse events
- `euthanasia_assessments` - Quality of life
- `growth_standards` - Growth charts

### Scheduling
- `services` - Service catalog
- `appointments` - Appointment records
- `staff_schedules` - Staff availability
- `staff_time_off` - Time-off requests

### Finance
- `invoices` - Invoice records
- `invoice_items` - Line items
- `payments` - Payment records
- `expenses` - Expense tracking
- `loyalty_points` - Loyalty program

### E-Commerce
- `store_products` - Product catalog
- `store_inventory` - Stock levels
- `store_orders` - Order records
- `store_carts` - Shopping carts
- `store_coupons` - Discount codes

### Hospitalization
- `kennels` - Kennel definitions
- `hospitalizations` - Admissions
- `hospitalization_vitals` - Vital signs
- `hospitalization_medications` - Treatments
- `hospitalization_feedings` - Feeding logs

### Laboratory
- `lab_test_catalog` - Test definitions
- `lab_orders` - Test orders
- `lab_results` - Results

### New Modules
- `adoptions` - Pet adoption listings
- `adoption_applications` - Applications
- `lost_pets` - Lost pet reports
- `lost_pet_sightings` - Sightings
- `procurement_orders` - Purchase orders
- `suppliers` - Supplier profiles
- `referral_codes` - Referral tracking
- `platform_announcements` - System announcements

## Authentication Flow

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐
│  User    │────▶│ Supabase Auth │────▶│   Database   │
│          │     │               │     │   (RLS)      │
└──────────┘     └───────────────┘     └──────────────┘
     │                  │
     │                  ▼
     │           ┌───────────────┐
     │           │  JWT Token    │
     │           │  + tenant_id  │
     │           └───────────────┘
     │                  │
     ▼                  ▼
┌──────────────────────────────────────┐
│        Application Routes            │
│  - middleware.ts validates session   │
│  - RLS enforces tenant isolation     │
└──────────────────────────────────────┘
```

### Invite System

1. Admin creates invite: `clinic_invites` table
2. User receives email with invite link
3. User signs up with invite token
4. Trigger assigns user to tenant with role

---

*Last updated: January 2026*
