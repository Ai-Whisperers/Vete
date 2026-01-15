# Autonomous Work Plan - Vete Refactoring

**Purpose**: Complete decision-making guide for autonomous work without user intervention  
**Created**: January 15, 2026  
**Status**: ACTIVE - Work independently on all pending todos  

---

## 🎯 Mission Statement

**You are authorized to work autonomously on all pending todos without asking for permission or clarification.**

Work through the todo list sequentially by priority, make decisions based on patterns in the codebase, and only stop if you encounter something truly unprecedented or dangerous.

---

## 📋 Work Execution Rules

### ✅ ALWAYS Do (No Permission Needed)

1. **Start the next high-priority todo** from the list
2. **Create branches** using naming convention: `phase{N}/{type}/{brief-description}`
   - Examples: `phase0/test/e2e-appointment-booking`, `phase1/service/base-service`, `quickwin/perf/database-indexes`
3. **Write code** following patterns from existing codebase
4. **Add tests** with 95%+ coverage for services, 85%+ for components
5. **Run linting** and fix all errors before completing todo
6. **Run tests** and ensure all pass (existing + new)
7. **Create detailed commit messages** explaining what and why
8. **Mark todo as completed** when all acceptance criteria met
9. **Move to next todo** immediately
10. **Track progress** by updating todo status

### ❌ NEVER Do (STOP and Document Instead)

1. **Never delete production data** or make irreversible database changes
2. **Never modify authentication/authorization** logic without explicit review
3. **Never change payment processing** code
4. **Never remove security features**
5. **Never upgrade Tailwind CSS** to v4 (breaks build)
6. **Never disable tests** to make them "pass"
7. **Never commit secrets** or credentials
8. **Never skip RLS** (Row Level Security) on new database tables

### ⚠️ STOP and Ask (Rare Cases)

Only stop if you encounter:

1. **Contradiction in requirements** that cannot be resolved by code inspection
2. **Security vulnerability** that you're unsure how to fix safely
3. **Breaking change** that would affect external integrations
4. **Architectural decision** not covered in existing patterns (e.g., new external service)
5. **Data migration** affecting > 1000 records

For everything else: **Make the decision and proceed.**

---

## 🔄 Work Flow

### Daily Cycle

```
1. Review todo list
   ↓
2. Pick next high-priority pending todo
   ↓
3. Create feature branch
   ↓
4. Implement changes following patterns
   ↓
5. Add/update tests
   ↓
6. Run validation (lint + tests + diagnostics)
   ↓
7. Commit with detailed message
   ↓
8. Mark todo completed
   ↓
9. Move to next todo
   ↓
10. Repeat until no high-priority todos remain
```

### Weekly Cycle

**Every 10-15 completed todos** (or weekly):

1. Run `./scripts/track-metrics.sh`
2. Review progress report
3. Adjust estimates if needed
4. Continue with next batch

---

## 📁 File Structure & Patterns

### Service Layer Pattern (Phase 1)

**Location**: `web/lib/services/`

**Base Service** (`lib/services/base.service.ts`):
```typescript
import { SupabaseClient } from '@supabase/supabase-js';

export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError };

export type ServiceError = {
  code: string;
  message: string;
  details?: unknown;
};

export abstract class BaseService {
  constructor(protected supabase: SupabaseClient) {}
  
  protected async withTransaction<T>(
    fn: (client: SupabaseClient) => Promise<T>
  ): Promise<ServiceResult<T>> {
    try {
      const result = await fn(this.supabase);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }
  
  protected async validateTenant(
    resourceId: string,
    tenantId: string
  ): Promise<void> {
    // Query to check resource belongs to tenant
    // Throw error if not
  }
  
  protected handleError(error: unknown): ServiceError {
    if (error instanceof Error) {
      return {
        code: 'INTERNAL_ERROR',
        message: error.message,
        details: error,
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
    };
  }
}
```

**Domain Service** (example: `lib/services/appointment.service.ts`):
```typescript
import { BaseService, ServiceResult } from './base.service';
import { SupabaseClient } from '@supabase/supabase-js';

export class AppointmentService extends BaseService {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }
  
  async create(
    data: CreateAppointmentDTO,
    userId: string,
    tenantId: string
  ): Promise<ServiceResult<Appointment>> {
    return this.withTransaction(async (client) => {
      // 1. Validate tenant access
      await this.validateTenant(data.petId, tenantId);
      
      // 2. Check for overlapping appointments
      const overlap = await this.checkOverlap(data.startTime, data.endTime, tenantId);
      if (overlap) {
        throw new Error('Appointment time slot is not available');
      }
      
      // 3. Create appointment
      const { data: appointment, error } = await client
        .from('appointments')
        .insert({
          ...data,
          tenant_id: tenantId,
          created_by: userId,
        })
        .select()
        .single();
        
      if (error) throw error;
      return appointment;
    });
  }
  
  async getById(
    id: string,
    tenantId: string
  ): Promise<ServiceResult<Appointment>> {
    return this.withTransaction(async (client) => {
      await this.validateTenant(id, tenantId);
      
      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();
        
      if (error) throw error;
      return data;
    });
  }
  
  // ... other methods
}
```

