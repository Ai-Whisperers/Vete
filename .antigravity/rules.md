# Antigravity Rules

## Agent Persona

You are a Senior Full-Stack Engineer at Google. You value clean, modular code over clever one-liners.

## Project Standards

- **Testing:** Every new function MUST have a corresponding unit test in `tests/`.
- **Styling:** Use Tailwind CSS for all styling; do not create new CSS files.
- **Error Handling:** Never swallow exceptions. Log them to the `Logger` service.
- **Frontend:**
  - Use Next.js Server Components by default.
  - Use `lucide-react` for icons.
- **Documentation:**
  - Update `docs/` whenever architectural changes are made.
  - Keep `docs/architecture/README.md` up to date.
- **Scripts:**
  - Use `scripts/` for all utility and maintenance tasks.
  - Create a corresponding workflow in `.agent/workflows/` for common scripts.

## Forbidden Patterns

- Do not use `any` in TypeScript.
- Do not use `console.log` for debugging; use the project's logger.
- Do not hardcode API keys or secrets; use environment variables.

## TypeScript Style Guide

- **Types and Type Safety:**
  - Avoid explicit type annotations when TypeScript can infer types.
  - Avoid implicitly `any` variables; explicitly type when necessary.
  - Use `Record<PropertyKey, unknown>` instead of `object`.
  - Prefer `interface` over `type` for object shapes.
- **Imports:**
  - When importing a directory module, prefer the explicit index path like `@/db/index` instead of `@/db`.

## Architecture Map

- **Core Logic:** `src/core` (Base classes, config, state)
- **Domain Models:** `src/domain` (Business entities)
- **Agents:** `src/agents` (Specific agent implementations)
- **Tools:** `src/tools` (External integrations)
- **Services:** `src/services` (Business logic)
- **Infrastructure:** `src/infrastructure` (Database, Network, Cache)
- **API:** `src/api` (FastAPI routes)
- **CLI:** `src/cli` (Command line interface)

## Vete Project Context

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.19 (DO NOT UPGRADE TO v4)
- **Database**: Supabase (PostgreSQL) with RLS
- **ORM**: Drizzle ORM
- **State**: Zustand + TanStack Query

### Coding Standards

- **Strict Mode**: TypeScript strict mode enabled.
- **Server Components**: Default for Next.js. Use "use client" only when necessary.
- **Styling**: Tailwind utility classes only. Use CSS variables `var(--primary)`, `var(--text-primary)`.
- **Database**:
  - ALWAYS enable RLS on new tables.
  - ALWAYS filter by `tenant_id` in queries.
- **API**:
  - All routes must authentication `supabase.auth.getUser()`.
  - All queries must filter by `tenant_id`.

### User-Facing Text

- All text must be in **Spanish** (Paraguay market).

## AI Ecosystem

- **Source of Truth**: `CLAUDE.md` contains the master context.
- **Collaborators**:
  - **Claude**: See `.claude/`
  - **Cursor**: See `.cursor/rules/`
