# Migration: Vete → Paragu-AI

**Date:** 2026-04-09

## Why

The `Vete` repository has outgrown its original scope as a veterinary-only platform. It is now a **general-purpose multi-tenant website builder** for service businesses in Paraguay, aligned with the **Paragu-AI** product submitted to Moonshot 2026.

Tenants already deployed or in progress include:
- Veterinary clinics: Terrapet, PetLife, CavillPet
- Retail store: Fun4Me
- Dutch cafe: Stroopwafel Huis (new)
- Avian farm: Granja Cabral (new)

## What changed

| Area               | Before                                 | After                                                |
|--------------------|----------------------------------------|------------------------------------------------------|
| Repo name          | `Ai-Whisperers/Vete`                   | `Ai-Whisperers/paragu-ai` (pending rename)           |
| README title       | "Vete - Multi-Tenant Veterinary..."    | "Paragu-AI - Multi-Tenant Business Website..."       |
| `web/package.json` | `"name": "web"`                        | `"name": "paragu-ai-web"`                            |
| Brand copy         | Veterinary-specific                    | Generic, vertical-aware                              |

## What did NOT change (yet)

These are **intentional follow-ups** to keep this PR small and safe:

1. **Route segment `/[clinic]/*`** — the dynamic param is still named `clinic` across `web/app/[clinic]/`. Renaming to `/[tenant]/*` touches ~100+ files. Tracking as a separate refactor PR.
2. **`lib/clinics.ts` → `lib/tenants.ts`** — same reasoning.
3. **Supabase `is_staff_of(tenant_id)` function** — already tenant-generic, no change needed.
4. **Vet-specific templates** in `_TEMPLATE/` (e.g. `toxic_checker`, `age_calculator` modules, "Dr. Nombre" in about) — still serve as a good starting point for vet tenants. New business templates can be added under `_TEMPLATE_BUSINESS/` / `_TEMPLATE_CAFE/` etc.
5. **GitHub repo rename** — requires explicit owner approval. Rename command:
   ```bash
   gh repo rename paragu-ai --repo Ai-Whisperers/Vete
   ```

## Adding a new tenant (updated flow)

1. Copy `web/.content_data/_TEMPLATE/` to `web/.content_data/<slug>/`
2. Edit `config.json`: set `id`, `name`, `tagline`, contact, `modules` (enable only what applies to this business type)
3. Edit `theme.json`: brand colors, fonts
4. Fill `home.json`, `about.json`, `services.json` (used for products/menu too), `faq.json`, `legal.json`, `images.json`
5. Register domain(s) in `web/.content_data/domains.json`
6. Insert tenant row in Supabase `tenants` table
7. (Optional) Custom domain:
   ```bash
   node scripts/domains.mjs add <domain> <slug> --type primary
   node scripts/domains.mjs sync-vercel
   ```

## References

- Moonshot 2026 form answers: `Ai-Whisperers/moonshot-2026/MOONSHOT-FORM-ANSWERS.md`
- Product pitch: *"Plataforma SaaS multi-tenant que digitaliza negocios de servicios en Paraguay..."*
- Market data: 44/45 vets in Asunción have no web (OpenStreetMap verified)
