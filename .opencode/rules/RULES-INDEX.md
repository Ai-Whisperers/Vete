# Unified Rules Index - Vete Project

> **Consolidated from**: `.claude`, `.cursor/rules/`, `.antigravity`  
> **Total Rules**: 60+ individual rules  
> **Primary Document**: `vete-project-standards.md`

---

## Rule Sources

### 1. Primary Standards (1 file)
| File | Source | Status |
|------|--------|--------|
| **`vete-project-standards.md`** | Consolidated from all sources | ✅ Active |

**Contains**:
- Multi-tenancy rules (CRITICAL)
- TypeScript standards
- Next.js patterns
- Styling guidelines (Tailwind + theme)
- Security requirements
- Database patterns (RLS)
- Testing requirements
- Code quality standards

---

### 2. Cursor Legacy Rules (32 files)
| Directory | Files | Purpose |
|-----------|-------|---------|
| `cursor-legacy/` | 32 .mdc files | Reference only |

**Key rules migrated**:
- DRY principle
- Naming conventions
- Comment usage
- Code writing standards
- Single responsibility
- No unnecessary confirmations
- No whitespace suggestions
- Verify information
- Preserve existing code

**Status**: ✅ Migrated to `vete-project-standards.md`

---

### 3. Antigravity Rules (1 file)
| File | Purpose | Status |
|------|---------|--------|
| `antigravity-legacy.md` | Antigravity-specific patterns | ✅ Migrated |

**Key points migrated**:
- TypeScript style guide
- Architecture map
- Forbidden patterns
- Testing requirements
- Import conventions

**Status**: ✅ Consolidated into main standards

---

## Rule Categories

### CRITICAL Rules (Never Violate)

#### 1. Multi-Tenancy
- ✅ **ALWAYS filter by `tenant_id`**
- ✅ **ALWAYS enable RLS** on new tables
- ✅ **ALWAYS check authentication** in API routes
- ❌ **NEVER hardcode** clinic IDs
- ❌ **NEVER query across tenants**

**Penalty**: Data leaks, security breach

---

#### 2. Tailwind CSS
- ✅ **MUST use v3.4.19** (DO NOT upgrade to v4)
- ✅ **ONLY utility classes** (no inline styles)
- ✅ **ALWAYS use CSS variables**: `var(--primary)`
- ❌ **NEVER hardcode colors**: `bg-blue-500`, `#333`

**Penalty**: Breaks theming, design inconsistency

---

#### 3. TypeScript
- ✅ **ALWAYS explicit return types**
- ✅ **ALWAYS Props interfaces**
- ✅ **PREFER `interface`** for objects
- ❌ **NEVER use `any`**
- ❌ **NEVER use `@ts-ignore`**

**Penalty**: Type safety failures, runtime errors

---

#### 4. Security
- ✅ **ALWAYS check auth** in API routes
- ✅ **ALWAYS get tenant context**
- ✅ **ALWAYS parameterize queries**
- ❌ **NEVER trust client data**
- ❌ **NEVER expose service role key**

**Penalty**: Security vulnerabilities

---

### HIGH Priority Rules

#### 5. Next.js Patterns
- Server Components by default
- `"use client"` only when necessary
- Server Actions for mutations
- Proper error boundaries

#### 6. Database
- RLS on all tables
- Indexes on foreign keys
- Migrations numbered sequentially
- Updated_at triggers

#### 7. Testing
- Test auth failures
- Test tenant isolation
- Mock Supabase properly
- Cover edge cases

