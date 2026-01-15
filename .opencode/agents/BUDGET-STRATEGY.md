# Budget Strategy for Vete Project

> **Critical**: You have LIMITED Claude calls. Use them wisely!

## Your Budget

| Resource | Amount | Cost | Strategy |
|----------|--------|------|----------|
| **Gemini Pro** | Unlimited | FREE | **Use for 95% of work** |
| **Claude** | 20 calls | $0/call (prepaid) | **Reserve for emergencies** |
| **OpenCode Credits** | $20 | $20 remaining | **Backup only** |

---

## Gemini-First Strategy (FREE)

### Use Gemini Pro for:
✅ **99% of daily work**
- All searches and grep operations (explore agent)
- Documentation research (librarian agent)
- Code generation (components, APIs, tests)
- Standard code reviews
- Refactoring
- Frontend UI/UX work
- Documentation writing
- Initial debugging attempts
- Feature development

### Command Pattern:
```bash
# All these use FREE Gemini
omo explore "find missing auth checks"
omo add-feature "appointment reminders"
omo review-code "web/app/api/pets/route.ts"
omo add-component "PetCard with theme variables"
omo debug "RLS policy not working" --attempts 3
```

**Cost**: $0 (completely free with Gemini Pro subscription)

---

## Claude Oracle (PRECIOUS - Only 20 Calls)

### Reserve Claude for ONLY:
⚠️ **Critical situations after Gemini fails**
1. Architecture decisions (multi-system design)
2. Security vulnerabilities (after Gemini finds them)
3. Complex debugging (after 3+ Gemini failures)
4. Race conditions and concurrency issues
5. RLS policy design (multi-tenant isolation)
6. Performance optimization (system-wide)

### Budget Allocation:
- **10 calls**: Emergency debugging and critical fixes
- **5 calls**: Architecture and design reviews
- **5 calls**: Security audits and compliance

### Usage Protocol:
```bash
# ❌ NEVER do this (wastes Claude call)
omo oracle "find auth issues"

# ✅ CORRECT pattern
# 1. Use Gemini to find issues (FREE)
omo explore "find auth issues" 

# 2. Try Gemini to fix (FREE)
omo fix-issues auth-issues.txt --agent gemini

# 3. ONLY if Gemini fails 3+ times, escalate to Claude
omo oracle "fix auth issue that Gemini couldn't solve" --context previous-attempts.txt
```

### Tracking Usage:
Create `.opencode/claude-usage.txt`:
```
Call 1: [Date] Architecture - Multi-tenant RLS design
Call 2: [Date] Debugging - Race condition in appointments
Call 3: [Date] Security - Payment processing audit
...
Remaining: 17/20
```

---

## Parallel Execution Strategy (Maximize FREE Gemini)

### Fire 10+ Gemini Agents Simultaneously
```bash
# Total cost: $0 (all FREE!)
# Time: 1 minute (vs 10 minutes sequential)

omo explore "find missing auth checks" &
omo explore "find missing tenant filters" &
omo explore "find any types" &
omo explore "find inline styles" &
omo explore "find hardcoded colors" &
omo explore "find missing RLS" &
omo explore "find unused imports" &
omo explore "find missing tests" &
omo explore "find SQL injection risks" &
omo explore "find XSS vulnerabilities" &
wait

# Analyze findings with Gemini (still FREE)
omo review-findings --all
```

**Key Point**: Since Gemini is FREE, run as many parallel tasks as needed!

---

## Cost Comparison: Old vs New Strategy

### Old Strategy (Before Budget Optimization)
| Task | Model | Cost |
|------|-------|------|
| Search codebase | Sonnet | $0.50 |
| Generate component | Sonnet | $1.00 |
| Review code | Sonnet | $2.00 |
| Debug issue | Opus | $5.00 |
| **Daily total** | | **$8.50** |
| **Monthly total** | | **~$255** |

