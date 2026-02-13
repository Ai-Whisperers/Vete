# Vete - Multi-Tenant Veterinary Platform

A comprehensive SaaS veterinary clinic management platform built with Next.js 15, Supabase, and TypeScript. Hosts multiple clinics from a single codebase using dynamic routing and a JSON-based CMS pattern.

**Target Market:** Paraguay (Spanish UI)

## Key Features

- **Multi-Tenant Architecture** - Each clinic gets its own branded site via dynamic `[clinic]` routing
- **Pet Owner Portal** - Appointments, medical records, vaccines, prescriptions, loyalty points
- **Staff Dashboard** - Patient management, scheduling, invoicing, inventory, analytics
- **E-Commerce Store** - Product catalog, cart, checkout, prescription verification
- **Clinical Tools** - Drug dosage calculator, diagnosis codes, growth charts, quality of life assessments
- **Hospitalization Module** - Kennel management, vitals tracking, treatment sheets
- **Laboratory Module** - Test ordering, results entry, reference ranges
- **Messaging** - Internal messaging, WhatsApp integration, SMS reminders
- **Adoptions System** - Pet adoption matching and applications
- **Lost & Found** - Lost pet reporting with sighting tracking
- **Procurement** - Purchase orders, supplier management, price comparison
- **Insurance Claims** - Policy management, claim submission, pre-authorization

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js (App Router) | 15.5.9 |
| **React** | React | 19.2.3 |
| **Language** | TypeScript | 5.x (strict mode) |
| **Styling** | Tailwind CSS | 3.4.19 |
| **Database** | Supabase (PostgreSQL) | 2.88.0 |
| **ORM** | Drizzle ORM | 0.45.1 |
| **State** | Zustand | 5.0.9 |
| **Data Fetching** | TanStack React Query | 5.90.12 |
| **Forms** | React Hook Form + Zod | 7.69.0 / 4.2.1 |
| **Background Jobs** | Inngest | 3.48.1 |
| **Rate Limiting** | Upstash | 2.0.7 |
| **Payments** | Stripe | 20.1.0 |
| **SMS** | Twilio | 5.10.7 |
| **Email** | Resend | 6.6.0 |
| **i18n** | next-intl | 4.7.0 |
| **PDF Generation** | @react-pdf/renderer | 4.3.1 |
| **Charts** | Recharts | 3.6.0 |
| **Maps** | Leaflet + React Leaflet | 1.9.4 / 5.0.0 |
| **Testing** | Vitest + Playwright | 4.0.16 / 1.57.0 |
| **Component Docs** | Storybook | 8.6.14 |

## Quick Start

### Prerequisites

