# Architecture Overview

Vete is a multi-tenant Next.js 15 application designed to host multiple veterinary clinic websites from a single codebase.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Pet Owner  │  │     Vet     │  │   Admin     │              │
│  │   Browser   │  │   Browser   │  │   Browser   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APPLICATION                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   App Router                             │    │
│  │  ┌─────────┐  ┌─────────────┐  ┌─────────────────────┐  │    │
│  │  │  /[clinic]  │  │  /api/*      │  │  /auth/*          │  │    │
│  │  │  Dynamic │  │  REST API   │  │  Auth Routes     │  │    │
│  │  │  Routes  │  │  Endpoints  │  │  (Supabase)      │  │    │
│  │  └─────────┘  └─────────────┘  └─────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  JSON-CMS    │  │   Server     │  │  Theme Provider      │   │
│  │  Content     │  │   Actions    │  │  (CSS Variables)     │   │
│  │  Loader      │  │              │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ PostgreSQL  │  │    Auth     │  │   Storage   │              │
│  │  + RLS      │  │             │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Core Architectural Patterns

### 1. Multi-Tenancy via Dynamic Routes

The application uses Next.js dynamic routing (`/[clinic]/*`) to serve multiple clinic websites.

```
/adris              → Adris clinic homepage
/adris/services     → Adris services page
/petlife            → PetLife clinic homepage
/petlife/services   → PetLife services page
```

**Key files:**
- `app/[clinic]/layout.tsx` - Loads clinic config, applies theme
- `app/[clinic]/page.tsx` - Clinic homepage
- `lib/clinics.ts` - Content loading utilities

```typescript
// lib/clinics.ts
export async function getClinicData(slug: string): Promise<ClinicData> {
  const config = await loadJson(`.content_data/${slug}/config.json`);
  const theme = await loadJson(`.content_data/${slug}/theme.json`);
  // ... load other JSON files
  return { config, theme, ... };
}
```

### 2. JSON-CMS Content System

Content is stored in JSON files, decoupled from code:

```
.content_data/
├── _TEMPLATE/           # Template for new clinics
├── adris/
│   ├── config.json      # Clinic settings
│   ├── theme.json       # Visual theme
│   ├── home.json        # Homepage content
│   ├── services.json    # Service catalog
│   ├── about.json       # About page
│   ├── faq.json         # FAQ content
│   └── testimonials.json
└── petlife/
    └── ...
```

**Benefits:**
- Non-developers can edit content
- No rebuild required for content changes
- Each clinic fully isolated
- Easy to add new clinics

### 3. Dynamic Theming

The `ClinicThemeProvider` component injects CSS variables at runtime:

```tsx
// components/clinic-theme-provider.tsx
export function ClinicThemeProvider({ theme, children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.colors.primary.main);
    root.style.setProperty('--bg-default', theme.colors.background.default);
    // ... more variables
  }, [theme]);

  return <>{children}</>;
}
```

**Usage in components:**
```tsx
<button className="bg-[var(--primary)] text-white">
  Book Now
</button>
```

### 4. Database with Row-Level Security

All data is isolated by tenant using PostgreSQL RLS:

```sql
-- Every table has tenant_id
CREATE TABLE pets (
    id UUID PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(id),
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    ...
);

-- RLS policies ensure isolation
CREATE POLICY "Users see own tenant data"
ON pets FOR SELECT
USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
```

### 5. Role-Based Access Control

Three user roles with different permissions:

| Role | Description | Access |
|------|-------------|--------|
| `owner` | Pet owners | Own pets, appointments, records |
| `vet` | Veterinarians | All patient data, prescriptions |
| `admin` | Administrators | Everything + settings |

Implemented via `is_staff_of()` PostgreSQL function:

```sql
CREATE FUNCTION is_staff_of(in_tenant_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND tenant_id = in_tenant_id
        AND role IN ('vet', 'admin')
    );
$$ LANGUAGE sql SECURITY DEFINER;
```

## Directory Structure

```
web/
├── app/                      # Next.js App Router
│   ├── [clinic]/             # Multi-tenant routes
│   │   ├── layout.tsx        # Clinic layout + theme
│   │   ├── page.tsx          # Homepage
│   │   ├── services/         # Service pages
│   │   ├── portal/           # Authenticated portal
│   │   ├── dashboard/        # Staff dashboard
│   │   └── tools/            # Interactive tools
│   ├── api/                  # REST API routes
│   ├── actions/              # Server Actions
│   └── auth/                 # Auth routes
│
├── components/               # React components
│   ├── layout/               # Layout components
│   ├── ui/                   # UI primitives
│   ├── clinical/             # Clinical tools
│   ├── booking/              # Booking flow
│   └── ...
│
├── lib/                      # Utilities
│   ├── clinics.ts            # Content loading
│   └── supabase/             # Database clients
│
├── db/                       # SQL migrations
│   ├── 01_extensions.sql
│   ├── 02_schema_core.sql
│   └── ...
│
├── .content_data/            # JSON-CMS content
│   ├── adris/
│   └── petlife/
│
└── tests/                    # Test suite
```

## Data Flow

### 1. Page Load Flow

```
User visits /adris/services
         │
         ▼
┌────────────────────────┐
│  Next.js Router        │
│  Matches [clinic]      │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  layout.tsx            │
│  - Load clinic config  │
│  - Apply theme         │
│  - Render layout       │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  page.tsx              │
│  - Load services.json  │
│  - Render content      │
└────────────────────────┘
```

### 2. API Request Flow

```
Client makes API request
         │
         ▼
┌────────────────────────┐
│  API Route Handler     │
│  /api/pets/route.ts    │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Supabase Client       │
│  - Get auth context    │
│  - RLS automatically   │
│    filters by tenant   │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  PostgreSQL            │
│  - Execute query       │
│  - Apply RLS policies  │
└────────────────────────┘
```

## Key Design Decisions

### Why Next.js App Router?

- Server Components by default (better performance)
- Built-in API routes
- Static generation for clinic pages
- Server Actions for mutations

### Why Supabase?

- PostgreSQL with RLS for multi-tenancy
- Built-in authentication
- File storage for pet photos
- Real-time subscriptions
- Free tier generous for MVP

### Why JSON-CMS over Headless CMS?

- Simpler deployment (no external service)
- Content versioned with code
- Faster page loads (no API calls)
- Full control over schema

### Why Tailwind v3 (not v4)?

- v4 has issues scanning JSON files
- Stable and well-documented
- Works with our `.content_data` pattern

## Related Documentation

- [Multi-Tenancy Deep Dive](multi-tenancy.md)
- [JSON-CMS System](json-cms.md)
- [Theming Engine](theming.md)
- [Security & RLS](security.md)
- [Database Schema](../database/overview.md)
