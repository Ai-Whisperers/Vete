# TEST-003: Server Action Test Coverage

## Priority: P1 (High)
## Category: Testing
## Status: Not Started

## Description
Only 6 of 28 server action files have tests (~21% coverage). Critical mutations for pets, appointments, and store operations lack testing.

## Current State
### Tested Server Actions (6)
1. `appointments.ts`
2. `create-medical-record.ts`
3. `create-vaccine.ts`
4. `invoices.ts`
5. `pets.ts`
6. `system-configs.ts`

### Untested Server Actions (22)
1. `assign-tag.ts` - QR tag assignment
2. `contact-form.ts` - Public contact form
3. `create-appointment.ts` - Appointment creation
4. `create-pet.ts` - Pet registration (modified in WIP)
5. `create-product.ts` - Product creation
6. `delete-product.ts` - Product deletion
7. `invite-client.ts` - Client invitations
8. `invite-staff.ts` - Staff invitations
9. `medical-records.ts` - Medical record ops
10. `messages.ts` - Messaging
11. `network-actions.ts` - Network debugging
12. `pet-documents.ts` - Document management
13. `safety.ts` - Lost pet reporting
14. `schedules.ts` - Staff scheduling
15. `send-email.ts` - Email sending
16. `store.ts` - Cart/order operations
17. `time-off.ts` - Time-off requests
18. `update-appointment.ts` - Appointment updates
19. `update-appointment-status.ts` - Status changes
20. `update-product.ts` - Product updates
21. `update-profile.ts` - Profile updates
22. `whatsapp.ts` - WhatsApp messaging

## Priority Actions to Test

### Critical (P0)
1. **create-appointment.ts** - Core business function
2. **store.ts** - Revenue-critical operations
3. **invite-staff.ts** - Team management
4. **update-appointment-status.ts** - Workflow critical

### High (P1)
5. **create-pet.ts** - User onboarding
6. **safety.ts** - Lost pet functionality
7. **messages.ts** - Communication
8. **update-profile.ts** - User data

## Test Template
```typescript
// tests/unit/actions/create-appointment.test.ts
describe('createAppointment', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('creates appointment with valid data', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockAppointment })
        })
      })
    });

    const result = await createAppointment(validFormData);
    expect(result.success).toBe(true);
    expect(result.appointment.id).toBeDefined();
  });

  test('validates required fields', async () => {
    const result = await createAppointment(invalidFormData);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('pet_id is required');
  });

  test('prevents double booking', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: true }); // Slot taken
    const result = await createAppointment(validFormData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('horario no disponible');
  });
});
```

## Implementation Steps

### Phase 1: Critical Actions (6 hours)
1. `create-appointment.ts` tests
2. `store.ts` tests (cart, checkout, orders)
3. `invite-staff.ts` tests
4. `update-appointment-status.ts` tests

### Phase 2: User Management (4 hours)
5. `create-pet.ts` tests
6. `update-profile.ts` tests
7. `invite-client.ts` tests

### Phase 3: Communication (3 hours)
8. `messages.ts` tests
9. `send-email.ts` tests
10. `whatsapp.ts` tests

### Phase 4: Remaining Actions (4 hours)
11-22. All remaining action tests

## Acceptance Criteria
- [ ] All 28 server actions have at least basic tests
- [ ] Validation logic tested for all actions
- [ ] Error handling tested
- [ ] Auth/permission checks tested
- [ ] Database operations mocked properly
- [ ] Edge cases covered

## Related Files
- `web/app/actions/*.ts` (28 files)
- `web/tests/unit/actions/*.test.ts` (6 existing)

## Estimated Effort
- Total: 17 hours
- Phase 1: 6 hours
- Phase 2: 4 hours
- Phase 3: 3 hours
- Phase 4: 4 hours

---
*Ticket created: January 2026*
*Based on test coverage analysis*
