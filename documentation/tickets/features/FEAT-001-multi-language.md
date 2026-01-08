# FEAT-001: Multi-Language Support (i18n)

## Priority: P2 - Medium
## Category: Feature
## Status: Not Started
## Epic: [EPIC-09: New Capabilities](../epics/EPIC-09-new-capabilities.md)
## Affected Areas: All user-facing components, JSON-CMS

## Description

Add support for multiple languages (starting with English) to expand the platform beyond Spanish-speaking Paraguay market.

## Current State

- All user-facing text hardcoded in Spanish
- Some components have Spanish strings inline
- JSON-CMS content in Spanish only
- Error messages in Spanish
- No i18n infrastructure

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

1. [ ] Install and configure `next-intl`
2. [ ] Create translation file structure
3. [ ] Extract all Spanish strings to `es.json`
4. [ ] Create English translations
5. [ ] Update components to use `useTranslations`
6. [ ] Add language switcher component
7. [ ] Update JSON-CMS loader for language variants
8. [ ] Add language preference to user profile
9. [ ] Test all pages in both languages

## Acceptance Criteria

- [ ] All UI text uses translation system
- [ ] Language switcher in header/footer
- [ ] User preference persisted
- [ ] JSON-CMS supports language variants
- [ ] Fallback to Spanish for missing translations
- [ ] SEO-friendly URL structure (`/es/adris`, `/en/adris`)

## Estimated Effort

- Infrastructure: 8 hours
- String extraction: 16 hours
- English translation: 8 hours
- Testing: 8 hours
- **Total: 40 hours (1 week)**
