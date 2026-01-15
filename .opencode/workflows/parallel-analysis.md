# Parallel Analysis Workflow

> **Cost**: ~$0.50 (vs $10+ for sequential Opus)  
> **Time**: 30 seconds (parallel) vs 5 minutes (sequential)  
> **Model**: Haiku (explore) + Sonnet (review)

## Purpose

Run multiple code quality checks simultaneously using cheap agents, then consolidate findings for targeted fixes.

## When to Use

- Before committing changes
- Before code review
- During feature development
- Weekly quality audits

## Workflow

### Phase 1: Parallel Search (Haiku - FREE/CHEAP)

Fire all searches simultaneously in background:

```javascript
// Launch 8 parallel Haiku tasks (~$0.40 total)
background_task(
  agent="explore",
  prompt="Find all API routes missing authentication checks (supabase.auth.getUser)"
)

background_task(
  agent="explore", 
  prompt="Find all database queries missing tenant_id filtering"
)

background_task(
  agent="explore",
  prompt="Find all TypeScript 'any' types in web/app directory"
)

background_task(
  agent="explore",
  prompt="Find all inline styles (style={{) in React components"
)

background_task(
  agent="explore",
  prompt="Find all hardcoded colors (not using var(--*))"
)

background_task(
  agent="explore",
  prompt="Find all database tables without RLS policies (check web/db/*.sql)"
)

background_task(
  agent="librarian",
  prompt="Search for Next.js 15 best practices for Server Components"
)

background_task(
  agent="librarian",
  prompt="Search for Supabase RLS policy patterns for multi-tenant apps"
)

// Continue working while agents search in background
// System will notify when all complete
```

### Phase 2: Collect Results (Automated)

```javascript
// Wait for all tasks to complete (notifications will arrive)
// Then retrieve results

background_output(task_id="bg_explore_auth")
background_output(task_id="bg_explore_tenant")
// ... etc for all tasks
```

### Phase 3: Targeted Review (Sonnet - MODERATE)

```javascript
// Now use Sonnet to review ONLY the problematic files found
Task(
  agent="code-reviewer",
  prompt=`Review these specific issues found by parallel search:

AUTH ISSUES (15 files):
- web/app/api/pets/route.ts - missing auth check
- web/app/api/appointments/route.ts - missing auth check
...

TENANT ISOLATION ISSUES (8 files):
- web/app/api/services/route.ts - missing tenant_id filter
...

Provide specific fixes for each file.`,
  model="sonnet"
)
```

**Cost**: ~$1.00 for targeted review (vs $10+ for full codebase review)

---

## Example: Pre-Commit Quality Check

### Script: `.opencode/workflows/pre-commit-parallel.sh`

```bash
#!/bin/bash
# Cost-optimized pre-commit check using parallel agents

echo "🔍 Running parallel quality checks..."
echo ""

# Fire all agents in background
echo "Launching 6 parallel Haiku agents..."
omo explore "find missing auth checks" --background &
omo explore "find missing tenant filters" --background &
omo explore "find TypeScript any types" --background &
omo explore "find inline styles" --background &
omo explore "find hardcoded colors" --background &
omo explore "find missing RLS policies" --background &

# Wait for all to complete
wait

echo ""
echo "✅ All searches complete. Analyzing findings..."

# Retrieve results and check for issues
AUTH_ISSUES=$(omo results bg_auth | wc -l)
TENANT_ISSUES=$(omo results bg_tenant | wc -l)
ANY_TYPES=$(omo results bg_any | wc -l)
STYLE_ISSUES=$(omo results bg_styles | wc -l)
COLOR_ISSUES=$(omo results bg_colors | wc -l)
RLS_ISSUES=$(omo results bg_rls | wc -l)

TOTAL=$((AUTH_ISSUES + TENANT_ISSUES + ANY_TYPES + STYLE_ISSUES + COLOR_ISSUES + RLS_ISSUES))

if [ $TOTAL -gt 0 ]; then
  echo ""
  echo "❌ Found $TOTAL issues:"
  echo "   - Auth checks: $AUTH_ISSUES"
  echo "   - Tenant filters: $TENANT_ISSUES"
  echo "   - 'any' types: $ANY_TYPES"
  echo "   - Inline styles: $STYLE_ISSUES"
  echo "   - Hardcoded colors: $COLOR_ISSUES"
  echo "   - Missing RLS: $RLS_ISSUES"
  echo ""
  echo "Run: omo fix-issues --targeted"
  exit 1
else
  echo ""
  echo "✅ No issues found. Safe to commit!"
  exit 0
fi
```

**Cost**: ~$0.40 (6 Haiku searches)  
**Time**: ~30 seconds  
**Savings**: 95% vs full Opus review

---

## Pattern: Grep First, Review Second

