# WIP-002: Pet Weight History Tracking

## Priority: P2 (Medium)
## Category: Work In Progress
## Status: In Development (Uncommitted)

## Description
Weight history tracking feature for pets is being developed to enable veterinarians and owners to track pet weight over time and visualize growth trends.

## Current State
Modified files:
- `components/clinical/growth-chart.tsx` - Growth chart component updates (+112 lines)
- `components/pets/pet-detail-content.tsx` - Pet detail page integration
- `components/pets/tabs/pet-summary-tab.tsx` - Summary tab with weight display (+140 lines)
- `app/[clinic]/dashboard/patients/[id]/page.tsx` - Staff patient view updates
- `app/[clinic]/portal/pets/[id]/page.tsx` - Owner portal pet view updates

## Untracked New Files
- `app/api/pets/[id]/weight/` - New API routes for weight CRUD
- `components/pets/weight-recording-modal.tsx` - Modal for recording weight
- `db/migrations/038_pet_weight_history.sql` - Database migration
- `supabase/migrations/20260106220000_pet_weight_history.sql` - Supabase migration

## What's Missing
1. [ ] Complete weight recording API endpoints
2. [ ] Unit tests for weight API
3. [ ] Integration with growth chart component
4. [ ] Historical weight data display
5. [ ] Weight trend analysis/alerts

## Implementation Steps
1. Apply database migration for weight history table
2. Complete API endpoints in `app/api/pets/[id]/weight/`
3. Finalize weight recording modal component
4. Integrate with growth chart visualization
5. Add weight trend indicators to pet summary
6. Write unit and integration tests
7. Commit and create PR

## Acceptance Criteria
- [ ] Staff can record pet weight from patient detail page
- [ ] Owners can view weight history in portal
- [ ] Growth chart displays weight over time
- [ ] Weight trend indicator (gaining/losing/stable)
- [ ] API supports CRUD for weight records
- [ ] RLS policies protect weight data by tenant

## Related Files
- `web/app/api/pets/[id]/weight/route.ts`
- `web/components/pets/weight-recording-modal.tsx`
- `web/components/clinical/growth-chart.tsx`
- `web/db/migrations/038_pet_weight_history.sql`

## Estimated Effort
- Completion: 3-4 hours
- Testing: 1-2 hours

---
*Ticket created: January 2026*
*Based on git status analysis*
