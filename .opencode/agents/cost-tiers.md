# Agent Cost Tiers - Vete Project

> **Critical Reference**: Always check this file before invoking agents to optimize costs.

## Cost Tier Summary (Updated for YOUR Budget)

| Model | Your Cost | Your Budget | Use For | Avoid For |
|-------|-----------|-------------|---------|-----------|
| **Gemini 2.0 Flash** | **FREE** | Unlimited | **EVERYTHING** (95% of work) | Nothing - use liberally! |
| **Claude Sonnet** | 1 call | **20 calls total** | Critical architecture, security | Searches, code gen (use Gemini) |
| **OpenAI GPT** | ~$1-5/call | $20 credit | Emergency backup only | Regular work (depletes credit) |

---

## ⚠️ CRITICAL: You Have Limited Claude Budget

**You have ONLY 20 Claude calls total. Once used, they're gone until next billing cycle.**

**Strategy**: Use FREE Gemini for 95%+ of work, reserve Claude for true emergencies.

## Agent → Model Mapping

### Tier 1: Haiku (Cheapest - Use Liberally) 💚

**Agents**: `explore`, `librarian` (for searches)

**Use Cases**:
- ✅ Grep codebase for patterns
- ✅ Search documentation
- ✅ Parse test results
- ✅ Find files by criteria
- ✅ List API routes
- ✅ Check imports/dependencies
- ✅ Simple refactoring (rename, format)
- ✅ Extract data from logs

**Command Examples**:
```bash
# All use Haiku by default
omo explore "find all API routes with missing auth"
omo explore "list files using 'any' type"
omo librarian "search Supabase docs for RLS examples"
```

**Cost**: ~$0.05 per task (search + small summary)

---

### Tier 2: Sonnet 3.5 (Moderate - Default) 🟡

**Agents**: `general`, `code-reviewer`, `test-writer`, `refactorer`, `frontend-ui-ux-engineer`

**Use Cases**:
- ✅ Generate new components
- ✅ Write API routes
- ✅ Create database migrations
- ✅ Write tests
- ✅ Standard code reviews
- ✅ Refactor functions
- ✅ Fix TypeScript errors
- ✅ Implement features (non-architectural)

**Command Examples**:
```bash
# Sonnet for code generation
omo add-component "PetCard with theme variables"
omo add-api "GET /api/appointments"
omo review-code "web/app/api/pets/route.ts"
```

**Cost**: ~$0.50-$2.00 per task (generation + context)

---

### Tier 3: Opus / o1 (Expensive - Sparingly) 🔴

**Agent**: `oracle`

**Use Cases**:
- ✅ Architecture decisions (multi-system design)
- ✅ Security audits (critical vulnerabilities)
- ✅ Complex debugging (after 2+ Sonnet failures)
- ✅ Database schema design (100+ tables)
- ✅ Performance optimization (system-wide)
- ✅ RLS policy design (tenant isolation)

**Command Examples**:
```bash
# Only use when necessary
omo oracle "design multi-tenant RLS architecture for 100+ tables"
omo oracle "debug race condition in appointment booking"
omo oracle "security audit for payment processing"
```

**Cost**: ~$5-$20 per task (deep analysis + large context)

---

## Decision Tree: Which Agent to Use?

```
START
├─ Is it a search/grep/find task?
│  └─ YES → Haiku (explore/librarian)
│
├─ Is it generating new code (component/API/test)?
│  └─ YES → Sonnet (general/code-reviewer/test-writer)
│
├─ Is it an architecture decision or complex design?
│  └─ YES → Check if Sonnet tried first
│     ├─ NO → Try Sonnet first
│     └─ YES (failed 2+ times) → Opus (oracle)
│
└─ Still unsure?
   └─ Default to Sonnet (safe middle ground)
```

## Parallel Execution Patterns

### Pattern 1: Multiple Cheap Searches (Haiku)
```bash
# Launch 5 parallel Haiku tasks (total cost: ~$0.25)
omo explore "find missing auth checks" &
omo explore "find hardcoded colors" &
omo explore "find unused imports" &
omo librarian "find RLS examples" &
omo librarian "find Next.js 15 patterns" &
wait
```