### ❌ Expensive (Old Way)
```javascript
// Review entire codebase with Opus ($20+)
Task(agent="oracle", prompt="Review all code for security issues")
```

### ✅ Cheap (New Way)
```javascript
// 1. Grep with Haiku ($0.05)
background_task(agent="explore", prompt="Find security issues")

// 2. Review findings with Sonnet ($1.00)
Task(agent="code-reviewer", prompt="Fix these 10 security issues")
```

**Savings**: 95%

---

## Real-World Example: Vete Project Security Audit

### Old Approach (Sequential Opus)
```bash
# Cost: $50, Time: 30 minutes
omo oracle "Complete security audit of entire codebase"
```

### New Approach (Parallel Haiku + Targeted Sonnet)
```bash
# Phase 1: Parallel searches (Cost: $0.50, Time: 1 minute)
omo explore "find SQL injection risks" &
omo explore "find XSS vulnerabilities" &
omo explore "find exposed secrets" &
omo explore "find missing input validation" &
omo explore "find insecure authentication" &
omo explore "find missing RLS policies" &
omo librarian "search for Next.js security best practices" &
omo librarian "search for Supabase security patterns" &
wait

# Phase 2: Targeted review (Cost: $2.00, Time: 2 minutes)
omo review-code --security --files-from security-issues.txt

# Total: $2.50, 3 minutes (96% cost reduction, 10x faster)
```

---

## Automation: Weekly Scheduled Audit

### Cron Job: Every Monday 9am

```bash
#!/bin/bash
# .opencode/workflows/weekly-audit.sh

# Run parallel analysis
bash .opencode/workflows/pre-commit-parallel.sh > weekly-audit.log

# If issues found, create GitHub issue
if [ $? -ne 0 ]; then
  gh issue create \
    --title "Weekly Code Quality Issues - $(date +%Y-%m-%d)" \
    --body-file weekly-audit.log \
    --label "quality,automated"
fi
```

**Cost**: ~$0.50 per week = $2/month  
**Benefit**: Catch issues early, prevent technical debt

---

## Advanced: Parallel Test Analysis

### Problem: Test failures are expensive to analyze

```javascript
// ❌ Expensive: Send 500 test results to Opus
Task(agent="oracle", prompt="Analyze all test failures")
// Cost: $10+
```

### Solution: Parallel categorization then targeted fix

```javascript
// 1. Run tests (FREE - no agent)
// npm run test > test-results.txt

// 2. Parallel categorization (Haiku - $0.20)
background_task(agent="explore", prompt="Find auth test failures")
background_task(agent="explore", prompt="Find database test failures")
background_task(agent="explore", prompt="Find UI test failures")

// 3. Fix each category (Sonnet - $1.00 per category)
Task(agent="test-writer", prompt="Fix auth tests")
Task(agent="test-writer", prompt="Fix database tests")

// Total: $3.20 (vs $10+ with Opus)
```

---

## Cost Comparison Summary

| Scenario | Old (Opus Sequential) | New (Parallel Haiku→Sonnet) | Savings |
|----------|----------------------|----------------------------|---------|
| Pre-commit check | $10, 10 min | $0.50, 1 min | **95%** |
| Security audit | $50, 30 min | $2.50, 3 min | **95%** |
| Test analysis | $10, 5 min | $3.00, 2 min | **70%** |
| Weekly quality | $40/week | $2/week | **95%** |
| **Monthly** | **$500** | **$50** | **90%** |

---

## Best Practices

### ✅ DO
1. **Fire multiple Haiku agents in parallel** (they're cheap!)
2. **Grep first, review second** (reduce context size)
3. **Use background tasks** (don't block on searches)
4. **Batch similar issues** (fix 10 at once, not one by one)
5. **Cancel all before final answer** (cleanup)

### ❌ DON'T
1. **Never review entire codebase** (grep for issues first)
2. **Never use Opus for searches** (use Haiku)
3. **Never run searches sequentially** (parallel saves time)
4. **Never block on background tasks** (continue working)
5. **Never ignore findings** (fix or document why not)

---

## Troubleshooting

### Issue: Background tasks timeout
**Solution**: Increase timeout in `oh-my-opencode.json`
```json
{
  "background_task": {
    "timeout": 120000
  }
}
```

### Issue: Too many concurrent tasks
**Solution**: Adjust concurrency limits
```json
{
  "background_task": {
    "modelConcurrency": {
      "anthropic/claude-haiku-4-5": 5
    }
  }
}
```

### Issue: Duplicate results
**Solution**: Use more specific search prompts

---

## Related Files

- `agents/cost-tiers.md` - Model tier reference
- `workflows/cost-optimized-review.md` - Single-file review pattern
- `commands/review-code.md` - Standard review command
