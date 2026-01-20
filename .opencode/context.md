# Vete Project Context

## Overview
Multi-tenant veterinary clinic management SaaS platform serving the Paraguay market.

## Technology Stack
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS v3.4.19 (DO NOT upgrade to v4)
- **State**: Zustand + TanStack React Query
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage
- **Background Jobs**: Inngest
- **Rate Limiting**: Upstash Redis

## Architecture
- **Multi-tenant**: Dynamic routing via `/[clinic]/*`
- **Content Management**: JSON-CMS in `.content_data/[clinic]/`
- **Theme System**: CSS variables (never hardcode colors)
- **Security**: RLS on all tables, tenant_id filtering required

## Key Patterns
1. **Server Components by default** - only use `"use client"` when necessary
2. **Spanish UI** - all user-facing text in Spanish (Paraguay market)
3. **Theme colors** - use `bg-[var(--primary)]`, never `bg-blue-500`
4. **RLS required** - every table MUST have Row-Level Security
5. **Tenant isolation** - always filter by `tenant_id`
6. **Server Actions** for mutations, not API routes

## Database
- 100+ tables with comprehensive RLS policies
- Atomic operations for critical paths (lab orders, appointments, waitlist)
- See `documentation/database/schema-reference.md`

## Project Structure
```
web/
├── app/[clinic]/          # Multi-tenant pages
├── components/            # React components
├── lib/
│   ├── clinics.ts         # JSON-CMS loader
│   ├── supabase/          # DB clients
│   ├── hooks/             # Custom React hooks (8 hooks)
│   └── constants/         # Centralized constants
├── .content_data/         # Clinic content (JSON)
└── db/                    # SQL migrations
```

## Critical Reminders
- **NEVER** commit API keys or secrets
- **NEVER** upgrade Tailwind to v4 (breaks build)
- **ALWAYS** enable RLS on new tables
- **ALWAYS** use theme variables for colors
- **ALWAYS** write user-facing text in Spanish

## Documentation
- Main context: `CLAUDE.md` in project root
- Architecture: `documentation/architecture/`
- Database: `documentation/database/`
- Features: `documentation/features/`
- API Reference: `documentation/api/`

## Useful Commands
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run test:unit        # Vitest tests
npm run test:e2e         # Playwright E2E
```

## Current Features
✅ Multi-tenant websites with dynamic theming
✅ Pet management with QR codes & vaccines
✅ Appointments with 3-step booking request flow
✅ Clinical tools (dosage calc, diagnosis, QOL)
✅ Hospitalization & Laboratory modules
✅ E-commerce store with prescription handling
✅ Inventory management with stock tracking
✅ Invoicing & payments
✅ Ambassador program with referrals
✅ Pre-generation system for new clinics

## Contact & Links
- Repository: https://github.com/yourusername/vete
- Supabase Project: okddppczckbjdotrxiev
- Production: TBD
