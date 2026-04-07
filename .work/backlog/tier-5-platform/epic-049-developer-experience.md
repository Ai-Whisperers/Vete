---
id: EPIC-049
title: "Developer Experience"
tier: 5
priority: P5
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-049: Developer Experience

## Context
Improving developer experience reduces onboarding time and increases contribution velocity. Currently no one-command setup or API playground.

## Acceptance Criteria
- [ ] One-command local dev setup
- [ ] Docker Compose for local dev
- [ ] Seed data generator
- [ ] API playground (Swagger UI)
- [ ] Component playground (Storybook)
- [ ] Contribution guidelines

## Stories

### STORY-049.1: Add local development setup script (one command)
- **Status**: todo
- **Effort**: M
- **Description**: Create script that sets up entire dev environment with one command
- **Files to touch**: scripts/setup-dev.sh
- **Tests needed**: New dev runs one command and has working env
- **Done when**: One-command setup working

### STORY-049.2: Add Docker Compose for local dev with Supabase
- **Status**: todo
- **Effort**: M
- **Description**: Create Docker Compose that runs app + local Supabase
- **Files to touch**: docker-compose.dev.yml
- **Tests needed**: docker-compose up starts full dev env
- **Done when**: Local dev Docker Compose working

### STORY-049.3: Add seed data generator for testing
- **Status**: todo
- **Effort**: M
- **Description**: Create realistic seed data for development and testing
- **Files to touch**: scripts/seed.ts, src/data/seeds/
- **Tests needed**: Seed data populates all major tables
- **Done when**: Seed data generator working

### STORY-049.4: Add API playground (like Swagger UI)
- **Status**: todo
- **Effort**: M
- **Description**: Set up Swagger UI for interactive API exploration
- **Files to touch**: src/app/api/docs/, next-swagger-doc config
- **Tests needed**: API playground accessible at /api/docs
- **Done when**: API playground functional

### STORY-049.5: Add component playground (Storybook)
- **Status**: todo
- **Effort**: M
- **Description**: Set up Storybook for component development and testing
- **Files to touch**: .storybook/, src/**/*.stories.tsx
- **Tests needed**: Storybook accessible with all components
- **Done when**: Storybook running with components

### STORY-049.6: Write contribution guidelines
- **Status**: todo
- **Effort**: S
- **Description**: Document how to contribute: code style, PR process, testing requirements
- **Files to touch**: CONTRIBUTING.md
- **Tests needed**: Guidelines cover all contribution aspects
- **Done when**: Contribution guidelines complete

## Technical Notes
Use `supabase start` for local Supabase. The setup script should: install deps, start Supabase, apply migrations, seed data, and start dev server. Test on fresh Ubuntu and macOS.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
