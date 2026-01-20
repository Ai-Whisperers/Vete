# Migration Plan: .claude/.cursor/.antigravity → .opencode

> **Status**: Phase 1 Complete (Core Setup)  
> **Next**: Migrate all commands and workflows

---

## Completed ✅

### Phase 1: Core Infrastructure (DONE)
- [x] Create `.opencode/` directory structure
- [x] Configure `oh-my-opencode.json` with budget constraints
- [x] Set up cost tier system (Gemini-first strategy)
- [x] Create budget tracking (20 Claude calls)
- [x] Document quick start guide
- [x] Consolidate project standards from all sources

### Files Created:
```
.opencode/
├── README.md                      ✅ Overview and migration status
├── QUICK-START.md                 ✅ Getting started guide
├── MIGRATION-PLAN.md              ✅ This file
├── oh-my-opencode.json            ✅ Main config (Gemini-first)
├── claude-usage.txt               ✅ Budget tracking
├── agents/
│   ├── cost-tiers.md             ✅ Model selection guide
│   └── BUDGET-STRATEGY.md        ✅ Detailed budget guide
├── rules/
│   └── vete-project-standards.md ✅ Consolidated coding standards
└── workflows/
    └── parallel-analysis.md       ✅ Parallel execution patterns
```

---

## Phase 2: Command Migration (IN PROGRESS)

### Commands to Migrate from `.claude/commands/`

| Source | Status | Target | Notes |
|--------|--------|--------|-------|
| `add-feature.md` | 🔄 Pending | `.opencode/commands/add-feature.md` | Update with Gemini-first approach |
| `add-api.md` | 🔄 Pending | `.opencode/commands/add-api.md` | |
| `add-clinic.md` | 🔄 Pending | `.opencode/commands/add-clinic.md` | |
| `add-component.md` | 🔄 Pending | `.opencode/commands/add-component.md` | |
| `add-migration.md` | 🔄 Pending | `.opencode/commands/add-migration.md` | |
| `debug.md` | 🔄 Pending | `.opencode/commands/debug.md` | Add escalation pattern |
| `git-workflow.md` | 🔄 Pending | `.opencode/commands/git-workflow.md` | |
| `review-code.md` | 🔄 Pending | `.opencode/commands/review-code.md` | Add parallel grep pattern |
| `run-tests.md` | 🔄 Pending | `.opencode/commands/run-tests.md` | |
| `qa-*.md` (9 files) | 🔄 Pending | `.opencode/commands/qa/` | Batch migrate QA commands |

**Priority**: High  
**Effort**: 2-4 hours  
**Impact**: Enables all existing workflows with OMO

---

## Phase 3: Rules Consolidation (IN PROGRESS)

### Rules to Migrate from `.cursor/rules/`

| Source | Status | Target | Notes |
|--------|--------|--------|-------|
| `code-writing-standards.mdc` | ✅ Merged | `rules/vete-project-standards.md` | |
| `comment-usage.mdc` | ✅ Merged | `rules/vete-project-standards.md` | |
| `dry-principle.mdc` | ✅ Merged | `rules/vete-project-standards.md` | |
| `naming-conventions.mdc` | ✅ Merged | `rules/vete-project-standards.md` | |
| `project-context.mdc` | ✅ Merged | `rules/vete-project-standards.md` | |
| Other .mdc files | 🔄 Pending | Review for relevance | |

**Priority**: Medium  
**Effort**: 1-2 hours  
**Impact**: Single source of truth for standards

---

## Phase 4: Exemplar Migration (PENDING)

### Exemplars from `.claude/exemplars/`

| Source | Status | Target |
|--------|--------|--------|
| `nextjs-page-exemplar.md` | 🔄 Pending | `.opencode/exemplars/nextjs-page.md` |
| `supabase-api-exemplar.md` | 🔄 Pending | `.opencode/exemplars/supabase-api.md` |
| `react-component-exemplar.md` | 🔄 Pending | `.opencode/exemplars/react-component.md` |
| `database-migration-exemplar.md` | 🔄 Pending | `.opencode/exemplars/database-migration.md` |
| `vitest-testing-exemplar.md` | 🔄 Pending | `.opencode/exemplars/vitest-testing.md` |
| `server-action-exemplar.md` | 🔄 Pending | `.opencode/exemplars/server-action.md` |
| `rate-limiting-exemplar.md` | 🔄 Pending | `.opencode/exemplars/rate-limiting.md` |

**Priority**: Medium  
**Effort**: 2 hours  
**Impact**: Code pattern reference for Gemini

---

## Phase 5: Advanced Workflows (PENDING)

### New Workflows to Create

| Workflow | Status | Purpose |
|----------|--------|---------|
| `cost-optimized-review.md` | 🔄 Pending | Grep→Review pattern |
| `feature-development-full.md` | 🔄 Pending | Multi-stage feature dev |
| `security-audit-cheap.md` | 🔄 Pending | Parallel security checks |
| `test-analysis.md` | 🔄 Pending | Analyze test failures cheaply |
| `pre-commit-check.md` | 🔄 Pending | Automated quality gate |
| `weekly-quality-audit.md` | 🔄 Pending | Scheduled cron job |

