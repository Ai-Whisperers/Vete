# Installation & Testing Guide

> **Goal**: Get OhMyOpenCode running with FREE Gemini in 15 minutes

---

## Prerequisites

✅ **Required**:
- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Gemini Pro subscription (FREE trial or paid)
- Git bash or WSL (on Windows)

✅ **Optional**:
- Claude subscription (for 20 oracle calls)
- OpenCode credits ($20 backup)

---

## Step 1: Install OhMyOpenCode (5 minutes)

### Option A: Interactive Installer (Recommended)
```bash
# Run interactive installer
bunx oh-my-opencode install

# When prompted:
# - Enable Gemini? → YES
# - Enable Claude? → YES (if you have subscription)
# - Enable ChatGPT? → NO (unless you have credits)
```

### Option B: Non-Interactive
```bash
# Install with flags
bunx oh-my-opencode install --no-tui --gemini=yes --claude=yes
```

### Verify Installation
```bash
# Check version (should be 1.0.150+)
opencode --version

# Check config
cat ~/.config/opencode/opencode.json | grep "oh-my-opencode"
# Should show: "plugins": ["oh-my-opencode"]
```

---

## Step 2: Copy Config to Project (2 minutes)

```bash
# Navigate to Vete project
cd C:/Users/Alejandro/Documents/Ivan/Adris/Vete

# Verify .opencode directory exists
ls -la .opencode/
# Should show: README.md, oh-my-opencode.json, etc.

# Config is already there! Nothing to copy.
```

---

## Step 3: Test with Simple Command (3 minutes)

### Test 1: Launch OMO
```bash
# Launch OpenCode in Vete directory
cd C:/Users/Alejandro/Documents/Ivan/Adris/Vete
opencode
```

**Expected**: Opens interactive session

### Test 2: Simple Exploration (FREE Gemini)
```
# In OpenCode session, type:
> find all API routes with missing authentication checks

# This should:
# 1. Use Gemini 2.0 Flash (FREE)
# 2. Search web/app/api directory
# 3. Return list of files with no auth.getUser() calls
```

**Expected**:
- Agent: `explore` (Gemini)
- Cost: $0
- Time: 10-30 seconds
- Result: List of files

### Test 3: Parallel Search (FREE Gemini)
```
# Fire 3 parallel searches
> explore "find TypeScript any types" &
> explore "find inline styles" &
> explore "find hardcoded colors" &

# Then check results
> background_output task_id="bg_xxx"
```

**Expected**:
- All 3 run simultaneously
- Cost: $0
- Time: 30-45 seconds total
- Result: 3 separate reports

---

## Step 4: Verify Budget Protection (2 minutes)

### Check Claude Limits
```bash
# View config
cat .opencode/oh-my-opencode.json | grep -A 5 "modelConcurrency"

# Should show:
# "anthropic/claude-sonnet-4-5": 1  # Only 1 concurrent!
# "google/gemini-2.0-flash-exp": 50 # Many concurrent
```

### Test Oracle (Uses 1 Claude Call - Optional)
```
# In OpenCode session:
> oracle "explain the multi-tenant architecture briefly"

# This uses 1 of your 20 Claude calls
# LOG IT IMMEDIATELY after!
```

**After using oracle**:
```bash
# Log the usage
echo "Call 1: $(date) - Test - Architecture explanation" >> .opencode/claude-usage.txt
echo "Remaining: 19/20" >> .opencode/claude-usage.txt
```

---

## Step 5: Test Parallel Analysis Workflow (3 minutes)

### Run Pre-Commit Check Pattern
```bash
# In OpenCode session:
> I need to run parallel analysis before committing. Fire 5 explore agents:
> 1. Find missing auth checks
> 2. Find missing tenant_id filters
> 3. Find TypeScript any types
> 4. Find inline styles  
> 5. Find hardcoded colors
> 
> Run all in parallel and summarize findings.
```

**Expected**:
- Sisyphus launches 5 parallel `explore` agents
- All use FREE Gemini
- Complete in 30-60 seconds
- Consolidated summary report

**Cost**: $0  
**Time**: <1 minute  
**Value**: Comprehensive quality check

---

## Troubleshooting

### Issue 1: "Model not found"

**Symptom**:
```
Error: Model google/gemini-2.0-flash-exp not found
```

**Solution**:
```bash
# Check available models
opencode models list

# Update config if model name different
nano .opencode/oh-my-opencode.json
# Change model name to match available model
```

### Issue 2: "No Gemini subscription"

**Symptom**:
```
Error: Gemini API key not found
```

**Solution**:
```bash
# Set Gemini API key
export GOOGLE_AI_API_KEY="your-key-here"

# Or configure in OpenCode:
opencode config set GOOGLE_AI_API_KEY "your-key-here"
```

### Issue 3: "Background tasks not working"

**Symptom**:
Tasks hang or don't complete

**Solution**:
```bash
# Increase timeout in config
nano .opencode/oh-my-opencode.json

# Add:
{
  "background_task": {
    "timeout": 180000  // 3 minutes
  }
}
```

