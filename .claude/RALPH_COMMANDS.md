# Ralph Autonomous Agent Commands

Use these commands to unleash Ralph on your codebase.

## 1. Implementation Loop

Process tickets from the backlog (`documentation/tickets/README.md`).

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_PROMPT.md to process tickets from the README" --completion-promise "ALL_TICKETS_DONE" --max-iterations 50
```

## 2. Analysis Loop

Analyze documentation to find missing tickets and gaps.

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_ANALYSIS_PROMPT.md" --completion-promise "ANALYSIS_COMPLETE" --max-iterations 30
```

## 3. Bug Hunt Loop

Proactively find bugs and security issues.

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_BUG_HUNT_PROMPT.md" --completion-promise "BUG_HUNT_COMPLETE" --max-iterations 20
```

## 4. Documentation Update Loop

Synchronize documentation with the actual code.

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_DOC_UPDATE_PROMPT.md" --completion-promise "DOCS_SYNC_COMPLETE" --max-iterations 30
```

## 5. Refactoring Loop

Identify code structure improvements and modularization opportunities.

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_REFACTOR_PROMPT.md" --completion-promise "REFACTOR_ANALYSIS_COMPLETE" --max-iterations 25
```

## 6. Research Loop

Identify modernization opportunities and best practices.

```bash
/ralph-loop:ralph-loop "Follow instructions in .claude/prompts/RALPH_RESEARCH_PROMPT.md" --completion-promise "RESEARCH_ANALYSIS_COMPLETE" --max-iterations 20
```
