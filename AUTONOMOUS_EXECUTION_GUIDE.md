# 🤖 Autonomous Execution Guide

**For AI Agent**: Complete instructions for 30-day autonomous work execution

---

## 🚀 QUICK START

### To Resume Work

1. **Read current status**:
   ```bash
   cat DAILY_PROGRESS.md
   cat BLOCKERS.md
   cat METRICS_DASHBOARD.md
   ```

2. **Check tasks**:
   - View todo list (already loaded in session)
   - Check today's schedule in `MASTER_30DAY_AUTONOMOUS_PLAN.md`

3. **Start working**:
   - Mark current task as `in_progress`
   - Execute the task
   - Mark as `completed` when done
   - Update `DAILY_PROGRESS.md`

### Daily Routine

**Morning** (4 hours):
1. Pull latest changes: `git pull`
2. Run test suite: `npm test`
3. Review yesterday's progress
4. Execute morning tasks
5. Document issues

**Afternoon** (4 hours):
1. Execute afternoon tasks
2. Run affected tests
3. Update progress files
4. Commit work
5. Plan tomorrow

**Evening** (30 min):
1. Final test run
2. Update `DAILY_PROGRESS.md`
3. Update `METRICS_DASHBOARD.md`
4. Commit all changes

---

## 📋 DECISION MATRIX

### When to PROCEED Independently

✅ **PROCEED** if ALL of these are true:
- [ ] Issue is technical, not architectural
- [ ] Solution is clear and documented
- [ ] Estimated fix < 4 hours
- [ ] No data loss risk
- [ ] No breaking API changes
- [ ] Tests can validate the fix

**Action**: Fix it, test it, document it, move on

### When to DOCUMENT & DEFER

⚠️ **DEFER** if ANY of these are true:
- [ ] Architectural decision needed
- [ ] Multiple valid solutions exist
- [ ] User preference unclear
- [ ] Impacts external integrations
- [ ] Requires environment changes
- [ ] Estimated effort > 4 hours

**Action**:
1. Create entry in `DEFERRED_DECISIONS.md`
2. Document context, options, recommendation
3. Continue with other work
4. Revisit when user returns

### When to ESCALATE & HALT

🚨 **ESCALATE** if ANY of these are true:
- [ ] Data loss risk
- [ ] Security vulnerability
- [ ] Production system affected
- [ ] Cannot proceed without user input
- [ ] Fundamental design flaw discovered
- [ ] Breaking changes to critical systems

**Action**:
1. Create entry in `ESCALATIONS.md`
2. Stop work in affected area
3. Work on other areas
4. Wait for user return

---

## 🧪 TESTING STRATEGY

### Service Testing Pattern

**Location**: `web/test-[service]-real.mjs`

**Template**:
```javascript
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const service = new ServiceClass(supabase);

// Test CRUD operations
// Test error handling
// Test edge cases
// Test RLS policies
```

**Run**: `node web/test-[service]-real.mjs`

### API Testing Pattern

**Location**: `web/tests/api/[route].test.ts`

**Template**:
```typescript
import { testApiRoute } from '@/lib/test-utils';

describe('API: /api/[route]', () => {
  test('authenticated request succeeds', async () => {
    const response = await testApiRoute('/api/route', {
      method: 'POST',
      body: validData,
      auth: validToken
    });
    
    expect(response.status).toBe(200);
  });
  
  test('unauthenticated request fails', async () => {
    const response = await testApiRoute('/api/route', {
      method: 'POST',
      body: validData
    });
    
    expect(response.status).toBe(401);
  });
  
  test('RLS prevents cross-tenant access', async () => {
    // Test tenant isolation
  });
});
```

**Run**: `npm run test:api`

### Integration Testing Pattern

**Location**: `web/tests/integration/[workflow].test.ts`

**Template**:
```typescript
test('Complete [workflow] flow', async () => {
  // Setup
  const user = await createTestUser();
  const pet = await petService.create(user.id, petData);
  
  // Execute workflow
  const step1 = await service1.method(pet.id);
  const step2 = await service2.method(step1.id);
  const step3 = await service3.method(step2.id);
  
  // Verify
  expect(step3.status).toBe('completed');
  
  // Cleanup
  await cleanup();
});
```

**Run**: `npm run test:integration`

### E2E Testing Pattern

**Location**: `web/tests/e2e/[flow].spec.ts`

**Template**:
```typescript
test('User journey: [description]', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Step 1: Navigate
  await page.goto('/adris');
  
  // Step 2: Action
  await page.click('[data-testid="button"]');
  
  // Step 3: Verify
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
  
  await context.close();
});
```

**Run**: `npm run test:e2e`

---

## 📝 DOCUMENTATION PATTERNS

### Daily Progress Template

```markdown
# Daily Progress - Day X (Date)

## ✅ Completed Work
- Task 1 - Details
- Task 2 - Details

## 🚨 Issues Encountered
- Issue - Resolution

## 📊 Test Results
- Service: X/Y passing
- API: X/Y passing

## 📊 Metrics
- Coverage: X%
- Quality: X warnings, Y errors

## 🎯 Tomorrow's Focus
- Priority 1
- Priority 2
```

### Blocker Documentation Template

```markdown
### BLOCKER-XXX: [Title]
**Date**: [Date]
**Severity**: CRITICAL | HIGH | MEDIUM
**Status**: ACTIVE | RESOLVED

**Problem**: [Description]

**Impact**: [What's broken]

**Root Cause**: [Why it's broken]

**Solution**: [How to fix]

**Estimated Time**: [Hours]

**Dependencies**: [What's blocked]

**Status**: [Current state]
```

---

## 🔧 COMMON COMMANDS

