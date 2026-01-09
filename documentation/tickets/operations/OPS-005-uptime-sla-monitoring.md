# OPS-005: Uptime SLA Monitoring

## Priority: P2
## Category: Operations
## Status: In Progress (Code Complete)
## Epic: [EPIC-11: Operations & Observability](../epics/EPIC-11-operations.md)

## Description
Implement uptime monitoring with SLA tracking to ensure service availability meets commitments.

## Current State
- No formal uptime monitoring
- No SLA tracking
- Outages discovered by users
- No status page for customers

## Proposed Solution
Set up external uptime monitoring with status page and SLA calculations.

### Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkSupabaseAuth(),
  ]);

  const allHealthy = checks.every(c => c.healthy);

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: checks,
    version: process.env.APP_VERSION,
  }, {
    status: allHealthy ? 200 : 503,
  });
}

async function checkDatabase() {
  try {
    const start = Date.now();
    await supabase.from('tenants').select('id').limit(1);
    return { name: 'database', healthy: true, latency: Date.now() - start };
  } catch {
    return { name: 'database', healthy: false, latency: 0 };
  }
}
```

### SLA Calculation
```typescript
// lib/monitoring/sla.ts
interface SLAMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  totalMinutes: number;
  downtimeMinutes: number;
  uptimePercentage: number;
  slaTarget: number;
  slaStatus: 'met' | 'breached';
}

export function calculateSLA(incidents: Incident[], period: string): SLAMetrics {
  const totalMinutes = getPeriodMinutes(period);
  const downtimeMinutes = incidents.reduce((sum, i) => sum + i.durationMinutes, 0);
  const uptimePercentage = ((totalMinutes - downtimeMinutes) / totalMinutes) * 100;

  return {
    period,
    totalMinutes,
    downtimeMinutes,
    uptimePercentage,
    slaTarget: 99.9,
    slaStatus: uptimePercentage >= 99.9 ? 'met' : 'breached',
  };
}
```

### Status Page Integration
- Use Betterstack, Instatus, or Statuspage.io
- Automatic incident creation on downtime
- Subscriber notifications

## Implementation Steps
1. ~~Create comprehensive health check endpoint~~ ✅
2. Set up external monitoring (Betterstack recommended) - *Requires external service*
3. Configure health checks every 1 minute - *Requires external service*
4. Create public status page - *Requires external service*
5. ~~Implement SLA calculation utilities~~ ✅
6. Set up incident management workflow - *Requires external service*
7. Configure subscriber notifications - *Requires external service*

## Acceptance Criteria
- [x] Health endpoint checks all services (database, auth, environment)
- [ ] External monitoring every 1 minute - *Requires Betterstack/similar setup*
- [ ] Public status page available - *Requires Betterstack/similar setup*
- [x] SLA calculation utilities implemented (uptime %, MTTR, MTBF)
- [ ] Automatic incident creation - *Requires external service*
- [x] 99.9% uptime target tracked in SLA utilities

## Implementation Notes (January 2026)

### Completed Components

**Health Check Endpoint** (`app/api/health/route.ts`):
- Database connectivity check with latency measurement
- Supabase Auth service check
- Environment configuration validation
- Returns `healthy`, `degraded`, or `unhealthy` status
- HTTP 200 for healthy/degraded, 503 for unhealthy
- Response includes all checks with individual latencies

**SLA Calculation Utilities** (`lib/monitoring/sla.ts`):
- `calculateSLA()` - Main SLA metrics calculation
- `calculateDowntime()` - From incident records
- `calculateMTTR()` - Mean Time To Recovery
- `calculateMTBF()` - Mean Time Between Failures
- Period support: daily, weekly, monthly, quarterly, yearly
- SLA status: `met`, `at_risk`, `breached`
- Helper functions: `formatUptime()`, `formatDuration()`, `getAllowedDowntime()`

### Remaining (External Setup Required)
External monitoring service (Betterstack, UptimeRobot, etc.) needs to be configured to:
- Poll `/api/health` every 1 minute
- Create status page
- Set up incident management
- Configure subscriber notifications

## Related Files
- `app/api/health/route.ts` - Comprehensive health check endpoint
- `lib/monitoring/sla.ts` - SLA calculation utilities

## Estimated Effort
- 5 hours total
  - ~~Health endpoint: 1h~~ ✅
  - External monitoring setup: 2h (manual config)
  - Status page: 1h (manual config)
  - ~~SLA utilities: 1h~~ ✅
