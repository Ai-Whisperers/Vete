---
id: EPIC-063
title: "Nutrition & Diet Management"
tier: 7
priority: P7
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-063: Nutrition & Diet Management

## Context
Nutrition management is critical for pet health. Body condition scoring, diet plans, and calorie calculators help vets provide better nutritional guidance.

## Acceptance Criteria
- [ ] Body condition score tracking
- [ ] Diet plan creation tool
- [ ] Calorie calculator
- [ ] Food allergy tracking
- [ ] Supplement recommendations

## Stories

### STORY-063.1: Add body condition score tracking
- **Status**: todo
- **Effort**: M
- **Description**: Implement BCS 1-9 scale tracking with visual guides
- **Files to touch**: src/components/nutrition/bcs.tsx, src/services/nutrition/
- **Tests needed**: BCS tracked over time with chart
- **Done when**: BCS tracking functional

### STORY-063.2: Add diet plan creation tool
- **Status**: todo
- **Effort**: M
- **Description**: Create diet plan builder with food types, portions, and schedules
- **Files to touch**: src/components/nutrition/diet-plan.tsx
- **Tests needed**: Diet plans created and saved per pet
- **Done when**: Diet plan tool working

### STORY-063.3: Add calorie calculator by species/weight/activity
- **Status**: todo
- **Effort**: S
- **Description**: Calculate daily caloric needs based on species, weight, and activity level
- **Files to touch**: src/services/nutrition/calories.ts, src/components/nutrition/
- **Tests needed**: Calories calculated based on parameters
- **Done when**: Calorie calculator working

### STORY-063.4: Add food allergy tracking
- **Status**: todo
- **Effort**: S
- **Description**: Track known food allergies and sensitivities per pet
- **Files to touch**: src/services/nutrition/allergies.ts
- **Tests needed**: Allergies tracked and alerted when relevant
- **Done when**: Food allergy tracking working

### STORY-063.5: Add nutrition supplement recommendations
- **Status**: todo
- **Effort**: M
- **Description**: Suggest supplements based on species, age, and health conditions
- **Files to touch**: src/services/nutrition/supplements.ts
- **Tests needed**: Supplements recommended based on profile
- **Done when**: Supplement recommendations working

## Technical Notes
Body Condition Score uses a 1-9 scale (1=emaciated, 5=ideal, 9=obese). Calorie calculations: RER = 70 × (body weight in kg)^0.75, then multiply by activity factor.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