**Service Test** (`lib/services/__tests__/appointment.service.test.ts`):
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { AppointmentService } from '../appointment.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  
  beforeEach(() => {
    const supabase = createClient();
    service = new AppointmentService(supabase);
  });
  
  describe('create', () => {
    it('should create appointment successfully', async () => {
      const result = await service.create(
        {
          petId: 'pet-123',
          startTime: '2026-01-20T10:00:00Z',
          endTime: '2026-01-20T10:30:00Z',
          serviceId: 'service-456',
        },
        'user-789',
        'tenant-001'
      );
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('id');
        expect(result.data.tenant_id).toBe('tenant-001');
      }
    });
    
    it('should reject overlapping appointments', async () => {
      // Test overlap detection
    });
    
    it('should validate tenant access', async () => {
      // Test tenant validation
    });
  });
  
  // ... more tests
});
```

### Refactored API Route Pattern

**Before** (original route):
```typescript
// app/api/appointments/route.ts - BEFORE (150+ lines)
export async function GET(request: Request) {
  const supabase = await createClient();
  
  // Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Get tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();
    
  // Parse query params
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const status = url.searchParams.get('status');
  
  // Build query with complex filtering
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('tenant_id', profile.tenant_id);
    
  if (startDate) query = query.gte('start_time', startDate);
  if (endDate) query = query.lte('start_time', endDate);
  if (status) query = query.eq('status', status);
  
  const { data, error } = await query;
  
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  
  return Response.json(data);
}
```

**After** (using service):
```typescript
// app/api/appointments/route.ts - AFTER (<50 lines)
import { createClient } from '@/lib/supabase/server';
import { AppointmentService } from '@/lib/services/appointment.service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const service = new AppointmentService(supabase);
  
  // Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  // Get tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();
    
  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }
  
  // Parse filters
  const url = new URL(request.url);
  const filters = {
    startDate: url.searchParams.get('startDate'),
    endDate: url.searchParams.get('endDate'),
    status: url.searchParams.get('status'),
  };
  
  // Use service
  const result = await service.list(filters, profile.tenant_id);
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(result.data);
}
```

---

### Component Extraction Pattern (Phase 2)

**Original God Component** (`components/calendar/event-detail-modal.tsx` - 738 lines):
```typescript
// BEFORE - Everything in one file
export function EventDetailModal({ eventId, isOpen, onClose }) {
  // 100+ lines of state
  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState([]);
  // ... many more states
  
  // 200+ lines of handlers
  const handleSave = async () => { /* ... */ };
  const handleDelete = async () => { /* ... */ };
  const handleAddComment = async () => { /* ... */ };
  // ... many more handlers
  
  // 400+ lines of JSX
  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Massive JSX with event details, form, actions, comments */}
    </Dialog>
  );
}
```

**After Extraction** (5 files @ ~150 lines each):

**Main Component** (`components/calendar/event-detail-modal/index.tsx` - 150 lines):
```typescript
import { EventDetailsView } from './EventDetailsView';
import { EventActionsPanel } from './EventActionsPanel';
import { EventFormFields } from './EventFormFields';
import { EventComments } from './EventComments';

export function EventDetailModal({ eventId, isOpen, onClose }) {
  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Shared state and handlers
  const handleSave = async (data) => {
    // Save logic
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose}>
      {isEditing ? (
        <EventFormFields
          event={event}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <EventDetailsView event={event} />
          <EventActionsPanel 
            event={event}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
          />
          <EventComments eventId={eventId} />
        </>
      )}
    </Dialog>
  );
}
```

**Sub-Components** (each in separate file):
- `EventDetailsView.tsx` (~150 lines) - Display event info
- `EventActionsPanel.tsx` (~120 lines) - Action buttons
- `EventFormFields.tsx` (~180 lines) - Edit form
- `EventComments.tsx` (~100 lines) - Comments section

---

### Testing Patterns

**Service Test Coverage Requirements**: 95%+

Test structure:
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle success case', () => {});
    it('should handle validation errors', () => {});
    it('should handle database errors', () => {});
    it('should validate tenant access', () => {});
    it('should handle edge case X', () => {});
  });
});
```

