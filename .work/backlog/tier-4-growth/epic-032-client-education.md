---
id: EPIC-032
title: "Client Education Library"
tier: 4
priority: P4
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-032: Client Education Library

## Context
No educational content exists. Client education improves compliance, reduces unnecessary visits, and builds trust.

## Acceptance Criteria
- [ ] Article/content management system
- [ ] Species/breed-specific care guides
- [ ] Post-procedure care instructions auto-sent
- [ ] Nutrition guides
- [ ] Video content support

## Stories

### STORY-032.1: Create article/content management system
- **Status**: todo
- **Effort**: M
- **Description**: Build CMS for educational articles with categories and search
- **Files to touch**: src/app/(clinic)/education/, src/services/content/
- **Tests needed**: Articles created and published
- **Done when**: CMS functional

### STORY-032.2: Add species/breed-specific care guides
- **Status**: todo
- **Effort**: M
- **Description**: Create care guides for common species and breeds
- **Files to touch**: src/data/care-guides/, src/components/education/
- **Tests needed**: Care guides available per breed
- **Done when**: Care guides available

### STORY-032.3: Add post-procedure care instructions (auto-sent)
- **Status**: todo
- **Effort**: M
- **Description**: Automatically send relevant care instructions after procedures
- **Files to touch**: src/services/content/auto-send.ts
- **Tests needed**: Instructions sent after procedures
- **Done when**: Auto-send after procedures working

### STORY-032.4: Add nutrition guides
- **Status**: todo
- **Effort**: S
- **Description**: Create nutrition guides by species, age, and health condition
- **Files to touch**: src/data/nutrition-guides/
- **Tests needed**: Nutrition guides accessible
- **Done when**: Nutrition guides available

### STORY-032.5: Add video content support
- **Status**: todo
- **Effort**: M
- **Description**: Support video content embedding in educational articles
- **Files to touch**: src/components/education/video-player.tsx
- **Tests needed**: Videos play in articles
- **Done when**: Video content supported

## Technical Notes
Content should be written or reviewed by veterinarians. Use markdown for article content. Consider partnering with veterinary schools for content. Auto-sending uses procedure codes to match relevant articles.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
