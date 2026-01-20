# Quick Start Guide - Vete + OhMyOpenCode

> **TL;DR**: Use FREE Gemini for everything. Save your 20 Claude calls for emergencies.

## Installation

```bash
# 1. Install OMO (if not already installed)
bunx oh-my-opencode install --no-tui --gemini=yes

# 2. Verify configuration
cd /path/to/Vete
cat .opencode/oh-my-opencode.json

# 3. Test with a simple command
opencode
# Then type: "find all API routes with missing auth"
```

---

## Daily Workflow

### Pattern 1: Search Codebase (FREE - Use Liberally)

```bash
# Launch opencode
opencode

# Fire multiple parallel searches
> explore "find all missing auth checks"
> explore "find all missing tenant_id filters"  
> explore "find all TypeScript any types"
> explore "find all hardcoded colors"

# All FREE! Run 10+ at once if needed
```

### Pattern 2: Add New Feature (FREE)

```bash
opencode

# Gemini will handle entire workflow
> add-feature "appointment email reminders"

# It will:
# 1. Research existing patterns (explore)
# 2. Generate database migration
# 3. Create API route
# 4. Add tests
# 5. Review code

# Cost: $0
```

### Pattern 3: Debug Issue (FREE, with Claude Escalation)

```bash
opencode

# Try Gemini first (FREE)
> debug "RLS policy blocking appointments query"

# If Gemini fails after 3 attempts, escalate:
> oracle "solve RLS issue after 3 Gemini failures" --context debug-log.txt

# This uses 1 of your 20 Claude calls - use wisely!
```

---

## Cost-Optimized Commands

### ✅ FREE (Use Daily)

```bash
# Parallel analysis
> parallel-analysis

# Code review
> review-code web/app/api/pets/route.ts

# Add component
> add-component "PetCard with theme variables"

# Add API route
> add-api "GET /api/reminders"

# Generate tests
> test-writer web/app/api/pets/route.ts

# Refactor
> refactor "extract duplicate auth logic"

# Documentation
> document "appointment booking flow"
```

### ⚠️ EXPENSIVE (Save for Emergencies)

```bash
# Architecture review (uses 1 Claude call)
> oracle "design multi-tenant RLS architecture"

# Security audit (uses 1 Claude call)
> oracle "audit payment processing security"

# Complex debugging (uses 1 Claude call)
> oracle "debug race condition in appointment booking"
```

---

## Parallel Execution (FREE - Recommended)

### Example: Pre-Commit Quality Check

```bash
opencode

# Fire 10 parallel searches (all FREE!)
> explore "find missing auth" &
> explore "find missing tenant filters" &
> explore "find any types" &
> explore "find inline styles" &
> explore "find hardcoded colors" &
> explore "find missing RLS" &
> explore "find unused imports" &
> explore "find missing tests" &
> explore "find SQL injection risks" &
> explore "find XSS vulnerabilities" &

# Wait for all to complete (~30 seconds)
# Then review findings
> review-findings --all
```

**Time**: 30 seconds  
**Cost**: $0  
**Benefit**: Comprehensive code quality check

---

## Budget Tracking

### Check Your Usage

```bash
# View Claude usage log
cat .opencode/claude-usage.txt

# Should show:
# Remaining: 20/20 (initially)
# Remaining: 18/20 (after 2 calls)
```

### Track Each Claude Call

```bash
# After using oracle, log it:
echo "Call 1: $(date) - Architecture review - Multi-tenant RLS" >> .opencode/claude-usage.txt
echo "Remaining: 19/20" >> .opencode/claude-usage.txt
```

---

## Common Tasks & Cost

| Task | Command | Model | Cost |
|------|---------|-------|------|
| Search code | `explore "find X"` | Gemini | **FREE** |
| Generate code | `add-component "X"` | Gemini | **FREE** |
| Review code | `review-code X.ts` | Gemini | **FREE** |
| Debug (initial) | `debug "issue"` | Gemini | **FREE** |
| Debug (complex) | `oracle "issue"` | Claude | **1 call** |
| Architecture | `oracle "design X"` | Claude | **1 call** |
| Security audit | `oracle "audit X"` | Claude | **1 call** |

---

## Best Practices

### ✅ DO
1. **Use Gemini for everything first** (it's FREE!)
2. **Run multiple Gemini agents in parallel** (10+ at once)
3. **Try Gemini 3 times before escalating to Claude**
4. **Track Claude usage in log file**
5. **Batch issues before using Claude** (1 call for 10 issues)

### ❌ DON'T
1. **Never use Claude for searches** (waste of precious calls)
2. **Never use Claude for code generation** (Gemini is FREE)
3. **Never use Claude without trying Gemini first**
4. **Never use Claude for documentation** (Gemini is FREE)
5. **Never exceed 2 Claude calls per week** (unless emergency)

---

## Troubleshooting

### Issue: "Model not found"
**Solution**: Check `oh-my-opencode.json` - ensure Gemini model name is correct

### Issue: "Out of Claude calls"
**Solution**: Use $20 OpenCode credit by changing oracle model to `openai/gpt-4o`

### Issue: "Agent not responding"
**Solution**: Check background task concurrency - Gemini should allow 50 concurrent

---

## Next Steps

1. ✅ Run first parallel analysis
2. ✅ Create feature with Gemini
3. ✅ Track first week without using Claude
4. ✅ Optimize workflows based on usage

---

## Related Files

- `.opencode/oh-my-opencode.json` - Main configuration
- `.opencode/agents/BUDGET-STRATEGY.md` - Detailed budget guide
- `.opencode/agents/cost-tiers.md` - Model selection reference
- `.opencode/workflows/parallel-analysis.md` - Parallel execution patterns
- `.opencode/claude-usage.txt` - Usage tracking log
