# Ralph Autonomous Agent Commands

Choose your agent. Copy the command. Transform your workflow.

---

## 🛠️ Engineering & Product

### The Builder (Implementation)

_Turns tickets into code._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_PROMPT.md to process tickets from the README" --completion-promise "ALL_TICKETS_DONE" --max-iterations 50
```

### The Scrum Master (Sprint Planning)

_Turns Epics into Sprint Tasks._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_SPRINT_PROMPT.md" --completion-promise "SPRINT_PLANNING_COMPLETE" --max-iterations 20
```

### The Librarian (Documentation)

_Synchronizes docs with reality._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_DOC_UPDATE_PROMPT.md" --completion-promise "DOCS_SYNC_COMPLETE" --max-iterations 30
```

### The Detective (Gap Analysis)

_Finds what you forgot to ticket._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_ANALYSIS_PROMPT.md" --completion-promise "ANALYSIS_COMPLETE" --max-iterations 30
```

### The Broadcaster (Release Manager)

_Writes release notes from git history._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_RELEASE_PROMPT.md" --completion-promise "RELEASE_NOTES_READY" --max-iterations 20
```

---

## 🛡️ Quality & Standards

### The Sheriff (Standards Enforcer)

_Enforces Security (RLS) and Clean Code._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_STANDARDS_PROMPT.md" --completion-promise "STANDARDS_CHECK_COMPLETE" --max-iterations 30
```

### The Exterminator (Bug Hunter)

_Proactively finds potential bugs._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_BUG_HUNT_PROMPT.md" --completion-promise "BUG_HUNT_COMPLETE" --max-iterations 20
```

### The Auditor (Codebase Health)

_Grades feature maturity (Perfect vs Garbage)._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_AUDIT_PROMPT.md" --completion-promise "AUDIT_COMPLETE" --max-iterations 40
```

### The Architect (Refactoring)

_Improves modularity and reduces debt._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_REFACTOR_PROMPT.md" --completion-promise "REFACTOR_ANALYSIS_COMPLETE" --max-iterations 25
```

### The Innovator (Research)

_Modernizes stack and removes reinvented wheels._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_RESEARCH_PROMPT.md" --completion-promise "RESEARCH_ANALYSIS_COMPLETE" --max-iterations 20
```

---

## 📈 Marketing Strategy

### The Scribe (Content Strategist)

_Drafts SEO-aligned blogs and social posts._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_CONTENT_PROMPT.md" --completion-promise "CONTENT_DRAFTING_COMPLETE" --max-iterations 20
```

### The Guardian (Brand Voice)

_Ensures consistency and kills formatting errors._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_BRAND_PROMPT.md" --completion-promise "BRAND_AUDIT_COMPLETE" --max-iterations 20
```

### The Rainmaker (Sales Copy)

_Optimizes scripts for higher conversion._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_SALES_PROMPT.md" --completion-promise "SALES_SCRIPTS_UPDATED" --max-iterations 20
```

### The Alchemist (Growth Hacker)

_Finds viral loops and SEO wins._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_GROWTH_PROMPT.md" --completion-promise "GROWTH_HACK_COMPLETE" --max-iterations 25
```

### The Empath (Persona Researcher)

_Keeps customer personas alive._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_PERSONA_PROMPT.md" --completion-promise "PERSONA_UPDATE_COMPLETE" --max-iterations 15
```

---

## 💼 Business Operations

### The Guide (Onboarding)

_Removes friction for new users._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_ONBOARDING_PROMPT.md" --completion-promise "ONBOARDING_DOCS_UPDATED" --max-iterations 20
```

### The Strategist (Pricing)

_Adjuts tiers based on feature value._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_PRICING_PROMPT.md" --completion-promise "PRICING_REVIEW_COMPLETE" --max-iterations 15
```

### The Treasurer (Finance)

_Updates projections based on reality._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_FINANCE_PROMPT.md" --completion-promise "FINANCE_UPDATE_COMPLETE" --max-iterations 10
```

### The Scout (Competitor Intel)

_Track the competition._

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_COMPETITOR_PROMPT.md" --completion-promise "COMPETITOR_UPDATE_COMPLETE" --max-iterations 15
```
