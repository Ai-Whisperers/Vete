# Cost Tracking Guide - OhMyOpenCode

> **How to monitor usage and costs in the Vete project**

---

## 📊 Where to Find Stats

### 1. Quick Dashboard (Recommended)

```bash
# Run this anytime to see current stats
.opencode\view-stats.bat
```

**Shows**:
- Budget status (20 Claude calls remaining)
- Current usage (Gemini tasks, Claude calls)
- Total cost since installation
- Configuration summary
- Session history

---

### 2. Manual Tracking Files

| File | Location | What It Shows |
|------|----------|---------------|
| **Budget Tracker** | `.opencode\claude-usage.txt` | Claude calls used/remaining |
| **OpenCode Logs** | `%USERPROFILE%\.config\opencode\logs\` | Detailed session logs |
| **Session History** | `%USERPROFILE%\.config\opencode\sessions\` | All past sessions |
| **Config** | `.opencode\oh-my-opencode.json` | Agent models & limits |

---

### 3. Built-in OpenCode Commands

```bash
# View authentication status
opencode auth status

# View current configuration
opencode config show

# View session history (if supported)
opencode sessions list
```

---

## 💰 Cost Breakdown

### Current Costs (As of Installation - Jan 14, 2026)

| Resource | Used | Cost | Remaining |
|----------|------|------|-----------|
| **Gemini Tasks** | 0 | $0 (FREE) | Unlimited |
| **Claude Calls** | 0 | $0 | 20 calls |
| **OpenCode Credits** | 0 | $0 | $20 |
| **TOTAL** | - | **$0.00** | - |

---

## 📈 How to Track Usage

### Method 1: Automatic (View Stats Script)

```bash
# Before working
.opencode\view-stats.bat

# After working
.opencode\view-stats.bat
# Compare numbers
```

### Method 2: Manual Logging (Claude Calls Only)

Every time you use `oracle` (Claude), log it immediately:

1. **Open**: `.opencode\claude-usage.txt`
2. **Add line**:
   ```
   Call X: 2026-01-14 15:30 | Feature: Security audit | Result: Success | Worth it: Yes
   ```
3. **Update count**:
   ```
   Remaining: 19/20
   ```

**Example Log**:
```
# Claude Usage Tracker
Budget: 20 calls total
Remaining: 20/20

---

## Usage Log

Call 1: 2026-01-14 15:30 | Security audit | Success | Worth it: Yes
Remaining: 19/20

Call 2: 2026-01-15 10:00 | Architecture design | Success | Worth it: Yes
Remaining: 18/20

Call 3: 2026-01-16 14:45 | Debug race condition | Success | Worth it: Yes
Remaining: 17/20
```

### Method 3: OpenCode Session Logs

```bash
# View last session log
cd %USERPROFILE%\.config\opencode\logs
dir /o-d
type [latest-log-file]
```

**Look for**:
- Agent invocations (which agents were used)
- Model calls (which models were called)
- Token usage (if available)
- Errors or warnings

---

## 🎯 Cost Monitoring Rules

### Daily Check (30 seconds)
```bash
# Morning check
.opencode\view-stats.bat