#### 8. Code Quality
- DRY (Don't Repeat Yourself)
- Single Responsibility Principle
- Meaningful names
- Comments only for non-obvious code

---

### MEDIUM Priority Rules

#### 9. Performance
- Use Next.js Image component
- Limit query results (pagination)
- Select only needed columns
- Proper indexes

#### 10. File Structure
- Follow project conventions
- Consistent naming
- Logical organization
- Clear module boundaries

#### 11. Git Workflow
- Meaningful commit messages
- Feature branches
- No force push to main
- Run tests before commit

---

## Rule Enforcement

### Automated (FREE Gemini)

```bash
# Check rules compliance
> review-code file.ts --check-rules

# Uses FREE Gemini to:
# 1. Load vete-project-standards.md
# 2. Check file against rules
# 3. Report violations
# 4. Suggest fixes

# Cost: $0
```

---

### Manual Review

Use `.opencode/commands/review-code.md` checklist:
- [ ] Multi-tenancy: tenant_id filters?
- [ ] Security: auth checks?
- [ ] Styling: CSS variables?
- [ ] TypeScript: no `any`?
- [ ] Tests: coverage adequate?

---

## Rules by File Type

### API Routes (`web/app/api/**/route.ts`)

**MUST HAVE**:
1. Auth check (`supabase.auth.getUser()`)
2. Tenant context retrieval
3. Tenant-filtered queries (`.eq('tenant_id', ...)`)
4. Error handling
5. Spanish error messages

**Example**: See `.opencode/exemplars/supabase-api-exemplar.md`

---

### React Components (`web/components/**/*.tsx`)

**MUST HAVE**:
1. TypeScript Props interface
2. Theme CSS variables (`var(--*)`)
3. Tailwind utility classes only
4. No inline styles
5. Proper accessibility

**Example**: See `.opencode/exemplars/react-component-exemplar.md`

---

### Database Migrations (`web/db/*.sql`)

**MUST HAVE**:
1. `tenant_id` column (if multi-tenant data)
2. RLS enabled
3. RLS policies (staff + owner)
4. Indexes on foreign keys
5. Updated_at trigger

**Example**: See `.opencode/exemplars/database-migration-exemplar.md`

---

### Tests (`web/tests/**/*.test.ts`)

**MUST HAVE**:
1. Test auth failures (401)
2. Test tenant isolation
3. Mock Supabase client
4. Test edge cases
5. Descriptive test names

**Example**: See `.opencode/exemplars/vitest-testing-exemplar.md`

---

## Rule Violations & Fixes

### Common Violations

| Violation | Fix | Tool |
|-----------|-----|------|
| Missing `tenant_id` filter | Add `.eq('tenant_id', profile.tenant_id)` | Gemini |
| Hardcoded color | Replace with `var(--primary)` | Gemini |
| `any` type | Add proper type definition | Gemini |
| Missing auth | Add `supabase.auth.getUser()` | Gemini |
| No RLS | Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` | Gemini |

**All fixes can be done with FREE Gemini**

---

## Rule Updates

### When to Update Rules

- New pattern discovered
- Security vulnerability found
- Performance optimization identified
- Team consensus on new convention

### How to Update

1. **Edit**: `.opencode/rules/vete-project-standards.md`
2. **Document**: What changed and why
3. **Notify**: Team of rule change
4. **Enforce**: Update review checklist

---

## Migration Status

### ✅ Completed

- [x] Consolidated `.claude` rules
- [x] Migrated `.cursor/rules/` (32 files)
- [x] Migrated `.antigravity/rules.md`
- [x] Created unified `vete-project-standards.md`
- [x] Organized legacy rules in subdirectories
- [x] Created this index

### 📁 File Organization

```
.opencode/rules/
├── vete-project-standards.md     ✅ PRIMARY (use this)
├── RULES-INDEX.md                 ✅ This file
├── cursor-legacy/                 📦 Reference (32 files)
│   ├── code-writing-standards.mdc
│   ├── naming-conventions.mdc
│   ├── dry-principle.mdc
│   └── ... (29 more)
└── antigravity-legacy.md          📦 Reference
```

---

## Usage with OhMyOpenCode

### Check Rules

```bash
# Check file against all rules
> review-code web/app/api/pets/route.ts

# Check specific rule category
> review-code --focus multi-tenancy web/app/api/pets/route.ts

# Fix violations automatically
> review-code --auto-fix web/app/api/pets/route.ts
```

**Cost**: All FREE with Gemini

---

### Generate Code Following Rules

```bash
# Generate API route following rules
> add-api "GET /api/appointments"
# Auto-includes: auth, tenant filter, error handling

# Generate component following rules
> add-component "AppointmentCard"
# Auto-includes: types, theme variables, Tailwind

# Generate migration following rules
> add-migration "add_appointments_table"
# Auto-includes: tenant_id, RLS, policies
```

**Cost**: All FREE with Gemini

---

## See Also

- **Primary Standards**: `.opencode/rules/vete-project-standards.md`
- **Commands**: `.opencode/commands/` - Use rules in commands
- **Exemplars**: `.opencode/exemplars/` - Code examples following rules
- **Budget**: `.opencode/agents/BUDGET-STRATEGY.md` - Cost optimization

---

**Last Updated**: January 14, 2026  
**Total Rules**: 60+ consolidated  
**Primary Document**: `vete-project-standards.md` (use this)  
**Legacy Files**: Preserved for reference
