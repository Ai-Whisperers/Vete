# Pages Refactoring Tasks

> **Priority:** MEDIUM
> **Total Tasks:** 32
> **Estimated Effort:** 14-20 hours

---

## CRITICAL: Large Pages to Split

### PAGE-001: Split Hospital Patient Page
**File:** `web/app/[clinic]/dashboard/hospital/[id]/page.tsx`
**Lines:** ~1,157
**Problem:** Combines patient details, vitals, medications, feedings, and discharge in one file

**Extract to:**
1. `web/components/hospital/patient-header.tsx` (~100 lines)
   - Patient info, photo, kennel assignment

2. `web/components/hospital/vitals-panel.tsx` (~200 lines)
   - Vitals form, history chart, alerts

3. `web/components/hospital/medications-panel.tsx` (~180 lines)
   - Medication list, administration log, scheduling

4. `web/components/hospital/feedings-panel.tsx` (~150 lines)
   - Feeding schedule, log, dietary notes

5. `web/components/hospital/treatment-sheet.tsx` (~200 lines)
   - Daily treatment summary, tasks

6. `web/components/hospital/discharge-panel.tsx` (~150 lines)
   - Discharge checklist, summary, billing

**Resulting page:** ~180 lines (composition only)

**Effort:** 4 hours

---

### PAGE-002: Split Pet Detail Page
**File:** `web/app/[clinic]/portal/pets/[id]/page.tsx`
**Lines:** ~650
**Problem:** Medical records, vaccines, and growth all inline

**Extract to:**
1. `web/components/pets/pet-profile-card.tsx` (~80 lines)
2. `web/components/pets/medical-timeline.tsx` (~150 lines)
3. `web/components/pets/vaccine-card.tsx` (~100 lines)
4. `web/components/pets/growth-chart-mini.tsx` (~120 lines)
5. `web/components/pets/documents-list.tsx` (~80 lines)

**Effort:** 2.5 hours

---

### PAGE-003: Split Dashboard Clients Page
**File:** `web/app/[clinic]/dashboard/clients/page.tsx`
**Lines:** ~580
**Problem:** Search, filters, table, and actions mixed together

**Extract to:**
1. `web/components/dashboard/clients/client-search-bar.tsx` (~80 lines)
2. `web/components/dashboard/clients/client-filters.tsx` (~100 lines)
3. `web/components/dashboard/clients/client-table.tsx` (~150 lines)
4. `web/components/dashboard/clients/client-row-actions.tsx` (~80 lines)
5. `web/components/dashboard/clients/bulk-actions-bar.tsx` (~60 lines)

**Effort:** 2 hours

---

### PAGE-004: Split Lab Orders Dashboard
**File:** `web/app/[clinic]/dashboard/lab/page.tsx`
**Lines:** ~520
**Problem:** Order list, result entry, and status management combined

**Extract to:**
1. `web/components/lab/lab-order-list.tsx` (~120 lines)
2. `web/components/lab/lab-order-card.tsx` (~80 lines)
3. `web/components/lab/result-entry-form.tsx` (~150 lines)
4. `web/components/lab/lab-status-badge.tsx` (~40 lines)

**Effort:** 2 hours

---

### PAGE-005: Split Invoice Detail Page
**File:** `web/app/[clinic]/dashboard/invoices/[id]/page.tsx`
**Lines:** ~480
**Problem:** Invoice display, editing, and payment recording in one file

**Extract to:**
1. `web/components/invoices/invoice-header.tsx` (~60 lines)
2. `web/components/invoices/invoice-line-items.tsx` (~120 lines)
3. `web/components/invoices/invoice-totals.tsx` (~80 lines)
4. `web/components/invoices/payment-recorder.tsx` (~100 lines)
5. `web/components/invoices/invoice-actions.tsx` (~60 lines)

**Effort:** 2 hours

---

## HIGH: Missing Error Boundaries

### PAGE-006: Add Error Boundaries to Dashboard Pages
**Files:** All files in `web/app/[clinic]/dashboard/*/`
**Problem:** No error boundaries - crashes show blank screen

**Create wrapper component:**
```typescript
// web/components/dashboard/dashboard-error-boundary.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Dashboard error:', error)
    // TODO: Send to error tracking service
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        Algo salió mal
      </h2>
      <p className="text-[var(--text-secondary)]">
        {error.message || 'Error al cargar la página'}
      </p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </div>
  )
}
```

