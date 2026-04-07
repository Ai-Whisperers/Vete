---
id: EPIC-044
title: "Data Pipeline & Analytics"
tier: 5
priority: P5
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-044: Data Pipeline & Analytics

## Context
No data warehouse or analytics pipeline. Business intelligence requires ETL, cohort analysis, and revenue forecasting beyond basic reports.

## Acceptance Criteria
- [ ] Data warehouse set up
- [ ] ETL pipeline for analytics
- [ ] BI dashboard
- [ ] Cohort analysis for client retention
- [ ] Revenue forecasting

## Stories

### STORY-044.1: Set up data warehouse (ClickHouse or DuckDB)
- **Status**: todo
- **Effort**: L
- **Description**: Deploy and configure analytics database
- **Files to touch**: docker-compose.yml, src/services/analytics/
- **Tests needed**: Data warehouse running and accessible
- **Done when**: Data warehouse operational

### STORY-044.2: Add ETL pipeline for analytics
- **Status**: todo
- **Effort**: M
- **Description**: Create ETL jobs that sync operational data to warehouse
- **Files to touch**: src/services/analytics/etl.ts, src/app/api/cron/etl/
- **Tests needed**: Data synced to warehouse on schedule
- **Done when**: ETL pipeline running

### STORY-044.3: Add business intelligence dashboard
- **Status**: todo
- **Effort**: M
- **Description**: Create BI dashboard with key business metrics
- **Files to touch**: src/app/(admin)/analytics/, src/components/analytics/
- **Tests needed**: BI dashboard shows business metrics
- **Done when**: BI dashboard functional

### STORY-044.4: Add cohort analysis for client retention
- **Status**: todo
- **Effort**: M
- **Description**: Implement cohort analysis showing client retention over time
- **Files to touch**: src/services/analytics/cohort.ts
- **Tests needed**: Cohort retention chart available
- **Done when**: Cohort analysis working

### STORY-044.5: Add revenue forecasting
- **Status**: todo
- **Effort**: M
- **Description**: Build revenue forecasting using historical data trends
- **Files to touch**: src/services/analytics/forecast.ts
- **Tests needed**: Revenue forecast for next 3/6/12 months
- **Done when**: Revenue forecasting functional

## Technical Notes
DuckDB is simpler and can run in-process for smaller deployments. ClickHouse is better for larger scale. Start with DuckDB and migrate to ClickHouse when needed.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