**Component Test Coverage Requirements**: 85%+

Test structure:
```typescript
describe('ComponentName', () => {
  it('should render successfully', () => {});
  it('should handle user interactions', () => {});
  it('should display data correctly', () => {});
  it('should handle loading state', () => {});
  it('should handle error state', () => {});
});
```

**E2E Test Pattern**:
```typescript
// tests/e2e/critical-flows/appointment-booking.spec.ts
import { test, expect } from '@playwright/test';

test('complete appointment booking flow', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:3000/adris/portal');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 2. Navigate to booking
  await page.click('text=Reservar Cita');
  
  // 3. Select service
  await page.click('text=Consulta General');
  
  // 4. Select pet
  await page.click('text=Mi Mascota');
  
  // 5. Submit booking
  await page.click('text=Confirmar');
  
  // 6. Verify success
  await expect(page.locator('text=Solicitud enviada')).toBeVisible();
});
```

---

## 🧪 Quality Gates

### Before Marking Todo Complete

**Checklist** (ALL must pass):

- [ ] Code written and follows existing patterns
- [ ] Tests added with required coverage (95% services, 85% components)
- [ ] All tests passing: `npm run test`
- [ ] Linting clean: `npm run lint`
- [ ] TypeScript errors: `npx tsc --noEmit` (zero errors)
- [ ] No console.log or debugger statements
- [ ] No commented-out code (except with TODO explaining why)
- [ ] Commit message is descriptive

### Service Layer Quality Gates

- [ ] Extends BaseService
- [ ] All methods return ServiceResult<T>
- [ ] Tenant validation on all operations
- [ ] Transaction management for multi-step operations
- [ ] Error handling using handleError()
- [ ] 95%+ test coverage
- [ ] Documentation with usage examples

### Component Quality Gates

- [ ] < 200 lines (ideally < 150)
- [ ] Single responsibility
- [ ] Props interface defined
- [ ] TypeScript types for all props
- [ ] No inline styles (Tailwind only)
- [ ] Theme variables for colors
- [ ] Responsive design
- [ ] 85%+ test coverage

### API Route Quality Gates (After Refactoring)

- [ ] < 100 lines (ideally < 50)
- [ ] Uses service layer (no business logic in route)
- [ ] Auth check first
- [ ] Tenant validation
- [ ] Standardized error responses
- [ ] Spanish error messages

---

## 🔀 Git Workflow

### Branch Naming

```
Format: {phase}/{type}/{description}

Examples:
- phase0/test/e2e-appointment-booking
- phase1/service/appointment-service
- phase1/refactor/appointments-route
- phase2/component/event-detail-modal
- quickwin/perf/database-indexes
- quickwin/deps/remove-formik
```

### Commit Message Format

```
Format: {type}({scope}): {description}

Types:
- feat: New feature
- refactor: Code restructuring
- test: Adding tests
- perf: Performance improvement
- docs: Documentation
- chore: Maintenance

Examples:
- feat(services): add BaseService with transaction management
- refactor(appointments): extract logic to AppointmentService
- test(services): add comprehensive AppointmentService tests
- perf(database): add indexes to appointments and invoices
- docs(refactoring): document service layer patterns
- chore(deps): remove unused formik dependency
```

**Commit Message Body** (detailed explanation):
```
refactor(appointments): extract logic to AppointmentService

- Moved all appointment business logic from routes to service
- Implemented create, getById, update, delete, list methods
- Added transaction management for complex operations
- Reduced /api/appointments route from 180 to 45 lines
- Added 95% test coverage

Refs: #1.2 (Phase 1 - AppointmentService)
```

### When to Commit

**Commit frequently** (every 1-2 hours of work or at logical checkpoints):

1. After completing a logical unit (e.g., one method in service)
2. After adding tests for that unit
3. After refactoring one route
4. Before switching to a different part of the work

**Atomic commits** preferred over large batches.

---

## 🚨 Error Handling & Debugging

### If Tests Fail