**Add to each dashboard section:**
- `web/app/[clinic]/dashboard/error.tsx`
- `web/app/[clinic]/dashboard/clients/error.tsx`
- `web/app/[clinic]/dashboard/appointments/error.tsx`
- `web/app/[clinic]/dashboard/hospital/error.tsx`
- `web/app/[clinic]/dashboard/lab/error.tsx`
- `web/app/[clinic]/dashboard/invoices/error.tsx`
- `web/app/[clinic]/dashboard/inventory/error.tsx`

**Effort:** 1.5 hours

---

### PAGE-007: Add Error Boundaries to Portal Pages
**Files:** `web/app/[clinic]/portal/*/`
**Problem:** Pet owner portal has no error handling

**Create:**
- `web/app/[clinic]/portal/error.tsx`
- `web/app/[clinic]/portal/pets/error.tsx`
- `web/app/[clinic]/portal/appointments/error.tsx`
- `web/app/[clinic]/portal/messages/error.tsx`

**Effort:** 45 minutes

---

### PAGE-008: Add Error Boundaries to Public Pages
**Files:** `web/app/[clinic]/services/`, `web/app/[clinic]/store/`
**Problem:** Public-facing pages need graceful error handling

**Create with user-friendly messages:**
- `web/app/[clinic]/services/error.tsx`
- `web/app/[clinic]/store/error.tsx`
- `web/app/[clinic]/book/error.tsx`

**Effort:** 45 minutes

---

## HIGH: Missing SEO Metadata

### PAGE-009: Add Dynamic Metadata to Service Pages
**File:** `web/app/[clinic]/services/page.tsx`
**Problem:** Missing dynamic metadata for SEO

**Add:**
```typescript
import type { Metadata } from 'next'
import { getClinicData } from '@/lib/clinics'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)

  if (!clinicData) {
    return { title: 'Servicios' }
  }

  return {
    title: `Servicios Veterinarios | ${clinicData.config.name}`,
    description: `Consultas, vacunas, cirugías y más servicios en ${clinicData.config.name}`,
    openGraph: {
      title: `Servicios | ${clinicData.config.name}`,
      description: clinicData.services?.description || 'Servicios veterinarios profesionales',
      type: 'website',
    }
  }
}
```

**Effort:** 30 minutes

---

### PAGE-010: Add Metadata to All Public Pages
**Files needing metadata:**
- `web/app/[clinic]/about/page.tsx`
- `web/app/[clinic]/contact/page.tsx`
- `web/app/[clinic]/store/page.tsx`
- `web/app/[clinic]/store/product/[id]/page.tsx`
- `web/app/[clinic]/book/page.tsx`
- `web/app/[clinic]/tools/age-calculator/page.tsx`
- `web/app/[clinic]/tools/toxic-food/page.tsx`

**Create reusable metadata generator:**
```typescript
// web/lib/metadata.ts
import type { Metadata } from 'next'
import { getClinicData } from '@/lib/clinics'

export async function generateClinicMetadata(
  clinic: string,
  page: {
    title: string
    description: string
    path?: string
  }
): Promise<Metadata> {
  const clinicData = await getClinicData(clinic)
  const clinicName = clinicData?.config.name || 'Veterinaria'

  return {
    title: `${page.title} | ${clinicName}`,
    description: page.description,
    openGraph: {
      title: `${page.title} | ${clinicName}`,
      description: page.description,
      type: 'website',
      url: page.path ? `/${clinic}${page.path}` : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} | ${clinicName}`,
      description: page.description,
    }
  }
}
```

**Effort:** 2 hours

---

### PAGE-011: Add Structured Data to Product Pages
**File:** `web/app/[clinic]/store/product/[id]/page.tsx`
**Problem:** Missing JSON-LD for Google rich results

**Add:**
```typescript
// In the page component
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image_url,
  brand: {
    '@type': 'Brand',
    name: product.brand || clinicData.config.name,
  },
  offers: {
    '@type': 'Offer',
    price: product.base_price,
    priceCurrency: 'PYG',
    availability: product.stock_quantity > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
  }
}

