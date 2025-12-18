# API Overview

Vete provides both REST API endpoints and Server Actions for data operations.

## API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT                                     │
│  ┌─────────────────┐      ┌─────────────────┐                   │
│  │  Server         │      │  Client         │                   │
│  │  Components     │      │  Components     │                   │
│  └────────┬────────┘      └────────┬────────┘                   │
│           │                        │                             │
│           │ Direct                 │ fetch()                     │
│           ▼                        ▼                             │
│  ┌─────────────────┐      ┌─────────────────┐                   │
│  │  Server         │      │  REST API       │                   │
│  │  Actions        │      │  Routes         │                   │
│  │  /actions/*.ts  │      │  /api/*         │                   │
│  └────────┬────────┘      └────────┬────────┘                   │
└───────────┼────────────────────────┼────────────────────────────┘
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                               │
│           (RLS automatically filters by tenant)                  │
└─────────────────────────────────────────────────────────────────┘
```

## REST API Endpoints

### Pets & Medical

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pets` | List pets |
| POST | `/api/pets` | Create pet |
| GET | `/api/pets/[id]` | Get pet details |
| GET | `/api/pets/[id]/qr` | Generate QR code |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/booking` | List appointments |
| POST | `/api/booking` | Create appointment |

### Clinical

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diagnosis_codes` | Search diagnosis codes |
| GET | `/api/drug_dosages` | Get drug dosages |
| GET | `/api/growth_charts` | Get growth data |
| GET | `/api/growth_standards` | Get growth standards |
| GET | `/api/prescriptions` | List prescriptions |
| POST | `/api/prescriptions` | Create prescription |
| GET/POST | `/api/vaccine_reactions` | Vaccine reactions |
| GET/POST | `/api/reproductive_cycles` | Reproductive cycles |
| GET/POST | `/api/euthanasia_assessments` | QoL assessments |

### Invoicing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/[id]` | Get invoice details |
| POST | `/api/invoices/[id]/payments` | Record payment |
| POST | `/api/invoices/[id]/send` | Send invoice |
| POST | `/api/invoices/[id]/refund` | Process refund |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/stats` | Inventory statistics |
| GET | `/api/inventory/alerts` | Low stock alerts |
| POST | `/api/inventory/import` | Bulk import |
| GET | `/api/inventory/export` | Export inventory |

### Finance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance/expenses` | List expenses |
| POST | `/api/finance/expenses` | Create expense |
| GET | `/api/finance/pl` | Profit/Loss report |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List services |
| GET/POST | `/api/loyalty_points` | Loyalty points |
| GET | `/api/store/products` | Store products |
| GET | `/api/epidemiology/heatmap` | Disease heatmap |
| GET/POST | `/api/conversations` | Messaging |
| GET | `/api/conversations/[id]` | Conversation details |

---

## Server Actions

Server Actions are used for mutations from Server Components.

### Location: `/app/actions/`

| File | Actions |
|------|---------|
| `create-pet.ts` | Create new pet |
| `create-appointment.ts` | Create appointment |
| `update-appointment.ts` | Update appointment status |
| `create-vaccine.ts` | Add vaccine record |
| `create-medical-record.ts` | Add medical record |
| `create-product.ts` | Add product |
| `update-profile.ts` | Update user profile |
| `assign-tag.ts` | Assign QR tag to pet |
| `invite-staff.ts` | Invite staff member |
| `medical-records.ts` | Medical record operations |
| `network-actions.ts` | Network-related actions |
| `safety.ts` | Safety-related actions |
| `send-email.ts` | Email sending |

### Example Usage

```typescript
// In a Server Component or form action
import { createPet } from '@/app/actions/create-pet';

export default function NewPetForm() {
  return (
    <form action={createPet}>
      <input name="name" required />
      <input name="species" required />
      <button type="submit">Create Pet</button>
    </form>
  );
}
```

---

## Authentication

All API requests require authentication via Supabase:

### Cookie-based (Browser)

```typescript
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User is authenticated, RLS handles tenant isolation
  const { data } = await supabase.from('pets').select('*');
  return Response.json(data);
}
```

### Service Role (Server-to-Server)

For administrative operations, use service role client:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

Currently handled by Supabase defaults. No custom rate limiting implemented.

---

## API Best Practices

### DO

- Use Server Actions for form submissions
- Use REST API for client-side data fetching
- Let RLS handle tenant isolation
- Return appropriate HTTP status codes

### DON'T

- Bypass RLS with service role unless necessary
- Expose sensitive data in responses
- Make synchronous calls for heavy operations
- Trust client-provided tenant_id

---

## Related Documentation

- [Endpoints Reference](endpoints/)
- [Server Actions](server-actions.md)
- [Authentication](authentication.md)
- [Database Schema](../database/overview.md)
