# OhMyOpenCode Commands - Vete Project

> **Migrated from**: `.claude/commands/`  
> **Total Commands**: 20  
> **Updated for**: FREE Gemini-first strategy

---

## Command Categories

### Feature Development (5 commands)
| Command | Purpose | Model | Cost |
|---------|---------|-------|------|
| `/add-feature` | Add new feature with patterns | Gemini | FREE |
| `/add-api` | Create API route with auth | Gemini | FREE |
| `/add-component` | Create themed React component | Gemini | FREE |
| `/add-migration` | Create SQL migration with RLS | Gemini | FREE |
| `/add-clinic` | Onboard new clinic tenant | Gemini | FREE |

### Code Quality (3 commands)
| Command | Purpose | Model | Cost |
|---------|---------|-------|------|
| `/review-code` | Project-specific code review | Gemini | FREE |
| `/debug` | Structured debugging approach | Gemini → Claude | FREE (escalates) |
| `/run-tests` | Execute test suite | Gemini | FREE |

### QA & Testing (9 commands)
| Command | Purpose | Model | Cost |
|---------|---------|-------|------|
| `/qa` | Complete quality audit | Gemini (parallel) | FREE |
| `/qa-auth-audit` | Authentication security check | Gemini | FREE |
| `/qa-cicd` | CI/CD pipeline validation | Gemini | FREE |
| `/qa-coverage` | Test coverage analysis | Gemini | FREE |
| `/qa-db-mocks` | Database mocking patterns | Gemini | FREE |
| `/qa-docs` | Documentation completeness | Gemini | FREE |
| `/qa-e2e-gaps` | E2E test gap analysis | Gemini | FREE |
| `/qa-errors` | Error handling review | Gemini | FREE |
| `/qa-fixtures` | Test fixture quality | Gemini | FREE |
| `/qa-migrate-tests` | Test migration readiness | Gemini | FREE |
| `/qa-performance` | Performance optimization | Gemini | FREE |

### Workflow (1 command)
| Command | Purpose | Model | Cost |
|---------|---------|-------|------|
| `/git-workflow` | Git branching and PR guidelines | Documentation | N/A |

---

## Usage with OhMyOpenCode

### Invoke Commands

```bash
# In OpenCode session
> /add-feature "appointment email reminders"

# Or direct invocation
> add-feature "appointment email reminders"
```

### Cost-Optimized Patterns

All commands now use **FREE Gemini** by default:

```
/review-code file.ts
  → Uses: explore (Gemini) to find issues
  → Uses: code-reviewer (Gemini) to review
  → Cost: $0

/qa
  → Fires 9 parallel Gemini agents
  → Cost: $0
  → Time: 60 seconds
```

---

## Command Updates for OMO

### What Changed

1. **Model routing**: All commands use Gemini (FREE) instead of Claude
2. **Parallel execution**: QA commands fire multiple agents simultaneously
3. **Escalation protocol**: Only escalate to Claude after 3 Gemini failures
4. **Budget protection**: Commands track and warn about Claude usage

### Backward Compatibility

- ✅ All `.claude/commands/` syntax still works
- ✅ Commands auto-route to cheapest model
- ✅ Can still force Claude with `--agent oracle`

---

## Quick Reference

### Feature Development
```bash
/add-feature "new feature name"
/add-api "GET /api/resource"
/add-component "ComponentName"
/add-migration "feature_name"
/add-clinic "clinic-slug"
```

### Code Quality
```bash
/review-code path/to/file.ts
/debug "issue description"
/run-tests
```

### Quality Audit
```bash
/qa                      # Run all checks
/qa-auth-audit          # Security only
/qa-coverage            # Test coverage
/qa-performance         # Performance
```

### Git Workflow
```bash
/git-workflow           # View guidelines
```

---

## Parallel Execution Example

### QA Command (9 agents in parallel)

```bash
> /qa

# Behind the scenes:
background_task(agent="explore", prompt="Find missing auth")
background_task(agent="explore", prompt="Find missing tenant filters")
background_task(agent="explore", prompt="Find any types")
background_task(agent="explore", prompt="Find inline styles")
background_task(agent="explore", prompt="Find hardcoded colors")
background_task(agent="explore", prompt="Find missing RLS")
background_task(agent="explore", prompt="Find SQL injection risks")
background_task(agent="explore", prompt="Find XSS vulnerabilities")
background_task(agent="librarian", prompt="Find security best practices")

# All run in parallel with FREE Gemini
# Cost: $0
# Time: 60 seconds
```

---

## Migration Notes

### From `.claude/commands/`

- ✅ All 20 commands migrated
- ✅ Updated for Gemini-first strategy
- ✅ Added parallel execution patterns
- ✅ Added cost tracking
- ✅ Maintained backward compatibility

### Configuration

Commands are automatically discovered by OhMyOpenCode from:
- `.opencode/commands/` (this directory)
- `.claude/commands/` (if `claude_code.commands: true` in config)

**Current config**: Both directories enabled (transition period)

---

## Command Development

### Template for New Commands

```markdown
# Command Name

## Purpose
Brief description

## Usage
\`\`\`
/command-name [arguments]
\`\`\`

## Agent Strategy
- First: Try Gemini (FREE)
- Escalate: Only if Gemini fails 3+ times
- Model: Gemini 3 Flash (FREE)

## Cost
- Typical: $0 (Gemini)
- Maximum: 1 Claude call (if escalated)

## Examples
\`\`\`
/command-name example-arg
\`\`\`

## Related
- Other relevant commands
```

---

## See Also

- **Exemplars**: `.opencode/exemplars/` - Code pattern examples
- **Workflows**: `.opencode/workflows/` - Multi-step automations
- **Rules**: `.opencode/rules/` - Coding standards
- **Budget**: `.opencode/agents/BUDGET-STRATEGY.md` - Cost optimization

---

**Last Updated**: January 14, 2026  
**Total Commands**: 20  
**Cost**: All FREE (Gemini) except optional Claude escalation