**Priority**: High  
**Effort**: 4-6 hours  
**Impact**: Max savings with parallel FREE Gemini

---

## Phase 6: Skills Creation (PENDING)

### Custom Skills for Vete

| Skill | Status | Purpose |
|-------|--------|---------|
| `add-feature-full.md` | 🔄 Pending | Multi-agent feature workflow |
| `security-audit-comprehensive.md` | 🔄 Pending | Multi-stage security review |
| `database-migration-with-rls.md` | 🔄 Pending | Vete-specific migration pattern |
| `multi-tenant-api.md` | 🔄 Pending | API with auth + tenant filter |
| `clinic-onboarding.md` | 🔄 Pending | Add new clinic workflow |

**Priority**: Low  
**Effort**: 6-8 hours  
**Impact**: Complex workflows automated

---

## Phase 7: Cleanup (PENDING)

### Archive Old Configurations

```bash
# Move old configs to archive
mkdir -p .archived-configs
mv .claude .archived-configs/
mv .cursor .archived-configs/
mv .antigravity .archived-configs/

# Keep as reference, but .opencode is now primary
```

**Priority**: Low (after Phase 6 complete)  
**Effort**: 15 minutes  
**Impact**: Clean project structure

---

## Migration Commands

### Phase 2: Migrate Commands
```bash
# Create commands directory
mkdir -p .opencode/commands

# Copy and adapt each command
cp .claude/commands/add-feature.md .opencode/commands/
# Then edit to add Gemini-first approach

# Repeat for all 21 commands
```

### Phase 4: Migrate Exemplars
```bash
# Create exemplars directory
mkdir -p .opencode/exemplars

# Copy all exemplars
cp .claude/exemplars/*.md .opencode/exemplars/
```

---

## Success Metrics

### Phase 1 (Complete) ✅
- [x] OMO installed and configured
- [x] Budget tracking in place
- [x] Core documentation complete
- [x] Gemini-first strategy documented

### Phase 2 (Target: Next 2 days)
- [ ] All 21 commands migrated
- [ ] Commands tested with OMO
- [ ] Parallel patterns added to commands

### Phase 3 (Target: Next week)
- [ ] All exemplars migrated
- [ ] 6 advanced workflows created
- [ ] Pre-commit automation working

### Phase 4 (Target: Next 2 weeks)
- [ ] 5 custom skills created
- [ ] Weekly quality audit scheduled
- [ ] Old configs archived

---

## Cost Savings Projection

| Metric | Old Setup | New Setup | Savings |
|--------|-----------|-----------|---------|
| **Daily cost** | $8.50 | $0 | 100% |
| **Weekly cost** | $60 | $0 (0-1 Claude calls) | 98%+ |
| **Monthly cost** | $255 | $0-15 | 94-100% |
| **Claude calls/month** | ~85 | <10 | 88% |

**ROI**: Migration effort (16 hours) pays for itself in **2 weeks**.

---

## Next Actions

### Immediate (Today)
1. ✅ Complete Phase 1 (DONE)
2. 🔄 Test OMO with a simple command
3. 🔄 Migrate first 3 commands (`add-feature`, `review-code`, `debug`)

### This Week
4. Migrate remaining 18 commands
5. Create 3 advanced workflows
6. Test parallel analysis workflow

### Next Week
7. Migrate all exemplars
8. Create 2 custom skills
9. Set up pre-commit automation
10. Archive old configs

---

## Rollback Plan

If OMO doesn't work as expected:

1. **Keep `.claude` directory** (don't delete yet)
2. **Test OMO alongside Claude Code** (both can coexist)
3. **Compare results** after 1 week
4. **If OMO fails**: Revert to `.claude`, keep budget lessons learned

**Safety**: All original configs preserved in `.archived-configs/`

---

## Questions / Blockers

### Resolved ✅
- ✅ How to install OMO? → `bunx oh-my-opencode install`
- ✅ Which model for main agent? → Gemini 2.0 Flash (FREE)
- ✅ How to track Claude usage? → Manual log in `claude-usage.txt`

### Open 🔄
- 🔄 Can OMO load `.claude/commands` directly? → Test with `claude_code.commands: true`
- 🔄 Do we need to rewrite commands for OMO? → Test compatibility first
- 🔄 Best way to automate weekly audits? → GitHub Actions or local cron

---

## Related Files

- `.opencode/README.md` - Migration overview
- `.opencode/QUICK-START.md` - Getting started
- `.opencode/agents/BUDGET-STRATEGY.md` - Budget details
- `.opencode/oh-my-opencode.json` - Main config
- `CLAUDE.md` - Original project context (keep as reference)