// In return
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
```

**Effort:** 45 minutes

---

### PAGE-012: Add Structured Data to Service Pages
**File:** `web/app/[clinic]/services/[serviceId]/page.tsx`
**Problem:** Missing service schema for SEO

**Add Service and LocalBusiness schemas**

**Effort:** 45 minutes

---

## MEDIUM: Loading States

### PAGE-013: Add Suspense Boundaries with Loading UI
**Problem:** Pages show nothing while loading data

**Create loading components:**
```typescript
// web/app/[clinic]/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
```

**Add to:**
- `web/app/[clinic]/dashboard/loading.tsx`
- `web/app/[clinic]/dashboard/clients/loading.tsx`
- `web/app/[clinic]/dashboard/appointments/loading.tsx`
- `web/app/[clinic]/portal/loading.tsx`
- `web/app/[clinic]/store/loading.tsx`

**Effort:** 1.5 hours

---

### PAGE-014: Add Streaming for Large Data Pages
**Files:**
- `web/app/[clinic]/dashboard/clients/page.tsx`
- `web/app/[clinic]/dashboard/invoices/page.tsx`
- `web/app/[clinic]/store/page.tsx`

**Pattern:**
```typescript
import { Suspense } from 'react'

export default async function Page() {
  return (
    <div>
      <h1>Clientes</h1>
      <Suspense fallback={<ClientTableSkeleton />}>
        <ClientTable />
      </Suspense>
    </div>
  )
}

async function ClientTable() {
  const clients = await fetchClients() // Streamed
  return <Table data={clients} />
}
```

**Effort:** 2 hours

---

## MEDIUM: Server vs Client Optimization

### PAGE-015: Convert Interactive Sections to Client Components
**Problem:** Some pages mark entire page as client when only parts need it

**Files to optimize:**
- `web/app/[clinic]/dashboard/calendar/page.tsx` - Only calendar needs client
- `web/app/[clinic]/store/page.tsx` - Only filters and cart need client

**Pattern:**
```typescript
// page.tsx (Server Component)
import { ClientFilters } from './client-filters'
import { ProductGrid } from './product-grid'

export default async function StorePage() {
  const products = await fetchProducts() // Server fetch

  return (
    <div>
      <ClientFilters /> {/* Client Component */}
      <ProductGrid products={products} /> {/* Server Component */}
    </div>
  )
}
```

**Effort:** 2 hours

---

### PAGE-016: Move Data Fetching to Server Components
**Files with client-side fetching that could be server:**
- `web/app/[clinic]/services/page.tsx`
- `web/app/[clinic]/about/page.tsx`

**Pattern:**
```typescript
// Before (client fetch)
'use client'
const [services, setServices] = useState([])
useEffect(() => { fetchServices().then(setServices) }, [])

// After (server fetch)
export default async function ServicesPage() {
  const services = await getServices() // Direct DB call
  return <ServiceList services={services} />
}
```

**Effort:** 1 hour

---

## MEDIUM: Not Found Pages

### PAGE-017: Add Custom 404 Pages
**Problem:** Generic 404 doesn't match clinic branding

**Create:**
```typescript
// web/app/[clinic]/not-found.tsx
import Link from 'next/link'
import { getClinicData } from '@/lib/clinics'

export default async function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-[var(--primary)]">404</h1>
      <h2 className="text-2xl font-semibold mt-4 text-[var(--text-primary)]">
        Página no encontrada
      </h2>
      <p className="text-[var(--text-secondary)] mt-2 max-w-md">
        Lo sentimos, no pudimos encontrar la página que buscas.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
```

**Create for sections:**
- `web/app/[clinic]/not-found.tsx`
- `web/app/[clinic]/portal/not-found.tsx`
- `web/app/[clinic]/dashboard/not-found.tsx`

**Effort:** 1 hour

---

### PAGE-018: Add Pet Not Found Handler
**File:** `web/app/[clinic]/portal/pets/[id]/page.tsx`
**Problem:** Invalid pet ID shows error instead of friendly message

**Add:**
```typescript
import { notFound } from 'next/navigation'

