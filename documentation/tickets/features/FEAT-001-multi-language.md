# FEAT-001: Multi-Language Support (i18n)

## Priority: P2 - Medium
## Category: Feature
## Status: In Progress (Infrastructure Complete)
## Epic: [EPIC-09: New Capabilities](../epics/EPIC-09-new-capabilities.md)
## Affected Areas: All user-facing components, JSON-CMS

## Description

Add support for multiple languages (starting with English) to expand the platform beyond Spanish-speaking Paraguay market.

## Current State

**Infrastructure Complete (January 2026):**
- ✅ `next-intl` v4.7.0 installed and configured
- ✅ Translation files: `messages/es.json` (264 lines), `messages/en.json` (264 lines)
- ✅ i18n config: `i18n/config.ts`, `i18n/request.ts`, `i18n/hooks.ts`
- ✅ Language switcher: `components/ui/language-selector.tsx` (integrated in main nav)
- ✅ Locale API: `/api/locale` (GET/POST for cookie management)
- ✅ Cookie-based locale detection with Accept-Language fallback

**Component Migration Started (January 2026):**
- ✅ Navigation components migrated:
  - `main-nav.tsx` - nav items, cart aria-labels with pluralization
  - `UserMenu.tsx` - login/logout labels
  - `MobileMenu.tsx` - all sections (Navigation, Tools, My Account, Staff, Language)
- ✅ Public pages migrated:
  - `app/[clinic]/page.tsx` - homepage with contact section
  - `app/[clinic]/about/page.tsx` - team, values, facilities, CTA
  - `components/forms/appointment-form.tsx` - booking form
- ✅ Portal components migrated:
  - `app/[clinic]/portal/dashboard/page.tsx` - error states, empty states, pet cards
  - `components/portal/quick-actions.tsx` - all quick action button labels
- ✅ Services components migrated:
  - `components/services/services-grid.tsx` - search, filters, results summary
  - `components/services/category-filter.tsx` - all 9 category labels and descriptions
  - `components/services/service-card.tsx` - includes, pricing, action buttons
  - `components/services/service-detail-client.tsx` - pricing table, pet selector, booking card, cart buttons
- ✅ Pet profile components migrated:
  - `components/pets/pet-profile-header.tsx` - age display, sex labels, actions
- ✅ Store components migrated:
  - `components/store/product-card.tsx` - wishlist, badges, stock status, add to cart, loyalty points
  - `app/[clinic]/store/client.tsx` - loading/error states, hero section, search, filters, pagination
  - `components/store/pet-selector.tsx` - labels, loading states, error messages, empty states
- ✅ Dashboard components migrated:
  - `components/dashboard/appointments/pending-requests-panel.tsx` - title, loading, error, preferences
- ✅ Pet selector (services) migrated:
  - `components/services/pet-selector.tsx` - labels, loading, error, species names
- ✅ Translation namespaces expanded:
  - `home` namespace (10 keys)
  - `about` namespace (23 keys)
  - `booking` namespace (23 keys)
  - `portal` namespace with nested `quickActions` (6 keys)
  - `services` namespace with categories (60+ keys)
  - `pets` namespace with `ageDisplay` nested keys (8 new keys)
  - `store` namespace expanded (30+ new keys)
  - `dashboard.pendingRequests` namespace (12 keys)
  - `petSelector` namespace (15 keys)

**Remaining Work:**
- ~150 components still use hardcoded Spanish strings
- JSON-CMS content in Spanish only
- No URL-based routing (`/es/adris`, `/en/adris`)

## Proposed Solution

### 1. i18n Library Setup

Use `next-intl` for Next.js 15 App Router compatibility:

```bash
npm install next-intl
```

### 2. Translation File Structure

```
web/
├── messages/
│   ├── es.json          # Spanish (default)
│   ├── en.json          # English
│   └── pt.json          # Portuguese (future)
├── i18n.ts              # Configuration
└── middleware.ts        # Language detection
```

### 3. Translation Format

```json
// messages/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "loading": "Cargando...",
    "error": "Error"
  },
  "auth": {
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "signup": "Registrarse"
  },
  "pets": {
    "title": "Mis Mascotas",
    "add": "Agregar mascota",
    "species": {
      "dog": "Perro",
      "cat": "Gato"
    }
  }
}
```

### 4. Component Usage

```typescript
import { useTranslations } from 'next-intl'

export function PetList() {
  const t = useTranslations('pets')

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('add')}</button>
    </div>
  )
}
```

### 5. JSON-CMS Integration

Add language variants to clinic content:

```
.content_data/
├── adris/
│   ├── home.json        # Default (Spanish)
│   ├── home.en.json     # English variant
│   ├── services.json
│   └── services.en.json
```

## Implementation Steps

1. [x] Install and configure `next-intl` ✅
2. [x] Create translation file structure ✅
3. [x] Extract Spanish strings to `es.json` ✅ (~320 lines across 14 namespaces)
4. [x] Create English translations ✅ (complete parity with es.json)
5. [~] Update components to use `useTranslations` (~150 remaining, 8h estimated)
   - [x] Navigation components (main-nav, UserMenu, MobileMenu)
   - [x] Public pages (home, about)
   - [x] Booking form (appointment-form)
   - [x] Portal dashboard and quick-actions
   - [x] Services components (services-grid, category-filter, service-card, service-detail-client)
   - [x] Pet profile header
   - [x] Store components (product-card, store client, pet-selector)
   - [x] Dashboard pending requests panel
   - [x] Services pet selector
6. [x] Add language switcher component ✅ (integrated in navigation)
7. [ ] Update JSON-CMS loader for language variants
8. [ ] Add language preference to user profile
9. [ ] Test all pages in both languages

## Acceptance Criteria

- [ ] All UI text uses translation system
- [x] Language switcher in header/footer ✅
- [x] User preference persisted (via cookie) ✅
- [ ] JSON-CMS supports language variants
- [x] Fallback to Spanish for missing translations ✅ (default locale is 'es')
- [ ] SEO-friendly URL structure (`/es/adris`, `/en/adris`)

## Estimated Effort

**Original Estimate:**
- Infrastructure: 8 hours ✅ COMPLETE
- String extraction: 16 hours ✅ COMPLETE
- English translation: 8 hours ✅ COMPLETE
- Testing: 8 hours

**Remaining Work (~12 hours):**
- Component migration to useTranslations: 6 hours (~145 components remaining)
- JSON-CMS language variants: 4 hours
- URL routing implementation: 2 hours

**Progress: 70% complete (Infrastructure + Navigation + Public pages + Booking + Portal + Services + Pet profile + Store + Dashboard + Pet selectors done)**