### Testing
```bash
# Service tests
node web/test-petservice-real.mjs
node web/test-paymentservice-real.mjs
node web/test-storeservice-real.mjs
node web/test-invoiceservice-real.mjs
node web/test-appointmentservice-real.mjs

# Unit tests
npm run test:unit

# API tests
npm run test:api

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm test

# Coverage
npm run test:coverage
```

### Code Quality
```bash
# TypeScript check
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

### Database
```bash
# Run migration
npm run db:migrate

# Verify schema
npm run db:verify

# Check RLS
npm run db:rls-audit
```

### Git
```bash
# Status
git status

# Commit
git add .
git commit -m "feat: descriptive message"

# Push
git push origin main
```

---

## 📊 PROGRESS TRACKING

### Update Daily Progress

```bash
# Edit file
code DAILY_PROGRESS.md

# Update sections:
# - Completed Work
# - Issues Encountered
# - Test Results
# - Metrics
# - Tomorrow's Focus

# Commit
git add DAILY_PROGRESS.md
git commit -m "docs: update daily progress"
```

### Update Metrics Dashboard

```bash
# Edit file
code METRICS_DASHBOARD.md

# Update sections:
# - Overall Progress bar
# - Service testing progress
# - Test counts
# - Quality metrics
# - Time tracking

# Commit
git add METRICS_DASHBOARD.md
git commit -m "docs: update metrics"
```

### Update Todo List

```javascript
// Mark task in progress
mcp_todowrite({
  todos: [
    { id: "task-id", content: "...", status: "in_progress", priority: "high" }
  ]
});

// Mark task complete
mcp_todowrite({
  todos: [
    { id: "task-id", content: "...", status: "completed", priority: "high" }
  ]
});
```

---

## 🎯 QUALITY STANDARDS

### Before Committing

- [ ] All affected tests passing
- [ ] No new TypeScript errors
- [ ] No new ESLint warnings
- [ ] Code formatted (run `npm run format`)
- [ ] Changes documented in progress files
- [ ] Todo list updated

### Before Marking Day Complete

- [ ] All daily tasks completed
- [ ] Test coverage maintained or improved
- [ ] `DAILY_PROGRESS.md` updated
- [ ] `METRICS_DASHBOARD.md` updated
- [ ] All work committed
- [ ] Tomorrow's tasks identified

### Before Quality Gate

- [ ] Gate criteria met
- [ ] All tests passing
- [ ] Zero blockers
- [ ] Documentation complete
- [ ] Metrics on target

---

## 🚨 TROUBLESHOOTING

### Tests Failing

1. **Isolate the failure**:
   ```bash
   # Run specific test
   node web/test-service-real.mjs
   ```

2. **Check the error**:
   - Schema issue? Check database
   - RLS issue? Verify policies
   - Data issue? Check test setup

3. **Fix and verify**:
   ```bash
   # Fix the issue
   # Re-run test
   # Verify passing
   ```

### Build Failing

1. **Check TypeScript**:
   ```bash
   npm run typecheck
   ```

2. **Check imports**:
   - Missing dependencies?
   - Path issues?

3. **Fix and rebuild**:
   ```bash
   npm run build
   ```

### Database Issues

1. **Verify connection**:
   ```bash
   # Check .env.local
   cat web/.env.local
   ```

2. **Check schema**:
   ```bash
   # Run diagnostic
   npm run db:verify
   ```

3. **Apply migrations**:
   ```bash
   npm run db:migrate
   ```

---

## 📞 COMMUNICATION

### With User (When They Return)

**Files to review**:
1. `FINAL_REPORT.md` - Overall summary
2. `METRICS_DASHBOARD.md` - Latest numbers
3. `BLOCKERS.md` - Any active issues
4. `DEFERRED_DECISIONS.md` - Decisions needed
5. `ESCALATIONS.md` - Critical items
6. `WEEKLY_REPORTS/` - Week-by-week progress

**Present**:
- What was completed
- What's blocked/deferred
- Key metrics
- Recommendations

---

## ✅ SUCCESS CHECKLIST

### Daily Success
- [ ] Daily tasks completed
- [ ] Tests passing
- [ ] Progress documented
- [ ] Todo list updated
- [ ] Work committed

### Weekly Success
- [ ] Quality gate met
- [ ] Weekly report created
- [ ] Metrics on track
- [ ] No critical blockers
- [ ] Next week planned

### Final Success
- [ ] All services tested
- [ ] All APIs validated
- [ ] E2E flows complete
- [ ] Documentation done
- [ ] Production ready
- [ ] Final report delivered

---

## 🎓 LEARNING FROM PATTERNS

### Established Patterns (Follow These)

1. **Standalone test scripts** - Bypass Vitest OOM
2. **Real user profiles** - Avoid FK violations
3. **JSONB for flexible data** - Better than normalized for some cases
4. **Service layer abstraction** - Clean separation
5. **Atomic operations** - Use RPC functions for complex transactions

### Anti-Patterns (Avoid These)

1. ❌ Fake UUIDs in tests
2. ❌ Hardcoded tenant IDs
3. ❌ Assuming schema without checking
4. ❌ Skipping RLS verification
5. ❌ Committing failing tests

---

## 🚀 YOU'RE READY

**Everything you need is documented**:
- ✅ Master plan with daily tasks
- ✅ Decision framework
- ✅ Testing strategies
- ✅ Progress tracking system
- ✅ Quality standards
- ✅ Troubleshooting guides

**Start with**:
1. Review `DAILY_PROGRESS.md`
2. Check todo list
3. Begin next task
4. Follow the plan
5. Document everything

**Remember**:
- Work autonomously with confidence
- Document decisions
- Test thoroughly
- Update progress daily
- Ask questions via DEFERRED_DECISIONS.md

---

**You got this! 🚀**

Let the autonomous execution begin.