export default async function PetPage({ params }: Props) {
  const pet = await getPet(params.id)

  if (!pet) {
    notFound()
  }

  // ... rest of component
}
```

**Apply to:**
- `web/app/[clinic]/portal/pets/[id]/page.tsx`
- `web/app/[clinic]/dashboard/appointments/[id]/page.tsx`
- `web/app/[clinic]/dashboard/invoices/[id]/page.tsx`
- `web/app/[clinic]/store/product/[id]/page.tsx`

**Effort:** 45 minutes

---

## MEDIUM: Accessibility

### PAGE-019: Add Skip Links to All Pages
**Problem:** No skip navigation for keyboard users

**Add to layout:**
```typescript
// web/app/[clinic]/layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded"
>
  Saltar al contenido principal
</a>

// In each page
<main id="main-content" tabIndex={-1}>
  {/* Page content */}
</main>
```

**Effort:** 30 minutes

---

### PAGE-020: Add ARIA Labels to Interactive Pages
**Files:**
- `web/app/[clinic]/book/page.tsx` - Form steps need labels
- `web/app/[clinic]/dashboard/calendar/page.tsx` - Calendar needs aria
- `web/app/[clinic]/store/page.tsx` - Filter controls

**Example:**
```typescript
<section aria-labelledby="services-heading">
  <h2 id="services-heading">Nuestros Servicios</h2>
  {/* content */}
</section>

<nav aria-label="Filtros de productos">
  {/* filter controls */}
</nav>
```

**Effort:** 1.5 hours

---

### PAGE-021: Add Focus Management to Multi-Step Forms
**File:** `web/app/[clinic]/book/page.tsx`
**Problem:** Focus doesn't move to new step content

**Add:**
```typescript
const stepRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  stepRef.current?.focus()
}, [currentStep])

// In return
<div ref={stepRef} tabIndex={-1} aria-live="polite">
  {/* Step content */}
</div>
```

**Effort:** 45 minutes

---

## LOW: Code Organization

### PAGE-022: Create Page Layout Components
**Problem:** Dashboard pages duplicate layout structure

**Create:**
```typescript
// web/components/dashboard/page-layout.tsx
interface PageLayoutProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function DashboardPageLayout({
  title,
  description,
  actions,
  children
}: PageLayoutProps) {
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-[var(--text-secondary)] mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </header>
      <main>{children}</main>
    </div>
  )
}
```

**Apply to all dashboard pages**

**Effort:** 2 hours

---

### PAGE-023: Consolidate generateStaticParams
**Problem:** `generateStaticParams` duplicated across 30+ pages

**Create utility:**
```typescript
// web/lib/static-params.ts
import { getActiveClinics } from '@/lib/clinics'

export async function generateClinicParams() {
  const clinics = await getActiveClinics()
  return clinics.map(clinic => ({ clinic: clinic.slug }))
}

// Usage in pages
export { generateClinicParams as generateStaticParams }
```

**Apply to all `[clinic]` pages**

**Effort:** 1.5 hours

---

### PAGE-024: Extract Common Data Fetching Patterns
**Problem:** Similar data fetching logic repeated

**Create:**
```typescript
// web/lib/page-data.ts
export async function getPageContext(clinic: string) {
  const [clinicData, user, profile] = await Promise.all([
    getClinicData(clinic),
    getUser(),
    getProfile()
  ])

  return { clinicData, user, profile }
}

export async function getDashboardContext(clinic: string) {
  const context = await getPageContext(clinic)

  if (!context.user || !context.profile) {
    redirect('/auth/login')
  }

  if (!isStaff(context.profile)) {
    redirect(`/${clinic}/portal`)
  }

  return context
}
```

**Effort:** 1 hour

---

## LOW: Performance

### PAGE-025: Add Prefetching to Navigation
**File:** `web/components/layout/main-nav.tsx`
**Problem:** No prefetching for common navigation paths

**Add:**
```typescript
import Link from 'next/link'

// Use Link component (auto-prefetches)
<Link href={`/${clinic}/services`} prefetch={true}>
  Servicios
</Link>

// For conditional prefetch
<Link href={`/${clinic}/dashboard`} prefetch={isLoggedIn}>
  Dashboard
</Link>
```

**Effort:** 30 minutes

---

### PAGE-026: Optimize Image Loading on Pages
**Files with many images:**
- `web/app/[clinic]/store/page.tsx`
- `web/app/[clinic]/services/page.tsx`

**Add:**
```typescript
import Image from 'next/image'

// Priority for above-fold images
<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={300}
  priority={index < 4} // First 4 images
  loading={index < 4 ? 'eager' : 'lazy'}
  placeholder="blur"
  blurDataURL={product.blur_hash}
