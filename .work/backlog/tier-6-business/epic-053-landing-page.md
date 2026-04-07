---
id: EPIC-053
title: "Landing Page Optimization"
tier: 6
priority: P6
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-053: Landing Page Optimization

## Context
The landing page at paragu-ai.com needs optimization for conversion: A/B testing, SEO, content marketing, and pricing page.

## Acceptance Criteria
- [ ] A/B testing for landing page
- [ ] SEO optimization complete
- [ ] Blog/content marketing section
- [ ] Pricing page with feature comparison
- [ ] Live chat on landing page

## Stories

### STORY-053.1: Add A/B testing for landing page
- **Status**: todo
- **Effort**: M
- **Description**: Implement A/B testing for headline, CTA, and layout variations
- **Files to touch**: src/app/(public)/page.tsx, src/lib/ab-test.ts
- **Tests needed**: A/B variants served and measured
- **Done when**: A/B testing on landing page working

### STORY-053.2: Add SEO optimization (meta, schema markup)
- **Status**: todo
- **Effort**: M
- **Description**: Add meta tags, Open Graph, structured data, and sitemap
- **Files to touch**: src/app/(public)/layout.tsx, public/sitemap.xml, src/app/(public)/robots.ts
- **Tests needed**: SEO audit score above 90
- **Done when**: SEO optimization complete

### STORY-053.3: Add blog/content marketing section
- **Status**: todo
- **Effort**: M
- **Description**: Create blog with markdown posts for content marketing
- **Files to touch**: src/app/(public)/blog/, src/content/blog/
- **Tests needed**: Blog posts published and indexed
- **Done when**: Blog section functional

### STORY-053.4: Add pricing page with feature comparison
- **Status**: todo
- **Effort**: M
- **Description**: Create pricing page showing plans with feature matrix
- **Files to touch**: src/app/(public)/pricing/
- **Tests needed**: Pricing tiers displayed with comparison
- **Done when**: Pricing page live

### STORY-053.5: Add live chat on landing page
- **Status**: todo
- **Effort**: S
- **Description**: Add Crisp or similar chat widget on public pages
- **Files to touch**: src/components/chat/crisp-widget.tsx
- **Tests needed**: Chat widget visible on landing page
- **Done when**: Live chat working on landing

## Technical Notes
Use Next.js metadata API for SEO. Schema markup should use VeterinaryCare type from schema.org. For blog, consider MDX with contentlayer. Pricing should show PYG and USD.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