### Pattern 2: Grep → Review (Haiku → Sonnet)
```bash
# Step 1: Cheap grep (Haiku - $0.05)
omo explore "find all 'any' types" > any-types.txt

# Step 2: Targeted review (Sonnet - $0.50)
omo review-code --files-from any-types.txt
```

### Pattern 3: Tiered Escalation
```bash
# 1. Try cheap first (Haiku - $0.05)
omo explore "find RLS bug in appointments"

# 2. If not enough, escalate (Sonnet - $1.00)
omo debug "RLS policy blocking valid queries"

# 3. If still stuck, final escalation (Opus - $10.00)
omo oracle "diagnose race condition in appointment_status"
```

## Cost Optimization Rules

### ✅ DO
1. **Always grep first** (Haiku) before reviewing (Sonnet)
2. **Fire multiple Haiku agents in parallel** (they're cheap!)
3. **Use Sonnet for 80% of work** (generation, reviews, refactoring)
4. **Only use Opus after 2+ Sonnet failures**
5. **Batch related tasks** (review 10 files at once, not one by one)

### ❌ DON'T
1. **Never use Opus for searches** (use Haiku)
2. **Never use Opus for code generation** (use Sonnet)
3. **Never review entire codebase** (grep first, review findings)
4. **Never block on parallel tasks** (fire and continue working)
5. **Never retry same agent 3+ times** (escalate to higher tier)

## Real-World Examples (Vete Project)

### Example 1: Add New Feature (Multi-Tier)
```bash
# Total cost: ~$2.50 (vs $20 with all-Opus)

# 1. Research existing patterns (Haiku - $0.10)
omo explore "find similar features to appointment booking"
omo librarian "search Supabase docs for RLS best practices"

# 2. Generate boilerplate (Sonnet - $1.00)
omo add-feature "appointment reminders" --boilerplate

# 3. Implement logic (Sonnet - $1.00)
omo generate-code "reminder scheduling with cron"

# 4. Review security (Sonnet - $0.40)
omo review-code --security web/app/api/reminders

# 5. Final architecture check (Opus - only if issues found)
# (Skip if Sonnet review passed)
```

### Example 2: Code Review (Cheap)
```bash
# Total cost: ~$1.00 (vs $5 with full Sonnet review)

# 1. Find issues with Haiku ($0.20)
omo explore "find missing auth checks in API routes" > auth-issues.txt
omo explore "find hardcoded tenant_ids" > tenant-issues.txt
omo explore "find inline styles" > style-issues.txt

# 2. Review findings with Sonnet ($0.80)
omo review-code --fix-issues auth-issues.txt tenant-issues.txt style-issues.txt
```

### Example 3: Debug Complex Issue (Escalation)
```bash
# Total cost: ~$12 (vs $60 with all-Opus)

# 1. Try cheap first (Haiku - $0.05)
omo explore "find race conditions in appointment booking"

# 2. Standard debugging (Sonnet - $2.00)
omo debug "appointment double-booking issue"

# 3. If stuck after 2 tries, escalate (Opus - $10.00)
omo oracle "analyze appointment locking mechanism for race conditions"
```

## Monthly Cost Projection (Active Development)

| Scenario | Haiku | Sonnet | Opus | Total |
|----------|-------|--------|------|-------|
| **Old Setup (all Sonnet/Opus)** | $0 | $200 | $300 | **$500** |
| **Optimized (80% Haiku)** | $20 | $60 | $20 | **$100** |
| **Savings** | - | - | - | **$400/mo** |

## Team Guidelines

1. **Junior devs**: Use Haiku + Sonnet (never Opus without approval)
2. **Senior devs**: Use all tiers appropriately
3. **Emergencies**: Opus approved for critical bugs in production
4. **Weekly review**: Check costs, optimize patterns

## Related Files

- `workflows/parallel-analysis.md` - Cheap parallel workflows
- `workflows/cost-optimized-review.md` - Grep → Review pattern
- `commands/add-feature.md` - Multi-tier feature development