### New Strategy (Gemini-First)
| Task | Model | Cost |
|------|-------|------|
| Search codebase (10x parallel) | Gemini | $0 |
| Generate component | Gemini | $0 |
| Review code | Gemini | $0 |
| Debug issue (3 attempts) | Gemini | $0 |
| Escalate to Claude (if needed) | Claude | 1 call |
| **Daily total** | | **$0** |
| **Monthly total** | | **$0 (+ ~2-5 Claude calls)** |

**Savings**: ~$255/month → $0/month

---

## Emergency Protocol

### If You Run Out of Claude Calls:

**Option 1: Use OpenCode Credits ($20 remaining)**
```json
// Edit oh-my-opencode.json
{
  "agents": {
    "oracle": {
      "model": "openai/gpt-4o"  // Use $20 credit
    }
  }
}
```

**Option 2: Wait for Next Billing Cycle**
- Continue with Gemini for all work
- Document issues requiring Claude
- Batch review when calls reset

**Option 3: Request Additional Budget**
- Justify with specific use case
- Show cost/benefit analysis
- Get approval before proceeding

---

## Quality Gate: When to Escalate

### Gemini → Claude Escalation Criteria

**Don't escalate if:**
- ❌ First attempt with Gemini
- ❌ Issue is straightforward (syntax error, missing import)
- ❌ Solution exists in documentation
- ❌ Pattern exists in codebase

**Escalate to Claude if:**
- ✅ Gemini failed 3+ times on same issue
- ✅ Security vulnerability needs expert review
- ✅ Architecture decision affects entire system
- ✅ Race condition or concurrency bug
- ✅ Data loss risk
- ✅ Production incident

### Escalation Template:
```bash
# Document failed attempts
echo "Attempt 1: Gemini suggested X, failed because Y" >> escalation.txt
echo "Attempt 2: Gemini suggested Z, failed because W" >> escalation.txt
echo "Attempt 3: Gemini suggested A, failed because B" >> escalation.txt

# Now escalate with context
omo oracle "Solve issue after 3 Gemini failures" --context escalation.txt

# Log usage
echo "Call $N: [Date] Debugging - [Issue]" >> .opencode/claude-usage.txt
```

---

## Monthly Cost Projection

### Optimistic Scenario (Gemini handles 95%)
- Gemini usage: Unlimited (FREE)
- Claude usage: 5 calls/month
- OpenCode credits: $20 remaining (untouched)
- **Total monthly cost: $0**

### Realistic Scenario (Gemini handles 90%)
- Gemini usage: Unlimited (FREE)
- Claude usage: 15 calls/month
- OpenCode credits: $5 used
- **Total monthly cost: $5**

### Worst Case (Complex project)
- Gemini usage: Unlimited (FREE)
- Claude usage: 20 calls/month (all used)
- OpenCode credits: $15 used
- **Total monthly cost: $15**

**Compare to old strategy: $255/month → $0-15/month (94-100% savings)**

---

## Best Practices

### ✅ DO
1. **Always try Gemini first** (it's FREE!)
2. **Run 10+ Gemini agents in parallel** (no cost penalty)
3. **Document failed attempts before escalating**
4. **Track Claude usage in log file**
5. **Batch Claude reviews** (1 call for 10 issues vs 10 calls)

### ❌ DON'T
1. **Never use Claude for searches** (use Gemini explore)
2. **Never use Claude for code generation** (use Gemini)
3. **Never use Claude without trying Gemini 3+ times**
4. **Never waste Claude calls on trivial issues**
5. **Never exceed 2 Claude calls per day** (save for emergencies)

---

## Success Metrics

### Track Weekly:
- Gemini tasks completed: [Unlimited]
- Claude calls used: [X/20]
- OpenCode credits spent: [$X/$20]
- Issues resolved without Claude: [Y%]

### Goal:
- **90%+ issues resolved with FREE Gemini**
- **<2 Claude calls per week**
- **$0-10 monthly spend**

---

## Related Files

- `oh-my-opencode.json` - Agent model configuration
- `agents/cost-tiers.md` - Model selection guide
- `workflows/parallel-analysis.md` - FREE parallel patterns
- `.opencode/claude-usage.txt` - Usage tracking log (create this)