/>
```

**Effort:** 1 hour

---

### PAGE-027: Implement Virtual Scrolling for Long Lists
**Files with potentially long lists:**
- `web/app/[clinic]/dashboard/clients/page.tsx`
- `web/app/[clinic]/dashboard/invoices/page.tsx`

**Use react-virtual:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function ClientList({ clients }: { clients: Client[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: clients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <ClientRow
            key={clients[virtualRow.index].id}
            client={clients[virtualRow.index]}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

**Effort:** 2 hours

---

## LOW: Testing

### PAGE-028: Add E2E Tests for Critical Flows
**Missing tests:**
- Booking flow end-to-end
- Pet registration flow
- Checkout flow

**Create:**
```typescript
// web/tests/e2e/booking.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test('complete appointment booking', async ({ page }) => {
    await page.goto('/adris/book')

    // Select service
    await page.click('[data-testid="service-consulta"]')
    await page.click('[data-testid="next-step"]')

    // Select pet
    await page.click('[data-testid="pet-selector"]')
    // ...

    // Confirm
    await page.click('[data-testid="confirm-booking"]')
    await expect(page.getByText('Cita confirmada')).toBeVisible()
  })
})
```

**Effort:** 4 hours

---

### PAGE-029: Add Unit Tests for Page Data Functions
**Test:**
- `getPageContext`
- `getDashboardContext`
- Metadata generation functions

**Effort:** 2 hours

---

## LOW: Internationalization Prep

### PAGE-030: Extract Hardcoded Spanish Text
**Problem:** Text is hardcoded, not in i18n files

**Create:**
```typescript
// web/lib/i18n/es.ts
export const es = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },
  pages: {
    services: {
      title: 'Nuestros Servicios',
      description: 'Servicios veterinarios profesionales',
    },
    // ...
  }
}
```

**Effort:** 3 hours (prep only, not full i18n)

---

### PAGE-031: Create Translation Keys for Pages
**Files to update:**
- All public-facing pages
- Error messages
- Form labels

**Pattern:**
```typescript
import { t } from '@/lib/i18n'

// Before
<h1>Nuestros Servicios</h1>

// After
<h1>{t('pages.services.title')}</h1>
```

**Effort:** 4 hours (prep structure)

---

### PAGE-032: Document i18n Strategy
**Create:** `documentation/i18n/strategy.md`

**Contents:**
1. Current state (Spanish only)
2. Planned languages
3. Translation file structure
4. Component patterns
5. Date/number formatting

**Effort:** 1 hour

---

## Checklist

```
CRITICAL (Large Pages):
[ ] PAGE-001: Split hospital patient page
[ ] PAGE-002: Split pet detail page
[ ] PAGE-003: Split dashboard clients page
[ ] PAGE-004: Split lab orders dashboard
[ ] PAGE-005: Split invoice detail page

HIGH (Error Handling):
[ ] PAGE-006: Error boundaries for dashboard
[ ] PAGE-007: Error boundaries for portal
[ ] PAGE-008: Error boundaries for public pages

HIGH (SEO):
[ ] PAGE-009: Dynamic metadata for services
[ ] PAGE-010: Metadata for all public pages
[ ] PAGE-011: Structured data for products
[ ] PAGE-012: Structured data for services

MEDIUM (UX):
[ ] PAGE-013: Loading states with Suspense
[ ] PAGE-014: Streaming for large data pages
[ ] PAGE-015: Client/Server component optimization
[ ] PAGE-016: Server-side data fetching
[ ] PAGE-017: Custom 404 pages
[ ] PAGE-018: Entity not found handlers
[ ] PAGE-019: Skip links for accessibility
[ ] PAGE-020: ARIA labels
[ ] PAGE-021: Focus management

LOW (Organization):
[ ] PAGE-022: Page layout components
[ ] PAGE-023: Consolidate generateStaticParams
[ ] PAGE-024: Common data fetching patterns
[ ] PAGE-025: Navigation prefetching
[ ] PAGE-026: Image optimization
[ ] PAGE-027: Virtual scrolling
[ ] PAGE-028: E2E tests
[ ] PAGE-029: Unit tests
[ ] PAGE-030: Extract Spanish text
[ ] PAGE-031: Translation keys
[ ] PAGE-032: Document i18n strategy
```