1. **Read error message carefully**
2. **Fix the issue** (don't disable the test)
3. **Verify fix** by running tests again
4. **If stuck after 30 min**: Document the issue and move to next todo, come back later

### If Linting Fails

1. **Auto-fix first**: `npm run lint -- --fix`
2. **Review remaining errors** and fix manually
3. **Never disable rules** to make errors go away

### If TypeScript Errors

1. **Fix type errors properly** (no `any`, no `@ts-ignore`)
2. **Use proper types** from existing codebase
3. **If type doesn't exist**: Create it in `lib/types/`

### If Build Fails

1. **Read build error carefully**
2. **Check recent changes** (what did you modify?)
3. **Revert if necessary** and try again
4. **Never proceed with broken build**

---

## 📊 Progress Tracking

### Update Todo Status

As you work:

1. **Mark todo as in_progress** when starting
2. **Mark todo as completed** when all quality gates pass
3. **Never mark multiple todos in_progress** (focus on one at a time)

### Run Metrics (Weekly)

**Every Friday or after 10-15 completed todos**:

```bash
./scripts/track-metrics.sh
```

Review the progress report:
- Is average route size decreasing?
- Are god components reducing?
- Are tests increasing?
- Any regressions?

**Adjust course** if metrics aren't improving.

---

## 🎯 Decision Making Guide

### When You Need to Make a Choice

**Ask yourself**:

1. **What does existing code do?** (Look for similar patterns)
2. **What would improve quality?** (Smaller, simpler, testable)
3. **What's safest for production?** (Least risky approach)
4. **What's documented?** (Check CLAUDE.md, exemplars, docs)

**Example Decisions You Can Make**:

**Q**: Should I use `date-fns` or `dayjs` for date formatting?  
**A**: Use `date-fns` (it's the standard in the project, per QW#5.1)

**Q**: Where should I put this new utility function?  
**A**: `lib/utils/` if general, `lib/services/` if service-specific

**Q**: How should I name this component?  
**A**: PascalCase, descriptive (e.g., `AppointmentListItem.tsx`)

**Q**: Should I extract this as a separate component?  
**A**: If it's >50 lines or used in multiple places, yes

**Q**: Should I add an index on this column?  
**A**: If it's used in WHERE clauses frequently, yes

**Q**: Should I refactor this route even though tests are failing?  
**A**: No, fix tests first, then refactor

---

## 🗺️ Work Priority Order

### Phase 0 (Finish This Week)

**Priority 1** (Do First):
1. Quick Win #1 (Database indexes) - IMMEDIATE VALUE
2. E2E tests (all 4 critical flows)
3. API contract tests (all 4 endpoint groups)

**Priority 2** (If Time):
4. Performance baselines
5. Other Quick Wins (formik, chart.js, axios removal)

### Phase 1 (Weeks 2-5)

**MUST DO IN ORDER**:
1. BaseService (BLOCKS everything else)
2. BaseService tests
3. BaseService documentation
4. AppointmentService (largest domain)
5. AppointmentService tests
6. Refactor appointment routes (one by one)
7. InvoiceService
8. InvoiceService tests
9. Refactor invoice routes
10. InventoryService
11. InventoryService tests
12. Refactor inventory routes
13. Continue with remaining services...

### Phase 2 (Weeks 6-9)

**Priority order**:
1. event-detail-modal.tsx (738 lines - worst offender)
2. CalendarStyles.tsx (731 lines - theme extraction)
3. multi-mode-scanner.tsx (662 lines - mode separation)
4. analytics-pdf.tsx (646 lines - template system)
5. calendar-container.tsx (625 lines - state extraction)
6. Continue with remaining god components...

---

## 📝 Documentation Standards

### When Creating Services

**Add to service file** (JSDoc):
```typescript
/**
 * AppointmentService - Manages appointment lifecycle
 * 
 * @example
 * const service = new AppointmentService(supabase);
 * const result = await service.create(data, userId, tenantId);
 * if (result.success) {
 *   console.log('Created:', result.data);
 * }
 */
export class AppointmentService extends BaseService {
  /**
   * Create a new appointment with overlap detection
   * 
   * @param data - Appointment data (pet, service, times)
   * @param userId - User creating the appointment
   * @param tenantId - Clinic tenant ID
   * @returns Service result with created appointment
   */
  async create(/* ... */) { }
}
```

### When Extracting Components

**Add to component file**:
```typescript
/**
 * EventDetailsView - Displays appointment event details
 * 
 * Shows event information in read-only mode including:
 * - Appointment date/time
 * - Pet and owner details
 * - Service information
 * - Status and notes
 * 
 * @param event - Appointment event data
 */
export function EventDetailsView({ event }: EventDetailsViewProps) {
  // ...
}
```

### Update CLAUDE.md (After Major Changes)

When you complete Phase 1 or Phase 2, update CLAUDE.md:

**Add section**:
```markdown
## Service Layer Architecture (Added Jan 2026)

All business logic is extracted into services in `lib/services/`.

### Pattern
- Extend `BaseService`
- Return `ServiceResult<T>`
- Use `withTransaction` for multi-step ops
- Validate tenant access
- 95%+ test coverage

### Available Services
- `AppointmentService` - Appointment lifecycle
- `InvoiceService` - Billing and payments
- `InventoryService` - Stock management
- ... (list all services)

### Usage in API Routes
See `app/api/appointments/route.ts` for example.
```

---

## 🛡️ Safety Checks

### Before Making Destructive Changes

**ASK**: Does this affect:
- [ ] User authentication?
- [ ] Payment processing?
- [ ] Data deletion?
- [ ] External APIs?
- [ ] Security features (RLS, encryption, etc.)?

**If YES to ANY**: Document the change and stop. Get user approval.

**If NO to ALL**: Proceed with confidence.

### Before Database Changes

**Migrations MUST**:
- [ ] Be reversible (have DOWN migration)
- [ ] Preserve existing data
- [ ] Include RLS policies if new table
- [ ] Be tested in dev environment first

**Never**:
- ❌ Drop tables with data
- ❌ Remove RLS from existing tables
- ❌ Change column types without data migration
- ❌ Remove indexes without verification

---

## 🎉 Celebration Milestones

### Mark These Achievements

**When you complete**:
- ✅ First Quick Win (Database indexes) - IMMEDIATE ROI
- ✅ All E2E tests (Phase 0.3 complete)
- ✅ BaseService (Foundation laid)
- ✅ First full service (AppointmentService complete)
- ✅ First god component broken up (event-detail-modal)
- ✅ Phase 0 complete (Safety nets in place)
- ✅ Phase 1 complete (Service layer done)
- ✅ Phase 2 complete (Components refactored)

**Document achievement** in metrics:
```bash
echo "Achievement: [Milestone name]" >> metrics/achievements.txt
echo "Date: $(date)" >> metrics/achievements.txt
echo "Impact: [What improved]" >> metrics/achievements.txt
```

---

## 🔄 Continuous Improvement

### After Each Phase

1. **Run metrics**: `./scripts/track-metrics.sh`
2. **Review what worked** (document in `metrics/learnings.md`)
3. **Adjust estimates** for next phase if needed
4. **Update CLAUDE.md** with new patterns

### If Velocity Slows

**Common causes**:
1. Underestimated complexity → Increase estimates
2. Too many blockers → Work on unblocked todos first
3. Tests taking too long → Improve test utilities
4. Too much context switching → Focus on one domain at a time

**Adjust** and continue.

---

## 📞 Escalation (Rare)

### When to Stop and Ask User

**ONLY in these cases**:

1. **Security vulnerability discovered** that you're not sure how to fix
2. **Breaking API change** required that affects external clients
3. **Data migration** affecting >1000 production records
4. **Architectural decision** not covered by existing patterns (e.g., should we use Redis for caching?)
5. **Budget concern** (e.g., new paid service needed)

**For everything else**: Make the best decision based on codebase patterns and proceed.

---

## 🚀 Starting Checklist

**Before you begin autonomous work**:

- [x] Todo list created with 68+ items
- [x] AUTONOMOUS_WORK_PLAN.md created (this document)
- [x] Baseline metrics established
- [x] Scripts ready (analyze-complexity.sh, track-metrics.sh)
- [ ] First Quick Win identified (Database indexes)
- [ ] Git configured (user.name, user.email)
- [ ] Development environment ready (npm install, tests passing)

**You are now cleared for autonomous work.**

---

## 📋 Current Todo List Summary

**Total Todos**: 68

**High Priority** (Do First):
- Setup: 1 item (this doc)
- Quick Wins: 10 items (~12 hours)
- Phase 0 Safety Nets: 10 items (~13 hours)
- Phase 1 Services: 30 items (~100 hours)

**Medium Priority** (After High):
- Phase 2 Components: 12 items (~25 hours)
- Tracking: 3 items (~2 hours)

**Estimated Total**: ~152 hours of high/medium priority work

**At 40 hours/week**: ~4 weeks to complete high-priority todos

---

## 🎯 Your Mission

**Work through the todo list autonomously:**

1. Start with `qw-1` (Database indexes) - IMMEDIATE VALUE
2. Continue with Phase 0 E2E tests
3. Move to Phase 1 (BaseService → AppointmentService → ...)
4. Track progress weekly
5. Mark todos complete as you go
6. Only stop if you hit rare escalation cases

**You have full authority to:**
- Make code decisions
- Create branches
- Write code and tests
- Commit changes
- Mark todos complete
- Move to next todo

**Work continuously until all high-priority todos are complete.**

---

**Good luck! Start with `qw-1` (Database indexes). 🚀**

_Last Updated: January 15, 2026_
