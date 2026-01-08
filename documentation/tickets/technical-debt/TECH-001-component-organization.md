# TECH-001: Improve Component Organization

## Priority: P2 - Medium
## Category: Technical Debt
## Status: Not Started
## Epic: [EPIC-06: Code Quality & Refactoring](../epics/EPIC-06-code-quality.md)
## Affected Areas: web/components/

## Description

The `components/` directory has grown to 30+ subdirectories with varying organization patterns. Some directories have index files for re-exports, others don't. Component naming and structure is inconsistent.

## Current State

```
components/
├── about/           # 3 files, no index
├── appointments/    # 4 files, no index
├── auth/            # 1 file
├── booking/         # Nested booking-wizard/
├── calendar/        # 6 files, has index
├── cart/            # 4 files, no index
├── clinical/        # 6 files, no index
├── dashboard/       # 10+ files, has index, nested appointments/
├── forms/           # 1 file (appointment-form)
├── invoices/        # 12 files, has index
├── landing/         # 4 files, has index
├── store/           # Nested filters/, product-detail/
├── ui/              # Base components, has index
├── whatsapp/        # 8 files, has index
└── ... (15+ more)
```

### Issues:
1. Inconsistent index.ts presence
2. Some directories have only 1 file
3. Nested subdirectories add complexity
4. Duplicate components (appointment-form in 2 places)
5. No clear naming conventions
6. Hard to find components

## Proposed Solution

### 1. Standard Directory Structure

```
components/
├── ui/                    # Primitives (button, input, card, modal)
├── layout/                # Layout components (nav, footer, sidebar)
├── features/              # Feature-specific components
│   ├── appointments/      # All appointment-related
│   ├── pets/              # Pet management
│   ├── invoices/          # Invoicing
│   ├── clinical/          # Clinical tools
│   ├── store/             # E-commerce
│   └── hospital/          # Hospitalization
├── forms/                 # Reusable form components
├── charts/                # Data visualization
└── providers/             # Context providers
```

### 2. Naming Conventions

```
[feature]-[variant].tsx

# Examples:
appointment-card.tsx
appointment-list.tsx
appointment-form.tsx
appointment-details.tsx

# NOT:
AppointmentCard.tsx
card.tsx (too generic)
apt-crd.tsx (abbreviated)
```

### 3. Index Files

Every directory with 2+ files gets an index:

```typescript
// features/appointments/index.ts
export { AppointmentCard } from './appointment-card'
export { AppointmentList } from './appointment-list'
export { AppointmentForm } from './appointment-form'
export type { AppointmentCardProps } from './appointment-card'
```

### 4. Component Colocation

Each component can have related files:

```
appointment-card/
├── index.tsx         # Main component
├── appointment-card.types.ts
├── appointment-card.test.tsx
└── appointment-card.stories.tsx (if using Storybook)
```

## Implementation Steps

1. [ ] Audit all component directories
2. [ ] Create migration plan (which components move where)
3. [ ] Add missing index.ts files
4. [ ] Consolidate duplicate components
5. [ ] Rename files to follow convention
6. [ ] Update imports throughout codebase
7. [ ] Remove empty directories
8. [ ] Update component documentation

## Acceptance Criteria

- [ ] Consistent directory structure
- [ ] All directories with 2+ files have index.ts
- [ ] No duplicate components
- [ ] Clear naming convention
- [ ] Easy to find any component

## Estimated Effort

- Planning: 2 hours
- Migration: 8-10 hours
- Import updates: 4 hours
- Testing: 2 hours
- **Total: 16-18 hours**

## Risk

**Medium** - Import path changes could break things. Need careful search/replace and testing.
