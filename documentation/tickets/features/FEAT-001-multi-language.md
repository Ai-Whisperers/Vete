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
- ✅ Translation files: `messages/es.json` (241 lines), `messages/en.json` (241 lines)
- ✅ i18n config: `i18n/config.ts`, `i18n/request.ts`, `i18n/hooks.ts`
- ✅ Language switcher: `components/ui/language-selector.tsx` (integrated in main nav)
- ✅ Locale API: `/api/locale` (GET/POST for cookie management)
- ✅ Cookie-based locale detection with Accept-Language fallback

**Remaining Work:**
- Components still use hardcoded Spanish strings (not using `useTranslations`)
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
3. [x] Extract Spanish strings to `es.json` ✅ (241 lines across 12 namespaces)
4. [x] Create English translations ✅ (complete parity with es.json)
5. [ ] Update components to use `useTranslations` (~200+ components, 16h estimated)
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

**Remaining Work (~24 hours):**
- Component migration to useTranslations: 16 hours
- JSON-CMS language variants: 4 hours
- URL routing implementation: 2 hours
- Testing & QA: 2 hours

**Progress: 40% complete (Infrastructure phase done)**
