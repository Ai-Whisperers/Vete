# Service Refactoring Plan

## Overview

This document outlines the plan for refactoring oversized services (>900 lines) and migrating to the domain layer pattern.

**Target Architecture:** Domain-Driven Design with repositories + services

```
lib/domain/{entity}/
├── repository.ts    # Data access layer
├── service.ts       # Business logic
├── types.ts         # Entity types
├── queries.ts       # Complex queries (optional)
└── index.ts         # Barrel export
```

---

## Phase 1: Invoice Service Split (1,109 lines)

### Current: `lib/services/invoice-service.ts`

**Method Groups:**
| Group | Methods | New Location |
|-------|---------|--------------|
| CRUD | list, getById, create, update, delete | domain/invoices/repository.ts |
| Payments | recordPayment, getPayments, refundPayment, markAsPaid | domain/payments/service.ts |
| Status | sendInvoice, voidInvoice | domain/invoices/service.ts |
| Reporting | getOverdueInvoices, getRevenueSummary | domain/invoices/reporting.ts |

### Migration Steps:

1. Create `lib/domain/invoices/` structure
2. Move types to `domain/invoices/types.ts`
3. Create repository with CRUD operations
4. Create service for business logic
5. Extract PaymentService to `domain/payments/`
6. Update imports across codebase
7. Deprecate original service

---

## Phase 2: Lab Service Split (1,076 lines)

### Current: `lib/services/lab-service.ts`

**Suggested Split:**
| Domain | Functionality |
|--------|--------------|
| domain/lab-orders/ | Order creation, status updates |
| domain/lab-results/ | Result entry, file uploads |
| domain/lab-comments/ | Result annotations |

### Migration Steps:

1. Create `lib/domain/lab-orders/` structure
2. Extract order management
3. Create `lib/domain/lab-results/` for results
4. Move shared types to `lib/types/lab.ts`

---

## Phase 3: Hospitalization Service Split (1,060 lines)

### Current: `lib/services/hospitalization-service.ts`

**Suggested Split:**
| Domain | Functionality |
|--------|--------------|
| domain/hospitalizations/ | Admission, discharge, transfers |
| domain/vitals/ | Vital signs recording |
| domain/treatments/ | Medication, procedures |
| domain/feeding/ | Feeding schedules |

---

## Phase 4: Safety Service Split (1,009 lines)

### Current: `lib/services/safety-service.ts`

**Suggested Split:**
| Domain | Functionality |
|--------|--------------|
| domain/lost-pets/ | Lost/found reports |
| domain/disease-alerts/ | Disease tracking, outbreaks |

---

## Domain Layer Migration Pattern

### Template: `lib/domain/{entity}/repository.ts`

```typescript
import { BaseService } from '@/lib/services/base-service'
import type { ServiceResult } from '@/lib/services/base-service'
import type { {Entity}, Create{Entity}Input, Update{Entity}Input } from './types'

export class {Entity}Repository extends BaseService {
  private readonly TABLE = '{table_name}'

  async findAll(tenantId: string): Promise<ServiceResult<{Entity}[]>> {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from(this.TABLE)
        .select('*')
        .eq('tenant_id', tenantId)
      if (error) throw error
      return data
    }, 'Error al listar {entities}')
  }

  async findById(id: string, tenantId: string): Promise<ServiceResult<{Entity} | null>> {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from(this.TABLE)
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    }, 'Error al obtener {entity}')
  }

  async create(input: Create{Entity}Input): Promise<ServiceResult<{Entity}>> {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from(this.TABLE)
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    }, 'Error al crear {entity}')
  }

  async update(id: string, tenantId: string, input: Update{Entity}Input): Promise<ServiceResult<{Entity}>> {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from(this.TABLE)
        .update(input)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single()
      if (error) throw error
      return data
    }, 'Error al actualizar {entity}')
  }

  async delete(id: string, tenantId: string): Promise<ServiceResult<void>> {
    return this.handleError(async () => {
      const { error } = await this.supabase
        .from(this.TABLE)
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)
      if (error) throw error
    }, 'Error al eliminar {entity}')
  }
}
```

### Template: `lib/domain/{entity}/service.ts`

```typescript
import { {Entity}Repository } from './repository'
import type { ServiceResult } from '@/lib/services/base-service'
import type { {Entity} } from './types'

export class {Entity}Service {
  constructor(private readonly repository: {Entity}Repository) {}

  // Business logic methods go here
  // They use the repository for data access
}
```

---

## Existing Domain Implementations

Reference these for patterns:

- `lib/domain/appointments/` - Full implementation with repository + service
- `lib/domain/pets/` - Full implementation with repository + service

---

## Priority Order

1. **High Impact:** InvoiceService → most complex, many dependencies
2. **Medium Impact:** HospitalizationService → complex workflows
3. **Lower Impact:** LabService, SafetyService → fewer dependencies

---

## Testing Strategy

For each domain migration:

1. Keep original service working during migration
2. Create parallel tests for new domain layer
3. Use feature flag or gradual rollout
4. Remove old service only when confident

---

## Estimated Effort

| Service                | Lines | Domains | Est. Hours |
| ---------------------- | ----- | ------- | ---------- |
| InvoiceService         | 1,109 | 2-3     | 8-12       |
| LabService             | 1,076 | 2-3     | 6-8        |
| HospitalizationService | 1,060 | 3-4     | 8-10       |
| SafetyService          | 1,009 | 2       | 4-6        |

**Total:** ~30-40 hours of careful refactoring

---

## Quick Wins (No Migration Required)

1. ✅ Split test utilities (mock-presets.ts, fixtures/index.ts)
2. ✅ Split OpenAPI paths by domain
3. ✅ Delete dead code

---

_Last Updated: January 2026_
