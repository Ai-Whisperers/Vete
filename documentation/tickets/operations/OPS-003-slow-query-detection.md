# OPS-003: Slow Query Detection & Alerts

## Priority: P2
## Category: Operations
## Status: Not Started
## Epic: [EPIC-11: Operations & Observability](../epics/EPIC-11-operations.md)

## Description
Implement automatic detection of slow database queries and alert when queries exceed acceptable thresholds.

## Current State
- No slow query logging
- Performance issues discovered reactively
- No visibility into database bottlenecks

## Proposed Solution
Enable PostgreSQL slow query logging via Supabase and create alerting integration.

### Supabase Configuration
```sql
-- Enable slow query logging (requires Supabase dashboard or support)
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries > 100ms
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

### Query Wrapper with Timing
```typescript
// lib/supabase/instrumented-client.ts
import { createClient } from '@supabase/supabase-js';

export function createInstrumentedClient() {
  const client = createClient(url, key);

  const originalFrom = client.from.bind(client);
  client.from = (table: string) => {
    const start = performance.now();
    const builder = originalFrom(table);

    // Wrap execute methods
    const originalSelect = builder.select.bind(builder);
    builder.select = (...args) => {
      const promise = originalSelect(...args);
      return promise.then(result => {
        const duration = performance.now() - start;
        if (duration > 100) {
          console.warn(`Slow query on ${table}: ${duration}ms`);
          // Send to monitoring service
        }
        return result;
      });
    };

    return builder;
  };

  return client;
}
```

### Alerting Integration
```typescript
// lib/monitoring/slow-query-alert.ts
export async function alertSlowQuery(query: string, duration: number) {
  if (duration > 500) {
    await sendAlert({
      severity: 'high',
      title: 'Critical slow query detected',
      message: `Query took ${duration}ms`,
      query: query.substring(0, 500),
    });
  }
}
```

## Implementation Steps
1. Enable Supabase slow query logging
2. Create query instrumentation wrapper
3. Set up alerting thresholds (100ms warning, 500ms critical)
4. Create Slack/email alert integration
5. Build slow query dashboard view
6. Add query optimization suggestions

## Acceptance Criteria
- [ ] Queries > 100ms logged
- [ ] Queries > 500ms trigger alerts
- [ ] Alert includes query text and table
- [ ] Weekly slow query report
- [ ] Dashboard shows slow query trends

## Related Files
- `lib/supabase/*.ts` - Database clients
- `lib/monitoring/alerts.ts` - Alert system

## Estimated Effort
- 5 hours
  - Supabase configuration: 1h
  - Instrumentation: 2h
  - Alerting: 2h