# What to verify:
# - Claude calls still at 0 (or expected count)
# - No unexpected costs
# - Config still correct
```

### Weekly Review (5 minutes)

1. **Run stats**: `.opencode\view-stats.bat`
2. **Check logs**: Review `%USERPROFILE%\.config\opencode\logs\`
3. **Review usage**: Read `.opencode\claude-usage.txt`
4. **Calculate**:
   - Claude calls used this week: ___
   - Target: <2 per week
   - Status: ✅ On track / ⚠️ Over budget

### Monthly Audit (15 minutes)

1. **Total costs**:
   - Gemini: $0 (always FREE)
   - Claude: ___ calls used (max 10 target)
   - OpenCode: $___ credit used (ideally $0)
   - **Total**: $___

2. **Compare to target**:
   - Target: $0-15
   - Actual: $___
   - Savings: $255 - $___ = $___

3. **ROI**:
   - Old monthly cost: $255
   - New monthly cost: $___
   - Savings: ___% (target: 94%+)

---

## 📉 What Costs What

### FREE (Unlimited Use)

| Task | Agent | Model | Cost |
|------|-------|-------|------|
| Search codebase | explore | Gemini 3 Flash | $0 |
| Find patterns | explore | Gemini 3 Flash | $0 |
| External docs | librarian | GLM-4.7-FREE | $0 |
| Code generation | general | Gemini 3 Flash | $0 |
| Code review | code-reviewer | Gemini 3 Flash | $0 |
| Frontend UI | frontend-ui-ux | Gemini 3 Pro | $0 |
| Write tests | test-writer | Gemini 3 Flash | $0 |
| Documentation | document-writer | Gemini 3 Flash | $0 |
| Refactoring | refactorer | Gemini 3 Flash | $0 |
| Debug (initial) | debugger | Gemini 3 Flash | $0 |

**Daily use**: Unlimited, $0

---

### PAID (Limited Budget)

| Task | Agent | Model | Cost |
|------|-------|-------|------|
| Architecture design | oracle | Claude Sonnet | 1 call |
| Security audit | oracle | Claude Sonnet | 1 call |
| Complex debugging | oracle | Claude Sonnet | 1 call |
| Critical decisions | oracle | Claude Sonnet | 1 call |

**Budget**: 20 calls total  
**Target usage**: <10 calls per month  
**Reserve**: 10 calls for emergencies

---

## 🔍 How to Check Specific Costs

### Question: "How much did my last session cost?"

**Answer**:
1. Open `.opencode\claude-usage.txt`
2. Check if you added any oracle calls
3. **If no**: Cost = $0 (used only Gemini)
4. **If yes**: Cost = 1 call used

### Question: "How many Gemini tasks have I run?"

**Answer**:
1. Check session logs: `%USERPROFILE%\.config\opencode\logs\`
2. Count explore/librarian/etc. invocations
3. **Cost**: Always $0 (Gemini is FREE)

### Question: "Am I on budget?"

**Answer**:
```bash
.opencode\view-stats.bat
```

Check:
- Claude calls used: ___ / 20 (target: <10/month)
- OpenCode credit: $20 - $___ used (target: $20 remaining)
- **Status**: ✅ On budget if <10 calls/month

---

## 📊 Visual Budget Tracking

### Week 1 (Jan 14-20, 2026)

| Day | Gemini Tasks | Claude Calls | Daily Cost | Notes |
|-----|--------------|--------------|------------|-------|
| Mon | 0 | 0 | $0 | Installation day |
| Tue | ___ | ___ | $___ | |
| Wed | ___ | ___ | $___ | |
| Thu | ___ | ___ | $___ | |
| Fri | ___ | ___ | $___ | |
| Sat | ___ | ___ | $___ | |
| Sun | ___ | ___ | $___ | |
| **Total** | ___ | ___ / 20 | **$___** | Target: $0 |

### Month 1 (January 2026)

| Week | Gemini Tasks | Claude Calls | Weekly Cost | Notes |
|------|--------------|--------------|-------------|-------|
| Week 1 | ___ | ___ / 20 | $___ | |
| Week 2 | ___ | ___ / 20 | $___ | |
| Week 3 | ___ | ___ / 20 | $___ | |
| Week 4 | ___ | ___ / 20 | $___ | |
| **Total** | ___ | ___ / 20 | **$___** | Target: <$15 |

**Savings**: $255 - $___ = $___ (target: $240+)

---

## 🚨 Cost Alerts

### ⚠️ Warning Triggers

| Trigger | Action |
|---------|--------|
| **5 Claude calls in 1 week** | Review if necessary, slow down |
| **10 Claude calls in 1 month** | STOP using oracle, switch to Gemini |
| **15 Claude calls in 1 month** | EMERGENCY - you're running out |
| **$10 OpenCode credit used** | Investigate why, should be $0 |

### 🔴 Emergency Actions

If you're running out of Claude calls:

1. **Stop using oracle immediately**
2. **Use Gemini for everything** (try 5+ times before giving up)
3. **Review logs**: Were oracle calls necessary?
4. **Document**: What couldn't Gemini handle?
5. **Consider**: Use $20 OpenCode credit as backup

---

## 📝 Manual Tracking Template

Copy this to a notebook or spreadsheet:

```
Date: ___________
Session: ___ (morning/afternoon/evening)

Tasks completed:
[ ] Searches: ___ (Gemini - $0)
[ ] Code generation: ___ (Gemini - $0)
[ ] Code reviews: ___ (Gemini - $0)
[ ] Oracle calls: ___ (Claude - X calls)

Total Gemini: ___ tasks ($0)
Total Claude: ___ calls (remaining: ___/20)

Daily cost: $___
Running total: $___

Notes:
_______________________________________________
```

---

## 🎯 Success Metrics

### Weekly Goals

- [ ] Claude calls: 0-2 (out of 20)
- [ ] Gemini tasks: 10+ (unlimited)
- [ ] Weekly cost: $0-2
- [ ] Budget tracking: Updated daily

### Monthly Goals

- [ ] Claude calls: <10 (out of 20)
- [ ] Gemini tasks: 50+ (unlimited)
- [ ] Monthly cost: <$15
- [ ] Savings vs old setup: $240+ (94%+)

---

## 🔧 Troubleshooting

### Issue: "I don't see any costs"

**Answer**: 
- **Good news!** That means you're using FREE Gemini
- Only Claude (oracle) costs anything (uses your 20 calls)
- Check `.opencode\claude-usage.txt` to confirm 20/20 remaining

### Issue: "How do I know which agent was used?"

**Answer**:
1. Check OpenCode session logs: `%USERPROFILE%\.config\opencode\logs\`
2. Look for lines like:
   - `[explore]` = FREE Gemini
   - `[oracle]` = PAID Claude (1 call)
   - `[librarian]` = FREE GLM
   - `[frontend-ui-ux]` = FREE Gemini

### Issue: "Stats script shows $0 but I used oracle"

**Answer**:
- Script shows official cost = $0 (calls are prepaid)
- But you consumed 1 of your 20 calls
- **Action**: Update `.opencode\claude-usage.txt` manually
- Track calls remaining: 20 → 19 → 18 ...

---

## 📞 Quick Reference

### Commands

```bash
# View all stats
.opencode\view-stats.bat

# Check budget
type .opencode\claude-usage.txt

# View logs
dir %USERPROFILE%\.config\opencode\logs\

# Check auth
opencode auth status
```

### Files

- **Budget**: `.opencode\claude-usage.txt`
- **Logs**: `%USERPROFILE%\.config\opencode\logs\`
- **Config**: `.opencode\oh-my-opencode.json`
- **Stats**: `.opencode\view-stats.bat`

### Costs

- **Gemini**: Always $0 (FREE)
- **Claude**: 1 call per oracle use (20 total)
- **Target**: <$15/month (vs $255 old cost)

---

**Last Updated**: January 14, 2026  
**Current Cost**: $0.00  
**Budget Status**: ✅ 20/20 Claude calls remaining
