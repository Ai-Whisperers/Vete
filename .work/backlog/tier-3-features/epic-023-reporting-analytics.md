---
id: EPIC-023
title: "Reporting & Analytics"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-023: Reporting & Analytics

## Context
Basic analytics exist but there's no custom report builder. Clinic owners need financial, patient, inventory, and staff performance reports to make informed decisions.

## Acceptance Criteria
- [ ] Custom report builder
- [ ] Financial reports
- [ ] Patient reports
- [ ] Inventory reports
- [ ] Staff performance dashboard
- [ ] Export to Excel/CSV
- [ ] Scheduled report delivery

## Stories

### STORY-023.1: Add custom report builder
- **Status**: todo
- **Effort**: L
- **Description**: Create drag-and-drop report builder for custom queries
- **Files to touch**: src/components/reports/builder.tsx, src/services/reports/
- **Tests needed**: Users can build custom reports from available fields
- **Done when**: Custom report builder functional

### STORY-023.2: Add financial reports
- **Status**: todo
- **Effort**: M
- **Description**: Create reports: revenue by service, by vet, by month, P&L summary
- **Files to touch**: src/components/reports/financial.tsx
- **Tests needed**: Financial reports render with accurate data
- **Done when**: Financial reports available

### STORY-023.3: Add patient reports
- **Status**: todo
- **Effort**: M
- **Description**: Create reports: top conditions, species breakdown, vaccination compliance
- **Files to touch**: src/components/reports/patients.tsx
- **Tests needed**: Patient reports render with accurate data
- **Done when**: Patient reports available

### STORY-023.4: Add inventory reports
- **Status**: todo
- **Effort**: M
- **Description**: Create reports: turnover, dead stock, cost analysis, reorder alerts
- **Files to touch**: src/components/reports/inventory.tsx
- **Tests needed**: Inventory reports render with accurate data
- **Done when**: Inventory reports available

### STORY-023.5: Add staff performance dashboard
- **Status**: todo
- **Effort**: M
- **Description**: Create dashboard: appointments/day, revenue/vet, client satisfaction
- **Files to touch**: src/components/reports/staff.tsx
- **Tests needed**: Staff performance visible per vet
- **Done when**: Staff performance dashboard working

### STORY-023.6: Add export to Excel/CSV for all reports
- **Status**: todo
- **Effort**: M
- **Description**: Add export functionality for all report types
- **Files to touch**: src/services/reports/export.ts
- **Tests needed**: Reports downloadable as Excel/CSV
- **Done when**: Export working for all reports

### STORY-023.7: Add scheduled report email delivery
- **Status**: todo
- **Effort**: M
- **Description**: Allow scheduling recurring reports to be emailed
- **Files to touch**: src/services/reports/scheduler.ts, src/app/api/cron/reports/
- **Tests needed**: Reports emailed on schedule
- **Done when**: Scheduled report delivery working

## Technical Notes
Use recharts or chart.js for visualizations. For Excel export, use xlsx/exceljs package. Consider using Supabase views for complex report queries.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