### Issue 4: "Too slow"

**Symptom**:
Responses take 30+ seconds

**Solution**:
1. Verify using Gemini (not Claude) for main agent
2. Check concurrency limits (should be 50 for Gemini)
3. Fire more agents in parallel (not sequentially)

---

## Verification Checklist

After installation and testing:

- [ ] OMO installed (version 1.0.150+)
- [ ] Config in `.opencode/oh-my-opencode.json` verified
- [ ] Gemini set as default for all agents (except oracle)
- [ ] Oracle limited to 1 concurrent (budget protection)
- [ ] Simple exploration test passed (FREE)
- [ ] Parallel search test passed (FREE)
- [ ] Usage tracking file created (`.opencode/claude-usage.txt`)
- [ ] No Claude calls used yet (or logged if tested)

**If all checked**: ✅ You're ready to use OMO!

---

## First Real Task

Now that OMO is working, try a real workflow:

### Task: Find and Fix Security Issues

```bash
# Launch OpenCode
opencode

# Phase 1: Parallel search (FREE)
> I need to audit security. Fire 6 parallel explore agents:
> 1. Find missing authentication checks in API routes
> 2. Find missing tenant_id filters in queries
> 3. Find SQL injection risks
> 4. Find XSS vulnerabilities
> 5. Find missing RLS policies in migrations
> 6. Find exposed secrets or API keys
> 
> Run all in parallel and create a prioritized security report.

# Wait 30-60 seconds for completion

# Phase 2: Review findings
> Review the security findings and create a fix plan with specific file:line references

# Phase 3: Fix critical issues
> Fix the top 3 critical security issues found
```

**Expected Cost**: $0 (all Gemini)  
**Expected Time**: 3-5 minutes  
**Expected Output**:
- Security report with 20-50 findings
- Prioritized fix plan
- Code fixes for top 3 issues

**vs Old Way**:
- Cost: $20+ (Claude Opus security audit)
- Time: 30 minutes
- Output: Similar

**Savings**: 100% cost, 90% time

---

## Daily Workflow Examples

### Morning: Quality Check
```bash
opencode
> Run parallel quality check: auth, tenant filters, type safety, styling, tests
```

**Cost**: $0, **Time**: 1 minute

### Feature Development
```bash
opencode
> Add feature: email reminders for appointments
> - Research existing patterns
> - Generate migration, API route, tests
> - Review security
```

**Cost**: $0 (unless complex → 1 Claude call), **Time**: 5-10 minutes

### Code Review
```bash
opencode
> Review web/app/api/appointments/route.ts for security, tenant isolation, and style
```

**Cost**: $0, **Time**: 30 seconds

### Debugging
```bash
opencode
> Debug: RLS policy blocking valid appointment queries
> Try 3 different approaches before escalating
```

**Cost**: $0 (Gemini tries 3x), then 1 Claude call if needed

---

## Success Metrics (Track Weekly)

### Week 1 Goals
- [ ] 0 Claude calls used (all Gemini)
- [ ] 10+ parallel analyses run (all FREE)
- [ ] 5+ features added (all FREE)
- [ ] 20+ code reviews (all FREE)
- [ ] Total cost: $0

### Month 1 Goals
- [ ] <10 Claude calls used (<50%)
- [ ] 50+ parallel analyses run
- [ ] 20+ features added
- [ ] 100+ code reviews
- [ ] Total cost: <$15

### Cost Tracking
```bash
# Add to .bashrc or .zshrc for easy tracking
alias omo-cost="cat .opencode/claude-usage.txt | tail -1"

# Check remaining budget anytime
omo-cost
# Output: Remaining: 19/20
```

---

## Next Steps

1. ✅ Installation complete
2. ✅ Tests passed
3. 🔄 Run first real security audit
4. 🔄 Develop one feature end-to-end
5. 🔄 Track costs for 1 week
6. 🔄 Compare vs old setup
7. 🔄 Migrate remaining commands
8. 🔄 Train team on workflows

---

## Support & Documentation

### Quick Reference
- `QUICK-START.md` - Common commands
- `agents/BUDGET-STRATEGY.md` - Cost optimization
- `workflows/parallel-analysis.md` - Parallel patterns
- `rules/vete-project-standards.md` - Coding standards

### Community
- GitHub: https://github.com/code-yeongyu/oh-my-opencode
- Docs: https://ohmyopencode.com/
- Discord: (if available)

### Internal
- `.opencode/claude-usage.txt` - Your budget tracker
- `.opencode/MIGRATION-PLAN.md` - Full migration roadmap
- `.opencode/SUMMARY.md` - Overview and metrics

---

**Installation Complete!** 🎉

You now have:
- ✅ FREE Gemini for 95% of work
- ✅ 20 Claude calls for emergencies
- ✅ Parallel execution (10+ agents)
- ✅ Budget protection (concurrency limits)
- ✅ Cost tracking (manual logs)

**Start saving**: Run your first parallel analysis now!
