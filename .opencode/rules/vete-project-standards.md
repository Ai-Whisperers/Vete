# Vete Project Standards

> **Consolidated from**: `.claude`, `.cursor`, `.antigravity`

## Project Context

**Name**: Vete - Multi-Tenant Veterinary Platform  
**Stack**: Next.js 15, TypeScript, Supabase, Tailwind CSS 3.4.19  
**Architecture**: Multi-tenant SaaS with dynamic routing (`/[clinic]/*`)  
**Market**: Paraguay (Spanish UI)  
**Scale**: 100+ tables, 450+ API routes, 269 route files

---

## Critical Rules (NEVER VIOLATE)

### 1. Multi-Tenancy (ABSOLUTE)
- ✅ **ALWAYS filter by `tenant_id`** in all database queries
- ✅ **ALWAYS enable RLS** on new tables
- ✅ **ALWAYS check authentication** in API routes
- ❌ **NEVER hardcode** clinic IDs or names
- ❌ **NEVER query across tenants** without explicit permission

```typescript
// ✅ CORRECT
const { data } = await supabase
  .from('pets')
  .select('*')
  .eq('tenant_id', profile.tenant_id)

// ❌ WRONG
const { data } = await supabase.from('pets').select('*')
```

### 2. Tailwind CSS (CRITICAL VERSION LOCK)
- ✅ **MUST use Tailwind 3.4.19** (DO NOT upgrade to v4)
- ✅ **ONLY use utility classes** (no inline styles)
- ✅ **ALWAYS use CSS variables** for colors: `bg-[var(--primary)]`
- ❌ **NEVER hardcode colors**: `bg-blue-500`, `#333`, `rgb()`

```tsx
// ✅ CORRECT
<div className="bg-[var(--bg-paper)] text-[var(--text-primary)]">

// ❌ WRONG  
<div style={{ background: '#fff', color: '#333' }}>
<div className="bg-blue-500 text-gray-900">
```

### 3. TypeScript (STRICT)
- ✅ **ALWAYS use explicit return types** on functions
- ✅ **ALWAYS define Props interfaces** above components
- ✅ **PREFER `interface`** for object shapes, `type` for unions
- ❌ **NEVER use `any`** (use `unknown` if needed)
- ❌ **NEVER use `@ts-ignore` or `@ts-expect-error`**

```typescript
// ✅ CORRECT
interface PetCardProps {
  name: string
  species: string
}

export function PetCard({ name, species }: PetCardProps): JSX.Element {
  return <div>{name}</div>
}

// ❌ WRONG
export function PetCard({ name, species }: any) {
  return <div>{name}</div>
}
```

### 4. Authentication & Security
- ✅ **ALWAYS check `supabase.auth.getUser()`** in API routes
- ✅ **ALWAYS get tenant context** from user profile
- ✅ **ALWAYS use parameterized queries** (no string interpolation)
- ❌ **NEVER trust client data** without validation
- ❌ **NEVER expose service role key** in client code

```typescript
// ✅ CORRECT - API Route Pattern
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  // 2. Tenant context
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  
  // 3. Tenant-filtered query
  const { data } = await supabase
    .from('pets')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
  
  return NextResponse.json(data)
}
```

### 5. Spanish UI (USER-FACING ONLY)
- ✅ **ALL user-facing text in Spanish**
- ✅ Error messages: `"No autorizado"`, `"Error al guardar"`
- ✅ Button labels: `"Guardar"`, `"Cancelar"`, `"Enviar"`
- ❌ Code comments can be in English
- ❌ Variable names in English

---

## Next.js 15 Patterns

### Server Components (Default)
```typescript
// ✅ CORRECT - Server Component by default
export default async function PetsPage({ params }: Props) {
  const supabase = await createClient()
  const { data } = await supabase.from('pets').select('*')
  return <div>{data}</div>
}

// ❌ WRONG - Unnecessary "use client"
"use client"
export default function PetsPage() {
  const [data, setData] = useState([])
  // ...
}
```

### Client Components (Only When Needed)
```typescript
// ✅ CORRECT - Client component for interactivity
"use client"
import { useState } from 'react'

export function PetForm() {
  const [name, setName] = useState('')
  // Interactive form logic
}
```

### Server Actions (Mutations)
```typescript
// ✅ CORRECT - Server Action for mutations
'use server'
import { revalidatePath } from 'next/cache'

export async function createPet(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('pets').insert({ ... })
  revalidatePath('/pets')
}
```

---

## Database Standards

### RLS Policies (MANDATORY)
```sql
-- ✅ CORRECT - Every table needs RLS
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage" ON pets FOR ALL
  USING (is_staff_of(tenant_id));

CREATE POLICY "Owner view own" ON pets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.tenant_id = pets.tenant_id
  ));
```

