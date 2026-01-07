# API-002: Vaccines API CRUD Enhancement

## Priority: P1 (High)
## Category: API Gaps
## Status: Not Started

## Description
Vaccines have limited API support. Only read-only endpoints exist for alerts and recommendations. Vaccine creation is only via server action, and UPDATE/DELETE are missing entirely.

## Current State
### Existing Endpoints
- `GET /api/vaccines/mandatory-alerts` - Alert checks
- `GET /api/vaccines/recommendations` - Vaccine recommendations
- `POST /api/vaccines/send-reminder` - Send vaccine reminders

### Missing Endpoints
- `GET /api/vaccines` - List vaccines
- `POST /api/vaccines` - Create vaccine (only server action exists)
- `GET /api/vaccines/[id]` - Single vaccine detail
- `PATCH /api/vaccines/[id]` - Update vaccine date/info
- `DELETE /api/vaccines/[id]` - Remove erroneous entry

## Impact
- Cannot correct vaccination dates entered incorrectly
- Cannot remove duplicate vaccine entries
- No batch vaccine operations
- Mobile app development blocked

## Proposed Solution

### Create `/api/vaccines/route.ts`
```typescript
// GET - List vaccines for a pet
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const petId = searchParams.get('pet_id');
  const status = searchParams.get('status'); // upcoming, overdue, all
  // Return filtered, sorted vaccines
}

// POST - Create vaccine record
export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate vaccine data
  // Check for duplicates
  // Calculate next_due_date
  // Create record
}
```

### Create `/api/vaccines/[id]/route.ts`
```typescript
// GET - Single vaccine detail
export async function GET(request: NextRequest, { params }) {
  // Return vaccine with reaction history
}

// PATCH - Update vaccine
export async function PATCH(request: NextRequest, { params }) {
  // Staff role required
  // Allow update of: administered_date, next_due_date, notes, batch_number
  // Audit trail for changes
}

// DELETE - Remove vaccine record
export async function DELETE(request: NextRequest, { params }) {
  // Staff role required
  // Soft delete with reason
  // Maintain history
}
```

## Implementation Steps
1. Create `/api/vaccines/route.ts` with GET/POST
2. Create `/api/vaccines/[id]/route.ts` with GET/PATCH/DELETE
3. Add batch number and expiry tracking
4. Implement duplicate detection
5. Add vaccination history view
6. Write integration tests
7. Update server action to call API (unify logic)

## Acceptance Criteria
- [ ] GET /api/vaccines returns paginated list
- [ ] GET /api/vaccines?pet_id=xxx&status=overdue filters correctly
- [ ] POST /api/vaccines creates new vaccine record
- [ ] GET /api/vaccines/[id] returns vaccine detail
- [ ] PATCH /api/vaccines/[id] updates vaccine (staff only)
- [ ] DELETE /api/vaccines/[id] soft deletes (staff only)
- [ ] Duplicate detection prevents same vaccine on same date
- [ ] Next due date auto-calculated based on vaccine protocol
- [ ] Integration tests pass

## Related Files
- `web/app/api/vaccines/route.ts` (new)
- `web/app/api/vaccines/[id]/route.ts` (new)
- `web/app/api/vaccines/mandatory-alerts/route.ts` (existing)
- `web/app/actions/create-vaccine.ts` (existing)

## Estimated Effort
- Implementation: 5 hours
- Testing: 2 hours
- **Total: 7 hours**

---
*Ticket created: January 2026*
*Based on API completeness audit*
