# API-001: Medical Records API CRUD

## Priority: P1 (High)
## Category: API Gaps
## Status: Not Started

## Description
No dedicated `/api/medical-records/` endpoints exist. Medical records can only be created via server action, with no way to READ, UPDATE, or DELETE via API.

## Current State
- **Creation**: Server action `create-medical-record.ts` only
- **Read**: None - data loaded via server components
- **Update**: None
- **Delete**: None

## Impact
- Staff dashboard can't fetch medical records via API
- Mobile app development blocked (no API to consume)
- No ability to correct medical record errors
- Audit/compliance issues with immutable records

## Proposed Solution

### Create `/api/medical-records/route.ts`
```typescript
// GET - List medical records for a pet
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const petId = searchParams.get('pet_id');
  // Auth check + tenant isolation
  // Return paginated records
}

// POST - Create medical record (parallel to server action)
export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate with Zod schema
  // Create record with audit log
}
```

### Create `/api/medical-records/[id]/route.ts`
```typescript
// GET - Single record detail
export async function GET(request: NextRequest, { params }) {
  // Auth check + ownership validation
  // Return full record with attachments
}

// PATCH - Update record (staff only)
export async function PATCH(request: NextRequest, { params }) {
  // Staff role required
  // Create audit trail for changes
  // Update record fields
}

// DELETE - Soft delete (admin only)
export async function DELETE(request: NextRequest, { params }) {
  // Admin role required
  // Soft delete with reason
  // Maintain audit trail
}
```

## Implementation Steps
1. Create base route at `/api/medical-records/route.ts`
2. Implement GET with filtering by pet_id, date range, type
3. Implement POST with Zod validation
4. Create `/api/medical-records/[id]/route.ts`
5. Implement single record GET
6. Implement PATCH with audit logging
7. Implement soft DELETE (admin only)
8. Add rate limiting
9. Write integration tests

## Acceptance Criteria
- [ ] GET /api/medical-records returns paginated list
- [ ] GET /api/medical-records?pet_id=xxx filters by pet
- [ ] POST /api/medical-records creates new record
- [ ] GET /api/medical-records/[id] returns single record
- [ ] PATCH /api/medical-records/[id] updates record (staff only)
- [ ] DELETE /api/medical-records/[id] soft deletes (admin only)
- [ ] All endpoints enforce tenant isolation
- [ ] Audit log captures all changes
- [ ] Integration tests pass

## Related Files
- `web/app/api/medical-records/route.ts` (new)
- `web/app/api/medical-records/[id]/route.ts` (new)
- `web/app/actions/create-medical-record.ts` (existing)

## Estimated Effort
- Implementation: 6 hours
- Testing: 2 hours
- **Total: 8 hours**

---
*Ticket created: January 2026*
*Based on API completeness audit*