### Migration Format
```sql
-- web/db/063_feature_name.sql
-- Description: Brief description

-- Create table
CREATE TABLE ...;

-- Add RLS
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...;

-- Add indexes
CREATE INDEX ...;

-- Add triggers
CREATE TRIGGER ...;
```

---

## Code Quality Standards

### DRY Principle
- ✅ Extract duplicate logic into functions/hooks
- ✅ Reuse components across pages
- ✅ Centralize constants in `lib/constants/`

### Single Responsibility
- ✅ Components do ONE thing
- ✅ Functions have ONE purpose
- ✅ Hooks manage ONE piece of state

### Naming Conventions
- ✅ Components: `PascalCase` (PetCard.tsx)
- ✅ Files: `kebab-case` (pet-form.tsx)
- ✅ Functions: `camelCase` (getPetData)
- ✅ Constants: `SCREAMING_SNAKE_CASE` (MAX_UPLOAD_SIZE)
- ✅ Types/Interfaces: `PascalCase` (PetFormProps)

---

## Testing Requirements

### Unit Tests (Vitest)
```typescript
// ✅ CORRECT - Test all API routes
describe('GET /api/pets', () => {
  it('returns 401 without auth', async () => {
    const response = await fetch('/api/pets')
    expect(response.status).toBe(401)
  })
  
  it('returns tenant-filtered data', async () => {
    const response = await authenticatedFetch('/api/pets')
    expect(response.status).toBe(200)
    // Verify no cross-tenant leakage
  })
})
```

### E2E Tests (Playwright)
- ✅ Test critical user flows
- ✅ Test multi-tenant isolation
- ✅ Test authentication flows

---

## Performance Guidelines

### Images
```tsx
// ✅ CORRECT - Use Next.js Image
import Image from 'next/image'
<Image src="/pet.jpg" width={200} height={200} alt="Pet" />

// ❌ WRONG
<img src="/pet.jpg" />
```

### Database
- ✅ Use indexes on frequently queried columns
- ✅ Limit results with pagination
- ✅ Use select() to fetch only needed columns

---

## File Structure Conventions

```
web/
├── app/
│   ├── [clinic]/           # Tenant routes
│   │   ├── layout.tsx      # Clinic theme provider
│   │   ├── page.tsx        # Homepage
│   │   ├── services/       # Public pages
│   │   ├── portal/         # Auth required (pet owners)
│   │   └── dashboard/      # Auth required (staff)
│   ├── api/                # REST API routes
│   └── actions/            # Server Actions
├── components/
│   ├── layout/             # Nav, footer
│   ├── ui/                 # Reusable UI (buttons, cards)
│   └── [feature]/          # Feature-specific
├── lib/
│   ├── supabase/           # DB clients
│   ├── constants/          # Centralized constants
│   ├── types/              # TypeScript types
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
└── .content_data/          # JSON CMS (per clinic)
```

---

## Common Anti-Patterns (AVOID)

### ❌ Missing Authentication
```typescript
// DON'T
export async function GET() {
  const { data } = await supabase.from('pets').select('*')
  return NextResponse.json(data)
}
```

### ❌ Missing Tenant Filter
```typescript
// DON'T
const { data } = await supabase.from('pets').select('*')
```

### ❌ Hardcoded Colors
```tsx
// DON'T
<div className="bg-blue-500">
<div style={{ color: '#333' }}>
```

### ❌ Any Types
```typescript
// DON'T
function processData(data: any) { }
```

### ❌ Missing RLS
```sql
-- DON'T
CREATE TABLE pets (...);
-- (missing ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
```

---

## Debugging Checklist

When something breaks, check:

1. **Environment**: `.env.local` has correct Supabase keys
2. **Authentication**: User is logged in, profile exists
3. **RLS**: Policies allow the operation
4. **Tenant**: Query filters by correct `tenant_id`
5. **Build**: Delete `.next/` and rebuild
6. **Dependencies**: `npm install` with correct versions
7. **Browser**: Clear cache, check console/network tabs

---

## Git Workflow

### Commit Messages
```bash
# ✅ CORRECT - Concise, explains WHY
git commit -m "Add tenant filter to pets query to prevent cross-clinic data leaks"

# ❌ WRONG - Vague, no context
git commit -m "fix bug"
```

### Before Commit
1. ✅ Run linter: `npm run lint`
2. ✅ Run tests: `npm run test`
3. ✅ Check types: `tsc --noEmit`
4. ✅ Review changes: `git diff`

---

## Related Files

- `CLAUDE.md` - Full project context
- `.opencode/oh-my-opencode.json` - OMO config
- `.opencode/agents/BUDGET-STRATEGY.md` - Cost optimization
- `.opencode/agents/cost-tiers.md` - Model selection
- `documentation/` - Extended technical docs
