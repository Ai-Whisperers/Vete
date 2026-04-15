# Tenant Configuration Guide

This guide explains how to configure different types of tenants (clinics, restaurants, real estate, etc.) for the multi-tenant platform.

---

## Tenant Types

| Type | Examples | Recommended Approach |
|------|----------|---------------------|
| **Veterinary Clinic** | terrapet, cavillpet, petlife | Full single page with all sections |
| **Dental/Medical** | clinica-duerksen | Full single page |
| **Cafe/Restaurant** | stroopwafel-huis | Single page with signature section |
| **Retail Store** | fun4me, granja-cabral | Single page + separate store/catalog page |
| **Real Estate** | arasy | Single page + separate properties page |
| **Services** | dayah | Single page + separate portfolio page |

---

## Section Architecture

### Single Page (Home Only)

Use this approach when:
- All content fits in one page
- Services are simple/limited (under 10)

**Recommended Sections (in order):**
1. `promo_banner` - Announcements, promotions
2. Hero (always) - Headline, CTAs
3. `trust_bar` - Quick stats/credentials
4. `hero.trust_badges` - Trust signals in hero
5. `features` - Why choose us (3-6 items)
6. `services` - Full service catalog
7. `signature_section` - For cafes/restaurants
8. `interactive_tools` - For veterinary
9. `testimonials` - Social proof
10. `partners` - Brand logos
11. `faq` - Common questions
12. Contact (always)

---

## home.json Schema Reference

### Hero Section
```json
{
  "hero": {
    "badge_text": "Urgencias 24hs",
    "headline": "Main Title",
    "subhead": "Subtitle text",
    "cta_primary": "Button Text",
    "cta_secondary": "Secondary Button",
    "trust_badges": [
      { "icon": "shield-check", "text": "Certified" }
    ]
  }
}
```

### Trust Bar
```json
{
  "trust_bar": [
    { "value": "8+", "label": "Años" },
    { "value": "15000+", "label": "Clientes" }
  ]
}
```

### Features
```json
{
  "features": [
    { "icon": "heart", "title": "Title", "description": "Text" }
  ]
}
```

### Promo Banner
```json
{
  "promo_banner": {
    "enabled": true,
    "text": "🎉 New promotion",
    "link": "/promotion"
  }
}
```

### Interactive Tools
```json
{
  "interactive_tools_section": {
    "enabled": true,
    "title": "Título",
    "subtitle": "Subtitle",
    "tools": [
      { "id": "toxic-food", "icon": "alert-triangle", "title": "¿Es Tóxico?", "description": "...", "color": "#EF4444" }
    ]
  }
}
```

### Signature Section (Restaurants)
```json
{
  "signature_section": {
    "title": "¿Qué es...?",
    "copy": "Description of the product/origin story"
  }
}
```

### Partners/Logos
```json
{
  "partners_section": {
    "enabled": true,
    "title": "Marcas que Trabajamos",
    "logos": [
      { "name": "Brand Name", "image": "/path/to/logo.png" }
    ]
  }
}
```

### Referral Section (B2B/Medical)
```json
{
  "referral_section": {
    "enabled": true,
    "title": "Programa de Derivaciones",
    "subtitle": "Subtitle text...",
    "benefits": ["Benefit 1", "Benefit 2"],
    "cta_text": "Coordinar Derivación"
  }
}
```

### FAQ
```json
{
  "faq": {
    "title": "Preguntas Frecuentes",
    "items": [
      { "question": "¿?", "answer": "..." }
    ]
  }
}
```

### SEO
```json
{
  "seo": {
    "meta_title": "Title for Google",
    "meta_description": "Description for Google",
    "keywords": ["keyword1", "keyword2"]
  }
}
```

---

## Quick Reference: Which Sections to Use

| Tenant Type | Promo | TrustBar | Features | Tools | Signature | Partners | Referral |
|-------------|-------|----------|----------|-------|-----------|----------|----------|
| Vet Clinic | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Medical | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Cafe | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Retail | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Real Estate | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Testing Your Configuration

1. Run the dev server: `cd web && npm run dev`
2. Visit `http://localhost:3000/[clinic-slug]`
3. Check each section renders correctly
4. Test on mobile (use browser dev tools)
