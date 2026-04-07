# Work Management System

## Overview
This is a file-based work management system designed for AI agents and human developers. It organizes work into **epics** (large features/initiatives) containing **stories** (individual tasks).

## How It Works

### Directory Structure
```
.work/
├── QUEUE.md              # Priority-ordered list of all work
├── backlog/              # Work not yet started (organized by tier)
│   ├── tier-0-critical/  # Fix before anything else
│   ├── tier-1-high/      # Next 2 weeks
│   ├── tier-2-quality/   # Weeks 3-6
│   ├── tier-3-features/  # Weeks 7-16
│   ├── tier-4-growth/    # Months 3-6
│   ├── tier-5-platform/  # Ongoing infrastructure
│   ├── tier-6-business/  # Months 6-12
│   ├── tier-7-specialty/ # Ongoing specialty
│   ├── tier-8-regional/  # Regional expansion
│   ├── tier-9-advanced/  # Months 9-12
│   ├── tier-10-polish/   # Ongoing polish
│   └── tier-11-differentiation/ # Year 2+
├── in-progress/          # Currently being worked on
├── review/               # Done, awaiting review
├── completed/            # Finished and verified
└── templates/            # Epic and story templates
```

## How to Pick Up Work (Agent Workflow)

### 1. Read the Queue
```bash
cat .work/QUEUE.md
```
Find the highest-priority epic with status `backlog` and no unmet dependencies.

### 2. Claim the Epic
```bash
# Move the epic file to in-progress
mv .work/backlog/tier-X-name/EPIC-XXX-slug.md .work/in-progress/

# Update the frontmatter status
# status: backlog → status: in-progress
# assignee: unassigned → assignee: <your-name>
# updated: <today's date>
```

### 3. Work Through Stories
Work through stories in order (STORY-XXX.1, then XXX.2, etc.):
- Update story status: `todo` → `in-progress` → `done`
- Log each action in the Progress Log table
- Commit code changes with the story ID: `fix(auth): STORY-001.1 debug login 500 error`

### 4. Submit for Review
```bash
# When all stories are done, move to review
mv .work/in-progress/EPIC-XXX-slug.md .work/review/

# Update frontmatter
# status: in-progress → status: review
```

### 5. Complete
```bash
# After review approval, move to completed
mv .work/review/EPIC-XXX-slug.md .work/completed/

# Update frontmatter
# status: review → status: completed
```

### 6. Update the Queue
After any status change, update `QUEUE.md` to reflect the new status.

## Naming Conventions

### Epic Files
- Format: `epic-XXX-slug.md` (lowercase)
- Example: `epic-001-fix-login.md`

### Epic IDs
- Format: `EPIC-XXX` (zero-padded to 3 digits)
- Example: `EPIC-001`, `EPIC-042`, `EPIC-100`

### Story IDs
- Format: `STORY-XXX.N` (epic number + story number)
- Example: `STORY-001.1`, `STORY-042.5`

### Git Commit Messages
- Format: `<type>(<scope>): STORY-XXX.N <description>`
- Example: `fix(auth): STORY-001.1 debug login 500 error`
- Example: `feat(payments): STORY-014.1 integrate Tigo Money`
- Example: `test(services): STORY-006.1 add inventory service tests`

## How to Add New Epics

1. Find the next available epic number (check QUEUE.md)
2. Copy `templates/epic-template.md`
3. Fill in all fields
4. Place in the appropriate `backlog/tier-X-name/` directory
5. Add entry to `QUEUE.md`

## How to Log Progress

Each epic has a Progress Log table at the bottom:

```markdown
## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
| 2026-04-07 | agent-name | Started STORY-001.1 | Found root cause in middleware |
| 2026-04-07 | agent-name | Completed STORY-001.1 | Fixed redirect loop |
```

## Priority Levels

| Priority | Tier | Description | Timeline |
|----------|------|-------------|----------|
| P0 | 0 - Critical | Showstoppers, security issues | Immediate |
| P1 | 1 - High | Core stability & quality | 2 weeks |
| P2 | 2 - Quality | Product quality improvements | Weeks 3-6 |
| P3 | 3 - Features | Feature development | Weeks 7-16 |
| P4 | 4 - Growth | Growth & scaling | Months 3-6 |
| P5 | 5 - Platform | Platform infrastructure | Ongoing |
| P6 | 6 - Business | Business & growth tools | Months 6-12 |
| P7 | 7 - Specialty | Veterinary specialty | Ongoing |
| P8 | 8 - Regional | Regional expansion | Quarter 3 |
| P9 | 9 - Advanced | Advanced technical | Months 9-12 |
| P10 | 10 - Polish | Polish & excellence | Ongoing |
| P11 | 11 - Differentiation | Competitive differentiation | Year 2 |

## Effort Estimates

| Size | Description | Approximate Time |
|------|-------------|-----------------|
| S | Small - straightforward, well-defined | 1-4 hours |
| M | Medium - some complexity, clear approach | 4-16 hours |
| L | Large - significant work, may need research | 2-5 days |
| XL | Extra Large - major initiative, multiple components | 1-2 weeks |

## Dependencies

Some epics depend on others. Check the `dependencies` field in the frontmatter before starting work. All dependencies must be `completed` or `in-progress` before an epic can be started.

## Statistics

- **Total Epics**: 100
- **Total Stories**: 558
- **Tiers**: 12 (0-11)
- **Priority Levels**: P0-P11