- **Node.js 18+** (Recommended: Node.js 20 or 22)
- **npm 9+** or **pnpm 8+** (npm comes with Node.js)
- **Git** for version control
- **Supabase account** (free tier available at [supabase.com](https://supabase.com))
- **Upstash Redis account** (free tier available at [upstash.com](https://upstash.com)) for rate limiting

### Step-by-Step Setup

#### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/Ai-Whisperers/Vete.git
cd Vete/web

# Install dependencies (using npm)
npm install
# OR using pnpm (faster)
pnpm install
```

#### 2. Supabase Setup

1. **Create a Supabase project:**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose a name and region (recommended: South America for Paraguay)
   - Set a secure database password

2. **Get your Supabase credentials:**
   - Go to Project Settings > API
   - Copy:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)
   - Go to Project Settings > Database > Connection string
   - Copy the URI → `DATABASE_URL`

3. **Set up Upstash Redis (for rate limiting):**
   - Go to [console.upstash.com](https://console.upstash.com)
   - Create a new Redis database
   - Copy:
     - `REST URL` → `UPSTASH_REDIS_REST_URL`
     - `REST Token` → `UPSTASH_REDIS_REST_TOKEN`

#### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your credentials
# You can use nano, vim, or any text editor
nano .env.local
```

Fill in the required variables:
```env
# REQUIRED - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

# REQUIRED - Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# OPTIONAL but recommended
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Vete
```

#### 4. Database Setup

```bash
# Apply database schema and seed with demo data
npm run db:setup

# OR run step by step:
npm run db:schema    # Apply schema only
npm run seed:demo    # Seed demo data (recommended for development)
```

#### 5. Start Development Server

```bash
# Start the development server
npm run dev

# The server will start on http://localhost:3000
```

#### 6. Access Demo Clinics

Once running, you can access:

| URL | Description | Login Credentials |
|-----|-------------|-------------------|
| http://localhost:3000/terrapet | Veterinaria Adris (demo clinic) | Staff: `staff@terrapet.com` / `password123` |
| http://localhost:3000/petlife | PetLife Center (demo clinic) | Staff: `staff@petlife.com` / `password123` |
| http://localhost:3000/terrapet/portal | Pet owner portal | Owner: `owner@example.com` / `password123` |
| http://localhost:3000/terrapet/dashboard | Staff dashboard | Staff: `staff@terrapet.com` / `password123` |

### Common Issues & Solutions

#### 1. "Database connection failed"
- **Cause:** Invalid DATABASE_URL or Supabase project not active
- **Solution:** Verify your Supabase project is running and credentials are correct

#### 2. "Rate limiting not working"
- **Cause:** Missing Upstash Redis credentials
- **Solution:** Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local

#### 3. "TypeScript errors after installation"
- **Cause:** Node.js version mismatch or corrupted node_modules
- **Solution:**
  ```bash
  rm -rf node_modules package-lock.json
  npm cache clean --force
  npm install
  ```

#### 4. "Build fails with Tailwind errors"
- **Cause:** Using Tailwind v4 (project requires v3)
- **Solution:** Ensure package.json has `"tailwindcss": "^3.4.19"` (not ^4.x)

#### 5. "Cannot find module" errors
- **Cause:** Missing dependencies or incorrect installation
- **Solution:**
  ```bash
  npm install
  npm run typecheck  # Check for TypeScript issues
  ```

### Next Steps After Setup

1. **Run tests** to verify everything works:
   ```bash
   npm run test:unit      # Unit tests
   npm run test:api       # API tests
   npm run test:coverage  # Coverage report
   ```

2. **Explore the codebase:**
   - Check `docs/ARCHITECTURE.md` for system overview
   - Review `components/ARCHITECTURE_GUIDE.md` for component patterns
   - Examine `.claude/exemplars/` for code examples

3. **Start developing:**
   - Create a new branch: `git checkout -b feature/your-feature`
   - Make changes following existing patterns
   - Run tests before committing: `npm run test`
   - Submit a pull request

### Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:3000/terrapet | Veterinaria Adris (demo clinic) |
| http://localhost:3000/petlife | PetLife Center (demo clinic) |
| http://localhost:3000/terrapet/portal | Pet owner portal |
| http://localhost:3000/terrapet/dashboard | Staff dashboard |

## Project Structure

```
Vete/
├── CLAUDE.md                      # AI assistant context
├── web/                           # Next.js application
│   ├── app/
│   │   ├── [clinic]/              # Multi-tenant dynamic routes
│   │   │   ├── dashboard/         # Staff dashboard (27 modules)
│   │   │   ├── portal/            # Pet owner portal (29 modules)
│   │   │   ├── book/              # Appointment booking
│   │   │   ├── cart/              # Shopping cart + checkout
│   │   │   └── tools/             # Interactive clinical tools
│   │   ├── api/                   # REST API (313 route files)
│   │   ├── actions/               # Server Actions (37 files)
│   │   └── auth/                  # Authentication routes
│   │
│   ├── components/                # React components (49 directories)
│   │   ├── ui/                    # Shadcn UI components
│   │   ├── clinical/              # Clinical tools UI
│   │   ├── store/                 # E-commerce components
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── hooks/                 # Custom React hooks (10 hooks)
│   │   ├── constants/             # Centralized constants
│   │   ├── types/                 # TypeScript definitions
│   │   ├── supabase/              # Database clients
│   │   └── ...                    # 50+ utility modules
│   │
│   ├── db/
│   │   ├── migrations/            # 94 sequential SQL migrations
│   │   ├── seeds/                 # Data seeding scripts
│   │   └── schema/                # Schema definitions
│   │
│   ├── .content_data/             # JSON-CMS content per clinic
│   │   ├── _TEMPLATE/             # Template for new clinics
│   │   ├── terrapet/                 # Veterinaria Adris content
│   │   └── petlife/               # PetLife Center content
│   │
│   ├── tests/                     # Test suites
│   │   ├── unit/                  # Unit tests
│   │   ├── integration/           # Integration tests
│   │   ├── api/                   # API tests
│   │   ├── e2e/                   # Playwright E2E tests
│   │   └── security/              # Security tests
│   │
│   └── docs/                      # Technical documentation
│
└── documentation/                 # Extended documentation
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

### Required Variables (4)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://...
```

### Optional Variables (73)

See `../docs/ENV_COMPLETE_REFERENCE.md` for complete documentation of all 77 variables including:
- Email configuration (Resend, SendGrid, SMTP)
- WhatsApp/Twilio integration
- Stripe payments
- Redis caching
- Monitoring (Sentry, Datadog)
- Feature flags

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run typecheck` | TypeScript type checking |
| `npm run format` | Format with Prettier |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test` | Run all tests |
| `npm run test:unit` | Unit tests with coverage |
| `npm run test:integration` | Integration tests |
| `npm run test:api` | API route tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:ui` | E2E with Playwright UI |
| `npm run test:coverage` | Generate coverage report |

### Feature-Specific Tests

| Command | Description |
|---------|-------------|
| `npm run test:feature:pets` | Pet management tests |
| `npm run test:feature:booking` | Booking/appointments tests |
| `npm run test:feature:vaccines` | Vaccine tracking tests |
| `npm run test:feature:inventory` | Inventory management tests |
| `npm run test:feature:store` | E-commerce tests |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:setup` | Full database setup |
| `npm run db:schema` | Apply schema only |
| `npm run db:clean` | Clean database |
| `npm run seed` | Default seed |
| `npm run seed:demo` | Demo data seed |
| `npm run seed:v2:demo` | Enhanced seeder (recommended) |

### Utilities

| Command | Description |
|---------|-------------|
| `npm run sync:images` | Sync clinic images |
| `npm run inventory:template` | Generate inventory template |
| `npm run screenshots` | Capture screenshots |
| `npm run reset-dev` | Reset dev environment |

See `docs/SCRIPTS.md` for complete reference of all 83 scripts.

## Multi-Tenant Architecture

### How It Works

1. **Dynamic Routing**: `app/[clinic]/*` routes serve content for each tenant
2. **JSON-CMS**: Clinic content in `.content_data/[clinic-slug]/`
3. **Theme System**: CSS variables from `theme.json` per clinic
4. **RLS Security**: Row-Level Security on all database tables

### Adding a New Clinic

1. Create folder: `.content_data/[clinic-slug]/`
2. Copy files from `_TEMPLATE/`
3. Edit `config.json`, `theme.json`, etc.
4. Add tenant record in Supabase `tenants` table
5. Deploy - routes auto-generate

## API Overview

| Category | Routes | Description |
|----------|--------|-------------|
| Appointments | 20+ | Booking, slots, waitlist, recurrence |
| Store | 25+ | Products, cart, checkout, coupons |
| Inventory | 15+ | Stock, adjustments, receiving, barcode |
| Billing | 15+ | Invoices, payments, bank transfers |
| Pets | 10+ | CRUD, vaccines, medical records |
| Cron Jobs | 18 | Background processing |
| **Total** | **313 route files** | **~480+ HTTP methods** |

## Cron Jobs

| Endpoint | Purpose |
|----------|---------|
| `/api/cron/billing/auto-charge` | Auto-charge subscriptions |
| `/api/cron/release-reservations` | Release expired cart reservations |
| `/api/cron/reminders` | Process appointment/vaccine reminders |
| `/api/cron/stock-alerts` | Low stock notifications |
| `/api/cron/expiry-alerts` | Product expiry alerts |
| + 9 more | See `docs/ARCHITECTURE.md` |

## Custom Hooks

Located in `lib/hooks/`:

| Hook | Purpose |
|------|---------|
| `useAsyncData` | Data fetching with loading/error states |
| `useModal` | Modal state management |
| `useModalWithData` | Modal with data payload |
| `useSyncedState` | localStorage + API sync |
| `useFormState` | Form management with Zod validation |
| `useConfirmation` | Promise-based confirmation dialogs |
| `useLocalStorage` | Simple localStorage persistence |
| `useDashboardLabels` | Dashboard label provider |
| `useBarcodeScanner` | Barcode scanning |
| `useImportWizard` | Data import wizard |

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy

### Environment Variables for Production

Ensure these are set:
- All Supabase variables
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `CRON_SECRET` (for cron job security)
- Email provider credentials
- (Optional) Stripe, Twilio for full functionality

## Critical Warnings

1. **Tailwind v3 ONLY** - Do NOT upgrade to v4 (build breaks)
2. **Hidden content directory** - `.content_data` is dot-prefixed intentionally
3. **RLS required** - Never create tables without Row-Level Security
4. **Spanish content** - All user-facing text in Spanish
5. **Theme variables** - Never hardcode colors, use `var(--primary)` etc.

## Documentation

| Document | Description |
|----------|-------------|
| `CLAUDE.md` | AI assistant context (project root) |
| `docs/ARCHITECTURE.md` | System architecture overview |
| `docs/SCRIPTS.md` | Complete npm scripts reference |
| `.env.example` | Environment variables reference |
| `components/ARCHITECTURE_GUIDE.md` | Component patterns |

## Contributing

1. Run `npm run lint` before committing
2. Add tests for new features
3. Follow existing patterns (see exemplars in `.claude/exemplars/`)
4. Use Spanish for user-facing text

## License

Private - All rights reserved

---

*Last updated: January 2026*
