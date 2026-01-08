# OPS-002: Performance Monitoring Dashboard

## Priority: P2
## Category: Operations
## Status: Not Started
## Epic: [EPIC-11: Operations & Observability](../epics/EPIC-11-operations.md)

## Description
Set up a comprehensive performance monitoring dashboard to track API response times, database query performance, and system health metrics.

## Current State
- Basic Sentry integration exists
- No centralized performance dashboard
- No historical performance data
- Cannot identify performance regressions

## Proposed Solution
Integrate with a monitoring service (Vercel Analytics, DataDog, or Grafana Cloud) to visualize performance metrics.

### Key Metrics to Track
```typescript
// lib/monitoring/metrics.ts
export interface PerformanceMetrics {
  // API Performance
  apiResponseTime: {
    p50: number;
    p95: number;
    p99: number;
  };

  // Database Performance
  dbQueryTime: {
    average: number;
    slowQueries: number; // > 100ms
  };

  // System Health
  errorRate: number;
  requestsPerSecond: number;
  activeConnections: number;
}
```

### Instrumentation
```typescript
// lib/monitoring/instrument.ts
import { trace } from '@opentelemetry/api';

export function instrumentRoute(handler: Function) {
  return async (req: Request) => {
    const span = trace.getActiveSpan();
    const start = performance.now();

    try {
      const result = await handler(req);
      span?.setAttribute('http.status_code', result.status);
      return result;
    } finally {
      const duration = performance.now() - start;
      span?.setAttribute('http.response_time', duration);
    }
  };
}
```

## Implementation Steps
1. Choose monitoring provider (Vercel Analytics recommended for Next.js)
2. Set up OpenTelemetry instrumentation
3. Add custom metrics collection
4. Create performance dashboard
5. Set up alerting thresholds
6. Document baseline metrics

## Acceptance Criteria
- [ ] Real-time API response time tracking
- [ ] Database query performance visibility
- [ ] Error rate tracking
- [ ] Historical data (30+ days)
- [ ] Alerting on performance degradation
- [ ] Dashboard accessible to admins

## Related Files
- `lib/monitoring/` - Existing monitoring code
- `app/api/**/*.ts` - Routes to instrument

## Estimated Effort
- 6 hours
  - Provider setup: 2h
  - Instrumentation: 2h
  - Dashboard configuration: 2h
